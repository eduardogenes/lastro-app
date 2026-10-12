// DIAS — o que aconteceu em cada dia, e o que falta dizer.
//
// O terceiro dos cinco lugares, e o único que não tinha desenho nenhum: a
// frente 1 abriu os nove HTML das direções e nenhum deles é a tela de Dias
// (achado 6). O que ela tem, em compensação, é a maior quantidade de capacidade
// JÁ PRONTA do app de hoje — o calendário, a lista de sessões, o detalhe de uma
// sessão, o registro retroativo, marcar um dia passado como descanso.
//
// Por isso este arquivo nasce por MUDANÇA DE ENDEREÇO e não por desenho novo: o
// calendário vinha dentro do modo "treino" da tela de Dados, atrás de um chip,
// junto da força estimada e das séries por músculo — que são leitura de SEMANA,
// não de dia. Separar os dois é a razão de o lugar existir.
//
// O que ele NÃO tem, e está declarado:
//
// - **nada prescrito.** O que o plano diz daquele dia aparece como referência; o
//   plano é de Prescrição.
// - **nenhuma média.** Dias é por dia, por definição. A média móvel de treinos
//   por semana que o calendário mostra é a exceção que o próprio calendário
//   carrega, e ela está aqui porque é a leitura do MÊS desenhado — não um
//   indicador de semana.
// - **o cartão de agora.** Um dia que passou não tem "agora".

import { Cabecalho, GradeMetricas, Secao } from '../instrumento/primitivos.jsx';

/**
 * O calendário do mês e a lista de sessões.
 *
 * A média é MÓVEL, de treinos por semana — nunca sequência de dias. Quem treina
 * 5 a 6 vezes por semana quebra sequência todo domingo, e transformar isso em
 * número faria o app cobrar o descanso que o próprio programa manda tirar.
 */
export function Mes({ m, ctx }) {
  return (
    <Secao rotulo="o mês" nota={m.titulo} primeira>
      <div class="mes-nav">
        <button class="mes-b" aria-label="mês anterior" onClick={() => ctx.mudaMes(-1)}>‹</button>
        <span class="ins-subtitle">{m.titulo}</span>
        <button class="mes-b" aria-label="próximo mês" disabled={!m.podeAvancar}
                onClick={() => ctx.mudaMes(1)}>›</button>
      </div>

      <GradeMetricas colunas={3} celulas={m.stats} />

      <div class="cal">
        {m.dias.map(d => <span key={d} class="cal-h">{d}</span>)}
        {Array.from({ length: m.offset }).map((_, i) => <span key={'x' + i} class="cal-x" />)}
        {m.celulas.map(c => (
          <button
            key={c.n}
            class={'cal-d' + (c.feito ? ' feito' : '') + (c.livre ? ' livre' : '') +
                   (c.hoje ? ' hoje' : '') + (c.futuro ? ' futuro' : '') +
                   (c.descanso ? ' descanso' : '') +
                   (c.cardio ? ' com-cardio' : '')}
            disabled={!c.abre}
            onClick={() => ctx.abreSessaoDoDia(c.abre)}
          >
            <em>{c.n}</em>
            {c.marca && <i>{c.marca}</i>}
            {c.periodo && <u class={'per ' + c.periodo.k}>{c.periodo.rot}</u>}
            {c.cardio && <span class="barra-cardio" />}
          </button>
        ))}
      </div>

      <div class="cal-legenda callegenda">
        {m.periodos.map(p => (
          <span key={p.k}><u class={'per ' + p.k}>{p.rot}</u>{p.nome}</span>
        ))}
      </div>

      {m.media && (
        <p class="mediasem">
          <b>{m.media}</b> treinos por semana
          <span>média móvel das últimas 4 semanas, não sequência de dias</span>
        </p>
      )}
      {m.cardio && (
        <p class="mediasem">
          <b>{m.cardio.n}</b> {m.cardio.n === 1 ? 'sessão de cardio' : 'sessões de cardio'}
          <span>
            {m.cardio.min} minutos no mês
            {m.cardio.soCardio > 0 &&
              ` · ${m.cardio.soCardio} em ${m.cardio.soCardio === 1 ? 'dia sem musculação' : 'dias sem musculação'}`}
          </span>
        </p>
      )}
      {m.horarios && (
        <p class="mediasem">
          <b>{m.horarios.media}</b> em média
          <span>horário de início · mais cedo {m.horarios.min} · mais tarde {m.horarios.max}</span>
        </p>
      )}

      {m.sessoes.length > 0 && (
        <div class="ins-lista mes-sessoes">
          {m.sessoes.map(x => (
            <button key={x.t} class={'ins-linha sessrow' + (x.destacada ? ' destacada' : '')}
                    onClick={() => ctx.abreSessaoDoDia({ k: 'sessao', t: x.t })}>
              <span class="sess-d">{x.data}{x.hora && <em>{x.hora}</em>}</span>
              <span class={'sess-l' + (x.livre ? ' livre' : '')}>{x.marca}</span>
              <span class="sess-n">
                {x.desc}
                {x.aprox && <em class="aprox">aprox</em>}
                {x.cardio && <span class="tag card-t">cardio</span>}
              </span>
              {x.aberta && <span class="sess-o">em andamento</span>}
            </button>
          ))}
        </div>
      )}
    </Secao>
  );
}

export function Dias({ ctx }) {
  const c = ctx.corpo();
  const cromo = ctx.cromoDoTreino();
  return (
    <>
      <Cabecalho olho="o que aconteceu" titulo="Dias" />

      {/* A FAIXA DA SEMANA. Veio da tela do treino, onde o próprio comentário
          dela já dizia o que ela é: "contexto de ADESÃO, não da sessão". Era a
          aba que a mantinha lá, e o modo esconde placares de propósito (§4.2).
          Aqui ela é a resposta curta da pergunta do lugar — o que aconteceu em
          cada dia —, com o atalho para abrir a sessão de um dia. */}
      <Secao rotulo="a semana" nota="toque num dia para abrir" primeira>
      <div class="semana">
        {cromo.semana.map(d => (
          <button
            key={d.d}
            class={'wd' + (d.hoje ? ' hoje' : '') + (d.feito ? ' feito' : '') +
                   (d.livre ? ' livre' : '') + (d.futuro ? ' futuro' : '') +
                   (d.descanso ? ' descanso' : '')}
            disabled={!d.abre}
            onClick={() => ctx.abreSessaoDoDia(d.abre)}
          >
            <span class="wd-d">{d.d}</span>
            <span class="wd-v">{d.v}</span>
            {d.cardio && <span class="barra-cardio" />}
          </button>
        ))}
      </div>
      </Secao>

      <Mes m={ctx.mes()} ctx={ctx} />

      {/* As sessões de cardio JÁ FEITAS. O dono do cardio é o Agora, que é onde
          se registra (§1.7); aqui ele é VISTA — o que aconteceu em cada dia —, e
          por isso esta lista mostra e apaga, mas não cria. Apagar é a porta de
          saída de um registro errado, e sem ela o engano entra na conta da
          semana e não sai. */}
      {c.cardio.sessoes.length > 0 && (
        <Secao rotulo="cardio" nota="o que foi feito">
          <div class="dd-medidas">
            {c.cardio.sessoes.map(x => (
              <div class="crow" key={x.t}>
                <span class="crow-d ins-label">{x.data}</span>
                <span class="crow-m">{x.modal}</span>
                <span class="crow-n ins-data">{x.resumo}</span>
                <button class="crow-x" onClick={() => ctx.apagaCardio(x.t)}>remover</button>
              </div>
            ))}
          </div>
        </Secao>
      )}
    </>
  );
}
