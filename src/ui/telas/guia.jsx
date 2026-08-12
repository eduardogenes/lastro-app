// GUIA — a camada de referência das duas metades, e os dois restaurares.
//
// A parte nova é a cadência da semana. Ela é o que sobrou do `mapa[7]` da
// nutrição depois que a fusão separou duas perguntas que estavam grudadas
// numa só: QUAL treino vem é sempre a rotação, que avança quando ele registra
// uma sessão; HOJE É DIA DE TREINAR é o que esta tela responde. Sem essa
// separação, o mapa e a rotação discordariam toda semana que ele pulasse um dia.

import { Bruto } from '../bruto.jsx';
import { Cabecalho, Procedencia, Secao } from '../instrumento/primitivos.jsx';

// Segunda primeiro, como se lê uma semana. O índice da cadência é getDay(),
// que começa no domingo — a conversão fica aqui e não no domínio.
const SEMANA = [
  { rot: 'seg', i: 1 }, { rot: 'ter', i: 2 }, { rot: 'qua', i: 3 },
  { rot: 'qui', i: 4 }, { rot: 'sex', i: 5 }, { rot: 'sáb', i: 6 },
  { rot: 'dom', i: 0 }
];

export function Guia({ ctx }) {
  const g = ctx.guia();

  return (
    <>
      <Cabecalho olho="referência" titulo="Guia" />

      <Secao primeira rotulo="a semana" nota="toque para alternar">
        <div class="gu-semana">
          {SEMANA.map(d => {
            const treina = g.cadencia[d.i] === 'treino';
            return (
              <button
                key={d.i}
                class={'gu-dia' + (treina ? ' on' : '')}
                onClick={() => ctx.alternaCadencia(d.i)}
              >
                <span class="ins-label-sm">{d.rot}</span>
                <span class="gu-dia-v">{treina ? 'treino' : 'folga'}</span>
              </button>
            );
          })}
        </div>
        <Procedencia>
          isto diz só em que dias você costuma treinar, e serve para prever as
          compras. Qual sessão vem é sempre a rotação: {g.rotacao}.
        </Procedencia>
      </Secao>

      <Secao rotulo="alvo por tipo de dia" nota="calculado do plano">
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
        <Procedencia>
          somado dos alimentos do plano, não escrito à parte: mudar uma
          quantidade recalcula isto na hora.
        </Procedencia>
      </Secao>

      <Secao rotulo="restaurar" nota="os dois preservam o histórico">
        <div class="gu-acoes">
          <button class="ins-btn-secondary ins-btn-destructive" onClick={ctx.restauraPrograma}>
            restaurar o programa do treinador
          </button>
          <button class="ins-btn-secondary ins-btn-destructive" onClick={ctx.restauraPlano}>
            restaurar o plano do nutricionista
          </button>
        </div>
        <Procedencia>
          nenhum dos dois toca no que você registrou nem no que cadastrou:
          voltam só a prescrição.
        </Procedencia>
      </Secao>

      {/* Regras de execução e a área de dados, ainda em string. */}
      <Bruto class="gu-legado" html={g.htmlLegado} />
    </>
  );
}
