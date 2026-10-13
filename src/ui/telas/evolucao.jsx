// EVOLUÇÃO — a leitura do peso ao longo do tempo, dentro de Corpo.
//
// O desenho é o estado 8 do `corpo.html` da D: "a curva que achatou, e os
// pontos que não decidem". O nome é o que o dono devolveu em 06/10 (§1.7 da
// frente 3): "Evolução", no lugar de "Histórico" — é a palavra dele, dita duas
// vezes ("quero registrar essa evolução", "gosto de acompanhar esse tipo de
// evolução"). Não é um sexto lugar: abre de Corpo e volta para ele.
//
// Três coisas, e a ordem é a da leitura:
// - o gráfico: a linha é o que a regra lê (média da semana, só onde ela vale);
//   os pontos são as pesagens do dia, para a oscilação diária ficar à vista ao
//   lado da média; a faixa é o alvo do nutricionista traduzido em inclinação;
// - "Taxa, semana a semana", que é também a tabela do gráfico: cada número que
//   o desenho mostra está aqui em texto;
// - para onde a decisão mora (Semana), e o par de fotos.
//
// O gráfico NÃO tem toque. É tela de telefone lida de relance, uma série só, e
// cada número que importa já está na lista logo abaixo — um alvo de toque em
// pontos de 4 px seria pior que nenhum.

import { TelaCheia } from '../instrumento/telacheia.jsx';
import { Procedencia, Secao, Vazio } from '../instrumento/primitivos.jsx';

const DIA = 86400000;
const L_ = 360, A_ = 180, M = { e: 8, d: 8, c: 12, b: 12 };

/** O gráfico, em SVG, a partir da leitura pura. */
function Curva({ ev }) {
  const L = ev.leitura;
  if (!L.pontos.length) return null;
  const vs = L.pontos.map(p => p.v).concat(L.semanas.map(w => w.v));
  const pri = L.semanas[0];
  // O eixo vai até o FIM da semana em curso: a média dela fica no meio da
  // semana, que ainda não acabou, e com o eixo parando em "agora" o ponto saía
  // pela borda direita.
  const fimDaSemana = L.semanas.length ? Math.max(L.ate, L.semanas[L.semanas.length - 1].w + 7 * DIA) : L.ate;
  const xs = [L.de, fimDaSemana];
  // a faixa do alvo parte da primeira média válida e sobe nas duas inclinações
  const faixa = pri ? [ev.alvo.min, ev.alvo.max].map(k => ({
    a: pri.v, b: pri.v + k * ((fimDaSemana - (pri.w + 3.5 * DIA)) / (7 * DIA))
  })) : null;
  if (faixa) faixa.forEach(f => vs.push(f.b));
  let lo = Math.min.apply(null, vs), hi = Math.max.apply(null, vs);
  if (hi - lo < 0.6) { const m = (hi + lo) / 2; lo = m - 0.3; hi = m + 0.3; }
  const x = t => M.e + (t - xs[0]) / (xs[1] - xs[0] || 1) * (L_ - M.e - M.d);
  const y = v => M.c + (hi - v) / (hi - lo) * (A_ - M.c - M.b);
  const meio = w => w.w + 3.5 * DIA;

  // A linha não atravessa buraco: semanas não consecutivas viram trechos.
  const trechos = [];
  L.semanas.forEach((w, i) => {
    const ant = L.semanas[i - 1];
    if (!ant || w.w - ant.w > 7 * DIA + 2 * 3600000) trechos.push([]);
    trechos[trechos.length - 1].push(w);
  });

  return (
    <svg class="ev-curva" viewBox={`0 0 ${L_} ${A_}`} role="img"
         aria-label={'Peso por semana: ' + (ev.inicio || '') + ' até ' + (ev.fim || '') +
                     '. A lista abaixo traz a taxa de cada semana.'}>
      {faixa && (
        <polygon class="ev-faixa"
          points={[
            [x(meio(pri)), y(faixa[0].a)], [x(fimDaSemana), y(faixa[0].b)],
            [x(fimDaSemana), y(faixa[1].b)], [x(meio(pri)), y(faixa[1].a)]
          ].map(p => p.join(',')).join(' ')} />
      )}
      {L.pontos.map(p => <circle key={p.t} class="ev-dia" cx={x(p.t)} cy={y(p.v)} r="2" />)}
      {trechos.map((t, i) => (
        <polyline key={i} class="ev-linha" points={t.map(w => x(meio(w)) + ',' + y(w.v)).join(' ')} />
      ))}
      {L.semanas.map(w => <circle key={w.w} class="ev-semana" cx={x(meio(w))} cy={y(w.v)} r="4" />)}
    </svg>
  );
}

export function Evolucao({ ctx }) {
  const ev = ctx.evolucao();
  return (
    <TelaCheia olho="a pesagem da manhã" meta={ev.meta} titulo="Evolução"
               aoVoltar={ctx.fechaEvolucao} corpo="hwrap">
      {!ev.leitura.pontos.length
        ? <Vazio>Nenhuma pesagem ainda. A curva começa na primeira, e a média da semana na segunda.</Vazio>
        : <>
            <Curva ev={ev} />
            {ev.inicio && (
              <div class="ev-pontas">
                <span>{ev.inicio}</span>
                <span>{ev.fim}</span>
              </div>
            )}
            <Procedencia>
              Linha: média da semana. Pontos: pesagens do dia. Faixa: o alvo de
              +0,15 a +0,30 kg por semana.
            </Procedencia>
          </>}

      <Secao rotulo="taxa, semana a semana">
        <div class="ins-lista">
          {ev.taxas.map(t => (
            <div key={t.w} class="ins-linha ev-taxa">
              <span class="ins-linha-n">
                <span class="ins-linha-t">{t.intervalo}</span>
                <span class="ins-linha-s">{t.nota}</span>
              </span>
              <span class="ins-linha-v ev-taxa-v">
                <b>{t.valor}</b>
                <span class="ins-linha-s">{t.classe}</span>
              </span>
            </div>
          ))}
        </div>
        <p class="ins-body-sm ins-t2 ev-frase">{ev.frase}</p>
        <button class="ins-btn-secondary" data-a="evolucao-semana"
                onClick={() => { ctx.fechaEvolucao(); ctx.vaiPara('semana'); }}>Ir para Semana</button>
      </Secao>

      {ev.podeComparar && (
        <Secao rotulo="as fotos">
          <button class="ins-btn-secondary" data-a="evolucao-comparar" onClick={ctx.abreComparar}>Comparar fotos</button>
        </Secao>
      )}
    </TelaCheia>
  );
}
