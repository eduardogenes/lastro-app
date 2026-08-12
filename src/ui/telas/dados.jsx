// DADOS — o motor de regra, e o lugar onde o TREINO alimenta a COMIDA.
//
// É a tela que mais muda de significado com a fusão. Antes, `performance` era
// um interruptor que ele ligava na mão dizendo "estou ficando mais forte", e a
// regra calórica lia esse interruptor. Perguntar isso sempre foi estranho num
// app que tem todas as cargas registradas. Agora ele calcula, mostra a conta, e
// o interruptor vira override — porque o cálculo pode estar cego (volta de
// pausa, troca de exercício, deload) e nessas horas quem sabe é ele.
//
// Sobra em string só o calendário do mês. Ele é grade de fios por natureza e
// sobreviveu bem à repintura; converter a estrutura dele é a última pendência.

import { Bruto } from '../bruto.jsx';
import {
  Cabecalho, GradeMetricas, Procedencia, Secao, Sparkline, Stepper, Vazio, Veredito
} from '../instrumento/primitivos.jsx';
import { fmtDec } from '../../dominio/formato';

/** Uma medida corporal: stepper, botão e a curva das últimas 14 semanas. */
function Medida({ rotulo, nota, valor, passo, unidade, serie, celulas, onMuda, onRegistrar, acao, children }) {
  return (
    <Secao rotulo={rotulo} nota={nota}>
      <div class="dd-registro">
        <Stepper
          valor={valor} passo={passo} min={20} max={250}
          fmt={v => fmtDec(v) + ' ' + unidade}
          onMuda={onMuda}
        />
        <button class="ins-btn-secondary" onClick={onRegistrar}>{acao}</button>
      </div>

      {serie.some(x => x != null)
        ? <div class="dd-spark"><Sparkline valores={serie} /></div>
        : <Vazio>Nenhuma medida registrada ainda.</Vazio>}

      <GradeMetricas colunas={2} celulas={celulas} />
      {children}
    </Secao>
  );
}

/** Séries por músculo: barra por músculo, na hierarquia do programa. */
function Musculos({ m, ctx }) {
  return (
    <Secao rotulo="séries por músculo" nota={`dia ${m.dia} de 7 · na semana`}>
      {m.fora.length > 0 && (
        <div class="dd-fora">
          <div class="ins-label ins-amber">fora do alvo do treinador</div>
          {m.fora.map(x => (
            <div key={x.txt} class="ins-body-sm ins-t2 dd-fora-l">{x.txt}</div>
          ))}
          <button class="ins-btn-secondary" onClick={ctx.abrePrograma}>abrir o programa</button>
        </div>
      )}

      <div class="dd-mus">
        {m.linhas.map(l => (
          <div key={l.g} class={'dd-mus-l' + (l.prio ? ' prio' : '')}>
            <span class="dd-mus-n">
              {l.g}
              {l.rot && <em>{l.rot}</em>}
            </span>
            <span class="dd-mus-b"><i style={`width:${l.pct}%`} /></span>
            <span class="dd-mus-v">
              {l.n}
              {l.media && <small>méd {l.media}</small>}
            </span>
            {l.dif !== null && (
              <span class={'dd-mus-d ' + l.difCor}>{l.dif > 0 ? '+' : ''}{l.dif}%</span>
            )}
          </div>
        ))}
      </div>

      {m.avulsosTxt && <Procedencia>{m.avulsosTxt}</Procedencia>}

      {!m.temHistorico && (
        <Procedencia>
          a coluna de média aparece a partir da segunda semana de registro.
        </Procedencia>
      )}
      <Procedencia>
        série DIRETA · comparado com o mesmo ponto das {m.janela} semanas
        anteriores
      </Procedencia>
      <p class="ins-body-xs ins-t5 dd-nota">
        Tríceps também trabalha nos supinos, bíceps nas puxadas e glúteo no
        terra. O estímulo real desses é maior que o número aqui.
      </p>
    </Secao>
  );
}

export function Dados({ ctx }) {
  const d = ctx.dados();
  const c = ctx.corpo();

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

      <Medida
        rotulo="peso" nota={c.peso.nota}
        valor={c.peso.valor} passo={0.1} unidade="kg" serie={c.peso.serie}
        onMuda={ctx.setPeso} onRegistrar={ctx.registraPeso} acao="registrar hoje"
        celulas={[
          { k: 'm', rotulo: 'média da semana', valor: c.peso.media },
          { k: 'r', rotulo: 'ritmo por semana', valor: c.peso.ritmo, cor: c.peso.ritmoCor }
        ]}
      >
        <Procedencia>
          a média da semana é o número que conta · {c.peso.alvo}
        </Procedencia>
      </Medida>

      <Medida
        rotulo="cintura" nota="1× por semana, em jejum"
        valor={c.cintura.valor} passo={0.5} unidade="cm" serie={c.cintura.serie}
        onMuda={ctx.setCintura} onRegistrar={ctx.registraCintura} acao="registrar"
        celulas={[
          { k: 'a', rotulo: 'última medida', valor: c.cintura.atual },
          { k: 'm', rotulo: 'no mês', valor: c.cintura.mes.split(' ')[0] }
        ]}
      >
        <Procedencia>{c.cintura.mes}</Procedencia>
        <Procedencia>
          meça sempre no mesmo ponto, em jejum, sem prender a barriga. Fita
          mal posicionada erra mais do que a balança varia de água.
        </Procedencia>
      </Medida>

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

      <Secao rotulo="cardio" nota={`${c.cardio.semana} de ${c.cardio.alvo} nesta semana`}>
        <button class="ins-btn-add" onClick={ctx.abreCardio}>+ registrar cardio</button>
        {c.cardio.perna && c.cardio.perna.length > 0 && (
          <Procedencia>
            você salvou o treino {c.cardio.perna.join(' e ')} hoje. A regra é não
            pôr cardio no mesmo período de treino de perna — se ainda der, deixe
            para outro dia.
          </Procedencia>
        )}
        <Procedencia>{c.cardio.regra}</Procedencia>
      </Secao>

      <Musculos m={c.musculos} ctx={ctx} />

      {/* O calendário do mês, ainda em string. */}
      <Bruto class="dd-legado" html={d.htmlLegado} />
    </>
  );
}
