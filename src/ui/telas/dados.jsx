// DADOS — o motor de regra, e o lugar onde o TREINO alimenta a COMIDA.
//
// É a tela que mais muda de significado com a fusão. Antes, `performance` era
// um interruptor que ele ligava na mão dizendo "estou ficando mais forte", e a
// regra calórica lia esse interruptor. Perguntar isso sempre foi estranho: o
// app tem todas as cargas registradas. Agora ele calcula, mostra a conta, e o
// interruptor vira override — porque o cálculo pode estar cego (volta de pausa,
// troca de exercício, semana de deload) e nessas horas quem sabe é ele.
//
// O resto da tela — peso, cintura, cardio, músculos, calendário — ainda vem em
// string do casco. É dívida declarada, e é a próxima a cair.

import { Bruto } from '../bruto.jsx';
import {
  Cabecalho, GradeMetricas, Procedencia, Secao, Sparkline, Vazio, Veredito
} from '../instrumento/primitivos.jsx';

export function Dados({ ctx }) {
  const d = ctx.dados();

  return (
    <>
      <Cabecalho olho="acompanhamento" titulo="Dados" />

      <Secao primeira rotulo="o que fazer com a comida">
        <Veredito
          rotulo="a regra do plano"
          veredito={d.veredito.t}
          cor={d.veredito.cor}
          explicacao={d.veredito.p}
          acao={d.veredito.podeAplicar && (
            <button class="ins-btn-primary" onClick={ctx.aplicaAjuste}>
              {d.veredito.acaoTxt}
            </button>
          )}
          estado={d.veredito.estado}
        />
      </Secao>

      <Secao rotulo="força estimada" nota="e1rm · fórmula de epley">
        {d.forca.serie.some(x => x != null)
          ? <div class="dd-spark"><Sparkline valores={d.forca.serie} /></div>
          : <Vazio>Ainda não há carga registrada suficiente para estimar.</Vazio>}

        <GradeMetricas
          colunas={2}
          celulas={[
            { k: 'a', rotulo: 'soma das 2 semanas', valor: d.forca.agora },
            { k: 'd', rotulo: 'variação', valor: d.forca.delta, cor: d.forca.cor }
          ]}
        />
        <Procedencia>{d.forca.txt}</Procedencia>

        <div class="dd-override">
          <p class="ins-body-sm ins-t3">
            O app decide isso das cargas que você registrou. Assuma na mão só
            quando ele estiver cego — volta de pausa, troca de exercício,
            semana de deload.
          </p>
          <div class="ins-chips">
            {d.forca.opcoes.map(o => (
              <button
                key={o.k}
                class={'ins-chip' + (o.on ? ' on' : '')}
                onClick={() => ctx.setPerfManual(o.v)}
              >{o.t}</button>
            ))}
          </div>
        </div>
      </Secao>

      {/* Peso, cintura, cardio, músculos e o calendário do mês. Ainda em
          string: markup com teste em cima que só falta repintar. */}
      <Bruto class="dd-legado" html={d.htmlLegado} />
    </>
  );
}
