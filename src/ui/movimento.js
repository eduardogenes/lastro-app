// @ts-check
//
// A PORTA DO MOVIMENTO — a única pergunta que o JavaScript faz sobre se pode
// mover alguma coisa.
//
// O CSS do app tem o portão dele: todo movimento mora dentro de
// `@media (prefers-reduced-motion: no-preference)`, e fora dele o elemento já
// está no último quadro. O JavaScript não alcança aquele bloco, e era por isso
// que a bancada lia a preferência sozinha, uma vez, ao montar — e continuava
// virando o aparelho para quem ligou "Reduzir movimento" depois de abrir a
// janela. Esta porta é o mesmo portão do lado do JavaScript, e o único lugar do
// app que pode chamar `matchMedia` sobre movimento, `startViewTransition`,
// `.animate()`, ler uma animação viva (`getAnimations`) ou pular uma transição de
// vista. A guarda de
// estilo (`tests/dominio/estilo.test.ts`) reprova qualquer outro.
//
// Três regras, as mesmas do portão do CSS:
//
//  1. POR ADESÃO. Pergunta-se "pediu movimento?" (`no-preference`), e não "não
//     pediu menos?". Navegador sem a media feature, `matchMedia` ausente (o
//     jsdom dos testes de fluxo) ou que lança: a resposta é NÃO. Falha fechado
//     — o app fica parado, que é o app de antes, nunca preso.
//  2. NA HORA. Nada de guardar a resposta numa variável na montagem: a pessoa
//     liga a chave com o app aberto e a próxima pergunta já sabe.
//  3. NADA ESPERA O FIM. Quem precisa segurar um nó pelo tempo de uma saída lê
//     o tempo do token aqui, e o tempo é 0 quando não pode mover. Nunca um
//     ouvinte do fim de animação: sob "Reduzir movimento" ele não chega, e a
//     tela fica presa com o véu por cima.

const PEDE_MOVIMENTO = '(prefers-reduced-motion: no-preference)';
const PEDE_MENOS = '(prefers-reduced-motion: reduce)';

/** O único token que vale sob "Reduzir movimento": a camada que chega esmaece. */
const DISSOLVE = '--ins-dur-dissolve';

/**
 * A consulta, lida agora. `false` para tudo o que não for um "sim" claro.
 * @param {string} consulta
 * @returns {boolean}
 */
function casa(consulta) {
  try {
    const mm = /** @type {{ matchMedia?: (q: string) => { matches?: unknown } }} */ (globalThis).matchMedia;
    if (typeof mm !== 'function') return false;
    const r = mm.call(globalThis, consulta);
    return !!r && r.matches === true;
  } catch (e) {
    return false;
  }
}

/**
 * Pode mover? `true` só quando o aparelho diz que a pessoa NÃO pediu menos
 * movimento. Lida a cada chamada.
 * @returns {boolean}
 */
export function podeMover() {
  return casa(PEDE_MOVIMENTO);
}

/**
 * Pode esmaecer no lugar de mover? Só sob "Reduzir movimento" — a resposta 2 do
 * dono (16/10): a camada que chega esmaece em `--ins-dur-dissolve` e a que sai
 * vai de uma vez. Sem a preferência, quem vale é `podeMover()`.
 * @returns {boolean}
 */
export function podeDissolver() {
  return casa(PEDE_MENOS);
}

// ---------------------------------------------------------------------------
// O TOQUE CHEGA AO QUE O DEDO MIROU
// ---------------------------------------------------------------------------
//
// Duas coisas se movem sob o dedo, e nas duas o toque se perdia, medido nos dois
// motores:
//
//  - A CAMADA QUE CHEGA por CSS (a folha e o painel de apagar, com o quique; peça
//    4). O dedo desce no × ou no véu, a camada anda até ele soltar, e o clique
//    sai em outro nó: o Chromium o entrega ao que está sob o dedo ao soltar, o
//    WebKit com ponteiro ao ancestral comum dos dois alvos, e o Safari do iPhone
//    cancela o toque quando o nó sob o dedo muda. Até a peça 5 o dedo SEGURAVA a
//    camada (pausava a animação); no Chromium a pausa caía no tempo da thread
//    principal, um quadro atrás do compositor, e a folha VOLTAVA um quadro sob o
//    dedo (07 §10) — um piscar. Agora nada pausa: a camada segue, e o clique vai
//    ao que o dedo mirou ao descer (`miraDoDedo`).
//  - A TROCA DE CAMADA por transição de vista (peça 5, logo abaixo). Durante ela
//    o alvo de todo toque é o `html`. O `pointerdown` PULA para o fim
//    (`skipTransition()`), o desenho pendente entra na hora, e a mira é o que
//    ficou sob o dedo.
//
// O mesmo princípio nos dois: o alvo é fixado quando o dedo DESCE; o clique que
// cair em outro nó (porque a tela andou, ou porque ele caiu na raiz) é engolido
// e reenviado à mira, e o que não vier (`SEM_CLIQUE_MS` depois de soltar) o app
// entrega. Virou rolagem (`pointercancel`): não há clique. Nada espera o fim de
// nada, e nada se pausa. O clique reenviado deixa o foco onde a descida de
// verdade deixaria (`focaComoOClique`).

/** O clique que não veio depois de um toque mirado: o app o entrega. */
const SEM_CLIQUE_MS = 300;
/** Folga sobre o tempo da camada, onde não se pode perguntar ao documento. */
const FOLGA_MS = 150;

/**
 * O toque mirado: o dedo, o nó em que ele desceu, o que estava focado quando ele
 * desceu, e o relógio do clique que não veio.
 * @type {{ id: number, alvo: Element, foco: Element | null, relogio: any } | null}
 */
let mira = null;
let escutando = false;

const agora = () => (typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now());

/**
 * O clique, nesta forma, em `alvo`. `detail` 1: é um toque, e quem distingue
 * toque de teclado (o "Não guardei", `pare.jsx`) lê isso.
 * @param {Element} alvo
 * @param {number} x
 * @param {number} y
 */
function entregaOClique(alvo, x, y) {
  if (!alvo || !alvo.isConnected) return;
  alvo.dispatchEvent(new MouseEvent('click', {
    bubbles: true, cancelable: true, composed: true, view: window, detail: 1,
    clientX: x, clientY: y, button: 0
  }));
}

/**
 * @param {number} id
 * @param {Element | null} alvo
 */
function arma(id, alvo) {
  if (mira) clearTimeout(mira.relogio);
  const raiz = document.documentElement;
  mira = alvo && alvo !== raiz && alvo !== document.body
    ? { id: id, alvo: alvo, foco: document.activeElement, relogio: 0 } : null;
}

/** O que um clique de verdade foca: o próprio controle, ou o ancestral focável dele. */
const FOCAVEL = 'button, a[href], input, select, textarea, [tabindex]';

/**
 * O CLIQUE REENVIADO DEIXA O FOCO ONDE UM DE VERDADE DEIXARIA (ajustes finais do
 * motion, da conferência da peça 6). Um clique de verdade foca na DESCIDA: o
 * Chromium e o WebKit desta máquina focam o controle tocado; o Safari do iPhone
 * não foca botão no toque. No meio de uma troca a descida cai no `html` (as
 * fotos) — o foco que havia sai para o `body` — e o clique que o app reenvia à
 * mira é sintético, e não foca nada: tocar a aba Semana no meio do carrossel
 * deixava o foco no `body` (medido nos dois motores, com o ponteiro; o dedo do
 * Chromium chega sozinho ao alvo, e foca). Aqui o reenvio faz o que a descida
 * faria, antes do clique, como ela: se o toque TIROU o foco de um nó, ele vai ao
 * controle sob a mira (ou ao ancestral focável dela), sem rolar. Se não havia
 * foco — o Safari, que não foca no toque —, não inventa um.
 * @param {{ alvo: Element, foco: Element | null }} m
 */
function focaComoOClique(m) {
  const vazio = /** @param {Element | null} e */ function (e) {
    return !e || e === document.body || e === document.documentElement;
  };
  if (vazio(m.foco) || !vazio(document.activeElement)) return;
  const c = m.alvo.isConnected && m.alvo.closest ? m.alvo.closest(FOCAVEL) : null;
  if (!c || c.closest('[inert]')) return;
  try { /** @type {HTMLElement} */ (c).focus({ preventScroll: true }); } catch (e) { /* não focável */ }
}

/** @param {PointerEvent} e */
function aoSoltar(e) {
  const m = mira;
  if (!m || m.id !== e.pointerId) return;
  const x = e.clientX, y = e.clientY;
  clearTimeout(m.relogio);
  m.relogio = setTimeout(function () {
    if (mira !== m) return;
    mira = null;
    focaComoOClique(m);
    entregaOClique(m.alvo, x, y);
  }, SEM_CLIQUE_MS);
}

/** @param {PointerEvent} e */
function aoCancelar(e) {
  const m = mira;
  if (!m || m.id !== e.pointerId) return;
  clearTimeout(m.relogio);
  mira = null;
}

/** @param {MouseEvent} e */
function aoClicar(e) {
  const m = mira;
  if (!m) return;
  clearTimeout(m.relogio);
  mira = null;
  const t = /** @type {Node} */ (e.target);
  // Chegou à mira (ou a algo dentro dela): segue como veio.
  if (!m.alvo.isConnected || t === m.alvo || m.alvo.contains(t)) return;
  // Caiu em outro nó — a camada andou, ou a raiz da transição o pegou: vai à mira,
  // com o foco que a descida de verdade teria dado.
  e.stopImmediatePropagation();
  e.preventDefault();
  focaComoOClique(m);
  entregaOClique(m.alvo, e.clientX, e.clientY);
}

function escuta() {
  if (escutando || typeof window === 'undefined' || !window.addEventListener) return;
  escutando = true;
  // Na JANELA, na captura: antes de qualquer ouvinte do app.
  window.addEventListener('pointerdown', aoDescer, true);
  window.addEventListener('pointerup', aoSoltar, true);
  window.addEventListener('pointercancel', aoCancelar, true);
  window.addEventListener('click', aoClicar, true);
}

/**
 * O DEDO DESCEU NUMA CAMADA QUE AINDA CHEGA (o `onPointerDown` do invólucro da
 * folha e do painel de pare): o clique deste toque vai ao nó em que ele desceu,
 * onde quer que a camada esteja quando o dedo soltar. Nada para: a chegada
 * segue o caminho dela. Sem movimento pedido, ou sem animação correndo na
 * camada (ela já parou, nasceu no lugar, "Reduzir movimento"), não há o que
 * mirar — o navegador já entrega o clique certo.
 * @param {PointerEvent} e
 * @param {Element | null} camada o invólucro; as animações são as dos filhos dele (a caixa e o véu)
 */
export function miraDoDedo(e, camada) {
  if (!camada || !podeMover()) return;
  /** @type {Element[]} */
  const quem = Array.prototype.slice.call(camada.children);
  quem.push(camada);
  const chega = quem.some(function (el) {
    return typeof el.getAnimations === 'function' &&
      el.getAnimations().some(function (a) { return a.playState === 'running'; });
  });
  if (!chega) return;
  escuta();
  arma(e.pointerId, /** @type {Element} */ (e.target));
}

// ---------------------------------------------------------------------------
// A TROCA DE CAMADA — a transição de vista (peça 5 do motion)
// ---------------------------------------------------------------------------
//
// Tela cheia, modo de sessão, e a SAÍDA da folha e do painel de apagar: a
// camada que sai já deixou o DOM no mesmo desenho (o Preact a desmonta), e o
// único jeito de ela sair andando é o navegador fotografar o antes e o depois e
// mover as FOTOS (docs/motion/02 §3.3). Nenhum elemento real ganha `transform`:
// nenhum fixo é preso, nenhum `sticky` cai (guarda (d)).
//
// O casco (`render()`, em `main.jsx`) pede a troca aqui, num ponto só, com o
// SENTIDO dela — `entra` (uma tela chega da direita), `sai` (a de cima sai pela
// direita) ou `fica` (só a folha ou o painel descem). O sentido vai no atributo
// `data-nav` do `html`, que o CSS lê (`componentes.css`, "A TROCA DE CAMADA"), e
// fica lá até a próxima troca: fora de uma transição os pseudo-elementos não
// existem, e sob "Reduzir movimento" é ele que diz qual nó que nasce esmaece.
//
// TROCAR DE ABA passa pela mesma porta (peça 6), e não é camada: é andar de lado
// no chão. `aba-direita` quando se andou para a direita na barra (a aba de índice
// maior: a página nova entra pela direita e a velha sai pela esquerda),
// `aba-esquerda` ao contrário — o carrossel de `componentes.css`, "A TROCA DE
// ABA". E `seca`: a troca de lugar sem sentido (uma aba que não está na barra,
// `vaiPara('treino')`), que desenha na hora, sem transição, e deixa no `html`
// um sentido que nada lê — nada que nasce esmaece e o fio salta.
//
// O toque no meio dela pula para o fim e vai ao que ficou sob o dedo (acima). A
// porta sabe que a transição ainda corre por `document.activeViewTransition` ou,
// onde ele não existe, pelo tempo do token — nunca por `finished`, `ready` ou
// `updateCallbackDone` (guarda (e)).

/**
 * A transição que corre agora, se alguma: o objeto do navegador, o desenho que
 * ela vai pedir (idempotente: desenha só se ainda não desenhou), se o navegador
 * já o pediu e, depois do desenho, até quando ela pode estar na tela.
 * @type {{ vt: any, desenha: () => void, ate: number, desenhou: boolean } | null}
 */
let viva = null;
/** Se o navegador não chamar o desenho (página escondida no meio), o app desenha sozinho. */
const DESENHO_ATRASADO_MS = 1000;

/**
 * A rejeição que ninguém espera. Pular uma transição ANTES de ela começar a
 * andar — o toque no primeiro quadro, ou uma troca nova logo depois do desenho
 * — rejeita a promessa `ready` dela com `AbortError`, nos dois motores (medido),
 * e rejeição sem dono vira erro de página. Esta função a marca como tratada, e
 * só: não faz nada, e nada espera por ela. É o único uso de `ready` no app, e a
 * guarda (e) confere que continua vazia.
 */
function semDono() {}

/** A transição ainda está na tela? Pergunta ao documento quando ele sabe; senão, o relógio. */
function aindaCorre(/** @type {{ vt: any, ate: number }} */ v) {
  try {
    const doc = /** @type {any} */ (document);
    if ('activeViewTransition' in doc) return doc.activeViewTransition === v.vt;
  } catch (e) { /* segue pelo relógio */ }
  return agora() < v.ate;
}

/** @param {PointerEvent} e */
function aoDescer(e) {
  const v = viva;
  if (!v) return;
  viva = null;
  if (!aindaCorre(v)) return;
  try { v.vt.skipTransition(); } catch (erro) { /* já acabou */ }
  v.desenha();
  arma(e.pointerId, document.elementFromPoint(e.clientX, e.clientY));
}

/**
 * TROCA DE CAMADA: desenha o estado novo, com a transição de vista quando pode.
 *
 * Põe o `sentido` em `data-nav` no `html` e, se o movimento foi pedido, a API
 * existe e `anima` não é falso, desenha dentro de `startViewTransition` — o
 * navegador fotografa a tela de agora, chama `desenha` (~1 quadro depois: o
 * quadro a mais que o dono aceitou, pergunta 6) e anima as fotos. Senão desenha
 * agora, no mesmo tique. `desenha` tem de ser idempotente: o pulo do toque (e o
 * relógio do desenho atrasado) o chamam antes do navegador, e o navegador o
 * chama de novo.
 *
 * `rodape` diz se a troca muda a reserva do rodapé — `desce` quando a barra de
 * abas sai (chega uma tela cheia ou o modo), `sobe` quando ela volta —, e vai no
 * `data-pe` do `html`: o cronômetro e o aviso, que ficam sobre a barra, mudam de
 * altura junto com a troca em vez de saltar (`componentes.css`). Sem mudança, o
 * atributo sai.
 *
 * Devolve `true` quando o desenho ficou PENDENTE (há transição), `false` quando
 * já desenhou.
 * @param {'entra' | 'sai' | 'fica' | 'aba-direita' | 'aba-esquerda' | 'seca'} sentido
 * @param {() => void} desenha
 * @param {boolean} [anima] `false` quando o navegador já animou (o gesto de borda)
 * @param {'desce' | 'sobe' | null} [rodape]
 * @returns {boolean}
 */
export function trocaDeCamada(sentido, desenha, anima, rodape) {
  const doc = /** @type {any} */ (typeof document !== 'undefined' ? document : null);
  if (doc && doc.documentElement) {
    doc.documentElement.setAttribute('data-nav', sentido);
    if (rodape) doc.documentElement.setAttribute('data-pe', rodape);
    else doc.documentElement.removeAttribute('data-pe');
  }
  if (anima === false || sentido === 'seca' || !podeMover() || !doc || typeof doc.startViewTransition !== 'function') {
    desenha();
    return false;
  }
  escuta();
  /** @type {{ vt: any, desenha: () => void, ate: number, desenhou: boolean }} */
  const v = { vt: null, desenha: desenha, ate: Infinity, desenhou: false };
  try {
    v.vt = doc.startViewTransition(function () {
      v.desenhou = true;
      desenha();
      // daqui até o fim do tempo da camada, mais a folga: o relógio de quem não
      // pode perguntar ao documento se a transição ainda corre
      v.ate = agora() + Math.max(tempo('--ins-dur-entra'), tempo('--ins-dur-sai')) + FOLGA_MS;
    });
  } catch (e) {
    desenha();
    return false;
  }
  try { v.vt.ready.catch(semDono); } catch (e) { /* sem a promessa, nada a marcar */ }
  viva = v;
  // Só o desenho que o navegador não pediu: a transição que já desenhou segue
  // até o fim dela, por mais lento que o motor esteja.
  setTimeout(function () {
    if (viva !== v || v.desenhou) return;
    viva = null;
    try { v.vt.skipTransition(); } catch (e) { /* já acabou */ }
    desenha();
  }, DESENHO_ATRASADO_MS);
  return true;
}

/**
 * Os milissegundos de um token de duração, lidos de `tokens.css` agora — a
 * fonte é uma só, e o número não se repete aqui.
 *
 * `0` quando não pode mover (menos `--ins-dur-dissolve`, que vale justamente
 * sob "Reduzir movimento"), e `0` para valor que não se lê: "não espere nada".
 * @param {string} nome o token, com os dois hífens: `'--ins-dur-entra'`
 * @returns {number}
 */
export function tempo(nome) {
  const vale = podeMover() || (nome === DISSOLVE && podeDissolver());
  if (!vale) return 0;
  try {
    const raiz = typeof document !== 'undefined' ? document.documentElement : null;
    if (!raiz || typeof getComputedStyle !== 'function') return 0;
    const bruto = getComputedStyle(raiz).getPropertyValue(nome).trim();
    const m = /^(\d*\.?\d+)(ms|s)$/.exec(bruto);
    if (!m) return 0;
    const n = Number(m[1]) * (m[2] === 's' ? 1000 : 1);
    return Number.isFinite(n) && n > 0 ? n : 0;
  } catch (e) {
    return 0;
  }
}
