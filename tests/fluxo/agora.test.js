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
      dia: { data: dataLocal(agora), done: {}, agua: 0,
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
      dia: { data: dataLocal(agora), done: {}, agua: 0,
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
      dia: { data: dataLocal(agora), done: {}, agua: 0,
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
              dia: { data: dataLocal(agora), done: {}, agua: 0,
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
              dia: { data: dataLocal(agora), done: {}, agua: 0,
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
      dia: { data: dataLocal(agora), done: {}, agua: 0,
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
              dia: { data: dataLocal(agora), done: {}, agua: 0,
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
              dia: { data: dataLocal(agora), done: {}, agua: 0,
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
      dia: { data: dataLocal(agora), done: {}, agua: 0,
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

// ---------------------------------------------------------------------------
// A VISTA: o cartão desenhado, e o que o toque nele faz
// ---------------------------------------------------------------------------
//
// Acima cobra-se a ESCOLHA do cartão. Aqui, o desenho e a ação — e é metade
// própria porque a regra pode estar certa e o cartão mudo, ou o cartão certo e
// o toque ligado em nada. Foi o que aconteceu enquanto eu escrevia: a ação de
// "Corrigir o fim" apontava para `ctx.abrirSessao`, que **não existe** em `CTX`
// (é verbo nu da tabela), e nenhum caso teria pegado.

/**
 * A data LOCAL, como `hojeISO()` a escreve.
 *
 * `toISOString().slice(0, 10)` dá a data em UTC, e isso é uma armadilha de
 * fixture que me custou um vermelho: às 23h em UTC−3 o UTC já virou o dia
 * seguinte, o carimbo não bate com `hojeISO()`, e `diaDeComida()` RESETA o dia
 * — apagando as marcas que o caso acabou de semear. De manhã passa; à noite,
 * não.
 */
function dataLocal(t) {
  const d = new Date(t);
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' +
         String(d.getDate()).padStart(2, '0');
}

/** O dia de comida de hoje, na forma que o boot aceita. */
function diaDe(agora, cadencia) {
  return { data: dataLocal(agora), done: {}, agua: 0,
           escala: {}, cadencia: cadencia, alta: 0 };
}

test('no Agora, o cartão da sessão aberta conta as séries e volta para ela', async () => {
  const a = await comSessao();
  a.v('ctx.vaiPara', 'hoje');
  await a.esperar();

  const foco = a.$('.ins-foco');
  assert.ok(foco, 'há cartão');
  assert.ok(a.texto('.ins-foco').indexOf('Treino A') >= 0, a.texto('.ins-foco'));
  // A contagem é o que a tira de baixo NÃO tem, e é a razão de o cartão a
  // substituir aqui em vez de as duas conviverem.
  assert.ok(/de \d+ séries/.test(a.texto('.ins-foco')), a.texto('.ins-foco'));
  assert.ok(a.texto('.ins-foco').indexOf('voltar à sessão') >= 0, a.texto('.ins-foco'));

  foco.click();
  await a.esperar();
  assert.strictEqual(a.vista().modoSessao, true, 'o toque entra NO MODO, não na aba');
  a.fechar();
});

test('no Agora a tira de baixo não é desenhada; em outra aba, é', async () => {
  // Duas peças para o mesmo trabalho na mesma tela é o oposto da regra de UM
  // cartão. Fora do Agora a tira continua sendo o único caminho de volta.
  const a = await comSessao();
  a.v('ctx.vaiPara', 'hoje');
  await a.esperar();
  assert.ok(!a.$('.ins-faixa'), 'no Agora, não: o cartão de cima já é a sessão');
  assert.ok(a.$('.ins-foco'), 'e o cartão está lá no lugar dela');

  a.v('ctx.vaiPara', 'comida');
  await a.esperar();
  assert.ok(a.$('.ins-faixa'), 'na comida, sim: é o único caminho de volta de lá');
  a.fechar();
});

test('no Agora, a pergunta de 1h30 mantém o topo COM as duas respostas', async () => {
  // A quebra que isto segura: como a tira não é desenhada no Agora, um cartão
  // com um toque só ("ir para a sessão") faria o Agora PERDER a resposta "já
  // parei" — e quem esqueceu o treino aberto está olhando justamente para cá.
  const a = await comSessao();
  a.E(`S.sessao.ultima = Date.now() - 95 * ${MIN}`);
  a.v('ctx.vaiPara', 'hoje');
  await a.esperar();

  const txt = a.texto('.ins-foco');
  assert.ok(txt.indexOf('sem série nova') >= 0, 'a frase é a do modelo: ' + txt);
  // As palavras são as da tira, não outras: primeira pessoa, minúsculas.
  assert.ok(a.$('[data-a="continuo"]'), 'a resposta de continuar está à vista');
  assert.ok(a.$('[data-a="ja-parei"]'), 'e a de parar também');
  assert.ok(!a.$('.ins-foco .ins-chip-cta'),
    'e não há um toque único no cartão: as duas respostas são opostas');

  a.$('[data-a="ja-parei"]').click();
  await a.esperar();
  assert.strictEqual(a.S().sessao, null, '"já parei" encerra de verdade, do Agora');
  a.fechar();
});

test('no Agora, o cartão do fim aproximado tem as duas respostas, e "está certo" fecha o assunto', async () => {
  const agora = agoraEstavel(6, 15);
  const a = await app({
    aba: 'hoje', agora: agora,
    estado: {
      plano: 7,
      logs: {}, done: [
        { sid: 1, day: 'E', t: agora - DIA, dur: 71 * MIN, fim: 'auto', sets: [] }
      ],
      dia: diaDe(agora, 'treino')
    }
  });

  const txt = a.texto('.ins-foco');
  assert.ok(txt.indexOf('Fechei na última série') >= 0, txt);
  assert.ok(txt.indexOf('aproximada') >= 0, 'e diz que o número é aproximado: ' + txt);
  assert.ok(a.$('[data-a="fim-corrigir"]'), 'a resposta de corrigir existe e está ligada');

  a.$('[data-a="fim-ok"]').click();
  await a.esperar();
  assert.strictEqual(a.S().done[0].fim, 'manual',
    '"está certo" declara o tempo: é o MESMO carimbo da correção');
  assert.strictEqual(a.S().done[0].dur, 71 * MIN, 'e sem mexer no número');
  assert.notStrictEqual(a.vJ('ctx.cartaoDeCima').k, 'confirmar',
    'e a pergunta sai sozinha, sem marca de "já respondi"');
  a.fechar();
});

test('no Agora, o cartão do treino abre o MODO no dia de hoje — a porta 1', async () => {
  // A terceira porta do modo (frente 1, §4.4), a que faltava. Entrar no modo
  // NÃO começa a sessão: ela nasce na primeira série completa.
  const agora = agoraEstavel(6, 30);
  const a = await app({
    aba: 'hoje', agora: agora,
    estado: { plano: 7, logs: {}, done: [], dia: diaDe(agora, 'treino') }
  });

  assert.strictEqual(a.vJ('ctx.cartaoDeCima').k, 'treino', 'pré-condição: o cartão é o treino');
  const esperado = a.vJ('ctx.hoje').diaHoje.treino;

  // A letra do dia é mexida por OUTRO caminho antes do toque, e isto é o que
  // faz o caso discriminar: sem isso `view.day` já valia o dia de hoje, e o
  // verbo podia nem escrevê-lo que o verde vinha igual.
  a.v('go', esperado === 'C' ? 'B' : 'C');
  await a.esperar();
  assert.notStrictEqual(a.vista().day, esperado,
    'pré-condição: o dedo deixou a letra em outro dia (' + a.vista().day + ')');

  a.$('.ins-foco').click();
  await a.esperar();
  assert.strictEqual(a.vista().modoSessao, true, 'entrou no modo');
  assert.strictEqual(a.vista().day, esperado,
    'e no dia de HOJE, não no que o dedo tinha deixado em outro caminho');
  assert.strictEqual(a.S().sessao, null,
    'e sem abrir sessão: entrar no modo é navegação, a sessão nasce na primeira série');
  a.fechar();
});

test('no Agora, o cartão da refeição longe diz "mais tarde", não "faltam"', async () => {
  // `janela` é o que separa "é agora" de "é a próxima coisa do dia". Sem isso o
  // cartão falaria de algo de três horas adiante com a voz de algo de dez
  // minutos.
  const agora = agoraEstavel(10, 0);
  const a = await app({
    aba: 'hoje', agora: agora,
    estado: { plano: 7, logs: {}, done: [], dia: diaDe(agora, 'treino') }
  });

  assert.strictEqual(a.vJ('ctx.cartaoDeCima').janela, false, 'pré-condição: fora da janela');
  assert.ok(a.texto('.ins-foco').indexOf('mais tarde') >= 0, a.texto('.ins-foco'));

  // e dentro da janela volta a ser a contagem normal
  const b = await app({
    aba: 'hoje', agora: agoraEstavel(12, 10),
    estado: { plano: 7, logs: {}, done: [], dia: diaDe(agoraEstavel(12, 10), 'treino') }
  });
  assert.strictEqual(b.vJ('ctx.cartaoDeCima').janela, true);
  assert.ok(b.texto('.ins-foco').indexOf('faltam') >= 0, b.texto('.ins-foco'));
  a.fechar(); b.fechar();
});

test('a linha acesa da timeline é o assunto do cartão', async () => {
  // Uma regra só para a mesma pergunta. Antes a linha acesa e o cartão vinham
  // da MESMA variável por acaso; agora a linha é derivada do cartão de
  // propósito, porque duas regras divergiriam e a tela diria duas coisas.
  const agora = agoraEstavel(10, 0);
  const a = await app({
    aba: 'hoje', agora: agora,
    estado: { plano: 7, logs: {}, done: [], dia: diaDe(agora, 'treino') }
  });

  const c = a.vJ('ctx.cartaoDeCima');
  assert.strictEqual(c.k, 'refeicao', 'pré-condição');
  const acesas = a.$$('.ins-tl.agora');
  assert.strictEqual(acesas.length, 1, 'uma linha acesa, e só uma');
  assert.ok(acesas[0].textContent.indexOf(a.vJ('ctx.hoje').refs
    .filter(r => r.id === c.id)[0].n) >= 0,
    'e é a do cartão: ' + acesas[0].textContent);
  a.fechar();
});

test('no Agora, o cartão da aula é um botão só e leva ao modo', async () => {
  // Frente 1, literal: "o cartão dela é um botão só: Fiz a aula". A aula É a
  // sessão daquele dia, e registrar acontece no modo — o quadro do box vira a
  // nota da sessão, e é a única chance de ele ficar em algum lugar.
  const agora = agoraEstavel(6, 45);
  const a = await app({
    aba: 'hoje', agora: agora,
    estado: {
      plano: 7,
      logs: {}, done: [
        { sid: 1, day: 'E', t: agora - 2 * DIA, dur: 70 * MIN, fim: 'manual', sets: [] }
      ],
      dia: diaDe(agora, 'treino')
    }
  });

  assert.strictEqual(a.vJ('ctx.cartaoDeCima').k, 'aula', 'pré-condição: a rotação caiu na aula');
  const txt = a.texto('.ins-foco');
  assert.ok(txt.indexOf('fiz a aula') >= 0, txt);
  assert.ok(!a.$('.ins-foco-acoes'), 'um botão só: nada de duas respostas aqui');

  a.$('.ins-foco').click();
  await a.esperar();
  assert.strictEqual(a.vista().modoSessao, true);
  assert.strictEqual(a.vista().day, 'HX', 'no dia da aula');
  a.fechar();
});

test('no Agora, com o dia fechado o topo confirma em vez de ficar mudo', async () => {
  // Regra 7: a tela não fica muda quando tudo foi feito. O topo passa a ser a
  // confirmação do que foi marcado, com "corrigir" — e é a ÚLTIMA do dia pelo
  // relógio, não a de marcação mais recente: o cartão confirma o fim do dia.
  const agora = agoraEstavel(23, 0);
  const a = await app({
    aba: 'hoje', agora: agora,
    estado: {
      plano: 7, logs: {}, done: [],
      dia: { data: dataLocal(agora), agua: 0, escala: {},
             cadencia: 'descanso', alta: 0,
             done: { pos: 1, almoco: 1, lanche: 1, jantar: 1, ceia: 1 } }
    }
  });

  const c = a.vJ('ctx.cartaoDeCima');
  assert.strictEqual(c.k, 'resolvido', 'pré-condição: nada à frente e nada sem marca');
  const txt = a.texto('.ins-foco');
  assert.ok(txt.indexOf('dia fechado') >= 0, txt);
  assert.ok(txt.indexOf('corrigir') >= 0, 'e oferece corrigir: ' + txt);
  a.fechar();
});

// ---------------------------------------------------------------------------
// O aviso de que nada vai ficar
// ---------------------------------------------------------------------------

test('aparelho que não está guardando avisa ACIMA do cartão', async () => {
  // §5.0 da frente 1, e é a parte do Agora que **não** é cartão: não disputa o
  // topo porque não é uma ação — é a condição de validade de todas as outras.
  //
  // O buraco que isto fecha é de perda de dado em SILÊNCIO. `src/infra/db.ts`
  // sonda o armazenamento e cai para memória em aba privada, e até aqui
  // NINGUÉM lia o resultado da sonda: o app abria inteiro, marcava refeição,
  // registrava série, e perdia tudo ao fechar a aba sem dizer uma palavra.
  const agora = agoraEstavel(12, 10);
  const a = await app({ aba: 'hoje', agora: agora, semArmazenamento: true });

  assert.strictEqual(a.v('ctx.guardando'), false, 'o app sabe que não está guardando');
  const aviso = a.$('.ins-aviso-perda');
  assert.ok(aviso, 'e diz');
  const txt = aviso.textContent;
  assert.ok(txt.indexOf('não está guardando') >= 0, txt);
  assert.ok(txt.indexOf('até fechar esta aba') >= 0, 'diz até QUANDO vale: ' + txt);
  assert.ok(txt.indexOf('14 dias') >= 0,
    'e que não entra na conta que a regra do corte lê: ' + txt);

  // ACIMA do cartão, e isto é a regra: a condição de validade vem antes da ação
  const html = a.doc.getElementById('app').innerHTML;
  assert.ok(html.indexOf('ins-aviso-perda') < html.indexOf('ins-foco'),
    'o aviso vem antes do cartão');
  a.fechar();
});

test('aparelho que guarda não mostra aviso nenhum', async () => {
  // A quebra espelhada: um aviso de perda num aparelho que guarda é alarme
  // falso, e alarme falso ensina a ignorar o verdadeiro.
  const agora = agoraEstavel(12, 10);
  const a = await app({ aba: 'hoje', agora: agora, estado: { logs: {}, done: [] } });
  assert.strictEqual(a.v('ctx.guardando'), true);
  assert.ok(!a.$('.ins-aviso-perda'), 'nada de aviso');
  a.fechar();
});

// ---------------------------------------------------------------------------
// A LISTA DAS MUDANÇAS QUE ESPERAM — a Prescrição virando a chamadora
// ---------------------------------------------------------------------------
//
// Peça 2 da ordem que o plano amarrou (§6.3): a conta de volume saiu do
// `main.jsx` para o domínio, esta lista passa a ser a chamadora dela, e só
// então a tela de decisão sai. Fora dessa ordem a conta desaparece entre uma
// coisa e outra.

const SLOT = 'elevacao-lateral-na-maquina';     // dia A, 3 séries, delt lateral

/** Uma mudança esperando decisão, na forma que o estado guarda. */
function esperando(agora, extra) {
  return Object.assign({
    sid: agora - 3 * DIA, day: 'A', t: agora - 3 * DIA,
    mods: [{ k: 'sets', slot: SLOT, de: 3, para: 5 }],
    resumoMods: ['Elevação lateral na máquina: 3 → 5 séries'],
    m: agora - 3 * DIA
  }, extra || {});
}

test('sem fila, a lista é vazia', async () => {
  const a = await app({ estado: { logs: {}, done: [] } });
  assert.deepStrictEqual(a.vJ('ctx.mudancasQueEsperam'), []);
  a.fechar();
});

test('cada linha diz o que mudou, de onde veio, quando vence e a conta de volume', async () => {
  // As quatro coisas do passo 3 do fluxo do vencimento, numa linha.
  const agora = agoraEstavel(9, 0);
  const a = await app({
    agora: agora,
    estado: { plano: 7, logs: {}, done: [], promoPendente: [esperando(agora)] }
  });
  a.v('ctx.fechaTudo');                 // a tela de decisão guardada abre no boot
  await a.esperar();

  const lista = a.vJ('ctx.mudancasQueEsperam');
  assert.strictEqual(lista.length, 1);
  const l = lista[0];
  assert.strictEqual(l.dia, 'A', 'de que sessão veio');
  assert.strictEqual(l.quando, agora - 3 * DIA, 'e quando ela aconteceu');
  assert.strictEqual(l.mudancas.length, 1);
  assert.ok(/3 → 5/.test(l.mudancas[0].txt), 'o que mudou: ' + l.mudancas[0].txt);

  // A CONTA, e ela tem que ser TRANSIÇÃO — "de 12 para 13" —, que é a forma que
  // o dono pediu e a única que `impactoDoMod` produz. `impacto()` afirma o
  // número de agora e não serviria aqui.
  assert.ok(l.mudancas[0].impacto, 'há conta de volume');
  assert.ok(/\d+ → \d+/.test(l.mudancas[0].impacto),
    'e ela é transição, não o número de agora: ' + l.mudancas[0].impacto);
  assert.ok(l.mudancas[0].impacto.indexOf('delt lateral') >= 0,
    'no músculo da mudança: ' + l.mudancas[0].impacto);

  // O VENCIMENTO: o dia em que aquele treino volta.
  assert.ok(typeof l.vence === 'number', 'há data de vencimento: ' + l.vence);
  assert.ok(l.vence >= agora, 'e ela não está no passado');
  a.fechar();
});

test('a conta de volume avisa quando a mudança passa do alvo do treinador', async () => {
  // `acima` é o que pinta o aviso, e ele tem que vir da conta e não de palpite.
  // Subir a lateral de 3 para 8 estoura qualquer alvo.
  const agora = agoraEstavel(9, 0);
  const a = await app({
    agora: agora,
    estado: { plano: 7, logs: {}, done: [], promoPendente: [esperando(agora, {
      mods: [{ k: 'sets', slot: SLOT, de: 3, para: 8 }]
    })] }
  });
  a.v('ctx.fechaTudo');
  await a.esperar();

  const m = a.vJ('ctx.mudancasQueEsperam')[0].mudancas[0];
  assert.strictEqual(m.acima, true, 'passou do alvo: ' + m.impacto);
  a.fechar();
});

test('com treino já registrado hoje, o vencimento começa a contar de AMANHÃ', async () => {
  // A única decisão deste invólucro. A posição de hoje já foi gasta: contar a
  // partir de hoje daria a letra de hoje a um dia que já aconteceu, e tudo
  // venceria um dia cedo.
  //
  // As duas montagens têm a MESMA sessão do A — uma ontem, outra hoje —, e isso
  // é o que faz o caso discriminar: `proximoTreino` é o B nas duas, porque a
  // última registrada é o A de qualquer forma. Se a diferença fosse "sem sessão
  // nenhuma" contra "sessão hoje", os dois efeitos se somariam e o verde viria
  // mesmo sem o deslocamento — foi o que a varredura de mutação mostrou.
  const agora = agoraEstavel(9, 0);
  const sessaoDoA = function (t) {
    return [{ sid: t, day: 'A', t: t, dur: 70 * MIN, fim: 'manual', sets: [] }];
  };
  const monta = async function (quando) {
    const x = await app({ agora: agora, estado: {
      plano: 7, logs: {}, done: sessaoDoA(quando), promoPendente: [esperando(agora)]
    } });
    x.v('ctx.fechaTudo');
    await x.esperar();
    return x;
  };

  const ontem = await monta(agora - DIA);
  const hoje = await monta(agora - 60 * MIN);
  assert.strictEqual(ontem.vJ('ctx.hoje').diaHoje.origem, 'previsto',
    'pré-condição: na primeira, o treino de hoje ainda não aconteceu');
  assert.strictEqual(hoje.vJ('ctx.hoje').diaHoje.origem, 'registrado',
    'e na segunda, aconteceu');

  const a1 = ontem.vJ('ctx.mudancasQueEsperam')[0].vence;
  const a2 = hoje.vJ('ctx.mudancasQueEsperam')[0].vence;
  assert.ok(a1 != null && a2 != null, 'as duas têm data: ' + a1 + ' / ' + a2);
  assert.ok(a2 > a1,
    'com o treino de hoje já registrado, a volta do A é mais tarde — e só o ' +
    'deslocamento explica isso, porque a letra da frente é a mesma (' + a1 + ' → ' + a2 + ')');
  ontem.fechar(); hoje.fechar();
});

test('a fila entra ordenada, mesmo chegando fora de ordem', async () => {
  // A mais antiga primeiro: é a única ordem que ele reconhece, e é a mesma
  // ordem que a abertura guardada já usava.
  //
  // O caso semeia FORA DE ORDEM de propósito, e isso é um caminho real: o
  // escritor ordena e a fusão ordena, mas a IMPORTAÇÃO copia a chave como ela
  // vem no arquivo. Fora de ordem, o app perguntaria primeiro pela mudança mais
  // nova — o contrário do que o próprio comentário de `abrePromoGuardada` diz.
  // Quem ordena agora é `normalizaEstado`, por onde todo estado entra.
  const agora = agoraEstavel(9, 0);
  const a = await app({
    agora: agora,
    estado: { plano: 7, logs: {}, done: [], promoPendente: [
      esperando(agora, { sid: 2, t: agora - 1 * DIA, day: 'A' }),
      esperando(agora, { sid: 1, t: agora - 9 * DIA, day: 'A' })
    ] }
  });
  a.v('ctx.fechaTudo');
  await a.esperar();

  const lista = a.vJ('ctx.mudancasQueEsperam');
  assert.strictEqual(lista.length, 2);
  assert.ok(lista[0].quando < lista[1].quando,
    'a mais antiga primeiro: ' + lista.map(l => l.quando).join(' · '));
  a.fechar();
});
