// As folhas de HOJE: a refeição e o seletor de dia.
//
// Lei 6 do sistema, e é ela que faz a diferença entre um app de dieta que se
// entende e um que não: **editar é permanente, ajustar é de hoje — e o rótulo
// diz qual é qual**. Mudar a quantidade de um item muda o plano para todo dia;
// o controle de porção é explicitamente "só de hoje" e zera com a data.
// A distinção fica escrita na tela, não se aprende errando.

import { Folha } from '../instrumento/folha.jsx';
import { GradeMetricas, Procedencia, Stepper } from '../instrumento/primitivos.jsx';
import { fmtInt } from '../../dominio/formato';
import { totalDaRefeicao, totalDoItem } from '../../dominio/nutricao/calculo';

const PORCOES = [
  { k: 0.5, t: '½' }, { k: 0.75, t: '¾' }, { k: 1, t: 'cheia' }, { k: 1.25, t: '1¼' }, { k: 1.5, t: '1½' }
];

export function FolhaRefeicao({ ctx, id }) {
  const d = ctx.refeicao(id);
  if (!d) return null;
  const { r, catalogo, alta, escala, feita, padrao } = d;
  const t = totalDaRefeicao(r, catalogo, alta, escala);

  return (
    <Folha
      olho={r.tag}
      titulo={r.n}
      meta={r.t}
      aoFechar={ctx.fechaFolha}
      aoEditar={() => ctx.editaRefeicao(r.id)}
      acao={
        <button class="ins-btn-primary" onClick={() => { ctx.marcaRefeicao(r.id); ctx.fechaFolha(); }}>
          {feita ? 'desmarcar' : 'marcar como feita'}
        </button>
      }
    >
      <GradeMetricas
        colunas={4}
        celulas={[
          { k: 'k', rotulo: 'kcal', valor: fmtInt(t.kcal) },
          { k: 'p', rotulo: 'prot', valor: Math.round(t.p) },
          { k: 'c', rotulo: 'carb', valor: Math.round(t.c) },
          { k: 'g', rotulo: 'gord', valor: Math.round(t.g) }
        ]}
      />

      {/* O padrão desta refeição, antes de ele decidir. Contagem crua e sem
          cor: percentual contra 100% implícito funciona como nota, e feedback
          que dirige a atenção para a autoavaliação piora o desempenho em cerca
          de um terço dos casos. Aqui o app informa e para. */}
      {padrao && <Procedencia>{padrao.txt}</Procedencia>}

      {r.nota && <p class="ins-body-sm ins-t3 fr-nota">{r.nota}</p>}

      <div class="fr-porcao">
        <div class="ins-label">porção · só de hoje</div>
        <div class="ins-chips">
          {PORCOES.map(p => (
            <button
              key={p.k}
              class={'ins-chip' + (escala === p.k ? ' on' : '')}
              onClick={() => ctx.setEscala(r.id, p.k)}
            >{p.t}</button>
          ))}
        </div>
        <Procedencia>
          isto não muda o plano. Zera sozinho na virada do dia.
        </Procedencia>
      </div>

      <div class="ins-label fr-h">o que tem dentro</div>
      <div class="ins-lista">
        {r.itens.filter(i => !i.alta || alta).map(i => {
          const a = catalogo[i.f];
          if (!a) return null;
          const it = totalDoItem(i, catalogo, escala);
          return (
            <div key={i.f} class="ins-linha">
              <span class="ins-linha-n">
                <span class="ins-linha-t">{a.n}</span>
                <span class="ins-linha-s">
                  {Math.round(i.q * escala)} {a.u}
                  {escala !== 1 && ` · plano diz ${i.q} ${a.u}`}
                </span>
              </span>
              <span class="ins-linha-v">{fmtInt(it.kcal)} kcal</span>
            </div>
          );
        })}
      </div>
      <Procedencia>
        os macros vêm da biblioteca, por 100 g ou 100 ml. Mudar um alimento lá
        recalcula tudo que o usa.
      </Procedencia>
    </Folha>
  );
}

/**
 * O seletor de dia. Confirma ou corrige o que a cadência previu.
 *
 * Não escolhe QUAL treino: isso é da rotação, que avança sozinha conforme ele
 * registra. Aqui só se diz se hoje é dia de treinar — que é a única parte que a
 * rotação não tem como saber.
 */
export function FolhaDia({ ctx }) {
  const d = ctx.seletorDeDia();
  return (
    <Folha olho="hoje é" titulo={d.titulo} meta={d.treino || ''} aoFechar={ctx.fechaFolha}>
      <div class="fd-ops">
        <button
          class={'fd-op' + (d.cadencia === 'treino' ? ' on' : '')}
          onClick={() => ctx.setCadenciaDeHoje('treino')}
        >
          <span class="ins-subtitle">Dia de treino</span>
          <span class="ins-body-sm ins-t3">
            {d.treino ? `A rotação diz que vem o treino ${d.treino}.` : 'Entra a próxima sessão da rotação.'}
          </span>
        </button>
        <button
          class={'fd-op' + (d.cadencia === 'descanso' ? ' on' : '')}
          onClick={() => ctx.setCadenciaDeHoje('descanso')}
        >
          <span class="ins-subtitle">Descanso</span>
          <span class="ins-body-sm ins-t3">
            Sai o pré-treino e o intra-treino. A rotação não anda.
          </span>
        </button>
      </div>

      {/* O turno do treino. Existe porque o plano foi desenhado em cima de
          treino às 6h15 e ele nem sempre treina de manhã — e a refeição que
          carrega o papel de pós-treino muda junto.

          Só o pré e o intra deslizam: café, almoço, lanche e jantar são
          âncoras do relógio. Deslocar o dia em bloco poria o café às 14h. */}
      {d.cadencia === 'treino' && (
        <div class="fd-turno">
          <div class="ins-label">turno do treino</div>
          <div class="fd-turnos">
            {d.turnos.map(t => (
              <button
                key={t.k}
                class={'fd-turno-op' + (t.on ? ' on' : '')}
                onClick={() => ctx.setTurno(t.k)}
              >
                <span class="fd-turno-n">{t.n}</span>
                <span class="fd-turno-h">{t.hora}</span>
                {t.pos && <span class="fd-turno-p">pós · {t.pos}</span>}
              </button>
            ))}
          </div>
          <p class="ins-body-sm ins-t3">
            Anda o pré-treino e o intra. As refeições de relógio ficam onde
            estão, e o pós-treino passa a ser a primeira depois da sessão.
          </p>
        </div>
      )}

      <div class="fd-alta">
        <div class="ins-label">demanda alta</div>
        <p class="ins-body-sm ins-t3">
          Entra o carboidrato extra do intra-treino. Use no dia de perna pesada.
        </p>
        <button
          class={'ins-chip' + (d.alta ? ' on' : '')}
          onClick={() => ctx.setAlta(!d.alta)}
        >{d.alta ? 'ligado' : 'desligado'}</button>
      </div>

      {/* Como o dia foi. O peso responde ao que ele COMEU, não ao que estava
          prescrito — e numa semana de saídas, reduzir o plano-base tiraria
          comida dos dias em que ele seguiu, para compensar calorias que
          vieram de fora dele. Sair sabendo o que comeu não estraga a semana;
          sair sem saber, sim. */}
      <div class="fd-aderencia">
        <div class="ins-label">como foi o dia</div>
        <div class="chips ins-chips">
          {d.aderencias.map(x => (
            <button
              key={x.k}
              class={'chip ins-chip' + (d.aderencia === x.k ? ' on' : '')}
              onClick={() => ctx.setAderencia(x.k)}
            >{x.t}</button>
          ))}
        </div>
        <p class="ins-body-sm ins-t3">
          Entra na régua calórica: com menos de 11 dos últimos 14 dias
          interpretáveis, o app avisa do ganho mas não tira comida do plano.
        </p>
      </div>

      <Procedencia>{d.procedencia}</Procedencia>
    </Folha>
  );
}
