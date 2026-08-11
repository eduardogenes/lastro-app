// A linha de timeline: a espinha de qualquer dia em sequência.
//
// É o componente que faz a fusão valer a pena. Refeição e exercício são a
// mesma forma no mesmo eixo — o pré-treino das 5h45 e a sessão das 6h15 são
// uma sequência só, e a tela precisa dizer isso sem que ninguém explique.
//
// Anatomia (DESIGN_SYSTEM §3.6):
//   [ 46px calha de hora, mono 12px, à direita ]
//   [ espinha de 1px + ponto de 9px ]
//   [ conteúdo, flex:1 ]
//   [ 30px ··· ]

import { Caixa } from './primitivos.jsx';

/**
 * @param {object} p
 * @param {string} p.hora      "05:45" — ou o número da série, quando é treino
 * @param {string} p.nome
 * @param {string} [p.valor]   número à direita do nome (kcal, carga…)
 * @param {string} [p.resumo]  uma linha do que tem dentro
 * @param {string} [p.meta]    linha de 10px em mono: macros, volume, RIR
 * @param {boolean} [p.feito]
 * @param {boolean} [p.agora]  a linha corrente ganha fundo levemente ácido
 * @param {'acid'|'amber'|'coral'} [p.cor] cor do ponto
 * @param {Function} [p.aoMarcar]  sem isto, não há caixa de marcar
 * @param {Function} [p.aoAbrir]   corpo da linha
 * @param {Function} [p.aoEditar]  o ···
 * @param {boolean} [p.ultima]  a última não desenha o fio de baixo
 */
export function LinhaTimeline({
  hora, nome, valor, resumo, meta, feito, agora, cor,
  aoMarcar, aoAbrir, aoEditar, ultima, filhos
}) {
  return (
    <div class={'ins-tl' + (feito ? ' feito' : '') + (agora ? ' agora' : '') + (ultima ? ' ultima' : '')}>
      <div class="ins-tl-hora">{hora}</div>

      <div class="ins-tl-espinha">
        <span class={'ins-tl-ponto' + (cor ? ' ' + cor : '')} />
      </div>

      <div class="ins-tl-corpo">
        <div class="ins-tl-topo">
          {aoMarcar && <Caixa marcada={feito} onClick={aoMarcar} rotulo={`marcar ${nome}`} />}
          <button class="ins-tl-toque" onClick={aoAbrir} disabled={!aoAbrir}>
            <span class="ins-tl-nome">{nome}</span>
            {valor && <span class="ins-tl-valor">{valor}</span>}
          </button>
        </div>
        {resumo && <div class="ins-tl-resumo">{resumo}</div>}
        {meta && <div class="ins-tl-meta">{meta}</div>}
        {filhos}
      </div>

      {aoEditar && (
        <button class="ins-tl-mais" aria-label={`editar ${nome}`} onClick={aoEditar}>···</button>
      )}
    </div>
  );
}
