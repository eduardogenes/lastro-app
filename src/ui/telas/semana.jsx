// SEMANA — a semana andou para onde, e dá para mexer na comida?
//
// O quarto dos cinco lugares. Vinha repartido em dois chips da tela de Dados
// ("treino" e "comida"), e o que a mudança de endereço acrescenta é o VEREDITO,
// que morava no chip "corpo" e não era de lá: Corpo responde "como está o corpo
// e o que eu registro hoje"; "dá para mexer na comida?" é pergunta da semana
// (§1.3 e §1.4 da frente 1).
//
// O veredito fica ACIMA dos chips de propósito. É a única coisa desta tela que
// pede uma AÇÃO — o passo de ±150 kcal —, e a lei 1 do sistema é "e agora?"
// antes de "como está?". Atrás de um chip ele dependeria de alguém escolher a
// aba certa para descobrir que há uma decisão esperando.
//
// Os dois chips ficam, e a razão é a mesma que os criou: sem a divisão a tela
// somava quase cinco telas de rolagem, não por estar mal organizada, mas por
// fazer oito coisas legítimas de uma vez. A divisão é por ASSUNTO — o que o
// treino respondeu, o que a comida fez.
//
// Duas exceções honestas: Semana ESCREVE duas coisas, e as duas são decisão e
// não medida — aplicar o passo (`S.ajuste`, com a linha em `S.ajusteHist`) e
// virar o sinal manual de força (`S.perfManual`). Chamar Semana de "só leitura"
// seria mentir sobre essas duas.

import {
  Cabecalho, Chips, GradeMetricas, Procedencia, Secao, Sparkline, Vazio, Veredito
} from '../instrumento/primitivos.jsx';
import { useState } from 'preact/hooks';

const MODOS = [
  { k: 'treino', t: 'treino' },
  { k: 'comida', t: 'comida' }
];

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
          {/* A ressalva é do treinador, e é o que impede a frase de virar
              cobrança: prioridade também se expressa em seleção de exercício,
              posição no treino, frequência e qualidade da série. */}
          <Procedencia>
            desvio para olhar, não erro — prioridade não se mede só em séries:
            também em seleção de exercício, posição no treino, frequência e
            qualidade. O que fazer com isto é do treinador.
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
      {/* Nível 3: esta ressalva não repete nada da tela — ela diz que o número
          acima subestima o estímulo. Prosa que precisa ser lida não vai no
          nível 5. */}
      <p class="ins-body-xs ins-t3 dd-nota">
        Tríceps também trabalha nos supinos, bíceps nas puxadas e glúteo no
        terra. O estímulo real desses é maior que o número aqui.
      </p>
    </Secao>
  );
}

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

export function Semana({ ctx }) {
  // Local, como na COMIDA: trocar de lugar desmonta a tela e o chip volta ao
  // padrão. É o que se quer — voltar a SEMANA é voltar ao veredito.
  const [modo, setModo] = useState('treino');
  const d = ctx.dados();
  const c = ctx.corpo();
  const ciclo = ctx.cicloDoBloco();

  return (
    <>
      <Cabecalho olho="acompanhamento" titulo="Semana" />

      <Secao rotulo="o que fazer com a comida">
        <Veredito
          rotulo="a regra do plano"
          veredito={d.veredito.t}
          cor={d.veredito.cor}
          explicacao={d.veredito.p}
          acao={d.veredito.podeAplicar && <>
            <button class="ins-btn-primary" onClick={ctx.aplicaAjuste}>
              {d.veredito.acaoTxt}
            </button>
            {d.veredito.naoVolta && (
              <p class="ins-body-xs ins-t3 dd-naovolta">{d.veredito.naoVolta}</p>
            )}
          </>}
          estado={d.veredito.estado}
        />
      </Secao>

      <Secao>
        <Chips opcoes={MODOS} valor={modo} onMuda={setModo} />
      </Secao>

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

      {/* O PLACAR do cardio, e só ele. O registro é do Agora e a lista do que
          foi feito é de Dias (§1.7: o cardio é do Agora, e Semana é o placar).
          Aqui a pergunta é "a semana andou para onde", e a resposta é um número
          contra o que o treinador pede. */}
      {/* Só o PLACAR. A regra de quando fazer é guia do registro e mora no Agora,
          junto do botão; aqui a pergunta é "a semana andou para onde". */}
      <Secao rotulo="cardio" nota={`${c.cardio.semana} de ${c.cardio.alvo} nesta semana`}>
        <Procedencia>o alvo do treinador é {c.cardio.alvo} por semana</Procedencia>
      </Secao>

      <Musculos m={c.musculos} ctx={ctx} />

      {/* Veio do GUIA. Lá era um botão órfão numa tela de referência; aqui fica
          junto do resto do que é olhar para trás — força estimada, séries por
          músculo e o mês —, que é onde se vem quando a pergunta é "e desde que
          isso começou?". */}
      <Secao rotulo="retrospectiva" nota="o bloco de 48 sessões">
        {/* O CICLO veio do cabeçalho do TREINO (achado 7): ele responde "em que
            ponto do bloco eu estou", que é a mesma pergunta que a retrospectiva
            responde em prosa — e por isso os dois ficam juntos.
            Lá ele era a terceira célula de um cabeçalho que se lê de pé, no meio
            de uma série, e nenhum dos nove HTML das direções o desenhou. */}
        <GradeMetricas
          colunas={2}
          celulas={[
            { k: 'c', rotulo: 'ciclo', valor: ciclo.ciclo,
              nota: ciclo.sessoes === 1 ? '1 sessão' : ciclo.sessoes + ' sessões' },
            { k: 'r', rotulo: 'a rotação tem', valor: String(ciclo.treinos),
              nota: 'treinos por volta' }
          ]}
        />
        <p class="ins-body-sm ins-t3 dd-retro-p">
          O que evoluiu, o que ficou parado e onde a dor apareceu desde o começo
          deste bloco.
        </p>
        <button class="ins-btn-secondary" onClick={ctx.abreRetro}>abrir retrospectiva</button>
      </Secao>
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
    </>
  );
}
