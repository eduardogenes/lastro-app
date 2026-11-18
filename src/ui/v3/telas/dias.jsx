// DIAS no visual novo (Fase 4): o mês em grade, com a letra do treino e a
// marca da comida em cada dia, o dia escolhido embaixo, e a sequência de
// "responder os dias", um por tela. Protótipo: docs/redesign-3/prototipos/
// hoje.html ("Dias"). Dados: `ctx.mes`, `ctx.respostaDoDia`,
// `ctx.responderDiasV3`; as respostas gravam por `ctx.respondeODia`.

import { useState } from 'preact/hooks';
import { ic } from '../icones.jsx';
import { Acoes, Apoio, Botao, Cabecalho, Pergunta, Quadros, Secao, Segmentos, TelaDeAcao } from '../base.jsx';

const RESPOSTAS = [{ k: 'sim', t: 'Foi, sim' }, { k: 'quase', t: 'Quase' }, { k: 'naosei', t: 'Não lembro' }];
const DITA = { sim: 'foi como o plano', quase: 'quase como o plano', naosei: 'não lembro' };

export function DiasV3({ ctx }) {
  const m = ctx.mes();
  const [sel, setSel] = useState(null);
  const passados = m.celulas.filter(c => !c.futuro);
  const c = sel ? m.celulas.filter(x => x.iso === sel)[0] : passados[passados.length - 1];
  const treinos = m.celulas.filter(x => x.principal && x.principal !== 'desc.').length;
  const resposta = c ? ctx.respostaDoDia(c.iso) : null;
  const r14 = ctx.respondidosV3();
  const dia = c ? ctx.resumoDoDiaV3(c.iso) : null;
  const mesNome = m.titulo.split(' de ')[0];
  const comida = ctx.moduloLigado('comida');
  const diasVistos = passados.length;
  const pad = h => h.replace(/^(\d):/, '0$1:').replace(':', 'h');
  const vazios = [];
  for (let i = 0; i < m.offset; i++) vazios.push(<span key={'v' + i} />);
  return (
    <div class="v3">
      <Cabecalho titulo="Dias" raiz nota={mesNome + ' · ' + treinos + (treinos === 1 ? ' treino' : ' treinos') + ' em ' + diasVistos + (diasVistos === 1 ? ' dia' : ' dias')} />
      <div class="v3-mes-nav">
        <button data-a="mes-anterior" onClick={() => ctx.mudaMes(-1)} aria-label={'Mês anterior: ' + m.anterior}>{ic.volta}</button>
        <b>{m.titulo}</b>
        <button data-a="mes-proximo" disabled={!m.podeAvancar} onClick={() => ctx.mudaMes(1)} aria-label={'Próximo mês: ' + m.proximo}>{ic.dir}</button>
      </div>
      <div class="v3-pad">
        <div class="v3-cal v3-cal-h" aria-hidden="true">{m.dias.map((d, i) => <span key={i}>{d.charAt(0).toUpperCase()}</span>)}</div>
        <div class="v3-cal" role="group" aria-label={m.titulo}>
          {vazios}
          {m.celulas.map(x => (
            <button key={x.iso} disabled={x.futuro} data-a={'dia-' + x.iso} aria-label={x.rotulo} aria-pressed={c && c.iso === x.iso ? 'true' : 'false'}
                    class={['v3-dia', x.principal && x.principal !== 'desc.' ? 't' : '', x.hoje ? 'hoje' : '', x.futuro ? 'fut' : '',
                            comida && x.comida === 'sem' && !(x.principal && x.principal !== 'desc.') ? 'branco' : '', c && c.iso === x.iso ? 'sel' : ''].filter(Boolean).join(' ')}
                    onClick={() => setSel(x.iso)}>
              <small>{x.n}</small>{x.principal && x.principal !== 'desc.' ? x.principal : ''}
              {comida && x.comida === 'com' && <i class="v3-cal-c" aria-hidden="true" />}
            </button>
          ))}
        </div>
        <div class="v3-legm" role="group" aria-label="Legenda do mês">
          <span><i class="t" />treino</span>{comida && <><span><i class="c" />comida respondida</span><span><i class="v" />em branco</span></>}
        </div>
      </div>
      {c && (
        <Secao titulo={c.rotulo.split(':')[0] + (c.hoje ? ' · hoje' : '')}>
          <Quadros colunas={3} itens={[
            { k: 't', valor: dia.treino ? dia.treino.titulo : '—', rotulo: dia.treino ? dia.treino.apoio : 'sem treino', aoTocar: () => ctx.abreDia(c.abre) },
            { k: 'p', valor: dia.peso || '—', unidade: dia.peso ? 'kg' : null, rotulo: 'peso' },
            ...(dia.agua === undefined ? [] : [{ k: 'a', valor: dia.agua || '—', rotulo: 'água' }])]} />
          {/* a pergunta fica depois de respondida: as respostas corrigem */}
          {comida && (c.comida !== 'com' || resposta) ? (
            <Pergunta pergunta={resposta ? 'Comida: ' + DITA[resposta] : 'A comida deste dia foi como o plano?'}
                      nota={resposta === 'naosei' ? 'Fica fora da conta, não vira zero. Toque para corrigir.'
                        : resposta ? 'Conta para os 14 dias da regra. Toque para corrigir.' : 'Sem resposta, o dia fica fora da conta. Não vira zero.'}
                      respostas={RESPOSTAS} valor={resposta} aoResponder={k => ctx.respondeODia(c.iso, k)} />
          ) : comida && c.comida === 'com' ? <Apoio>Comida marcada refeição por refeição.</Apoio> : null}
          <Acoes><Botao tipo="contorno" cheio data-a="dia-abre" onClick={() => ctx.abreDia(c.abre)}>Abrir o dia {ic.seta}</Botao></Acoes>
        </Secao>
      )}
      {ctx.moduloLigado('comida') && (
        <Secao>
          <Acoes class="v3-acoes-0"><Botao data-a="responder-dias" onClick={ctx.abreResponderDias}>Responder os dias em branco {ic.seta}</Botao></Acoes>
          <Apoio><span class="v3-n">{r14.n}</span> de {r14.de} dias fechados respondidos. A regra do nutricionista precisa de 11.</Apoio>
        </Secao>
      )}
      {(m.treino || m.horario || m.cardio.n > 0) && (
        <Secao titulo="No mês">
          <Quadros colunas={3} itens={[
            { k: 'sem', valor: m.treino && m.treino.valor ? m.treino.valor : '—', rotulo: 'dias de treino por semana' },
            { k: 'hora', valor: m.horario ? pad(m.horario.mediana) : '—', rotulo: 'horário mais comum' },
            { k: 'card', valor: String(m.cardio.n), rotulo: 'cardio no mês' }]} />
        </Secao>
      )}
      <div class="v3-fim-da-tela" />
    </div>
  );
}

/**
 * RESPONDER OS DIAS (ds-telas.js, "responder"): um dia por tela, do mais
 * recente para trás. Lilás durante (a pergunta do dia), menta no fim. As
 * âncoras são as da tela de ação: o topo com "voltar um", os segmentos, o
 * principal "Foi, sim" com "Quase" e "Não lembro" embaixo, e "os que faltam".
 */
export function ResponderDias({ ctx }) {
  const r = ctx.responderDiasV3();
  if (!r) return null;
  const segs = r.total ? <Segmentos total={r.total} feitos={r.i} rotulo={r.i + ' de ' + r.total + ' dias respondidos'} /> : null;
  if (!r.atual) {
    return (
      <TelaDeAcao cor="feito" centro segs={segs}
        topo={<><button onClick={ctx.fechaResponderDias} aria-label="Fechar" data-a="responder-sair">{ic.x}</button>
                <span class="v3-n">{r.total ? r.total + ' de ' + r.total : ''}</span><span class="v3-vazio-alvo" /></>}
        pe={<div class="v3-resp-pe">
              <Botao grande data-a="responder-veredito" onClick={() => { ctx.fechaResponderDias(); ctx.vaiPara('semana'); }}>Ver o veredito {ic.seta}</Botao>
              <Botao tipo="contorno" cheio data-a="responder-fecha" onClick={ctx.fechaResponderDias}>Voltar aos dias</Botao>
            </div>}>
        <h1 class="v3-aula-t" tabindex="-1">{r.total ? (r.total === 1 ? '1 dia respondido.' : r.total + ' dias respondidos.') : 'Nada em branco.'}</h1>
        <p class="v3-bloco-a">{r.respondidos >= 11 ? 'Já dá para a regra do nutricionista decidir.' : 'A regra do nutricionista precisa de 11 dias respondidos; hoje são ' + r.respondidos + '.'} O que ficou como “não lembro” não conta contra você.</p>
      </TelaDeAcao>
    );
  }
  return (
    <TelaDeAcao cor="corpo" centro classe="v3-resp" segs={segs}
      topo={<><button onClick={ctx.fechaResponderDias} aria-label="Fechar" data-a="responder-sair">{ic.x}</button>
              <span class="v3-n">{r.i + 1} de {r.total}</span>
              <button class="v3-topo-saida" data-a="resp-volta" disabled={r.i === 0} onClick={ctx.voltaUmNaSequencia}>voltar um</button></>}
      pe={<div class="v3-resp-pe">
            <Botao grande data-a="resp-sim" onClick={() => ctx.respondeNaSequencia('sim', false)}>Foi, sim</Botao>
            <div class="v3-resp-2">
              <Botao tipo="contorno" cheio data-a="resp-quase" onClick={() => ctx.respondeNaSequencia('quase', false)}>Quase</Botao>
              <Botao tipo="contorno" cheio data-a="resp-naosei" onClick={() => ctx.respondeNaSequencia('naosei', false)}>Não lembro</Botao>
            </div>
          </div>}
      links={r.total - r.i > 1 && <button data-a="resp-todos" onClick={() => ctx.respondeNaSequencia('sim', true)}>Todos os que faltam foram como o plano</button>}>
      <h1 class="v3-aula-t" tabindex="-1">{r.atual.curto}</h1>
      <p class="v3-serie-q v3-resp-l">{r.atual.teve} A comida foi como o plano?</p>
      {r.atual.resposta && <p class="v3-medir-f" data-a="resp-ja">Você respondeu “{({ sim: 'foi, sim', quase: 'quase', naosei: 'não lembro' })[r.atual.resposta]}”. Toque em outra para trocar.</p>}
    </TelaDeAcao>
  );
}
