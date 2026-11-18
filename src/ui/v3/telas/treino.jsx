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
import { useAgora } from '../agora.js';
import { podeDissolver } from '../../movimento.js';

const virgula = n => String(Math.round(n * 100) / 100).replace('.', ',');
const relogio = ms => { const s = Math.max(0, Math.ceil(ms / 1000)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };

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
  return <Serie key={f.dia + '-' + f.i + '-' + f.k} ctx={ctx} f={f} />;
}

/**
 * O topo de todo passo do treino (série, descanso, fim): recolher, o treino e
 * o relógio da sessão, a lista. É âncora: fica idêntico entre os passos (a
 * contagem de séries está nos segmentos, logo abaixo).
 */
function Topo({ ctx, f, rotulo }) {
  useAgora();
  const nome = rotulo || (f ? 'Treino ' + f.dia : 'Treino');
  const ms = ctx.relogioDoTreinoV3();
  return (
    <>
      <button onClick={ctx.fechaModoDeSessao} data-a="sai-do-modo" aria-label="Recolher o treino, deixando-o aberto">{ic.baixo}</button>
      <span>{nome}{ms > 0 && <> · <span class="v3-n">{relogio(ms)}</span></>}</span>
      <button onClick={() => ctx.abreFolha({ k: 'menuSessao' })} data-a="menu-sessao" aria-label="Opções desta sessão">{ic.lista}</button>
    </>
  );
}

/** Os segmentos do treino inteiro: uma série por traço. */
function SegsDoTreino({ f }) {
  if (!f || !f.prescritas) return null;
  return <Segmentos total={f.prescritas} feitos={Math.min(f.feitas, f.prescritas)} rotulo={f.feitas + ' de ' + f.prescritas + ' séries'} />;
}

function Serie({ ctx, f }) {
  const [carga, setCarga] = useState(f.carga);
  const [reps, setReps] = useState(f.reps);
  const [sobe, setSobe] = useState(null);
  const ex = f.ex;
  const aceitaSubir = () => { setCarga(f.sobe); setSobe(true); };
  return (
    <TelaDeAcao cor="treino" topo={<Topo ctx={ctx} f={f} />} segs={<SegsDoTreino f={f} />}
      pe={<Botao grande data-a="serie-feita" onClick={() => ctx.fazSerieV3(carga, reps)}>
            {ic.ok} {f.jaFeita ? 'Corrigir' : 'Feita'}: {ex.semCarga && !(carga > 0) ? '' : virgula(carga) + ' × '}{reps}
          </Botao>}
      links={<>
        <button data-a="mudar-ex" onClick={() => ctx.abreFolha({ k: 'mudarEx', i: f.i })}>Mudar este exercício</button>
        <button data-a="lista-treino" onClick={() => ctx.abreFolha({ k: 'listaTreino' })}>Lista do treino</button>
      </>}>
      <p class="v3-serie-q">série {f.k + 1} de {ex.series}{ex.faixa ? ' · ' + ex.faixa + ' reps' : ''}{ex.rir ? ' · RIR ' + ex.rir : ''}</p>
      <h1 class="v3-serie-n" tabindex="-1">{ex.n}</h1>
      {ex.cue && <p class="v3-serie-c">{ex.cue}</p>}
      {f.intervalo && (
        <div class="v3-serie-int" role="status">
          <b>Faz {f.intervalo.minutos} min desde a última série.</b> Fez mais do que anotou?
          <div class="v3-acoes">
            <Botao tipo="contorno" data-a="intervalo-em-dia" onClick={() => ctx.abreFolha({ k: 'porEmDia' })}>Pôr em dia</Botao>
            <Botao tipo="contorno" data-a="intervalo-parei" onClick={ctx.dispensaIntervalo}>Não, só parei</Botao>
          </div>
        </div>
      )}
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
    <TelaDeAcao cor="fundo" classe="v3-desc" centro
      fundo={<div class="v3-desc-fundo" aria-hidden="true" style={`transform:scaleY(${(podeDissolver() ? Math.floor(cheio * 10) / 10 : cheio).toFixed(3)})`} />}
      topo={<Topo ctx={ctx} f={prox} />} segs={<SegsDoTreino f={prox} />}
      pe={<Botao grande data-a="desc-pula" onClick={ctx.paraDescanso}>{falta > 0 ? 'Começar já' : 'Próxima série'}</Botao>}
      links={<>
        <button data-a="desc-menos" onClick={() => ctx.ajustaDescanso(-15)} aria-label="Tirar 15 segundos">−15 s</button>
        <button data-a="desc-mais" onClick={() => ctx.ajustaDescanso(15)} aria-label="Somar 15 segundos">+15 s</button>
      </>}>
      <h1 class="v3-desc-r" tabindex="-1">descanso</h1>
      <div class="v3-desc-t v3-n" role="timer" aria-live="off">{falta > 0 ? relogio(falta) : 'Já!'}</div>
      {u && (
        <div class="v3-desc-rir">
          <Pergunta pergunta={'Sobraram quantas? · ' + u.n + ', série ' + u.serie}
                    nota={u.txt + '. Quantas repetições você ainda faria.'}
                    respostas={[0, 1, 2, 3, 4].map(n => ({ k: n, t: n === 4 ? '4+' : String(n) }))}
                    valor={u.rir} aoResponder={ctx.rirDaUltimaV3} />
        </div>
      )}
      {prox && !prox.fim && <p class="v3-desc-prox">a seguir: {prox.ex.n}, série {prox.k + 1}</p>}
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
      links={<button data-a="fim-lista" onClick={() => ctx.abreFolha({ k: 'listaTreino' })}>Ver a lista do treino</button>}
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
    <TelaDeAcao cor="fundo" cima classe="v3-fim" topo={<Topo ctx={ctx} rotulo={'Treino ' + f.dia} />}
      segs={<Segmentos total={f.series} feitos={f.series} rotulo={f.series + ' séries guardadas'} />}
      pe={<Botao grande data-a="encerrado-fecha" onClick={ctx.fechaFimV3}>Fechar</Botao>}
      links={f.t != null && <button data-a="encerrado-series" onClick={ctx.verSeriesDoFimV3}>Ver as séries</button>}>
      <p class="v3-acao-q">guardado{f.min ? ' · ' + f.min + ' min' : ''}</p>
      <h1 class="v3-fim-t" tabindex="-1">{f.series + (f.series === 1 ? ' série. ' : ' séries. ') + f.nome + ' fechado.'}</h1>
      {f.depois > 0 && <p class="v3-medir-f">{(f.depois === 1 ? 'Um exercício registrado depois' : f.depois + ' exercícios registrados depois') + ', com os números da última vez.'}</p>}
      {f.mudancas.length > 0 && (
        <div class="v3-encerrado-m">
          <div class="v3-sec-h"><h2>O que você mudou hoje</h2><small>vira regra?</small></div>
          {f.mudancas.map((m, i) => (
            <div key={m.txt} class="v3-decide">
              <p>{m.txt}</p>
              {m.impacto && <small>{m.impacto}</small>}
              <div class="v3-acoes">
                <Botao tipo="contorno" data-a={'regra-hoje-' + i} onClick={() => ctx.respondeMudanca(f.sid, i, false)}>Só hoje</Botao>
                <Botao tipo="contorno" data-a={'regra-sempre-' + i} onClick={() => ctx.respondeMudanca(f.sid, i, true)}>Passa a valer</Botao>
              </div>
            </div>
          ))}
          <Apoio>Sem resposta agora, a pergunta continua no Hoje. {f.vence}</Apoio>
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
  const [colado, setColado] = useState('');
  return (
    <>
      <Bloco cor="corpo" chave={'aula-' + t.dia}
             linha0={<><button onClick={ctx.fechaModoDeSessao} aria-label="Voltar, deixando a aula aberta">{ic.volta} Hoje</button>
                       <button onClick={() => ctx.abreFolha({ k: 'menuSessao' })} data-a="menu-sessao" aria-label="Opções desta sessão">{ic.lista}</button></>}
             quando={t.movimentos ? t.movimentos + (t.movimentos === 1 ? ' movimento' : ' movimentos') : 'aula aberta'}
             titulo={t.nome} medio
             apoio={t.quadro || (t.movimentos ? 'Anote no fim da aula, um número por movimento.' : 'Comece pela aula de hoje: repita a última, use um modelo ou cole o texto.')}>
        {t.movimentos > 0 && (
          <Acoes>
            <Botao tipo="contorno" data-a="aula-por-serie" onClick={() => ctx.setAulaPorSerie(true)}>Série por série</Botao>
            <Botao tipo="contorno" data-a="aula-add" onClick={ctx.acoesAdd.abre}>{ic.mais} Movimento</Botao>
          </Acoes>
        )}
      </Bloco>

      {r && r.linhas.length > 0 && (
        <Secao titulo="Lista rápida" nota="o mesmo em todas as passadas">
          {r.linhas.map(l => (
            <div key={l.i} class="v3-rapida">
              <span class="v3-lin-t"><b>{l.nome}</b><span>{l.prescricao}{l.nota ? ' · ' + l.nota : ''}</span></span>
              <label class="v3-rapida-c"><input id={'rapida-c-' + l.i} inputmode="decimal" value={l.carga} aria-label={'Carga de ' + l.nome + ' em ' + l.unidade}
                     onChange={e => ctx.anotaRapidaV3(l.i, 0, e.currentTarget.value)} /><small>{l.unidade}</small></label>
              <label class="v3-rapida-c"><input id={'rapida-v-' + l.i} inputmode="numeric" value={l.valor} aria-label={l.nome + ' em ' + l.medida}
                     onChange={e => ctx.anotaRapidaV3(l.i, 1, e.currentTarget.value)} /><small>{l.medida}</small></label>
            </div>
          ))}
        </Secao>
      )}

      {!t.movimentos && t.aulas && (
        <Secao titulo="A aula de hoje">
          <div>
            {t.aulas.ultima && <Linha titulo="Repetir a última aula" apoio={t.aulas.ultima.n + ' movimentos · ' + t.aulas.ultima.quando} data-a="aula-repete" aoTocar={A.repete} />}
            {t.aulas.modelos.map(m => <Linha key={m.id} titulo={m.nome} apoio={m.sub} data-a={'aula-modelo-' + m.id} aoTocar={() => A.aplica(m.id)} />)}
            <Linha titulo="Adicionar movimento" mais data-a="aula-add" aoTocar={ctx.acoesAdd.abre} />
          </div>
          <textarea id="aula-texto" class="v3-campo v3-texto" placeholder="Ou cole o texto da aula" aria-label="Texto da aula"
                    onInput={e => setColado(e.currentTarget.value)}>{colado}</textarea>
          <Acoes><Botao tipo="contorno" cheio data-a="aula-importa" disabled={!colado.trim()} onClick={() => A.importa(colado)}>Montar a aula pelo texto</Botao></Acoes>
        </Secao>
      )}

      {t.lousa && (
        <Secao titulo="Lousa" nota={t.lousa.tem ? t.lousa.quando : 'a foto do quadro do box'}>
          {t.lousa.tem && t.lousa.url && <img class="v3-ex-foto" src={t.lousa.url} alt="Foto da lousa do box" />}
          <Acoes>
            <label class="v3-btn c cheio">{ic.camera} {t.lousa.tem ? 'Tirar de novo' : 'Fotografar a lousa'}
              <input type="file" accept="image/*" capture="environment" hidden onChange={e => ctx.tiraFotoDaLousa(e.currentTarget)} />
            </label>
            {t.lousa.tem && t.lousa.podeMandar && <Botao tipo="contorno" onClick={ctx.mandaLousa}>Mandar</Botao>}
          </Acoes>
        </Secao>
      )}

      {t.aulas && t.aulas.podeSalvar && (
        <Secao><Saida data-a="aula-salva" onClick={A.salva}>Guardar esta aula como modelo</Saida></Secao>
      )}
      <div class="v3-fim-curto" />
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
      <Linha titulo="Já fiz mais do que anotei" apoio="grava as séries com os números da última vez" data-a="lista-em-dia"
             aoTocar={() => { ctx.fechaFolha(); ctx.abreFolha({ k: 'porEmDia' }); }} />
      {l.deload && <Chave titulo={l.deload.rotulo} apoio={l.deload.detalhe} ligada={l.deload.ligado} data-a="lista-deload"
                          aoMudar={on => ctx.setDeload(on)} />}
      <Acoes><Botao onClick={() => ctx.fechaFolha()}>Voltar à série</Botao></Acoes>
    </Folha>
  );
}

/**
 * "Já fiz mais do que anotei": as séries que faltam, já marcadas, cada uma
 * com o número que vai gravar. Desmarcar é tirar a que não foi feita.
 */
export function FolhaPorEmDia({ ctx, f }) {
  const lista = ctx.porEmDiaV3() || [];
  const tirados = f.tirados || {};
  const chave = (i, k) => i + '-' + k;
  const marcados = [];
  lista.forEach(x => x.series.forEach(s => { if (!tirados[chave(x.i, s.k)]) marcados.push({ i: x.i, k: s.k }); }));
  const troca = (i, k) => ctx.mudaFolha({ tirados: Object.assign({}, tirados, { [chave(i, k)]: !tirados[chave(i, k)] }) });
  return (
    <Folha titulo="Pôr em dia" sub="As séries que você fez e não anotou entram com os números da última vez, marcadas como postas em dia." aoFechar={() => ctx.fechaFolha()}>
      {!lista.length && <Apoio>Nada a pôr em dia: as séries que faltam não têm número de onde partir.</Apoio>}
      {lista.map(x => (
        <div key={x.i} class="v3-emdia">
          <b>{x.n}</b>
          <div class="v3-cond">
            {x.series.map(s => {
              const on = !tirados[chave(x.i, s.k)];
              return (
                <button key={s.k} aria-pressed={on ? 'false' : 'true'} data-a={'emdia-' + x.i + '-' + s.k} onClick={() => troca(x.i, s.k)}>
                  {on ? ic.ok : ic.x}{'série ' + (s.k + 1) + ' · ' + s.txt}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      <Acoes>
        <Botao data-a="emdia-ok" disabled={!marcados.length}
               onClick={() => { ctx.fechaFolha(); ctx.poeEmDia(marcados); }}>
          {marcados.length === 1 ? 'Pôr em dia 1 série' : 'Pôr em dia ' + marcados.length + ' séries'}
        </Botao>
      </Acoes>
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
            <Linha titulo="O aparelho" apoio="a foto da máquina, para achar e regular" data-a="mudar-foto"
                   aoTocar={faz(() => ctx.abreFotoDoAparelhoV3(m.id))} />
            <Linha titulo="Histórico deste exercício" apoio="sessão a sessão, e se está pronto para subir" data-a="mudar-historico"
                   aoTocar={faz(() => ctx.abreExercicioV3(ctx.focoV3().dia, f.i))} />
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
        <Linha titulo="Progressão do treino" apoio="prontos para subir, ganhando repetição, parados" data-a="menu-progressao"
               aoTocar={faz(() => ctx.abreProgressao())} />
        {m.encerrar && <Linha titulo={m.encerrar.rotulo} apoio={m.encerrar.detalhe} data-a="encerrar" aoTocar={faz(ctx.encerraTreinoV3)} />}
      </div>
      {m.descartar && <Saida data-a="descartar" onClick={faz(ctx.descartarSessao)}>{m.descartar.rotulo} · {m.descartar.detalhe}</Saida>}
    </Folha>
  );
}
