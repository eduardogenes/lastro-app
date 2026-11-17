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
import { Acoes, Apoio, Bloco, Botao, Chave, Folha, Linha, Pergunta, Saida, Secao, Segmentos, Selo, TelaDeAcao } from '../base.jsx';
import { Regua } from '../regua.jsx';
import { useAgora } from '../../instrumento/primitivos.jsx';

const virgula = n => String(Math.round(n * 100) / 100).replace('.', ',');
const relogio = ms => { const s = Math.max(0, Math.ceil(ms / 1000)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };

export function TreinoEmFoco({ ctx }) {
  const des = ctx.descansoV3();
  if (des) return <Descanso ctx={ctx} des={des} />;
  const f = ctx.focoV3();
  if (!f) return null;
  if (f.fim) return <FimDoTreino ctx={ctx} f={f} />;
  // uma montagem por série: a régua parte do valor daquela série
  return <Serie key={f.dia + '-' + f.i + '-' + f.k} ctx={ctx} f={f} />;
}

function Topo({ ctx, f }) {
  return (
    <>
      <button onClick={ctx.fechaModoDeSessao} data-a="sai-do-modo" aria-label="Voltar, deixando o treino aberto">{ic.volta}</button>
      <span class="v3-n">{f.nome} · {f.feitas} de {f.prescritas}</span>
      <button onClick={() => ctx.abreFolha({ k: 'menuSessao' })} data-a="menu-sessao" aria-label="Opções desta sessão">{ic.lista}</button>
    </>
  );
}

function Serie({ ctx, f }) {
  const [carga, setCarga] = useState(f.carga);
  const [reps, setReps] = useState(f.reps);
  const [sobe, setSobe] = useState(null);
  const ex = f.ex;
  const aceitaSubir = () => { setCarga(f.sobe); setSobe(true); };
  return (
    <TelaDeAcao cor="lima" topo={<Topo ctx={ctx} f={f} />}
      pe={<Botao grande data-a="serie-feita" onClick={() => ctx.fazSerieV3(carga, reps)}>
            {ic.ok} {f.jaFeita ? 'Corrigir' : 'Feita'}: {ex.semCarga && !(carga > 0) ? '' : virgula(carga) + ' × '}{reps}
          </Botao>}
      links={<>
        <button data-a="mudar-ex" onClick={() => ctx.abreFolha({ k: 'mudarEx', i: f.i })}>Mudar este exercício</button>
        <button data-a="lista-treino" onClick={() => ctx.abreFolha({ k: 'listaTreino' })}>Lista do treino</button>
      </>}>
      <Segmentos total={ex.series} feitos={f.estados.filter(e => e.feita).length} rotulo={'série ' + (f.k + 1) + ' de ' + ex.series} />
      <p class="v3-serie-q">série {f.k + 1} de {ex.series}{ex.faixa ? ' · ' + ex.faixa + ' reps' : ''}{ex.rir ? ' · RIR ' + ex.rir : ''}</p>
      <h1 class="v3-serie-n" tabindex="-1">{ex.n}</h1>
      {ex.cue && <p class="v3-serie-c">{ex.cue}</p>}
      {f.dor && (
        <div class="v3-serie-dor" role="alert">
          <b>Dor seguida: {f.dor.o}</b> ({f.dor.datas}). O treinador pede para não forçar.
          <div class="v3-acoes">
            <Botao tipo="contorno" onClick={() => ctx.acoesEx.pularEx(f.i)}>Pular hoje</Botao>
            <Botao tipo="contorno" onClick={() => ctx.acoesEx.aceitaDor(f.i)}>Fazer mesmo assim</Botao>
          </div>
        </div>
      )}
      {f.sobe && sobe == null && (
        <Pergunta pergunta={'Subir para ' + virgula(f.sobe) + ' ' + ex.unidade + '?'}
                  nota="Na última vez, todas as séries chegaram ao topo da faixa."
                  respostas={[{ k: 'sim', t: 'Subir' }, { k: 'nao', t: 'Manter' }]}
                  valor={null} aoResponder={k => k === 'sim' ? aceitaSubir() : setSobe(false)} />
      )}
      {!ex.semCarga && (
        <div class="v3-serie-g">
          <div class="v3-gigante v3-n v3-gigante-m">{virgula(carga)}<small>{ex.unidade}</small></div>
          <Regua min={0} max={Math.max(60, Math.ceil(carga * 2 / 10) * 10)} passo={f.passoCarga} cada={f.passoCarga >= 2.5 ? 10 : 5}
                 largura={12} valor={carga} aoMudar={setCarga} rotulo={'carga em ' + ex.unidade} />
        </div>
      )}
      <div class="v3-serie-g">
        <div class="v3-gigante v3-n v3-gigante-m">{reps}<small>{ex.medida}</small></div>
        <Regua min={0} max={Math.max(30, reps + 15)} passo={1} cada={5} largura={16} valor={reps} aoMudar={setReps} rotulo={ex.medida} />
      </div>
      {f.antes && <p class="v3-serie-ant">da última vez: {f.antes}</p>}
    </TelaDeAcao>
  );
}

function Descanso({ ctx, des }) {
  const agora = useAgora();
  const falta = des.fim - agora;
  const cheio = Math.max(0, Math.min(1, 1 - falta / des.total));
  const u = ctx.ultimaV3();
  const prox = ctx.focoV3();
  return (
    <div class="v3 v3-desc" style={`--v3-cheio:${(cheio * 100).toFixed(1)}%`}>
      <div class="v3-desc-fundo" aria-hidden="true" />
      <div class="v3-acao-topo">
        <button onClick={ctx.fechaModoDeSessao} aria-label="Voltar, deixando o treino aberto">{ic.volta}</button>
        <span>descanso</span><span class="v3-vazio-alvo" />
      </div>
      <div class="v3-desc-meio">
        <div class="v3-desc-t v3-n" role="timer" aria-live="off">{falta > 0 ? relogio(falta) : 'Já!'}</div>
        <p class="v3-desc-r">{des.rotulo}</p>
        <div class="v3-desc-aj">
          <button data-a="desc-menos" onClick={() => ctx.ajustaDescanso(-15)} aria-label="Tirar 15 segundos">−15 s</button>
          <button data-a="desc-mais" onClick={() => ctx.ajustaDescanso(15)} aria-label="Somar 15 segundos">+15 s</button>
        </div>
        {u && (
          <div class="v3-desc-rir">
            <Pergunta pergunta={'Sobraram quantas? · ' + u.n + ', série ' + u.serie}
                      nota={u.txt + '. Quantas repetições você ainda faria.'}
                      respostas={[0, 1, 2, 3, 4].map(n => ({ k: n, t: n === 4 ? '4+' : String(n) }))}
                      valor={u.rir} aoResponder={ctx.rirDaUltimaV3} />
          </div>
        )}
        {prox && !prox.fim && <p class="v3-desc-prox">a seguir: {prox.ex.n}, série {prox.k + 1}</p>}
      </div>
      <div class="v3-acao-pe"><Botao grande data-a="desc-pula" onClick={ctx.paraDescanso}>{falta > 0 ? 'Pular o descanso' : 'Próxima série'}</Botao></div>
    </div>
  );
}

function FimDoTreino({ ctx, f }) {
  return (
    <>
      <Bloco cor="menta" chave="fim-treino" medio quando={f.sessaoAberta ? 'treino aberto' : 'nenhuma série ainda'}
             linha0={<><button onClick={ctx.fechaModoDeSessao} aria-label="Voltar">{ic.volta} Hoje</button><span class="v3-n">{f.feitas} de {f.prescritas}</span></>}
             titulo={f.feitas >= f.prescritas ? 'Tudo feito' : 'Nada mais na fila'}
             apoio={f.feitas >= f.prescritas ? 'Todas as séries de ' + f.nome + ' estão guardadas.' : 'O que ficou para trás foi pulado. Encerrar grava o fim agora.'}>
        <Acoes>{f.sessaoAberta && <Botao data-a="fim-encerra" onClick={ctx.finalizarSessao}>Encerrar o treino</Botao>}</Acoes>
        <Saida onClick={() => ctx.abreFolha({ k: 'listaTreino' })}>Ver a lista do treino</Saida>
      </Bloco>
    </>
  );
}

// ---------- as folhas ----------

/** A lista do treino: onde está cada exercício, e tocar leva para ele. */
export function FolhaListaTreino({ ctx }) {
  const l = ctx.listaV3();
  if (!l) return null;
  return (
    <Folha titulo={l.nome} sub="Toque num exercício para ir até ele." aoFechar={() => ctx.fechaFolha()}>
      <div class="v3-lista-t">
        {l.exercicios.map(x => (
          <Linha key={x.i} marca={x.feito ? ic.ok : x.i + 1} titulo={x.n} quieta={x.feito || x.pulado}
                 apoio={x.pulado ? 'pulado hoje' : x.feitas + ' de ' + x.series + ' séries'}
                 valor={x.atual ? <Selo tom="agora">agora</Selo> : null} data-a={'lista-ex-' + x.i}
                 aoTocar={() => { ctx.fechaFolha(); ctx.setFocoV3(x.i, x.feito ? 0 : x.proxima); }} />
        ))}
      </div>
      {l.deload && <Chave titulo={l.deload.rotulo} apoio={l.deload.detalhe} ligada={l.deload.ligado} data-a="lista-deload"
                          aoMudar={on => ctx.setDeload(on)} />}
      <Acoes><Botao onClick={() => ctx.fechaFolha()}>Voltar à série</Botao></Acoes>
    </Folha>
  );
}

/** Mudar este exercício: trocar, pular, mais uma série, fazer depois, dor. */
export function FolhaMudarEx({ ctx, f }) {
  const m = ctx.mudarExV3(f.i);
  if (!m) return null;
  const a = ctx.acoesEx;
  const faz = fn => () => { ctx.fechaFolha(); fn(); };
  return (
    <Folha titulo={m.nome} sub={m.nomeOriginal ? 'no lugar de ' + m.nomeOriginal : 'O que muda vale só para esta sessão.'} aoFechar={() => ctx.fechaFolha()}>
      <div>
        {m.temTroca && (f.troca
          ? (
            <>
              {m.troca.indicados.concat(m.troca.outros).map(o => (
                <Linha key={o.id} titulo={o.n} apoio={o.indicado ? 'indicado pelo treinador' + (o.nota ? ' · ' + o.nota : '') : (o.antes || '')}
                       data-a={'troca-' + o.id} aoTocar={faz(() => a.setAlt(f.i, o.id))} />
              ))}
            </>
          )
          : <Linha titulo="Trocar por outro" apoio="a máquina está ocupada, ou não existe aqui" data-a="mudar-trocar" aoTocar={() => ctx.mudaFolha({ troca: true })} />)}
        {!f.troca && (
          <>
            {m.podeMaisSerie && <Linha titulo="Mais uma série" apoio="só hoje" mais data-a="mudar-mais" aoTocar={faz(() => a.maisUmaSerie(f.i))} />}
            {m.proximo && <Linha titulo={'Fazer ' + m.proximo + ' antes'} apoio="este fica para depois" data-a="mudar-antes" aoTocar={faz(() => a.fazAntesOProximo(f.i))} />}
            <Linha titulo={m.pulado ? 'Desfazer o pulo' : 'Pular hoje'} apoio={m.pulado ? 'volta para a fila' : 'fica anotado como pulado'} data-a="mudar-pular"
                   aoTocar={faz(() => a.pularEx(f.i))} />
          </>
        )}
      </div>
      {!f.troca && (
        <Secao titulo="Doeu?">
          <div class="v3-cond">
            {m.dores.map(d => (
              <button key={d.k} aria-pressed={d.on ? 'true' : 'false'} data-a={'dor-' + d.k} onClick={() => a.toggleDor(f.i, d.k)}>{d.on ? ic.x : null}{d.t}</button>
            ))}
          </div>
        </Secao>
      )}
      <Saida onClick={() => ctx.fechaFolha()}>Fechar</Saida>
    </Folha>
  );
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
        {m.encerrar && <Linha titulo={m.encerrar.rotulo} apoio={m.encerrar.detalhe} data-a="encerrar" aoTocar={faz(ctx.finalizarSessao)} />}
      </div>
      {m.descartar && <Saida data-a="descartar" onClick={faz(ctx.descartarSessao)}>{m.descartar.rotulo} · {m.descartar.detalhe}</Saida>}
    </Folha>
  );
}
