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

test('passada a janela do treino, a refeição da janela assume o topo', async () => {
  // O treino das 6h15 acabaria muito antes. Às 12h05 o cartão é o almoço das
  // 12h30, que está na janela; às 10h, longe dela, não há cartão.
  const ag = function (h, m) {
    return { logs: {}, done: [],
             dia: { data: dataLocal(agoraEstavel(h, m)), done: {}, agua: 0, escala: {}, cadencia: 'treino', alta: 0 } };
  };
  const a = await app({ agora: agoraEstavel(12, 5), estado: ag(12, 5) });
  const c = a.vJ('ctx.cartaoDeCima');
  assert.strictEqual(c.k, 'refeicao');
  assert.strictEqual(c.id, 'almoco', 'o almoço das 12h30 é o próximo à frente');
  assert.strictEqual(c.janela, true);
  a.fechar();
  const b = await app({ agora: agoraEstavel(10, 0), estado: ag(10, 0) });
  assert.strictEqual(b.vJ('ctx.cartaoDeCima'), null, 'longe da janela: nenhum cartão');
  b.fechar();
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
  assert.strictEqual(a.vJ('ctx.cartaoDeCima'), null,
    'e mesmo assim o treino não disputa: dois treinos no mesmo dia são ' +
    'possíveis, e o segundo volta a ganhar pela sessão ABERTA, que é o degrau 1. ' +
    'O café das 8h está fora da janela, então o topo se cala');
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

test('aparelho que guarda não mostra aviso nenhum', async () => {
  // A quebra espelhada: um aviso de perda num aparelho que guarda é alarme
  // falso, e alarme falso ensina a ignorar o verdadeiro.
  const agora = agoraEstavel(12, 10);
  const a = await app({ aba: 'agora', agora: agora, estado: { logs: {}, done: [] } });
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
  assert.strictEqual(l.mudancas[0].txt, 'Elevação lateral na máquina: 5 séries, não 3', 'o que mudou, o número que vale primeiro');

  // A CONTA, e ela tem que ser TRANSIÇÃO — "de 12 para 13" —, que é a forma que
  // o dono pediu e a única que `impactoDoMod` produz. `impacto()` afirma o
  // número de agora e não serviria aqui.
  assert.ok(l.mudancas[0].impacto, 'há conta de volume');
  assert.ok(/^Se entrar no Treino A: .+ passa de \d+ para \d+ séries na rotação\./.test(l.mudancas[0].impacto),
    'e ela é transição, com o destino na frente e sem seta: ' + l.mudancas[0].impacto);
  assert.ok(l.mudancas[0].impacto.indexOf('delt lateral') >= 0,
    'no músculo da mudança: ' + l.mudancas[0].impacto);

  // O VENCIMENTO, em treinos e não em data: a sequência anda pela ordem.
  assert.ok(/^vence (na próxima vez do Treino A — que é a próxima sessão|quando o Treino A voltar · faltam? \d+ treinos?)$/.test(l.vence),
    'há vencimento, contado em treinos: ' + l.vence);
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

test('o vencimento conta TREINOS pela ordem, e o calendário não entra na conta', async () => {
  // §5.3 da frente 3: a data era previsão do app dita como fato. A sequência
  // anda pela ORDEM — A, B, C, D, E, HX —, e uma posição não é uma quarta-feira.
  //
  // As duas montagens têm a MESMA sessão do A — uma ontem, outra hoje. Quando o
  // vencimento era data, a de hoje deslocava a volta um dia; contado em treinos,
  // as duas dizem o mesmo, porque o próximo é o B nas duas e entre ele e a volta
  // do A passam B, C, D, E e HX.
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
  assert.strictEqual(a1, 'vence quando o Treino A voltar · faltam 5 treinos');
  assert.strictEqual(a2, a1, 'o dia em que ele treinou não muda a conta: ela é de posição');
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

// ---------------------------------------------------------------------------
// A FILA NA TELA — e as duas respostas
// ---------------------------------------------------------------------------

/** A Prescrição com uma sessão esperando decisão, no chip do programa. */
async function comFila(agora, mods) {
  const a = await app({
    aba: 'prescricao', agora: agora,
    estado: {
      plano: 7, logs: {}, done: [],
      promoPendente: [{
        sid: agora - 3 * DIA, day: 'A', t: agora - 3 * DIA, m: agora - 3 * DIA,
        mods: mods, resumoMods: mods.map(function () { return ''; })
      }]
    }
  });
  // `vaiPara` e não `fechaTudo`: a decisão guardada abre no boot como TELA
  // CHEIA, e `fechaTudo` só limpa folhas. Quem fecha destino é `vaiPara`, que
  // zera `view.promo` junto com os outros — e é por isso que o lugar pedido
  // aparece. (Enquanto `decisao.jsx` não sair, este é o caminho.)
  a.v('ctx.vaiPara', 'prescricao');
  await a.esperar();
  return a;
}

test('o Agora não avisa sobre o que já venceu, nem quando o dia volta de novo', async () => {
  // O aviso é heads-up do que está PARA vencer. O que já venceu não tem mais
  // aviso a dar — tem o bloco de Prescrição, que é dito e desfazível. Avisar
  // dos dois jeitos faria o Agora cobrar uma decisão que o tempo já tomou.
  //
  // O fixture é construído para DISCRIMINAR, e levou uma mutação para eu
  // perceber: com o A voltando só uma vez, o vencimento CALCULADO não cai hoje
  // de todo jeito, e o caso ficava verde sem a guarda. Aqui o A volta DUAS
  // vezes — a sessão do A venceu a mudança, a volta inteira girou até o E, e
  // portanto `vence` é HOJE ao mesmo tempo que `venceu` é verdade. (A aula
  // não gira mais a sequência — fica fora da ordem, decisão de 14/10 —, então
  // a volta fecha no E.) Só a guarda explica o silêncio.
  const agora = agoraEstavel(6, 30);
  const nasceu = agora - 20 * DIA;
  const volta = ['A', 'B', 'C', 'D', 'E'].map(function (d, i) {
    const t = agora - (9 - i) * DIA;
    return { sid: t, day: d, t: t, dur: 70 * MIN, fim: 'manual', sets: [] };
  });
  const a = await app({
    aba: 'agora', agora: agora,
    estado: {
      plano: 7, logs: {},
      done: volta.concat([{ sid: agora - 2 * DIA, day: 'HX', t: agora - 2 * DIA,
                            dur: 70 * MIN, fim: 'manual', sets: [] }]),
      dia: diaDe(agora, 'treino'),
      promoPendente: [{
        sid: nasceu, day: 'A', t: nasceu, m: nasceu,
        mods: [{ k: 'sets', slot: SLOT, de: 3, para: 5 }], resumoMods: ['']
      }]
    }
  });

  const g = a.vJ('ctx.mudancasQueEsperam')[0];
  assert.strictEqual(g.venceu, true, 'pré-condição: o A já voltou depois dela');
  assert.strictEqual(g.venceHoje, true, 'e o A volta OUTRA VEZ, hoje');

  assert.strictEqual(a.vJ('ctx.esperandoDecisao'), null,
    'o Agora não avisa de novo: o vencido não tem aviso a dar, tem porta de volta');
  assert.strictEqual(a.$('.ag-vence'), null, 'e não desenha a linha');
  a.fechar();
});

test('a nota dos 14 dias diz onde o portão está, sem virar nota de prova', async () => {
  // Contagem, e nunca percentual: um número contra 100% implícito funciona como
  // nota, e feedback que dirige a atenção para a autoavaliação piora o
  // desempenho. A nota diz o limiar e para aí.
  const agora = agoraEstavel(9, 0);
  const a = await app({
    aba: 'agora', agora: agora,
    estado: { plano: 7, logs: {}, done: [], comidaHist: [], dia: diaDe(agora, 'treino') }
  });
  await a.esperar();

  const q = a.vJ('ctx.quatorzeDias');
  assert.strictEqual(q.registrados, 0);
  assert.strictEqual(q.aberto, false);
  assert.match(q.nota, /a regra pede 11 para mexer nas calorias/);
  assert.ok(!/%/.test(q.txt + q.nota), 'sem percentual em lugar nenhum: ' + q.txt + ' · ' + q.nota);
  a.fechar();
});

// ---------------------------------------------------------------------------
// PÔR UM DIA EM DIA — a metade de modelo
// ---------------------------------------------------------------------------
//
// A tarefa que o app não tinha: registrar a terça que ele esqueceu de marcar. O
// chão é `poeComidaNoDia`, e estes casos cobram as leituras e a escrita, antes
// de qualquer pixel.
//
// As cinco marcas são cinco coisas DIFERENTES no dado, e o quinto botão é o que
// destrava o portão de adesão: declarar "não comi" com um toque produz dia
// CONTADO, em vez de silêncio — e silêncio não conta para o 11 em 14.

/** Uma data de k dias atrás, local. */
function diasAtras(agora, k) {
  const d = new Date(agora);
  d.setDate(d.getDate() - k);
  return dataLocal(d.getTime());
}

test('um dia passado sem registro abre pré-marcado, e a sugestão diz que é sugestão', async () => {
  const agora = agoraEstavel(9, 0);
  const a = await app({ aba: 'dias', agora: agora,
                        estado: { plano: 7, logs: {}, done: [], comidaHist: [] } });
  const d = a.vJ('ctx.poeODiaEmDia', diasAtras(agora, 3));

  assert.ok(d, 'a folha abre para um dia passado');
  assert.strictEqual(d.fechado, false, 'e diz que aquele dia não tem linha ainda');
  assert.ok(d.linhas.length >= 4, 'com as refeições do plano: ' + d.linhas.length);
  assert.ok(d.linhas.every(function (l) { return l.marca === 'tudo'; }),
    'dia passado vem tudo marcado — é a sugestão');
  // A distinção entre sugerido e registrado NÃO pode ser só de cor (1.4.1): a
  // linha carrega a procedência em palavra.
  assert.ok(d.linhas.every(function (l) { return l.sugerida === true; }));
  assert.ok(/marcada pelo horário/.test(d.linhas[0].procedencia), d.linhas[0].procedencia);

  // E a procedência do PLANO, porque o plano daquela data não existe em lugar
  // nenhum: um dia posto em dia é contado contra o plano de hoje.
  assert.match(d.plano, /contado contra o plano de hoje/);
  a.fechar();
});

test('um dia já registrado mostra o que está registrado, não a sugestão', async () => {
  const agora = agoraEstavel(9, 0);
  const data = diasAtras(agora, 3);
  const a = await app({ aba: 'dias', agora: agora, estado: {
    plano: 7, logs: {}, done: [],
    comidaHist: [{ d: data, done: { almoco: agora - 3 * DIA }, agua: 0,
                   escala: { almoco: 0.5 }, tot: {}, pv: 1, m: agora }]
  } });
  const d = a.vJ('ctx.poeODiaEmDia', data);

  assert.strictEqual(d.fechado, true);
  const almoco = d.linhas.filter(function (l) { return l.id === 'almoco'; })[0];
  assert.strictEqual(almoco.marca, 'metade', 'a meia porção registrada aparece');
  assert.strictEqual(almoco.sugerida, false, 'e não é sugestão: ele declarou');
  assert.strictEqual(almoco.procedencia, null, 'então não há procedência de horário a dizer');

  // E as que ele NÃO marcou num dia já gravado aparecem VAZIAS, não sugeridas:
  // num dia declarado, linha sem marca é ausência declarada. Sugerir ali faria o
  // dia não convergir — esvaziar uma linha a devolveria como sugestão, e o toque
  // seguinte em outra a re-gravaria.
  const outra = d.linhas.filter(function (l) { return l.id !== 'almoco'; })[0];
  assert.strictEqual(outra.marca, 'vazia', 'o que ele não marcou está vazio');
  assert.strictEqual(outra.sugerida, false, 'e não é sugestão: o dia já foi declarado');
  a.fechar();
});

test('a folha não abre para um dia que não aconteceu', async () => {
  const agora = agoraEstavel(9, 0);
  const a = await app({ aba: 'dias', agora: agora, estado: { plano: 7, logs: {}, done: [] } });
  const amanha = new Date(agora);
  amanha.setDate(amanha.getDate() + 1);

  assert.strictEqual(a.vJ('ctx.poeODiaEmDia', dataLocal(amanha.getTime())), null,
    'dia que não aconteceu não se registra');
  assert.strictEqual(a.vJ('ctx.poeODiaEmDia', 'ontem'), null, 'nem data ilegível');
  a.fechar();
});

test('o PRIMEIRO toque grava o dia inteiro como sugerido, com a linha tocada corrigida', async () => {
  // Decisão P3.i.6, e a consequência precisa: não é "o toque grava aquela
  // linha" — é "o toque transforma a sugestão inteira em registro, com a linha
  // tocada já corrigida". Qualquer outra leitura exige um botão de guardar, e o
  // botão está proibido.
  const agora = agoraEstavel(9, 0);
  const data = diasAtras(agora, 3);
  const a = await app({ aba: 'dias', agora: agora,
                        estado: { plano: 7, logs: {}, done: [], comidaHist: [] } });
  const antes = a.vJ('ctx.poeODiaEmDia', data);

  await a.v('ctx.marcaNoDiaPassado', data, 'almoco', 'metade', null);
  await a.esperar(60);

  const h = a.S().comidaHist.filter(function (x) { return x.d === data; })[0];
  assert.ok(h, 'o dia virou linha no histórico');
  assert.strictEqual(Object.keys(h.done).length, antes.linhas.length,
    'o dia INTEIRO foi gravado, e não só a linha tocada');
  assert.strictEqual(h.escala.almoco, 0.5, 'com a linha tocada já corrigida');
  a.fechar();
});

test('"não comi" produz dia CONTADO — é o que destrava o portão', async () => {
  // Decisão 1 das quinze. Até aqui `'nao'` existia no domínio e não tinha
  // porta: o modelo o alcançava, o dedo não. E a diferença é o portão — silêncio
  // não conta para o 11 em 14; "não comi" dito como fato conta.
  const agora = agoraEstavel(9, 0);
  const data = diasAtras(agora, 3);
  const a = await app({ aba: 'dias', agora: agora,
                        estado: { plano: 7, logs: {}, done: [], comidaHist: [] } });

  await a.v('ctx.marcaNoDiaPassado', data, 'jantar', 'nao', null);
  await a.esperar(60);

  const h = a.S().comidaHist.filter(function (x) { return x.d === data; })[0];
  assert.strictEqual(h.como.jantar, 'nao', '"não comi" é dito como FATO no dado');
  // E o dia entra na conta dos 14, que é a única razão pela qual pôr um dia em
  // dia vale a pena para a regra.
  assert.ok(a.vJ('ctx.quatorzeDias').registrados >= 1,
    'o dia passou a contar: ' + a.vJ('ctx.quatorzeDias').txt);
  a.fechar();
});

test('"não sei" pesa zero e o dia CONTINUA contando', async () => {
  // Decisão 2, e a razão é do projeto: subestimar SEGURA o corte; inflar
  // autoriza um corte que não devia acontecer. Peso 0 DENTRO do denominador.
  const agora = agoraEstavel(9, 0);
  const data = diasAtras(agora, 3);
  const a = await app({ aba: 'dias', agora: agora,
                        estado: { plano: 7, logs: {}, done: [], comidaHist: [] } });

  await a.v('ctx.marcaNoDiaPassado', data, 'almoco', 'nsei', null);
  await a.esperar(60);

  const h = a.S().comidaHist.filter(function (x) { return x.d === data; })[0];
  assert.strictEqual(h.como.almoco, 'nsei');
  assert.ok(a.vJ('ctx.quatorzeDias').registrados >= 1,
    'o dia continua interpretável: a incerteza aparece no número baixo, não na ausência');
  a.fechar();
});

test('a folha NÃO apaga marca nenhuma, e isso é limite do chão', async () => {
  // §4.1, limite 2: "pôr um dia em dia não apaga nada. Marca nova vence marca
  // velha chave a chave; o resto fica. A folha não oferece limpar o dia, e NÃO
  // PODE oferecer: apagar um dia do histórico é destrutivo e não foi desenhado".
  //
  // Eu havia inventado uma marca "vazia" para tirar a refeição do registro, e a
  // rede mostrou que ela não funcionava — o merge a devolvia na chamada
  // seguinte. O defeito era MEU, por especificar comportamento que a função não
  // permite. Este caso é o que grava o limite, para ninguém reinventar.
  const agora = agoraEstavel(9, 0);
  const data = diasAtras(agora, 5);
  const a = await app({ aba: 'dias', agora: agora,
                        estado: { plano: 7, logs: {}, done: [], comidaHist: [] } });

  await a.v('ctx.marcaNoDiaPassado', data, 'almoco', 'tudo', null);
  await a.esperar(60);
  const antes = Object.keys(a.S().comidaHist.filter(function (x) { return x.d === data; })[0].done);
  assert.ok(antes.length >= 4, 'o dia inteiro entrou: ' + antes.join(','));

  // qualquer toque seguinte CORRIGE, e nenhum remove
  await a.v('ctx.marcaNoDiaPassado', data, 'jantar', 'nao', null);
  await a.esperar(60);
  const h = a.S().comidaHist.filter(function (x) { return x.d === data; })[0];
  assert.deepStrictEqual(Object.keys(h.done).sort(), antes.sort(),
    'as mesmas refeições continuam no registro');
  assert.strictEqual(h.como.jantar, 'nao', 'e a corrigida mudou de marca, não de existência');
  a.fechar();
});

test('a porção acima de 1 alcança o dia passado', async () => {
  // Decisão 3: os mesmos cinco valores que o dia corrente já tem. "Comi uma vez
  // e meia o almoço" passa a se dizer de um dia passado.
  const agora = agoraEstavel(9, 0);
  const data = diasAtras(agora, 3);
  const a = await app({ aba: 'dias', agora: agora,
                        estado: { plano: 7, logs: {}, done: [], comidaHist: [] } });

  const d = a.vJ('ctx.poeODiaEmDia', data);
  assert.deepStrictEqual(d.porcoes, [0.5, 0.75, 1, 1.25, 1.5],
    'os cinco valores, e dois acima de 1');

  await a.v('ctx.marcaNoDiaPassado', data, 'almoco', 'tudo', 1.5);
  await a.esperar(60);
  const h = a.S().comidaHist.filter(function (x) { return x.d === data; })[0];
  assert.strictEqual(h.escala.almoco, 1.5);
  a.fechar();
});

test('o dia mudo é inalcançável PELA FOLHA, e o chão é quem guarda isso', async () => {
  // Eu havia escrito um caso esvaziando linha por linha até o dia ficar mudo, e
  // ele não convergia — porque a folha não apaga (o caso acima) e porque as
  // cinco marcas todas MARCAM. Pela folha, um dia tocado nunca fica mudo.
  //
  // A recusa `'mudo'` continua existindo e continua certa: ela é a guarda do
  // CHÃO, para qualquer chamador. `tests/dominio/diario.test.ts` a cobra na
  // função; aqui o que se grava é que a folha não tem como chegar lá — e por
  // isso a doutrina contra falso sucesso não precisa de tela nenhuma neste
  // caminho.
  const agora = agoraEstavel(9, 0);
  const data = diasAtras(agora, 5);
  const a = await app({ aba: 'dias', agora: agora,
                        estado: { plano: 7, logs: {}, done: [], comidaHist: [] } });

  const marcas = a.vJ('ctx.poeODiaEmDia', data).linhas.map(function (l) { return l.marca; });
  assert.ok(marcas.every(function (m) { return m !== 'vazia'; }),
    'nenhuma linha nasce vazia num dia sem registro: a sugestão é marcar');

  for (const m of ['tudo', 'metade', 'fora', 'nsei', 'nao']) {
    await a.v('ctx.marcaNoDiaPassado', data, 'almoco', m, null);
    await a.esperar(40);
    const h = a.S().comidaHist.filter(function (x) { return x.d === data; })[0];
    assert.ok(h && Object.keys(h.done).length > 0,
      'a marca "' + m + '" mantém o dia registrado');
  }
  a.fechar();
});

test('a folha oferece as CINCO marcas por linha, e "Não comi" é uma delas', async () => {
  const agora = agoraEstavel(9, 0);
  const data = diasAtras(agora, 5);
  const a = await app({ aba: 'dias', agora: agora,
                        estado: { plano: 7, logs: {}, done: [], comidaHist: [] } });
  a.v('ctx.abrePoeODia', data);
  await a.esperar(60);

  // o texto à vista (a nota do palpite, só para leitor de tela, fica de fora)
  const marcas = a.$$('[data-a^="marca-almoco-"]').map(function (b) { return b.childNodes[0].textContent; });
  assert.deepStrictEqual(marcas, ['Tudo', 'Metade', 'Fora', 'Não sei', 'Não comi'],
    'as cinco, e o quinto é o que destrava o portão');
  // A sugestão do horário NÃO é resposta: nenhuma ficha vem marcada
  // (`aria-checked`) antes do toque, e a sugerida chega ao leitor de tela como
  // sugestão, não como "selecionado" — quem fechasse achando que marcou não
  // registraria o dia.
  const marcadas = a.$$('[data-a^="marca-almoco-"]').filter(function (b) {
    return b.getAttribute('aria-checked') === 'true';
  });
  assert.strictEqual(marcadas.length, 0, 'nada registrado antes do toque');
  const palpite = a.$$('[data-a^="marca-almoco-"].palpite');
  assert.strictEqual(palpite.length, 1, 'um palpite por linha');
  assert.ok(/^Tudo/.test(palpite[0].textContent) && /sugestão/.test(palpite[0].textContent), 'e a sugestão é "tudo", dita como sugestão');
  a.fechar();
});

test('a folha não tem "Cancelar", e fechar sem tocar não grava', async () => {
  // Fechar sem tocar não grava nada — e se ele tocou, o dia está gravado e
  // fechar não desfaz: não existe lote. Oferecer um cancelar que não cancela é
  // falso, e por isso ele não existe.
  const agora = agoraEstavel(9, 0);
  const data = diasAtras(agora, 5);
  const a = await app({ aba: 'dias', agora: agora,
                        estado: { plano: 7, logs: {}, done: [], comidaHist: [] } });
  a.v('ctx.abrePoeODia', data);
  await a.esperar(60);

  const cancelar = a.$$('button').filter(function (b) { return /cancelar/i.test(b.textContent); });
  assert.deepStrictEqual(cancelar, [], 'não há "Cancelar"');

  a.v('ctx.fechaFolha');
  await a.esperar(60);
  assert.deepStrictEqual(a.S().comidaHist, [], 'fechar sem tocar não gravou nada');
  a.fechar();
});

// ---------- §5 da frente 3: as palavras da lista que vence ----------

test('as mudanças falam uma gramática só: o que vale primeiro, e o que era depois', async () => {
  // §5.2: "adicionou", "removeu" e "mudou" narravam os atos dele em terceira
  // pessoa (V8), e a flecha é tabular. O `med` não estava entre as sete e caía
  // em "mudança", que não diz nada.
  const a = await app({ estado: { plano: 7, logs: {}, done: [] } });
  const outro = a.S().prog.A.ex[1].id;
  const n = a.v('nomeEx', SLOT), m = a.v('nomeEx', outro);
  const t = function (mod) { return a.v('textoMod', 'A', mod); };
  assert.strictEqual(t({ k: 'add', id: SLOT }), n + ': entrou no dia');
  assert.strictEqual(t({ k: 'rm', slot: SLOT }), n + ': saiu do dia');
  assert.strictEqual(t({ k: 'troca', slot: SLOT, por: outro }), m + ' no lugar de ' + n);
  assert.strictEqual(t({ k: 'sets', slot: SLOT, de: 3, para: 4 }), n + ': 4 séries, não 3');
  assert.strictEqual(t({ k: 'reps', slot: SLOT, de: 10, para: 8 }), n + ': 8 repetições, não 10');
  assert.strictEqual(t({ k: 'desc', slot: SLOT, de: 120, para: 90 }),
    n + ': descanso de ' + a.v('fmtDesc', 90) + ', não ' + a.v('fmtDesc', 120));
  assert.strictEqual(t({ k: 'mover', slot: SLOT, de: 3, para: 1 }), n + ': feito antes, fora da ordem');
  assert.strictEqual(t({ k: 'mover', slot: SLOT, de: 1, para: 3 }), n + ': feito depois, fora da ordem');
  assert.strictEqual(t({ k: 'med', slot: SLOT, u: 'm', q: 500 }), n + ': medido em 500 m');
  a.fechar();
});

test('o vencimento diz quantos treinos faltam, e o da próxima sessão diz que é ela', async () => {
  const agora = agoraEstavel(9, 0);
  const a = await app({ agora: agora, estado: { plano: 7, logs: {}, done: [],
    promoPendente: [esperando(agora), esperando(agora, { sid: agora - 2 * DIA, t: agora - 2 * DIA, day: 'B' })] } });
  a.v('ctx.fechaTudo');
  await a.esperar();
  assert.strictEqual(a.v('proximoTreino', a.S(), a.dado('ROT_BASE')), 'A', 'pré-condição: sem sessão, o próximo é o A');
  const l = a.vJ('ctx.mudancasQueEsperam');
  assert.strictEqual(l[0].vence, 'vence na próxima vez do Treino A — que é a próxima sessão');
  assert.strictEqual(l[1].vence, 'vence quando o Treino B voltar · falta 1 treino');
  a.fechar();
});

// ---------------------------------------------------------------------------
// A comida de hoje, em linhas que abrem no lugar (a D, `agora-descanso.html`
// estado 2; `momento-2.html` estados 1 e 5). Um toque grava.
// ---------------------------------------------------------------------------

async function agoraComLinhas(h, m) {
  const agora = agoraEstavel(h, m);
  return app({ aba: 'agora', agora: agora,
               estado: { plano: 7, logs: {}, done: [], dia: diaDe(agora, 'descanso') } });
}

test('o começo de um treino registrado se corrige no detalhe, e as séries continuam dele', async () => {
  // O treino aberto ao vivo depois da hora ficava com o começo da hora de agora,
  // e não havia onde dizer a hora de verdade (dono, 21/10).
  const agora = agoraEstavel(17, 50);
  const t = agora - 53 * 60000;        // começou "às 16h57", que é quando ele abriu o app
  const a = await app({
    aba: 'dias', agora: agora,
    estado: { plano: 7, done: [{ t: t, day: 'B', sid: t, dur: 45 * 60000, fim: 'manual', hora: 1 }],
              logs: { x1: [{ t: t + 60000, sid: t, sets: [[60, 9]] }] } }
  });
  a.v('ctx.abreSessaoDoDia', { k: 'sessao', t: t });
  await a.esperar();
  // tocar no quadro do começo abre a correção do tempo
  a.clicar('[data-a="sessao-ini"]');
  await a.esperar();
  const campo = a.$('[data-a="sessao-comeco"]');
  assert.ok(campo, 'o campo do começo aparece no painel de corrigir');
  campo.value = '06:15';
  campo.dispatchEvent(new a.window.Event('input', { bubbles: true }));
  await a.esperar(60);
  const m = a.S().done[0];
  const d = new Date(m.t);
  assert.strictEqual(d.getHours() + ':' + d.getMinutes(), '6:15', 'o começo passou a 6h15');
  assert.strictEqual(m.sid, t, 'a identidade do registro não muda');
  assert.strictEqual(m.dur, 45 * 60000, 'a duração fica: o fim anda junto');
  assert.strictEqual(a.S().logs.x1[0].sid, t, 'e as séries continuam ligadas a ele');
  a.fechar();
});

