// O cartão de cima, resolvido contra o estado de verdade.
//
// A REGRA é pura e mora em `src/dominio/agora.ts`, com 21 casos e doze mutações
// provadas em `tests/dominio/agora.test.ts`. O que estes casos cobram é o
// INVÓLUCRO — de onde cada fato do dia é lido — e é a metade que só o app
// prova: a janela do treino saindo do plano deslocado pelo turno, o palpite
// saindo de `diaDeHoje`, a aula saindo do dia aberto da rotação, e a
// confirmação do fim aproximado saindo de um carimbo que já existia no dado.
//
// Um invólucro errado dá um cartão errado sem nenhum vermelho na regra, e o
// cartão errado parece certo: a tela mostra UM.

import { test } from 'vitest';
import assert from 'node:assert';
import { app, agoraEstavel } from './harness.js';

const MIN = 60 * 1000;
const DIA = 86400000;

/** Sessão aberta de verdade, com uma série registrada. */
async function comSessao(agora) {
  const a = await app(agora != null ? { agora: agora } : {});
  a.v('go', 'A');
  a.v('toggle', 0);
  a.preencher(0, 0, 40, 10);
  await a.esperar();
  assert.ok(a.S().sessao, 'a sessão nasceu na primeira série');
  return a;
}

test('com sessão aberta, o cartão é a sessão — e conta as séries', async () => {
  const a = await comSessao();
  const c = a.vJ('ctx.cartaoDeCima');

  assert.strictEqual(c.k, 'sessao', 'a sessão aberta ganha de tudo');
  assert.strictEqual(c.dia, 'A');
  assert.strictEqual(c.pergunta, false, 'sem parada longa, é atalho e não pergunta');
  assert.strictEqual(c.guardadas, 1, 'uma série preenchida');
  assert.ok(c.prescritas > 1, 'e o dia prescreve mais que uma: ' + c.prescritas);
  // A aritmética espelha `estadoEx`, deload incluído. Se as duas divergirem, a
  // faixa e o cartão passam a contar o mesmo treino de dois jeitos.
  const doDia = a.vJ('ctx.hoje').diaHoje;
  assert.ok(doDia, 'o dia resolvido existe');
  a.fechar();
});

test('sessão parada há 1h30 mantém o topo e vira pergunta', async () => {
  // Colisão escrita da §5.1: a faixa não cede o lugar quando vira pergunta.
  const a = await comSessao();
  a.E(`S.sessao.ultima = Date.now() - 95 * ${MIN}`);
  await a.esperar();

  const c = a.vJ('ctx.cartaoDeCima');
  assert.strictEqual(c.k, 'sessao', 'o MESMO cartão: muda o texto, não o lugar');
  assert.strictEqual(c.pergunta, true);
  // e o modelo da faixa concorda, porque os dois leem a mesma condição
  assert.strictEqual(a.vJ('ctx.faixaDaSessao').tipo, 'pergunta');
  a.fechar();
});

test('a sessão que fechou sozinha ontem ganha do treino de hoje', async () => {
  // O carimbo é `fim: 'auto'`, que `fechaSessao('auto')` já escreve. Sem campo
  // novo: enquanto ele não responde, o número continua aproximado.
  const agora = agoraEstavel(6, 15);
  const a = await app({
    agora: agora,
    estado: {
      // `plano: 7` e não o 2 do harness: a migração 4→5 TROCA as letras D e E
      // (`TROCA_4_5`, e a razão está escrita lá — rótulo trocado é migração de
      // dado, senão o histórico passa a mentir). Entrando como 2, o `E` daqui
      // viraria `D` e o caso falaria de outro treino.
      plano: 7,
      logs: {}, done: [
        { sid: 1, day: 'E', t: agora - DIA, dur: 71 * MIN, fim: 'auto', sets: [] }
      ],
      dia: { data: new Date(agora).toISOString().slice(0, 10), done: {}, agua: 0,
             escala: {}, cadencia: 'treino', alta: 0 }
    }
  });

  const c = a.vJ('ctx.cartaoDeCima');
  assert.strictEqual(c.k, 'confirmar', 'a confirmação de um registro JÁ ESCRITO vem antes');
  assert.strictEqual(c.dia, 'E');
  assert.strictEqual(c.fim - c.inicio, 71 * MIN, 'a duração escrita, para a tela dizer o intervalo');
  a.fechar();
});

test('o fim já confirmado não pede confirmação de novo', async () => {
  // A quebra espelhada. `fim: 'manual'` é o que um dos dois botões escreve, e é
  // o que faz a pergunta sair sozinha — sem flag de "já vi".
  const agora = agoraEstavel(6, 15);
  const a = await app({
    agora: agora,
    estado: {
      plano: 7,                          // ver a nota da troca de letras acima
      logs: {}, done: [
        { sid: 1, day: 'E', t: agora - DIA, dur: 71 * MIN, fim: 'manual', sets: [] }
      ],
      dia: { data: new Date(agora).toISOString().slice(0, 10), done: {}, agua: 0,
             escala: {}, cadencia: 'treino', alta: 0 }
    }
  });
  assert.notStrictEqual(a.vJ('ctx.cartaoDeCima').k, 'confirmar');
  a.fechar();
});

test('só a sessão MAIS RECENTE pede confirmação', async () => {
  // A quebra que o caso de cima não pega: com uma `auto` antiga por baixo de
  // uma `manual` nova, um laço sem parada acharia a antiga e ressuscitaria uma
  // pergunta de semanas atrás — sobre um número que ele já pode ter conferido
  // por outro caminho. Quem responde é a última, e só ela.
  const agora = agoraEstavel(6, 15);
  const a = await app({
    agora: agora,
    estado: {
      plano: 7,
      logs: {}, done: [
        { sid: 1, day: 'C', t: agora - 9 * DIA, dur: 65 * MIN, fim: 'auto', sets: [] },
        { sid: 2, day: 'E', t: agora - DIA, dur: 71 * MIN, fim: 'manual', sets: [] }
      ],
      dia: { data: new Date(agora).toISOString().slice(0, 10), done: {}, agua: 0,
             escala: {}, cadencia: 'treino', alta: 0 }
    }
  });
  assert.notStrictEqual(a.vJ('ctx.cartaoDeCima').k, 'confirmar',
    'a `auto` de nove dias atrás não volta: a mais recente já foi confirmada');
  a.fechar();
});

test('enquanto a janela do treino não passou, o cartão é o treino', async () => {
  // O treino do plano é às 6h15 e a janela dura o que a sessão dele dura
  // (`duracaoDoTreino()`, mediana medida). Às 6h30 ela não passou, e o cartão é
  // o treino mesmo havendo refeição à frente — é a decisão D4 do dono.
  const agora = agoraEstavel(6, 30);
  const a = await app({
    agora: agora,
    estado: { logs: {}, done: [],
              dia: { data: new Date(agora).toISOString().slice(0, 10), done: {}, agua: 0,
                     escala: {}, cadencia: 'treino', alta: 0 } }
  });

  const c = a.vJ('ctx.cartaoDeCima');
  assert.strictEqual(c.k, 'treino', 'o treino ganha da refeição');
  assert.strictEqual(c.palpite, false, 'o dia foi declarado de treino: não é palpite');
  a.fechar();
});

test('passada a janela do treino, a refeição assume o topo', async () => {
  // 10h: o treino das 6h15 acabaria muito antes. O cartão passa a ser a próxima
  // refeição do plano para a FRENTE.
  const agora = agoraEstavel(10, 0);
  const a = await app({
    agora: agora,
    estado: { logs: {}, done: [],
              dia: { data: new Date(agora).toISOString().slice(0, 10), done: {}, agua: 0,
                     escala: {}, cadencia: 'treino', alta: 0 } }
  });

  const c = a.vJ('ctx.cartaoDeCima');
  assert.strictEqual(c.k, 'refeicao');
  assert.strictEqual(c.id, 'almoco', 'o almoço das 12h30 é o próximo à frente');
  assert.strictEqual(c.janela, false, 'e está longe: a tela não pode dizer "agora"');
  a.fechar();
});

test('sessão já registrada hoje tira o treino da disputa, dentro da janela', async () => {
  // O fixture é feito para DISCRIMINAR: 6h45 está DENTRO da janela do treino,
  // então se o cartão não é o treino a razão só pode ser `feito`. Com o relógio
  // fora da janela, o caso ficaria verde sem provar nada — a refeição ganharia
  // pelo degrau seguinte de todo jeito.
  //
  // `origem: 'registrado'` é de onde `feito` sai, e `diaDeHoje` o devolve
  // quando há sessão registrada hoje: fato consumado, nada discute.
  const agora = agoraEstavel(6, 45);
  const a = await app({
    agora: agora,
    estado: {
      plano: 7,
      logs: {}, done: [
        { sid: 1, day: 'A', t: agora - 20 * MIN, dur: 70 * MIN, fim: 'manual', sets: [] }
      ],
      dia: { data: new Date(agora).toISOString().slice(0, 10), done: {}, agua: 0,
             escala: {}, cadencia: 'treino', alta: 0 }
    }
  });

  const fatos = a.vJ('ctx.fatosDoDia');
  assert.strictEqual(fatos.treino.feito, true, 'o treino de hoje já está registrado');
  assert.ok(fatos.agora <= fatos.treino.fimDaJanela,
    'pré-condição que faz o caso discriminar: ainda DENTRO da janela (' +
    fatos.agora + ' <= ' + fatos.treino.fimDaJanela + ')');
  assert.strictEqual(a.vJ('ctx.cartaoDeCima').k, 'refeicao',
    'e mesmo assim o treino não disputa: dois treinos no mesmo dia são ' +
    'possíveis, e o segundo volta a ganhar pela sessão ABERTA, que é o degrau 1');
  a.fechar();
});

test('o pré-treino e o intra nunca recebem o cartão', async () => {
  // Razão escrita da frente 1: o pré "desce para a linha de baixo e reaparece
  // dentro do descanso, que é onde ele de fato é marcado". E um cartão mandando
  // beber água no meio da série é a mesma classe de erro.
  //
  // 5h30: o pré é às 5h45, a 15 min — dentro da janela de 30 e mais perto que
  // qualquer outra coisa. Ele perde de propósito.
  const agora = agoraEstavel(5, 30);
  const a = await app({
    agora: agora,
    estado: { logs: {}, done: [],
              dia: { data: new Date(agora).toISOString().slice(0, 10), done: {}, agua: 0,
                     escala: {}, cadencia: 'treino', alta: 0 } }
  });

  const fatos = a.vJ('ctx.fatosDoDia');
  const ids = fatos.refeicoes.map(function (r) { return r.id; });
  assert.ok(ids.indexOf('pre') < 0, 'o pré não está entre os candidatos: ' + ids.join(','));
  assert.ok(ids.indexOf('treino') < 0, 'nem o intra: ' + ids.join(','));
  assert.ok(ids.indexOf('almoco') >= 0, 'e as de relógio estão: ' + ids.join(','));
  // e às 5h30 quem tem o topo é o treino, pela janela
  assert.strictEqual(a.vJ('ctx.cartaoDeCima').k, 'treino');
  a.fechar();
});

test('em dia de descanso a refeição ganha por ausência de treino', async () => {
  const agora = agoraEstavel(12, 10);
  const a = await app({
    agora: agora,
    estado: { logs: {}, done: [],
              dia: { data: new Date(agora).toISOString().slice(0, 10), done: {}, agua: 0,
                     escala: {}, cadencia: 'descanso', alta: 0 } }
  });

  assert.strictEqual(a.vJ('ctx.fatosDoDia').treino, null,
    'não há treino a vencer: a comida ganha por ausência, não por regra');
  const c = a.vJ('ctx.cartaoDeCima');
  assert.strictEqual(c.k, 'refeicao');
  assert.strictEqual(c.id, 'almoco');
  assert.strictEqual(c.janela, true, 'o almoço das 12h30 está a 20 min: dentro da janela');
  a.fechar();
});

test('no dia da aula, o cartão é o da aula', async () => {
  // A aula É a sessão daquele dia — a 6ª posição da sequência (`HX`, o dia
  // ABERTO da rotação), e não "o sábado". Para cair nela, a última sessão
  // registrada tem que ser a do `E`; e ela entra com `fim: 'manual'` de
  // propósito, senão o degrau 2 (confirmar o fim aproximado) vence antes.
  //
  // 6h45 e não 9h: a aula entra pelo MESMO degrau 3, com a MESMA janela — a do
  // treino do plano deslocada pelo turno. Às 9h ela já havia passado e a
  // refeição assumia, que é a regra funcionando e não o contrário.
  const agora = agoraEstavel(6, 45);
  const a = await app({
    agora: agora,
    estado: {
      plano: 7,                          // ver a nota da troca de letras acima
      logs: {}, done: [
        { sid: 1, day: 'E', t: agora - 2 * DIA, dur: 70 * MIN, fim: 'manual', sets: [] }
      ],
      dia: { data: new Date(agora).toISOString().slice(0, 10), done: {}, agua: 0,
             escala: {}, cadencia: 'treino', alta: 0 }
    }
  });

  const fatos = a.vJ('ctx.fatosDoDia');
  assert.strictEqual(fatos.treino.dia, 'HX', 'a rotação caiu na aula: ' + JSON.stringify(fatos.treino));
  assert.strictEqual(fatos.treino.aula, true);
  assert.strictEqual(a.vJ('ctx.cartaoDeCima').k, 'aula',
    'e o cartão é o da aula, que é um botão só');
  a.fechar();
});

test('sem turno declarado, o treino previsto é dito como palpite', async () => {
  // A regra nunca inventa: o parecer mediu o preço de tratar palpite como fato
  // em ~3 marcas falsas de buraco por semana. Sem nada declarado para hoje,
  // `diaDeHoje` responde `previsto`, e o cartão carrega isso até a tela.
  const a = await app({ agora: agoraEstavel(6, 30), estado: { logs: {}, done: [] } });
  const fatos = a.vJ('ctx.fatosDoDia');
  if (fatos.treino) {
    assert.strictEqual(fatos.treino.palpite, true,
      'nada declarado hoje: o treino é palpite do padrão semanal');
  } else {
    assert.strictEqual(a.vJ('ctx.hoje').diaHoje.cadencia, 'descanso',
      'ou o padrão semanal previu descanso, e aí não há treino a prever');
  }
  a.fechar();
});
