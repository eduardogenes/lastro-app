// As migrações do formato do estado.
//
// Regra 2 do projeto: não quebrar dados salvos. Este é o único lugar do app
// onde um erro custa HISTÓRICO — não uma tela feia, não um número errado: anos
// de série registrada. Ganhou testes diretos por isso: aqui dá para varrer
// caso de borda sem o custo de subir o app, e por isso não há desculpa.

import { test } from 'vitest';
import assert from 'node:assert';
import {
  ARQUIVO, PLANO_1, migraPlano, migraPlano3, migraPlano4, migraPlano5
} from '../../src/dominio/migracoes';
import { EX_BASE, PROGRAMA, slugEx } from '../../src/dominio/programa';
import type { Estado, Log } from '../../src/dominio/tipos';
import { DIA, log } from './ajuda';

function estado(extra: Partial<Estado> = {}): Estado {
  return Object.assign({
    logs: {}, done: [], deload: false, draft: null, sessao: null, cardio: [],
    body: { peso: [], cintura: [] }, carga: {}, export: 0, plano: 1,
    prog: null, rot: null, ex: {}, mods: null, progLog: []
  } as Estado, extra);
}

const t = Date.now() - 10 * DIA;

// ---------- 1 -> 2 ----------

test('1→2 arquiva por NOME, não por posição', () => {
  // A chave era dia+posição. Trocar o programa faria o exercício novo herdar a
  // carga do antigo que ocupava aquela posição: o placeholder mentiria e o selo
  // de subir carga dispararia errado.
  const S = estado({ logs: { A0: [log([[30, 10]], { t })] } });
  const n = migraPlano(S);
  assert.strictEqual(n, 1);
  assert.deepStrictEqual(Object.keys(S.logs), [ARQUIVO + PLANO_1.A0]);
  assert.strictEqual(S.plano, 2);
});

test('1→2 junta o substituto no histórico do exercício dele', () => {
  const S = estado({ logs: {
    'A0': [log([[30, 10]], { t })],
    'A0~Supino inclinado com halteres': [log([[32, 10]], { t: t + DIA })]
  } });
  migraPlano(S);
  const chave = ARQUIVO + 'Supino inclinado com halteres';
  assert.strictEqual(S.logs[chave].length, 2, 'os dois caminhos levam ao mesmo exercício');
  assert.ok(S.logs[chave][0].t < S.logs[chave][1].t, 'e ficam em ordem cronológica');
});

test('1→2 descarta o que não faz mais sentido, e só isso', () => {
  const S = estado({
    logs: { A0: [log([[30, 10]], { t })] },
    carga: { A0: 'lado' },
    sessao: { day: 'A', inicio: t, ultima: t, sid: t },
    draft: { ex: {} },
    done: [{ day: 'A', t, sid: t, dur: 0 }]
  });
  migraPlano(S);
  assert.deepStrictEqual(S.carga, {}, 'a correção de tipo apontava para a posição antiga');
  assert.strictEqual(S.sessao, null, 'treino em andamento no plano velho não faz sentido');
  assert.strictEqual(S.draft, null);
  assert.strictEqual(S.done.length, 1, 'presença não se toca: o calendário fica intacto');
});

test('1→2 não mexe em chave que não é do plano 1', () => {
  const S = estado({ logs: { 'chave-estranha': [log([[10, 10]], { t })] } });
  assert.strictEqual(migraPlano(S), 0);
  assert.deepStrictEqual(Object.keys(S.logs), ['chave-estranha']);
});

test('1→2 não roda duas vezes', () => {
  const S = estado({ plano: 2, logs: { A0: [log([[30, 10]], { t })] } });
  assert.strictEqual(migraPlano(S), 0);
  assert.deepStrictEqual(Object.keys(S.logs), ['A0'], 'estado já migrado fica como está');
});

// ---------- 2 -> 3 ----------

test('2→3 reindexa a posição pelo id do exercício', () => {
  const S = estado({ plano: 2, logs: { A0: [log([[60, 8]], { t })] } });
  const r = migraPlano3(S)!;
  assert.strictEqual(r.chaves, 1);
  // A0 do programa ATUAL é o chest press, não o supino do plano 1
  assert.deepStrictEqual(Object.keys(S.logs), ['chest-press-inclinado-convergente']);
  assert.strictEqual(S.plano, 3);
});

test('2→3 devolve ao histórico ativo quem continua no programa', () => {
  const nome = 'Crucifixo inclinado no cabo';   // existe no programa de hoje
  const S = estado({ plano: 2, logs: { [ARQUIVO + nome]: [log([[20, 12]], { t })] } });
  const r = migraPlano3(S)!;
  assert.ok(r.recuperados.includes(nome), 'estava arquivado só por não ter para onde ir');
  assert.ok(S.logs[slugEx(nome)], 'volta a ser o histórico do próprio exercício');
  assert.strictEqual(S.ex[slugEx(nome)], undefined, 'e não precisa de entrada no catálogo');
});

test('2→3 arquiva no catálogo quem sumiu do programa', () => {
  const nome = 'Remada serrote com halter';    // do plano 1, fora do programa de hoje
  assert.strictEqual(EX_BASE[slugEx(nome)], undefined, 'premissa do teste');
  const S = estado({ plano: 2, logs: { [ARQUIVO + nome]: [log([[14, 12]], { t })] } });
  const r = migraPlano3(S)!;
  assert.strictEqual(r.arquivados, 1);
  assert.strictEqual(S.ex[slugEx(nome)].n, nome, 'guarda o nome, senão o histórico fica órfão');
  assert.strictEqual(S.ex[slugEx(nome)].arq, 1);
  assert.strictEqual(S.logs[slugEx(nome)].length, 1, 'e o histórico continua lá');
});

test('2→3 guarda de que posição o substituto veio', () => {
  const S = estado({ plano: 2, logs: { 'A0~Supino inclinado no Smith': [log([[50, 8]], { t })] } });
  migraPlano3(S);
  const chave = slugEx('Supino inclinado no Smith');
  assert.ok(S.logs[chave], 'o substituto vira exercício de primeira classe');
  assert.strictEqual(S.logs[chave][0].sl, 'chest-press-inclinado-convergente',
    'sem sl, o mesmo aparelho em duas posições da mesma sessão colidiria');
});

test('2→3 faz a correção de carga e os pulados acompanharem o exercício', () => {
  const S = estado({
    plano: 2,
    logs: { A0: [log([[60, 8]], { t })] },
    carga: { A0: 'lado' },
    done: [{ day: 'A', t, sid: t, dur: 0, pulados: ['A0'] as unknown as number[] }]
  });
  migraPlano3(S);
  assert.strictEqual(S.carga['chest-press-inclinado-convergente'], 'lado',
    'a correção é do equipamento, não da posição');
  assert.deepStrictEqual(S.done[0].pulados, ['chest-press-inclinado-convergente']);
});

test('2→3 semeia com a rotulagem DA ÉPOCA, não com a de hoje', () => {
  // Toda migração devolve o estado como ele era naquela versão. Se a 2→3
  // semeasse com as letras de hoje, a 4→5 rodaria em seguida e trocaria de
  // novo — aplicando a troca duas vezes e embaralhando o programa.
  const S = estado({ plano: 2 });
  migraPlano3(S);
  assert.ok(S.prog && S.prog.A, 'nasce com o programa do treinador');
  assert.deepStrictEqual(S.rot, ['A', 'B', 'C', 'E', 'D', 'F'], 'a rotação do plano 3');
  assert.strictEqual(S.prog!.E.name, 'Espessura de costas + peito', 'o torso ainda se chama E aqui');
  assert.strictEqual(S.prog!.A.ex[0].desde, 0, 'veio do treinador: não conta na regra de 6 a 8 semanas');
});

test('a cadeia inteira termina com a rotação alfabética e o torso em D', () => {
  const S = estado({ plano: 1 });
  migraPlano(S);
  migraPlano3(S);
  migraPlano4(S);
  migraPlano5(S);
  assert.strictEqual(S.plano, 5);
  assert.deepStrictEqual(S.rot, ['A', 'B', 'C', 'D', 'E', 'F']);
  assert.strictEqual(S.prog!.D.name, 'Espessura de costas + peito');
  assert.strictEqual(S.prog!.E.name, 'Deltoides + braços + abdômen');
});

test('2→3 não roda duas vezes', () => {
  const S = estado({ plano: 3, logs: { A0: [log([[60, 8]], { t })] } });
  assert.strictEqual(migraPlano3(S), null);
  assert.deepStrictEqual(Object.keys(S.logs), ['A0']);
});

// ---------- a cadeia inteira ----------

test('um estado do plano 1 atravessa as duas migrações sem perder série', () => {
  const S = estado({ logs: {
    A0: [log([[30, 10]], { t })],                              // sai do programa
    A2: [log([[20, 12]], { t: t + DIA })],                     // continua no programa
    C0: [log([[80, 8]], { t: t + 2 * DIA })]                   // agachamento hack
  } });
  const antes = Object.values(S.logs).reduce((n, h: Log[]) => n + h.length, 0);

  migraPlano(S);
  migraPlano3(S);

  const depois = Object.values(S.logs).reduce((n, h: Log[]) => n + h.length, 0);
  assert.strictEqual(depois, antes, 'nenhuma entrada de histórico some no caminho');
  assert.strictEqual(S.plano, 3);
  Object.keys(S.logs).forEach(k => {
    assert.ok(/^[a-z0-9-]+$/.test(k), 'toda chave virou id de exercício: ' + k);
  });
});

// ---------- 4 -> 5: as letras D e E trocam de lugar ----------

test('4→5 renomeia a sessão no histórico, não a reordena', () => {
  // Sem isto, todo treino de ombros já registrado passaria a se chamar
  // "espessura de costas" — o app mentindo sobre meses de registro.
  const S = estado({ plano: 4, done: [
    { day: 'A', t: 1, sid: 1, dur: 0 },
    { day: 'E', t: 2, sid: 2, dur: 0 },   // era o torso
    { day: 'D', t: 3, sid: 3, dur: 0 },   // era ombros e braços
    { day: 'F', t: 4, sid: 4, dur: 0 }
  ] });
  const r = migraPlano5(S)!;
  assert.strictEqual(r.sessoes, 2, 'só as duas que mudaram de nome');
  assert.deepStrictEqual(S.done.map(m => m.day), ['A', 'D', 'E', 'F']);
  assert.deepStrictEqual(S.done.map(m => m.t), [1, 2, 3, 4], 'a ordem cronológica não se toca');
});

test('4→5 leva junto a rotação, o programa e a sessão aberta', () => {
  const S = estado({
    plano: 4,
    rot: ['A', 'B', 'C', 'E', 'D', 'F'],
    prog: { A: { name: 'a', tag: '', ex: [] }, E: { name: 'torso', tag: '', ex: [] },
            D: { name: 'ombros', tag: '', ex: [] } },
    sessao: { day: 'E', inicio: 1, ultima: 1, sid: 1 },
    draft: { day: 'E', ex: {} },
    mods: { day: 'D', t: 1, list: [] },
    progLog: [{ t: 1, day: 'E', txt: 'x' }]
  });
  migraPlano5(S);
  assert.deepStrictEqual(S.rot, ['A', 'B', 'C', 'D', 'E', 'F'], 'a rotação vira alfabética');
  assert.strictEqual(S.prog!.D.name, 'torso', 'o torso passou a se chamar D');
  assert.strictEqual(S.prog!.E.name, 'ombros');
  assert.strictEqual(S.sessao!.day, 'D');
  assert.strictEqual(S.draft!.day, 'D');
  assert.strictEqual(S.mods!.day, 'E');
  assert.strictEqual(S.progLog[0].day, 'D');
});

test('4→5 não roda duas vezes — a troca é involução', () => {
  // Aplicar de novo desfaria tudo em silêncio. O guarda de versão é a única
  // coisa entre isto e um histórico embaralhado.
  const S = estado({ plano: 5, done: [{ day: 'D', t: 1, sid: 1, dur: 0 }] });
  assert.strictEqual(migraPlano5(S), null);
  assert.strictEqual(S.done[0].day, 'D');
});

test('2→3 lê as posições antigas com a rotulagem da época', () => {
  // 'D3' foi escrito quando D era o treino de ombros. Ler com a rotulagem de
  // hoje apontaria para o quarto exercício do torso — histórico no lugar errado.
  const S = estado({ plano: 2, logs: { D3: [log([[20, 12]], { t })] } });
  migraPlano3(S);
  const chave = Object.keys(S.logs)[0];
  // o treino de ombros e braços hoje se chama E; D3 era a quarta posição dele
  assert.strictEqual(chave, slugEx(PROGRAMA.E.ex[3].n),
    'D3 era o quarto exercício de ombros; veio ' + chave);
});
