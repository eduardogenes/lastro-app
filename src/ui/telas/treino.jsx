// TREINO — a sessão e o programa.
//
// É a tela usada DENTRO da academia: de pé, com uma mão, suado, às 6h15. Tudo
// aqui é dimensionado por isso — alvo grande, nada que exija precisão, e o
// número que importa (séries feitas de prescritas) sempre visível no topo sem
// precisar rolar.
//
// O cartão de exercício continua com os nomes de classe de antes. É repintura,
// não reescrita: aqueles nomes são o contrato que os testes de fluxo têm com o
// DOM há meses, e renomear compraria churn sem comprar nada.

import { Cabecalho, GradeMetricas, Secao, Vazio, useAgora } from '../instrumento/primitivos.jsx';
import { Exercicio } from '../exercicio.jsx';
import { AddEx, Aulas, RegistroRapido } from '../instrumento/edicao.jsx';
import { EdicaoDoDia } from './edicaodia.jsx';

export function Treino({ ctx }) {
  const t = ctx.treino();
  const c = ctx.cromoDoTreino();

  return (
    <>
      <Cabecalho
        olho={t.olho}
        titulo={t.nome}
        acao={
          <button class="ins-estado" onClick={ctx.abreSeletorDeDia}>
            <span class="ins-label-sm">treino</span>
            <span class="ins-estado-v">{t.dia}</span>
          </button>
        }
      />

      <Secao primeira>
        <GradeMetricas
          colunas={2}
          celulas={[
            // id=daymeta: atualizaEstado() escreve aqui a cada tecla, sem
            // re-render — o porquê está em main.jsx.
            // Num dia aberto não há meta a cumprir: `0/16` era uma conta contra
            // um número que o box nunca ia respeitar. O que se conta é o que
            // entrou — e antes da aula é um traço, não um zero.
            t.aberto
              ? { k: 's', id: 'daymeta', rotulo: 'movimentos',
                  valor: t.movimentos ? String(t.movimentos) : '–',
                  cor: t.feitas > 0 ? 'ins-acid' : '' }
              : { k: 's', id: 'daymeta', rotulo: 'séries', valor: `${t.feitas}/${t.prescritas}`,
                  cor: t.feitas >= t.prescritas && t.prescritas > 0 ? 'ins-acid' : '' },
            // O VOLUME fica: durante a sessão ele é devolutiva ao vivo do que
            // entrou, e não resumo do dia. A cópia que Dias guarda no detalhe
            // da sessão é o REGISTRO, que é outra coisa.
            //
            // O CICLO saiu (achado 7 da frente 1): ele responde "em que ponto
            // do bloco eu estou", que é a mesma pergunta da retrospectiva — e a
            // retrospectiva é de Semana. Aqui ele era a terceira célula de um
            // cabeçalho que se lê de pé, no meio de uma série, e nenhum dos nove
            // HTML das direções o desenhou em lugar nenhum.
            { k: 'v', rotulo: 'volume', valor: t.volume }
          ]}
        />

      </Secao>

      {/* O relógio anda por fora do Preact de propósito: tickRelogio() escreve
          em #relogio de segundo em segundo sem re-render, porque redesenhar a
          tela inteira a cada segundo roubaria o foco do campo que ele está
          preenchendo no meio da série.

          E ele é FILHO DIRETO do <main>, não da seção acima: sticky se prende
          ao bloco que o contém, e lá dentro ele descolaria assim que a seção
          saísse — que é uns dois exercícios de rolagem. A seção seguinte vem
          com `continua` para o corte não desenhar fio nenhum. */}
      {c.sessao
        ? <div class={'day-rel' + (c.sessao.pausada ? ' pausado' : '')}>
            {!c.sessao.pausada && <span class="ins-live-dot" />}
            <span id="relogio" class="ins-metric-m">{c.sessao.relogio}</span>
            <em class="ins-label-sm">{c.sessao.desde}</em>
          </div>
        : <button class="day-ini" onClick={ctx.iniciarSessao}>Iniciar treino</button>}

      <Secao continua>
        {t.sessaoAberta && (
          <div class="ctrl">
            {t.pausada
              ? <button class="ctrl-b ini" onClick={ctx.retomarSessao}>Retomar</button>
              : <button class="ctrl-b" onClick={ctx.pausarSessao}>Pausar</button>}
            <button class="ctrl-b fim" onClick={ctx.finalizarSessao}>Encerrar</button>
          </div>
        )}

        {/* A rotação. Ácido no atual, fio no próximo — a fila é sequência, não
            dia da semana, e a tela mostra isso de relance. */}
        <div class="tr-rot">
          {t.rotacao.map(x => (
            <button
              key={x.k}
              class={'tr-dia' + (x.on ? ' on' : '') + (x.proximo ? ' next' : '')}
              onClick={() => ctx.vaiParaDia(x.k)}
            >{x.t}</button>
          ))}
        </div>
      </Secao>

      {/* A FAIXA DA SEMANA e o PLACAR DO CARDIO saíram daqui, e é regra escrita:
          o modo esconde "o resumo do dia, as médias, os placares", porque isso é
          "como está?" e o modo responde "e agora?" (frente 1, §4.2). O
          comentário que estava nesta linha já dizia metade — "contexto de
          ADESÃO, não da sessão" —, e era a aba que os mantinha aqui.
          A faixa foi para DIAS, que é "o que aconteceu em cada dia" (§1.2); o
          placar e o registro rápido, para o AGORA, que é o dono do cardio
          porque é onde ele se registra (§1.7). */}
      {t.avisos.map(a => (
        <div key={a.k} class={'tr-aviso deload ' + (a.cor || '')}>
          <div class="ins-label">{a.rotulo}</div>
          <p class="ins-body-sm ins-t2">{a.txt}</p>
          {a.acao && (
            <button class="ins-btn-secondary dlbtn" onClick={a.acao.onClick}>{a.acao.t}</button>
          )}
        </div>
      ))}

<Secao
        rotulo={t.editando ? 'editando hoje' : t.aberto ? 'o que o box passou hoje' : 'exercícios'}
        nota={t.editando ? 'nada aqui mexe no programa'
          : t.aberto ? (t.movimentos
              ? `${t.movimentos} ${t.movimentos === 1 ? 'movimento' : 'movimentos'}`
              : 'nada prescrito')
          : `${t.feitas} de ${t.prescritas} séries`}>
        {/* O quadro do box, enquanto a aula acontece. Antes dos cartões porque
            é a prescrição do dia — o time cap, o peso sugerido e o que mais a
            lousa disse e o app deliberadamente não modela. Some quando a
            sessão encerra, depois de virar a nota dela no histórico. */}
        {t.quadro && !t.editando && (
          <div class="tr-quadro">
            <h3 class="ins-rotulo">O quadro do box</h3>
            <p class="tr-quadro-t">{t.quadro}</p>
          </div>
        )}

        {/* A lista rápida vem ANTES dos cartões: quem a abre está no fim da
            aula e não quer rolar cinco cartões para chegar nela. */}
        {t.rapido && !t.editando && !t.addEx && (
          <RegistroRapido c={t.rapido} acoes={ctx.acoesRapido} />
        )}

        {t.editando
          ? <EdicaoDoDia ctx={ctx} />
          : t.rapido && t.rapido.ativo
            ? null
          : t.exercicios.length === 0
            ? (t.aberto
                /* O vazio de um dia aberto não é falta: é o estado normal dele
                   antes da aula. O texto diz isso, senão lê como erro.

                   Não cita mais a "prova inteira": o atalho que punha as nove
                   estações de uma vez saiu, e o vazio continuou oferecendo um
                   caminho que não existe mais. */
                ? <>
                    <Vazio>
                      Sábado é o que o box programar. Adicione o que entrou na aula,
                      repita o sábado passado ou aplique um modelo.
                    </Vazio>
                    {/* Antes de começar, a referência (a D, aula, estado 5):
                        o que entrou na última aula, para saber o peso que se
                        costuma pegar. */}
                    {t.ultimaAula && (
                      <div class="tr-ultima">
                        <h3 class="ins-rotulo">Na última aula, {t.ultimaAula.quando}</h3>
                        <div class="ins-lista">
                          {t.ultimaAula.linhas.map(l => (
                            <div key={l.k} class="ins-linha">
                              <span class="ins-linha-n"><span class="ins-linha-t">{l.n}</span></span>
                              <span class="ins-linha-v">{l.v}</span>
                            </div>
                          ))}
                        </div>
                        <p class="ins-body-xs ins-t3">Peso guardado é peso do dia: a lousa muda toda semana.</p>
                      </div>
                    )}
                  </>
                : <Vazio>Este treino ainda não tem exercício nenhum.</Vazio>)
            : t.exercicios.map(vm => (
                <Exercicio key={vm.id} vm={vm} acoes={ctx.acoesEx} />
              ))}

        {t.addEx && <AddEx c={t.addEx} acoes={ctx.acoesAdd} />}

        {t.aulas && !t.editando && !t.addEx && (
          <Aulas c={t.aulas} acoes={ctx.acoesAulas} />
        )}

        {t.aberto && !t.editando && !t.addEx && (
          <button class="ins-btn-add tr-aberto" onClick={ctx.acoesAdd.abre}>
            + Adicionar movimento
          </button>
        )}
      </Secao>

      <Secao rotulo="O programa" nota={t.diffTxt}>
        <p class="ins-body-sm ins-t3 tr-nota">
          Cada série entra no histórico assim que você preenche carga e repetição.
          Não há nada para salvar. O treino se encerra sozinho e a rotação avança
          para {t.proximo}.
        </p>
{/* .edlink só existe quando dá para editar HOJE: em outro dia a mudança é
            edição de programa, e o app repete essa distinção em toda tela. */}
        <div class={'tr-links' + (t.podeEditar ? ' edlink' : '')}>
          {/* Já editando, a porta de entrada some: quem está dentro tem o
              "pronto" da barra, e oferecer "editar" de novo é oferecer o
              lugar onde ele já está. */}
          {t.podeEditar && !t.editando && (
            <button class="ins-btn-secondary" onClick={ctx.modoEdicao}>Editar treino de hoje</button>
          )}
          <button class="ins-btn-secondary" onClick={ctx.abrePrograma}>Abrir o programa</button>
        </div>
      </Secao>
    </>
  );
}
