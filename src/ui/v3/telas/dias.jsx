// Dias. A grade lê os registros do mês; a resposta de frequência só vem da pessoa.
import { CartaoRegistro } from './registrotreino.jsx';
import { ic } from '../icones.jsx';
import { Acoes, Apoio, Botao, Cabecalho, Pergunta, Quadros, Secao, Segmentos, TelaDeAcao } from '../base.jsx';

const RESPOSTAS = [{ k: 'sim', t: 'Foi, sim' }, { k: 'quase', t: 'Quase' }, { k: 'naosei', t: 'Não lembro' }];
const DITA = { sim: 'foi como o plano', quase: 'quase como o plano', naosei: 'não lembro' };
const COMIDA = { sim: 'No plano', quase: 'Quase', naosei: 'Não lembro', com: 'Por refeição' };

function Arco({ turno }) {
  const x = { manha: 3, tarde: 15, noite: 27 }[turno];
  return <svg class="v3-cal-arco" viewBox="0 0 30 14" aria-hidden="true">
    <path d="M3 10 Q15 0 27 10" fill="none" stroke="currentColor" stroke-width="1.3" opacity=".35" />
    <circle cx={x} cy={turno === 'tarde' ? 5 : 10} r="2.6" fill="currentColor" />
  </svg>;
}

function Celula({ dia: d, comida, escolhida, escolher }) {
  const tipo = d.principal === 'HX' ? 'hx' : d.principal ? 'treino' : d.descanso ? 'desc' : d.falta ? 'falta' : 'aberto';
  const texto = d.principal || (d.descanso ? 'desc' : d.falta ? 'falta' : '?');
  return <button class={'v3-dia' + (d.hoje ? ' hoje' : '')} data-comida={comida && d.resposta || undefined} disabled={d.futuro}
    data-a={'dia-' + d.iso} aria-label={d.rotulo} aria-pressed={escolhida} onClick={() => escolher(d.iso)}>
    <small>{d.n}</small>
    {!d.futuro && <>
      {d.periodo && <Arco turno={d.periodo.k} />}
      {d.segunda ? <span class="v3-cal-dupla">{[texto, d.segunda].map((l, i) =>
        <span key={i} class={'v3-cal-bola ' + (l === 'HX' ? 'hx' : 'treino') + (l.length > 2 ? ' longa' : '') + (i === 1 && d.cardio ? ' cardio' : '')}>{l}</span>)}</span>
        : <span class={'v3-cal-bola ' + tipo + (d.cardio ? ' cardio' : '') + (texto.length > 2 ? ' longa' : '')}>{texto}</span>}
      {(d.fotos || d.medidas) && <span class="v3-cal-corpo" aria-hidden="true">{d.fotos && ic.camera}{d.medidas && ic.medida}</span>}
    </>}
  </button>;
}

function Legenda({ comida }) {
  return <div class="v3-cal-leg" role="group" aria-label="Legenda do mês">
    <span><i class="treino">A</i>treino</span><span><i class="hx">HX</i>HYROX</span>
    <span><i>desc</i>descanso</span><span><i class="falta">falta</i>falta</span><span><i>?</i>sem resposta</span>
    {comida && <><span><i data-comida="sim" />comida no plano</span><span><i data-comida="quase" />quase</span></>}
    <span><i class="cardio" />cardio</span><span><Arco turno="manha" />turno</span>
    <span>{ic.camera}fotos</span><span>{ic.medida}medidas</span>
  </div>;
}

function DiaEscolhido({ ctx, c, comida }) {
  const dia = ctx.resumoDoDiaV3(c.iso);
  const extras = [c.fotos && 'fotos', c.medidas && 'medidas'].filter(Boolean);
  const resposta = c.resposta;
  const treino = c.principal === 'HX' ? 'HYROX' : dia.treino?.titulo || (c.principal ? 'Treino fora' : c.descanso ? 'Descanso' : c.falta ? 'Falta' : '?');

  const nada = !c.hoje && !c.principal && !c.descanso && !c.falta && !c.cardio;
  return <Secao classe="v3-cal-det" titulo={c.rotulo.split(':')[0] + (c.hoje ? ' · hoje' : '')} nota={nada ? 'sem nada registrado' : null}>
    {(c.principal || c.descanso || c.falta || dia.peso || resposta) ? <Quadros colunas={comida ? 3 : 2} itens={[
      { k: 't', valor: treino, rotulo: c.outrosTreinos || dia.treino?.apoio || (c.principal ? 'fora da prescrição' : c.falta ? c.falta.motivo || 'sem motivo dito' : 'sem treino'), aoTocar: () => ctx.abreDia(c.abre) },
      { k: 'p', valor: dia.peso || '—', unidade: dia.peso ? 'kg' : null, rotulo: 'peso' },
      ...(comida ? [{ k: 'c', valor: COMIDA[resposta] || '—', rotulo: resposta ? 'comida' : 'comida sem resposta' }] : [])]} /> : null}
    {extras.length > 0 && <Apoio>Também: {extras.join(' · ')}</Apoio>}
    <CartaoRegistro ctx={ctx} data={c.iso} />
    {comida && (resposta === 'com' ? <Apoio>Comida marcada refeição por refeição.</Apoio> :
      <Pergunta pergunta={resposta ? 'Comida: ' + DITA[resposta] : 'A comida deste dia foi como o plano?'}
        nota={resposta === 'naosei' ? 'Fica fora da conta, não vira zero. Toque para corrigir.'
          : resposta ? 'Conta para os 14 dias da regra. Toque para corrigir.' : 'Sem resposta, o dia fica fora da conta. Não vira zero.'}
        respostas={RESPOSTAS} valor={resposta} aoResponder={k => ctx.respondeODia(c.iso, k)} />)}
    <Acoes><Botao tipo="contorno" cheio data-a="dia-abre" onClick={() => ctx.abreDia(c.abre)}>Abrir o dia {ic.seta}</Botao></Acoes>
  </Secao>;
}

export function DiasV3({ ctx }) {
  const m = ctx.mes();
  const vividos = m.celulas.filter(c => !c.futuro);
  const fechados = vividos.filter(c => !c.hoje);
  const c = vividos.find(x => x.iso === m.escolhido) || vividos[vividos.length - 1];
  const comida = ctx.moduloLigado('comida');
  const treinos = vividos.filter(x => x.principal).length;
  const r14 = ctx.respondidosV3();
  const nav = <div class="v3-mes-nav">
    <button data-a="mes-anterior" onClick={() => ctx.mudaMes(-1)} aria-label={'Mês anterior: ' + m.anterior}>{ic.volta}</button>
    <b>{m.titulo}</b>
    <button data-a="mes-proximo" disabled={!m.podeAvancar} onClick={() => ctx.mudaMes(1)} aria-label={'Próximo mês: ' + m.proximo}>{ic.dir}</button>
  </div>;
  return <div class="v3 v3-dias">
    <Cabecalho titulo="Dias" raiz acao={nav} />
    <div class="v3-cal-resumo">
      <div><b>{treinos}</b><span>{treinos === 1 ? 'treino' : 'treinos'} em {vividos.length} {vividos.length === 1 ? 'dia' : 'dias'}</span></div>
      {comida && <div><b>{fechados.filter(x => x.resposta).length}<small> de {fechados.length}</small></b><span>dias com a comida respondida</span></div>}
      <div><b>{m.horario?.mediana.padStart(5, '0') || '—'}</b><span>horário mais comum</span></div>
      {m.ate && <small>{m.ate}</small>}
    </div>
    <div class="v3-cal v3-cal-h" aria-hidden="true">{m.dias.map((d, i) => <span key={i}>{d.charAt(0).toUpperCase()}</span>)}</div>
    <div class="v3-cal" role="group" aria-label={m.titulo}>
      {Array.from({ length: m.offset }, (_, i) => <span key={i} />)}
      {m.celulas.map(x => <Celula key={x.iso} dia={x} comida={comida} escolhida={x.iso === c?.iso} escolher={ctx.escolheDiaDoMes} />)}
    </div>
    <Legenda comida={comida} />
    {c && <DiaEscolhido key={c.iso} ctx={ctx} c={c} comida={comida} />}
    {comida && <Secao>
      <Acoes class="v3-acoes-0"><Botao data-a="responder-dias" onClick={ctx.abreResponderDias}>Responder os dias em branco {ic.seta}</Botao></Acoes>
      <Apoio><span class="v3-n">{r14.n}</span> de {r14.de} dias fechados respondidos. A regra do nutricionista precisa de 11.</Apoio>
    </Secao>}
    <div class="v3-fim-da-tela" />
  </div>;
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
