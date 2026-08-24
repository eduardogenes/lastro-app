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
          colunas={3}
          celulas={[
            // id=daymeta: atualizaEstado() escreve aqui a cada tecla, sem
            // re-render — o porquê está em main.jsx.
            { k: 's', id: 'daymeta', rotulo: 'séries', valor: `${t.feitas}/${t.prescritas}`,
              cor: t.feitas >= t.prescritas && t.prescritas > 0 ? 'ins-acid' : '' },
            { k: 'v', rotulo: 'volume', valor: t.volume },
            { k: 'c', rotulo: 'ciclo', valor: t.ciclo, nota: `${t.sessoes} sessões` }
          ]}
        />

        {/* O relógio anda por fora do Preact de propósito: tickRelogio()
            escreve em #relogio de segundo em segundo sem re-render, porque
            redesenhar a tela inteira a cada segundo roubaria o foco do campo
            que ele está preenchendo no meio da série. */}
        {c.sessao
          ? <div class={'day-rel' + (c.sessao.pausada ? ' pausado' : '')}>
              {!c.sessao.pausada && <span class="ins-live-dot" />}
              <span id="relogio" class="ins-metric-m">{c.sessao.relogio}</span>
              <em class="ins-label-sm">{c.sessao.desde}</em>
            </div>
          : <button class="day-ini" onClick={ctx.iniciarSessao}>iniciar treino</button>}

        {t.sessaoAberta && (
          <div class="ctrl">
            {t.pausada
              ? <button class="ctrl-b ini" onClick={ctx.retomarSessao}>retomar</button>
              : <button class="ctrl-b" onClick={ctx.pausarSessao}>pausar</button>}
            <button class="ctrl-b fim" onClick={ctx.finalizarSessao}>finalizar</button>
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

      {/* A semana e o cardio: contexto de adesão, não da sessão. */}
      <div class="semana">
        {c.semana.map(d => (
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

      <div class={'cardl' + (c.cardio.feito ? ' feito' : '')}>
        <span class="cardl-t">cardio</span>
        <span class="cardl-n">{c.cardio.resumo}</span>
        <button class="cardl-b" onClick={ctx.abreCardio}>
          {c.cardio.aberto ? 'fechar' : 'registrar'}
        </button>
      </div>

      {/* Registro rápido no lugar: sair da tela para anotar 25 min de bike
          seria mais atrito que a própria bike. */}
      {c.cardio.aberto && (
        <div class="cardq">
          <div class="chips">
            {c.cardio.modais.map(m => (
              <button key={m.k} class={'chip' + (m.on ? ' sel' : '')}
                      onClick={() => ctx.cardioSet('m', m.k)}>{m.t}</button>
            ))}
          </div>
          <div class="chips cardq-2">
            {c.cardio.minutos.map(v => (
              <button key={v.k} class={'chip' + (v.on ? ' sel' : '')}
                      onClick={() => ctx.cardioSet('min', v.k)}>{v.t}</button>
            ))}
            {c.cardio.intensidades.map(v => (
              <button key={v.k} class={'chip' + (v.on ? ' sel' : '')}
                      onClick={() => ctx.cardioSet('i', v.k)}>{v.t}</button>
            ))}
          </div>
          {c.cardio.aviso && <div class="cwarn">{c.cardio.aviso}</div>}
          <button class="ins-btn-primary dbtn cardq-b" onClick={ctx.addCardio}>
            {c.cardio.acao}
          </button>
        </div>
      )}

      {t.avisos.map(a => (
        <div key={a.k} class={'tr-aviso deload ' + (a.cor || '')}>
          <div class="ins-label">{a.rotulo}</div>
          <p class="ins-body-sm ins-t2">{a.txt}</p>
          {a.acao && (
            <button class="ins-btn-secondary dlbtn" onClick={a.acao.onClick}>{a.acao.t}</button>
          )}
        </div>
      ))}

<Secao rotulo={t.editando ? 'editando hoje' : 'exercícios'}
             nota={t.editando ? 'nada aqui mexe no programa' : `${t.feitas} de ${t.prescritas} séries`}>
        {t.editando
          ? <EdicaoDoDia ctx={ctx} />
          : t.exercicios.length === 0
            ? <Vazio>Este treino ainda não tem exercício nenhum.</Vazio>
            : t.exercicios.map(vm => (
                <Exercicio key={vm.id} vm={vm} acoes={ctx.acoesEx} />
              ))}
      </Secao>

      <Secao rotulo="o programa" nota={t.diffTxt}>
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
            <button class="ins-btn-secondary" onClick={ctx.modoEdicao}>editar treino de hoje</button>
          )}
          <button class="ins-btn-secondary" onClick={ctx.abrePrograma}>abrir o programa</button>
        </div>
      </Secao>
    </>
  );
}
