// DIAS no visual novo (Fase 4): o mês em grade, com a letra do treino e a
// marca da comida em cada dia, o dia escolhido embaixo, e a sequência de
// "responder os dias", um por tela. Protótipo: docs/redesign-3/prototipos/
// hoje.html ("Dias"). Dados: `ctx.mes`, `ctx.respostaDoDia`,
// `ctx.responderDiasV3`; as respostas gravam por `ctx.respondeODia`.

import { useState } from 'preact/hooks';
import { ic } from '../icones.jsx';
import { Acoes, Apoio, Botao, Cabecalho, Pergunta, Secao, TelaDeAcao } from '../base.jsx';

const RESPOSTAS = [{ k: 'sim', t: 'Foi, sim' }, { k: 'quase', t: 'Quase' }, { k: 'naosei', t: 'Não lembro' }];

export function DiasV3({ ctx }) {
  const m = ctx.mes();
  const [sel, setSel] = useState(null);
  const passados = m.celulas.filter(c => !c.futuro);
  const c = sel ? m.celulas.filter(x => x.iso === sel)[0] : passados[passados.length - 1];
  const treinos = m.celulas.filter(x => x.principal && x.principal !== 'desc.').length;
  const resposta = c ? ctx.respostaDoDia(c.iso) : null;
  const vazios = [];
  for (let i = 0; i < m.offset; i++) vazios.push(<span key={'v' + i} />);
  return (
    <div class="v3">
      <Cabecalho titulo="Dias" raiz nota={treinos + (treinos === 1 ? ' treino' : ' treinos')} />
      <div class="v3-mes-nav">
        <button data-a="mes-anterior" onClick={() => ctx.mudaMes(-1)} aria-label={'Mês anterior: ' + m.anterior}>{ic.volta}</button>
        <b>{m.titulo}</b>
        <button data-a="mes-proximo" disabled={!m.podeAvancar} onClick={() => ctx.mudaMes(1)} aria-label={'Próximo mês: ' + m.proximo}>{ic.dir}</button>
      </div>
      <div class="v3-pad">
        <div class="v3-cal v3-cal-h" aria-hidden="true">{m.dias.map((d, i) => <span key={i}>{d.charAt(0).toUpperCase()}</span>)}</div>
        <div class="v3-cal" role="grid">
          {vazios}
          {m.celulas.map(x => (
            <button key={x.iso} disabled={x.futuro} data-a={'dia-' + x.iso} aria-label={x.rotulo} aria-pressed={c && c.iso === x.iso ? 'true' : 'false'}
                    class={['v3-dia', x.principal && x.principal !== 'desc.' ? 't' : '', x.hoje ? 'hoje' : '', x.futuro ? 'fut' : '',
                            x.comida === 'sem' ? 'branco' : '', c && c.iso === x.iso ? 'sel' : ''].filter(Boolean).join(' ')}
                    onClick={() => setSel(x.iso)}>
              <small>{x.n}</small>{x.principal && x.principal !== 'desc.' ? x.principal : ''}
              {x.comida === 'com' && <i class="v3-cal-c" aria-hidden="true" />}
            </button>
          ))}
        </div>
        <Apoio>A bolinha é comida respondida ou marcada. Dia riscado ficou em branco: fica fora da conta, não vira zero.</Apoio>
      </div>
      {c && (
        <Secao titulo={c.rotulo.split(':')[0]} nota={c.hoje ? 'hoje' : null}>
          <p class="v3-dia-txt">{c.rotulo.indexOf(':') >= 0 ? c.rotulo.split(': ')[1] : 'nada registrado'}</p>
          {!c.hoje && !resposta && c.comida !== 'com' && (
            <Pergunta pergunta="A comida deste dia foi como o plano?" respostas={RESPOSTAS} valor={null}
                      aoResponder={k => ctx.respondeODia(c.iso, k)} />
          )}
          {resposta && <Apoio>Comida respondida: {resposta === 'sim' ? 'foi como o plano' : resposta === 'quase' ? 'quase' : 'não lembro'}.</Apoio>}
          <Acoes><Botao tipo="contorno" cheio data-a="dia-abre" onClick={() => ctx.abreDia(c.abre)}>Abrir o dia {ic.seta}</Botao></Acoes>
        </Secao>
      )}
      <Secao>
        <Acoes><Botao data-a="responder-dias" onClick={ctx.abreResponderDias}>Responder os dias em branco</Botao></Acoes>
      </Secao>
      <div class="v3-fim-da-tela" />
    </div>
  );
}

/** Responder os dias: um por tela, com voltar um e "os que faltam". */
export function ResponderDias({ ctx }) {
  const r = ctx.responderDiasV3();
  if (!r) return null;
  if (!r.atual) {
    return (
      <TelaDeAcao cor="menta" topo={<><button onClick={ctx.fechaResponderDias} aria-label="Fechar">{ic.x}</button><span /><span /></>}
        pe={<Botao grande data-a="responder-fecha" onClick={ctx.fechaResponderDias}>Fechar</Botao>}>
        <h1 class="v3-serie-n" tabindex="-1">{r.total ? 'Respondidos' : 'Nada em branco'}</h1>
        <p class="v3-medir-f">{r.respondidos} de {r.de} dias com resposta. A regra do nutricionista precisa de 11 dos 14.</p>
      </TelaDeAcao>
    );
  }
  return (
    <TelaDeAcao cor="lilas"
      topo={<><button onClick={ctx.fechaResponderDias} aria-label="Fechar" data-a="responder-sair">{ic.x}</button>
              <span class="v3-n">{r.i + 1} de {r.total}</span><span class="v3-vazio-alvo" /></>}
      pe={<div class="v3-resp-pe">
            {RESPOSTAS.map((x, j) => <Botao key={x.k} tipo={j === 0 ? 'principal' : 'contorno'} grande={j === 0} data-a={'resp-' + x.k}
                                            onClick={() => ctx.respondeNaSequencia(x.k, false)}>{x.t}</Botao>)}
          </div>}
      links={<>
        <button data-a="resp-volta" disabled={r.i === 0} onClick={ctx.voltaUmNaSequencia}>Voltar um</button>
        {r.total - r.i > 1 && <button data-a="resp-todos" onClick={() => ctx.respondeNaSequencia('sim', true)}>Os {r.total - r.i} que faltam foram como o plano</button>}
      </>}>
      <p class="v3-serie-q">{r.atual.rotulo}</p>
      <h1 class="v3-serie-n" tabindex="-1">A comida deste dia foi como o plano?</h1>
      <p class="v3-medir-f">Se não lembrar, tudo bem: "não lembro" é resposta, e o dia fica fora da conta.</p>
    </TelaDeAcao>
  );
}

