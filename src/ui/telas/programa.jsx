// O programa.
//
// Quatro modos numa tela só — a lista dos treinos, um treino aberto, a
// diferença para o que o treinador prescreveu, e o histórico de mudanças —
// porque são quatro ângulos do MESMO objeto. Separá-los em destinos diferentes
// obrigaria a sair e voltar para responder "mudei isso quando, e por quê?".
//
// A frase que define a tela está logo abaixo dos números: aqui a mudança vale
// a partir do próximo treino. A edição do dia diz o contrário com a mesma
// clareza, e as duas existem para que ninguém confunda uma com a outra.

import { Vazio } from '../instrumento/primitivos.jsx';
import { Stats, TelaCheia } from '../instrumento/telacheia.jsx';
import { AddEx, LinhaEditavel } from '../instrumento/edicao.jsx';

export function Programa({ ctx }) {
  const p = ctx.programa();
  const a = ctx.acoesPrograma;

  return (
    <TelaCheia olho={p.olho} meta={p.meta} titulo={p.titulo} aoVoltar={a.volta} corpo="hwrap">
      {p.modo === 'lista' && <Lista p={p} a={a} />}
      {p.modo === 'dia' && <Dia p={p} a={a} ctx={ctx} />}
      {p.modo === 'diff' && <Diff p={p} a={a} />}
      {p.modo === 'historico' && <Hist p={p} />}
    </TelaCheia>
  );
}

function Lista({ p, a }) {
  return (
    <>
      <Stats celulas={p.stats} />
      <p class="ins-body-sm ins-t3 cue prog-nota">
        Aqui a mudança é direta: vale a partir do próximo treino. Para mudar só
        o treino de hoje, use a edição na tela de hoje.
      </p>

      <div class="progdias">
        {p.dias.map(d => (
          <div class="progd" key={d.d}>
            <button class="progd-b" onClick={() => a.abreDia(d.d)}>
              <div class="progd-l">{d.d}</div>
              <div class="progd-t">
                <b>{d.nome}</b>
                <span>{d.meta}</span>
              </div>
              <div class="chev">›</div>
            </button>
            {/* Reordenar é seta, não arrastar: com uma mão e a tela suada, o
                drag erra o alvo e desfaz o que ele acabou de organizar. */}
            <div class="progd-mv">
              <button onClick={() => a.moveDia(d.i, -1)} disabled={d.primeiro} aria-label="subir">↑</button>
              <button onClick={() => a.moveDia(d.i, 1)} disabled={d.ultimo} aria-label="descer">↓</button>
            </div>
          </div>
        ))}
      </div>

      <button class="edadd" onClick={a.criaTreino}>criar treino novo</button>

      <div class="dgroup prog-comparar">
        <h3>Comparar com o treinador</h3>
        <p>
          {p.dif
            ? p.dif + (p.dif === 1 ? ' diferença em relação' : ' diferenças em relação') +
              ' ao que ele prescreveu.'
            : 'Seu programa está igual ao que o treinador prescreveu.'}
        </p>
        <button class="ins-btn-secondary dbtn ghost" onClick={() => a.modo('diff')}>ver a diferença</button>
        <button class="ins-btn-secondary dbtn ghost" onClick={() => a.modo('historico')}>histórico de mudanças</button>
        {/* Destrutivo, e por isso coral: joga fora tudo que ele promoveu. */}
        <button class="ins-btn-secondary ins-btn-destructive dbtn ghost"
                onClick={a.restauraTudo}>restaurar o programa do treinador</button>
      </div>
    </>
  );
}

function Dia({ p, a, ctx }) {
  if (p.vazio) return <Vazio>Treino não encontrado.</Vazio>;

  return (
    <>
      {p.dif.length > 0 && (
        <div class="progdif">
          <b>{p.dif.length} {p.dif.length === 1 ? 'diferença' : 'diferenças'} do treinador</b>
          {p.dif.map(t => <span key={t}>{t}</span>)}
          <button class="dlbtn" onClick={() => a.restauraDia(p.dia)}>restaurar este treino</button>
        </div>
      )}

      {p.linhas.map(l => (
        <LinhaEditavel key={l.i} l={l} acoes={ctx.acoesProg}>
          {/* Reps e descanso só existem no programa: no dia, mudar a
              prescrição do exercício seria mudar o programa por outra porta. */}
          <div class="edx-c">
            <button class="edx-b" onClick={() => ctx.acoesProg.reps(l.i)}>{l.reps}</button>
            <button class="edx-b" onClick={() => ctx.acoesProg.descanso(l.i)}>{l.descanso}</button>
          </div>
        </LinhaEditavel>
      ))}

      <button class="edadd" onClick={ctx.acoesAdd.abre}>adicionar exercício</button>
      {p.addEx && <AddEx c={p.addEx} acoes={ctx.acoesAdd} />}
    </>
  );
}

function Diff({ p, a }) {
  if (!p.blocos.length) {
    return <Vazio>Seu programa está igual ao que o treinador prescreveu.</Vazio>;
  }
  return (
    <>
      {p.blocos.map(b => (
        <div class="progdif" key={b.k}>
          <b>{b.titulo}</b>
          {b.itens.map(t => <span key={t}>{t}</span>)}
          {b.dia && <button class="dlbtn" onClick={() => a.restauraDia(b.dia)}>restaurar</button>}
        </div>
      ))}
    </>
  );
}

function Hist({ p }) {
  if (!p.log.length) return <Vazio>Nenhuma mudança no programa até agora.</Vazio>;
  return (
    <>
      {p.log.map(x => (
        <div class="phist" key={x.i}>
          <div class="phist-t">{x.txt}</div>
          <div class="phist-m ins-provenance">{x.meta}</div>
        </div>
      ))}
    </>
  );
}
