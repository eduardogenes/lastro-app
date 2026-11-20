// O HOJE no visual novo (Fase 4): o bloco do momento, a linha do dia, o "se
// quiser" (só o que estiver ligado), o ritmo dos últimos sete dias e a
// pergunta de ontem. E as folhas do "+" (com o texto livre), da refeição e de
// "o que aparece". Protótipo: docs/redesign-3/prototipos/hoje.html. Dados:
// `ctx.hojeV3`, `ctx.refeicaoV3`; a regra do momento é `cartaoDeCima`.

import { useEffect, useLayoutEffect, useState } from 'preact/hooks';
import { ic } from '../icones.jsx';
import { CamposDoCardio } from '../cardio.jsx';
import { contracaoDe } from '../../../dominio/formato';
import { Acoes, Apoio, Bloco, Botao, Cabecalho, Caixa, Chave, Escolha, Fichas, Folha, Linha, Pequeno, Pergunta, Radios, Saida, Secao, Segmentos, Seletor, radio } from '../base.jsx';

const RESPOSTAS = [{ k: 'sim', t: 'Foi, sim' }, { k: 'quase', t: 'Quase' }, { k: 'naosei', t: 'Não sei dizer' }];

function Momento({ ctx, h }) {
  const b = h.bloco;
  // a data diz também o tipo do dia, e tocar confirma ou corrige (folha `dia`)
  const data = <>{h.data} · <span class="v3-n">{h.hora.replace(':', 'h')}</span></>;
  const linha0 = <>{b.k === 'semTreino' ? <span>{data}</span> : <button data-a="hoje-tipo" onClick={() => ctx.abreFolha({ k: 'dia' })}
                           aria-label={h.data + ', ' + (h.tipo === 'descanso' ? 'descanso' : 'dia de treino') + '. Mudar o tipo do dia'}>
      {data} · {h.tipo === 'descanso' ? 'descanso' : 'treino'}{ic.baixo}</button>}
    <button onClick={() => ctx.abreFolha({ k: 'oQueAparece' })} aria-label="Escolher o que aparece" data-a="hoje-aparece">{ic.ajuste}</button></>;
  let acoes = null;
  if (b.k === 'semTreino') {
    acoes = <><Acoes><Botao data-a="hoje-por-treino" onClick={ctx.abreRevisao}>Pôr o meu treino {ic.seta}</Botao></Acoes>
      <Saida data-a="hoje-treino-livre" onClick={ctx.lancaTreinoDeHoje}>Registrar um treino livre</Saida></>;
  } else if (b.k === 'sessao') {
    acoes = b.pergunta
      ? <><Acoes><Botao data-a="hoje-continuo" onClick={ctx.continuaSessao}>Continuo treinando</Botao>
            <Botao tipo="contorno" data-a="hoje-parei" onClick={ctx.encerraSessaoEsquecida}>Já parei</Botao></Acoes>
          <Saida data-a="hoje-fiz-mais" onClick={ctx.poeEmDiaDaSessao}>Fiz mais do que anotei</Saida></>
      : <Acoes><Botao data-a="hoje-volta" onClick={ctx.voltaAoTreino}>Voltar ao treino {ic.seta}</Botao></Acoes>;
  } else if (b.k === 'confirmar') {
    acoes = <Acoes><Botao data-a="hoje-fim-ok" onClick={() => ctx.confirmaDuracao(b.fim)}>Está certo</Botao>
      <Botao tipo="contorno" data-a="hoje-fim-corrige" onClick={() => ctx.abreSessaoDoDia({ k: 'sessao', t: b.fim })}>Corrigir</Botao></Acoes>;
  } else if (b.k === 'treino' || b.k === 'aula') {
    // "hoje não vou" abre o tipo do dia: diz o efeito antes do toque (a comida de descanso)
    acoes = <><Acoes><Botao data-a="hoje-comeca" onClick={ctx.abreTreinoDeHoje}>{b.k === 'aula' ? 'Fiz a aula' : 'Começar'} {ic.seta}</Botao></Acoes>
      <div class="v3-saidas">
        <Saida data-a="hoje-nao-treino" onClick={() => ctx.abreFolha({ k: 'dia' })}>{b.k === 'aula' ? 'Hoje não vou' : 'Hoje não vou treinar'}</Saida>
        {b.k === 'treino' && <Saida data-a="hoje-ja-treinei" onClick={ctx.lancaTreinoDeHoje}>Já treinei e não anotei</Saida>}
      </div></>;
  } else if (b.k === 'refeicao') {
    acoes = <><Acoes><Botao data-a="hoje-comi" onClick={() => comi(ctx, b)}>{ic.ok} Comi</Botao>
            <Botao tipo="contorno" data-a="hoje-ver" onClick={() => ctx.abreFolha({ k: 'refeicao', id: b.id })}>Ver</Botao></Acoes>
          <Saida data-a="hoje-nao-comi" onClick={() => ctx.abreFolha({ k: 'refeicao', id: b.id, diferente: true })}>Não foi assim</Saida></>;
  } else if (b.k === 'noite') {
    acoes = <><Acoes><Botao data-a="noite-sim" onClick={() => ctx.respondeHojeComDesfazer('sim')}>Foi, sim</Botao>
        <Botao tipo="contorno" data-a="noite-quase" onClick={() => ctx.respondeHojeComDesfazer('quase')}>Quase</Botao></Acoes>
      <Saida data-a="noite-naosei" onClick={() => ctx.respondeHojeComDesfazer('naosei')}>Não sei dizer</Saida></>;
  }
  return (
    <Bloco cor={b.cor} medio={b.k === 'semTreino' ? false : undefined} chave={b.k + (b.id || '')} fino={b.fino} vivo={b.vivo} linha0={linha0}
           quando={b.quando} titulo={b.titulo} apoio={b.apoio}>
      {acoes}
    </Bloco>
  );
}

/**
 * "COMI", do bloco: grava na hora e, como o bloco já passa ao próximo momento,
 * o aviso oferece desfazer (03-padroes-e-voz.md, "Desfazer em vez de perguntar").
 */
function comi(ctx, b) {
  ctx.marcaLinhaDaComida(b.id, 'tudo');
  ctx.avisaComDesfazer(b.titulo + ' marcado como o plano.', () => ctx.marcaLinhaDaComida(b.id, 'desfaz'));
}

/**
 * A AÇÃO QUE GRUDA NO TOPO (02-componentes.md, §1): quando o bloco do momento
 * sai da tela, o nome e o botão principal dele ficam numa pílula no topo. O
 * "+" da doca, embaixo, sugere a mesma ação para quem tem uma mão só.
 */
function Gruda({ ctx, b }) {
  const [on, setOn] = useState(false);
  useLayoutEffect(() => {
    const mede = () => {
      const el = document.querySelector('main .v3-bloco');
      setOn(!!el && el.getBoundingClientRect().bottom < 70);
    };
    mede();
    window.addEventListener('scroll', mede, { passive: true });
    return () => window.removeEventListener('scroll', mede);
  }, []);
  const g = b.k === 'treino' ? ['Começar', ctx.abreTreinoDeHoje]
    : b.k === 'aula' ? ['Fiz a aula', ctx.abreTreinoDeHoje]
    : b.k === 'sessao' && !b.pergunta ? ['Voltar', ctx.voltaAoTreino]
    : b.k === 'refeicao' ? ['Comi', () => comi(ctx, b)]
    : b.k === 'noite' ? ['Foi, sim', () => ctx.respondeHojeComDesfazer('sim')]
    : null;
  if (!g) return null;
  return (
    <div class={'v3-gruda' + (on ? ' on' : '')} aria-hidden={on ? undefined : 'true'} style={`--v3-cor:${'var(--' + ({ treino: 'assunto-treino', sessao: 'assunto-treino', aula: 'assunto-corpo', refeicao: 'assunto-refeicao', noite: 'assunto-corpo' })[b.k] + ')'}`}>
      <span>{b.k === 'noite' ? 'A comida de hoje' : b.titulo}{(b.sub || b.k === 'noite') && <small>{b.k === 'noite' ? 'foi como o plano?' : b.sub}</small>}</span>
      <button data-a="gruda-acao" tabindex={on ? undefined : '-1'} onClick={g[1]}>{g[0]}</button>
    </div>
  );
}

const INICIO = [
  ['Seu treino', 'De onde vem o seu treino?', 'O app não monta treino: ele executa o que foi prescrito para você.'],
  ['Sua comida', 'E a comida?', 'Com um plano, o registro vira uma pergunta por dia. Sem plano, o app só não acompanha comida.'],
  ['O que acompanhar', 'O que mais você quer ver?', 'Nada aqui é obrigatório, e tudo se liga e desliga depois.']
];
const FONTES = [
  [[ic.texto, 'Tenho o texto do treinador', 'Você cola e o app organiza em treinos e séries.'],
   [ic.halter, 'Monto depois', 'Dá para registrar treino livre enquanto isso.']],
  [[ic.prato, 'Tenho um plano alimentar', 'Você monta as refeições no Plano, uma vez.'],
   [ic.x, 'Não acompanho comida', 'A parte de comida fica desligada. Dá para ligar depois.']]
];
const ACOMPANHAR = [
  ['peso', 'Peso', 'a pesagem da manhã'], ['agua', 'Água', 'contar copos'],
  ['cardio', 'Cardio', 'sessões da semana'], ['fotos', 'Fotos do corpo', 'sessão padronizada a cada 14 dias']
];

export function PrimeiraVez({ ctx }) {
  const passo = ctx.passoInicial(), e = ctx.escolhasIniciais();
  const [titulo, pergunta, apoio] = INICIO[passo - 1];
  const campo = passo === 1 ? 'treinador' : 'comida';
  useLayoutEffect(() => { document.querySelector('.v3-inicio h1')?.focus({ preventScroll: true }); }, [passo]);
  return <main class="v3-acao v3-inicio">
    <div class="v3-acao-topo"><Cabecalho titulo={titulo} reservaVoltar aoVoltar={passo > 1 && ctx.voltaInicio}
      acao={<Saida data-a="inicio-pular" onClick={() => ctx.avancaInicio(true, passo)}>pular</Saida>} /></div>
    <Segmentos total={3} feitos={passo - 1} rotulo={`Passo ${passo} de 3`} />
    <section class="v3-acao-meio cima">
      <h2>{pergunta}</h2><Apoio>{apoio}</Apoio>
      {passo < 3 ? <Radios rotulo={pergunta}>
        {FONTES[passo - 1].map(([icone, nome, detalhe], i) =>
          <Escolha key={nome} icone={icone} titulo={nome} apoio={detalhe} ligada={e[campo] === (i === 0)}
            aoMudar={() => ctx.escolheInicio(campo, i === 0)} />)}
      </Radios> : <div class="v3-ligar">
        {ACOMPANHAR.map(([k, nome, detalhe]) => <Chave key={k} titulo={nome} apoio={detalhe} ligada={e[k]}
          data-a={'inicio-' + k} aoMudar={v => ctx.escolheInicio(k, v)} />)}
      </div>}
    </section>
    <div class="v3-acao-pe"><Botao data-a="inicio-continuar" onClick={() => ctx.avancaInicio(false, passo)}>
      {passo === 3 ? 'Abrir o app' : 'Continuar'} {ic.seta}
    </Botao></div>
    <div class="v3-acao-links">{passo === 1 &&
      <Saida data-a="inicio-recuperar" onClick={() => ctx.abreAjustes()}>Já uso o app em outro aparelho</Saida>}
    </div>
  </main>;
}

export function HojeV3({ ctx }) {
  const h = ctx.hojeV3();
  const q = h.seQuiser;
  const tem = q.agua || q.peso || q.cardio;
  return (
    <div class="v3" style={'--cor-agora:var(--assunto-' + h.bloco.cor + ')'}>
      <Momento ctx={ctx} h={h} />
      <Gruda ctx={ctx} b={h.bloco} />
      {h.bloco.k === 'semTreino' ? <Secao titulo="Enquanto isso">
        <Linha titulo="Colar o texto do treinador" apoio="o app organiza em treinos e séries" aoTocar={ctx.abreRevisao} />
        <Linha titulo="Escolher o que acompanhar" apoio="peso, água, cardio, fotos" aoTocar={() => ctx.abreFolha({ k: 'oQueAparece' })} />
      </Secao> : <Secao titulo="O dia" nota={h.feitas + ' de ' + h.linha.length}>
        {!h.comida && h.linha.length === 1 && h.linha[0].treino ?
          <Linha marca={ic.halter} marcaTom="dia" titulo={h.linha[0].n} apoio={h.linha[0].t.replace(':', 'h') + ' · ' + h.linha[0].series + ' séries'}
            data-a={'linha-' + h.linha[0].id} aoTocar={ctx.abreTreinoDeHoje} /> : <>
        <div class="v3-ld" role="list">
          {h.linha.map(x => (
            <button key={x.id} role="listitem" class={x.feita ? 'ok' : x.agora && h.bloco.k !== 'noite' ? 'agora' : x.falta ? 'falta' : undefined}
                    data-a={'linha-' + x.id} aria-label={x.n + ', ' + x.t.replace(':', 'h') + (x.feita ? ', feito' : x.falta ? ', sem resposta' : '')}
                    onClick={() => x.treino ? ctx.abreTreinoDeHoje() : ctx.abreFolha({ k: 'refeicao', id: x.id })}>
              <span class="p">{x.feita ? ic.ok : x.treino ? ic.halter : ic.prato}</span>
              <span class="v3-n">{x.t.replace(':', 'h')}</span>
            </button>
          ))}
        </div>
        {h.proxima && <p class="v3-ld-leg">
          <span>a seguir: <b>{h.proxima.n}</b>, {h.proxima.t.replace(':', 'h')}</span>
          {h.proxima.kcal ? <span class="v3-n">{h.proxima.kcal} kcal</span> : null}
        </p>}</>}
      </Secao>}
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
              <button class="v3-gota cardio" data-a="hoje-cardio" onClick={ctx.abreCardio}>
                <span class="nivel" style={'height:' + Math.min(100, q.cardio.n / q.cardio.meta * 100) + '%'} />
                <span class="rt">Cardio</span><span class="v v3-n">{q.cardio.n}<small> /{q.cardio.meta}</small></span>
              </button>
            )}
          </div>
        </Secao>
      )}
      {(h.bloco.k !== 'semTreino' || h.temHistorico) && <Secao titulo="Seu ritmo" nota="últimos 7 dias">
        <div class="v3-ritmo">
          {h.ritmo.map(d => (
            <button key={d.data} onClick={() => ctx.vaiPara('dias')}
                    aria-label={(d.hoje ? 'hoje, ' : '') + d.nome + (d.treino ? ', treino ' + d.treino : ', sem treino') +
                      (d.comida ? ', comida ' + ({ cheia: 'como o plano', meia: 'quase', vazia: 'sem resposta' })[d.comida] : '')}>
              <span class={'bola ' + (d.treino ? 'cheia' : d.comida === 'meia' ? 'meia' : !d.hoje && d.emBranco ? 'vazia' : '') + (d.hoje ? ' hoje' : '')}>{d.treino || ''}</span>{d.letra}
            </button>
          ))}
        </div>
        <LegendaDoRitmo ritmo={h.ritmo} />
        {h.lembrete && (
          <Caixa tom="corpo" data-a="hoje-lembrete" titulo={h.lembrete.t} nota={h.lembrete.apoio}>
            <Pequeno cheio data-a="lembrete-abre" onClick={ctx.abreCentroDasFotos}>Abrir as fotos</Pequeno>
            <Pequeno data-a="lembrete-dispensa" onClick={ctx.dispensaLembrete}>Agora não</Pequeno>
          </Caixa>
        )}
        {h.ontem && (
          <Pergunta pergunta="Ontem ficou em branco. Foi como o plano?" respostas={RESPOSTAS} valor={null}
                    aoResponder={k => ctx.respondeODia(h.ontem, k)} />
        )}
      </Secao>}
      <div class="v3-fim-da-tela" />
    </div>
  );
}

/** A legenda do ritmo: só os tipos de dia que aparecem na semana, com a mesma bola. */
function LegendaDoRitmo({ ritmo }) {
  const tem = { cheia: false, meia: false, vazia: false, sem: false };
  ritmo.forEach(d => {
    if (d.treino) tem.cheia = true;
    else if (d.comida === 'meia') tem.meia = true;
    else if (!d.hoje && d.emBranco) tem.vazia = true;
    else if (!d.hoje) tem.sem = true;
  });
  const itens = [['cheia', 'treino'], ['meia', 'comida quase'], ['vazia', 'em branco'], ['sem', 'sem treino']].filter(([k]) => tem[k]);
  if (itens.length < 2) return null;
  return (
    <div class="v3-legm v3-ritmo-leg" aria-hidden="true">
      {itens.map(([k, t]) => <span key={k}><i class={k} />{t}</span>)}
    </div>
  );
}

/**
 * UMA REFEIÇÃO: o que tem nela, e marcar. "Não foi assim" troca para as
 * respostas da exceção (`f.diferente`), em linhas: o app separa quem comeu
 * outra coisa de quem não comeu.
 */
const FRASE_DA_MARCA = { tudo: ' marcado como o plano.', metade: ': comi metade.', fora: ': outra coisa.', nao: ': não comi.', nsei: ' fica fora da conta.' };
/** O tamanho do "comi outra coisa", em palavra, depois de "outra coisa, ". */
export const PALAVRA_DO_TAMANHO = { parecido: 'parecido', mais: 'bem mais', menos: 'bem menos', nsei: 'sem saber o tamanho' };
/** "outra coisa" e, quando foi dito, o tamanho. */
export const outraCoisa = tam => 'outra coisa' + (tam && PALAVRA_DO_TAMANHO[tam] ? ', ' + PALAVRA_DO_TAMANHO[tam] : '');
/** O "como" que esta versão do app sabe mostrar e refazer. */
const COMO_CONHECIDO = { fora: 1, nao: 1, nsei: 1 };
/** A marca de uma refeição de hoje, em palavra ("como o plano", "outra coisa, bem mais", "não comi"…). */
const palavraDaMarca = r => r.como && !COMO_CONHECIDO[r.como] ? 'marcada por uma versão mais nova do app'
  : r.como === 'fora' ? outraCoisa(r.tam) : r.como === 'nao' ? 'não comi' : r.como === 'nsei' ? 'não sei' : r.metade ? 'metade' : 'como o plano';
export function FolhaRefeicaoV3({ ctx, f }) {
  const r = ctx.refeicaoV3(f.id);
  // ao trocar para "não foi assim", o botão que tinha o foco some: o foco entra na folha
  useEffect(() => {
    if (!f.diferente) return;
    const fs = document.querySelectorAll('.v3-folha');
    const el = fs[fs.length - 1];
    if (el) el.focus({ preventScroll: true });
  }, [f.diferente]);
  if (!r) return null;
  // grava na hora; o aviso oferece desfazer (a folha fecha, e o efeito fica longe dela)
  const marca = k => {
    ctx.fechaFolha();
    if (k === 'desfaz') {
      // desfazer o desmarcar devolve a marca inteira, com o tamanho dela
      const antes = r.como || (r.metade ? 'metade' : 'tudo'), tam = r.tam;
      ctx.marcaLinhaDaComida(r.id, 'desfaz');
      ctx.avisaComDesfazer(r.n + ' desmarcado.', () => ctx.marcaLinhaDaComida(r.id, antes, tam));
      return;
    }
    ctx.marcaLinhaDaComida(r.id, k);
    ctx.avisaComDesfazer(r.n + FRASE_DA_MARCA[k], () => ctx.marcaLinhaDaComida(r.id, 'desfaz'));
  };
  const hora = r.t.replace(':', 'h') + ' · ' + r.kcal + ' kcal';
  if (f.diferente && !r.feita) {
    return (
      <Folha titulo={r.n} sub="O que aconteceu? Não precisa detalhar." aoFechar={() => ctx.fechaFolha()}>
        <div class="v3-opcoes">
          <Linha marca={ic.prato} titulo="Comi outra coisa" apoio="diga o tamanho, sem pesar nada" data-a="ref-fora" aoTocar={() => ctx.trocaFolha({ k: 'comiOutra', id: r.id }, true)} />
          <Linha marca={ic.prato} titulo="Comi metade" apoio="a mesma refeição, menos" semSeta data-a="ref-metade" aoTocar={() => marca('metade')} />
          <Linha marca={ic.x} titulo="Não comi" apoio='fica anotado; a regra conta o dia como "quase"' semSeta data-a="ref-nao" aoTocar={() => marca('nao')} />
          <Linha marca={ic.duvida} titulo="Não sei dizer" apoio="fica fora da conta" semSeta data-a="ref-nsei" aoTocar={() => marca('nsei')} />
        </div>
      </Folha>
    );
  }
  return (
    <Folha titulo={r.n} sub={hora + (r.feita ? ' · ' + palavraDaMarca(r) : '')}
           aoFechar={() => ctx.fechaFolha()}>
      <div class="v3-itens">{r.itens.map(i => <div key={i.n}><span>{i.n}</span><span class="v3-n">{i.q}</span></div>)}</div>
      {r.nota && <Apoio>{r.nota}</Apoio>}
      {r.feita
        ? <><Acoes><Botao tipo="contorno" cheio data-a="ref-desfaz" onClick={() => marca('desfaz')}>Desmarcar</Botao></Acoes>
            <Saida onClick={() => { ctx.fechaFolha(); ctx.editaRefeicao(r.id); }}>Corrigir o que comi</Saida></>
        : <Acoes><Botao data-a="ref-tudo" onClick={() => marca('tudo')}>{ic.ok} Comi</Botao>
            <Botao tipo="contorno" data-a="ref-diferente" onClick={() => ctx.mudaFolha({ diferente: true })}>Não foi assim</Botao></Acoes>}
    </Folha>
  );
}

/**
 * "COMI OUTRA COISA", COM O TAMANHO (ds-telas.js, "f-comi-outra"). Decisão do
 * dono (17/11/2026): o tamanho é guardado, comparado ao da refeição do plano,
 * sem pesar nem listar. Quatro respostas grandes e "✓ Guardar", que só vale com
 * uma escolhida: começar com uma marcada empurraria a resposta. Grava a marca
 * `'fora'` com o tamanho (`marcaLinhaDaComida`), e o aviso desfaz.
 *
 * Chega trocando a folha de onde veio (a refeição, o "+"), e o Voltar a
 * devolve (02 §8). Se a refeição for marcada enquanto a pessoa escolhe (a
 * sincronia trouxe a marca do outro aparelho), "Guardar" não fecha calado: a
 * folha diz o que está marcado e oferece trocar.
 */
const TAMANHOS = [
  { k: 'parecido', t: 'Parecido', a: 'mesma quantidade' },
  { k: 'mais', t: 'Bem mais', a: 'refeição grande' },
  { k: 'menos', t: 'Bem menos', a: 'quase nada' },
  { k: 'nsei', t: 'Não sei', a: 'não lembro quanto foi' }
];
export function FolhaComiOutra({ ctx, f }) {
  const r = ctx.refeicaoV3(f.id);
  const [tam, setTam] = useState(null);
  const [conflito, setConflito] = useState(false);
  if (!r) return null;
  const aviso = () => ctx.avisaComDesfazer(r.n + ': ' + outraCoisa(tam) + '.', () => ctx.marcaLinhaDaComida(r.id, 'desfaz'));
  const guarda = () => {
    if (!tam) return;
    if (ctx.refeicaoV3(r.id).feita) { setConflito(true); return; }
    ctx.concluiFolha();
    ctx.marcaLinhaDaComida(r.id, 'fora', tam);
    aviso();
  };
  // trocar a marca que chegou por esta; desfazer devolve a que estava
  const trocaAMarca = () => {
    const a = ctx.refeicaoV3(r.id);
    const volta = a.como || (a.metade ? 'metade' : 'tudo'), tamVolta = a.tam;
    ctx.concluiFolha();
    ctx.marcaLinhaDaComida(r.id, 'desfaz');
    ctx.marcaLinhaDaComida(r.id, 'fora', tam);
    ctx.avisaComDesfazer(r.n + ': ' + outraCoisa(tam) + '.', () => {
      ctx.marcaLinhaDaComida(r.id, 'desfaz');
      ctx.marcaLinhaDaComida(r.id, volta, tamVolta);
    });
  };
  if (conflito && r.feita && r.como && !COMO_CONHECIDO[r.como]) {
    // a marca que chegou é de uma versão mais nova: trocar a apagaria sem volta
    // (o desfazer daqui não sabe refazê-la), então só se deixa como está
    return (
      <Folha titulo="Comi outra coisa" sub={'Enquanto você escolhia, a marca ' + contracaoDe(r.n) + ' chegou de outro aparelho.'}
             aoFechar={() => ctx.fechaFolha()}>
        <Caixa tom="atencao" data-a="tam-conflito" titulo="Está marcada por uma versão mais nova do app."
               nota="Para não perder o que ela guardou, trocar fica para depois de atualizar este aparelho." />
        <Acoes><Botao data-a="tam-deixa" onClick={() => ctx.concluiFolha()}>Deixar como está</Botao></Acoes>
      </Folha>
    );
  }
  if (conflito && r.feita) {
    return (
      <Folha titulo="Comi outra coisa" sub={'Enquanto você escolhia, a marca ' + contracaoDe(r.n) + ' chegou de outro aparelho.'}
             aoFechar={() => ctx.fechaFolha()}>
        <Caixa tom="atencao" data-a="tam-conflito" titulo={'Está marcado: ' + palavraDaMarca(r) + '.'}
               nota={'Trocar deixa “' + outraCoisa(tam) + '” no lugar. Dá para desfazer.'} />
        <Acoes><Botao data-a="tam-troca" onClick={trocaAMarca}>{ic.ok} Trocar</Botao></Acoes>
        <Saida data-a="tam-deixa" onClick={() => ctx.concluiFolha()}>Deixar como está</Saida>
      </Folha>
    );
  }
  return (
    <Folha titulo="Comi outra coisa" sub={'No lugar ' + contracaoDe(r.n) + '. Não precisa pesar nem listar: só o tamanho, comparado ao do plano.'} aoFechar={() => ctx.fechaFolha()}>
      <Radios classe="v3-tam" rotulo="Tamanho">
        {TAMANHOS.map((o, i) => (
          <button key={o.k} {...radio(tam === o.k, i === 0, !!tam)} data-a={'tam-' + o.k} onClick={() => setTam(o.k)}>
            <b>{o.t}</b><span>{o.a}</span>
          </button>
        ))}
      </Radios>
      <Acoes><Botao data-a="tam-guarda" aria-disabled={tam ? undefined : 'true'} onClick={guarda}>{ic.ok} Guardar</Botao></Acoes>
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
      <div class="v3-reg">
        {b.k === 'refeicao' && <button class="v3-reg-b pri" data-a="reg-comi" onClick={faz(() => ctx.marcaLinhaDaComida(b.id, 'tudo'))}><b>Comi: {b.titulo}</b><span>como o plano</span></button>}
        {(b.k === 'treino' || b.k === 'aula') && <button class="v3-reg-b pri" data-a="reg-treino" onClick={faz(ctx.abreTreinoDeHoje)}><b>Começar: {b.titulo}</b><span>o treino de hoje</span></button>}
        {b.k === 'noite' && <button class="v3-reg-b pri" data-a="reg-noite" onClick={faz(() => ctx.respondeODia(ctx.hojeISO(), 'sim'))}><b>Hoje foi como o plano</b><span>responde as que faltam</span></button>}
        {h.seQuiser.agua && <button class="v3-reg-b" data-a="reg-agua" onClick={ctx.maisUmCopo}><b>+1 copo de água</b><span>{h.seQuiser.agua.n} de {h.seQuiser.agua.meta} hoje</span></button>}
        {h.seQuiser.peso && <button class="v3-reg-b" data-a="reg-peso" onClick={faz(() => ctx.vaiPara('corpo'))}><b>Peso de hoje</b><span>{h.seQuiser.peso.hoje ? h.seQuiser.peso.hoje + ' kg · mudar' : 'pela régua do Corpo'}</span></button>}
        {h.seQuiser.cardio && <button class="v3-reg-b" data-a="reg-cardio" onClick={faz(ctx.abreCardio)}><b>Cardio</b><span>{h.seQuiser.cardio.n} de {h.seQuiser.cardio.meta} na semana</span></button>}
        {b.k === 'refeicao' && <button class="v3-reg-b" data-a="reg-outra" onClick={() => ctx.trocaFolha({ k: 'comiOutra', id: b.id }, true)}><b>Comi outra coisa</b><span>fora do plano</span></button>}
        <button class="v3-reg-b" data-a="reg-ja-treinei" onClick={faz(ctx.lancaTreinoDeHoje)}><b>Já treinei e não anotei</b><span>o treino de hoje, depois</span></button>
      </div>
    </Folha>
  );
}

/** O que aparece: treino e comida sempre; o resto, quem decide é a pessoa. */
export function FolhaOQueAparece({ ctx }) {
  const M = [['comida', 'Comida', 'o plano e as refeições do dia'], ['agua', 'Água', 'contar copos'], ['peso', 'Peso', 'a pesagem da manhã'], ['cardio', 'Cardio', 'as duas sessões da semana'],
             ['dobras', 'Dobras', 'adipômetro, no Corpo'], ['fotos', 'Fotos do corpo', 'sessão a cada 14 dias']];
  return (
    <Folha titulo="O que aparece" sub="O treino fica sempre. O resto é seu: ligue só o que for usar. Desligar não apaga nada." aoFechar={() => ctx.fechaFolha()}>
      <div class="v3-ligar">
        {M.map(m => <Chave key={m[0]} titulo={m[1]} apoio={m[2]} ligada={ctx.moduloLigado(m[0])} data-a={'aparece-' + m[0]} aoMudar={on => ctx.ligaModulo(m[0], on)} />)}
      </div>
      {/* a porta dos Ajustes: conta, cópia de segurança, lembretes e o que apaga */}
      <div class="v3-ligar">
        <Linha titulo="Ajustes" apoio="conta, cópia de segurança, lembretes" data-a="aparece-ajustes"
               aoTocar={() => ctx.abreAjustes(true)} />
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
          <Seletor rotulo="O tipo do dia" prefixo="dia-e-" valor={d.cadencia} aoMudar={k => ctx.setCadenciaV3(k)}
                   opcoes={[{ k: 'treino', t: 'Treino' }, { k: 'descanso', t: 'Descanso' }]} />
          <Apoio>{d.cadencia === 'descanso' ? 'Com descanso, ' + d.efeitoDescanso + '.' : 'Com treino, ' + d.efeitoTreino + '.'}</Apoio>
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
          <div class="v3-sec-h v3-folha-h"><h3>Turno</h3><small>muda os horários das refeições</small></div>
          <Seletor rotulo="O turno do treino" prefixo="turno-" valor={turno ? turno.k : null} aoMudar={k => ctx.setTurnoV3(k)}
                   opcoes={d.turnos.map(t => ({ k: t.k, t: t.n }))} />
          <Apoio>{turno ? 'Treino às ' + turno.hora.replace(':', 'h') + '. ' : ''}Anda o pré-treino e o intra; as outras refeições ficam na hora delas.{turno && turno.pos ? ' O pós-treino passa a ser o ' + turno.pos.toLowerCase() + '.' : ''}</Apoio>
        </>
      )}
      <div class="v3-ligar">
        <Chave titulo="Demanda alta" apoio="entra o carboidrato extra do intra-treino; para o dia de perna pesada"
               ligada={d.alta} data-a="dia-alta" aoMudar={on => ctx.setAlta(on)} />
        {d.cadencia === 'treino' && <Linha titulo="Já treinei hoje" apoio="registrar o treino que não anotou" data-a="dia-ja-treinei"
                                           aoTocar={() => { ctx.fechaFolha(); ctx.lancaTreinoDeHoje(); }} />}
      </div>
      <p class="v3-rotulo">Como foi o dia</p>
      <Fichas rotulo="Como foi o dia" prefixo="aderencia-" aoTocar={k => ctx.setAderencia(k)}
              opcoes={d.aderencias.map(x => ({ k: x.k, t: x.t, on: d.aderencia === x.k }))} />
      <Apoio>Entra na régua da comida: com menos de 11 dos últimos 14 dias que dão para ler, o app avisa do ganho mas não tira comida do plano.</Apoio>
      <Acoes><Botao data-a="dia-pronto" onClick={() => ctx.fechaFolha()}>Pronto</Botao></Acoes>
    </Folha>
  );
}
