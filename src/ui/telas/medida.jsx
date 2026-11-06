// O DETALHE DE UMA MEDIDA — fita, dobra ou bioimpedância (docs/corpo/02, §2.6).
//
// Mesmo padrão para todas (dono, 06/11/2026): o gráfico, o histórico com o
// ponto onde cada medida foi tirada e o "como medir". Quando o ponto muda, o
// histórico destaca: daquele ponto em diante os números não se comparam com os
// de antes. No eixo do tempo, uma marca em cada dia de sessão de fotos. Apagar
// mora aqui, um nível para dentro, e não na tela Corpo.

import { TelaCheia } from '../instrumento/telacheia.jsx';
import { Procedencia, Secao, Vazio } from '../instrumento/primitivos.jsx';
import { fmtDate } from '../../dominio/formato';

const L_ = 360, A_ = 150, M = { e: 10, d: 10, c: 12, b: 26 };

/** Uma série no tempo: pontos ligados, ponto vazado onde o ponto de medida mudou, e as fotos no eixo. */
function Curva({ pontos, fotos, rotulo }) {
  if (!pontos.length) return null;
  const ts = pontos.map(p => p.t);
  let de = Math.min.apply(null, ts), ate = Math.max.apply(null, ts);
  if (ate - de < 7 * 86400000) { const m = (de + ate) / 2; de = m - 3.5 * 86400000; ate = m + 3.5 * 86400000; }
  const vs = pontos.map(p => p.v);
  let lo = Math.min.apply(null, vs), hi = Math.max.apply(null, vs);
  if (hi - lo < 1) { const m = (hi + lo) / 2; lo = m - 0.5; hi = m + 0.5; }
  const x = t => M.e + (t - de) / (ate - de) * (L_ - M.e - M.d);
  const y = v => M.c + (hi - v) / (hi - lo) * (A_ - M.c - M.b);
  const marcas = (fotos || []).filter(t => t >= de && t <= ate);
  const base = A_ - M.b + 6;
  return (
    <figure class="md-curva">
      <svg viewBox={`0 0 ${L_} ${A_}`} role="img" aria-label={rotulo}>
        <line class="md-eixo" x1={M.e} x2={L_ - M.d} y1={base} y2={base} />
        {marcas.map(t => <rect key={'f' + t} class="md-foto" x={x(t) - 1.5} y={base - 6} width="3" height="12" />)}
        {pontos.length > 1 && <polyline class="md-linha" points={pontos.map(p => x(p.t) + ',' + y(p.v)).join(' ')} />}
        {pontos.map(p => <circle key={p.t} class={'md-ponto' + (p.mudou ? ' mudou' : '')} cx={x(p.t)} cy={y(p.v)} r={p.mudou ? 5 : 3.5} />)}
      </svg>
      <figcaption class="md-leg">
        <span>{fmtDate(de)}</span>
        {marcas.length > 0 && <span class="md-leg-f"><i class="md-foto-i" /> sessão de fotos</span>}
        <span>{fmtDate(ate)}</span>
      </figcaption>
    </figure>
  );
}

export function DetalheDaMedida({ ctx }) {
  const d = ctx.detalheDaMedida();
  if (!d) return null;

  if (d.k === 'bio') {
    return (
      <TelaCheia olho={d.olho} titulo={d.n} aoVoltar={ctx.fechaMedida} corpo="hwrap md">
        <button class="ins-btn-primary" data-a="bio-nova" onClick={ctx.abreBio}>Nova leitura</button>
        {d.series.map(s => (
          <Secao key={s.k} rotulo={s.n} nota={'última: ' + s.ultima}>
            {s.pontos.length ? <Curva pontos={s.pontos} fotos={d.fotos} rotulo={s.n + ' ao longo do tempo'} />
                             : <Vazio>Nenhuma leitura ainda.</Vazio>}
          </Secao>
        ))}
        <Secao rotulo="Histórico">
          {d.historico.length === 0 && <Vazio>Nenhuma leitura ainda.</Vazio>}
          {d.historico.map(h => (
            <div class="md-hist" key={h.t}>
              <span class="md-hist-d">{h.data} · {h.hora}</span>
              <span class="md-hist-v">{h.valores}</span>
              <button class="crow-x" onClick={() => ctx.apagaLeituraBio(h.t)}>Remover</button>
            </div>
          ))}
        </Secao>
        <Procedencia>
          O peso desta balança fica com os outros quatro números dela. O peso da
          manhã, que entra na média da semana, é o de cima, em Corpo.
        </Procedencia>
      </TelaCheia>
    );
  }

  return (
    <TelaCheia olho={d.olho} titulo={d.n} meta={d.atual} aoVoltar={ctx.fechaMedida} corpo="hwrap md">
      {d.variacao && <p class="ins-body-sm ins-t2">{d.variacao}</p>}
      <button class="ins-btn-primary" data-a="medida-nova" onClick={() => ctx.abreMedidas(d.k)}>Nova medida</button>
      {d.pontos.length
        ? <Curva pontos={d.pontos} fotos={d.fotos} rotulo={d.n + ' ao longo do tempo'} />
        : <Vazio>Nenhuma medida ainda.</Vazio>}

      <Secao rotulo="Como medir">
        <p class="ins-body-sm ins-t1">{d.como}</p>
        <p class="ins-body-sm ins-t2">ponto: {d.ponto}</p>
        <Procedencia>{d.regra}</Procedencia>
      </Secao>

      <Secao rotulo="Histórico">
        {d.historico.length === 0 && <Vazio>Nenhuma medida ainda.</Vazio>}
        {d.historico.map(h => (
          <div class={'md-hist' + (h.mudou ? ' mudou' : '')} key={h.t}>
            <span class="md-hist-d">{h.data} · {h.hora}</span>
            <span class="md-hist-v">{h.valor}</span>
            <button class="crow-x" onClick={() => ctx.apagaMedida(d.k, h.t)}>Remover</button>
            <span class="md-hist-o">
              {h.onde || 'ponto não anotado'}
              {h.mudou && <b class="md-mudou"> · o ponto mudou: não compare com as de antes</b>}
            </span>
          </div>
        ))}
      </Secao>
    </TelaCheia>
  );
}
