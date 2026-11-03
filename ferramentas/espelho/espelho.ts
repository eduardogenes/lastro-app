// Monta, no computador, uma pasta de leitura com os dados do Lastro.
//
//   npm run espelho
//
// Existe para os agentes dele (treinador, nutricionista) e para ele mesmo
// lerem o que o app registrou — treino, comida, corpo e as fotos — sem abrir o
// app e sem pedir uma exportação à mão. A organização mora em `monta.ts`;
// aqui fica o que toca rede e disco.
//
// Três regras guiam o que está aqui:
//
// 1. A conta é a do app, com o RLS do app. Entra com e-mail e senha, como o
//    celular entra, e só enxerga o que o celular enxerga. Nada de chave de
//    administrador: ela abriria o banco inteiro para um script de leitura.
// 2. A senha nunca é guardada. Fica o refresh token da sessão, num arquivo que
//    só o dono do usuário lê — o mesmo que qualquer CLI faz.
// 3. A pasta é DESTA ferramenta. Ela só apaga o que ela mesma escreveu (o
//    manifesto lembra o quê), e se recusa a usar uma pasta com arquivos de
//    outra origem. Um caminho errado no `--pasta` não pode virar faxina.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import readline from 'node:readline';
import { ANON, URL_BASE } from '../../src/infra/supabase';
import { fotosDoEstado, montaArquivos, type Contexto, type FotoAlvo } from './monta';

const PASTA_CONFIG = path.join(os.homedir(), '.config', 'lastro');
const ARQ_CONFIG = path.join(PASTA_CONFIG, 'espelho.json');
const MANIFESTO = '.espelho.json';
const PASTA_PADRAO = path.join(os.homedir(), 'Lastro');

const AJUDA = `
Monta uma pasta de leitura com seus dados do Lastro: treino, comida, corpo e fotos.

  npm run espelho                       atualiza a pasta (padrão: ~/Lastro)
  npm run espelho -- --pasta DIR        usa outra pasta, e passa a lembrar dela
  npm run espelho -- --de-arquivo F     monta a partir de uma cópia baixada do app
                                        (Ajustes → Exportar). Sem login e sem fotos.
  npm run espelho -- --sair             esquece o login guardado neste computador

Na primeira vez pede o e-mail e a senha da conta do app. A senha não é guardada:
fica só o token da sessão, em ~/.config/lastro/espelho.json, legível só por você.
Para rodar sem perguntar, defina LASTRO_EMAIL e LASTRO_SENHA no ambiente.
`;

interface Config { email?: string; uid?: string; refresh?: string; pasta?: string; }
interface Manifesto { versao: 1; conta?: string | null; arquivos: string[]; fotos: Record<string, number>; }
interface Sessao { token: string; refresh: string; uid: string; email: string; }
interface LinhaDoEstado { v: number; data: unknown; atualizado?: string; }

/** Erro para mostrar como frase, sem pilha. */
class Falha extends Error {}

// ---------------------------------------------------------------------------
// Argumentos e configuração

interface Args { pasta?: string; deArquivo?: string; sair: boolean; ajuda: boolean; }

function leArgs(argv: string[]): Args {
  const a: Args = { sair: false, ajuda: false };
  for (let i = 0; i < argv.length; i++) {
    const x = argv[i];
    if (x === '--pasta') a.pasta = argv[++i];
    else if (x === '--de-arquivo') a.deArquivo = argv[++i];
    else if (x === '--sair') a.sair = true;
    else if (x === '--ajuda' || x === '-h' || x === '--help') a.ajuda = true;
    else throw new Falha('Não conheço a opção "' + x + '".\n' + AJUDA);
  }
  if ((argv.includes('--pasta') && !a.pasta) || (argv.includes('--de-arquivo') && !a.deArquivo)) {
    throw new Falha('Faltou o caminho depois da opção.\n' + AJUDA);
  }
  return a;
}

function expande(p: string): string {
  return p === '~' ? os.homedir() : p.startsWith('~/') ? path.join(os.homedir(), p.slice(2)) : p;
}

function leJson<T>(f: string): T | null {
  try { return JSON.parse(fs.readFileSync(f, 'utf8')) as T; } catch (e) { return null; }
}

function gravaConfig(c: Config): void {
  fs.mkdirSync(PASTA_CONFIG, { recursive: true, mode: 0o700 });
  fs.writeFileSync(ARQ_CONFIG, JSON.stringify(c, null, 2) + '\n', { mode: 0o600 });
  // `mode` só vale na criação: um arquivo que já existia mantém a permissão velha
  fs.chmodSync(ARQ_CONFIG, 0o600);
}

// ---------------------------------------------------------------------------
// Terminal

/** Pergunta no terminal. Com `oculto`, o que é digitado não aparece. */
function pergunta(texto: string, oculto: boolean = false): Promise<string> {
  return new Promise(function (resolve) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    // O readline não tem modo senha. O jeito conhecido é calar a escrita dele
    // depois que o texto da pergunta saiu.
    const r = rl as unknown as { _writeToOutput: (s: string) => void };
    const original = r._writeToOutput.bind(rl);
    let mudo = false;
    r._writeToOutput = function (s: string) { if (!mudo) original(s); };
    rl.question(texto, function (resposta) {
      rl.close();
      if (oculto) process.stdout.write('\n');
      resolve(resposta.trim());
    });
    mudo = oculto;
  });
}

// ---------------------------------------------------------------------------
// Nuvem — o mesmo HTTP puro de `src/infra/nuvem.ts`, sem a camada de storage do navegador

async function chama(caminho: string, init: RequestInit): Promise<Response> {
  try {
    return await fetch(URL_BASE + caminho, Object.assign({}, init, {
      headers: Object.assign({ apikey: ANON }, init.headers || {})
    }));
  } catch (e) {
    throw new Falha('Sem conexão com a nuvem do Lastro. Confira a internet e tente de novo.');
  }
}

function deTokens(j: Record<string, unknown>, email: string): Sessao {
  const u = (j.user || {}) as { id?: string; email?: string };
  return { token: String(j.access_token || ''), refresh: String(j.refresh_token || ''), uid: String(u.id || ''), email: String(u.email || email) };
}

/** Renova a sessão guardada. `null` quando ela morreu e é preciso entrar de novo. */
async function renova(refresh: string, email: string): Promise<Sessao | null> {
  const r = await chama('/auth/v1/token?grant_type=refresh_token', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ refresh_token: refresh })
  });
  if (r.status === 400 || r.status === 401 || r.status === 403) return null;
  if (!r.ok) throw new Falha('A nuvem recusou renovar a sessão (' + r.status + '). Tente de novo daqui a pouco.');
  return deTokens(await r.json(), email);
}

async function entraComSenha(email: string, senha: string): Promise<Sessao> {
  const r = await chama('/auth/v1/token?grant_type=password', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: email, password: senha })
  });
  if (!r.ok) {
    const j = await r.json().catch(function () { return {}; }) as { error_description?: string; msg?: string };
    const m = String(j.error_description || j.msg || '');
    throw new Falha(/Invalid login/i.test(m) ? 'E-mail ou senha não conferem.' : 'Não deu para entrar: ' + (m || 'erro ' + r.status) + '.');
  }
  return deTokens(await r.json(), email);
}

async function entra(c: Config): Promise<Sessao> {
  if (c.refresh) {
    const s = await renova(c.refresh, c.email || '');
    if (s) return s;
    console.log('O login guardado expirou. Entre de novo.');
  }
  let email = process.env.LASTRO_EMAIL || '';
  let senha = process.env.LASTRO_SENHA || '';
  if (!email || !senha) {
    if (!process.stdin.isTTY) {
      throw new Falha('Não há login guardado. Rode `npm run espelho` uma vez num terminal para entrar, ou defina LASTRO_EMAIL e LASTRO_SENHA.');
    }
    if (!email) email = (await pergunta('E-mail da conta do Lastro' + (c.email ? ' [' + c.email + ']' : '') + ': ')) || c.email || '';
    if (!senha) senha = await pergunta('Senha: ', true);
  }
  if (!email || !senha) throw new Falha('Faltou o e-mail ou a senha.');
  return entraComSenha(email, senha);
}

async function puxaEstado(s: Sessao): Promise<LinhaDoEstado | null> {
  const r = await chama('/rest/v1/estado?select=v,data,atualizado&dono=eq.' + encodeURIComponent(s.uid), {
    method: 'GET', headers: { Authorization: 'Bearer ' + s.token }
  });
  if (r.status === 401) throw new Falha('A nuvem recusou a sessão. Rode `npm run espelho -- --sair` e entre de novo.');
  if (!r.ok) throw new Falha('A nuvem recusou a leitura dos dados (' + r.status + ').');
  const linhas = await r.json() as LinhaDoEstado[];
  return linhas && linhas.length ? linhas[0] : null;
}

/** Os bytes de uma foto. `null` quando a nuvem ainda não a tem (404). */
async function baixaFoto(s: Sessao, f: FotoAlvo): Promise<Buffer | null> {
  const caminho = '/storage/v1/object/' + f.bucket + '/' + encodeURIComponent(s.uid) + '/' + f.partes.map(encodeURIComponent).join('/');
  const r = await chama(caminho, { method: 'GET', headers: { Authorization: 'Bearer ' + s.token } });
  // O Storage responde 400 com "not_found" no corpo em algumas versões, e 404 em outras.
  if (r.status === 404 || r.status === 400) return null;
  if (!r.ok) throw new Error('foto recusada (' + r.status + ')');
  return Buffer.from(await r.arrayBuffer());
}

// ---------------------------------------------------------------------------
// Disco

/** O caminho absoluto de um arquivo da pasta, recusando qualquer coisa que saia dela. */
function dentro(pasta: string, rel: string): string {
  const abs = path.resolve(pasta, rel);
  if (abs !== pasta && !abs.startsWith(pasta + path.sep)) throw new Falha('Caminho fora da pasta recusado: ' + rel);
  return abs;
}

/**
 * A pasta pode ser usada? Vazia, inexistente ou já desta ferramenta: sim.
 * Com arquivos de outra origem: não — apagar o que sobrou de uma atualização
 * anterior é parte do trabalho, e isso não pode alcançar arquivo de ninguém.
 */
function conferePasta(pasta: string): void {
  if (!fs.existsSync(pasta)) { fs.mkdirSync(pasta, { recursive: true, mode: 0o700 }); return; }
  if (!fs.statSync(pasta).isDirectory()) throw new Falha(pasta + ' existe e não é uma pasta.');
  const itens = fs.readdirSync(pasta).filter(function (x) { return x !== '.DS_Store'; });
  if (itens.length && itens.indexOf(MANIFESTO) < 0) {
    throw new Falha('A pasta ' + pasta + ' já tem arquivos que não foram gerados aqui.\n' +
      'Escolha outra com `npm run espelho -- --pasta CAMINHO`, ou esvazie essa.');
  }
}

/** Grava só se o conteúdo mudou, por arquivo temporário + rename. Devolve se gravou. */
function gravaSeMudou(abs: string, conteudo: string | Buffer): boolean {
  const novo = typeof conteudo === 'string' ? Buffer.from(conteudo, 'utf8') : conteudo;
  if (fs.existsSync(abs) && fs.readFileSync(abs).equals(novo)) return false;
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  const tmp = abs + '.tmp-' + process.pid;
  fs.writeFileSync(tmp, novo);
  fs.renameSync(tmp, abs);
  return true;
}

function apaga(abs: string): boolean {
  try { fs.unlinkSync(abs); return true; } catch (e) { return false; }
}

/** Tira as subpastas que ficaram vazias depois de apagar o que saiu. */
function podaVazias(dir: string, raiz: string): void {
  fs.readdirSync(dir, { withFileTypes: true }).forEach(function (d) {
    if (d.isDirectory()) podaVazias(path.join(dir, d.name), raiz);
  });
  if (dir !== raiz && !fs.readdirSync(dir).length) fs.rmdirSync(dir);
}

async function emLotes<T>(itens: T[], quantos: number, fn: (x: T) => Promise<void>): Promise<void> {
  let i = 0;
  const trabalhador = async function () { while (i < itens.length) await fn(itens[i++]); };
  await Promise.all(Array.from({ length: Math.min(quantos, itens.length) }, trabalhador));
}

function plural(n: number, um: string, varios: string): string { return n + ' ' + (n === 1 ? um : varios); }

// ---------------------------------------------------------------------------
// O espelho

async function principal(): Promise<void> {
  const a = leArgs(process.argv.slice(2));
  if (a.ajuda) { console.log(AJUDA); return; }

  const cfg = leJson<Config>(ARQ_CONFIG) || {};
  if (a.sair) {
    delete cfg.refresh; delete cfg.uid;
    gravaConfig(cfg);
    console.log('Login esquecido neste computador. A pasta continua onde estava.');
    return;
  }

  const pasta = path.resolve(expande(a.pasta || process.env.LASTRO_PASTA || cfg.pasta || PASTA_PADRAO));
  conferePasta(pasta);
  const manifesto = leJson<Manifesto>(path.join(pasta, MANIFESTO)) || { versao: 1, arquivos: [], fotos: {} };
  const fotosAntes = manifesto.fotos || {};
  const agora = Date.now();

  let estado: unknown;
  let ctx: Contexto;
  const fotos: Record<string, number> = {};
  let baixadas = 0;

  if (a.deArquivo) {
    const arq = path.resolve(expande(a.deArquivo));
    const j = leJson<{ app?: string; data?: unknown }>(arq);
    if (!j || typeof j !== 'object') throw new Falha('Não deu para ler ' + arq + ' como JSON.');
    // A cópia do app vem embrulhada (`{ app: 'lastro', data: S }`); o estado cru também serve.
    estado = j.app === 'lastro' && j.data ? j.data : j;
    // Sem conta não há fotos novas — as que já estavam na pasta ficam.
    Object.keys(fotosAntes).forEach(function (c) { if (fs.existsSync(dentro(pasta, c))) fotos[c] = fotosAntes[c]; });
    ctx = { agora: agora, semDownload: true, presentes: new Set(Object.keys(fotos)), origem: 'o arquivo ' + path.basename(arq), conta: manifesto.conta || null };
  } else {
    const s = await entra(cfg);
    cfg.email = s.email; cfg.uid = s.uid; cfg.refresh = s.refresh;
    if (a.pasta) cfg.pasta = pasta;
    // Grava ANTES de seguir: o refresh token gira a cada uso, e o velho já
    // morreu. Cair depois daqui sem gravar deixaria o próximo login sem sessão.
    gravaConfig(cfg);
    console.log('Conta: ' + s.email);

    const linha = await puxaEstado(s);
    if (!linha) throw new Falha('Esta conta ainda não tem dados na nuvem. Entre na conta pelo app (Ajustes) para sincronizar primeiro.');
    estado = linha.data;

    const faltando = new Set<string>(), falhou = new Set<string>();
    const alvos = fotosDoEstado(estado as Parameters<typeof fotosDoEstado>[0]);
    await emLotes(alvos, 4, async function (f) {
      const abs = dentro(pasta, f.caminho);
      const tinha = fotosAntes[f.caminho] != null && fs.existsSync(abs);
      if (tinha && fotosAntes[f.caminho] === f.v) { fotos[f.caminho] = f.v; return; }
      try {
        const bytes = await baixaFoto(s, f);
        if (bytes) { gravaSeMudou(abs, bytes); fotos[f.caminho] = f.v; baixadas++; return; }
        // Versão nova ainda não subiu: a anterior serve melhor que nada, e o
        // manifesto guarda a versão VELHA para tentar de novo na próxima.
        if (tinha) fotos[f.caminho] = fotosAntes[f.caminho];
        else faltando.add(f.caminho);
      } catch (e) {
        if (tinha) fotos[f.caminho] = fotosAntes[f.caminho];
        else falhou.add(f.caminho);
      }
    });
    ctx = {
      agora: agora, presentes: new Set(Object.keys(fotos)), faltando: faltando, falhou: falhou,
      conta: s.email, origem: 'a nuvem do app', gravadoEm: linha.atualizado ? Date.parse(linha.atualizado) : null
    };
  }

  const arquivos = montaArquivos(estado, ctx);
  let escritos = 0;
  Object.keys(arquivos).forEach(function (rel) { if (gravaSeMudou(dentro(pasta, rel), arquivos[rel])) escritos++; });

  // O que saiu do estado sai da pasta — mas só o que esta ferramenta escreveu.
  let removidos = 0;
  (manifesto.arquivos || []).forEach(function (rel) { if (!(rel in arquivos) && apaga(dentro(pasta, rel))) removidos++; });
  Object.keys(fotosAntes).forEach(function (rel) { if (!(rel in fotos) && apaga(dentro(pasta, rel))) removidos++; });
  podaVazias(pasta, pasta);

  const novo: Manifesto = { versao: 1, conta: ctx.conta || null, arquivos: Object.keys(arquivos).sort(), fotos: fotos };
  gravaSeMudou(path.join(pasta, MANIFESTO), JSON.stringify(novo, null, 2) + '\n');

  const avisos: string[] = [];
  if (ctx.faltando && ctx.faltando.size) avisos.push(plural(ctx.faltando.size, 'foto ainda não subiu', 'fotos ainda não subiram') + ' do celular para a nuvem.');
  if (ctx.falhou && ctx.falhou.size) avisos.push(plural(ctx.falhou.size, 'foto não baixou', 'fotos não baixaram') + ' desta vez; rode de novo para tentar.');
  if (ctx.semDownload) avisos.push('Gerada a partir de um arquivo: as fotos não vêm junto.');

  console.log('Pasta atualizada: ' + pasta);
  console.log('  ' + plural(Object.keys(arquivos).length, 'arquivo', 'arquivos') + ' (' + escritos + ' com mudança) · ' +
    plural(Object.keys(fotos).length, 'foto', 'fotos') + ' (' + baixadas + (baixadas === 1 ? ' nova' : ' novas') + ')' +
    (removidos ? ' · ' + removidos + ' removidos' : ''));
  avisos.forEach(function (x) { console.log('  ' + x); });
}

principal().catch(function (e) {
  if (e instanceof Falha) console.error(e.message);
  else console.error(e);
  process.exitCode = 1;
});
