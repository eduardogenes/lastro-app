// DIAS — o que aconteceu em cada dia.
//
// O desenho é a terceira entrega da D (`dias.html`): o lugar nasceu por mudança
// de endereço e não tinha desenho nenhum; agora tem. O mês é a entrada, e o dia
// é o lugar. Cada célula diz o que o dia teve por forma e palavra — a letra do
// treino, "aula", "fora", "desc.", o coração do cardio, a barra da comida —, e
// um toque abre o dia (`dia.jsx`). Embaixo, três leituras do mês, e só estas.
//
// O que ele NÃO tem, e está declarado:
// - **nada prescrito.** O plano de um dia passado aparece no dia, como
//   referência; o plano é de Prescrição.
// - **nenhuma leitura de semana.** Volume e séries por músculo são de Semana.
// - **o "agora".** Um dia que passou não tem; tocar em hoje abre o Agora.
// - **presunção.** Dia sem registro fica vazio: o domingo não vira descanso
//   sozinho, e a segunda sem registro não vira treino.

import { Cabecalho, Secao } from '../instrumento/primitivos.jsx';

function Celula({ c, ctx }) {
  return (
    <button
      class={'dc' + (c.hoje ? ' hoje' : '') + (c.futuro ? ' futuro' : '') + (c.descanso ? ' desc' : '')}
      data-dia={c.iso}
      aria-label={c.rotulo}
      disabled={!c.abre}
      onClick={() => ctx.abreDia(c.abre)}
    >
      <span class="dc-n" aria-hidden="true">{c.n}</span>
      {c.principal && <span class="dc-p" aria-hidden="true">{c.principal}</span>}
      {c.extra && <span class="dc-x" aria-hidden="true">{c.extra}</span>}
      {c.cardio > 0 && <span class="dc-c" aria-hidden="true">♥{c.cardio > 1 ? c.cardio : ''}</span>}
      {c.comida && <i class={'dc-f ' + c.comida} aria-hidden="true" />}
    </button>
  );
}

/** A média móvel do mês, com a linha da prescrição tracejada como referência. */
function LinhaDaMedia({ t }) {
  const L = 240, A = 44, s = t.serie;
  if (!s || s.length < 2) return null;
  const hi = Math.max(t.prescricao, Math.max.apply(null, s)) + 0.5, lo = 0;
  const x = i => 4 + i / (s.length - 1) * (L - 8);
  const y = v => 4 + (hi - v) / (hi - lo) * (A - 8);
  return (
    <div class="dm-linha">
      <svg viewBox={`0 0 ${L} ${A}`} aria-hidden="true">
        <line class="dm-presc" x1="4" x2={L - 4} y1={y(t.prescricao)} y2={y(t.prescricao)} />
        <polyline class="dm-serie" points={s.map((v, i) => x(i) + ',' + y(v)).join(' ')} />
        <circle class="dm-fim" cx={x(s.length - 1)} cy={y(s[s.length - 1])} r="3" />
      </svg>
      <div class="dm-legenda"><span>{t.de}</span><span>{t.prescricao} na prescrição</span><span>{t.ate}</span></div>
    </div>
  );
}

/** Os inícios num eixo de 5h a 22h: a média engana, e os pontos dizem por quê. */
function EixoDosInicios({ h }) {
  const L = 300, A = 30, de = 5 * 60, ate = 22 * 60;
  const x = m => 6 + (Math.min(Math.max(m, de), ate) - de) / (ate - de) * (L - 12);
  return (
    <svg class="dm-eixo" viewBox={`0 0 ${L} ${A}`} aria-hidden="true">
      <line class="dm-eixo-l" x1="6" x2={L - 6} y1="18" y2="18" />
      {[6, 9, 12, 15, 18, 21].map(hh => (
        <text key={hh} class="dm-eixo-t" x={x(hh * 60)} y="29" text-anchor="middle">{hh}h</text>
      ))}
      {h.pontos.map((m, i) => <circle key={i} class="dm-eixo-p" cx={x(m)} cy="18" r="3.5" />)}
      <path class="dm-eixo-m" d={`M${x(h.medianaMin) - 4},6 L${x(h.medianaMin) + 4},6 L${x(h.medianaMin)},12 Z`} />
    </svg>
  );
}

export function Mes({ m, ctx }) {
  return (
    <>
      <div class="mes-nav">
        <button class="mes-b" aria-label={m.anterior} onClick={() => ctx.mudaMes(-1)}>‹</button>
        <span class="mes-t">{m.titulo}</span>
        <button class="mes-b" aria-label={m.proximo} disabled={!m.podeAvancar} onClick={() => ctx.mudaMes(1)}>›</button>
      </div>
      <div class="dc-grade">
        {m.dias.map(d => <span key={d} class="dc-h">{d}</span>)}
        {Array.from({ length: m.offset }).map((_, i) => <span key={'x' + i} class="dc-x0" />)}
        {m.celulas.map(c => <Celula key={c.n} c={c} ctx={ctx} />)}
      </div>
    </>
  );
}

export function Dias({ ctx }) {
  const m = ctx.mes();
  return (
    <>
      <Cabecalho olho="o que aconteceu" titulo="Dias" />

      <Secao primeira>
        <Mes m={m} ctx={ctx} />
      </Secao>

      {/* O vazio do primeiro mês: nada aqui vira zero, e a única oferta é a
          que o primeiro dia pede (estado 15). */}
      {m.vazio && (
        <Secao>
          <p class="ins-body ins-t1 dm-vazio-t">Ainda não há dias para ler</p>
          <p class="ins-body-sm ins-t2">
            Cada treino, descanso, cardio e refeição que você registrar aparece no dia dele. Treinos de antes de
            hoje também podem entrar, com a data deles.
          </p>
          <button class="ins-btn-secondary dm-vazio-b" data-a="registrar-passado"
                  onClick={() => ctx.abreSessaoDoDia({ k: 'lancar', t: Date.now() - 86400000 })}>
            Registrar um treino passado
          </button>
        </Secao>
      )}

      {/* AS TRÊS LEITURAS DO MÊS, e só estas, cada uma com a conta à vista. */}
      <Secao rotulo="Dias com treino por semana">
        {m.treino
          ? <>
              {m.treino.valor && <p class="dm-valor">{m.treino.valor}</p>}
              {m.treino.valor && <LinhaDaMedia t={m.treino} />}
              <p class="ins-body-sm ins-t2 dm-conta">{m.treino.conta}</p>
            </>
          : <p class="ins-body-sm ins-t3">
              Aparece com o primeiro treino. A média usa as últimas 4 semanas; até completar 4, a conta vem sem
              média: “3 dias com treino em 9”.
            </p>}
      </Secao>

      <Secao rotulo={m.cardio.titulo}>
        {m.cardio.n
          ? <div class="dm-tres">
              <span><b>{m.cardio.n}</b>{m.cardio.n === 1 ? 'sessão' : 'sessões'}</span>
              <span><b>{m.cardio.min} min</b>no total</span>
              <span><b>{m.cardio.so}</b>em dia sem musculação</span>
            </div>
          : <p class="ins-body-sm ins-t3">Nenhum cardio registrado.</p>}
      </Secao>

      <Secao rotulo="Horário de início">
        {m.horario
          ? <>
              <div class="dm-tres">
                <span><b>{m.horario.mediana}</b>mediana</span>
                <span><b>{m.horario.cedo}</b>mais cedo · {m.horario.cedoDia}</span>
                <span><b>{m.horario.tarde}</b>mais tarde · {m.horario.tardeDia}</span>
              </div>
              <EixoDosInicios h={m.horario} />
              <p class="ins-body-sm ins-t2 dm-conta">{m.horario.nota}</p>
            </>
          : <p class="ins-body-sm ins-t3">Aparece com a primeira sessão que tiver hora.</p>}
      </Secao>
    </>
  );
}
