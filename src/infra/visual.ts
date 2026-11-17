// O interruptor do visual novo (direção 3).
//
// É DO APARELHO, e não do registro: mora numa chave própria do navegador, fora
// do estado sincronizado, para um aparelho poder ver o visual novo sem que os
// outros mudem junto. Sai na Fase 5 do plano, quando o visual novo vira o
// único (docs/redesign-3/00-plano.md).

const CHAVE = 'lastro-visual';

/**
 * Lido do armazenamento UMA vez e guardado aqui: a pergunta é feita a cada
 * desenho (a casca, as folhas, os destinos), e o desenho é o caminho mais
 * quente do app. Só `poeVisual` muda o valor.
 */
let cache: boolean | null = null;

/** O visual novo está ligado neste aparelho? */
export function visualNovo(): boolean {
  if (cache === null) {
    try { cache = typeof localStorage !== 'undefined' && localStorage.getItem(CHAVE) === '3'; }
    catch (e) { cache = false; }
  }
  return cache;
}

/**
 * Marca a página com o visual em uso. Com o novo ligado, o tema fica claro
 * também nas telas antigas que ainda aparecem: o visual novo é só claro.
 */
export function aplicaVisual(): void {
  if (typeof document === 'undefined') return;
  const raiz = document.documentElement;
  if (visualNovo()) {
    raiz.setAttribute('data-visual', '3');
    raiz.setAttribute('data-theme', 'light');
  } else if (raiz.getAttribute('data-visual') === '3') {
    raiz.removeAttribute('data-visual');
    raiz.removeAttribute('data-theme');
  }
}

/** Liga ou desliga o visual novo neste aparelho. */
export function poeVisual(novo: boolean): void {
  try {
    if (novo) localStorage.setItem(CHAVE, '3');
    else localStorage.removeItem(CHAVE);
  } catch (e) { /* sem armazenamento, vale só até fechar o app */ }
  cache = novo;
  aplicaVisual();
}
