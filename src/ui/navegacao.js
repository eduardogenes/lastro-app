// O Voltar do sistema.
//
// O app não tem router e não vai ter: são cinco destinos e nenhuma URL para
// compartilhar. Mas "não ter router" tinha virado "não ter histórico": o app
// nunca chamava `pushState`, e por isso `history.length` ficava em 2 para
// sempre. No Android — onde o Voltar é botão e é gesto — e no gesto de borda do
// Safari, o primeiro Voltar em qualquer ponto FECHAVA O APP. Com folha aberta,
// no meio de uma série, dentro do editor de programa: em todos, direto para
// fora.
//
// A correção não precisa de rota nomeada. Precisa que o histórico tenha a mesma
// PROFUNDIDADE que a pilha de camadas abertas — uma entrada por camada. Voltar
// consome uma entrada, e o app fecha uma camada.
//
// ---- Por que a pilha é derivada, e não escrita ----
//
// A pilha não é um estado novo: é uma LEITURA de `view`, feita na mesma ordem
// de prioridade que `telaCheia()` usa para escolher o que desenhar. Quem abre
// uma camada continua só ligando a flag; quem fecha, só desligando. Nenhum
// caminho de abertura ou fechamento precisou ser reescrito, e não existe um
// segundo estado que possa divergir do primeiro — que é o defeito clássico
// desta classe de solução.
//
// ---- Por que não há contador de eventos ----
//
// A tentação é contar quantos `popstate` foram provocados por nós, para
// ignorá-los. Isso quebra: `history.go(-n)` não promete um evento por passo, e
// o número de motores que discordam disso é maior que zero.
//
// Em vez de contar, cada entrada carrega a própria profundidade
// (`{ lastro: k }`). No `popstate` a pergunta é "em que profundidade o
// histórico está AGORA?", comparada com quantas camadas o app tem abertas. A
// diferença é quantas fechar. Quando fomos NÓS que provocamos o evento, os dois
// números já batem e não há o que fazer. O mecanismo se corrige sozinho depois
// de qualquer divergência, inclusive uma que não previmos.
//
// Uma marca só, e ela não conta eventos: a profundidade em que a volta que o
// app pediu vai POUSAR (`voltaPendente`). Enquanto ela está no ar, nada se
// empurra — senão a volta, cujo destino o motor já fixou, pularia a entrada
// nova e o `popstate` dela fecharia a camada recém-aberta.

/**
 * As camadas abertas, da mais funda para a mais alta — a ordem em que o usuário
 * as vê empilhadas, e portanto a ordem inversa em que o Voltar as desfaz.
 *
 * Os destinos entram na ordem INVERSA à da cadeia de `telaCheia()`: lá o
 * primeiro `if` que casa é o que aparece, ou seja, o que está por cima.
 *
 * Função pura, e é de propósito: é o único pedaço disto que dá para testar sem
 * um navegador.
 *
 * @param {object} view
 * @returns {string[]}
 */
export function camadasAbertas(view) {
  if (!view) return [];
  const c = [];
  // De baixo para cima. Espelha `telaCheia()` de trás para frente.
  //
  // O MODO DE SESSÃO é a camada mais funda: tudo que se abre de dentro dele
  // fica por cima. Ele não é `view.sessao` — esse é o DETALHE de uma sessão
  // passada, e a frente 1 apontou que confundir os dois era o erro provável.
  if (view.modoSessao) c.push('modoSessao');

  // O dia aberto, abaixo da sessão e do registro de treino passado, que abrem dele.
  if (view.diaAberto) c.push('dia');
  if (view.sessao) c.push('sessao');
  if (view.add) c.push('add');
  if (view.retro) c.push('retro');
  if (view.prog) c.push('prog');
  // O HISTÓRICO fica ACIMA do programa, e isto mudou quando a Prescrição ganhou
  // a porta do histórico em cada linha do programa (achado 1 da frente 1):
  // abrindo de lá, ele é a camada de cima, e o Voltar tem de devolver o
  // programa — não o lugar. Antes a ordem era a inversa, e com os dois abertos
  // o programa ganhava e o histórico não aparecia.
  if (view.hist) c.push('hist');
  // A Evolução ABAIXO da comparação: comparar abre de dentro dela.
  if (view.evolucao) c.push('evolucao');
  if (view.comparar) c.push('comparar');
  // A revisão do treinador abre da Prescrição, acima de qualquer lugar.
  if (view.revisao) c.push('revisao');
  if (view.protocolo) c.push('protocolo');
  if (view.ajuste) c.push('ajuste');
  if (view.camera) c.push('camera');
  // Ajustes é destino e não lugar: um botão no canto do Agora.
  if (view.ajustes) c.push('ajustes');
  // As folhas ficam por cima de qualquer destino: elas cobrem o que houver.
  (view.pilha || []).forEach(function (f, i) { c.push('folha:' + i); });
  // O PAINEL DE PARE é a camada mais alta de todas, porque é ele que está
  // esperando resposta: com ele aberto, Voltar e Esc respondem "Deixar como
  // está" e não fecham o que está por baixo (decisão 13, frente 3 §3).
  // O aviso de que uma gravação FALHOU fica logo abaixo do pare: ele chega
  // sozinho, e o pare é pedido pelo dedo — o que o dedo pediu fica por cima.
  if (view.falhou && view.naoGuardado) c.push('falhou');
  if (view.pare) c.push('pare');
  return c;
}

/** Profundidade que o histórico representa hoje. */
let profundidade = 0;

/**
 * A VOLTA QUE O PRÓPRIO APP PEDIU e o navegador ainda não fez: a profundidade
 * em que o `history.go(-n)` de um fecho pelo botão vai pousar, ou `null`.
 *
 * `history.go` é assíncrono, e os dois motores resolvem o DESTINO dele na hora
 * do pedido — a entrada que estava `n` passos atrás —, não na hora em que andam
 * (medido no Chromium e no WebKit 26.5: com um `pushState` no meio, a volta
 * pula a entrada nova e pousa na de antes). Se uma camada nova abria entre o
 * fecho e a volta — e no WebKit desta máquina a volta leva de 100 a 160 ms —,
 * a entrada dela era empurrada, a volta pousava na profundidade do fecho, e o
 * `popstate` disso, igual a um Voltar do sistema, FECHAVA a camada recém-aberta
 * (a corrida da peça 5 que ainda caía no WebKit com carga; docs/motion/09,
 * "Ajustes finais"). Agora nada se empurra enquanto a volta do app está no ar:
 * o `popstate` dela é reconhecido pela profundidade em que pousa, e só então o
 * histórico alcança a pilha que a tela desenhou.
 */
let voltaPendente = null;
/** Quanto esperar a volta do app antes de concluir que o navegador a perdeu. */
const VOLTA_PERDIDA_MS = 3000;
let relogioDaVolta = 0;

/** Chamado quando o usuário volta: fecha uma camada. Injetado por `liga()`. */
let aoVoltar = function () {};
/** Quantas camadas a tela desenhada tem agora. Injetado por `liga()`. */
let contaCamadas = function () { return profundidade; };

/** A profundidade gravada na entrada atual do histórico. */
function profundidadeDoHistorico() {
  try {
    const s = history.state;
    return (s && typeof s.lastro === 'number') ? s.lastro : 0;
  } catch (e) { return 0; }
}

/**
 * Sincroniza o histórico com a pilha de camadas. Chamado DEPOIS de cada
 * `render()`, quando `view` já é o que a tela mostra.
 *
 * @param {number} n camadas abertas agora
 */
export function sincronizaHistorico(n) {
  if (typeof history === 'undefined' || !history.pushState) return;
  // A volta que o app pediu ainda não pousou: empurrar agora seria empilhar
  // sobre a entrada que ela vai deixar (ver `voltaPendente`). O `popstate`
  // dela chama isto de novo, com a pilha que a tela tiver então.
  if (voltaPendente != null) return;
  if (n === profundidade) return;

  if (n > profundidade) {
    // Abriu camada: uma entrada por camada nova, para que cada Voltar desfaça
    // exatamente uma.
    for (let k = profundidade + 1; k <= n; k++) {
      try { history.pushState({ lastro: k }, ''); } catch (e) { return; }
    }
    profundidade = n;
    return;
  }

  // Fechou pelo botão do app (× da folha, ‹ voltar, véu, Esc). As entradas
  // continuam lá e precisam ser consumidas, senão o Voltar do sistema teria que
  // ser apertado duas vezes para sair de uma tela que já foi fechada.
  const passos = profundidade - n;
  profundidade = n;
  voltaPendente = n;
  try { history.go(-passos); } catch (e) { voltaPendente = null; return; }
  // O `popstate` que isto provoca chega com `lastro === n`: o handler o
  // reconhece como a volta do app e não fecha nada. Se ele nunca vier (um motor
  // que perde a volta), o app não fica para sempre sem empurrar: passado o
  // prazo, ele relê onde o histórico está e alcança a pilha dali.
  clearTimeout(relogioDaVolta);
  relogioDaVolta = setTimeout(function () {
    if (voltaPendente == null) return;
    voltaPendente = null;
    profundidade = profundidadeDoHistorico();
    sincronizaHistorico(contaCamadas());
  }, VOLTA_PERDIDA_MS);
}

/**
 * Liga o Voltar do sistema — e o Escape, que é o mesmo caminho.
 *
 * @param {object} p
 * @param {Function} p.camadas   devolve o número de camadas abertas agora
 * @param {Function} p.aoVoltar  fecha a camada do topo; recebe `{ jaAnimado }`
 *   do Voltar do sistema (o navegador já animou a volta) e nada do Esc
 */
export function liga(p) {
  if (typeof window === 'undefined' || !window.addEventListener) return;
  aoVoltar = p.aoVoltar;
  contaCamadas = p.camadas;

  // Quem manda na posição de leitura é o app, não o navegador.
  //
  // Com 'auto' — o padrão — o navegador restaura, DEPOIS do `popstate`, a
  // posição que ele mesmo associou àquela entrada. Como a entrada foi empurrada
  // com o destino já no topo, o valor guardado por ele é zero, e ele desfazia o
  // `saiDoDestino()` meio quadro depois: voltar do Programa caía no topo do
  // Guia em vez da linha de onde se veio. Medido.
  try { if ('scrollRestoration' in history) history.scrollRestoration = 'manual'; } catch (e) {}

  // Carimba a entrada em que o app nasceu. Sem isto a base ficaria com
  // `state === null` e indistinguível de uma entrada de outra página.
  try {
    if (history.replaceState) history.replaceState({ lastro: 0 }, '');
  } catch (e) {}

  // ---- O Escape, por este mesmo caminho ----
  //
  // O contrato manda: "Voltar desfaz exatamente uma camada. Vale para o botão
  // `‹ voltar`, para o `×` da folha, para o toque no véu, para o Esc e para o
  // Voltar do sistema — TODOS passam pelo mesmo caminho"
  // (`docs/LASTRO_UX_CONTRACT.md`). O Esc era o único que não passava: cada
  // folha montava o SEU ouvinte no `document`, e todas recebiam a tecla. Para
  // uma não fechar as outras, cada ouvinte perguntava ao DOM qual folha tinha o
  // maior z-index e só a de cima agia.
  //
  // Isso tinha dois preços. O primeiro é que a regra do contrato ficava
  // sustentada por uma consulta de z-index em vez da pilha de camadas, que é a
  // fonte de verdade — e empate de nível era resolvido por ordem de desenho.
  // O segundo era uma CORRIDA: entre a folha nova aparecer e o efeito dela
  // montar o ouvinte há uma janela em que o DOM já tem a folha mas ninguém a
  // escuta; aí um Escape caía no vazio, porque os ouvintes antigos viam uma
  // folha mais alta que eles e se calavam, e a nova ainda não escutava. Dedo
  // humano não acerta essa janela; a suíte sob carga acertava, e foi o
  // intermitente que o risco 4.e do `00-coordenacao.md` registrava sem nome.
  //
  // Um ouvinte só, montado no boot, fechando a camada do topo. Mesmo verbo do
  // Voltar, mesma contagem, mesma sincronia de histórico depois do render.
  // Sem guarda de "tem camada aberta?" aqui: quem fecha já pergunta, e a
  // varredura de mutação mostrou que os dois guardas se MASCARAVAM — tirar
  // qualquer um deixava a suíte verde, porque o outro atendia. Dois guardas de
  // que nenhum é demonstrável é pior que um: a próxima pessoa muda o lado
  // errado e nada fica vermelho. Fica o de `voltarUmaCamada`, que é o caminho
  // compartilhado com o Voltar do sistema e precisa dele de todo modo.
  window.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (e.isComposing) return;              // Esc fechando o IME não é Esc do app
    aoVoltar();
  });

  window.addEventListener('popstate', function (e) {
    const k = profundidadeDoHistorico();
    // A VOLTA DO APP POUSOU (o `history.go` de um fecho pelo botão): não é o
    // usuário voltando, e nada fecha. O que abriu enquanto ela estava no ar
    // ganha agora as entradas dele.
    if (voltaPendente != null && k === voltaPendente) {
      voltaPendente = null;
      clearTimeout(relogioDaVolta);
      profundidade = k;
      sincronizaHistorico(p.camadas());
      return;
    }
    voltaPendente = null;
    clearTimeout(relogioDaVolta);
    const n = p.camadas();
    profundidade = k;
    // O NAVEGADOR JÁ ANIMOU? O gesto de borda do iPhone puxa a página de cima
    // para a direita e mostra a de baixo — é animação do sistema, e o evento
    // chega com `hasUAVisualTransition` (Safari 18, Chrome 118). Aí o app fecha
    // sem a transição dele, senão a mesma volta apareceria duas vezes
    // (docs/motion/02 T5). O botão Voltar do Android chega com `false`, e o app
    // anima o mesmo reverso do "‹ Voltar".
    const jaAnimado = !!(e && e.hasUAVisualTransition);
    // k > n: o usuário avançou (botão de ir adiante). Não há o que reabrir — a
    // profundidade acima já foi corrigida e o próximo `sincronizaHistorico`
    // reempurra o que faltar.
    for (let i = 0; i < n - k; i++) aoVoltar({ jaAnimado: jaAnimado });
  });
}

/** Só para os testes: devolve o mecanismo ao estado de boot. */
export function _reinicia() { profundidade = 0; voltaPendente = null; clearTimeout(relogioDaVolta); }
