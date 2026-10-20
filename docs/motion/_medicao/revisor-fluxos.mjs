// Os fluxos que o Revisor grava, em ordem de valor (a ordem de
// docs/motion/02-navegacao.md §2 e de docs/motion/03-micro.md §0, juntas).
// Usado por revisor-gravar.mjs; documentado em docs/motion/07-revisao-base.md §2.
//
// Cada fluxo: `hora` (o relógio do app, quinta 15/10/2026), `montar` (código no
// escopo do app, por `window.__escopo`; o que ele devolve chega às funções
// `alvo` dos passos), `depoisDeMontar` (opcional, com a página na mão) e
// `passos`. Cada passo: `alvo` (seletor, ou função do que `montar` devolveu),
// `nth` (-1 = o último), `tipo` ('toque' padrão · 'voltar' · 'espera' · 'codigo'),
// `pausaAntes` e `depois` (ms), `segura` (ms de dedo pousado), `semRolar` e
// `confere` (expressão na página que tem de dar verdadeiro depois do passo: é o
// que prova que o toque chegou ao alvo certo, inclusive no meio de um movimento)
// e `mov`, o movimento que o DEPOIS tem de mostrar naquele passo, pelas
// respostas do dono de 16/10 (08 §5.1): 'entra'/'sai' (camada, 350 ms na curva
// do iPhone; `debaixo` pede a conferência "a de baixo parada"), 'quique' (só a
// chegada da folha e do painel de apagar, 640 ms), 'aba' (carrossel, 350 ms),
// 'lugar' (pouso, copo, forma: 160 ms), 'aviso' (160 ms), 'nenhum'; `rolagemDe`
// diz de que passo a rolagem tem de voltar (02 T6). Quem lê é o
// revisor-compara.mjs; a gravação não usa.
//
// Os seletores são os do app em a22b09d. Se a fase 3 renomear algum, o passo
// falha com "ERRO" no resumo e no JSON, em vez de gravar outra coisa: conserte
// aqui, nos dois lados (antes e depois rodam o mesmo arquivo).

// Uma sessão já aberta há 30 min, sem série (a faixa aparece fora do modo).
const SESSAO_ABERTA = `
  const ag = Date.now() - 1800000, dd = nextDay();
  S.sessao = { day: dd, inicio: ag, ultima: Date.now() - 60000, sid: ag, manual: 1, pausas: [], pulados: [] };
  S.done.push({ day: dd, t: ag, sid: ag, ini: 'manual' });
  view.day = dd;
`;
// A refeição do momento ainda não marcada (às 13h10, o almoço), aberta ou não.
const REFEICAO_DA_HORA = abre => `
  (function () {
    const d = diaDeComida(), agora = new Date(Date.now()), min = agora.getHours() * 60 + agora.getMinutes();
    const livres = planoDeComida().filter(function (r) { return !d.done[r.id]; });
    const m = function (r) { const p = r.t.split(':'); return +p[0] * 60 + +p[1]; };
    const r = livres.filter(function (r) { return m(r) <= min; }).pop() || livres[0];
    CTX.vaiPara('agora');
    ${abre ? 'CTX.abreLinhaDaComida(r.id);' : ''}
    render(); window.scrollTo(0, 0);
    return r.id;
  })()
`;

export const FLUXOS = [
  {
    id: '01-modo-cartao', hora: '07:10',
    titulo: 'Entrar e sair do modo de sessão pelo cartão do Agora (02 T1)',
    montar: `CTX.vaiPara('agora'); render(); window.scrollTo(0, 0);`,
    passos: [
      { id: 'entra', mov: { tipo: 'entra', ms: 350, debaixo: 'entra' }, titulo: 'toca o cartão do treino de hoje: o modo de sessão abre', alvo: 'button.ins-foco, .ins-foco button', confere: `!!document.querySelector('.ins-modo')` },
      { id: 'sai', mov: { tipo: 'sai', ms: 350, debaixo: 'sai', rolagemDe: 'entra' }, titulo: 'toca a seta "‹" do modo: volta ao Agora, com a sessão aberta', alvo: '.ins-modo-sair', pausaAntes: 700, confere: `!document.querySelector('.ins-modo') && !!document.querySelector('.ins-tabbar')` }
    ]
  },
  {
    id: '02-modo-faixa', hora: '07:10',
    titulo: 'Entrar no modo pela faixa, do fundo do Corpo, e sair pela seta (02 T1 e T6: a rolagem que volta cortada)',
    montar: SESSAO_ABERTA + `CTX.vaiPara('corpo'); render();`,
    // (peça 6: o vaiPara('corpo') do montar passou a ser o carrossel, e o app
    // rola ao topo quando o desenho novo entra; rolar antes disso não fica.
    // Espera a troca acabar.)
    depoisDeMontar: async p => { await p.waitForTimeout(700); await p.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight)); await p.waitForTimeout(300); },
    passos: [
      { id: 'entra', mov: { tipo: 'entra', ms: 350, debaixo: 'entra' }, titulo: 'toca a faixa "treino em andamento" no fundo do Corpo', alvo: '.ins-faixa', semRolar: true },
      { id: 'sai', mov: { tipo: 'sai', ms: 350, debaixo: 'sai', rolagemDe: 'entra' }, titulo: 'toca a seta "‹": o Corpo volta — em que rolagem?', alvo: '.ins-modo-sair', pausaAntes: 700 }
    ]
  },
  {
    id: '03-serie-regua', hora: '07:10',
    titulo: 'Gravar duas séries pela régua: o painel nasce, a célula recebe o número, o cronômetro nasce (03 §4.2, §4.3)',
    montar: `CTX.abreTreinoDeHoje(); if (view.open !== 0) toggle(0); anotaSerie(0, 0, 0, 40); anotaSerie(0, 1, 0, 40); render();`,
    passos: [
      { id: 'abre-regua', mov: { tipo: 'nenhum' }, titulo: 'toca a célula de repetições da série 1: a régua nasce embaixo', alvo: '#r0_0' },
      { id: 'grava-1', mov: { tipo: 'lugar', ms: 350, nota: 'pouso 160 + cronômetro sobe 350' }, titulo: 'toca 3º valor da régua: a 1ª série da sessão grava (relógio e cronômetro nascem)', alvo: '.regua-v', nth: 2, depois: 1100 },
      { id: 'abre-regua-2', mov: { tipo: 'nenhum' }, titulo: 'toca a célula de repetições da série 2', alvo: '#r0_1' },
      { id: 'grava-2', mov: { tipo: 'lugar', ms: 160, nota: 'pouso; o descanso novo troca no lugar; o avanço continua salto' }, titulo: 'toca o 3º valor: a 2ª série grava, o descanso recomeça', alvo: '.regua-v', nth: 2, depois: 1100 }
    ]
  },
  {
    id: '03b-primeira-serie-fria', hora: '07:10', aquecer: false,
    titulo: 'A 1ª série da sessão a frio: sem a passada de aquecimento, o AudioContext nasce no toque (04 §2.7, R8); no WebKit desta máquina entra também a fonte',
    montar: `CTX.abreTreinoDeHoje(); if (view.open !== 0) toggle(0); anotaSerie(0, 0, 0, 40); render();`,
    passos: [
      { id: 'abre-regua', mov: { tipo: 'nenhum' }, titulo: 'toca a célula de repetições da série 1', alvo: '#r0_0' },
      { id: 'grava-1', mov: { tipo: 'lugar', ms: 350, nota: 'pouso 160 + cronômetro sobe 350' }, titulo: 'toca o 3º valor: a 1ª série da sessão grava, a frio', alvo: '.regua-v', nth: 2, depois: 1100 }
    ]
  },
  {
    id: '04-programa', hora: '07:10',
    titulo: 'Tela cheia: abrir o Programa, abrir um treino nele, empilhar o Histórico, voltar três vezes (02 T2)',
    montar: `CTX.vaiPara('prescricao'); render(); window.scrollTo(0, 0);`,
    passos: [
      { id: 'abre', mov: { tipo: 'entra', ms: 350, debaixo: 'entra' }, titulo: 'toca "Abrir o programa" na Prescrição: a tela cheia do Programa', alvo: '[data-a="abre-programa"]' },
      { id: 'abre-treino', mov: { tipo: 'nenhum', nota: 'conteúdo dentro da mesma camada' }, titulo: 'toca o primeiro treino da lista: o conteúdo troca dentro da mesma tela cheia', alvo: '.progd-b' },
      { id: 'empilha', mov: { tipo: 'entra', ms: 350, debaixo: 'entra' }, titulo: 'toca "histórico" do 1º exercício: o Histórico empilha sobre o Programa', alvo: '[data-a="hist-prescricao"]' },
      { id: 'volta-1', mov: { tipo: 'sai', ms: 350, debaixo: 'sai' }, titulo: 'toca "‹ Voltar": de volta ao treino aberto no Programa', alvo: '.tc-back', pausaAntes: 600 },
      { id: 'volta-2', mov: { tipo: 'nenhum', nota: 'volta à lista dentro da mesma camada' }, titulo: 'toca "‹ Voltar": de volta à lista do Programa', alvo: '.tc-back', pausaAntes: 600 },
      { id: 'volta-3', mov: { tipo: 'sai', ms: 350, debaixo: 'sai', rolagemDe: 'abre' }, titulo: 'toca "‹ Voltar": de volta à Prescrição', alvo: '.tc-back', pausaAntes: 600 }
    ]
  },
  {
    id: '05-evolucao', hora: '07:10',
    titulo: 'Tela cheia: abrir e fechar a Evolução; abrir de novo e "Ir para Semana", que fecha e troca de aba no mesmo toque (02 T2)',
    // "Comparar fotos" só aparece com duas sessões de fotos da mesma pose; o
    // registro semeado não tem fotos, então o empilhar fica no fluxo 04.
    montar: `CTX.vaiPara('corpo'); render(); window.scrollTo(0, 0);`,
    passos: [
      { id: 'abre', mov: { tipo: 'entra', ms: 350, debaixo: 'entra' }, titulo: 'toca "Evolução" no cabeçalho do Corpo', alvo: '[data-a="abre-evolucao"]' },
      { id: 'volta', mov: { tipo: 'sai', ms: 350, debaixo: 'sai', rolagemDe: 'abre' }, titulo: 'toca "‹ Voltar": de volta ao Corpo', alvo: '.tc-back', pausaAntes: 600 },
      { id: 'abre-de-novo', mov: { tipo: 'entra', ms: 350, debaixo: 'entra' }, titulo: 'toca "Evolução" de novo', alvo: '[data-a="abre-evolucao"]', pausaAntes: 600 },
      { id: 'ir-para-semana', mov: { tipo: 'sai', ms: 350, nota: 'uma transição só, no sentido da primeira mudança (02 T2)' }, titulo: 'toca "Ir para Semana": a Evolução fecha e a aba troca para Semana', alvo: '[data-a="evolucao-semana"]' }
    ]
  },
  {
    id: '06-folhas', hora: '13:10',
    titulo: 'Folhas: abrir a refeição, empilhar "editar refeição", fechar pelo × e pelo Voltar do sistema (02 T3)',
    montar: REFEICAO_DA_HORA(true),
    passos: [
      { id: 'abre', mov: { tipo: 'quique', ms: 640 }, titulo: 'toca "Outra porção" na linha aberta: a folha da refeição', alvo: id => `[data-a="porcao-${id}"]`, confere: `document.querySelectorAll('.ins-folha').length === 1` },
      { id: 'empilha', mov: { tipo: 'quique', ms: 640 }, titulo: 'toca "···" da folha: "editar refeição" empilha', alvo: '.ins-folha-b[aria-label="editar"]', nth: -1, confere: `document.querySelectorAll('.ins-folha').length === 2` },
      { id: 'fecha-x', mov: { tipo: 'sai', ms: 350 }, titulo: 'toca o × da folha de cima', alvo: '.ins-folha-b[aria-label="fechar"]', nth: -1, pausaAntes: 600, confere: `document.querySelectorAll('.ins-folha').length === 1` },
      { id: 'voltar', mov: { tipo: 'sai', ms: 350 }, titulo: 'Voltar do sistema (history.back): fecha a folha da refeição', tipo: 'voltar', pausaAntes: 600, confere: `document.querySelectorAll('.ins-folha').length === 0` }
    ]
  },
  {
    id: '07-abas', hora: '07:10',
    titulo: 'Trocar de aba: Agora → Corpo → Semana → Agora (02 T4)',
    montar: `CTX.vaiPara('agora'); render(); window.scrollTo(0, 0);`,
    passos: [
      { id: 'agora-corpo', mov: { tipo: 'aba', ms: 350 }, titulo: 'toca a aba Corpo (dois lugares à direita)', alvo: '.ins-tab', nth: 2, confere: `document.querySelector('.ins-tab.on') && document.querySelector('.ins-tab.on').textContent.trim() === 'Corpo'` },
      { id: 'corpo-semana', mov: { tipo: 'aba', ms: 350 }, titulo: 'toca a aba Semana (um à direita)', alvo: '.ins-tab', nth: 3, confere: `document.querySelector('.ins-tab.on') && document.querySelector('.ins-tab.on').textContent.trim() === 'Semana'` },
      { id: 'semana-agora', mov: { tipo: 'aba', ms: 350 }, titulo: 'toca a aba Agora (três à esquerda)', alvo: '.ins-tab', nth: 0, confere: `document.querySelector('.ins-tab.on') && document.querySelector('.ins-tab.on').textContent.trim() === 'Agora'` }
    ]
  },
  {
    id: '08-voltar-sistema', hora: '07:10',
    titulo: 'Voltar do sistema: Histórico sobre Programa, duas vezes (02 T5)',
    montar: `CTX.vaiPara('prescricao'); CTX.abrePrograma(); render();`,
    depoisDeMontar: async p => {
      await p.locator('.progd-b').first().evaluate(e => e.click()); await p.waitForTimeout(300);
      await p.locator('[data-a="hist-prescricao"]').first().evaluate(e => e.click()); await p.waitForTimeout(400);
    },
    passos: [
      { id: 'voltar-1', mov: { tipo: 'sai', ms: 350, debaixo: 'sai' }, titulo: 'Voltar do sistema: o Histórico fecha, o treino aberto no Programa volta', tipo: 'voltar' },
      { id: 'voltar-2', mov: { tipo: 'sai', ms: 350, debaixo: 'sai' }, titulo: 'Voltar do sistema: o Programa fecha, a Prescrição volta', tipo: 'voltar', pausaAntes: 600 }
    ]
  },
  {
    id: '09-copo', hora: '13:10',
    titulo: '"+1 copo" duas vezes no Agora (03 §4.4)',
    montar: `CTX.vaiPara('agora'); render(); window.scrollTo(0, 0);`,
    passos: [
      { id: 'mais-1', mov: { tipo: 'lugar', ms: 160 }, titulo: 'toca "+1 copo"', alvo: '[data-a="agua-mais"]' },
      { id: 'mais-2', mov: { tipo: 'lugar', ms: 160 }, titulo: 'toca "+1 copo" de novo', alvo: '[data-a="agua-mais"]', pausaAntes: 500 }
    ]
  },
  {
    id: '10-toast', hora: '07:10',
    titulo: 'O toast: chega, é trocado no meio, some (03 §5.1)',
    montar: `CTX.abreTreinoDeHoje(); render(); window.scrollTo(0, 0);`,
    passos: [
      { id: 'chega', mov: { tipo: 'aviso', ms: 160 }, titulo: 'toca "Iniciar treino": o toast "Treino … iniciado" chega', alvo: '.day-ini' },
      { id: 'troca', mov: { tipo: 'aviso', ms: 160 }, titulo: 'toca "Pausar" com o toast na tela: o texto troca no mesmo lugar', alvo: '.ctrl-b:not(.fim):not(.ini)', pausaAntes: 900 },
      { id: 'some', mov: { tipo: 'aviso', ms: 160, saida: true }, titulo: 'ninguém toca: o toast some 3,6 s depois', tipo: 'espera', pausaAntes: 50,
        ate: `getComputedStyle(document.getElementById('toast')).display === 'none'`, limite: 6000 }
    ]
  },
  {
    id: '11-refeicao-linha', hora: '13:10',
    titulo: 'Marcar a refeição pela linha: abrir a linha e "Comi tudo" (03 §4.6)',
    montar: REFEICAO_DA_HORA(false),
    passos: [
      { id: 'abre-linha', mov: { tipo: 'nenhum' }, titulo: 'toca a linha da refeição da hora: ela abre', alvo: id => `[data-a="linha-${id}"]` },
      { id: 'comi-tudo', mov: { tipo: 'lugar', ms: 160 }, titulo: 'toca "Comi tudo": a marca entra e a leitura de volta nasce no topo', alvo: id => `[data-a="tudo-${id}"]` }
    ]
  },
  {
    id: '12-teclado', hora: '07:10',
    titulo: 'O teclado próprio: abrir pela célula de carga, duas teclas, "pronto" (03 §4.7)',
    montar: `CTX.abreTreinoDeHoje(); if (view.open !== 0) toggle(0); render();`,
    passos: [
      { id: 'abre', mov: { tipo: 'nenhum' }, titulo: 'toca a célula de carga da série 1: o teclado nasce', alvo: '#w0_0' },
      { id: 'tecla-4', mov: { tipo: 'nenhum' }, titulo: 'toca a tecla 4', alvo: '[data-a="tcl-4"]' },
      { id: 'tecla-0', mov: { tipo: 'nenhum' }, titulo: 'toca a tecla 0', alvo: '[data-a="tcl-0"]' },
      { id: 'pronto', mov: { tipo: 'nenhum' }, titulo: 'toca "pronto": o teclado some', alvo: '[data-a="tcl-pronto"]' }
    ]
  },
  {
    id: '13-pare', hora: '07:10',
    titulo: 'O painel de pare: "Encerrar" sem série, e "Deixar como está" (03 §5.2)',
    montar: SESSAO_ABERTA + `CTX.abreTreinoDeHoje(); render(); window.scrollTo(0, 0);`,
    passos: [
      { id: 'abre', mov: { tipo: 'quique', ms: 640 }, titulo: 'toca "Encerrar" numa sessão sem série: o pare nasce', alvo: '.ctrl-b.fim' },
      { id: 'deixa', mov: { tipo: 'sai', ms: 350 }, titulo: 'toca "Deixar como está": o pare some', alvo: '[data-a="pare-nao"]', pausaAntes: 700 }
    ]
  },
  // ---- O toque no meio (04 R2, 02 §2.0): um segundo toque ~100–130 ms depois do
  // primeiro. No antes não há movimento e o segundo toque sempre chega; no depois
  // ele cai no meio da transição e tem de chegar ao alvo que o dedo vê (a View
  // Transition engole o toque no Chromium, 04 §2.6). `confere` diz se chegou.
  {
    id: '14-meio-abas', hora: '07:10',
    titulo: 'Toque no meio: Corpo e, ~100 ms depois, Semana',
    montar: `CTX.vaiPara('agora'); render(); window.scrollTo(0, 0);`,
    passos: [
      { id: 'corpo-e-semana', mov: { tipo: 'aba', ms: 350, meio: true }, tipo: 'toqueNoMeio', titulo: 'toca a aba Corpo e, logo depois, a aba Semana: tem de acabar em Semana',
        alvo: '.ins-tab', nth: 2, alvo2: '.ins-tab', nth2: 3, confere: `document.querySelector('.ins-tab.on') && document.querySelector('.ins-tab.on').textContent.trim() === 'Semana'` }
    ]
  },
  {
    id: '15-meio-folha', hora: '13:10',
    titulo: 'Toque no meio: abrir a folha da refeição e, ~100 ms depois, tocar o ×',
    montar: REFEICAO_DA_HORA(true),
    passos: [
      { id: 'abre-e-fecha', mov: { tipo: 'quique', ms: 640, meio: true }, tipo: 'toqueNoMeio', titulo: 'toca "Outra porção" e, logo depois, o × da folha: ela tem de fechar',
        alvo: id => `[data-a="porcao-${id}"]`, alvo2: '.ins-folha-b[aria-label="fechar"]', nth2: -1, confere: `document.querySelectorAll('.ins-folha').length === 0` }
    ]
  },
  {
    // Peça 4: o × sobe com a folha (até 60 px por quadro no quique) e a mira lida
    // um quadro antes de o dedo descer erra; o véu no alto não anda.
    id: '15b-meio-folha-veu', hora: '13:10',
    titulo: 'Toque no meio: abrir a folha da refeição e, ~100 ms depois, tocar o véu no alto da tela',
    montar: REFEICAO_DA_HORA(true),
    passos: [
      { id: 'abre-e-fecha-veu', mov: { tipo: 'quique', ms: 640, meio: true }, tipo: 'toqueNoMeio', titulo: 'toca "Outra porção" e, logo depois, o véu no alto (207, 30): a folha tem de fechar',
        alvo: id => `[data-a="porcao-${id}"]`, ponto2: [207, 30], confere: `document.querySelectorAll('.ins-folha').length === 0` }
    ]
  },
  {
    id: '16-meio-modo', hora: '07:10',
    titulo: 'Toque no meio: entrar no modo pelo cartão e, ~100 ms depois, tocar a seta de sair',
    montar: `CTX.vaiPara('agora'); render(); window.scrollTo(0, 0);`,
    passos: [
      { id: 'entra-e-sai', mov: { tipo: 'entra', ms: 350, meio: true }, tipo: 'toqueNoMeio', titulo: 'toca o cartão do treino e, logo depois, a seta "‹": tem de voltar ao Agora',
        alvo: 'button.ins-foco, .ins-foco button', alvo2: '.ins-modo-sair', confere: `!document.querySelector('.ins-modo') && !!document.querySelector('.ins-tabbar')` }
    ]
  },
  {
    // Peça 6 (o item 3 da conferência da peça 5, 07 §11.3): com o descanso
    // contando, o cronômetro fica sobre a barra de abas no Agora e no fundo da
    // tela nas telas cheias. Na troca de camada ele tem de mudar de altura junto
    // com ela, em vez de saltar 52 px num quadro. A posição dele quadro a quadro
    // sai dos quadros guardados (QUADROS=1) por revisor-cronometro.py.
    id: '17-cronometro-troca', hora: '07:10',
    titulo: 'O cronômetro numa troca de camada: descanso contando, Agora → Ajustes → Agora',
    montar: `CTX.vaiPara('agora'); render(); window.scrollTo(0, 0); startTimer(90, 'descanso · série 1 · teste');`,
    passos: [
      { id: 'abre-ajustes', mov: { tipo: 'entra', ms: 350, debaixo: 'entra', debaixoAte: 740 }, titulo: 'toca o ⚙ com o descanso contando: os Ajustes chegam', alvo: '[data-a="ajustes"]', pausaAntes: 900, confere: `!!document.querySelector('.tc')` },
      { id: 'volta', mov: { tipo: 'sai', ms: 350, debaixo: 'sai', debaixoAte: 740 }, titulo: 'toca "‹ Voltar": de volta ao Agora, o descanso ainda contando', alvo: '.tc-back', pausaAntes: 600, confere: `!document.querySelector('.tc') && !!document.querySelector('#timer.on')` }
    ]
  }
];
