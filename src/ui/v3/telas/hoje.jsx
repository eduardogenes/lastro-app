// O HOJE no visual novo (Fase 4): o bloco do momento, a linha do dia, o "se
// quiser" (só o que estiver ligado), o ritmo dos últimos sete dias e a
// pergunta de ontem. E as folhas do "+" (com o texto livre), da refeição e de
// "o que aparece". Protótipo: docs/redesign-3/prototipos/hoje.html. Dados:
// `ctx.hojeV3`, `ctx.refeicaoV3`; a regra do momento é `cartaoDeCima`.

import { useState } from 'preact/hooks';
import { ic } from '../icones.jsx';
import { Acoes, Apoio, Bloco, Botao, Chave, Folha, Pergunta, Saida, Secao } from '../base.jsx';

const RESPOSTAS = [{ k: 'sim', t: 'Foi, sim' }, { k: 'quase', t: 'Quase' }, { k: 'naosei', t: 'Não sei dizer' }];

function Momento({ ctx, h }) {
  const b = h.bloco;
  const linha0 = <><span>{h.data} · <span class="v3-n">{h.hora.replace(':', 'h')}</span></span>
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
      <Saida data-a="hoje-ja-treinei" onClick={ctx.lancaTreinoDeHoje}>Já treinei e não anotei</Saida></>;
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

export function HojeV3({ ctx }) {
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
