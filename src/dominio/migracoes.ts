// Migrações do formato do estado.
//
// Regra 2 do projeto: não quebrar dados salvos. Toda mudança de formato exige
// uma migração que leia a versão antiga — e ela roda tanto no boot quanto na
// IMPORTAÇÃO de um backup, pelo mesmo caminho. Um JSON de qualquer vintage
// chega aqui.
//
// As duas migrações recebem o estado em vez de mexer num global: é o que
// permite testar cada uma contra uma fixture, sem subir o app inteiro.

import { EX_BASE, PROGRAMA, ROT_BASE, semeiaProg, slugEx } from './programa';
import type { Estado, IdEx, Log } from './tipos';

// ---------- migração de plano ----------
// As chaves do histórico são dia+posição (A0, B3...). Trocar o programa faria
// o exercício novo herdar a carga do antigo que ocupava aquela posição — o
// placeholder mentiria e o selo de subir carga dispararia errado. Em vez de
// apagar, arquivamos: cada chave antiga vira 'antigo~<nome do exercício>'.
// Os dias treinados (S.done) não são tocados, o calendário fica intacto e
// tudo continua no JSON exportado.
export const PLANO_ATUAL = 3;

/** O que a migração 2→3 fez, para o app poder contar ao Eduardo. */
export interface Resultado3 {
  /** quantas chaves de histórico foram reescritas */
  chaves: number;
  /** exercícios do plano 1 que voltaram ao histórico ativo */
  recuperados: string[];
  /** exercícios que viraram entrada arquivada no catálogo */
  arquivados: number;
}

export const ARQUIVO = 'antigo~';

export const PLANO_1: Record<string, string> = {
  A0:'Supino inclinado com halteres', A1:'Supino reto na máquina', A2:'Crucifixo inclinado no cabo',
  A3:'Crossover na polia média', A4:'Tríceps testa com barra W', A5:'Tríceps corda na polia',
  A6:'Elevação lateral',
  B0:'Puxada aberta pronada', B1:'Puxada neutra unilateral', B2:'Remada serrote com halter',
  B3:'Pullover na polia alta', B4:'Rosca direta na barra W', B5:'Rosca martelo', B6:'Face pull',
  C0:'Agachamento hack', C1:'Leg press 45°', C2:'Cadeira extensora', C3:'Mesa flexora',
  C4:'Panturrilha em pé', C5:'Elevação de pernas suspenso',
  D0:'Desenvolvimento com halteres', D1:'Elevação lateral com halteres', D2:'Elevação lateral no cabo',
  D3:'Peck deck inverso', D4:'Face pull', D5:'Rosca inclinada (bi-set)', D6:'Tríceps corda (bi-set)',
  D7:'Abdominal na polia alta ajoelhado',
  E0:'Remada cavalinho', E1:'Remada sentada pegada neutra', E2:'Encolhimento com halteres',
  E3:'Puxada neutra', E4:'Supino inclinado na máquina', E5:'Elevação lateral',
  F0:'Terra romeno', F1:'Mesa flexora deitada', F2:'Cadeira flexora sentada', F3:'Elevação pélvica',
  F4:'Panturrilha sentada', F5:'Panturrilha em pé', F6:'Prancha com peso ou rollout na roda'
};

export function migraPlano(S: Estado): number {
  if (S.plano >= 2) return 0;
  let n = 0;
  const novo: Record<IdEx, Log[]> = {};
  Object.keys(S.logs).forEach(function (k) {
    if (k.indexOf(ARQUIVO) === 0) { novo[k] = S.logs[k]; return; }
    // chave pode ser 'A3' ou 'A3~Nome do substituto'
    const til = k.indexOf('~');
    const base = til < 0 ? k : k.slice(0, til);
    const nome = til < 0 ? PLANO_1[base] : k.slice(til + 1);
    if (!PLANO_1[base]) { novo[k] = S.logs[k]; return; }  // chave que não é do plano 1
    const alvo = ARQUIVO + nome;
    novo[alvo] = (novo[alvo] || []).concat(S.logs[k]);
    novo[alvo].sort(function (a, b) { return a.t - b.t; });
    n++;
  });
  S.logs = novo;
  // correções de tipo de carga apontavam para as posições antigas
  S.carga = {};
  // um treino em andamento no plano velho não faz sentido no plano novo
  S.sessao = null;
  S.draft = null;
  S.plano = 2;
  return n;
}

// ---------- plano 2 -> 3: a chave passa a ser o exercício ----------
// Até aqui a chave era dia+posição. Editar o programa quebraria isso a cada
// inserção. Esta migração reescreve o histórico pelo id do exercício e, de
// quebra, devolve ao histórico ativo os exercícios do plano 1 que continuam
// no programa — eles tinham sido arquivados por não ter para onde ir.
export function migraPlano3(S: Estado): Resultado3 | null {
  if (S.plano >= 3) return null;
  const r: Resultado3 = { chaves:0, recuperados:[], arquivados:0 };

  // posição antiga -> id do exercício que ocupava aquela posição
  const porPosicao: Record<string, IdEx> = {};
  ROT_BASE.forEach(function (d) {
    PROGRAMA[d].ex.forEach(function (ex, i) { porPosicao[d+i] = slugEx(ex.n); });
  });

  if (!S.ex || typeof S.ex !== 'object') S.ex = {};

  function destino(k: string): { id: IdEx; sl?: IdEx | null } | null {
    if (porPosicao[k]) return { id: porPosicao[k] };
    const til = k.indexOf('~');
    if (til < 0) return null;
    const base = k.slice(0, til), nome = k.slice(til + 1);
    const idEx = slugEx(nome);
    if (base === 'antigo') {
      // do plano 1: se o exercício ainda existe hoje, o histórico volta a ser
      // o dele; se não, vira exercício arquivado no catálogo
      if (!EX_BASE[idEx] && !S.ex[idEx]) {
        S.ex[idEx] = { n: nome, car:'pino', g:'', c:0, cue:'', arq:1 };
        r.arquivados++;
      } else if (EX_BASE[idEx]) { r.recuperados.push(nome); }
      return { id: idEx };
    }
    // substituto registrado numa posição: vira o exercício dele, guardando
    // de que posição do treino veio
    if (!EX_BASE[idEx] && !S.ex[idEx]) S.ex[idEx] = { n: nome, car:'pino', g:'', c:0, cue:'', meu:1 };
    return { id: idEx, sl: porPosicao[base] || null };
  }

  const novo: Record<IdEx, Log[]> = {};
  Object.keys(S.logs).forEach(function (k) {
    const dst = destino(k);
    if (!dst) { novo[k] = S.logs[k]; return; }   // chave que não sabemos ler: fica como está
    r.chaves++;
    const alvo = dst.id;
    if (!novo[alvo]) novo[alvo] = [];
    S.logs[k].forEach(function (e) {
      if (dst.sl && dst.sl !== alvo) e.sl = dst.sl; else delete e.sl;
      novo[alvo].push(e);
    });
  });
  Object.keys(novo).forEach(function (k) {
    novo[k].sort(function (a, b) { return a.t - b.t; });
  });
  S.logs = novo;

  // a correção de tipo de carga acompanha o exercício, não a posição
  const carga: Record<IdEx, any> = {};
  Object.keys(S.carga || {}).forEach(function (k) {
    if (porPosicao[k]) carga[porPosicao[k]] = S.carga[k];
  });
  S.carga = carga;

  // 'pulados' guardava dia+posição nos dois lugares onde aparece
  function repulados(a: any[]): any[] {
    return (a || []).map(function (x) { return porPosicao[x] || x; });
  }
  if (S.sessao && S.sessao.pulados) S.sessao.pulados = repulados(S.sessao.pulados);
  S.done.forEach(function (m) { if (m.pulados) m.pulados = repulados(m.pulados); });
  const draft = S.draft;
  if (draft && draft.ex) {
    Object.keys(draft.ex).forEach(function (i) {
      const e = draft.ex[i];
      if (e && e.alt) e.alt = slugEx(e.alt);
    });
  }

  S.prog = semeiaProg();
  S.rot = ROT_BASE.slice();
  S.plano = 3;
  return r;
}