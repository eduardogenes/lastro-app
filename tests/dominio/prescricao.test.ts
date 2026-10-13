// O vencimento da mudança do dia: quando aquele treino volta.
//
// A decisão do dono é que a mudança vence POR POSIÇÃO e não por prazo em dias
// (5.a' P1), e é isso que estes casos cobram. A armadilha que a conta evita é
// contar em dias corridos: a sequência deste app é sequência — A, B, C, D, E,
// HX e volta ao A —, e um domingo de descanso não gasta posição nenhuma.

import { test } from 'vitest';
import assert from 'node:assert';
import { quandoAquelaVolta, venceuPorPosicao, HORIZONTE_PADRAO } from '../../src/dominio/prescricao';
import type { Cadencia } from '../../src/dominio/dia';

const ROT = ['A', 'B', 'C', 'D', 'E', 'HX'];
const DIA = 86400000;

/** Semana sem descanso nenhum: a conta fica em dias corridos, de propósito. */
const TODOS: Cadencia[] = ['treino', 'treino', 'treino', 'treino', 'treino', 'treino', 'treino'];
/** A cadência padrão do app: domingo (índice 0) descansa. */
const DOMINGO_FOLGA: Cadencia[] =
  ['descanso', 'treino', 'treino', 'treino', 'treino', 'treino', 'treino'];

/** Uma segunda-feira às 7h, para o índice da semana ser previsível. */
function segunda(): number {
  const d = new Date(2026, 0, 5, 7, 0, 0, 0);   // 5 de janeiro de 2026 é segunda
  assert.strictEqual(d.getDay(), 1, 'a fixture precisa mesmo ser segunda');
  return d.getTime();
}

test('sem descanso na semana, a volta é em dias corridos', () => {
  const de = segunda();
  // hoje o próximo é o A: o A volta HOJE.
  assert.strictEqual(quandoAquelaVolta('A', ROT, 'A', TODOS, de), de);
  // o B é amanhã, o HX em cinco dias
  assert.strictEqual(quandoAquelaVolta('B', ROT, 'A', TODOS, de), de + 1 * DIA);
  assert.strictEqual(quandoAquelaVolta('HX', ROT, 'A', TODOS, de), de + 5 * DIA);
});

test('o alvo que acabou de passar volta em uma rotação inteira', () => {
  // O caso real: a mudança nasceu na sessão do A que acabou de fechar, então o
  // próximo treino é o B. O A só volta depois de B, C, D, E e HX — seis dias de
  // treino à frente, e é esse o vencimento.
  const de = segunda();
  assert.strictEqual(quandoAquelaVolta('A', ROT, 'B', TODOS, de), de + 5 * DIA,
    'cinco dias à frente: o B é hoje, e o A é a sexta posição a partir dele');
});

test('o domingo de descanso NÃO gasta posição da rotação', () => {
  // A armadilha inteira num caso, e ele tem que começar numa TERÇA para
  // discriminar: partindo da segunda, o alcance máximo da rotação (cinco
  // posições à frente) é o sábado, e a caminhada nem chega ao domingo — as duas
  // contas dariam o mesmo e o caso ficaria verde sem provar nada. Da terça com
  // o B na frente, o A é a sexta posição, e aí o domingo entra no meio.
  const terca = new Date(2026, 0, 6, 7, 0, 0, 0);
  assert.strictEqual(terca.getDay(), 2, 'a fixture precisa mesmo ser terça');
  const de = terca.getTime();

  assert.strictEqual(quandoAquelaVolta('A', ROT, 'B', TODOS, de), de + 5 * DIA,
    'em dias corridos seriam cinco dias: cairia no domingo');
  assert.strictEqual(quandoAquelaVolta('A', ROT, 'B', DOMINGO_FOLGA, de), de + 6 * DIA,
    'com o domingo de folga, SEIS: o descanso não gasta posição, e a volta ' +
    'escorrega para a segunda');
});

test('o alvo vence HOJE quando hoje é o dia dele', () => {
  // Passo 4 do fluxo do vencimento: "na manhã do dia em que aquele treino
  // volta", o Agora avisa. A conta tem que dizer HOJE, e não a volta seguinte.
  const de = segunda();
  assert.strictEqual(quandoAquelaVolta('C', ROT, 'C', DOMINGO_FOLGA, de), de);
});

test('num dia de DESCANSO, a conta não vence hoje — espera o próximo treino', () => {
  // Domingo, com o A na frente: a mudança do A não vence no domingo, porque o
  // treino não volta num dia em que não há treino.
  const domingo = new Date(2026, 0, 4, 7, 0, 0, 0);
  assert.strictEqual(domingo.getDay(), 0, 'a fixture precisa mesmo ser domingo');
  const de = domingo.getTime();
  assert.strictEqual(quandoAquelaVolta('A', ROT, 'A', DOMINGO_FOLGA, de), de + 1 * DIA,
    'vence na segunda, que é o próximo dia de treino');
});

test('padrão semanal sem nenhum treino não inventa data', () => {
  // `null` e não um palpite: anunciar que uma mudança vence quando ninguém sabe
  // se vence é afirmar o que não se sabe, e é o oposto da regra de procedência
  // deste app.
  const nada: Cadencia[] = ['descanso', 'descanso', 'descanso', 'descanso',
                            'descanso', 'descanso', 'descanso'];
  assert.strictEqual(quandoAquelaVolta('A', ROT, 'A', nada, segunda()), null);
});

test('alvo fora da rotação não produz vencimento', () => {
  // Acontece de verdade: a rotação dele pode ter mudado desde que a mudança
  // nasceu, e a letra antiga não existir mais.
  assert.strictEqual(quandoAquelaVolta('Z', ROT, 'A', TODOS, segunda()), null);
  assert.strictEqual(quandoAquelaVolta('A', ROT, 'Z', TODOS, segunda()), null,
    'e nem a próxima fora dela: não há de onde começar a contar');
});

test('entradas vazias não quebram, e também não inventam', () => {
  assert.strictEqual(quandoAquelaVolta('', ROT, 'A', TODOS, segunda()), null);
  assert.strictEqual(quandoAquelaVolta('A', [], 'A', TODOS, segunda()), null);
  assert.strictEqual(quandoAquelaVolta('A', ROT, 'A', TODOS, segunda(), 0), null,
    'horizonte zero não percorre dia nenhum');
});

test('o horizonte é o limite, e ele cobre uma rotação inteira com folga', () => {
  // 60 dias. A rotação tem 6 posições e o pior caso real — uma semana com um só
  // dia de treino — precisaria de 6 semanas para fechar uma volta. O horizonte
  // existe para a conta terminar, não para recusar caso legítimo.
  assert.ok(HORIZONTE_PADRAO >= 42,
    'abaixo de 42 dias uma rotação de 6 com um treino por semana não fecharia: ' +
    HORIZONTE_PADRAO);
  const umPorSemana: Cadencia[] =
    ['descanso', 'treino', 'descanso', 'descanso', 'descanso', 'descanso', 'descanso'];
  const de = segunda();
  assert.strictEqual(quandoAquelaVolta('A', ROT, 'B', umPorSemana, de), de + 35 * DIA,
    'cinco semanas à frente, uma posição por semana');
});

// ---------- o vencimento como FATO, e não como conta sobre o relógio ----------

test('aquele treino voltar é uma sessão daquele dia registrada DEPOIS', () => {
  const nasceu = segunda();
  const sessoes = [{ day: 'A', t: nasceu + 6 * DIA }];
  assert.strictEqual(venceuPorPosicao('A', nasceu, sessoes), true);
  assert.strictEqual(venceuPorPosicao('B', nasceu, sessoes), false,
    'outro dia voltar não vence a mudança do A');
});

test('a sessão que criou a mudança não a vence', () => {
  // A mudança é copiada para a fila NO FECHO, então o instante dela é posterior
  // ao início da sessão que a gerou. Sem esta propriedade, toda mudança nasceria
  // vencida — e o app diria "você não decidiu" no segundo em que ela apareceu.
  const inicio = segunda();
  const nasceu = inicio + 70 * 60000;           // o fecho, 70 min depois
  assert.strictEqual(venceuPorPosicao('A', nasceu, [{ day: 'A', t: inicio }]), false);
});

test('sessão avulsa não é aquele treino voltando', () => {
  // Treino fora do plano não ocupa posição na rotação, então não faz o dia
  // "voltar" — é a mesma razão por que ele não entra na contagem de sequência.
  const nasceu = segunda();
  assert.strictEqual(
    venceuPorPosicao('A', nasceu, [{ day: 'A', t: nasceu + DIA, livre: 1 }]), false);
  assert.strictEqual(
    venceuPorPosicao('A', nasceu, [{ day: 'A', t: nasceu + DIA, livre: 0 }]), true,
    '`livre: 0` é sessão do plano e vence');
});

test('sem sessão nenhuma, nada vence', () => {
  assert.strictEqual(venceuPorPosicao('A', segunda(), []), false);
  assert.strictEqual(venceuPorPosicao('A', segunda(), null as never), false);
  assert.strictEqual(venceuPorPosicao('', segunda(), [{ day: '', t: Date.now() }]), false,
    'dia vazio não casa com dia vazio: não há treino sem letra');
});
