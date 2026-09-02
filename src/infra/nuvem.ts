// A nuvem: autenticação e leitura/escrita do estado no Supabase.
//
// Fala HTTP puro com a API REST. Não há SDK de propósito — a regra do projeto
// é não ter dependência de runtime, e o que o Supabase expõe já é REST comum:
// `/auth/v1` para entrar, `/rest/v1` para ler e gravar.
//
// A verdade continua sendo local. Este módulo é RÉPLICA: o app funciona
// inteiro sem rede, e sincronizar é uma coisa que acontece por cima, quando dá.
// Nada aqui pode fazer o app parar de gravar no aparelho.
//
// A chave abaixo é pública por design e vai no bundle. Quem protege os dados é
// o RLS do banco, que só devolve a linha do usuário autenticado — e o cadastro
// público está desligado no painel, então ela não abre porta para ninguém.

import { DB } from './db';

const URL_BASE = 'https://wetwqqrrgormwyktewlm.supabase.co';
const ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndldHdxcXJyZ29ybXd5a3Rld2xtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1OTQzMDIsImV4cCI6MjEwMzE3MDMwMn0.5Tdn3OW4khACuUvOdbcSWyK_UC3v8pm46mwB3MliAj0';

/**
 * A sessão é DO APARELHO: não entra no estado sincronizado, e por isso tem
 * chave própria.
 *
 * A chave já se chamou `treino-nuvem-v1`, de quando o produto se chamava
 * "Treino". Aqui NÃO cabe a fusão que a chave do histórico faz: não há o que
 * fundir entre dois pares de tokens, e o pior que uma escolha errada custa é
 * um login — o estado do aparelho continua sendo a verdade, e nada nesta
 * camada grava série. Então a regra é a mais simples que funciona: a chave
 * nova manda quando existe, a velha é promovida quando é a única, e some das
 * duas formas. A pergunta é "a velha existe?", nunca "já migrei?" — se o build
 * antigo rodar de novo entre duas aberturas, a migração roda de novo.
 *
 * O que não pode acontecer é deslogar em silêncio: renomear sem promover
 * apagaria a sessão sem dizer nada, e a lei 7 é persistência silenciosa, não
 * perda silenciosa.
 */
const CHAVE_SESSAO = 'lastro-nuvem-v1';
const CHAVE_SESSAO_LEGADO = 'treino-nuvem-v1';

export interface SessaoNuvem {
  token: string;
  refresh: string;
  /** instante em que o token expira */
  expira: number;
  uid: string;
  email: string;
}

/**
 * Por que resultado tipado em vez de exceção: o app precisa DISTINGUIR sem
 * rede de senha errada de conflito de versão. Só o primeiro é normal e
 * silencioso; os outros dois exigem coisas diferentes da tela.
 */
export type Falha = 'rede' | 'auth' | 'conflito' | 'servidor';
export type Resultado<T> = { ok: true; v: T } | { ok: false; erro: Falha; msg: string };

function falha(erro: Falha, msg: string): Resultado<never> { return { ok: false, erro: erro, msg: msg }; }

let sessao: SessaoNuvem | null = null;
let carregada = false;

async function leSessao(): Promise<SessaoNuvem | null> {
  if (carregada) return sessao;
  carregada = true;
  try {
    let r = await DB.get(CHAVE_SESSAO);
    const velho = await DB.get(CHAVE_SESSAO_LEGADO);
    if (velho && velho.value) {
      // Promove antes de apagar. Falhar no meio custa migrar de novo na
      // próxima abertura, nunca a sessão.
      if (!r || !r.value) { await DB.set(CHAVE_SESSAO, velho.value); r = velho; }
      await DB.delete(CHAVE_SESSAO_LEGADO);
    }
    if (r && r.value) sessao = JSON.parse(r.value);
  } catch (e) { sessao = null; }
  return sessao;
}

async function gravaSessao(s: SessaoNuvem | null): Promise<void> {
  sessao = s;
  carregada = true;
  if (s) await DB.set(CHAVE_SESSAO, JSON.stringify(s));
  // Sair apaga as duas: a velha pode ter sobrado de uma migração interrompida,
  // e sessão órfã com token vivo é pior do que uma chave a mais.
  else { await DB.delete(CHAVE_SESSAO); await DB.delete(CHAVE_SESSAO_LEGADO); }
}

function deTokens(j: Record<string, unknown>, emailPadrao: string): SessaoNuvem {
  const u = (j.user || {}) as { id?: string; email?: string };
  return {
    token: String(j.access_token || ''),
    refresh: String(j.refresh_token || ''),
    // 60 s de folga: token que expira no meio do voo vira 401 e um round-trip a mais
    expira: Date.now() + (Number(j.expires_in) || 3600) * 1000 - 60000,
    uid: String(u.id || ''),
    email: String(u.email || emailPadrao)
  };
}

async function chama(caminho: string, init: RequestInit): Promise<Response> {
  const h = Object.assign({ apikey: ANON, 'Content-Type': 'application/json' }, init.headers || {});
  return fetch(URL_BASE + caminho, Object.assign({}, init, { headers: h }));
}

/** Renova o token quando está perto de vencer. Falhou renovar = sessão morreu. */
async function token(): Promise<Resultado<SessaoNuvem>> {
  const s = await leSessao();
  if (!s) return falha('auth', 'sem sessão');
  if (Date.now() < s.expira) return { ok: true, v: s };

  let r: Response;
  try {
    r = await chama('/auth/v1/token?grant_type=refresh_token', {
      method: 'POST', body: JSON.stringify({ refresh_token: s.refresh })
    });
  } catch (e) { return falha('rede', 'sem conexão'); }

  if (!r.ok) { await gravaSessao(null); return falha('auth', 'a sessão expirou, entre de novo'); }
  const novo = deTokens(await r.json(), s.email);
  await gravaSessao(novo);
  return { ok: true, v: novo };
}

export interface LinhaDoEstado {
  v: number;
  data: unknown;
}

/**
 * O bucket das fotos de aparelho.
 *
 * Elas atravessam a rede como DADO, não como asset: a cópia que a tela usa é a
 * do Cache Storage do aparelho, e sem rede tudo continua desenhando. Isto aqui
 * é só o que leva a foto de um aparelho para o outro.
 */
const BUCKET = 'aparelhos';

/**
 * As fotos do corpo. Bucket SEPARADO do de aparelhos, e não uma pasta dentro
 * dele: são dois assuntos com sensibilidade diferente, e um bucket próprio é o
 * que permite apagar tudo de uma vez sem varrer nome de arquivo.
 */
const BUCKET_CORPO = 'corpo';

/**
 * O endereço de um objeto no Storage.
 *
 * O primeiro segmento é SEMPRE o uid — é sobre ele que a política RLS decide,
 * e é o que faz o nome do arquivo não precisar ser secreto.
 */
function endereco(uid: string, bucket: string, partes: string[]): string {
  return URL_BASE + '/storage/v1/object/' + bucket + '/' + encodeURIComponent(uid) + '/' +
         partes.map(encodeURIComponent).join('/');
}

/**
 * Os três verbos do Storage, parametrizados pelo bucket e pelo caminho.
 *
 * Existem separados das funções de foto de aparelho porque o corpo entrou
 * depois e precisava exatamente do mesmo tratamento de erro — 401 derruba a
 * sessão, 404 na leitura não é erro, rede é falha silenciosa. Duplicar isso
 * seria ter dois lugares para consertar quando o Supabase mudar um código.
 */
async function subir(bucket: string, partes: string[], blob: Blob): Promise<Resultado<true>> {
  const t = await token();
  if (!t.ok) return t;
  let r: Response;
  try {
    r = await fetch(endereco(t.v.uid, bucket, partes), {
      method: 'POST',
      headers: {
        apikey: ANON,
        Authorization: 'Bearer ' + t.v.token,
        'Content-Type': blob.type || 'image/webp',
        'x-upsert': 'true'
      },
      body: blob
    });
  } catch (e) { return falha('rede', 'sem conexão'); }
  if (r.status === 401) { await gravaSessao(null); return falha('auth', 'a sessão expirou, entre de novo'); }
  if (!r.ok) return falha('servidor', 'o servidor recusou a foto (' + r.status + ')');
  return { ok: true, v: true };
}

async function baixa(bucket: string, partes: string[]): Promise<Resultado<Blob | null>> {
  const t = await token();
  if (!t.ok) return t;
  let r: Response;
  try {
    r = await fetch(endereco(t.v.uid, bucket, partes), {
      method: 'GET', headers: { apikey: ANON, Authorization: 'Bearer ' + t.v.token }
    });
  } catch (e) { return falha('rede', 'sem conexão'); }
  if (r.status === 401) { await gravaSessao(null); return falha('auth', 'a sessão expirou, entre de novo'); }
  // 404 não é erro: é uma referência cuja foto ainda não subiu do outro lado
  if (r.status === 404) return { ok: true, v: null };
  if (!r.ok) return falha('servidor', 'não deu para buscar a foto (' + r.status + ')');
  return { ok: true, v: await r.blob() };
}

async function apaga(bucket: string, partes: string[]): Promise<Resultado<true>> {
  const t = await token();
  if (!t.ok) return t;
  try {
    await fetch(endereco(t.v.uid, bucket, partes), {
      method: 'DELETE', headers: { apikey: ANON, Authorization: 'Bearer ' + t.v.token }
    });
  } catch (e) { return falha('rede', 'sem conexão'); }
  return { ok: true, v: true };
}

export const NUVEM = {
  /** A sessão atual, ou null. Síncrono depois do primeiro `pronta()`. */
  sessao(): SessaoNuvem | null { return sessao; },

  /** Carrega a sessão do disco. Chamar uma vez no boot. */
  async pronta(): Promise<SessaoNuvem | null> { return leSessao(); },

  async entrar(email: string, senha: string): Promise<Resultado<SessaoNuvem>> {
    let r: Response;
    try {
      r = await chama('/auth/v1/token?grant_type=password', {
        method: 'POST', body: JSON.stringify({ email: email, password: senha })
      });
    } catch (e) { return falha('rede', 'sem conexão'); }

    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      const m = String((j as { error_description?: string; msg?: string }).error_description ||
                       (j as { msg?: string }).msg || '');
      return falha('auth', /Invalid login/i.test(m) ? 'e-mail ou senha não conferem' : (m || 'não deu para entrar'));
    }
    const s = deTokens(await r.json(), email);
    await gravaSessao(s);
    return { ok: true, v: s };
  },

  async sair(): Promise<void> { await gravaSessao(null); },

  /**
   * Lê a linha do usuário. `null` no lugar da linha quer dizer que ela ainda
   * não existe — primeiro aparelho a sincronizar — e não que deu erro.
   */
  async puxa(): Promise<Resultado<LinhaDoEstado | null>> {
    const t = await token();
    if (!t.ok) return t;
    let r: Response;
    try {
      r = await chama('/rest/v1/estado?select=v,data&dono=eq.' + encodeURIComponent(t.v.uid), {
        method: 'GET', headers: { Authorization: 'Bearer ' + t.v.token }
      });
    } catch (e) { return falha('rede', 'sem conexão'); }
    if (r.status === 401) { await gravaSessao(null); return falha('auth', 'a sessão expirou, entre de novo'); }
    if (!r.ok) return falha('servidor', 'o servidor recusou a leitura (' + r.status + ')');
    const linhas = await r.json() as LinhaDoEstado[];
    return { ok: true, v: linhas && linhas.length ? linhas[0] : null };
  },

  /**
   * Grava. `deV` é a versão de que este aparelho partiu — `null` quando a linha
   * ainda não existe.
   *
   * O filtro `v=eq.<deV>` é a trava: se outro aparelho gravou nesse meio-tempo,
   * a versão mudou, nenhuma linha casa e a escrita não acontece. O app relê,
   * funde e tenta de novo. Sem isso, o último a escrever apagaria o primeiro.
   */
  /** Manda os bytes de uma foto de aparelho. `upsert` porque trocar a foto reescreve. */
  subirFoto(idEx: string, blob: Blob, ext: string): Promise<Resultado<true>> {
    return subir(BUCKET, [idEx + '.' + ext], blob);
  },

  baixaFoto(idEx: string, ext: string): Promise<Resultado<Blob | null>> {
    return baixa(BUCKET, [idEx + '.' + ext]);
  },

  /** Tira os bytes de lá. Sem isto o arquivo ficaria órfão no bucket. */
  apagaFoto(idEx: string, ext: string): Promise<Resultado<true>> {
    return apaga(BUCKET, [idEx + '.' + ext]);
  },

  // ---------- as fotos do corpo ----------
  // Uma pasta por sessão: 'uid/2026-09-01/frente-relaxado.webp'. Ver a sessão
  // inteira no painel do Supabase é o que torna possível conferir, um dia, se
  // um byte se perdeu — com tudo numa pasta só isso seria um grep.

  subirCorpo(d: string, pose: string, blob: Blob, ext: string): Promise<Resultado<true>> {
    return subir(BUCKET_CORPO, [d, pose + '.' + ext], blob);
  },

  baixaCorpo(d: string, pose: string, ext: string): Promise<Resultado<Blob | null>> {
    return baixa(BUCKET_CORPO, [d, pose + '.' + ext]);
  },

  apagaCorpo(d: string, pose: string, ext: string): Promise<Resultado<true>> {
    return apaga(BUCKET_CORPO, [d, pose + '.' + ext]);
  },

  async empurra(deV: number | null, data: unknown): Promise<Resultado<number>> {
    const t = await token();
    if (!t.ok) return t;

    const cabeca = {
      Authorization: 'Bearer ' + t.v.token,
      Prefer: 'return=representation'
    };
    let r: Response;
    try {
      r = deV == null
        ? await chama('/rest/v1/estado?select=v', {
            method: 'POST', headers: cabeca,
            body: JSON.stringify({ dono: t.v.uid, data: data })
          })
        : await chama('/rest/v1/estado?select=v&dono=eq.' + encodeURIComponent(t.v.uid) + '&v=eq.' + deV, {
            method: 'PATCH', headers: cabeca,
            body: JSON.stringify({ data: data })
          });
    } catch (e) { return falha('rede', 'sem conexão'); }

    if (r.status === 401) { await gravaSessao(null); return falha('auth', 'a sessão expirou, entre de novo'); }
    // linha já existe e tentamos criar: outro aparelho chegou primeiro
    if (r.status === 409) return falha('conflito', 'outro aparelho gravou antes');
    if (!r.ok) return falha('servidor', 'o servidor recusou a escrita (' + r.status + ')');

    const linhas = await r.json() as Array<{ v: number }>;
    // zero linhas com PATCH é exatamente a trava agindo: a versão não bateu
    if (!linhas || !linhas.length) return falha('conflito', 'outro aparelho gravou antes');
    return { ok: true, v: linhas[0].v };
  }
};
