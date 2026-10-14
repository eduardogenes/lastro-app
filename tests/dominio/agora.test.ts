// A regra do cartão de cima: sete degraus e as colisões que a frente 1 resolveu
// uma a uma (§5 de `docs/redesign/09-frente1-sessao.md`).
//
// Cada caso aqui corresponde a uma linha escrita daquela seção, e os que são
// colisão dizem qual. A ordem importa mais que qualquer degrau isolado: a regra
// é uma cascata, e um degrau que vence quando não devia é um defeito que a tela
// não denuncia — ela mostra UM cartão, e o cartão errado parece certo.

import { test } from 'vitest';
import assert from 'node:assert';
import { cartaoDeCima, JANELA_REFEICAO } from '../../src/dominio/agora';
import type { FatosDoDia } from '../../src/dominio/agora';

const H = (h: number, m?: number) => h * 60 + (m || 0);

/** O plano de comida de bolso: cinco refeições, horas redondas de ler. */
const PLANO = [
  { id: 'cafe', hora: H(6, 0), marcada: false },
  { id: 'almoco', hora: H(12, 30), marcada: false },
  { id: 'lanche', hora: H(16, 0), marcada: false },
  { id: 'jantar', hora: H(20, 0), marcada: false },
  { id: 'ceia', hora: H(22, 30), marcada: false }
];

function fatos(extra?: Partial<FatosDoDia>): FatosDoDia {
  return Object.assign({
    sessao: null,
    confirmar: null,
    treino: null,
    refeicoes: PLANO.map(r => Object.assign({}, r)),
    agora: H(10, 0)
  }, extra || {}) as FatosDoDia;
}

/** O mesmo plano com algumas refeições marcadas. */
function marcando(ids: string[], agora: number): FatosDoDia {
  return fatos({
    agora: agora,
    refeicoes: PLANO.map(r => Object.assign({}, r, { marcada: ids.indexOf(r.id) >= 0 }))
  });
}

// ---------- regra 1 ----------

test('a sessão aberta ganha de tudo', () => {
  // É o único estado em que o topo competiria com um modo que já está aberto, e
  // é o estado mais comum medido: de 42% a 59% das sessões fecham sem ele.
  // Aqui ela compete com TRÊS degraus de uma vez — a confirmação de ontem, o
  // treino de hoje dentro da janela e uma refeição no momento exato.
  const c = cartaoDeCima(fatos({
    sessao: { dia: 'A', guardadas: 7, prescritas: 18, esquecida: false },
    confirmar: { dia: 'D', inicio: 1, fim: 2 },
    treino: { dia: 'A', fimDaJanela: H(23, 0), palpite: false, feito: false, aula: false },
    agora: H(6, 0)
  }));
  assert.deepStrictEqual(c,
    { k: 'sessao', dia: 'A', guardadas: 7, prescritas: 18, pergunta: false });
});

test('colisão: parada de 1h30 vira pergunta e MANTÉM o topo', () => {
  // A faixa não cede o lugar quando vira pergunta: quem esqueceu de finalizar
  // costuma ter esquecido olhando justamente para o treino.
  const c = cartaoDeCima(fatos({
    sessao: { dia: 'B', guardadas: 3, prescritas: 15, esquecida: true },
    agora: H(12, 30)
  }));
  assert.deepStrictEqual(c,
    { k: 'sessao', dia: 'B', guardadas: 3, prescritas: 15, pergunta: true },
    'mesmo cartão, com `pergunta` ligado: quem desenha troca o texto, não o lugar');
});

// ---------- regra 2 ----------

test('a sessão que fechou sozinha ganha do treino de hoje', () => {
  // É confirmação sobre um registro JÁ ESCRITO, e o número escrito está
  // aproximado até ele dizer. O treino de hoje pode esperar; o número não.
  const c = cartaoDeCima(fatos({
    confirmar: { dia: 'D', inicio: 1000, fim: 2000 },
    treino: { dia: 'A', fimDaJanela: H(9, 0), palpite: false, feito: false, aula: false },
    agora: H(6, 15)
  }));
  assert.deepStrictEqual(c, { k: 'confirmar', dia: 'D', inicio: 1000, fim: 2000 });
});

// ---------- regra 3 ----------

test('enquanto o treino não aconteceu, o treino ganha da refeição', () => {
  // A decisão do dono (D4). A refeição aqui está na janela de 30 min — o caso
  // mais forte contra o treino — e perde de propósito: o pré-treino desce para
  // a linha de baixo e reaparece dentro do descanso, que é onde ele de fato é
  // marcado.
  const c = cartaoDeCima(fatos({
    treino: { dia: 'A', fimDaJanela: H(8, 0), palpite: false, feito: false, aula: false },
    agora: H(6, 0)
  }));
  assert.deepStrictEqual(c, { k: 'treino', dia: 'A', palpite: false });
});

test('colisão: treino à noite cai na mesma regra, sem emenda', () => {
  // 18h15: às 10h da manhã o treino já ganhava, e às 19h continua ganhando —
  // o dia se reorganiza em volta da janela, e nada aqui sabe que horas são "de
  // manhã". A refeição das 20h perde pelo mesmo degrau.
  const noite = { dia: 'B', fimDaJanela: H(19, 30), palpite: false, feito: false, aula: false };
  assert.deepStrictEqual(cartaoDeCima(fatos({ treino: noite, agora: H(10, 0) })),
    { k: 'treino', dia: 'B', palpite: false }, 'de manhã, o treino da noite já é o topo');
  assert.deepStrictEqual(cartaoDeCima(fatos({ treino: noite, agora: H(19, 29) })),
    { k: 'treino', dia: 'B', palpite: false }, 'um minuto antes do fim da janela');
});

test('a janela do treino fecha NO minuto dela, e aí a refeição da janela assume', () => {
  // A fronteira exata, porque é ela que decide entre os degraus 3 e 4 — e um
  // erro de um minuto aqui é invisível na tela. Às 12h05 o almoço das 12h30
  // está dentro da janela de 30 min.
  const t = { dia: 'A', fimDaJanela: H(12, 5), palpite: false, feito: false, aula: false };
  assert.strictEqual(cartaoDeCima(fatos({ treino: t, agora: H(12, 5) }))!.k, 'treino',
    'no minuto do fim, o treino ainda é o topo');
  assert.strictEqual(cartaoDeCima(fatos({ treino: t, agora: H(12, 6) }))!.k, 'refeicao',
    'um minuto depois, a refeição assume');
});

test('colisão: o treino previsto por palpite diz que é palpite', () => {
  // A regra nunca inventa. Sem turno declarado o previsto vem do padrão
  // semanal, e o parecer mediu o preço de tratar palpite como fato: ~3 marcas
  // falsas de buraco por semana.
  const c = cartaoDeCima(fatos({
    treino: { dia: 'C', fimDaJanela: H(9, 0), palpite: true, feito: false, aula: false },
    agora: H(7, 0)
  }));
  assert.deepStrictEqual(c, { k: 'treino', dia: 'C', palpite: true });
});

test('colisão: no dia da aula, o cartão é o da aula', () => {
  // A aula É a sessão daquele dia — a 6ª posição da sequência, não "o sábado".
  // Entra pelo mesmo degrau 3, e o cartão dela é um botão só: "Fiz a aula".
  const c = cartaoDeCima(fatos({
    treino: { dia: 'AULA', fimDaJanela: H(11, 0), palpite: false, feito: false, aula: true },
    agora: H(9, 30)
  }));
  assert.deepStrictEqual(c, { k: 'aula', dia: 'AULA' });
});

test('colisão: treino já feito encerra a regra 3, mesmo dentro da janela', () => {
  // Dois treinos no mesmo dia são possíveis, e o segundo volta a ganhar pela
  // mesma regra quando ele o começa — pela sessão aberta, que é o degrau 1.
  const c = cartaoDeCima(fatos({
    treino: { dia: 'A', fimDaJanela: H(23, 0), palpite: false, feito: true, aula: false },
    agora: H(12, 15)
  }));
  assert.deepStrictEqual(c, { k: 'refeicao', id: 'almoco', hora: H(12, 30), janela: true },
    'o treino saiu da disputa e a refeição da janela assume');
});

test('colisão: em dia de descanso a refeição ganha por AUSÊNCIA, não por regra', () => {
  // Sem treino não há degrau 3 para vencer. A distinção importa: nada aqui
  // "decidiu" que a comida é mais importante.
  const c = cartaoDeCima(fatos({ treino: null, agora: H(5, 45) }));
  assert.deepStrictEqual(c, { k: 'refeicao', id: 'cafe', hora: H(6, 0), janela: true });
});

// ---------- regra 4: a refeição, e só para frente ----------

test('a refeição do momento é a próxima do plano dentro de 30 min', () => {
  const c = cartaoDeCima(marcando(['cafe'], H(12, 5)));
  assert.deepStrictEqual(c, { k: 'refeicao', id: 'almoco', hora: H(12, 30), janela: true },
    '25 min à frente está dentro da janela');
  assert.strictEqual(JANELA_REFEICAO, 30, 'a janela é de 30 min, do protótipo');
});

test('a janela de 30 min inclui o trigésimo minuto e exclui o seguinte', () => {
  // A fronteira: dentro, o cartão; um minuto fora, nenhum cartão — a refeição
  // à frente é linha do dia (a D, `agora-descanso.html`, estados 1 e 3).
  const dentro = cartaoDeCima(marcando(['cafe'], H(12, 0)));
  assert.strictEqual(dentro!.k === 'refeicao' && dentro.janela, true, '30 min: dentro');
  assert.strictEqual(cartaoDeCima(marcando(['cafe'], H(11, 59))), null, '31 min: sem cartão');
  assert.strictEqual(JANELA_REFEICAO, 30);
});

test('a refeição da hora EXATA conta como à frente', () => {
  // Zero minuto à frente é à frente: a refeição está acontecendo agora, e
  // excluí-la deixaria o topo sem o cartão justamente no minuto dela.
  const c = cartaoDeCima(marcando([], H(6, 0)));
  assert.deepStrictEqual(c, { k: 'refeicao', id: 'cafe', hora: H(6, 0), janela: true });
});

test('o que passou sem marca NÃO volta ao topo — é a correção da regra da D', () => {
  // A regra escrita da direção D dizia "se não houver nada à frente, é a última
  // que passou sem marca", e ela se virava contra si mesma um segundo depois de
  // marcar: marcado o lanche das 16h, o almoço das 12h30 voltava ao topo como
  // se fosse agora. Aqui o almoço ficou sem marca e o topo segue em frente — e,
  // com o jantar a quase 4 horas, se cala.
  assert.strictEqual(cartaoDeCima(marcando(['cafe', 'lanche'], H(16, 5))), null,
    'nem o almoço, que passou, nem o jantar, que está longe');
  assert.deepStrictEqual(cartaoDeCima(marcando(['cafe', 'lanche'], H(19, 40))),
    { k: 'refeicao', id: 'jantar', hora: H(20, 0), janela: true }, 'o jantar, quando chega a janela dele');
});

// ---------- regra 5: nada na janela, algo à frente ----------

test('nada na janela, não há cartão: o que está à frente é linha do dia', () => {
  // Aqui havia uma leitura minha ("o cartão é a próxima coisa do dia"), e a
  // terceira entrega da D a desfez: às 10h40 de um domingo, com o almoço às
  // 12h30, "nenhum cartão" (`agora-descanso.html`, estado 1). O exemplo das
  // 5h20 do momento 2 não precisava dela: o pré-treino estava a 25 min.
  assert.strictEqual(cartaoDeCima(marcando([], H(10, 40))), null);
  assert.strictEqual(cartaoDeCima(marcando([], H(5, 20))), null, 'o café das 6h a 40 min: ainda não');
  assert.strictEqual(cartaoDeCima(marcando([], H(5, 30)))!.k, 'refeicao', 'a 30 min, sim');
});

test('meio-dia e quarenta com o almoço sem marca: nem o almoço, nem o lanche', () => {
  // O almoço das 12h30 passou sem marca: ele é linha, nunca o cartão. O lanche
  // das 16h está fora da janela. A tela fica com as linhas do dia (a D,
  // `agora-descanso.html`, estado 3: "de novo, nenhum cartão").
  assert.strictEqual(cartaoDeCima(marcando(['cafe'], H(12, 40))), null);
});

// ---------- regra 6: o dia resolvido ----------

test('dia resolvido: o topo confirma a última marca', () => {
  // Para a tela não ficar muda quando tudo foi feito. "A última" é a de maior
  // hora no plano, não a de marcação mais recente: o cartão confirma o fim do
  // dia, e remarcar o café às 23h não faz do café o fim do dia.
  const c = cartaoDeCima(fatos({
    treino: { dia: 'A', fimDaJanela: H(9, 0), palpite: false, feito: true, aula: false },
    refeicoes: PLANO.map(r => Object.assign({}, r, { marcada: true })),
    agora: H(23, 0)
  }));
  assert.deepStrictEqual(c, { k: 'resolvido', id: 'ceia' });
});

test('dia resolvido exige o treino resolvido também', () => {
  // Tudo marcado, mas o treino previsto não aconteceu e a janela passou: o dia
  // não fechou. O cartão se cala — o que falta é a linha "Pôr hoje em dia", e o
  // app não cobra ninguém por um treino que não houve.
  const c = cartaoDeCima(fatos({
    treino: { dia: 'A', fimDaJanela: H(9, 0), palpite: false, feito: false, aula: false },
    refeicoes: PLANO.map(r => Object.assign({}, r, { marcada: true })),
    agora: H(23, 0)
  }));
  assert.strictEqual(c, null);
});

// ---------- regra 7: o silêncio, e ele é legítimo ----------

test('dia de descanso fora de qualquer janela não tem cartão', () => {
  // Está na regra: ficam a linha do dia, a água e a contagem dos 14 dias, e não
  // há cartão. A frente declarou que este estado não está desenhado em nenhum
  // dos nove HTML abertos — então a função responde `null` e quem desenha
  // decide, em vez de a regra inventar um cartão para preencher.
  const c = cartaoDeCima(marcando(['cafe', 'almoco', 'lanche', 'jantar'], H(23, 0)));
  assert.strictEqual(c, null, 'a ceia das 22h30 passou sem marca: nada à frente, dia não fechado');
});

test('dia sem plano de comida nenhum não quebra, e não inventa cartão', () => {
  assert.strictEqual(cartaoDeCima(fatos({ refeicoes: [] })), null);
  assert.strictEqual(cartaoDeCima(fatos({ refeicoes: undefined as never })), null,
    'lista ausente é tratada como vazia: a regra não é o lugar de validar o plano');
});

test('sem fatos nenhum, não há cartão', () => {
  assert.strictEqual(cartaoDeCima(null as never), null);
});
