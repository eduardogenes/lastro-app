// As migrações do formato do estado.
//
// Regra 2 do projeto: não quebrar dados salvos. Este é o único lugar do app
// onde um erro custa HISTÓRICO — não uma tela feia, não um número errado: anos
// de série registrada. Ganhou testes diretos por isso: aqui dá para varrer
// caso de borda sem o custo de subir o app, e por isso não há desculpa.

import { test } from 'vitest';
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import {
  ARQUIVO, PLANO_1, migraPlano, migraPlano3, migraPlano4, migraPlano5, migraPlano6, migraPlano7, migraPlano9,
  migraPlano10
} from '../../src/dominio/migracoes';
import { MARCAS_DA_BIO } from '../../src/dominio/corpo';
import { EX_BASE, slugEx } from '../../src/dominio/programa';
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
  assert.strictEqual(S.plano, 5, 'a 4→5 para no 5; a 5→6 é outra');
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
  // Literal de propósito: o alvo é o exercício que estava naquela posição NA
  // ÉPOCA. Escrever isso como PROGRAMA.E.ex[3] amarrava a migração ao programa
  // vivo — e foi exatamente o que quebrou quando o treinador trocou a
  // prescrição em 2026. A migração lê dado congelado; o teste também.
  assert.strictEqual(chave, 'reverse-fly-no-cabo',
    'D3 era o quarto exercício de ombros; veio ' + chave);
});

// ---------- plano 5 -> 6: o RIR desce da sessão para a série ----------

test('5→6 move o RIR da sessão para a última série feita', () => {
  const S = estado({ plano: 5, logs: { supino: [
    { t: 1, sid: 1, sets: [[60, 10], [60, 9], [60, 8]], rir: '1' } as never
  ] } });
  const r = migraPlano6(S);
  assert.strictEqual(r!.movidos, 1);
  const e = S.logs.supino[0];
  assert.strictEqual(e.sets[2]![2], 1, 'pousou na última série, que é de onde o valor era');
  assert.strictEqual(e.sets[0]![2], undefined, 'e não nas outras');
  assert.strictEqual((e as { rir?: string }).rir, undefined, 'o campo antigo sai');
  assert.strictEqual(S.plano, 6);
});

test('5→6 lê a faixa pelo limite inferior', () => {
  // '0–1' registra que chegou a zero em algum momento, e para leitura de
  // fadiga o pior caso é o que importa
  const S = estado({ plano: 5, logs: {
    a: [{ t: 1, sid: 1, sets: [[10, 10]], rir: '0–1' } as never],
    b: [{ t: 1, sid: 1, sets: [[10, 10]], rir: '1–2' } as never],
    c: [{ t: 1, sid: 1, sets: [[10, 10]], rir: '2+' } as never]
  } });
  migraPlano6(S);
  assert.strictEqual(S.logs.a[0].sets[0]![2], 0);
  assert.strictEqual(S.logs.b[0].sets[0]![2], 1);
  assert.strictEqual(S.logs.c[0].sets[0]![2], 2);
});

test('5→6 não inventa RIR onde não havia', () => {
  const S = estado({ plano: 5, logs: { supino: [{ t: 1, sid: 1, sets: [[60, 10]] }] } });
  const r = migraPlano6(S);
  assert.strictEqual(r!.movidos, 0);
  assert.strictEqual(S.logs.supino[0].sets[0]!.length, 2, 'a série continua sendo um par');
});

test('5→6 é involução: rodar de novo não mexe em nada', () => {
  const S = estado({ plano: 5, logs: { supino: [
    { t: 1, sid: 1, sets: [[60, 10]], rir: '1' } as never
  ] } });
  migraPlano6(S);
  const depois = JSON.parse(JSON.stringify(S));
  assert.strictEqual(migraPlano6(S), null, 'o guarda de versão segura');
  assert.deepStrictEqual(S, depois);
});

test('6→7 zera o histórico do HYROX com lápide, e não toca na presença', () => {
  const agora = Date.now();
  const S = {
    plano: 6,
    logs: {
      'sled-push':   [{ t: agora, sid: 1, sets: [[60, 252]] }],
      'wall-balls':  [{ t: agora, sid: 1, sets: [[9, 300]] },
                      { t: agora - 86400000, sid: 2, sets: [[9, 310]] }],
      'leg-press':   [{ t: agora, sid: 1, sets: [[100, 10]] }]
    },
    done: [{ day: 'HX', t: agora, sid: 1, dur: 3600000 }]
  } as unknown as Estado;

  const r = migraPlano7(S)!;
  assert.strictEqual(r.exercicios, 2, 'dois exercícios de HYROX tinham histórico');
  assert.strictEqual(r.entradas, 3, 'e três entradas ao todo');

  assert.strictEqual(S.logs['sled-push'], undefined);
  assert.strictEqual(S.logs['wall-balls'], undefined);
  assert.ok(S.logs['leg-press'], 'a musculação não é tocada');
  assert.strictEqual(S.done.length, 1, 'a presença fica: ter treinado no sábado é outro fato');

  // Sem lápide, a primeira sincronização traria tudo de volta: a fusão une as
  // duas listas pela chave natural, e o que só existe de um lado volta.
  const mortos = (S as Estado & { apagados?: Record<string, number> }).apagados!;
  assert.strictEqual(Object.keys(mortos).length, 3, 'uma lápide por entrada');
  assert.ok(mortos['log:sled-push:1:sled-push'] > 0, Object.keys(mortos).join(' · '));

  assert.strictEqual(S.plano, 7);
  assert.strictEqual(migraPlano7(S), null, 'não roda duas vezes');
});

// ---------- 8 -> 9: a revisão do dia B ----------
// Ênfase a posteriores e glúteo; menos orçamento direto de quadríceps.

function progPlano8() {
  return {
    B: { name: 'Pernas completas + panturrilhas', tag: '', ex: [
      { id: 'pendulum-squat', s: 3, r: '6–10', d: 180, rir: '1–2', desde: 0 },
      { id: 'cadeira-flexora-sentada', s: 3, r: '8–12', d: 120, rir: '1', desde: 0 },
      { id: 'terra-romeno-no-smith', s: 3, r: '6–10', d: 180, rir: '1–2', desde: 0 },
      { id: 'cadeira-extensora', s: 2, r: '10–15', d: 120, rir: '0–1', desde: 0 },
      { id: 'elevacao-pelvica-na-maquina', s: 2, r: '8–12', d: 150, rir: '1', desde: 0 }
    ] }
  };
}

test('a revisão do dia B troca o agachamento e ajusta três volumes', () => {
  const S = { plano: 8, prog: progPlano8() } as unknown as Estado;
  const r = migraPlano9(S)!;

  assert.strictEqual(r.trocou, 1);
  assert.strictEqual(r.series, 3);
  const ex = S.prog!.B.ex;
  assert.strictEqual(ex[0].id, 'agachamento-no-smith', 'o pendulum saiu');
  assert.strictEqual(ex[0].s, 2, 'e com duas séries, não três');
  assert.strictEqual(ex[1].s, 4, 'flexora 3 → 4');
  assert.strictEqual(ex[3].s, 1, 'extensora 2 → 1');
  assert.strictEqual(ex[4].s, 3, 'elevação pélvica 2 → 3');
  assert.strictEqual(S.plano, 9);
});

test('o que ele já tinha mudado na mão fica como está', () => {
  // Migração aplica delta, e só onde o slot ainda está como o programa antigo
  // prescrevia. Reescrever o dia apagaria o que ele promoveu ao oficial.
  const prog = progPlano8();
  prog.B.ex[1].s = 5;                       // ele já tinha levado a flexora a 5
  const S = { plano: 8, prog: prog } as unknown as Estado;
  const r = migraPlano9(S)!;

  assert.strictEqual(S.prog!.B.ex[1].s, 5, 'o número dele sobreviveu');
  assert.strictEqual(r.series, 2, 'e a migração conta só as que de fato mexeu');
  assert.strictEqual(S.prog!.B.ex[3].s, 1, 'as outras seguem ajustadas');
});

test('rodar duas vezes não muda nada', () => {
  const S = { plano: 8, prog: progPlano8() } as unknown as Estado;
  migraPlano9(S);
  const depois = JSON.stringify(S.prog);
  assert.strictEqual(migraPlano9(S), null, 'a segunda chamada devolve null');
  assert.strictEqual(JSON.stringify(S.prog), depois);
});

test('sem programa salvo ela não quebra', () => {
  const S = { plano: 8, prog: null } as unknown as Estado;
  const r = migraPlano9(S)!;
  assert.strictEqual(r.trocou, 0);
  assert.strictEqual(S.plano, 9);
});

// ---------- 9 -> 10: o corpo aberto e a hora da marca ----------
// Quatro mudanças de dado persistido numa migração só. O que esta função
// REFORMATA é uma: a marca do dia corrente, que era o literal `1` e passa a ser
// o instante que o histórico já guardava. As cinco chaves da bioimpedância
// entram vazias, e os dois campos opcionais do dia (`como`, `aguaNaoContada`)
// não têm byte a reformatar — ausente já significa o que tem de significar.

/**
 * O estado do plano 9, lido do disco e não escrito aqui.
 *
 * `tests/dominio/fixtures/estado-plano-9.json` foi gerado pelo BUILD do plano
 * 9, com o app em execução e o relógio fixado — ver `fixtures/LEIA.md`. É o
 * ponto da disciplina: uma fixture digitada à mão tem a forma que quem digita
 * imagina, que é a de hoje, e é justamente a que a migração não encontra.
 */
function fixturePlano9(): Estado {
  const p = new URL('./fixtures/estado-plano-9.json', import.meta.url);
  return JSON.parse(readFileSync(p, 'utf8')) as Estado;
}

test('a fixture é o dado da época, e não a forma de hoje', () => {
  const S = fixturePlano9();
  assert.strictEqual(S.plano, 9);
  assert.deepStrictEqual(Object.keys(S.body).sort(), ['cintura', 'peso'],
    'o corpo do plano 9 tem DUAS chaves — é o que a migração abre');
  assert.deepStrictEqual(S.dia!.done, { pos: 1, almoco: 1, lanche: 1 },
    'e a marca do dia corrente é o literal 1, sem hora nenhuma');
  const h = S.comidaHist[0];
  const instantes = Object.keys(h.done).map(k => h.done[k]);
  assert.ok(instantes.every(v => v > 1), 'o histórico já guardava instante');
  assert.strictEqual(new Set(instantes).size, 1,
    'mas todos iguais: fechaDia carimbava a hora do FECHAMENTO, não a da marca');
});

test('9→10 dá hora à marca do dia corrente, sem inventar hora', () => {
  const S = fixturePlano9();
  const r = migraPlano10(S)!;

  assert.strictEqual(r.marcas, 3, 'as três marcas do dia aberto');
  const meiaNoite = new Date(S.dia!.data + 'T00:00:00').getTime();
  assert.deepStrictEqual(S.dia!.done, { pos: meiaNoite, almoco: meiaNoite, lanche: meiaNoite },
    'meia-noite do dia: o instante mais antigo compatível com a data. ' +
    'Carimbar o instante da migração faria a marca nascer mais nova que ' +
    'qualquer lápide escrita antes dela, e ressuscitaria o desmarcado');
  assert.strictEqual(S.plano, 10);
});

test('9→10 não toca em marca que já tem instante de verdade', () => {
  const S = fixturePlano9();
  const antes = JSON.stringify(S.comidaHist[0].done);
  const r = migraPlano10(S)!;
  assert.strictEqual(JSON.stringify(S.comidaHist[0].done), antes,
    'o histórico é o dado; a migração não sabe mais que ele');
  assert.strictEqual(r.dias, 0);
});

test('9→10 abre as cinco chaves da bioimpedância, e só as cinco', () => {
  const S = fixturePlano9();
  const r = migraPlano10(S)!;

  assert.strictEqual(r.chaves, 5);
  assert.deepStrictEqual(Object.keys(S.body).sort(), [
    'bioAgua', 'bioGordura', 'bioGorduraPct', 'bioMusculo', 'bioPeso', 'cintura', 'peso'
  ]);
  MARCAS_DA_BIO.forEach(function (k) {
    assert.deepStrictEqual(S.body[k], [], k + ' nasce vazia');
  });
});

test('o peso da manhã sobrevive intocado, separado do da bioimpedância', () => {
  // A resposta do dono: ele pesa numa balança e mede na outra, em horas
  // diferentes. Os dois convivem de propósito, e é `peso` que alimenta a média
  // semanal e o ritmo da regra do nutricionista.
  const S = fixturePlano9();
  const pesagens = JSON.stringify(S.body.peso);
  migraPlano10(S);
  assert.strictEqual(JSON.stringify(S.body.peso), pesagens);
  assert.strictEqual(S.body.peso.length, 2, 'as duas pesagens da fixture');
  assert.deepStrictEqual(S.body.bioPeso, [], 'e a bioimpedância começa do zero');
});

test('9→10 não inventa `como` nem `aguaNaoContada`', () => {
  // Ausente já significa o certo: comeu o prescrito, e a água foi contada.
  // Semear um valor aqui seria afirmar sobre o passado o que ninguém registrou.
  const S = fixturePlano9();
  migraPlano10(S);
  assert.strictEqual(S.dia!.como, undefined);
  assert.strictEqual(S.dia!.aguaNaoContada, undefined);
  assert.strictEqual(S.comidaHist[0].como, undefined);
});

test('9→10 roda uma vez só', () => {
  const S = fixturePlano9();
  migraPlano10(S);
  const depois = JSON.stringify(S);
  assert.strictEqual(migraPlano10(S), null, 'a segunda chamada devolve null');
  assert.strictEqual(JSON.stringify(S), depois);
});

test('9→10 atravessa estado sem dia, sem histórico e sem corpo', () => {
  const S = { plano: 9 } as unknown as Estado;
  const r = migraPlano10(S)!;
  assert.deepStrictEqual(r, { marcas: 0, dias: 0, chaves: 0, promos: 0 });
  assert.strictEqual(S.plano, 10, 'e a versão avança: um aparelho novo não fica em 9');
});

test('9→10 conserta a marca sem instante que um build antigo deixou no histórico', () => {
  // `fechaDia` sempre gravou instante. Mas a fusão achatava a marca do dia
  // ABERTO em `1` nos dois sentidos, e um backup fundido por aquele build podia
  // trazer o `1` para dentro de uma linha fechada — e `1` é 1970, que toda
  // lápide mata.
  const S = {
    plano: 9,
    comidaHist: [{ d: '2026-02-10', done: { pos: 1, almoco: 1771000000000 }, agua: 3,
                   escala: {}, tot: { kcal: 0, p: 0, c: 0, g: 0 }, pv: 0 }]
  } as unknown as Estado;
  const r = migraPlano10(S)!;

  assert.strictEqual(r.dias, 1);
  const meiaNoite = new Date('2026-02-10T00:00:00').getTime();
  assert.strictEqual(S.comidaHist[0].done.pos, meiaNoite);
  assert.strictEqual(S.comidaHist[0].done.almoco, 1771000000000, 'o instante bom fica');
});

test('9→10 não quebra em dia com data ilegível', () => {
  const S = { plano: 9, dia: { data: 'ontem', done: { pos: 1 }, agua: 0, escala: {} } } as unknown as Estado;
  const r = migraPlano10(S)!;
  assert.strictEqual(r.marcas, 0, 'sem data não há instante honesto: a marca fica como está');
  assert.strictEqual(S.dia!.done.pos, 1);
  assert.strictEqual(S.plano, 10);
});

test('9→10 transforma a pergunta guardada em coleção, sem perder a que havia', () => {
  // Era documento: UMA pergunta, com um `day` só, e escrita por atribuição
  // direta — o fecho seguinte sobrescrevia o anterior.
  const S = {
    plano: 9,
    promoPendente: { day: 'A', t: 1791000000000,
                     mods: [{ k: 'sets', slot: 'pushdown', de: 2, para: 3 }],
                     resumoMods: ['Pushdown: 2 → 3 séries'] }
  } as unknown as Estado;
  const r = migraPlano10(S)!;

  assert.strictEqual(r.promos, 1);
  assert.ok(Array.isArray(S.promoPendente));
  assert.strictEqual(S.promoPendente.length, 1, 'a pergunta que havia não se perde');
  assert.strictEqual(S.promoPendente[0].day, 'A');
  assert.strictEqual(S.promoPendente[0].mods.length, 1);
  assert.strictEqual(S.promoPendente[0].sid, 1791000000000,
    'o `sid` que faltava vem de `t`: está no dado, então os dois aparelhos ' +
    'derivam a MESMA chave do MESMO registro, que é o que a fusão pede');
});

test('9→10 atravessa `promoPendente` nulo e lista já pronta', () => {
  const vazio = { plano: 9, promoPendente: null } as unknown as Estado;
  assert.strictEqual(migraPlano10(vazio)!.promos, 0);
  assert.deepStrictEqual(vazio.promoPendente, []);

  const pronta = { plano: 9, promoPendente: [
    { sid: 1, day: 'A', t: 1, mods: [{ k: 'sets', slot: 'x', de: 1, para: 2 }], resumoMods: [] }
  ] } as unknown as Estado;
  migraPlano10(pronta);
  assert.strictEqual(pronta.promoPendente.length, 1, 'lista pronta passa intacta');
});

test('a pergunta sem mudança nenhuma não vira entrada', () => {
  // `abrePromoGuardada` já recusava `mods` vazio; a coleção não precisa guardar
  // uma pergunta que não pergunta nada.
  const S = { plano: 9, promoPendente: { day: 'A', t: 1, mods: [], resumoMods: [] } } as unknown as Estado;
  migraPlano10(S);
  assert.deepStrictEqual(S.promoPendente, []);
});

test('a fixture do plano 9 tem `promoPendente` como documento, e sai como lista', () => {
  const S = fixturePlano9();
  assert.strictEqual(S.promoPendente as unknown, null, 'no plano 9 era documento, e estava vazio');
  migraPlano10(S);
  assert.deepStrictEqual(S.promoPendente, []);
});
