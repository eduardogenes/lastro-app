// Migrações do formato do estado.
//
// Regra 2 do projeto: não quebrar dados salvos. Toda mudança de formato exige
// uma migração que leia a versão antiga — e ela roda tanto no boot quanto na
// IMPORTAÇÃO de um backup, pelo mesmo caminho. Um JSON de qualquer vintage
// chega aqui.
//
// As duas migrações recebem o estado em vez de mexer num global: é o que
// permite testar cada uma contra uma fixture, sem subir o app inteiro.

import { MARCAS_DA_BIO } from './corpo';
import { CADENCIA_PADRAO } from './dia';
import { PLANO_BASE } from './nutricao/alimentos';
import { EX_BASE, SIMULACAO_HYROX, slugEx } from './programa';
import { chaveDeLog } from './sincronia';
import type { DiaComidaHist } from './nutricao/tipos';
import type { Estado, IdEx, Log, Marca, PromoPendente, Treino } from './tipos';
import type { Refeicao } from './nutricao/tipos';

// ---------- migração de plano ----------
// As chaves do histórico são dia+posição (A0, B3...). Trocar o programa faria
// o exercício novo herdar a carga do antigo que ocupava aquela posição — o
// placeholder mentiria e o selo de subir carga dispararia errado. Em vez de
// apagar, arquivamos: cada chave antiga vira 'antigo~<nome do exercício>'.
// Os dias treinados (S.done) não são tocados, o calendário fica intacto e
// tudo continua no JSON exportado.
export const PLANO_ATUAL = 11;

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

  // O ajuste virou SALDO de passos: qualquer inteiro serve, e o clamp ternário
  // de antes apagaria um segundo corte. Valores antigos (-1, 0, 1) já são
  // saldos válidos, então não há o que converter — só o que parar de truncar.
  if (typeof S.ajuste !== 'number' || !isFinite(S.ajuste)) S.ajuste = 0;
  S.ajuste = Math.round(S.ajuste);
  if (!Array.isArray(S.ajusteHist)) S.ajusteHist = [];
  if (!Array.isArray(S.gordura)) S.gordura = [];
  if (!S.quadro || typeof S.quadro !== 'object') S.quadro = null;
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

// ---------- 6 -> 7: o histórico das estações de HYROX ----------
// Ele pediu para zerar: os registros do sábado foram feitos enquanto o dia
// ainda era modelado como prescrição de hipertrofia — com meta de 16 séries e
// linguagem de RIR num remo de 1000 m — e nenhum deles quer dizer o que
// aparenta. Zerar aqui é mais honesto que carregar número que ninguém vai ler.
//
// **Lápide por entrada, e é isso que faz a migração funcionar.** Um `delete`
// seco no mapa local seria desfeito na primeira sincronização: a fusão une as
// duas listas pela chave natural, e o que só existe de um lado VOLTA. O que
// diz "isto morreu de propósito" é o carimbo em `S.apagados`, com a mesma
// chave que `uneLista` consulta.
//
// A PRESENÇA não é tocada: `S.done` continua inteiro, e com ela a rotação, a
// contagem de ciclo, a cadência da semana e o calendário. Ele disse que não há
// nada de importante nos EXERCÍCIOS; ter treinado no sábado é outro fato.

/** O que a migração 6→7 apagou, para o app poder contar. */
export interface Resultado7 {
  /** quantos exercícios ficaram sem histórico */
  exercicios: number;
  /** quantas entradas foram apagadas */
  entradas: number;
}

export function migraPlano7(S: Estado): Resultado7 | null {
  if (S.plano >= 7) return null;
  const r: Resultado7 = { exercicios: 0, entradas: 0 };
  const agora = Date.now();
  const mortos = (S as Estado & { apagados?: Record<string, number> }).apagados
    || ((S as Estado & { apagados?: Record<string, number> }).apagados = {});

  SIMULACAO_HYROX.forEach(function (ex) {
    const idEx = slugEx(ex.n);
    const lista = (S.logs || {})[idEx];
    if (!lista || !lista.length) return;
    lista.forEach(function (l) { mortos[chaveDeLog(idEx, l)] = agora; });
    r.exercicios++;
    r.entradas += lista.length;
    delete S.logs[idEx];
  });

  S.plano = 7;
  return r;
}

// ---------- 7 -> 8: o nome que era do horário ----------
// "Café da manhã / pós-treino" foi escrito quando o treino era SEMPRE às 6h15.
// O nome composto colava duas coisas: o horário (café da manhã) e o papel
// (pós-treino). Com o turno da tarde e o da noite, o papel migra para o almoço
// ou para o jantar, e o nome passa a mentir na refeição das 8h.
//
// A migração tira só a metade que virou calculada. `posTreinoDe` devolve o
// papel, e a tela o mostra como selo na refeição que o recebeu.
//
// Compara com a string EXATA da época — congelada aqui, como manda a regra:
// migração lê dado congelado, nunca o código de hoje. Se ele já tinha
// renomeado a refeição, o nome dele fica.

/** O nome que a refeição das 8h tinha até o plano 7. */
export const NOME_POS_PLANO_7 = 'Café da manhã / pós-treino';

/** O que a migração 7→8 renomeou. */
export interface Resultado8 { renomeou: 0 | 1; }

export function migraPlano8(S: Estado): Resultado8 | null {
  if (S.plano >= 8) return null;
  const r: Resultado8 = { renomeou: 0 };
  const plano = S.comida && S.comida.plano;
  if (Array.isArray(plano)) {
    plano.forEach(function (ref) {
      if (ref && ref.id === 'pos' && ref.n === NOME_POS_PLANO_7) {
        ref.n = 'Café da manhã';
        r.renomeou = 1;
      }
    });
  }
  S.plano = 8;
  return r;
}

// ---------- 8 -> 9: a revisão do dia B ----------
//
// O treinador revisou a terça em setembro de 2026: ênfase a posteriores e
// glúteo, e menos orçamento direto de quadríceps — que segue sendo ponto forte
// relativo. Quatro mudanças, uma delas troca de exercício.
//
// A migração aplica DELTA, e nunca reescreve o dia. Só mexe no slot que ainda
// está exatamente como o programa antigo prescrevia; se ele já tinha mudado
// aquele exercício na mão e promovido ao oficial, o número dele fica. É a
// mesma regra da 7→8, e é o que separa "o treinador mudou" de "eu apago o que
// você decidiu".
//
// Os valores antigos estão congelados aqui, como manda a regra: migração lê
// dado da época, nunca o código de hoje — que já vem alterado.

/** O que o dia B prescrevia até o plano 8, no que esta revisão tocou. */
export const REVISAO_B_PLANO_8 = {
  troca: { de: 'pendulum-squat', para: 'agachamento-no-smith', sDe: 3, sPara: 2 },
  series: [
    { id: 'cadeira-flexora-sentada', de: 3, para: 4 },
    { id: 'cadeira-extensora', de: 2, para: 1 },
    { id: 'elevacao-pelvica-na-maquina', de: 2, para: 3 }
  ]
};

/** O que a migração 8→9 mexeu. */
export interface Resultado9 { trocou: 0 | 1; series: number; }

export function migraPlano9(S: Estado): Resultado9 | null {
  if (S.plano >= 9) return null;
  const r: Resultado9 = { trocou: 0, series: 0 };
  const b = S.prog && S.prog['B'];

  if (b && Array.isArray(b.ex)) {
    const t = REVISAO_B_PLANO_8.troca;
    b.ex.forEach(function (sl) {
      if (sl.id === t.de && sl.s === t.sDe) { sl.id = t.para; sl.s = t.sPara; r.trocou = 1; }
    });
    REVISAO_B_PLANO_8.series.forEach(function (m) {
      b.ex.forEach(function (sl) {
        if (sl.id === m.id && sl.s === m.de) { sl.s = m.para; r.series++; }
      });
    });
  }

  S.plano = 9;
  return r;
}

// ---------- 9 -> 10: o corpo aberto, a hora da marca e a lista que espera ----------
//
// Uma migração só para cinco mudanças de dado persistido, porque o caro aqui
// não é migrar: é esquecer um dos portões — tipo, migração com fixture, regra
// de fusão, as duas listas brancas da cópia, `tsc` limpo. Duas migrações
// pagariam os cinco duas vezes.
//
// Das cinco, **duas são reformatação de dado existente**, e é por elas que esta
// função precisa existir:
//
// 1. `S.dia.done` era `Record<string, 1>` e passa a ser `Record<string,
//    number>` — o instante da marca. Não é campo novo: é convergir o dia
//    corrente na forma que `DiaComidaHist.done` já tinha, e pelo mesmo motivo
//    escrito lá ("instante e não `1` porque é o que permite fundir… e desmarcar
//    precisa de lápide").
//
// 2. `S.body` ganha as cinco chaves da bioimpedância. Pelo contrato de
//    `normalizaEstado()`, campo novo e vazio receberia padrão lá e dispensaria
//    migração; entram aqui de propósito, para o bump de versão ser a prova de
//    que as cinco existem e para a fixture cobri-las.
//
// 3. `S.promoPendente` era um DOCUMENTO — uma pergunta guardada, ou `null` — e
//    passa a ser coleção com chave natural (`sid`), lápide e teto. Ver
//    `listaDePromo` logo abaixo, e `Estado.promoPendente` para o porquê.
//
// As outras duas — qual refeição saiu do plano (`dia.como`) e "não contei a
// água" (`dia.aguaNaoContada`) — são campos OPCIONAIS cuja ausência já tem o
// significado certo: ausente é "comeu o que estava prescrito" e "a água foi
// contada". Não há byte a reformatar, e inventar um aqui seria afirmar sobre o
// passado o que ninguém registrou.
//
// A hora que a marca antiga não tem: o literal `1` não carrega nada, e o app
// nunca gravou a hora de cada refeição no dia corrente. Em vez de carimbar o
// instante da migração — que faria a marca nascer mais nova que qualquer
// lápide escrita antes dela, e ressuscitaria o que o outro aparelho desmarcou
// —, a migração usa a MEIA-NOITE do dia, que é o instante mais antigo
// compatível com a data. Conferido: nenhum caminho do app escreve lápide de
// `chaveDeRefeicaoFeita` hoje, então para o dado que existe a escolha é
// inobservável; ela vale para quando a lápide passar a ser escrita.

/** O que a migração 9→10 mexeu. */
export interface Resultado10 {
  /** marcas do dia corrente que ganharam instante */
  marcas: number;
  /** dias do histórico que tinham marca sem instante */
  dias: number;
  /** chaves de medida criadas em `S.body` */
  chaves: number;
  /** perguntas de programa que viraram entrada de coleção */
  promos: number;
}

/**
 * A pergunta guardada, na forma de coleção.
 *
 * Até o plano 9 `S.promoPendente` era um documento — uma pergunta, ou `null` —
 * e por isso não tinha chave natural nem regra de fusão. Esta função é a
 * conversão, e vive aqui e não em `normalizaEstado()` por um motivo de ORDEM:
 * `normalizaEstado` roda ANTES das migrações, nos dois caminhos (boot e
 * importação), e se ele tratasse o objeto antigo como "forma inválida" a
 * pergunta guardada seria apagada antes de alguém poder convertê-la.
 *
 * O `sid` que falta: a pergunta antiga não carregava o da sessão. A migração usa
 * `t`, o instante do fecho, como identidade — ele está no dado, então os dois
 * aparelhos derivam a MESMA chave do MESMO registro, que é tudo que a fusão
 * pede. Se os dois tiverem perguntas diferentes guardadas, os `t` diferem e as
 * duas sobrevivem: hoje uma das duas se perde, e é o defeito.
 */
export function listaDePromo(v: unknown): PromoPendente[] {
  if (Array.isArray(v)) {
    return (v as PromoPendente[]).filter(function (p) {
      return p && typeof p === 'object' && Array.isArray(p.mods) && p.mods.length;
    });
  }
  const g = v as PromoPendente | null;
  if (!g || typeof g !== 'object' || !Array.isArray(g.mods) || !g.mods.length) return [];
  return [{
    sid: typeof g.sid === 'number' ? g.sid : g.t,
    day: g.day, t: g.t, mods: g.mods,
    resumoMods: Array.isArray(g.resumoMods) ? g.resumoMods : [],
    m: typeof g.m === 'number' ? g.m : g.t
  }];
}

/** Meia-noite local de 'AAAA-MM-DD'. `null` quando a data não é legível. */
function meiaNoiteDe(d: string): number | null {
  if (typeof d !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(d)) return null;
  const t = new Date(d + 'T00:00:00').getTime();
  return isFinite(t) ? t : null;
}

/**
 * Converte as marcas de um `done` para instante.
 *
 * Só toca no que não é instante: `1` e qualquer coisa que não seja número
 * finito maior que 1. Uma marca com instante de verdade — as que `fechaDia`
 * gravou — fica como está, porque ela é o dado e a migração não sabe mais que
 * ela.
 */
function instantesDoDone(done: Record<string, number>, quando: number): number {
  let n = 0;
  Object.keys(done || {}).forEach(function (k) {
    const v = done[k];
    if (typeof v === 'number' && isFinite(v) && v > 1) return;
    done[k] = quando;
    n++;
  });
  return n;
}

export function migraPlano10(S: Estado): Resultado10 | null {
  if (S.plano >= 10) return null;
  const r: Resultado10 = { marcas: 0, dias: 0, chaves: 0, promos: 0 };

  // 1 · o instante da marca no dia corrente
  if (S.dia && S.dia.data) {
    const quando = meiaNoiteDe(S.dia.data);
    if (quando != null && S.dia.done) {
      r.marcas = instantesDoDone(S.dia.done as Record<string, number>, quando);
    }
  }

  // e, por garantia, no histórico: `fechaDia` sempre gravou instante, mas um
  // backup fundido por um build antigo pode ter trazido o `1` do dia aberto
  // para dentro de uma linha fechada, e `1` é 1970 — toda lápide o mata
  if (Array.isArray(S.comidaHist)) {
    (S.comidaHist as DiaComidaHist[]).forEach(function (h) {
      if (!h || !h.d || !h.done) return;
      const quando = meiaNoiteDe(h.d);
      if (quando == null) return;
      if (instantesDoDone(h.done, quando)) r.dias++;
    });
  }

  // 2 · as cinco chaves da bioimpedância
  if (S.body && typeof S.body === 'object') {
    const body = S.body as unknown as Record<string, Marca[]>;
    MARCAS_DA_BIO.forEach(function (k) {
      if (Array.isArray(body[k])) return;
      body[k] = [];
      r.chaves++;
    });
  }

  // 3 · a pergunta guardada vira coleção com chave natural
  const antes = Array.isArray(S.promoPendente) ? -1 : (S.promoPendente ? 1 : 0);
  S.promoPendente = listaDePromo(S.promoPendente);
  if (antes === 1 && S.promoPendente.length) r.promos = S.promoPendente.length;

  S.plano = 10;
  return r;
}

// ---------- 10 -> 11: a ceia ----------
//
// O dono respondeu a ceia (14.13 era "sim, e é assunto do nutricionista"; a
// resposta de agora diz O QUE é): copo de leite com duas colheres de Neston.
//
// Por que isto é migração, e não só uma linha em `PLANO_BASE`: o plano é
// DOCUMENTO PERSISTIDO. `planoDeComida()` o semeia da base uma vez, quando o
// estado nasce (`if (!S.comida.plano) S.comida.plano = clone(PLANO_BASE)`), e a
// partir daí o plano é dele — editável, e divergindo conforme ele decide.
// Mudar a base alcança aparelho novo e NÃO alcança o dele.
//
// Duas coisas que esta migração NÃO precisa fazer, e é bom dizer por quê:
//
// - **O Neston não entra aqui.** O catálogo de alimentos é DERIVADO a cada
//   render, de `ALIMENTOS_BASE` mais o que ele cadastrou, menos o que ele
//   escondeu (`catalogoAlimentos()` em `src/main.jsx`). Alimento do código
//   chega ao aparelho pelo build, sem migração. Se ele tiver cadastrado um
//   `neston` próprio, o dele vence na mesma função — e isso é o certo.
// - **Não reconstruir o plano.** A migração INSERE uma refeição; ela não
//   compara o plano guardado com a base, não corrige nome, horário nem item que
//   ele tenha mexido, e não reordena nada. Presumir que o plano guardado é
//   igual à base seria apagar as edições dele, que é o oposto da regra 2.
//
// A cópia congelada abaixo não referencia `PLANO_BASE` de propósito: migração lê
// o dado da época, nunca o código de hoje — se amanhã o nutricionista revisar a
// ceia, a revisão é uma migração nova e esta continua inserindo o que o plano 11
// prescrevia. Um teste de domínio cobra que as duas cópias descrevam a mesma
// ceia HOJE, que é o que impede as duas populações (aparelho migrado e aparelho
// novo) de nascerem diferentes.

/** A ceia, como o plano 11 a prescreveu. Congelada: não lê `PLANO_BASE`. */
export const CEIA_PLANO_11: Refeicao = {
  id: 'ceia', t: '21:30', n: 'Ceia', tag: 'ANTES DE DORMIR', quando: 'sempre',
  nota: 'Copo de leite com duas colheres de Neston. O copo de 250 ml é a porção de leite que o resto deste plano já usa; as duas colheres saem da porção do rótulo, que declara 30 g em CINCO colheres de sopa — 6 g por colher.',
  itens: [{ f: 'leite', q: 250 }, { f: 'neston', q: 12 }]
};

/** O que a migração 10→11 mexeu. */
export interface Resultado11 {
  /** 1 quando a ceia foi inserida no plano dele */
  inseriu: 0 | 1;
}

export function migraPlano11(S: Estado): Resultado11 | null {
  if (S.plano >= 11) return null;
  const r: Resultado11 = { inseriu: 0 };

  const plano = S.comida && S.comida.plano;
  // Sem plano guardado não há o que migrar: `planoDeComida()` vai semear da
  // base, que já tem a ceia. Inserir aqui criaria um plano de uma refeição só.
  if (Array.isArray(plano)) {
    const tem = plano.some(function (ref) { return ref && ref.id === CEIA_PLANO_11.id; });
    if (!tem) {
      // No fim da lista: a ceia é a última do relógio entre as refeições da
      // base, e `refeicoesDeHoje` ordena por horário de qualquer forma.
      plano.push(JSON.parse(JSON.stringify(CEIA_PLANO_11)));
      r.inseriu = 1;
    }
    // Já tinha uma refeição com este id: não duplica E NÃO SOBRESCREVE. Pode
    // ser a ceia que ele mesmo criou, com o horário e os itens dele, e a
    // migração não tem autoridade sobre o que ele escreveu.
  }

  S.plano = 11;
  return r;
}
