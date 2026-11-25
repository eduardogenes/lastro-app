// O TREINO EM FOCO no visual novo (Fase 3): uma série por tela, o descanso
// em tela cheia que enche de cor, o fim, e as folhas da lista do treino, de
// mudar o exercício e das opções da sessão. Protótipo: docs/redesign-3/
// prototipos/treino.html. Dados: `ctx.focoV3`, `ctx.descansoV3`,
// `ctx.listaV3`, `ctx.mudarExV3` e `ctx.menuDaSessao`, em src/main.jsx.
//
// Nenhuma gravação nasce aqui: "Feita" chama `ctx.fazSerieV3`, que grava pela
// porta de sempre do modo antigo (`anotaSerie`).

import { useState } from 'preact/hooks';
import { ic } from '../icones.jsx';
import { Acoes, Apoio, Botao, Caixa, Cabecalho, Chave, Folha, Linha, Par, Pequeno, Respostas, Saida, Secao, Segmentos, TelaDeAcao } from '../base.jsx';
import { Regua } from '../regua.jsx';
import { useAgora } from '../agora.js';
import { podeDissolver } from '../../movimento.js';
import { MidiaDaSerie, MidiaDaEstacao, VideosDoPar } from './midia.jsx';

const virgula = n => String(Math.round(n * 100) / 100).replace('.', ',');
const relogio = ms => { const s = Math.max(0, Math.ceil(ms / 1000)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
/** O relógio da sessão, no topo: mm:ss com dois dígitos ("03:41"), ou h:mm:ss passando de uma hora. */
const relogioDaSessao = ms => {
  const s = Math.max(0, Math.floor(ms / 1000)), h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60;
  return (h ? h + ':' : '') + String(m).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
};
/** "3min" do dado vira "3 min" na frase. */
const comEspaco = t => String(t || '').replace(/(\d)\s*(min|s)\b/g, '$1 $2');
/** O tempo por extenso, para o leitor de tela: "1 minuto e 50 segundos". */
const porExtenso = ms => {
  const s = Math.max(0, Math.ceil(ms / 1000)), m = Math.floor(s / 60), r = s % 60;
  const mm = m ? m + (m === 1 ? ' minuto' : ' minutos') : '', ss = r ? r + (r === 1 ? ' segundo' : ' segundos') : '';
  return [mm, ss].filter(Boolean).join(' e ') || '0 segundos';
};

export function TreinoEmFoco({ ctx }) {
  const fim = ctx.fimV3();
  if (fim) return <TreinoEncerrado ctx={ctx} f={fim} />;
  const des = ctx.descansoV3();
  if (des) return <Descanso ctx={ctx} des={des} />;
  const aula = ctx.aulaV3();
  if (aula) return <Aula ctx={ctx} t={aula} />;
  const f = ctx.focoV3();
  if (!f) return null;
  if (f.fim) return <FimDoTreino ctx={ctx} f={f} />;
  // uma montagem por série: a régua parte do valor daquela série
  if (f.par) return <ParCircuito key={f.dia + '-' + f.i + '-' + f.k} ctx={ctx} f={f} />;
  return <Serie key={f.dia + '-' + f.i + '-' + f.k} ctx={ctx} f={f} />;
}

/**
 * O topo de todo passo do treino (série, descanso, fim): recolher, o treino e
 * o relógio da sessão, a lista. É âncora: fica idêntico entre os passos (a
 * contagem de séries está nos segmentos, logo abaixo).
 */
function Topo({ ctx, f, rotulo, ms }) {
  useAgora();
  const nome = rotulo || (f ? 'Treino ' + f.dia : 'Treino');
  const t = ms != null ? ms : ctx.relogioDoTreinoV3();
  return (
    <>
      <button onClick={ctx.fechaModoDeSessao} data-a="sai-do-modo" aria-label="Recolher o treino, deixando-o aberto">{ic.baixo}</button>
      <span>{nome} · <span class="v3-n">{relogioDaSessao(t)}</span></span>
      <button onClick={() => ctx.abreFolha({ k: 'listaTreino' })} data-a="lista-treino" aria-label="Ver os exercícios do treino">{ic.lista}</button>
    </>
  );
}

/** Os segmentos do treino inteiro: uma série por traço. */
function SegsDoTreino({ f }) {
  if (!f || !f.prescritas) return null;
  return <Segmentos total={f.prescritas} feitos={Math.min(f.feitas, f.prescritas)} rotulo={f.feitas + ' de ' + f.prescritas + ' séries'} />;
}

/**
 * As séries deste exercício, em fichas: as feitas com o número, a de agora em
 * destaque, as que vêm só com o número da ordem.
 */
function Feitas({ f }) {
  return (
    <div class="v3-feitas" aria-label={'Séries de ' + f.ex.n}>
      {f.estados.map(e => e.feita
        ? <span key={e.k} class={'f v3-n' + (e.k === f.k ? ' a' : '')}>{ic.ok}{e.txt}</span>
        : e.k === f.k ? <span key={e.k} class="a v3-n">série {e.k + 1}</span>
        : <span key={e.k} class="v3-n">{e.k + 1}</span>)}
    </div>
  );
}

/**
 * A PEGADA E OS PÉS, numa linha com ícone sob o nome: o que o treinador
 * escreveu ("pegada: neutra na corda") ou, sem isso, o que o catálogo sabe.
 * O resto da dica segue no "Treinador:".
 */
function Pegada({ pegada, pes, compacta }) {
  if (!pegada && !pes) return null;
  return (
    <div class={'v3-peg' + (compacta ? ' p' : '')}>
      {pegada && <p><span class="v3-peg-i" aria-hidden="true">{ic.mao}</span><span><span class="so-leitor">Pegada: </span>{pegada}</span></p>}
      {pes && <p><span class="v3-peg-i" aria-hidden="true">{ic.pe}</span><span><span class="so-leitor">Pés: </span>{pes}</span></p>}
    </div>
  );
}

/**
 * UMA SÉRIE POR TELA (ds-telas.js, "serie"). Já vem com a carga e a repetição
 * da última vez: igual, um toque em "Feito". O par carga × repetição fica
 * lado a lado e UMA régua embaixo muda o que estiver escolhido (repetição, de
 * saída); cabe sem rolar, com tudo o que se aperta ao alcance do polegar.
 */
function Serie({ ctx, f }) {
  const [carga, setCarga] = useState(f.carga);
  const [reps, setReps] = useState(f.reps);
  const [sobe, setSobe] = useState(null);
  const [qual, setQual] = useState('reps');
  const ex = f.ex;
  const comCarga = !ex.semCarga;
  const aceitaSubir = () => { setCarga(f.sobe); setSobe(true); setQual('carga'); };
  // "reps" é a abreviação do dado; na tela, a palavra inteira
  const medida = ex.medida === 'reps' ? 'repetições' : ex.medida;
  const faixa = ex.faixa ? ex.faixa.replace(/-/g, '–') + ' ' + medida : '';
  const linha = [faixa, ex.rir ? 'sobrando ' + ex.rir.replace(/-/g, '–') : ''].filter(Boolean).join(', ');
  // um aviso por vez, no alto: dor, intervalo longo, ou a sugestão de subir
  const falhou = ctx.naoGuardado();
  const aviso = falhou ? (
    <Caixa tom="atencao" data-a="serie-falhou" titulo="A série não foi guardada."
           nota="O aparelho recusou a gravação. Os números continuam aqui.">
      <Pequeno cheio data-a="serie-tenta" onClick={ctx.tentaGravar}>Tentar de novo</Pequeno>
      <Pequeno data-a="serie-copia" onClick={ctx.copiaRegistro}>Copiar em texto</Pequeno>
    </Caixa>
  ) : f.dor ? (
    <Caixa tom="atencao" titulo={'Dor seguida: ' + f.dor.o} nota={f.dor.datas + '. O treinador pede para não forçar.'}>
      <Pequeno cheio data-a="dor-pula" onClick={() => ctx.acoesEx.pularEx(f.i)}>Pular hoje</Pequeno>
      <Pequeno data-a="dor-faz" onClick={() => ctx.acoesEx.aceitaDor(f.i)}>Fazer mesmo assim</Pequeno>
    </Caixa>
  ) : f.intervalo ? (
    <Caixa tom="atencao" data-a="aviso-intervalo" titulo={'Faz ' + f.intervalo.minutos + (f.intervalo.minutos === 1 ? ' minuto' : ' minutos') + ' desde a última série. Fez outras nesse tempo?'}
           nota={ex.descanso ? 'O descanso aqui é de ' + comEspaco(ex.descanso) + '.' : null}>
      <Pequeno cheio data-a="intervalo-em-dia" onClick={ctx.abrePorEmDia}>Pôr em dia</Pequeno>
      <Pequeno data-a="intervalo-parei" onClick={ctx.dispensaIntervalo}>Não, só parei</Pequeno>
    </Caixa>
  ) : f.sobe && sobe == null ? (
    <Caixa titulo={'Subir para ' + virgula(f.sobe) + ' ' + ex.unidade + '?'} data-a="sugestao-subir"
           nota={f.sobeNota && f.sobeNota.topo && f.sobeNota.carga != null
             ? 'Na última vez você fez ' + f.sobeNota.topo + ' em todas as séries com ' + virgula(f.sobeNota.carga) + '. É a regra do treinador: com a carga nova, o alvo volta para ' + f.sobeNota.comeco + ' a ' + f.sobeNota.topo + '.'
             : 'Na última vez, todas as séries chegaram ao topo da faixa. É a regra do treinador: com a carga nova, o alvo volta para o começo.'}>
      <Pequeno contorno data-a="sobe-mantem" onClick={() => setSobe(false)}>Manter</Pequeno>
      <Pequeno cheio data-a="sobe-sobe" onClick={aceitaSubir}>Subir</Pequeno>
    </Caixa>
  ) : null;
  return (
    <TelaDeAcao cor="treino" topo={<Topo ctx={ctx} f={f} />} segs={<SegsDoTreino f={f} />}
      antes={<>
        {!aviso && f.k === 0 && ex.cue && <p class="v3-dica"><b>Treinador:</b> {ex.cue}</p>}
        <Feitas f={f} />
        {aviso}
      </>}
      pe={<Botao grande data-a="serie-feita" onClick={() => ctx.fazSerieV3(carga, reps)}>{ic.ok} {f.jaFeita ? 'Corrigir' : 'Feito'}</Botao>}
      links={<>
        <button data-a="mudar-ex" onClick={() => ctx.abreFolha({ k: 'mudarEx', i: f.i })}>Mudar</button>
        <button data-a="ja-fiz-mais" onClick={ctx.abrePorEmDia}>Já fiz mais do que anotei</button>
        <button data-a="historico-ex" onClick={() => ctx.abreExercicioV3(f.dia, f.i)}>Histórico</button>
      </>}>
      <MidiaDaSerie ctx={ctx} m={f.midia} />
      <h1 class="v3-serie-n" tabindex="-1">{ex.n}</h1>
      {linha && <p class="v3-serie-q">{linha}</p>}
      <Pegada pegada={f.pegada} pes={f.pes} />
      {comCarga
        ? <Par escolhido={qual} aoEscolher={setQual} itens={[
            { k: 'carga', rotulo: ex.unidade, valor: virgula(carga) },
            { k: 'reps', rotulo: medida, valor: reps }]} />
        : <Par escolhido="reps" aoEscolher={() => {}} itens={[{ k: 'reps', rotulo: medida, valor: reps }]} />}
      {comCarga && qual === 'carga'
        ? <Regua key="carga" min={0} max={Math.max(60, Math.ceil(carga * 2 / 10) * 10)} passo={f.passoCarga} cada={f.passoCarga >= 2.5 ? 10 : 5}
                 largura={16} valor={carga} aoMudar={setCarga} rotulo={'carga em ' + ex.unidade} passos={false} />
        : <Regua key="reps" min={1} max={Math.max(30, reps + 15)} passo={1} cada={5} largura={30} valor={reps} aoMudar={setReps}
                 rotulo={medida} passos={false} />}
      <p class="v3-serie-ant">{f.antes ? <>da última vez: <span class="v3-n">{f.antes}</span></> : 'exercício novo: sem histórico'}</p>
    </TelaDeAcao>
  );
}

/** Um número com − e + grandes, para a mão que segura a alça do aparelho. */
function Passo({ rotulo, valor, txt, passo, min = 0, aoMudar, id }) {
  const muda = d => aoMudar(Math.max(min, Math.round((valor + d) * 100) / 100));
  return (
    <div class="v3-step" role="group" aria-label={rotulo}>
      <small>{rotulo}</small>
      <output class="v3-step-v v3-n" aria-live="polite" id={id}>{txt != null ? txt : valor}</output>
      <div class="v3-step-b">
        <button data-a={id + '-menos'} aria-label={'Menos ' + virgula(passo) + ' em ' + rotulo} disabled={valor - passo < min} onClick={() => muda(-passo)}>−</button>
        <button data-a={id + '-mais'} aria-label={'Mais ' + virgula(passo) + ' em ' + rotulo} onClick={() => muda(passo)}>+</button>
      </div>
    </div>
  );
}

/**
 * O CRONÔMETRO DO PAR COM TEMPO (alongamento 40 s por lado): começa no toque,
 * conta, e no fim do primeiro lado passa sozinho para o outro.
 */
function Cronometro({ segundos, lados }) {
  const agora = useAgora();
  const [fim, setFim] = useState(null);
  const [lado, setLado] = useState(0);
  const nomes = lados ? ['Esquerda', 'Direita'] : null;
  const falta = fim ? Math.max(0, fim - agora) : segundos * 1000;
  if (fim && falta === 0) {
    if (nomes && lado === 0) { setLado(1); setFim(null); try { navigator.vibrate && navigator.vibrate(200); } catch (e) { /* sem vibração */ } }
    else { setFim(null); setLado(nomes ? 2 : 1); try { navigator.vibrate && navigator.vibrate([200, 100, 200]); } catch (e) { /* idem */ } }
  }
  const acabou = nomes ? lado > 1 : lado > 0;
  return (
    <div class="v3-cron" role="group" aria-label="Cronômetro">
      {nomes && <div class="v3-cron-l">{nomes.map((n, j) => <span key={n} class={j === lado ? 'a' : j < lado ? 'f' : ''}>{j < lado ? ic.ok : null}{n}</span>)}</div>}
      <div class="v3-cron-t v3-n" role="timer" aria-live="off">{acabou ? 'Pronto' : relogio(falta)}</div>
      {!acabou && <Pequeno contorno data-a="cron-comeca" onClick={() => setFim(fim ? null : Date.now() + segundos * 1000)}>
        {fim ? 'Parar' : (nomes ? 'Começar ' + nomes[lado].toLowerCase() : 'Começar') + ' · ' + segundos + ' s'}</Pequeno>}
    </div>
  );
}

/**
 * O PAR EM CIRCUITO (bi-set, protótipo de 24/11): as duas estações lado a lado,
 * com o mesmo tamanho; a da vez em destaque, a outra a um toque (aparelho
 * ocupado: começa por ela). A grade de rodadas mostra o par inteiro. O
 * registro é com − e +, para uma mão. "Feito" diz para onde vai.
 */
function ParCircuito({ ctx, f }) {
  const p = f.par;
  const eu = p.estacoes[p.lado === 'a' ? 0 : 1];
  const outra = p.estacoes[p.lado === 'a' ? 1 : 0];
  const [carga, setCarga] = useState(f.carga);
  const [reps, setReps] = useState(f.reps);
  const ex = f.ex;
  const comCarga = !ex.semCarga && !p.tempo;
  const medida = ex.medida === 'reps' ? 'repetições' : ex.medida;
  const falhou = ctx.naoGuardado();
  const q = p.sozinha ? (outra.fechou ? outra.n + ' já fechou: esta é sozinha' : 'só esta estação nesta rodada')
    : p.rodada === p.rodadas ? 'última rodada · alternando' : 'alternando, sem pausa no meio';
  const estacao = (e, j) => (
    <button key={e.i} class={'v3-est' + (e.ativa ? ' a' : '') + (e.fechou ? ' ok' : '') + (e.fora ? ' fora' : '')}
            data-a={'par-est-' + (j + 1)} disabled={e.ativa || e.fechou || e.fora}
            aria-current={e.ativa ? 'step' : undefined}
            aria-label={e.ativa ? undefined : e.fechou ? e.n + ': todas as séries feitas' : 'Começar por ' + e.n + ' nesta rodada'}
            onClick={e.ativa ? undefined : ctx.trocaVezV3}>
      <MidiaDaEstacao m={e.midia} ativa={e.ativa} />
      <span class="v3-est-k">{e.fora ? 'pulado' : e.fechou ? 'fechou · ' + (j + 1) : e.ativa ? 'agora · ' + (j + 1) : 'a seguir · ' + (j + 1)}</span>
      <b>{e.n}</b>
      <Pegada pegada={e.pegada} pes={e.pes} compacta />
      <span class="v3-est-v v3-n">{e.fechou ? e.series + ' de ' + e.series : e.semCarga && !(e.carga > 0) ? e.reps + (e.seg ? ' s' : '') : <>{virgula(e.carga)}<small> {e.unidade.split(' ')[0]}</small> × {e.reps}</>}</span>
    </button>
  );
  return (
    <TelaDeAcao cor="fundo" cima classe="v3-circ" topo={<Topo ctx={ctx} f={f} />} segs={<SegsDoTreino f={f} />}
      antes={falhou && (
        <Caixa tom="atencao" data-a="serie-falhou" titulo="A série não foi guardada." nota="O aparelho recusou a gravação. Os números continuam aqui.">
          <Pequeno cheio data-a="serie-tenta" onClick={ctx.tentaGravar}>Tentar de novo</Pequeno>
          <Pequeno data-a="serie-copia" onClick={ctx.copiaRegistro}>Copiar em texto</Pequeno>
        </Caixa>
      )}
      pe={<Botao grande data-a="serie-feita" onClick={() => ctx.fazSerieV3(comCarga ? carga : (ex.semCarga ? 0 : carga), reps)}>
        {ic.ok} {f.jaFeita ? 'Corrigir' : 'Feito'}
        {!f.jaFeita && <small class="v3-par-dep">{ic.seta}<span>{p.depois.k === 'segue' ? p.depois.n : 'descanso ' + comEspaco(p.depois.txt)}</span></small>}
      </Botao>}
      links={<>
        <button data-a="mudar-ex" onClick={() => ctx.abreFolha({ k: 'mudarEx', i: f.i })}>Mudar</button>
        <button data-a="par-separa" onClick={() => ctx.abreFolha({ k: 'separaPar', i: f.i })}>Separar hoje</button>
        <button data-a="historico-ex" onClick={() => ctx.abreExercicioV3(f.dia, f.i)}>Histórico</button>
      </>}>
      <div class="v3-par-h">
        <span class="v3-par-id">{ic.gira}Par {p.n}</span>
        <span class="v3-par-q">{q}</span>
      </div>
      <h1 class="so-leitor" tabindex="-1">{ex.n}, série {f.k + 1} de {ex.series}</h1>
      <div class="v3-rod" role="img" aria-label={'Rodada ' + p.rodada + ' de ' + p.rodadas + '. ' + p.estacoes.map(e => e.n + ': ' + e.feitas + ' de ' + e.series).join('. ')}>
        {p.estacoes.map(e => (
          <div key={e.i} class="v3-rod-l"><b>{e.n}</b>
            <span class="v3-pts">{e.pontos.map((t, k) => <i key={k} class={t} />)}</span></div>
        ))}
        <div class="v3-rod-t"><span>rodada {p.rodada} de {p.rodadas}</span><span>descanso de {comEspaco(p.descanso)} depois da estação 2</span></div>
      </div>
      <div class="v3-ests">
        {estacao(p.estacoes[0], 0)}
        <span class="v3-ests-seta" aria-hidden="true">{ic.dir}</span>
        {estacao(p.estacoes[1], 1)}
      </div>
      <VideosDoPar ctx={ctx} estacoes={p.estacoes} />
      {p.tempo
        ? <Cronometro segundos={reps} lados={!!eu.lado} />
        : <div class="v3-steps">
            {comCarga && <Passo id="par-carga" rotulo={eu.unidade} valor={carga} txt={virgula(carga)} passo={f.passoCarga} aoMudar={setCarga} />}
            <Passo id="par-reps" rotulo={medida} valor={reps} passo={1} min={1} aoMudar={setReps} />
          </div>}
      <p class="v3-serie-ant">{f.antes ? <>da última vez: <span class="v3-n">{f.antes}</span></> : 'exercício novo: sem histórico'}</p>
      {f.k === 0 && ex.cue && <p class="v3-dica"><b>Treinador:</b> {ex.cue}</p>}
    </TelaDeAcao>
  );
}

/** Separar o par só hoje: viram dois exercícios comuns, cada um com o seu descanso. */
export function FolhaSeparaPar({ ctx, f }) {
  const foco = ctx.focoV3();
  const p = foco && foco.par;
  if (!p) return null;
  const [a, b] = p.estacoes;
  return (
    <Folha titulo="Separar o par só hoje?" sub={a.n + ' e ' + b.n + ' viram dois exercícios comuns neste treino, cada um com o seu descanso. O programa continua com o par.'}
           aoFechar={ctx.fechaFolha}>
      <Acoes>
        <Botao cheio data-a="par-separa-sim" onClick={() => { ctx.fechaFolha(); ctx.separaParV3(f.i, true); }}>Separar hoje</Botao>
        <Botao tipo="contorno" cheio data-a="par-separa-nao" onClick={ctx.fechaFolha}>Manter o par</Botao>
      </Acoes>
    </Folha>
  );
}

function Descanso({ ctx, des }) {
  const agora = useAgora();
  const falta = des.fim - agora;
  const cheio = Math.max(0, Math.min(1, 1 - falta / des.total));
  const u = ctx.ultimaV3();
  const prox = ctx.focoV3();
  const agua = ctx.moduloLigado('agua');
  return (
    <TelaDeAcao cor="fundo" classe="v3-desc" centro
      fundo={<div class="v3-desc-fundo" aria-hidden="true" style={`transform:scaleY(${(podeDissolver() ? Math.floor(cheio * 10) / 10 : cheio).toFixed(3)})`} />}
      topo={<Topo ctx={ctx} f={prox} />} segs={<SegsDoTreino f={prox} />}
      pe={<Botao grande data-a="desc-pula" onClick={ctx.paraDescanso}>{falta > 0 ? 'Começar já' : 'Próxima série'}</Botao>}
      links={<>
        <Pequeno contorno data-a="desc-menos" onClick={() => ctx.ajustaDescanso(-15)} aria-label="Tirar 15 segundos">−15 s</Pequeno>
        <Pequeno contorno data-a="desc-mais" onClick={() => ctx.ajustaDescanso(15)} aria-label="Somar 15 segundos">+15 s</Pequeno>
      </>}>
      <h1 class="v3-desc-r" tabindex="-1">{prox && prox.par && u && u.par === prox.par.n ? 'descanso do par ' + prox.par.n : 'descanso'}</h1>
      <div class="v3-desc-t v3-n" role="timer" aria-live="off" aria-label={falta > 0 ? 'faltam ' + porExtenso(falta) : 'descanso acabou'}>{falta > 0 ? relogio(falta) : 'Já!'}</div>
      {u && (
        <div class="v3-sobrou">
          <p>Sobraram quantas repetições? Se quiser dizer.</p>
          <Respostas sobreFundo rotulo={'Repetições que sobraram em ' + u.n + ', série ' + u.serie} valor={u.rir} aoResponder={ctx.rirDaUltimaV3}
                     opcoes={[0, 1, 2, 3, 4].map(n => ({ k: n, t: n === 4 ? '4+' : String(n) }))} />
        </div>
      )}
      {prox && !prox.fim && prox.par && u && u.par === prox.par.n && u.equip && prox.ex.equip && u.equip !== prox.ex.equip && (
        <p class="v3-troca" data-a="desc-troca">{ic.troca}<span>Troca de aparelho: <b>{prox.ex.equip}</b> · {prox.ex.n}</span></p>
      )}
      {prox && !prox.fim && prox.par ? (
        <div class="v3-prox v3-prox-par" data-a="desc-par">
          <div class="v3-prox-t">
            <span>a seguir · par {prox.par.n} · rodada {prox.par.rodada} de {prox.par.rodadas}</span>
            {prox.par.estacoes.filter(e => !e.fora && !e.fechou).map(e => (
              <div key={e.i} class={'v3-prox-l' + (e.ativa ? ' a' : '')}>
                <b>{e.n}</b>
                <span class="v3-n">{e.semCarga && !(e.carga > 0) ? e.reps : virgula(e.carga) + ' × ' + e.reps}{e.antes ? <small>última: {e.antes}</small> : null}</span>
              </div>
            ))}
          </div>
          {agua && <Pequeno data-a="desc-agua" onClick={ctx.maisUmCopo}>Água +1</Pequeno>}
        </div>
      ) : prox && !prox.fim && (
        <div class="v3-prox">
          <div class="v3-prox-t">
            <span>a seguir · série {prox.k + 1} de {prox.ex.series}</span>
            <b>{prox.ex.n}</b>
            <span class="v3-n">{prox.ex.semCarga && !(prox.carga > 0) ? prox.reps : virgula(prox.carga) + ' × ' + prox.reps}</span>
          </div>
          {agua && <Pequeno data-a="desc-agua" onClick={ctx.maisUmCopo}>Água +1</Pequeno>}
        </div>
      )}
    </TelaDeAcao>
  );
}

function FimDoTreino({ ctx, f }) {
  const tudo = f.feitas >= f.prescritas;
  return (
    <TelaDeAcao cor="fundo" centro topo={<Topo ctx={ctx} f={f} />} segs={<SegsDoTreino f={f} />}
      pe={f.sessaoAberta
        ? <Botao grande data-a="fim-encerra" onClick={ctx.encerraTreinoV3}>Encerrar o treino</Botao>
        : <Botao grande data-a="fim-fecha" onClick={ctx.fechaModoDeSessao}>Voltar ao Hoje</Botao>}
      links={<button data-a="fim-mais" onClick={ctx.acoesAdd.abre}>Fazer mais um exercício</button>}
      classe="v3-fim">
      <p class="v3-acao-q">{f.sessaoAberta ? 'nada mais na fila' : 'nenhuma série ainda'}</p>
      <h1 class="v3-fim-t" tabindex="-1">{tudo ? 'Tudo feito.' : 'O resto foi pulado.'}</h1>
      <p class="v3-medir-f">{tudo ? 'As ' + f.prescritas + ' séries estão guardadas. Encerre para fechar o relógio.'
                                   : f.feitas + ' de ' + f.prescritas + ' séries guardadas. Encerrar grava o fim agora.'}</p>
    </TelaDeAcao>
  );
}

/** O treino encerrado: o resumo e o "vira regra?" do que mudou nele. */
function TreinoEncerrado({ ctx, f }) {
  return (
    <TelaDeAcao cor="fundo" cima classe="v3-fim" topo={<Topo ctx={ctx} rotulo={f.nome} ms={f.dur || 0} />}
      segs={<Segmentos total={Math.max(f.prescritas || 0, f.series)} feitos={f.series} rotulo={f.series + ' séries guardadas'} />}
      pe={<Botao grande data-a="encerrado-fecha" onClick={ctx.fechaFimV3}>Fechar</Botao>}
      links={f.t != null && <button data-a="encerrado-series" onClick={ctx.verSeriesDoFimV3}>Ver as séries</button>}>
      <p class="v3-acao-q">guardado{f.min != null ? ' · ' + f.min + ' min' : ''}</p>
      <h1 class="v3-fim-t" tabindex="-1">{f.series + (f.series === 1 ? ' série. ' : ' séries. ') + f.nome + ' fechado.'}</h1>
      {f.depois > 0 && <p class="v3-medir-f">{(f.depois === 1 ? 'Um exercício registrado depois' : f.depois + ' exercícios registrados depois') + ', com os números da última vez.'}</p>}
      {f.mudancas.length > 0 && (
        <div class="v3-encerrado-m">
          <div class="v3-sec-h"><h2>O que você mudou hoje</h2><small>vira regra?</small></div>
          {f.mudancas.map((m, i) => (
            <div key={m.txt} class="v3-decide">
              <p>{m.txt}</p>
              {m.impacto && <small>{m.impacto}</small>}
              <div class="v3-perg-r" role="radiogroup" aria-label={m.txt}>
                <button role="radio" aria-checked="false" data-a={'regra-hoje-' + i} onClick={() => ctx.respondeMudancaPeloToque(f.sid, i, false)}>Só hoje</button>
                <button role="radio" aria-checked="false" data-a={'regra-sempre-' + i} onClick={() => ctx.respondeMudancaPeloToque(f.sid, i, true)}>Passa a valer</button>
              </div>
            </div>
          ))}
          <Apoio>Sem resposta agora, a pergunta continua no Hoje. {f.vence ? f.vence.charAt(0).toUpperCase() + f.vence.slice(1) : ''}</Apoio>
        </div>
      )}
    </TelaDeAcao>
  );
}

/**
 * A AULA DO BOX: os movimentos de hoje, a lista rápida para o fim da aula (o
 * valor entra em todas as passadas, e a linha diz), os modelos, a última aula,
 * o texto colado e a foto da lousa.
 */
function Aula({ ctx, t }) {
  const A = ctx.acoesAulas;
  const r = t.rapido;
  const ms = ctx.relogioDoTreinoV3();
  const topo = <>
    <button onClick={ctx.fechaModoDeSessao} data-a="sai-do-modo" aria-label="Recolher a aula, deixando-a aberta">{ic.baixo}</button>
    <span>Aula do box{ms > 0 && <> · <span class="v3-n">{relogio(ms)}</span></>}</span>
    <button onClick={() => ctx.abreFolha({ k: 'menuSessao' })} data-a="menu-sessao" aria-label="Opções desta sessão">{ic.lista}</button>
  </>;
  const lousa = t.lousa && (
    <label class="v3-reg-b" data-a="aula-lousa"><b>{t.lousa.tem ? 'Lousa: tirar de novo' : 'Foto da lousa'}</b><span>{t.lousa.tem ? t.lousa.quando : 'para consultar os movimentos'}</span>
      <input type="file" accept="image/*" capture="environment" hidden onChange={e => ctx.tiraFotoDaLousa(e.currentTarget)} />
    </label>
  );
  // O COMEÇO: a aula não tem prescrição fixa; monta-se de quatro jeitos
  if (!t.movimentos) {
    return (
      <TelaDeAcao cor="corpo" cima classe="v3-aula" topo={topo}
        links={<button data-a="aula-nao-fiz" onClick={() => ctx.abreFolha({ k: 'dia' })}>Não fiz a aula hoje</button>}>
        <p class="v3-acao-q">{t.quando || 'hoje'}</p>
        <h1 class="v3-aula-t" tabindex="-1">Aula de hoje</h1>
        <p class="v3-medir-f">{t.quadro || 'Comece pelo que já sabe. Anotar é no fim, um número por movimento.'}</p>
        {t.aulas && (
          <div class="v3-reg v3-aula-sug">
            {t.aulas.ultima && <button class="v3-reg-b pri" data-a="aula-repete" onClick={A.repete}><b>Repetir a última aula</b><span>{t.aulas.ultima.quando} · {t.aulas.ultima.n} movimentos</span></button>}
            {t.aulas.modelos.map(m => <button key={m.id} class="v3-reg-b" data-a={'aula-modelo-' + m.id} onClick={() => A.aplica(m.id)}><b>{m.nome}</b><span>{m.sub}</span></button>)}
            <button class="v3-reg-b" data-a="aula-cola" onClick={() => ctx.abreFolha({ k: 'aulaTexto' })}><b>Colar o texto</b><span>do grupo do box</span></button>
            {lousa}
            <button class="v3-reg-b" data-a="aula-add" onClick={ctx.acoesAdd.abre}><b>Montar</b><span>um movimento por vez</span></button>
          </div>
        )}
      </TelaDeAcao>
    );
  }
  // A LISTA RÁPIDA: um número por movimento, no fim da aula
  return (
    <TelaDeAcao cor="corpo" cima classe="v3-aula" topo={topo}
      pe={<Botao grande data-a="aula-guarda" onClick={ctx.encerraTreinoV3}>{ic.ok} Guardar a aula</Botao>}
      links={t.aulas && t.aulas.podeSalvar && <button data-a="aula-salva" onClick={A.salva}>Guardar como modelo</button>}>
      <h1 class="v3-serie-n" tabindex="-1">{t.nome}</h1>
      <p class="v3-serie-q">{t.quadro || 'Toque no número para mudar; vale para todas as passadas.'}</p>
      {r && r.linhas.length > 0 && (
        <div class="v3-aula-l">
          {r.linhas.map(l => (
            <div key={l.i} class="v3-rapida">
              <span class="v3-lin-t"><b>{l.nome}</b><span>{l.prescricao}{l.nota ? ' · ' + l.nota : ''}</span></span>
              <label class="v3-rapida-c"><input id={'rapida-c-' + l.i} inputmode="decimal" value={l.carga} aria-label={'Carga de ' + l.nome + ' em ' + l.unidade}
                     onChange={e => ctx.anotaRapidaV3(l.i, 0, e.currentTarget.value)} /><small>{l.unidade}</small></label>
              <label class="v3-rapida-c"><input id={'rapida-v-' + l.i} inputmode="numeric" value={l.valor} aria-label={l.nome + ' em ' + l.medida}
                     onChange={e => ctx.anotaRapidaV3(l.i, 1, e.currentTarget.value)} /><small>{l.medida}</small></label>
            </div>
          ))}
        </div>
      )}
      <Acoes>
        <Botao tipo="contorno" cheio data-a="aula-add" onClick={ctx.acoesAdd.abre}>{ic.mais} Movimento</Botao>
        <Botao tipo="contorno" cheio data-a="aula-por-serie" onClick={() => ctx.setAulaPorSerie(true)}>Série por série</Botao>
      </Acoes>
      {t.lousa && t.lousa.tem && (
        <div class="v3-aula-lousa">
          {t.lousa.url && <img class="v3-ex-foto" src={t.lousa.url} alt="Foto da lousa do box" />}
          <div class="v3-saidas">
            {lousa && <label class="v3-saida">Tirar de novo<input type="file" accept="image/*" capture="environment" hidden onChange={e => ctx.tiraFotoDaLousa(e.currentTarget)} /></label>}
            {t.lousa.podeMandar && <Saida onClick={ctx.mandaLousa}>Mandar a lousa</Saida>}
          </div>
        </div>
      )}
    </TelaDeAcao>
  );
}

// ---------- as folhas ----------

/** A lista do treino: onde está cada exercício, e tocar leva para ele. */
export function FolhaListaTreino({ ctx }) {
  const l = ctx.listaV3();
  if (!l) return null;
  return (
    <Folha titulo={l.nome} sub={l.exercicios.reduce((n, x) => n + x.feitas, 0) + ' de ' + l.exercicios.reduce((n, x) => n + x.series, 0) + ' séries. Toque num exercício para ir até ele.'}
           aoFechar={() => ctx.fechaFolha()}>
      <div class="v3-lista-t">
        {l.exercicios.map((x, j) => {
          const linha = y => (
            <Linha key={y.i} marca={y.feito ? ic.ok : y.i + 1} marcaTom={y.feito ? 'f' : y.atual ? 'a' : null} titulo={y.n} quieta={y.pulado} semSeta
                   apoio={y.pulado ? 'pulado hoje' : y.series + (y.series === 1 ? ' série' : ' séries') + ' · ' + y.feitas + (y.feitas === 1 ? ' feita' : ' feitas') + (y.par && y.par.separado ? ' · sozinho hoje' : '')}
                   data-a={'lista-ex-' + y.i} aria-label={y.n + (y.atual ? ', agora' : y.feito ? ', feito' : '') + '. Ir para este exercício'}
                   aoTocar={() => { ctx.fechaFolha(); ctx.setFocoV3(y.i, y.feito ? 0 : y.proxima); }} />
          );
          if (x.par && x.par.lado === 'b') return null;
          if (!x.par) return linha(x);
          const y = l.exercicios[j + 1];
          const agora = x.atual || (y && y.atual);
          return (
            <div key={'par-' + x.par.n} class={'v3-par-bl' + (agora ? ' a' : '') + (x.par.separado ? ' sep' : '')} data-a={'lista-par-' + x.par.n}
                 role="group" aria-label={'Par ' + x.par.n + (x.par.separado ? ', separado hoje' : ', alternando')}>
              <p class="v3-par-bl-h">{ic.gira}<b>Par {x.par.n}</b><span>{x.par.separado ? 'separado hoje' : agora ? 'agora · alternando' : 'alternando · ' + l.descansoDoPar(x.par.n) + ' depois do par'}</span></p>
              {linha(x)}
              {y && linha(y)}
            </div>
          );
        })}
      </div>
      {l.deload && <Chave titulo={l.deload.rotulo} apoio={l.deload.detalhe} ligada={l.deload.ligado} data-a="lista-deload"
                          aoMudar={on => ctx.setDeload(on)} />}
      <Acoes>
        <Botao tipo="contorno" data-a="lista-opcoes" onClick={() => { ctx.fechaFolha(); ctx.abreFolha({ k: 'menuSessao' }); }}>Opções</Botao>
        <Botao tipo="contorno" cheio data-a="lista-encerra" onClick={() => { ctx.fechaFolha(); ctx.encerraTreinoV3(); }}>Encerrar o treino</Botao>
      </Acoes>
    </Folha>
  );
}

/**
 * PÔR EM DIA, a tela (ds-telas.js, "por-em-dia"): treinou e não anotou. Cada
 * exercício que falta numa linha: marcar é "fiz", e ele entra com todas as
 * séries que faltam, as repetições da última vez e a carga do passo (acerte se
 * mudou). Fica marcado como "registrado depois" e conta igual. É tela, não
 * folha: é lista que rola. "Fiz tudo como da última vez" grava tudo de uma vez.
 */
export function PorEmDiaV3({ ctx }) {
  const v = ctx.estadoPorEmDia();
  const lista = ctx.porEmDiaV3() || [];
  if (!v) return null;
  const n = lista.filter(x => !x.ja && v.marcados[x.i]).length;
  const falta = lista.filter(x => !x.ja).length;
  const cargaDe = x => v.cargas[x.i] != null ? v.cargas[x.i] : x.carga;
  return (
    <>
      <Cabecalho titulo="Pôr em dia" aoVoltar={ctx.fechaPorEmDia} nota={n ? (n === 1 ? '1 marcado' : n + ' marcados') : null} />
      <Secao>
        <Apoio>Marque o que você fez. Cada um entra com as repetições da última vez; acerte a carga se mudou. Fica anotado como “registrado depois”.</Apoio>
        {!falta
          ? <p class="v3-medir-f">Nada a pôr em dia: as séries que faltam não têm número de onde partir.</p>
          : <>
            <Acoes><Botao tipo="contorno" cheio data-a="emdia-tudo" onClick={() => ctx.guardaPorEmDia(true)}>{ic.ok} Fiz tudo como da última vez</Botao></Acoes>
            <div class="v3-emdia">
              {lista.map(x => {
                if (x.ja) return (
                  <div key={x.i} class="v3-emdia-l ja">
                    <span class="v3-emdia-ck" role="checkbox" aria-checked="true" aria-disabled="true" aria-label={x.n + ': já anotado'}>{ic.ok}</span>
                    <span class="v3-emdia-n"><b>{x.n}</b><span>já anotado</span></span>
                  </div>
                );
                const on = !!v.marcados[x.i];
                const c = cargaDe(x);
                return (
                  <div key={x.i} class={'v3-emdia-l' + (on ? ' on' : '')}>
                    <button class="v3-emdia-ck" role="checkbox" aria-checked={on ? 'true' : 'false'} data-a={'emdia-' + x.i}
                            aria-label={x.n + ': fiz'} onClick={() => ctx.marcaPorEmDia(x.i)}>{ic.ok}</button>
                    <span class="v3-emdia-n"><b>{x.n}</b>
                      <span class="v3-n">{x.series.length === 1 ? '1 série' : x.series.length + ' séries'} · {x.series.map(s => s.reps).join(' ')} rep</span></span>
                    {!x.semCarga && (
                      <span class="v3-passo-c" role="group" aria-label={'Carga de ' + x.n}>
                        <button data-a={'emdia-menos-' + x.i} aria-label={'Menos ' + virgula(x.passo) + ' ' + x.unidade}
                                onClick={() => ctx.cargaPorEmDia(x.i, Math.max(0, Math.round((c - x.passo) * 100) / 100))}>−</button>
                        <b class="v3-n" aria-live="polite">{virgula(c)}</b>
                        <button data-a={'emdia-mais-' + x.i} aria-label={'Mais ' + virgula(x.passo) + ' ' + x.unidade}
                                onClick={() => ctx.cargaPorEmDia(x.i, Math.round((c + x.passo) * 100) / 100)}>+</button>
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            <Acoes><Botao data-a="emdia-ok" aria-disabled={n ? undefined : 'true'} onClick={() => { if (n) ctx.guardaPorEmDia(false); }}>
              {n ? 'Guardar e continuar' : 'Marque o que você fez'} {n ? ic.seta : null}</Botao></Acoes>
            <Apoio>O app volta para o primeiro exercício que ainda falta. Dá para corrigir série por série depois, no histórico.</Apoio>
          </>}
      </Secao>
      <div class="v3-fim-curto" />
    </>
  );
}

/** Mudar este exercício: trocar, pular, mais uma série, fazer depois, dor. */
export function FolhaMudarEx({ ctx, f }) {
  const m = ctx.mudarExV3(f.i);
  if (!m) return null;
  const a = ctx.acoesEx;
  const faz = fn => () => { ctx.fechaFolha(); fn(); };
  const indicado = m.troca.indicados.find(o => o.indicado) || m.troca.indicados[0];
  const nome = m.nome + (m.nomeOriginal ? ', no lugar de ' + m.nomeOriginal : '');
  return <Folha titulo="Mudar hoje" sub={nome + '. Vale só neste treino; no fim o app pergunta se vira regra.'} aoFechar={ctx.fechaFolha}>
    <div class="v3-opcoes">
      {m.nomeOriginal && <Linha titulo={'Voltar a ' + m.nomeOriginal} marca={ic.troca} semSeta aoTocar={faz(() => a.setAlt(f.i, null))} />}
      {indicado && <Linha titulo={'Trocar por ' + indicado.n} apoio={indicado.nota || indicado.antes}
        marca={ic.troca} semSeta data-a={'troca-' + indicado.id} aoTocar={faz(() => a.setAlt(f.i, indicado.id))} />}
      <Linha titulo="Trocar por outro" apoio="buscar no catálogo" marca={ic.troca} semSeta data-a="mudar-trocar" aoTocar={() => ctx.abreCatalogoV3(f.i)} />
      {m.podeMaisSerie && <Linha titulo="Mais uma série" apoio={<>{m.series} {ic.seta} {m.series + 1}</>} aria-label={'Mais uma série, de ' + m.series + ' para ' + (m.series + 1)} marca={ic.mais} semSeta data-a="mudar-mais" aoTocar={faz(() => a.maisUmaSerie(f.i))} />}
      {m.parSeparado && <Linha titulo={'Juntar o par ' + m.parSeparado.n + ' de novo'} apoio="volta a alternar com o par" marca={ic.gira} semSeta data-a="mudar-junta-par" aoTocar={faz(() => ctx.separaParV3(f.i, false))} />}
      {m.proximo && !m.parSeparado && <Linha titulo={'Fazer ' + m.proximo + ' antes'} apoio="o aparelho está ocupado" marca={ic.fim} semSeta data-a="mudar-antes" aoTocar={faz(() => a.fazAntesOProximo(f.i))} />}
      <Linha titulo={m.pulado ? 'Desfazer o pulo' : 'Pular hoje'} apoio={m.pulado ? 'volta para a fila' : 'fica anotado como pulado'} marca={ic.pula} semSeta data-a="mudar-pular" aoTocar={faz(() => a.pularEx(f.i))} />
      <Linha titulo="O aparelho" apoio="a foto, para achar o mesmo" marca={ic.camera} semSeta data-a="mudar-foto" aoTocar={faz(() => ctx.abreFotoDoAparelhoV3(m.id))} />
      <Linha titulo="Senti dor aqui" apoio={m.regraDor ? 'anota e mostra o que o treinador manda fazer' : 'anota a região no exercício'} marca={ic.atencao} semSeta data-a="mudar-dor" aoTocar={() => ctx.trocaFolha({ k:'dorEx', i:f.i }, true)} />
    </div>
  </Folha>;
}

export function FolhaDorEx({ ctx, f }) {
  const m = ctx.mudarExV3(f.i);
  if (!m) return null;
  return <Folha titulo="Senti dor aqui" sub={m.nome} aoFechar={ctx.fechaFolha}>
    <div class="v3-cond">{m.dores.map(d =>
      <button key={d.k} aria-pressed={d.on ? 'true' : 'false'} data-a={'dor-' + d.k} onClick={() => ctx.acoesEx.toggleDor(f.i, d.k)}>{d.on ? ic.ok : null}{d.t}</button>
    )}</div>
    {m.regraDor && <Apoio>Treinador · {m.regraDor}</Apoio>}
    <Acoes><Botao cheio onClick={ctx.fechaFolha}>Voltar</Botao></Acoes>
  </Folha>;
}

export function FolhaAulaTexto({ ctx }) {
  const [texto, setTexto] = useState('');
  const ler = () => { if (texto.trim()) ctx.acoesAulas.importa(texto, ctx.fechaFolha); };
  return <Folha titulo="Colar o texto da aula" sub="Como veio do grupo. O app separa os movimentos e as quantidades, e você confere antes de guardar." aoFechar={ctx.fechaFolha}>
    <label class="v3-rotulo" for="aula-texto">Texto da aula</label>
    <textarea id="aula-texto" class="v3-campo v3-texto" value={texto} onInput={e => setTexto(e.currentTarget.value)} />
    <Acoes><Botao cheio espera={!texto.trim()} disabled={!texto.trim()} data-a="aula-importa" onClick={ler}>Ler o texto {ic.seta}</Botao></Acoes>
  </Folha>;
}

/** As opções da sessão inteira: outro treino, editar, deload, encerrar, descartar. */
export function FolhaMenuSessaoV3({ ctx }) {
  const m = ctx.menuDaSessao();
  const faz = fn => () => { ctx.fechaFolha(); fn(); };
  return (
    <Folha titulo={m.titulo} aoFechar={() => ctx.fechaFolha()}>
      {m.troca && (
        <Secao titulo={m.troca.rotulo}>
          <div class="v3-cond">
            {m.troca.dias.map(x => (
              <button key={x.k} aria-pressed={x.on ? 'true' : 'false'} data-a={'menu-treino-' + x.k}
                      onClick={faz(() => { if (!x.on) ctx.vaiParaDia(x.k); })}>{x.t}{x.proximo ? ' · próximo' : ''}</button>
            ))}
          </div>
        </Secao>
      )}
      <div class="v3-menu-l">
        {m.editar && <Linha titulo={m.editar.rotulo} apoio={m.editar.detalhe} data-a="menu-editar" aoTocar={faz(ctx.modoEdicao)} />}
        {m.deload && <Linha titulo={m.deload.rotulo} apoio={m.deload.detalhe} data-a="deload" aoTocar={faz(() => ctx.setDeload(!m.deload.ligado))} />}
        <Linha titulo="Progressão do treino" apoio="prontos para subir, ganhando repetição, parados" data-a="menu-progressao"
               aoTocar={faz(() => ctx.abreProgressao())} />
        {m.encerrar && <Linha titulo={m.encerrar.rotulo} apoio={m.encerrar.detalhe} data-a="encerrar" aoTocar={faz(ctx.encerraTreinoV3)} />}
      </div>
      {m.descartar && <Saida data-a="descartar" onClick={faz(ctx.descartarSessao)}>{m.descartar.rotulo} · {m.descartar.detalhe}</Saida>}
    </Folha>
  );
}
