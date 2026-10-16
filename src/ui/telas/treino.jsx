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

import { useLayoutEffect, useState } from 'preact/hooks';
import { Cabecalho, GradeMetricas, Secao, Vazio, useAgora } from '../instrumento/primitivos.jsx';
import { Exercicio } from '../exercicio.jsx';
import { AddEx, Aulas, RegistroRapido } from '../instrumento/edicao.jsx';
import { EdicaoDoDia } from './edicaodia.jsx';

// O CONTADOR DO TOPO — "séries N/M", ou "movimentos" num dia aberto — tem UM
// escritor só: este componente.
//
// Até 16/10 eram dois. O casco (`atualizaEstado`, em main.jsx) escrevia
// `textContent` direto no nó a cada tecla, sem re-render, e isso TROCAVA o nó
// de texto que o Preact guardava: dali em diante o render() pintava num nó
// solto, e o que só passa pelo render() — ligar o deload, mudar séries na
// edição do dia — deixava a tela com o número velho (tela 1/20, dado 1/12;
// docs/motion/03 §8.1). Agora o casco só AVISA, e o componente se redesenha
// sozinho, lendo o número da mesma função que o render() lê. O Preact agenda
// esse desenho para antes do próximo quadro, e só este nó muda.
//
// O aviso existe porque `inp()` não chama render() de propósito (o porquê está
// em `atualizaEstado`).
const quemOuve = new Set();

/** O número do contador pode ter mudado: quem estiver na tela se redesenha. */
export function avisaOContador() {
  quemOuve.forEach(function (f) { f(); });
}

function Contador({ ler }) {
  const [, bate] = useState(0);
  // De layout, e não `useEffect`: ouvindo desde o desenho em que nasceu. Um
  // aviso entre o desenho e o efeito se perderia.
  useLayoutEffect(() => {
    const f = () => bate(n => n + 1);
    quemOuve.add(f);
    return () => { quemOuve.delete(f); };
  }, []);
  const c = ler();
  return <span class={c.cor || undefined}>{c.valor}</span>;
}

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
            // id=daymeta: o número e a cor são do `Contador` (acima), que se
            // redesenha sozinho quando o casco avisa — um escritor só.
            // Num dia aberto não há meta a cumprir: `0/16` era uma conta contra
            // um número que o box nunca ia respeitar. O que se conta é o que
            // entrou — e antes da aula é um traço, não um zero.
            { k: 's', id: 'daymeta', rotulo: t.aberto ? 'movimentos' : 'séries',
              valor: <Contador ler={ctx.contadorDoDia} /> },
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

        {/* A LOUSA (a D, aula, estado 6; decisão do dono, 14/10): foto agora,
            transcrição quando der. Um toque fotografa e acaba ali. */}
        {t.lousa && !t.editando && (
          <div class="tr-lousa">
            {t.lousa.tem ? <>
              {t.lousa.url && <img class="tr-lousa-img" src={t.lousa.url} alt="Foto da lousa do box" />}
              <p class="ins-body-xs ins-t3 tr-lousa-q">{t.lousa.quando}</p>
              <div class="tr-lousa-b">
                {t.lousa.podeMandar && (
                  <button class="ins-btn-secondary" data-a="lousa-manda" onClick={ctx.mandaLousa}>Mandar para transcrever</button>
                )}
                <label class="ins-btn-secondary tr-lousa-arq">
                  Refazer a foto
                  <input type="file" accept="image/*" capture="environment" data-a="lousa-refaz"
                         onChange={e => ctx.tiraFotoDaLousa(e.currentTarget)} />
                </label>
              </div>
              <p class="ins-body-sm ins-t3">
                A foto fica guardada no dia, neste aparelho. Quando a aula termina, ela passa
                a ser parte daquela aula. Sem transcrição, a aula continua completa.
              </p>
            </> : (
              <label class="ins-btn-secondary tr-lousa-arq">
                Fotografar a lousa
                <input type="file" accept="image/*" capture="environment" data-a="lousa-foto"
                       onChange={e => ctx.tiraFotoDaLousa(e.currentTarget)} />
              </label>
            )}
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
