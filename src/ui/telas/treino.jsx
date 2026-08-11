// TREINO — a sessão e o programa.
//
// É a tela usada DENTRO da academia: de pé, com uma mão, suado, às 6h15. Tudo
// aqui é dimensionado por isso — alvo grande, nada que exija precisão, e o
// número que importa (séries feitas de prescritas) sempre visível no topo sem
// precisar rolar.

import { Cabecalho, GradeMetricas, Secao, Vazio, useAgora } from '../instrumento/primitivos.jsx';
import { Exercicio } from '../exercicio.jsx';
import { fmtDur } from '../../dominio/formato';

/** Relógio da sessão: quanto tempo já faz que começou, tirando as pausas. */
function Relogio({ ctx }) {
  useAgora();   // faz esta parte redesenhar de segundo em segundo
  const s = ctx.sessaoAberta();
  if (!s) return null;
  return (
    <div class="tr-relogio">
      <span class={'ins-live-dot' + (s.pausada ? ' parado' : '')} />
      <span class="ins-metric-m">{s.duracao}</span>
      <span class="ins-label-sm">{s.pausada ? 'pausado' : 'em treino'}</span>
    </div>
  );
}

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
            { k: 's', rotulo: 'séries', valor: `${t.feitas}/${t.prescritas}` },
            { k: 'v', rotulo: 'volume', valor: t.volume },
            { k: 'c', rotulo: 'ciclo', valor: t.ciclo, nota: `${t.sessoes} sessões` }
          ]}
        />
        {t.sessaoAberta && <Relogio ctx={ctx} />}

        <div class="tr-acoes">
          {!t.sessaoAberta && (
            <button class="ins-btn-secondary" onClick={ctx.iniciarSessao}>iniciar treino</button>
          )}
          {t.sessaoAberta && !t.pausada && (
            <button class="ins-btn-secondary" onClick={ctx.pausarSessao}>pausar</button>
          )}
          {t.sessaoAberta && t.pausada && (
            <button class="ins-btn-secondary" onClick={ctx.retomarSessao}>retomar</button>
          )}
          {t.sessaoAberta && (
            <button class="ins-btn-primary" onClick={ctx.finalizarSessao}>finalizar</button>
          )}
        </div>
      </Secao>

      {t.avisos.map(a => (
        <div key={a.k} class={'tr-aviso ' + (a.cor || '')}>
          <div class="ins-label">{a.rotulo}</div>
          <p class="ins-body-sm ins-t2">{a.txt}</p>
          {a.acao && <button class="ins-btn-secondary" onClick={a.acao.onClick}>{a.acao.t}</button>}
        </div>
      ))}

      <Secao rotulo="exercícios" nota={t.podeEditar ? 'toque em ··· para mudar só hoje' : null}>
        {t.exercicios.length === 0
          ? <Vazio>Este treino ainda não tem exercício nenhum.</Vazio>
          : t.exercicios.map((vm, i) => (
              <Exercicio
                key={vm.id}
                vm={vm}
                acoes={ctx.acoesEx}
                ultima={i === t.exercicios.length - 1}
              />
            ))}
      </Secao>

      <Secao rotulo="o programa" nota={t.diffTxt}>
        <p class="ins-body-sm ins-t3 tr-nota">
          Cada série entra no histórico assim que você preenche carga e repetição.
          Não há nada para salvar. O treino se encerra sozinho e a rotação avança
          para {t.proximo}.
        </p>
        <div class="tr-links">
          <button class="ins-btn-secondary" onClick={ctx.abrePrograma}>abrir o programa</button>
          <button class="ins-btn-secondary" onClick={ctx.abreHistorico}>histórico de carga</button>
        </div>
      </Secao>
    </>
  );
}
