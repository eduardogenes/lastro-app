// GUIA — a camada de referência das duas metades, e os dois restaurares.
//
// Lei 7: toda mudança global tem um restaurar documentado. São dois, e eles
// dizem exatamente o que preservam — porque a pergunta que trava a mão de
// alguém antes de tocar num botão desses é sempre "e o meu histórico?".

import { Cabecalho, Procedencia, Secao } from '../instrumento/primitivos.jsx';
import { DIAS_CURTOS } from '../../dominio/formato';

export function Guia({ ctx }) {
  const g = ctx.guia();

  return (
    <>
      <Cabecalho olho="referência" titulo="Guia" />

      <Secao primeira rotulo="a semana" nota="qual treino vem é da rotação">
        <div class="gu-semana">
          {DIAS_CURTOS.map((_, i) => {
            // DIAS_CURTOS começa na segunda; a cadência é indexada por getDay()
            const idx = (i + 1) % 7;
            const treina = g.cadencia[idx] === 'treino';
            return (
              <button
                key={idx}
                class={'gu-dia' + (treina ? ' on' : '')}
                onClick={() => ctx.alternaCadencia(idx)}
              >
                <span class="ins-label-sm">{DIAS_CURTOS[i]}</span>
                <span class="gu-dia-v">{treina ? 'treino' : 'folga'}</span>
              </button>
            );
          })}
        </div>
        <Procedencia>
          isto só diz em que dias você costuma treinar, e serve para prever
          compras. Qual sessão vem é sempre a rotação: {g.rotacao}.
        </Procedencia>
      </Secao>

      <Secao rotulo="alvo por dia">
        <div class="ins-lista">
          {g.alvos.map(a => (
            <div key={a.k} class="ins-linha">
              <span class="ins-linha-n">
                <span class="ins-linha-t">{a.t}</span>
                <span class="ins-linha-s">{a.s}</span>
              </span>
              <span class="ins-linha-v">{a.v}</span>
            </div>
          ))}
        </div>
      </Secao>

      {g.regras.map(r => (
        <Secao key={r.k} rotulo={r.k} nota={r.warn ? 'atenção' : null}>
          <h3 class="ins-subtitle gu-t">{r.t}</h3>
          {r.p.map((x, i) => (
            <p key={i} class="ins-body-sm ins-t2 gu-p" dangerouslySetInnerHTML={{ __html: x }} />
          ))}
        </Secao>
      ))}

      <Secao rotulo="dados">
        <div class="gu-acoes">
          <button class="ins-btn-secondary" onClick={ctx.exportar}>exportar backup</button>
          <button class="ins-btn-secondary" onClick={ctx.importar}>importar backup</button>
        </div>
        <Procedencia>{g.backup}</Procedencia>
      </Secao>

      <Secao rotulo="restaurar" nota="os dois preservam o histórico">
        <div class="gu-acoes">
          <button class="ins-btn-secondary ins-btn-destructive" onClick={ctx.restauraPrograma}>
            restaurar o programa do treinador
          </button>
          <button class="ins-btn-secondary ins-btn-destructive" onClick={ctx.restauraPlano}>
            restaurar o plano nutricional
          </button>
        </div>
        <Procedencia>
          nenhum dos dois toca no que você já registrou, nem no que cadastrou:
          voltam só a prescrição.
        </Procedencia>
      </Secao>
    </>
  );
}
