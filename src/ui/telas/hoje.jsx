// HOJE — a tela da fusão.
//
// É o argumento inteiro do merge numa tela só: o pré-treino das 5h45 e a
// sessão das 6h15 são a MESMA sequência, e ver as duas coisas em eixos
// separados era o que fazia parecerem dois apps. Aqui há uma timeline, ordenada
// por relógio, com refeição e treino na mesma espinha.
//
// A ordem das perguntas é lei 1 do sistema: "e agora?" antes de "como está o
// dia?" antes de "o que falta?". Por isso o cartão-foco vem primeiro, o bloco
// de energia depois e a lista por último.

import {
  CartaoFoco, GradeMetricas, HeroMetrica, Procedencia, Secao, Ticks, useAgora
} from '../instrumento/primitivos.jsx';
import { LinhaTimeline } from '../instrumento/timeline.jsx';
import { fmtInt } from '../../dominio/formato';
import {
  minutosDe, refeicoesDeHoje, resumoDaRefeicao, totalDaRefeicao, totalDoDia, totalRegistrado
} from '../../dominio/nutricao/calculo';

const COPO = 250;
const COPOS = 14;

/** "faltam 1h20" / "há 12 min" — a contagem do cartão-foco. */
function contagem(alvoMin, agoraMs) {
  const d = new Date(agoraMs);
  const agoraMin = d.getHours() * 60 + d.getMinutes();
  const dif = alvoMin - agoraMin;
  const abs = Math.abs(dif);
  const h = Math.floor(abs / 60), m = abs % 60;
  const txt = h ? `${h}h${String(m).padStart(2, '0')}` : `${m}min`;
  return { txt, atrasado: dif < 0, rotulo: dif < 0 ? 'atrás' : 'faltam' };
}

export function Hoje({ ctx }) {
  const agora = useAgora();
  const {
    dia, plano, catalogo, diaHoje, comidaDoDia, alta, alvo, sessao, cadenciaTxt
  } = ctx.hoje();

  const refs = refeicoesDeHoje(plano, diaHoje.cadencia === 'treino', alta);
  const registrado = totalRegistrado(plano, catalogo, comidaDoDia, diaHoje.cadencia === 'treino', alta);

  const agoraMin = new Date(agora).getHours() * 60 + new Date(agora).getMinutes();

  // O próximo é a primeira coisa não feita — comida ou treino, tanto faz.
  // Se tudo foi feito, o foco passa a ser a última, para a tela não ficar muda.
  const proxima = refs.find(r => !comidaDoDia.done[r.id] && minutosDe(r.t) >= agoraMin - 90)
    || refs.find(r => !comidaDoDia.done[r.id])
    || refs[refs.length - 1];

  const c = proxima ? contagem(minutosDe(proxima.t), agora) : null;
  const ehTreino = proxima && ctx.ehLinhaDeTreino(proxima);

  const pctKcal = alvo.kcal ? (registrado.kcal / alvo.kcal) * 100 : 0;
  const hhmm = new Date(agora).toTimeString().slice(0, 5);

  return (
    <>
      {proxima && (
        <CartaoFoco
          agora={hhmm}
          rotulo={proxima.t}
          nome={ehTreino ? (sessao.nome || 'Treino ' + diaHoje.treino) : proxima.n}
          contagem={c.txt}
          contagemRotulo={c.rotulo}
          resumo={ehTreino ? sessao.resumo : resumoDaRefeicao(proxima, catalogo, alta, comidaDoDia.escala[proxima.id] ?? 1)}
          cta={ehTreino ? 'abrir o treino →' : 'abrir e marcar →'}
          onClick={() => ehTreino ? ctx.vaiPara('treino') : ctx.abreRefeicao(proxima.id)}
        />
      )}

      <Secao rotulo="energia" nota={diaHoje.previsto ? 'previsão · confirme no topo' : null}>
        <HeroMetrica
          rotulo="registrado"
          meta={`alvo ${fmtInt(alvo.kcal)} kcal`}
          valor={fmtInt(registrado.kcal)}
          unidade="kcal"
          progresso={pctKcal}
        >
          <GradeMetricas
            colunas={3}
            celulas={[
              { k: 'p', rotulo: 'proteína', valor: `${Math.round(registrado.p)}`, nota: `de ${Math.round(alvo.p)} g` },
              { k: 'c', rotulo: 'carboidrato', valor: `${Math.round(registrado.c)}`, nota: `de ${Math.round(alvo.c)} g` },
              { k: 'g', rotulo: 'gordura', valor: `${Math.round(registrado.g)}`, nota: `de ${Math.round(alvo.g)} g` }
            ]}
          />
        </HeroMetrica>
        <Procedencia>{cadenciaTxt}</Procedencia>
      </Secao>

      <Secao rotulo="o dia" nota="toque em ··· para editar">
        <div>
          {refs.map((r, i) => {
            const treino = ctx.ehLinhaDeTreino(r);
            const feito = treino ? sessao.feita : !!comidaDoDia.done[r.id];
            const t = totalDaRefeicao(r, catalogo, alta, comidaDoDia.escala[r.id] ?? 1);
            return (
              <LinhaTimeline
                key={r.id}
                hora={r.t}
                nome={treino ? (sessao.nome || 'Treino ' + diaHoje.treino) : r.n}
                valor={treino ? sessao.valor : fmtInt(t.kcal) + ' kcal'}
                resumo={treino ? sessao.resumo : resumoDaRefeicao(r, catalogo, alta, comidaDoDia.escala[r.id] ?? 1)}
                meta={treino ? sessao.meta
                  : `P ${Math.round(t.p)} · C ${Math.round(t.c)} · G ${Math.round(t.g)}`}
                feito={feito}
                agora={proxima && r.id === proxima.id}
                cor={proxima && r.id === proxima.id ? 'acid' : null}
                aoMarcar={treino ? null : () => ctx.marcaRefeicao(r.id)}
                aoAbrir={() => treino ? ctx.vaiPara('treino') : ctx.abreRefeicao(r.id)}
                aoEditar={treino ? null : () => ctx.editaRefeicao(r.id)}
                ultima={i === refs.length - 1}
              />
            );
          })}
        </div>
        <button class="ins-btn-add" onClick={ctx.novaRefeicao}>+ adicionar refeição</button>
      </Secao>

      <Secao rotulo="água">
        <Ticks
          n={comidaDoDia.agua}
          total={COPOS}
          onMuda={ctx.setAgua}
          unidade={`${COPO} ml por toque`}
          alvo={`${(COPOS * COPO / 1000).toFixed(1).replace('.', ',')} l`}
        />
      </Secao>
    </>
  );
}
