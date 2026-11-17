// O HOJE no visual novo (Fase 4): o bloco do momento, a linha do dia, o "se
// quiser" (só o que estiver ligado), o ritmo dos últimos sete dias e a
// pergunta de ontem. E as folhas do "+" (com o texto livre), da refeição e de
// "o que aparece". Protótipo: docs/redesign-3/prototipos/hoje.html. Dados:
// `ctx.hojeV3`, `ctx.refeicaoV3`; a regra do momento é `cartaoDeCima`.

import { useState } from 'preact/hooks';
import { ic } from '../icones.jsx';
import { CamposDoCardio } from '../cardio.jsx';
import { Acoes, Apoio, Bloco, Botao, Chave, Fichas, Folha, Linha, Pergunta, Saida, Secao } from '../base.jsx';

const RESPOSTAS = [{ k: 'sim', t: 'Foi, sim' }, { k: 'quase', t: 'Quase' }, { k: 'naosei', t: 'Não sei dizer' }];

function Momento({ ctx, h }) {
  const b = h.bloco;
  // a data diz também o tipo do dia, e tocar confirma ou corrige (folha `dia`)
  const linha0 = <><button data-a="hoje-tipo" onClick={() => ctx.abreFolha({ k: 'dia' })}
                           aria-label={h.data + ', ' + (h.tipo === 'descanso' ? 'descanso' : 'dia de treino') + '. Mudar o tipo do dia'}>
      {h.data} · <span class="v3-n">{h.hora.replace(':', 'h')}</span> · {h.tipo === 'descanso' ? 'descanso' : 'treino'}{ic.baixo}</button>
    <button onClick={() => ctx.abreFolha({ k: 'oQueAparece' })} aria-label="Escolher o que aparece" data-a="hoje-aparece">{ic.ajuste}</button></>;
  let acoes = null;
  if (b.k === 'sessao') {
    acoes = b.pergunta
      ? <><Acoes><Botao data-a="hoje-continuo" onClick={ctx.continuaSessao}>Continuo treinando</Botao>
            <Botao tipo="contorno" data-a="hoje-parei" onClick={ctx.encerraSessaoEsquecida}>Já parei</Botao></Acoes></>
      : <Acoes><Botao data-a="hoje-volta" onClick={ctx.voltaAoTreino}>Voltar ao treino {ic.seta}</Botao></Acoes>;
  } else if (b.k === 'confirmar') {
    acoes = <Acoes><Botao data-a="hoje-fim-ok" onClick={() => ctx.confirmaDuracao(b.fim)}>Está certo</Botao>
      <Botao tipo="contorno" data-a="hoje-fim-corrige" onClick={() => ctx.abreSessaoDoDia({ k: 'sessao', t: b.fim })}>Corrigir</Botao></Acoes>;
  } else if (b.k === 'treino' || b.k === 'aula') {
    acoes = <><Acoes><Botao data-a="hoje-comeca" onClick={ctx.abreTreinoDeHoje}>{b.k === 'aula' ? 'Fiz a aula' : 'Começar'} {ic.seta}</Botao></Acoes>
      <div class="v3-saidas">
        <Saida data-a="hoje-ja-treinei" onClick={ctx.lancaTreinoDeHoje}>Já treinei e não anotei</Saida>
        {b.k === 'treino' && <Saida data-a="hoje-nao-treino" onClick={() => ctx.setCadenciaV3('descanso')}>Hoje não vou treinar</Saida>}
      </div></>;
  } else if (b.k === 'refeicao') {
    acoes = b.pergunta
      ? <><Acoes><Botao tipo="contorno" data-a="hoje-fora" onClick={() => ctx.marcaLinhaDaComida(b.id, 'fora')}>Comi outra coisa</Botao>
            <Botao tipo="contorno" data-a="hoje-nao" onClick={() => ctx.marcaLinhaDaComida(b.id, 'nao')}>Não comi</Botao></Acoes>
          <Saida onClick={() => ctx.marcaLinhaDaComida(b.id, 'nsei')}>Não sei</Saida></>
      : <><Acoes><Botao data-a="hoje-comi" onClick={() => ctx.marcaLinhaDaComida(b.id, 'tudo')}>{ic.ok} Comi</Botao>
            <Botao tipo="contorno" data-a="hoje-ver" onClick={() => ctx.abreFolha({ k: 'refeicao', id: b.id })}>Ver</Botao></Acoes>
          <Saida data-a="hoje-nao-comi" onClick={() => ctx.marcaLinhaDaComida(b.id, 'pergunta')}>Não foi assim</Saida></>;
  } else if (b.k === 'noite') {
    acoes = <><Acoes><Botao data-a="noite-sim" onClick={() => ctx.respondeODia(ctx.hojeISO(), 'sim')}>Foi, sim</Botao>
        <Botao tipo="contorno" data-a="noite-quase" onClick={() => ctx.respondeODia(ctx.hojeISO(), 'quase')}>Quase</Botao></Acoes>
      <Saida data-a="noite-naosei" onClick={() => ctx.respondeODia(ctx.hojeISO(), 'naosei')}>Não sei dizer</Saida></>;
  }
  return (
    <Bloco cor={b.cor} chave={b.k + (b.id || '')} fino={b.fino} vivo={b.vivo} linha0={linha0}
           quando={b.quando} titulo={b.titulo} medio={b.titulo.length > 12} apoio={b.apoio}>
      {acoes}
    </Bloco>
  );
}

/**
 * A PRIMEIRA VEZ: o aparelho sem nenhum registro. Começar com o programa e o
 * plano que já estão no app, colar o texto do treinador, ou restaurar uma
 * cópia; e escolher o que aparece. Nada aqui é obrigatório.
 */
function PrimeiraVez({ ctx, v }) {
  return (
    <>
      <Bloco cor="lima" chave="primeira-vez" quando="primeira vez aqui" titulo="Comece pelo que já está aqui" medio
             apoio={'O treino: ' + v.programa + '. A comida: ' + v.plano + '.'}>
        <Acoes><Botao data-a="primeira-comeca" onClick={ctx.comecaAqui}>Começar assim {ic.seta}</Botao></Acoes>
        <Saida data-a="primeira-aparece" onClick={() => ctx.abreFolha({ k: 'oQueAparece' })}>Escolher o que aparece</Saida>
      </Bloco>
      <Secao titulo="Ou traga o seu">
        <div>
          <button class="v3-lin" data-a="primeira-treinador" onClick={ctx.abreRevisao}>
            <span class="v3-lin-t"><b>Colar o texto do treinador</b><span>o app organiza em treinos e séries, e você confirma</span></span>{ic.dir}
          </button>
          <label class="v3-lin v3-lin-arq">
            <span class="v3-lin-t"><b>Restaurar de uma cópia</b><span>o arquivo que você guardou em outro aparelho</span></span>
            <input type="file" accept="application/json,.json" hidden data-a="primeira-importa" onChange={e => ctx.importaArquivo(e.currentTarget)} />
          </label>
        </div>
        {v.semRede && <Apoio>Sem rede agora: tudo funciona e fica guardado neste aparelho.</Apoio>}
      </Secao>
    </>
  );
}

export function HojeV3({ ctx }) {
  const vazio = ctx.enderecoVazio();
  if (vazio) return <div class="v3"><PrimeiraVez ctx={ctx} v={vazio} /><div class="v3-fim-da-tela" /></div>;
  const h = ctx.hojeV3();
  const q = h.seQuiser;
  const tem = q.agua || q.peso || q.cardio;
  return (
    <div class="v3">
      <Momento ctx={ctx} h={h} />
      <Secao titulo="O dia" nota={h.feitas + ' de ' + h.linha.length}>
        <div class="v3-ld" role="list">
          {h.linha.map(x => (
            <button key={x.id} role="listitem" class={x.feita ? 'ok' : x.agora ? 'agora' : x.falta ? 'falta' : undefined}
                    data-a={'linha-' + x.id} aria-label={x.n + ', ' + x.t + (x.feita ? ', feito' : x.falta ? ', sem resposta' : '')}
                    onClick={() => x.treino ? ctx.abreTreinoDeHoje() : ctx.abreFolha({ k: 'refeicao', id: x.id })}>
              <span class="p">{x.feita ? ic.ok : x.treino ? ic.halter : ic.prato}</span>
              <span class="v3-n">{x.t.replace(':', 'h')}</span>
            </button>
          ))}
        </div>
        <p class="v3-ld-leg">
          {h.proxima ? <>a seguir: <b>{h.proxima.n}</b>, {h.proxima.t.replace(':', 'h')}{h.proxima.kcal ? ' · ' + h.proxima.kcal + ' kcal' : ''}</> : 'nada mais para hoje'}
        </p>
      </Secao>
      {tem && (
        <Secao titulo="Se quiser" nota="nada aqui é obrigatório">
          <div class="v3-instr">
            {q.agua && (
              <button class="v3-gota" data-a="hoje-agua" onClick={ctx.maisUmCopo} aria-label={'Somar um copo de água. ' + q.agua.n + ' de ' + q.agua.meta}>
                <span class="nivel" style={'height:' + Math.min(100, q.agua.n / q.agua.meta * 100) + '%'} />
                <span class="rt">Água · +1</span><span class="v v3-n">{q.agua.n}<small> /{q.agua.meta}</small></span>
              </button>
            )}
            {q.peso && (
              <button class="v3-gota" data-a="hoje-peso" onClick={() => ctx.vaiPara('corpo')}>
                <span class="rt">Peso{q.peso.hoje ? ' · hoje' : ''}</span><span class="v v3-n">{q.peso.hoje || <small>pôr</small>}</span>
              </button>
            )}
            {q.cardio && (
              <button class="v3-gota" data-a="hoje-cardio" onClick={ctx.abreCardio}>
                <span class="nivel" style={'height:' + Math.min(100, q.cardio.n / q.cardio.meta * 100) + '%'} />
                <span class="rt">Cardio</span><span class="v v3-n">{q.cardio.n}<small> /{q.cardio.meta}</small></span>
              </button>
            )}
          </div>
        </Secao>
      )}
      <Secao titulo="Seu ritmo" nota="últimos 7 dias">
        <div class="v3-ritmo">
          {h.ritmo.map(d => (
            <button key={d.data} onClick={() => ctx.vaiPara('dias')} aria-label={d.data + (d.treino ? ', treino ' + d.treino : '') + ', comida ' + d.comida}>
              <span class={'bola ' + d.comida + (d.hoje ? ' hoje' : '')}>{d.treino || ''}</span>{d.letra}
            </button>
          ))}
        </div>
        {h.ontem && (
          <Pergunta pergunta="Ontem ficou em branco. Foi como o plano?" respostas={RESPOSTAS} valor={null}
                    aoResponder={k => ctx.respondeODia(h.ontem, k)} />
        )}
      </Secao>
      <div class="v3-fim-da-tela" />
    </div>
  );
}

/** Uma refeição: o que tem nela, e marcar. */
export function FolhaRefeicaoV3({ ctx, f }) {
  const r = ctx.refeicaoV3(f.id);
  if (!r) return null;
  const marca = k => { ctx.fechaFolha(); ctx.marcaLinhaDaComida(r.id, k); };
  return (
    <Folha titulo={r.n} sub={r.t.replace(':', 'h') + ' · ' + r.kcal + ' kcal' + (r.feita ? ' · ' + (r.como === 'fora' ? 'comi outra coisa' : r.como === 'nao' ? 'não comi' : r.como === 'nsei' ? 'não sei' : r.metade ? 'metade' : 'comi') : '')}
           aoFechar={() => ctx.fechaFolha()}>
      <div class="v3-itens">{r.itens.map(i => <div key={i}>{i}</div>)}</div>
      {r.nota && <Apoio>{r.nota}</Apoio>}
      {r.feita
        ? <><Acoes><Botao data-a="ref-desfaz" onClick={() => marca('desfaz')}>Desmarcar</Botao></Acoes>
            <Saida onClick={() => { ctx.fechaFolha(); ctx.editaRefeicao(r.id); }}>Corrigir o que comi</Saida></>
        : <><Acoes><Botao data-a="ref-tudo" onClick={() => marca('tudo')}>{ic.ok} Comi</Botao>
              <Botao tipo="contorno" data-a="ref-metade" onClick={() => marca('metade')}>Metade</Botao></Acoes>
            <div class="v3-cond">
              <button data-a="ref-fora" onClick={() => marca('fora')}>Comi outra coisa</button>
              <button data-a="ref-nao" onClick={() => marca('nao')}>Não comi</button>
              <button data-a="ref-nsei" onClick={() => marca('nsei')}>Não sei</button>
            </div></>}
    </Folha>
  );
}

/** O "+": o mais provável agora primeiro, e o texto livre. */
export function FolhaRegistrar({ ctx }) {
  const h = ctx.hojeV3();
  const [texto, setTexto] = useState('');
  const [eco, setEco] = useState('');
  const b = h.bloco;
  const envia = async e => {
    e.preventDefault();
    const r = await ctx.registraTextoV3(texto);
    setEco(r || 'Não entendi. Tente "almocei", "2 copos" ou "pesei 77,6".');
    if (r) setTexto('');
  };
  const faz = fn => () => { ctx.fechaFolha(); fn(); };
  return (
    <Folha titulo="Registrar" sub="O mais provável agora vem primeiro. Ou escreva do seu jeito." aoFechar={() => ctx.fechaFolha()}>
      <form class="v3-diga" onSubmit={envia}>
        <input id="registrar-texto" value={texto} placeholder="almocei e tomei 2 copos" autocomplete="off" enterkeyhint="send"
               aria-label="Escreva o que quer registrar" onInput={e => setTexto(e.currentTarget.value)} />
        <button aria-label="Guardar" data-a="registrar-envia">{ic.seta}</button>
      </form>
      <p class="v3-eco" role="status" aria-live="polite">{eco}</p>
      <div class="v3-sug">
        {b.k === 'refeicao' && <button class="v3-sug-b pri" data-a="reg-comi" onClick={faz(() => ctx.marcaLinhaDaComida(b.id, 'tudo'))}><b>Comi: {b.titulo}</b><span>como o plano</span></button>}
        {(b.k === 'treino' || b.k === 'aula') && <button class="v3-sug-b pri" data-a="reg-treino" onClick={faz(ctx.abreTreinoDeHoje)}><b>Começar: {b.titulo}</b><span>o treino de hoje</span></button>}
        {b.k === 'noite' && <button class="v3-sug-b pri" data-a="reg-noite" onClick={faz(() => ctx.respondeODia(ctx.hojeISO(), 'sim'))}><b>Hoje foi como o plano</b><span>responde as que faltam</span></button>}
        {h.seQuiser.agua && <button class="v3-sug-b" data-a="reg-agua" onClick={ctx.maisUmCopo}><b>+1 copo de água</b><span>{h.seQuiser.agua.n} de {h.seQuiser.agua.meta} hoje</span></button>}
        {h.seQuiser.peso && <button class="v3-sug-b" data-a="reg-peso" onClick={faz(() => ctx.vaiPara('corpo'))}><b>Peso de hoje</b><span>{h.seQuiser.peso.hoje ? h.seQuiser.peso.hoje + ' kg · mudar' : 'pela régua do Corpo'}</span></button>}
        {h.seQuiser.cardio && <button class="v3-sug-b" data-a="reg-cardio" onClick={faz(ctx.abreCardio)}><b>Cardio</b><span>{h.seQuiser.cardio.n} de {h.seQuiser.cardio.meta} na semana</span></button>}
        <button class="v3-sug-b" data-a="reg-ja-treinei" onClick={faz(ctx.lancaTreinoDeHoje)}><b>Já treinei e não anotei</b><span>o treino de hoje, depois</span></button>
      </div>
    </Folha>
  );
}

/** O que aparece: treino e comida sempre; o resto, quem decide é a pessoa. */
export function FolhaOQueAparece({ ctx }) {
  const M = [['agua', 'Água', 'contar copos'], ['peso', 'Peso', 'a pesagem da manhã'], ['cardio', 'Cardio', 'as duas sessões da semana'],
             ['dobras', 'Dobras', 'adipômetro, no Corpo'], ['fotos', 'Fotos do corpo', 'sessão a cada 14 dias']];
  return (
    <Folha titulo="O que aparece" sub="Treino e comida ficam sempre. O resto é seu: ligue só o que for usar. Desligar não apaga nada." aoFechar={() => ctx.fechaFolha()}>
      <div class="v3-ligar">
        {M.map(m => <Chave key={m[0]} titulo={m[1]} apoio={m[2]} ligada={ctx.moduloLigado(m[0])} data-a={'aparece-' + m[0]} aoMudar={on => ctx.ligaModulo(m[0], on)} />)}
      </div>
      <Acoes><Botao onClick={() => ctx.fechaFolha()}>Pronto</Botao></Acoes>
    </Folha>
  );
}

/**
 * O CARDIO RÁPIDO: modalidade, minutos e intensidade, cada um num toque, e um
 * botão que grava agora. O aviso do dia de perna sinaliza e não bloqueia (a
 * regra é do treinador, e quem decide é a pessoa). Dados: `ctx.cromoDoTreino`.
 */
export function FolhaCardioV3({ ctx }) {
  const c = ctx.cromoDoTreino().cardio;
  return (
    <Folha titulo="Cardio" sub={c.resumo} aoFechar={() => ctx.fechaFolha()}>
      <CamposDoCardio campos={c} prefixo="cardio-" aoTocar={(campo, k) => ctx.cardioSet(campo, k)} />
      {c.aviso && <p class="v3-atencao" role="note">{c.aviso}</p>}
      <Acoes><Botao data-a="cardio-grava" onClick={() => { ctx.fechaFolha(); ctx.addCardio(); }}>{c.acao}</Botao></Acoes>
      <Apoio>Esqueceu de anotar um cardio de outro dia? Ele entra pelo dia, em Dias.</Apoio>
    </Folha>
  );
}

/**
 * O TIPO DO DIA: confirma ou corrige o palpite da cadência (treino ou
 * descanso), e os ajustes de hoje que dependem dele: o turno do treino, a
 * demanda alta e como foi o dia. Muda o plano da comida de hoje, e mais nada.
 * Dados: `ctx.seletorDeDia`.
 */
export function FolhaTipoDoDia({ ctx }) {
  const d = ctx.seletorDeDia();
  const ordem = d.cadencia === 'descanso' ? ['descanso', 'treino'] : ['treino', 'descanso'];
  const turno = d.turnos.filter(t => t.on)[0];
  return (
    <Folha titulo={d.pergunta} sub={d.sub} aoFechar={() => ctx.fechaFolha()}>
      {!d.fato && (
        <div class="v3-escolhas">
          {ordem.map(k => (
            <Linha key={k} data-a={'dia-e-' + k} marca={d.cadencia === k ? ic.ok : ''}
                   titulo={k === 'descanso' ? 'É descanso' : 'Vou treinar hoje'}
                   apoio={k === 'descanso' ? d.efeitoDescanso : d.efeitoTreino}
                   aoTocar={() => ctx.setCadenciaV3(k)} />
          ))}
        </div>
      )}
      {d.cadencia === 'descanso' && (
        <>
          <p class="v3-rotulo">Já fiz alguma coisa hoje</p>
          <Fichas rotulo="Já fiz alguma coisa hoje" prefixo="jafiz-" aoTocar={k => ctx.jaFizHoje(k)}
                  opcoes={[{ k: 'cardio', t: 'Cardio' }, { k: 'aula', t: 'Aula' }, { k: 'fora', t: 'Treino fora da prescrição' }]} />
          <Apoio>Cardio em dia de descanso fica no descanso: não é treino.</Apoio>
        </>
      )}
      {d.cadencia === 'treino' && (
        <>
          <p class="v3-rotulo">O turno do treino</p>
          <Fichas rotulo="O turno do treino" prefixo="turno-" aoTocar={k => ctx.setTurnoV3(k)}
                  opcoes={d.turnos.map(t => ({ k: t.k, t: t.n + ' · ' + t.hora.replace(':', 'h'), on: t.on }))} />
          <Apoio>Anda o pré-treino e o intra; as outras refeições ficam na hora delas.{turno && turno.pos ? ' O pós-treino passa a ser o ' + turno.pos.toLowerCase() + '.' : ''}</Apoio>
        </>
      )}
      <Chave titulo="Demanda alta" apoio="entra o carboidrato extra do intra-treino; para o dia de perna pesada"
             ligada={d.alta} data-a="dia-alta" aoMudar={on => ctx.setAlta(on)} />
      <p class="v3-rotulo">Como foi o dia</p>
      <Fichas rotulo="Como foi o dia" prefixo="aderencia-" aoTocar={k => ctx.setAderencia(k)}
              opcoes={d.aderencias.map(x => ({ k: x.k, t: x.t, on: d.aderencia === x.k }))} />
      <Apoio>Entra na régua da comida: com menos de 11 dos últimos 14 dias que dão para ler, o app avisa do ganho mas não tira comida do plano.</Apoio>
      <Acoes><Botao data-a="dia-pronto" onClick={() => ctx.fechaFolha()}>Pronto</Botao></Acoes>
    </Folha>
  );
}
