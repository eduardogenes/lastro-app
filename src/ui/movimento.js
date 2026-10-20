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
// `.animate()` ou mexer numa animação viva (`getAnimations`). A guarda de
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

/**
 * SEGURA NO LUGAR o que está chegando sob o dedo: as animações que correm
 * agora nestes elementos param, NESTE instante, no quadro em que estão — e a
 * função devolvida as solta, e elas seguem de onde pararam.
 *
 * É o que deixa o toque no meio da chegada acertar o que o dedo tocou (peça 4:
 * a folha e o painel de pare sobem com o quique; `seguraSobODedo`,
 * `folha.jsx`). `pause()` sozinho não serve: a pausa fica pendente até o
 * próximo quadro, e a camada ainda anda até ~60 px sob o dedo. Repor o tempo
 * atual completa a pausa na hora, no tempo do quadro em que o toque foi
 * testado — que é onde o dedo achou a caixa.
 *
 * Sem movimento pedido, sem a API ou sem nada correndo, não há o que segurar:
 * devolve `null`.
 * @param {Element[]} elementos
 * @returns {(() => void) | null}
 */
export function seguraNoLugar(elementos) {
  if (!podeMover()) return null;
  /** @type {Animation[]} */
  const presas = [];
  elementos.forEach(function (el) {
    if (!el || typeof el.getAnimations !== 'function') return;
    el.getAnimations().forEach(function (a) {
      const agora = a.currentTime;
      if (a.playState !== 'running' || agora == null) return;
      a.pause();
      a.currentTime = agora;
      presas.push(a);
    });
  });
  if (!presas.length) return null;
  return function () {
    presas.forEach(function (a) {
      try { a.play(); } catch (e) { /* o nó já saiu: não há o que soltar */ }
    });
  };
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
