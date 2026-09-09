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
  if (view.hist) c.push('hist');
  if (view.sessao) c.push('sessao');
  if (view.add) c.push('add');
  if (view.retro) c.push('retro');
  if (view.prog) c.push('prog');
  if (view.promo) c.push('promo');
  if (view.comparar) c.push('comparar');
  if (view.protocolo) c.push('protocolo');
  if (view.ajuste) c.push('ajuste');
  if (view.camera) c.push('camera');
  // As folhas ficam por cima de qualquer destino: elas cobrem o que houver.
  (view.pilha || []).forEach(function (f, i) { c.push('folha:' + i); });
  return c;
}

/** Profundidade que o histórico representa hoje. */
let profundidade = 0;

/** Chamado quando o usuário volta: fecha uma camada. Injetado por `liga()`. */
let aoVoltar = function () {};

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
  try { history.go(-passos); } catch (e) {}
  // O `popstate` que isto provoca chega com `lastro === n`, igual ao que o app
  // já tem aberto: o handler compara, vê que batem, e não fecha nada.
}

/**
 * Liga o Voltar do sistema.
 *
 * @param {object} p
 * @param {Function} p.camadas   devolve o número de camadas abertas agora
 * @param {Function} p.aoVoltar  fecha a camada do topo
 */
export function liga(p) {
  if (typeof window === 'undefined' || !window.addEventListener) return;
  aoVoltar = p.aoVoltar;

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

  window.addEventListener('popstate', function () {
    const k = profundidadeDoHistorico();
    const n = p.camadas();
    profundidade = k;
    // k > n: o usuário avançou (botão de ir adiante). Não há o que reabrir — a
    // profundidade acima já foi corrigida e o próximo `sincronizaHistorico`
    // reempurra o que faltar.
    for (let i = 0; i < n - k; i++) aoVoltar();
  });
}

/** Só para os testes: devolve o mecanismo ao estado de boot. */
export function _reinicia() { profundidade = 0; }
