// A casca das telas que tomam a tela inteira.
//
// Programa, histórico, detalhe da sessão, retrospectiva e decisão de fim de
// sessão não são abas: são destinos que substituem a shell, tab bar inclusive.
// Isso é herdado do app antigo e continua certo — em todas elas o assunto é uma
// coisa só, e a tab bar convidaria a sair no meio.
//
// O botão de voltar é o único caminho de saída, e por isso vem primeiro, com
// alvo cheio de 46px e área segura contada no topo.

export function TelaCheia({ olho, meta, titulo, aoVoltar, acao, corpo, children }) {
  return (
    <div class="tc">
      <div class="tc-topo">
        <button class="tc-back" onClick={aoVoltar}>‹ voltar</button>
        {acao}
      </div>
      <div class="tc-cab">
        <div class="tc-olho">
          <span class="ins-label">{olho}</span>
          {meta && <span class="ins-label tc-meta">{meta}</span>}
        </div>
        <h2 class="ins-display tc-titulo htitle">{titulo}</h2>
      </div>
      <div class={'tc-corpo ' + (corpo || '')}>{children}</div>
    </div>
  );
}

/**
 * A faixa de números do topo de uma tela cheia.
 *
 * Mantém a marcação `.stats > div > b + span` do sistema antigo de propósito:
 * é o contrato que os testes têm com o DOM, e a forma já estava certa — o que
 * faltava era a língua. Repintar custa CSS; renomear custaria churn.
 */
export function Stats({ celulas }) {
  return (
    <div class="stats ins-hairgrid" style={`grid-template-columns:repeat(${celulas.length},1fr)`}>
      {celulas.map(c => (
        <div key={c.k}>
          <b class={c.cor || ''}>{c.valor}</b>
          <span>{c.rotulo}</span>
        </div>
      ))}
    </div>
  );
}

/**
 * O gráfico do histórico.
 *
 * Entra como markup pronto porque é DESENHO: `chartSVG()` calcula escala,
 * caminho e eixo em coordenadas, e transcrever isso para JSX renderizaria o
 * mesmo SVG com mais linhas e mais chance de erro. A condição para isso ser
 * aceitável é que o desenho não tenha comportamento — nenhum handler, nenhum
 * id que outra função procure. Um teste garante que continua assim.
 */
export function Grafico({ svg }) {
  if (!svg) return null;
  return <div class="ins-grafico" dangerouslySetInnerHTML={{ __html: svg }} />;
}

/**
 * Uma linha de exercício num resumo (sessão, retrospectiva, histórico).
 * Nome à esquerda, variação à direita, séries embaixo em mono.
 */
export function LinhaResumo({ nome, delta, deltaCor, series, meta, marcas, nota }) {
  return (
    <div class="tc-res hs">
      <div class="tc-res-topo">
        <span class="tc-res-n">{nome}</span>
        {delta != null && <span class={'tc-res-d ' + (deltaCor || '')}>{delta}</span>}
      </div>
      <div class="tc-res-sets hs-sets">
        {series.map((s, i) => (
          <span key={i} class={s ? '' : 'nul'}>{s || '–'}</span>
        ))}
        {meta && <span class="nul">{meta}</span>}
        {(marcas || []).map(m => <span key={m} class="rec">{m}</span>)}
      </div>
      {nota && <div class="tc-res-nota">{nota}</div>}
    </div>
  );
}
