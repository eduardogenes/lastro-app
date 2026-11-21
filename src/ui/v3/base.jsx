// Os componentes base do visual novo (direção 3). Tela nova se monta com eles;
// a lista e o papel de cada um estão no DESIGN.md. Todos são só apresentação:
// recebem dados e funções prontos, e não leem o estado do app.

import { Fragment } from 'preact';
import { useContext, useEffect, useRef } from 'preact/hooks';
import { ic } from './icones.jsx';
// O comportamento de camada é o mesmo do visual antigo, e por isso vem de lá:
// a trava de rolagem é um contador só, e o isolamento acha a camada de cima
// entre as folhas dos dois visuais.
import { trava, destrava, abreCamada, LugarNaPilha, FolhaDaPilha } from './camada.js';
import { dita } from './regua.jsx';

const cls = (...p) => p.filter(Boolean).join(' ');

/**
 * A cor de um bloco ou de uma tela de ação, pelo PAPEL (docs/design-system/
 * tokens.css): a cor diz de que assunto é o momento, nunca se foi bom.
 * `treino`, `refeicao`, `corpo`, `semana`, `feito`, `atencao`, `quieta` (a
 * superfície quieta) e `fundo` (o papel).
 */
const CORES = { treino: 'assunto-treino', refeicao: 'assunto-refeicao', corpo: 'assunto-corpo', semana: 'assunto-semana',
                feito: 'assunto-feito', atencao: 'atencao', quieta: 'superficie-quieta', fundo: 'fundo' };
export const corDe = cor => `var(--${CORES[cor] || CORES.treino})`;

/**
 * O BLOCO DO MOMENTO: o topo de cor que diz o que importa agora.
 *
 * `cor` é o papel (`corDe`): `treino`, `refeicao`, `corpo`, `semana`, `feito`. `chave` identifica o momento: quando ela muda, o conteúdo entra
 * em sequência; enquanto é a mesma, um redesenho não reanima nada.
 * `fino` é a faixa de quando não há o que fazer. `medio` (o título em 36) é
 * calculado pelo tamanho do título quando não vem.
 */
/**
 * A faixa da barra do sistema (o `body::before` do global.css) toma a cor do
 * bloco colorido que encosta no topo: a cor sobe até o relógio, como num app
 * do iPhone. Rolado para longe, a faixa volta ao papel e nada do conteúdo
 * passa por baixo do relógio. Um vigia só, para a página inteira: olha o DOM a
 * cada mudança e a cada rolagem, e não depende da ordem em que as telas montam.
 */
let vigiaDoTopo = false;
function vigiaACorDoTopo() {
  if (vigiaDoTopo || typeof document === 'undefined') return;
  vigiaDoTopo = true;
  const raiz = document.documentElement;
  let pedido = 0;
  const pinta = () => {
    pedido = 0;
    let cor = '';
    const blocos = document.querySelectorAll('#app .v3-bloco');
    for (let i = 0; i < blocos.length; i++) {
      const el = blocos[i];
      if (el.closest('.v3-folha-w, [data-sai], [inert]')) continue;
      const r = el.getBoundingClientRect();
      if (r.top <= 1 && r.bottom > 2 && r.width > 0) { cor = getComputedStyle(el).backgroundColor; break; }
    }
    if (cor) { if (raiz.style.getPropertyValue('--cor-topo') !== cor) raiz.style.setProperty('--cor-topo', cor); }
    else if (raiz.style.getPropertyValue('--cor-topo')) raiz.style.removeProperty('--cor-topo');
  };
  const quadro = typeof requestAnimationFrame === 'function' ? requestAnimationFrame : f => setTimeout(f, 16);
  const agenda = () => { if (!pedido) pedido = quadro(pinta); };
  window.addEventListener('scroll', agenda, { passive: true });
  window.addEventListener('resize', agenda);
  if (typeof MutationObserver === 'function') new MutationObserver(agenda).observe(document.getElementById('app') || document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style'] });
  // a cor do bloco muda com transição: confere de novo quando ela termina
  document.addEventListener('transitionend', agenda, true);
  document.addEventListener('animationend', agenda, true);
  document.addEventListener('visibilitychange', agenda);
  window.addEventListener('pageshow', agenda);
  agenda();
}

export function Bloco({ cor = 'treino', linha0, quando, vivo, titulo, medio, apoio, fino, chave, children }) {
  // o título passa a 36 com mais de 12 letras, em todo lugar (02-componentes.md, §1)
  if (medio == null) medio = String(titulo == null ? '' : titulo).length > 12;
  const anima = Bloco.ultima !== chave && chave != null;
  Bloco.ultima = chave;
  useEffect(vigiaACorDoTopo, []);
  return (
    <section class={cls('v3-bloco', fino && 'fino')} style={`--v3-cor:${corDe(cor)}`}>
      {linha0 && <div class="v3-bloco-l0">{linha0}</div>}
      <div class={anima ? 'anima' : undefined} key={chave}>
        {quando && <p class="v3-bloco-q">{vivo && <i />}{quando}</p>}
        <h1 class={cls('v3-bloco-t', medio && 'm')} tabindex="-1">{titulo}</h1>
        {apoio && <p class="v3-bloco-a">{apoio}</p>}
        {children}
      </div>
    </section>
  );
}

/** O CABEÇALHO FINO: lugar de consulta (`raiz`) ou destino (com `aoVoltar`). */
export function Cabecalho({ titulo, nota, aoVoltar, reservaVoltar, acao, raiz }) {
  return (
    <header class={cls('v3-cab', raiz && 'raiz')}>
      {aoVoltar ? <button onClick={aoVoltar} aria-label="Voltar">{ic.volta}</button>
        : reservaVoltar && <span class="v3-cab-vao" aria-hidden="true" />}
      <h1 tabindex="-1">{titulo}</h1>
      {nota && <span class="v3-cab-n">{nota}</span>}
      {acao}
    </header>
  );
}

/** A fileira de botões. Um `Botao` principal por tela. */
export function Acoes({ children, class: c, ...resto }) { return <div class={cls('v3-acoes', c)} {...resto}>{children}</div>; }

/**
 * `tipo`: `principal` (tinta cheia) ou `contorno`. `grande` é o tamanho das
 * telas de ação. `cheio` faz o de contorno ocupar a largura. `espera` é o
 * principal que ainda não tem o que confirmar.
 */
export function Botao({ tipo = 'principal', grande, cheio, espera, children, ...resto }) {
  return (
    <button class={cls('v3-btn', tipo === 'principal' ? 'p' : 'c', grande && 'g', cheio && 'cheio', espera && 'espera')} {...resto}>
      {children}
    </button>
  );
}

/** A saída discreta: o caminho para quando o principal não serve. */
export function Saida({ children, ...resto }) { return <button class="v3-saida" {...resto}>{children}</button>; }

/** Uma seção: título de uma linha, nota opcional à direita. */
export function Secao({ titulo, nota, classe, children }) {
  return (
    <section class={cls('v3-sec', classe)}>
      {titulo && <div class="v3-sec-h"><h2>{titulo}</h2>{nota && <small>{nota}</small>}</div>}
      <div>{children}</div>
    </section>
  );
}

/** Texto de apoio, pequeno. */
export function Apoio({ children }) { return <p class="v3-apoio">{children}</p>; }

/**
 * Uma linha de lista. Com `aoTocar` vira botão e ganha a seta (`semSeta` a
 * tira, quando tocar só leva a um lugar da mesma tela); sem ele é só leitura.
 * `marca` é o círculo da esquerda (número, letra ou ícone); `marcaTom` `f`
 * (feito: tinta com o certo em lima) ou `a` (agora: anel lima).
 */
export function Linha({ titulo, apoio, valor, unidade, marca, marcaTom, quieta, mais, semSeta, aoTocar, children, ...resto }) {
  const dentro = <>
    {marca != null && <span class={cls('v3-lin-o', marcaTom)}>{marca}</span>}
    <span class="v3-lin-t"><b>{titulo}</b>{apoio && <span>{apoio}</span>}</span>
    {valor != null && <span class="v3-lin-v">{valor}{unidade && <small>{unidade}</small>}</span>}
    {aoTocar && !semSeta && (mais ? ic.mais : ic.dir)}
    {children}
  </>;
  const c = cls('v3-lin', quieta && 'quieta');
  return aoTocar ? <button class={c} onClick={aoTocar} {...resto}>{dentro}</button> : <div class={c} {...resto}>{dentro}</div>;
}

/**
 * Liga e desliga. Desligar esconde; nunca apaga. Com `sinal`, é a linha de uma
 * mudança da revisão (ds-telas2.js, "revisao"): o sinal num círculo à
 * esquerda ('+' entra, '−' sai, '↑'/'↓'/'~'/'⇅' muda), em menta, atenção
 * (`tom="t"`) ou o céu da semana (`tom="m"`).
 */
export function Chave({ titulo, apoio, ligada, aoMudar, sinal, tom, ...resto }) {
  return (
    <button class={cls('v3-chave', sinal && 'v3-mud')} role="switch" aria-checked={ligada ? 'true' : 'false'} onClick={() => aoMudar(!ligada)} {...resto}>
      {sinal && <span class={cls('v3-mud-s', tom)} aria-hidden="true">{sinal}</span>}
      <span class="v3-chave-t"><b>{titulo}</b>{apoio && <span>{apoio}</span>}</span>
      <span class="v3-chave-k" />
    </button>
  );
}

/**
 * Progresso em traços. `total` e `feitos`; o traço seguinte fica em destaque.
 * `grupos` são os índices onde começa um grupo novo (as posições da sessão de
 * fotos, por exemplo).
 */
export function Segmentos({ total, feitos, grupos, rotulo }) {
  const tracos = [];
  for (let i = 0; i < total; i++) {
    tracos.push(<i key={i} class={cls(i < feitos ? 'f' : i === feitos ? 'a' : '', grupos && i > 0 && grupos.indexOf(i) >= 0 && 'q')} />);
  }
  return <div class="v3-segs" role="img" aria-label={rotulo || `${feitos} de ${total}`}>{tracos}</div>;
}

/**
 * Uma escolha única entre opções que se tocam: o leitor de tela ouve "1 de 3,
 * selecionado" (`radiogroup` com `radio` e `aria-checked`), e as setas andam
 * entre elas, como num grupo de rádio do sistema.
 */
export function Radios({ classe, rotulo, children }) {
  const anda = e => {
    const d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
    if (!d) return;
    const bs = [].slice.call(e.currentTarget.querySelectorAll('[role="radio"]'));
    const i = bs.indexOf(document.activeElement);
    if (i < 0) return;
    e.preventDefault();
    const b = bs[(i + d + bs.length) % bs.length];
    b.focus(); b.click();
  };
  return <div class={classe} role="radiogroup" aria-label={rotulo} onKeyDown={anda}>{children}</div>;
}
/** O botão de uma escolha única: só o escolhido (ou o primeiro, sem escolha) entra no Tab. */
export const radio = (on, primeiro, algum) => ({ role: 'radio', 'aria-checked': on ? 'true' : 'false', tabindex: on || (!algum && primeiro) ? 0 : -1 });

/** Cartão de escolha única, dentro de Radios. */
export function Escolha({ icone, titulo, apoio, ligada, aoMudar }) {
  return <button class="v3-escolha" {...radio(ligada, false, true)} onClick={aoMudar}>
    <span class="v3-lin-o">{icone}</span><span><b>{titulo}</b><small>{apoio}</small></span>
  </button>;
}

/** O SELETOR: duas a quatro opções curtas lado a lado. `opcoes`: `[{ k, t }]`. */
export function Seletor({ opcoes, valor, aoMudar, rotulo, prefixo }) {
  const algum = opcoes.some(o => o.k === valor);
  return (
    <Radios classe="v3-sel" rotulo={rotulo}>
      {opcoes.map((o, i) => (
        <button key={o.k} {...radio(o.k === valor, i === 0, algum)} data-a={prefixo ? prefixo + o.k : undefined} onClick={() => aoMudar(o.k)}>{o.t}</button>
      ))}
    </Radios>
  );
}

/**
 * FICHAS: opções de texto longo ou em número variável, que quebram linha (o
 * `Seletor` é a barra de duas a quatro opções curtas). `opcoes`: `[{ k, t, on }]`;
 * `prefixo` vira o `data-a` de cada uma.
 *
 * `palpite` marca a opção que o app sugere mas que NÃO está registrada (o
 * horário do plano em "Pôr o dia"): ela se distingue sem parecer escolhida.
 *
 * Com `on` nas opções, é escolha única (`radiogroup`); com `multipla`, cada uma
 * liga e desliga (`aria-pressed`); sem `on`, são atalhos (cada toque faz uma
 * coisa, e nada fica escolhido).
 */
export function Fichas({ opcoes, aoTocar, rotulo, prefixo, multipla }) {
  const escolha = opcoes.some(o => o.on !== undefined);
  const da = o => prefixo ? prefixo + o.k : undefined;
  if (!escolha || multipla) {
    return (
      <div class="v3-fichas" role="group" aria-label={rotulo}>
        {opcoes.map(o => (
          <button key={o.k} class="v3-ficha" aria-pressed={multipla ? (o.on ? 'true' : 'false') : undefined}
                  data-a={da(o)} onClick={() => aoTocar(o.k)}>{o.t}</button>
        ))}
      </div>
    );
  }
  const algum = opcoes.some(o => o.on);
  return (
    <Radios classe="v3-fichas" rotulo={rotulo}>
      {opcoes.map((o, i) => (
        <button key={o.k} class={cls('v3-ficha', o.palpite && 'palpite')} {...radio(o.on, i === 0, algum)} data-a={da(o)}
                onClick={() => aoTocar(o.k)}>{o.t}{o.palpite && <span class="so-leitor"> (sugestão, ainda não registrada)</span>}</button>
      ))}
    </Radios>
  );
}

/** Grade de números com legenda. `itens`: `[{ k, valor, unidade, rotulo, aoTocar }]`. */
export function Quadros({ itens, colunas = 2 }) {
  return (
    <div class="v3-quadros" style={`--v3-col:${colunas}`}>
      {itens.map(q => {
        const dentro = <><b>{q.valor}{q.unidade && <small> {q.unidade}</small>}</b>{q.rotulo}</>;
        return q.aoTocar
          ? <button key={q.k} class="v3-quadro" data-a={q.a} onClick={q.aoTocar}>{dentro}</button>
          : <div key={q.k} class="v3-quadro">{dentro}</div>;
      })}
    </div>
  );
}

/** Etiqueta de estado. `tom`: nada (feito), `atencao`, `quieto`, `agora`. Sempre com palavra. */
export function Selo({ tom, children }) { return <span class={cls('v3-selo', tom)}>{children}</span>; }

/**
 * AS RESPOSTAS: fichas de 48, escolha única (`radiogroup`). `opcoes`:
 * `[{ k, t }]`. `sobreFundo` dá o contorno, para quando não há caixa atrás
 * (o "sobraram quantas?" do descanso).
 */
export function Respostas({ opcoes, valor, aoResponder, rotulo, sobreFundo }) {
  const algum = opcoes.some(x => x.k === valor);
  return (
    <Radios classe={cls('v3-perg-r', sobreFundo && 'sobre-fundo')} rotulo={rotulo}>
      {opcoes.map((r, i) => (
        <button key={r.k} {...radio(r.k === valor, i === 0, algum)} onClick={() => aoResponder(r.k)}>{r.t}</button>
      ))}
    </Radios>
  );
}

/**
 * O AVISO DENTRO DA TELA (02-componentes.md, §13): uma caixa com contorno de
 * tinta, a frase em título, o porquê embaixo e, se houver, os botões pequenos.
 * `tom`: nada (sugestão, sobre superfície), `atencao` (fora do padrão, falha)
 * ou `treino`.
 */
export function Caixa({ tom, titulo, nota, children, ...resto }) {
  return (
    <div class={cls('v3-caixa', tom)} role={tom === 'atencao' ? 'status' : 'note'} {...resto}>
      <p>{titulo}{nota && <small>{nota}</small>}</p>
      {children && <div class="v3-caixa-b">{children}</div>}
    </div>
  );
}

/** O BOTÃO PEQUENO, de 44: `cheio` (tinta) ou `contorno`; sem nada, superfície. */
export function Pequeno({ cheio, contorno, children, ...resto }) {
  return <button class={cls('v3-peq', cheio && 'f', contorno && 'c')} {...resto}>{children}</button>;
}

/**
 * O PAR (a série): dois números grandes lado a lado, e tocar num escolhe o que
 * a régua de baixo muda. `itens`: `[{ k, rotulo, valor }]`.
 */
export function Par({ itens, escolhido, aoEscolher }) {
  return (
    <div class="v3-dupla">
      {itens.map((x, i) => (
        <Fragment key={x.k}>
          {i > 0 && <span class="v3-dupla-x" aria-hidden="true">×</span>}
          <button aria-pressed={x.k === escolhido ? 'true' : 'false'} data-a={'par-' + x.k}
                  aria-label={x.valor + ' ' + dita(x.rotulo) + '. Toque para mudar na régua'} onClick={() => aoEscolher(x.k)}>
            <span class="v3-dupla-r">{x.rotulo}</span><span class="v3-dupla-v v3-n">{x.valor}</span>
          </button>
        </Fragment>
      ))}
    </div>
  );
}

/** Uma pergunta com duas ou três respostas. `respostas`: `[{ k, t }]`. */
export function Pergunta({ pergunta, nota, respostas, valor, aoResponder }) {
  return (
    <div class="v3-perg">
      <p>{pergunta}</p>
      {nota && <small>{nota}</small>}
      <Respostas opcoes={respostas} valor={valor} aoResponder={aoResponder} rotulo={pergunta} />
    </div>
  );
}

/** O estado vazio: diz o que falta e, se houver, a ação. Sem consolo. */
export function Vazio({ titulo, children }) {
  return <div class="v3-vazio"><h3>{titulo}</h3>{children}</div>;
}

/**
 * A TELA DE AÇÃO: uma coisa por tela, fundo de cor, botão grande embaixo.
 *
 * `topo` é a linha de cima (recolher, contexto, lista), `segs` o progresso logo
 * abaixo dele, `antes` o que mora em cima (a dica, o feito, um aviso), `pe` o botão principal (um só, de largura toda) e `links` as
 * saídas embaixo dele. `fundo` é o que fica atrás de tudo (o enchimento do
 * descanso). `centro` e `cima` dizem onde o miolo assenta (o padrão é embaixo,
 * perto do polegar).
 *
 * AS ÂNCORAS NÃO SE MOVEM entre os passos de uma tarefa
 * (07-fluidez-e-estabilidade.md, §1): o pé e a linha das saídas existem sempre,
 * mesmo vazios — a linha reserva os 44 px dela, para o principal não descer
 * quando ela some —, e o miolo empurra os dois para o fim da tela. Entre dois
 * passos, o principal tem o mesmo retângulo; na transição de passo, o topo, os
 * segmentos, o pé e as saídas ganham nome (`src/v3/movimento.css`) e ficam
 * parados enquanto o miolo troca.
 */
export function TelaDeAcao({ cor = 'treino', topo, segs, antes, pe, links, centro, cima, fundo, classe, children }) {
  return (
    <div class={cls('v3 v3-acao', classe)} style={`--v3-cor:${corDe(cor)}`}>
      {fundo}
      {topo && <div class="v3-acao-topo">{topo}</div>}
      {segs}
      {antes}
      <div class={cls('v3-acao-meio', centro && 'centro', cima && 'cima')}>{children}</div>
      <div class="v3-acao-pe">{pe}</div>
      <div class="v3-acao-links">{links}</div>
    </div>
  );
}

/** A faixa de aviso: sem rede (quieta) ou falha ao guardar (`falha`, com ação). */
export function Faixa({ falha, acao, aoAgir, children }) {
  return (
    <div class={cls('v3-faixa', falha && 'falha')} role={falha ? 'alert' : 'status'}>
      {falha ? ic.atencao : ic.semrede}
      <span>{children}</span>
      {acao && <button onClick={aoAgir}>{acao}</button>}
    </div>
  );
}

/**
 * A FOLHA do visual novo. Quem a abre e fecha é a pilha de camadas do app
 * (`view.pilha`): ela nasce de `CTX.abreFolha({ k, … })` e o Voltar, o Esc e
 * o véu fecham por `aoFechar`.
 *
 * Ao montar: trava a rolagem do corpo, isola o que está atrás (`inert`) e leva
 * o foco para o título. Ao sair: devolve tudo e o foco volta a quem a abriu.
 * É o contrato de UX, §1 e §12, com o mesmo código do visual antigo.
 */
export function Folha({ titulo, sub, aoFechar, children }) {
  const caixa = useRef(null);
  const lugar = useContext(LugarNaPilha);
  const entrada = useContext(FolhaDaPilha);
  useEffect(() => { trava(); return destrava; }, []);
  useEffect(() => abreCamada(caixa.current && caixa.current.parentElement, caixa.current), []);
  return (
    <div class="v3 v3-folha-w" data-lugar={lugar || 0} data-troca={entrada && entrada.troca ? '' : undefined}
         style={`position:relative;z-index:${60 + (lugar || 0) * 2}`}>
      <div class="v3-veu" onClick={aoFechar} />
      <section class="v3-folha" role="dialog" aria-modal="true" aria-label={titulo} ref={caixa} tabindex="-1">
        <h2>{titulo}</h2>
        {sub && <p class="v3-folha-s">{sub}</p>}
        {children}
      </section>
    </div>
  );
}

/**
 * A folha de CONFIRMAÇÃO: uma pergunta, o que acontece, um botão principal e
 * uma saída. Serve a todo "tem certeza?" do visual novo ("Tirar mesmo assim?",
 * "Encerrar o treino?", "Restaurar de uma cópia?").
 *
 * Abre com `CTX.abreFolha({ k: 'aviso', titulo, texto, sim, nao, aoSim })`.
 * `aoSim` roda e a folha fecha; `nao` (ou o véu, o Esc, o Voltar) só fecha.
 * O principal é o caminho seguro quando `seguro` é verdadeiro: aí ele vem
 * primeiro e a ação arriscada vira a saída discreta, como o protótipo de fotos.
 */
export function FolhaAviso({ f, ctx }) {
  const fecha = () => ctx.fechaFolha();
  const sim = () => { ctx.fechaFolha(); if (typeof f.aoSim === 'function') f.aoSim(); };
  return (
    <Folha titulo={f.titulo} sub={f.texto} aoFechar={fecha}>
      {f.seguro
        ? <><Acoes><Botao onClick={fecha} data-a="aviso-nao">{f.nao || 'Voltar'}</Botao></Acoes>
            <Saida onClick={sim} data-a="aviso-sim">{f.sim}</Saida></>
        : <><Acoes><Botao onClick={sim} data-a="aviso-sim">{f.sim}</Botao></Acoes>
            <Saida onClick={fecha} data-a="aviso-nao">{f.nao || 'Cancelar'}</Saida></>}
    </Folha>
  );
}
