// Migrações do formato do estado.
//
// Regra 2 do projeto: não quebrar dados salvos. Toda mudança de formato exige
// uma migração que leia a versão antiga — e ela roda tanto no boot quanto na
// IMPORTAÇÃO de um backup, pelo mesmo caminho. Um JSON de qualquer vintage
// chega aqui.
//
// As duas migrações recebem o estado em vez de mexer num global: é o que
// permite testar cada uma contra uma fixture, sem subir o app inteiro.

import { CADENCIA_PADRAO } from './dia';
import { PLANO_BASE } from './nutricao/alimentos';
import { EX_BASE, slugEx } from './programa';
import type { Estado, IdEx, Log, Treino } from './tipos';

// ---------- migração de plano ----------
// As chaves do histórico são dia+posição (A0, B3...). Trocar o programa faria
// o exercício novo herdar a carga do antigo que ocupava aquela posição — o
// placeholder mentiria e o selo de subir carga dispararia errado. Em vez de
// apagar, arquivamos: cada chave antiga vira 'antigo~<nome do exercício>'.
// Os dias treinados (S.done) não são tocados, o calendário fica intacto e
// tudo continua no JSON exportado.
export const PLANO_ATUAL = 6;

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

// O programa que estava vivo na era do plano 3, congelado com a ROTULAGEM DA
// ÉPOCA (o treino de torso se chamava E e o de ombros se chamava D). A 2→3
// lia o PROGRAMA importado do código — funcionava porque os dois eram o mesmo
// programa. Quando o treinador trocou a prescrição, o PROGRAMA vivo deixou de
// falar a língua dos backups antigos: um plano 2 lido contra ele mapearia o
// histórico para os exercícios errados. Migração lê dado congelado, nunca o
// código de hoje — o mesmo motivo pelo qual PLANO_1 existe aqui em cima.
export const ROT_PLANO_3: string[] = ['A','B','C','E','D','F'];

export const PROGRAMA_PLANO_3: Record<string, Treino<{ id: IdEx; s: number; r: string; d: number }>> = {
  A: { name:'Peito superior + lateral + tríceps', tag:'clavicular e ombro', ex:[
    {id:'chest-press-inclinado-convergente', s:3, r:'6–10', d:180},
    {id:'crossover-de-baixo-para-cima', s:2, r:'10–15', d:105},
    {id:'elevacao-lateral-na-maquina', s:3, r:'8–15', d:90},
    {id:'elevacao-lateral-unilateral-no-cabo', s:3, r:'12–20', d:90},
    {id:'extensao-de-triceps-acima-da-cabeca-no-cabo', s:3, r:'8–15', d:105},
    {id:'pushdown', s:2, r:'10–15', d:105},
    {id:'crunch-no-cabo-ou-maquina', s:3, r:'8–15', d:90},
  ]},
  B: { name:'Dorsais + posterior de ombro + bíceps', tag:'um dos dois treinos mais importantes', ex:[
    {id:'pulldown-convergente', s:3, r:'6–10', d:150},
    {id:'pulldown-unilateral', s:3, r:'8–12', d:150},
    {id:'remada-para-dorsal-com-apoio-de-peito', s:2, r:'8–12', d:150},
    {id:'pullover-em-maquina-ou-cabo', s:2, r:'10–15', d:105},
    {id:'reverse-pec-deck', s:3, r:'10–20', d:105},
    {id:'crucifixo-inverso-no-cabo', s:2, r:'12–20', d:105},
    {id:'rosca-scott-na-maquina', s:3, r:'8–12', d:105},
    {id:'rosca-no-cabo', s:2, r:'10–15', d:105},
  ]},
  C: { name:'Quadríceps + adutores + panturrilha', tag:'qualidade e progressão, não volume', ex:[
    {id:'pendulum-squat', s:3, r:'6–10', d:180},
    {id:'leg-press', s:3, r:'8–15', d:150},
    {id:'cadeira-extensora', s:3, r:'10–15', d:105},
    {id:'adutora', s:3, r:'10–15', d:105},
    {id:'panturrilha-em-pe', s:3, r:'6–12', d:90},
    {id:'panturrilha-sentada', s:2, r:'10–15', d:90},
    {id:'tibial-anterior', s:2, r:'12–20', d:90},
  ]},
  E: { name:'Espessura de costas + peito', tag:'o grande treino de torso', ex:[
    {id:'remada-convergente-com-apoio-de-peito', s:3, r:'6–10', d:150},
    {id:'remada-horizontal-na-maquina', s:3, r:'8–12', d:150},
    {id:'high-row-com-apoio-de-peito', s:2, r:'8–12', d:150},
    {id:'encolhimento-na-maquina', s:2, r:'8–15', d:105},
    {id:'straight-arm-pulldown', s:2, r:'10–15', d:105},
    {id:'supino-inclinado-no-smith', s:3, r:'6–10', d:180},
    {id:'crucifixo-inclinado-no-cabo', s:2, r:'10–15', d:105},
    {id:'chest-press-horizontal-convergente', s:3, r:'8–12', d:150},
    {id:'pec-deck', s:2, r:'10–15', d:105},
  ]},
  D: { name:'Deltoides + braços + abdômen', tag:'lateral antes dos braços, de propósito', ex:[
    {id:'elevacao-lateral-na-maquina', s:4, r:'8–15', d:90},
    {id:'elevacao-lateral-no-cabo', s:3, r:'12–20', d:90},
    {id:'remada-para-deltoide-posterior-com-apoio-de-peito', s:2, r:'8–15', d:105},
    {id:'reverse-fly-no-cabo', s:2, r:'12–20', d:105},
    {id:'rosca-bayesian-no-cabo', s:2, r:'8–15', d:105},
    {id:'rosca-martelo', s:2, r:'8–15', d:105},
    {id:'extensao-unilateral-de-triceps-no-cabo', s:2, r:'8–15', d:105},
    {id:'extensao-acima-da-cabeca-ou-maquina-de-triceps', s:2, r:'10–15', d:105},
    {id:'elevacao-de-pernas-ou-reverse-crunch', s:3, r:'8–15', d:90},
  ]},
  F: { name:'Posteriores + glúteos + panturrilha', tag:'equilíbrio com a coxa anterior', ex:[
    {id:'cadeira-flexora-sentada', s:4, r:'8–12', d:105},
    {id:'terra-romeno-no-smith', s:3, r:'6–10', d:180},
    {id:'mesa-flexora-deitada', s:3, r:'10–15', d:105},
    {id:'elevacao-pelvica-na-maquina', s:3, r:'8–12', d:150},
    {id:'abdutora', s:2, r:'12–20', d:105},
    {id:'panturrilha-sentada', s:3, r:'8–15', d:90},
    {id:'panturrilha-no-leg-press', s:2, r:'10–15', d:90},
    {id:'ab-wheel', s:3, r:'6–12', d:90},
  ]},
};

// ---------- plano 2 -> 3: a chave passa a ser o exercício ----------
// Até aqui a chave era dia+posição. Editar o programa quebraria isso a cada
// inserção. Esta migração reescreve o histórico pelo id do exercício e, de
// quebra, devolve ao histórico ativo os exercícios do plano 1 que continuam
// no programa — eles tinham sido arquivados por não ter para onde ir.
export function migraPlano3(S: Estado): Resultado3 | null {
  if (S.plano >= 3) return null;
  const r: Resultado3 = { chaves:0, recuperados:[], arquivados:0 };

  // posição antiga -> id do exercício que ocupava aquela posição
  // As chaves do plano 2 foram escritas com a rotulagem da ÉPOCA, quando o
  // treino de torso se chamava E e o de ombros se chamava D. Ler 'D3' com a
  // rotulagem de hoje apontaria para o exercício errado — a migração precisa
  // falar a língua do dado que ela lê, não a do código que a executa.
  const porPosicao: Record<string, IdEx> = {};
  ROT_PLANO_3.forEach(function (d) {
    PROGRAMA_PLANO_3[d].ex.forEach(function (ex, i) { porPosicao[d+i] = ex.id; });
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

  // Semeia com o programa DA ÉPOCA, não com o de hoje.
  //
  // Toda migração tem que produzir o estado como ele era NAQUELA versão: as
  // letras daquela rotulagem (a 4→5 corrige depois, na ordem certa) e os
  // exercícios daquela prescrição. Semear com o programa de hoje daria a quem
  // importa um backup antigo um S.prog que ele nunca teve — e sem as
  // diferenças que ele mesmo tinha feito. O programa novo entra pelo botão de
  // restaurar, que é decisão dele, não efeito colateral de uma importação.
  const prog: Record<string, Treino> = {};
  ROT_PLANO_3.forEach(function (d) {
    prog[d] = { name: PROGRAMA_PLANO_3[d].name, tag: PROGRAMA_PLANO_3[d].tag,
      ex: PROGRAMA_PLANO_3[d].ex.map(function (ex) {
        return { id: ex.id, s: ex.s, r: ex.r, d: ex.d, desde: 0 };
      }) };
  });
  S.prog = prog;
  S.rot = ROT_PLANO_3.slice();
  S.plano = 3;
  return r;
}

// ---------- plano 3 -> 4: a fusão com a nutrição ----------
// Puramente ADITIVA. Nada do treino é reescrito, nenhuma chave de histórico é
// tocada, nenhuma sessão muda de forma. É a migração mais barata das três, e
// tem que continuar sendo: o histórico dele tem meses, e um redesign não é
// motivo para arriscar a regra 2 do projeto.
//
// A única decisão de conteúdo é a cadência inicial: descansa domingo, treina os
// outros seis. É a semana típica dele, e ele muda no GUIA em dois toques.

/** O que a 3→4 semeou, para o app poder contar. */
export interface Resultado4 {
  /** refeições semeadas no plano dele */
  refeicoes: number;
  /** true quando a cadência precisou nascer */
  cadencia: boolean;
}

export function migraPlano4(S: Estado): Resultado4 | null {
  if (S.plano >= 4) return null;

  const r: Resultado4 = { refeicoes: 0, cadencia: false };

  if (!S.cadencia || S.cadencia.length !== 7) {
    S.cadencia = CADENCIA_PADRAO.slice();
    r.cadencia = true;
  }

  if (!S.comida || typeof S.comida !== 'object') {
    S.comida = { plano: null, alimentos: {}, ocultos: {} };
  }
  if (!S.comida.plano) {
    // Cópia profunda: o plano dele diverge do congelado, e compartilhar
    // referência faria editar uma refeição mudar a prescrição de origem —
    // exatamente o bug que S.prog evita do lado do treino.
    S.comida.plano = JSON.parse(JSON.stringify(PLANO_BASE));
    r.refeicoes = S.comida.plano!.length;
  }
  if (!S.comida.alimentos) S.comida.alimentos = {};
  if (!S.comida.ocultos) S.comida.ocultos = {};

  if (!S.compras || typeof S.compras !== 'object') {
    S.compras = { comprado: {}, extras: [], removidas: {}, dias: 7 };
  }

  if (S.ajuste !== -1 && S.ajuste !== 1) S.ajuste = 0;
  if (S.perfManual !== true && S.perfManual !== false) S.perfManual = null;
  if (!S.dia || typeof S.dia !== 'object') S.dia = null;

  S.plano = 4;
  return r;
}

// ---------- plano 4 -> 5: as letras D e E trocam de lugar ----------
//
// A SEQUÊNCIA dos treinos não mudou e não pode mudar: o grande treino de torso
// vem antes do dia de ombros e braços, e o motivo é fisiológico. O que mudou
// foram os rótulos — até o plano 4 a sequência era escrita como A B C E D F,
// com o E fora de ordem, e isso parecia erro toda vez que a tela abria.
//
// Trocar rótulo é migração de dado, não cosmética: TODA sessão registrada
// guarda a letra em `done[].day`. Sem esta migração, cada treino de ombros do
// histórico passaria a se chamar "espessura de costas", e o app estaria
// mentindo sobre meses de registro.
//
// A troca é involução — aplicá-la duas vezes desfaz. O guarda de versão é o que
// impede isso, e por isso ele vem antes de qualquer coisa.

/** O que mudou de nome. Só D e E; o resto ficou onde estava. */
export const TROCA_4_5: Record<string, string> = { D: 'E', E: 'D' };

/** A letra de hoje para a letra de antes do plano 5, e vice-versa. */
export function trocaLetra(l: string): string {
  return TROCA_4_5[l] || l;
}

export interface Resultado5 {
  /** sessões do histórico que foram renomeadas */
  sessoes: number;
  /** dias do programa dele que trocaram de chave */
  dias: number;
}

export function migraPlano5(S: Estado): Resultado5 | null {
  if (S.plano >= 5) return null;
  const r: Resultado5 = { sessoes: 0, dias: 0 };

  S.done.forEach(function (m) {
    if (TROCA_4_5[m.day]) { m.day = trocaLetra(m.day); r.sessoes++; }
  });
  if (S.sessao) S.sessao.day = trocaLetra(S.sessao.day);
  if (S.draft && S.draft.day) S.draft.day = trocaLetra(S.draft.day);
  if (S.mods) S.mods.day = trocaLetra(S.mods.day);
  (S.progLog || []).forEach(function (e) { e.day = trocaLetra(e.day); });

  if (Array.isArray(S.rot)) S.rot = S.rot.map(trocaLetra);

  if (S.prog) {
    const novo: Record<string, (typeof S.prog)[string]> = {};
    Object.keys(S.prog).forEach(function (k) {
      novo[trocaLetra(k)] = S.prog![k];
      r.dias++;
    });
    S.prog = novo;
  }

  S.plano = 5;
  return r;
}

// ---------- plano 5 -> 6: o RIR desce da sessão para a série ----------
//
// No plano 5 o RIR era UM por exercício por sessão — o da última série —, e
// vinha como texto de faixa ('0–1', '1–2'), porque foi assim que o treinador
// pediu para registrar.
//
// Passou a ser por série, porque é por série que a informação existe: a
// primeira a 2 da falha e a última a 0 é uma sessão diferente de três séries a
// 1, e as duas somariam exatamente o mesmo volume. Sem isso o app também não
// tem como conferir a regra de subir carga, que é "topo da faixa E o RIR
// planejado".
//
// A faixa vira número pelo LIMITE INFERIOR: '0–1' registra que chegou a zero em
// algum momento, e para leitura de fadiga o pior caso é o que importa.

/** Como cada faixa do plano 5 se lê em número. */
const RIR_DO_TEXTO: Record<string, number> = {
  '0': 0, '0–1': 0, '0-1': 0, '1': 1, '1–2': 1, '1-2': 1, '2+': 2, '2': 2
};

export interface Resultado6 {
  /** entradas cujo RIR desceu para a série */
  movidos: number;
}

export function migraPlano6(S: Estado): Resultado6 | null {
  if (S.plano >= 6) return null;
  const r: Resultado6 = { movidos: 0 };

  Object.keys(S.logs || {}).forEach(function (k) {
    (S.logs[k] || []).forEach(function (e) {
      const texto = (e as Log & { rir?: string }).rir;
      if (texto == null) return;
      const n = RIR_DO_TEXTO[String(texto)];
      delete (e as Log & { rir?: string }).rir;
      if (n == null || !Array.isArray(e.sets)) return;
      // o valor era o da ÚLTIMA série feita, e é lá que ele tem que pousar
      for (let i = e.sets.length - 1; i >= 0; i--) {
        const s = e.sets[i];
        if (s) { s[2] = n; r.movidos++; return; }
      }
    });
  });

  S.plano = 6;
  return r;
}
