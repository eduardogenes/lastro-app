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
import { Bruto } from '../bruto.jsx';

export function Treino({ ctx }) {
  const t = ctx.treino();

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

        {/* Relógio, controles de sessão, faixa da semana e linha de cardio
            ainda vêm em string do casco. Foi decisão de risco: esse markup
            carrega o relógio que anda sem re-render, o horário da sessão e o
            atalho de cardio, tudo com teste em cima. Repintar isso é o próximo
            passo, e é repintura de CSS — a marcação já está certa. */}
        <Bruto class="tr-sessao" html={t.htmlSessao} />

        {/* A rotação. Ácido no atual, fio no próximo — a fila é sequência, não
            dia da semana, e a tela mostra isso de relance. */}
        <div class="tr-rot rot">
          {t.rotacao.map(x => (
            <button
              key={x.k}
              class={'tr-dia' + (x.on ? ' on' : '') + (x.proximo ? ' next' : '')}
              onClick={() => ctx.vaiParaDia(x.k)}
            >{x.t}</button>
          ))}
        </div>
      </Secao>

      <Bruto class="tr-semana" html={t.htmlSemana} />

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
          ? <Bruto html={t.htmlEdicao} />
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
          {t.podeEditar && (
            <button class="ins-btn-secondary" onClick={ctx.modoEdicao}>editar treino de hoje</button>
          )}
          <button class="ins-btn-secondary" onClick={ctx.abrePrograma}>abrir o programa</button>
        </div>
      </Secao>
    </>
  );
}
