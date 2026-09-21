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

import {
  Cabecalho, GradeMetricas, Procedencia, Secao, Sparkline, Stepper, Vazio, Veredito,
  Chips
} from '../instrumento/primitivos.jsx';
import { fmtDec } from '../../dominio/formato';
import { useState } from 'preact/hooks';

/** Uma medida corporal: stepper, botão e a curva das últimas 14 semanas. */
function Medida({ rotulo, nota, valor, passo, unidade, serie, celulas, medidas, aoApagar, onMuda, onRegistrar, acao, dia, onAbrirDia, onDia, children }) {
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

      {/* A data fica atrás de um link porque registrar no dia é o caso de todo
          dia; retroativo é exceção. O seletor é o nativo do aparelho: a medida
          esquecida pode ser de semanas atrás, e ele alcança qualquer data sem
          o app ter que desenhar um calendário. */}
      {dia && (dia.aberto
        ? <div class="dd-dia">
            <input
              class="ins-input dd-data" type="date" id={'ddia-' + rotulo}
              value={dia.iso} max={dia.max}
              onInput={e => onDia(e.currentTarget.value)}
            />
            <p class="ins-body-sm ins-t3 dd-dia-nota">{dia.jaTem}</p>
          </div>
        : <button class="dd-diabtn" onClick={onAbrirDia}>
            {dia.hoje ? 'outro dia' : 'registrando em ' + dia.txt + ' · trocar'}
          </button>)}

      {serie.some(x => x != null)
        ? <div class="dd-spark"><Sparkline valores={serie} /></div>
        : <Vazio>Nenhuma medida registrada ainda.</Vazio>}

      <GradeMetricas colunas={2} celulas={celulas} />
      {children}

      {/* As últimas medidas, com a porta de saída ao lado. É o único caminho
          para desfazer um 743 digitado no lugar de 74,3 — e sem ele o erro
          entra na média da semana e não sai mais. */}
      {medidas && medidas.length > 0 && (
        <div class="dd-medidas">
          {medidas.map(x => (
            <div class="crow" key={x.t}>
              <span class="crow-d ins-label">{x.data}</span>
              <span class="crow-m ins-data">{x.valor}</span>
              <button class="crow-x" onClick={() => aoApagar(x.t)}>remover</button>
            </div>
          ))}
        </div>
      )}
    </Secao>
  );
}

/**
 * As fotos de acompanhamento.
 *
 * Fica entre cintura e força de propósito: é a terceira série do mesmo assunto
 * — está funcionando? —, e a única que não vira número. Separá-la numa aba
 * própria a transformaria em álbum.
 *
 * Os dias desde a última sessão são INFORMAÇÃO, não cobrança. Passar de 14 põe
 * o número em âmbar e para por aí: não há sequência, não há medalha e não há
 * tela de parabéns em lugar nenhum deste produto.
 */
function Fotos({ f, ctx }) {
  return (
    <Secao rotulo="fotos" nota={f.nota}>
      <div class="dd-fotos">
        <GradeMetricas
          colunas={2}
          celulas={[
            { k: 'd', rotulo: 'dias desde a última', valor: f.dias, cor: f.diasCor },
            { k: 'c', rotulo: 'cadência', valor: f.cadencia }
          ]}
        />

        {f.tem && (
          <div class="dd-fotos-pontos" aria-label="poses da última sessão">
            {f.pontos.map(p => (
              <span key={p.id} class={'dd-fotos-p' + (p.feita ? ' feita' : '')} title={p.n} />
            ))}
          </div>
        )}

        <div class="dd-fotos-b">
          <button class="ins-btn-primary" onClick={ctx.abreProtocolo}>{f.cta}</button>
          {f.podeComparar && (
            <button class="ins-btn-secondary" onClick={ctx.abreComparar}>comparar</button>
          )}
        </div>
      </div>

      <Procedencia>
        de manhã, em jejum, junto com a pesagem · as marcas de fita no chão são
        o que faz duas sessões serem comparáveis
      </Procedencia>
      <Procedencia>
        as fotos ficam neste aparelho e no seu bucket privado · não entram no
        backup em JSON
      </Procedencia>
    </Secao>
  );
}

/**
 * O calendário do mês e a lista de sessões.
 *
 * A média é MÓVEL, de treinos por semana — nunca sequência de dias. Quem treina
 * 5 a 6 vezes por semana quebra sequência todo domingo, e transformar isso em
 * número faria o app cobrar o descanso que o próprio programa manda tirar.
 */
function Mes({ m, ctx }) {
  return (
    <Secao rotulo="o mês" nota={m.titulo}>
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

      {/* As linhas lidas em conjunto. Fica DEPOIS do painel de propósito: é
          leitura do que está acima, e antes dele seria veredito.

          Descreve e para. A regra 6 do produto é "não inventar conselho de
          treino", e ela continua inteira — dizer que o peito levou 12 séries e
          o peito superior 6 é relatar o que aconteceu. A frase existe para ser
          levada ao treinador, não para o app ocupar o lugar dele. */}
      {m.leitura.length > 0 && (
        <div class="dd-leitura">
          <div class="ins-label">a semana, lida junto</div>
          {m.leitura.map(l => (
            <p key={l.txt} class="ins-body-sm ins-t2 dd-leitura-l">{l.txt}</p>
          ))}
          <Procedencia>
            descrição, não recomendação — o que fazer com ela é do treinador.
          </Procedencia>
        </div>
      )}

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

// Os dois assuntos do acompanhamento. Sem eles a tela somava 3.955px — quase
// cinco telas de rolagem — não por estar mal organizada, mas por fazer oito
// coisas legítimas de uma vez.
//
// A divisão não é por frequência de uso, é por ASSUNTO: "como está meu corpo" e
// "como está meu treino" são duas perguntas, e quem entra aqui já sabe qual das
// duas está fazendo. O mesmo recurso que a COMIDA usa para caber em uma tela.
//
// CORPO é o padrão porque é onde mora o veredito — a única coisa desta tela que
// pede uma AÇÃO, e a que responde "e agora?" antes de "como está?".
const MODOS = [
  { k: 'corpo', t: 'corpo' },
  { k: 'treino', t: 'treino' },
  { k: 'comida', t: 'comida' }
];

/**
 * Uma linha de padrão: o recorte à esquerda, a contagem à direita.
 *
 * Contagem, e nunca percentual. Os dois são a mesma matemática e o oposto na
 * cabeça: um número contra 100% implícito funciona como nota, e feedback que
 * dirige a atenção para a autoavaliação piora o desempenho em cerca de um
 * terço dos casos. Nenhuma cor avaliativa, pelo mesmo motivo — vermelho de
 * "falhou" num diário alimentar é o caminho conhecido para culpa.
 */
function LinhaPadrao({ rotulo, txt }) {
  return (
    <div class="ins-linha">
      <span class="ins-linha-n"><span class="ins-linha-t">{rotulo}</span></span>
      <span class="ins-linha-v">{txt}</span>
    </div>
  );
}

export function Dados({ ctx }) {
  // Local, como na COMIDA: trocar de aba desmonta a tela e o modo volta ao
  // padrão. É o que se quer — voltar ao DADOS é voltar ao veredito.
  const [modo, setModo] = useState('corpo');
  const d = ctx.dados();
  const c = ctx.corpo();

  return (
    <>
      <Cabecalho olho="acompanhamento" titulo="Dados" />

      <Secao primeira>
        <Chips opcoes={MODOS} valor={modo} onMuda={setModo} />
      </Secao>

      {modo === 'corpo' && <>
      <Secao rotulo="o que fazer com a comida">
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
        onMuda={ctx.setPeso} onRegistrar={ctx.registraPeso} acao={c.peso.acao}
        dia={c.peso.dia} onAbrirDia={() => ctx.abreDiaCorpo('peso')}
        onDia={t => ctx.setDiaCorpo('peso', t)}
        medidas={c.peso.medidas} aoApagar={t => ctx.apagaMedida('peso', t)}
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
        onMuda={ctx.setCintura} onRegistrar={ctx.registraCintura} acao={c.cintura.acao}
        dia={c.cintura.dia} onAbrirDia={() => ctx.abreDiaCorpo('cintura')}
        onDia={t => ctx.setDiaCorpo('cintura', t)}
        medidas={c.cintura.medidas} aoApagar={t => ctx.apagaMedida('cintura', t)}
        celulas={[
          { k: 'a', rotulo: 'última medida', valor: c.cintura.atual },
          { k: 'm', rotulo: 'no mês · cm', valor: c.cintura.mesValor }
        ]}
      >
        <Procedencia>{c.cintura.mes}</Procedencia>
        <Procedencia>
          meça sempre no mesmo ponto, em jejum, sem prender a barriga. Fita
          mal posicionada erra mais do que a balança varia de água.
        </Procedencia>
      </Medida>

      <Fotos f={ctx.protocoloFotos()} ctx={ctx} />
      </>}

      {modo === 'comida' && (
        d.comida.dias === 0
          ? <Secao rotulo="o dia a dia" primeira>
              <Vazio>
                Ainda não há dia fechado. O dia entra aqui depois da virada da
                data — o de hoje ainda está aberto.
              </Vazio>
            </Secao>
          : !d.comida.pronto
          ? <Secao rotulo="o dia a dia" primeira nota={`${d.comida.dias} com registro`}>
              <Vazio>
                Faltam {d.comida.faltam} dias com registro para o padrão querer
                dizer alguma coisa. Abaixo disso é ruído, e mostrar um número
                que ainda não significa nada é pior que calar.
              </Vazio>
            </Secao>
          : <>
        <Secao rotulo="por refeição"
               nota={`${d.comida.dias} dias com registro · ${d.comida.janela} dias`}>
          <div class="ins-lista">
            {d.comida.padrao.map(p => (
              <LinhaPadrao key={p.k} rotulo={p.nome} txt={p.txt} />
            ))}
          </div>
          {d.comida.pior && (
            <Procedencia>
              {d.comida.pior.nome} é a que menos aparece: {d.comida.pior.txt}
            </Procedencia>
          )}
        </Secao>

        <Secao rotulo="dias inteiros" nota="todas as refeições">
          <div class="ins-label dd-rec">por dia da semana</div>
          <div class="ins-lista">
            {d.comida.porSemana.map(r => (
              <LinhaPadrao key={r.k} rotulo={r.rotulo} txt={r.txt} />
            ))}
          </div>

          {d.comida.porCadencia.length > 0 && <>
            <div class="ins-label dd-rec">treino e descanso</div>
            <div class="ins-lista">
              {d.comida.porCadencia.map(r => (
                <LinhaPadrao key={r.k} rotulo={r.rotulo} txt={r.txt} />
              ))}
            </div>
          </>}

          {d.comida.porTurno.length > 1 && <>
            <div class="ins-label dd-rec">por turno do treino</div>
            <div class="ins-lista">
              {d.comida.porTurno.map(r => (
                <LinhaPadrao key={r.k} rotulo={r.rotulo} txt={r.txt} />
              ))}
            </div>
          </>}
        </Secao>

        {/* As duas curvas lado a lado, suavizadas por semana — e nenhum
            coeficiente entre elas. O ganho que se quer enxergar é de 200 a
            400 g por semana; a flutuação de água de um dia para o outro passa
            de 1 kg, e duas séries com tendência correlacionam por definição.
            Pôr um número aqui seria fabricar confiança que o dado não sustenta. */}
        <Secao rotulo="ao longo das semanas" nota="14 semanas">
          <div class="ins-label dd-rec">aderência · dias cumpridos por semana</div>
          {d.comida.curvas.aderencia.some(x => x != null)
            ? <div class="dd-spark"><Sparkline valores={d.comida.curvas.aderencia} /></div>
            : <Vazio>Sem semanas fechadas o bastante.</Vazio>}

          <div class="ins-label dd-rec">peso · média semanal</div>
          {d.comida.curvas.peso.some(x => x != null)
            ? <div class="dd-spark"><Sparkline valores={d.comida.curvas.peso} /></div>
            : <Vazio>Registre o peso 3 a 4 vezes por semana.</Vazio>}

          <Procedencia>
            as duas curvas ficam lado a lado para você olhar. O app não calcula
            correlação entre elas: o sinal que se procura é menor que o ruído de
            uma pesagem, e duas séries com tendência sobem juntas mesmo sem
            relação nenhuma.
          </Procedencia>
        </Secao>

        {/* A única devolutiva que não julga o usuário: ela aponta um limite do
            PRÓPRIO app. O sinal que move o ajuste sai das cargas; se ele mudou
            em semanas de aderência baixa, pode estar lendo adesão ruim como
            resposta metabólica. */}
        {d.comida.auditoria && (
          <Secao rotulo="a régua calórica">
            <div class="dd-auditoria ins-body-sm ins-t2">{d.comida.auditoria.txt}</div>
            <Procedencia>
              isto é o app conferindo a própria regra, não a sua semana.
            </Procedencia>
          </Secao>
        )}
      </>)}

      {modo === 'treino' && <>
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
        {c.cardio.sessoes.length > 0 && (
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
        )}

        <Procedencia>{c.cardio.regra}</Procedencia>
      </Secao>

      <Musculos m={c.musculos} ctx={ctx} />

      <Mes m={ctx.mes()} ctx={ctx} />

      {/* Veio do GUIA. Lá era um botão órfão numa tela de referência; aqui fica
          junto do resto do que é olhar para trás — força estimada, séries por
          músculo e o mês —, que é onde se vem quando a pergunta é "e desde que
          isso começou?". */}
      <Secao rotulo="retrospectiva" nota="o bloco de 48 sessões">
        <p class="ins-body-sm ins-t3 dd-retro-p">
          O que evoluiu, o que ficou parado e onde a dor apareceu desde o começo
          deste bloco.
        </p>
        <button class="ins-btn-secondary" onClick={ctx.abreRetro}>abrir retrospectiva</button>
      </Secao>
      </>}
    </>
  );
}
