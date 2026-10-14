// As primitivas do Instrumento.
//
// Cada uma tem anatomia exata — as medidas vêm do DESIGN.md § Componentes e não são
// sugestão. Se uma tela precisar de algo que não está aqui, o certo é
// adicionar a primitiva, não improvisar no lugar: foi assim que o sistema
// antigo acumulou nove hexadecimais soltos no meio das regras.
//
// Nenhuma delas lê estado. Recebem dado e devolvem marcação.

import { useEffect, useState } from 'preact/hooks';

/* ---------- estrutura ---------- */

/**
 * Sobrancelha + título da tela, com botão de estado opcional à direita.
 * O padding de cima já conta a área segura do iPhone.
 */
export function Cabecalho({ olho, titulo, acao }) {
  return (
    <header class="ins-cab">
      <div class="ins-label">{olho}</div>
      <div class="ins-cab-linha">
        <h1 class="ins-display">{titulo}</h1>
        {acao}
      </div>
    </header>
  );
}

/** O botão de estado do cabeçalho: rótulo pequeno em cima, valor ácido embaixo. */
export function BotaoEstado({ rotulo, valor, onClick }) {
  return (
    <button class="ins-estado" onClick={onClick}>
      <span class="ins-label-sm">{rotulo}</span>
      <span class="ins-estado-v">{valor}</span>
    </button>
  );
}

/**
 * Toda seção começa assim: fio de 1px, respiro, rótulo. A `nota` à direita
 * carrega contagem ou dica ("toque em ··· para editar").
 */
/**
 * `continua` = a seção anterior não terminou; é a MESMA, partida ao meio.
 *
 * Existe para um caso só: um filho que precisa ser `sticky` não pode morar
 * dentro da seção, porque sticky se prende ao bloco que o contém e descolaria
 * junto com ela. Partir a seção e não desenhar o fio deixa o elemento subir
 * para o `<main>` sem que a tela mude de aparência.
 */
export function Secao({ rotulo, nota, children, primeira, continua, id }) {
  return (
    <section
      id={id}
      class={'ins-secao' + (primeira ? ' primeira' : '') + (continua ? ' continua' : '')}
    >
      {(rotulo || nota) && (
        <div class="ins-secao-h">
          <span class="ins-label">{rotulo}</span>
          {nota && <span class="ins-secao-nota">{nota}</span>}
        </div>
      )}
      {children}
    </section>
  );
}

/**
 * Estado vazio: uma frase. Sem ilustração, sem mascote.
 *
 * Nível 3, não 5: o nível 5 dá 3,2:1 e existe para o REDUNDANTE — dica que
 * repete o que já está na tela. O vazio é o contrário disso: é a única coisa
 * escrita ali, e dizer o que falta num cinza que reprova em AA é não dizer.
 */
export function Vazio({ children }) {
  return <p class="ins-body-sm ins-t3 ins-vazio">{children}</p>;
}

/** Linha de procedência: de onde veio um número derivado. */
export function Procedencia({ children }) {
  return <div class="ins-provenance">{children}</div>;
}

/* ---------- números ---------- */

/**
 * Grade de fios com 2, 3 ou 4 colunas. As células depois da primeira ganham
 * recuo à esquerda para os números alinharem opticamente na própria coluna.
 */
export function GradeMetricas({ colunas = 3, celulas }) {
  return (
    <div class="ins-hairgrid ins-grade" style={`grid-template-columns:repeat(${colunas},1fr)`}>
      {celulas.map((c, i) => (
        <div key={c.k || i} class={'ins-grade-c' + (i % colunas ? ' recuo' : '')}>
          <div class="ins-label-sm">{c.rotulo}</div>
          <div id={c.id} class={'ins-metric-m' + (c.cor ? ' ' + c.cor : '')}>{c.valor}</div>
          {c.nota && <div class="ins-grade-nota">{c.nota}</div>}
        </div>
      ))}
    </div>
  );
}

/**
 * Sparkline de barras: 14 fatias. As fatias vazias continuam como trilho —
 * os buracos no registro são visíveis de propósito.
 */
/**
 * A escala é ANCORADA NO INTERVALO DOS DADOS, não no zero.
 *
 * Peso corporal varia ~1% em torno de 71 kg. Contra o zero, 70,0 e 71,5 viram
 * 97,9% e 100% de altura — num gráfico de 48px isso é 1 pixel de diferença, e
 * o gráfico passa a dizer só em que semanas houve registro. O gráfico de
 * exercício já normalizava entre mínimo e máximo; este não tinha ganhado o
 * mesmo tratamento.
 *
 * `piso` é a amplitude mínima da escala, e existe para o erro oposto: sem ele,
 * uma oscilação de 100 g ocuparia o gráfico inteiro e retenção de água pareceria
 * tendência. Abaixo do piso a variação aparece pequena, que é o que ela é.
 */
export function Sparkline({ valores, fatias = 14, piso = 2 }) {
  const v = valores.slice(-fatias);
  const vazias = Math.max(0, fatias - v.length);
  const cheios = v.filter(x => x != null);
  const hi = cheios.length ? Math.max(...cheios) : 1;
  const lo = cheios.length ? Math.min(...cheios) : 0;
  // o intervalo cresce simetricamente até o piso, para o dado ficar centrado
  const folga = Math.max(0, piso - (hi - lo)) / 2;
  const topo = hi + folga, base = lo - folga;
  const alt = x => topo === base ? 60 : 12 + ((x - base) / (topo - base)) * 88;
  return (
    <div class="ins-spark">
      {Array.from({ length: vazias }).map((_, i) => (
        <div key={'v' + i} class="ins-spark-s" />
      ))}
      {v.map((x, i) => (
        <div key={i} class="ins-spark-s">
          {x != null && (
            <div class="ins-spark-b" style={`height:${alt(x)}%`} />
          )}
        </div>
      ))}
    </div>
  );
}

/* ---------- controles ---------- */

/** − valor + com alvos de 46px. Para qualquer número que se aperta repetido. */
export function Stepper({ valor, passo = 1, onMuda, fmt, min, max }) {
  const anda = d => {
    const novo = Math.round((valor + d * passo) * 1000) / 1000;
    if (min != null && novo < min) return;
    if (max != null && novo > max) return;
    onMuda(novo);
  };
  return (
    <div class="ins-stepper">
      <button class="ins-stepper-btn" aria-label="diminuir" onClick={() => anda(-1)}>−</button>
      <div class="ins-stepper-val">{fmt ? fmt(valor) : valor}</div>
      <button class="ins-stepper-btn" aria-label="aumentar" onClick={() => anda(1)}>+</button>
    </div>
  );
}

/** Chips. Um só ativo por grupo quando `unico`. */
export function Chips({ opcoes, valor, onMuda }) {
  return (
    <div class="ins-chips">
      {opcoes.map(o => (
        <button
          key={o.k}
          class={'ins-chip' + (o.k === valor ? ' on' : '')}
          onClick={() => onMuda(o.k)}
        >{o.t}</button>
      ))}
    </div>
  );
}

/* ---------- objetos destacados ---------- */

/**
 * Cartão de veredito: recomendação calculada. É uma das poucas caixas com
 * borda do sistema, porque é um objeto genuinamente destacado.
 */
export function Veredito({ rotulo, veredito, cor = 'acid', explicacao, acao, estado }) {
  return (
    <div class="ins-veredito">
      <div class="ins-label">{rotulo}</div>
      <div class={'ins-veredito-t ins-' + cor}>{veredito}</div>
      <p class="ins-body-sm ins-t2 ins-veredito-p">{explicacao}</p>
      {acao}
      {estado && <div class="ins-provenance ins-veredito-e">{estado}</div>}
    </div>
  );
}

/**
 * O cartão-foco: responde "e agora?". Primeira coisa da tela principal e um
 * alvo de toque só. Sem borda e sem preenchimento — flutua no papel.
 */
/**
 * O cartão de cima: UM cartão respondendo "e agora?".
 *
 * Uma forma visual só para os seis tipos que a regra devolve
 * (`src/dominio/agora.ts`), porque o lugar da resposta não muda com o tipo da
 * resposta — o que muda é o que preenche cada fatia.
 *
 * Duas formas de agir, e a escolha não é estética:
 *
 * - **`cta`**: o cartão INTEIRO é o botão. É o caso de quase todos — "abrir e
 *   marcar", "voltar à sessão" —, em que há uma ação óbvia e o alvo maior é o
 *   que serve à mão suada.
 * - **`acoes`**: duas respostas, e aí o cartão deixa de ser botão e vira
 *   moldura com botões dentro. É o fim aproximado: "Está certo" e "Corrigir o
 *   fim" são respostas OPOSTAS, e esconder uma delas atrás do toque no cartão
 *   escolheria por ele. Botão dentro de botão não existe em HTML, então a
 *   moldura precisa deixar de ser `<button>` — e é o que `Fora` faz aqui.
 */
export function CartaoFoco({ procedencia, rotulo, nome, contagem, contagemRotulo, resumo, cta, onClick, acoes }) {
  const Fora = acoes && acoes.length ? 'div' : 'button';
  return (
    <Fora class="ins-foco" onClick={acoes && acoes.length ? undefined : onClick}>
      {/* A sobrancelha é a PROCEDÊNCIA do que o cartão mostra — "no plano às
          16h00", "na prescrição · Treino B" —, e não "agora": esta repetia o
          nome do lugar em que ele já está, e era a única das quatro "agora" da
          tela que não acrescentava nada (§1.1 da frente 3). */}
      <div class="ins-foco-agora">
        <span class="ins-live-dot" />
        <span class="ins-label">{procedencia}</span>
      </div>
      <div class="ins-foco-linha">
        <div class="ins-foco-esq">
          <div class="ins-label ins-acid">{rotulo}</div>
          <div class="ins-headline">{nome}</div>
        </div>
        {contagem && (
          <div class="ins-foco-dir">
            <div class="ins-metric-l">{contagem}</div>
            <div class="ins-label-sm">{contagemRotulo}</div>
          </div>
        )}
      </div>
      {resumo && <p class="ins-body-sm ins-t3 ins-foco-res">{resumo}</p>}
      {cta && <span class="ins-chip-cta">{cta}</span>}
      {acoes && acoes.length > 0 && (
        <div class="ins-foco-acoes">
          {acoes.map(function (a, i) {
            return (
              <button key={a.t}
                      class={i === 0 ? 'ins-btn-primary' : 'ins-btn-secondary'}
                      data-a={a.a}
                      onClick={a.onClick}>{a.t}</button>
            );
          })}
        </div>
      )}
    </Fora>
  );
}

/* ---------- relógio ---------- */

/**
 * O relógio de parede do app, batendo de segundo em segundo.
 *
 * Um intervalo só, compartilhado por quem precisar: o iOS congela timers com
 * a tela apagada, e ressincronizar um é barato — ressincronizar sete, não.
 * Por isso também escuta `visibilitychange`: voltar do bloqueio tem que
 * corrigir o relógio na hora, não no próximo tique.
 */
export function useAgora() {
  const [t, setT] = useState(() => Date.now());
  useEffect(() => {
    const bate = () => setT(Date.now());
    const id = setInterval(bate, 1000);
    document.addEventListener('visibilitychange', bate);
    return () => { clearInterval(id); document.removeEventListener('visibilitychange', bate); };
  }, []);
  return t;
}
