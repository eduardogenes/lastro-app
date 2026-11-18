// Os componentes base do visual novo (direção 3). Tela nova se monta com eles;
// a lista e o papel de cada um estão no DESIGN.md. Todos são só apresentação:
// recebem dados e funções prontos, e não leem o estado do app.

import { useContext, useEffect, useRef } from 'preact/hooks';
import { ic } from './icones.jsx';
// O comportamento de camada é o mesmo do visual antigo, e por isso vem de lá:
// a trava de rolagem é um contador só, e o isolamento acha a camada de cima
// entre as folhas dos dois visuais.
import { trava, destrava, abreCamada, LugarNaPilha } from './camada.js';

const cls = (...p) => p.filter(Boolean).join(' ');

/**
 * O BLOCO DO MOMENTO: o topo de cor que diz o que importa agora.
 *
 * `cor` é o nome de um token (`lima`, `tanja`, `lilas`, `ceu`, `menta`,
 * `areia`). `chave` identifica o momento: quando ela muda, o conteúdo entra
 * em sequência; enquanto é a mesma, um redesenho não reanima nada.
 * `fino` é a faixa de quando não há o que fazer.
 */
export function Bloco({ cor = 'lima', linha0, quando, vivo, titulo, medio, apoio, fino, chave, children }) {
  const anima = Bloco.ultima !== chave && chave != null;
  Bloco.ultima = chave;
  return (
    <section class={cls('v3-bloco', fino && 'fino')} style={`--v3-cor:var(--${cor})`}>
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
export function Cabecalho({ titulo, nota, aoVoltar, acao, raiz }) {
  return (
    <header class={cls('v3-cab', raiz && 'raiz')}>
      {aoVoltar && <button onClick={aoVoltar} aria-label="Voltar">{ic.volta}</button>}
      <h1 tabindex="-1">{titulo}</h1>
      {nota && <span class="v3-cab-n">{nota}</span>}
      {acao}
    </header>
  );
}

/** A fileira de botões. Um `Botao` principal por tela. */
export function Acoes({ children, ...resto }) { return <div class="v3-acoes" {...resto}>{children}</div>; }

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
export function Secao({ titulo, nota, children }) {
  return (
    <section class="v3-sec">
      {titulo && <div class="v3-sec-h"><h2>{titulo}</h2>{nota && <small>{nota}</small>}</div>}
      <div>{children}</div>
    </section>
  );
}

/** Texto de apoio, pequeno. */
export function Apoio({ children }) { return <p class="v3-apoio">{children}</p>; }

/**
 * Uma linha de lista. Com `aoTocar` vira botão e ganha a seta; sem ele é só
 * leitura. `marca` é o círculo da esquerda (número, letra ou ícone).
 */
export function Linha({ titulo, apoio, valor, unidade, marca, quieta, mais, aoTocar, ...resto }) {
  const dentro = <>
    {marca != null && <span class="v3-lin-o">{marca}</span>}
    <span class="v3-lin-t"><b>{titulo}</b>{apoio && <span>{apoio}</span>}</span>
    {valor != null && <span class="v3-lin-v">{valor}{unidade && <small>{unidade}</small>}</span>}
    {aoTocar && (mais ? ic.mais : ic.dir)}
  </>;
  const c = cls('v3-lin', quieta && 'quieta');
  return aoTocar ? <button class={c} onClick={aoTocar} {...resto}>{dentro}</button> : <div class={c} {...resto}>{dentro}</div>;
}

/** Liga e desliga. Desligar esconde; nunca apaga. */
export function Chave({ titulo, apoio, ligada, aoMudar, ...resto }) {
  return (
    <button class="v3-chave" role="switch" aria-checked={ligada ? 'true' : 'false'} onClick={() => aoMudar(!ligada)} {...resto}>
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

/** Duas ou três opções lado a lado. `opcoes`: `[{ k, t }]`. */
export function Seletor({ opcoes, valor, aoMudar, rotulo }) {
  return (
    <div class="v3-sel" role="group" aria-label={rotulo}>
      {opcoes.map(o => (
        <button key={o.k} aria-pressed={o.k === valor ? 'true' : 'false'} onClick={() => aoMudar(o.k)}>{o.t}</button>
      ))}
    </div>
  );
}

/**
 * FICHAS: escolha entre opções de texto longo ou em número variável, que
 * quebram linha (o `Seletor` é a barra de duas a quatro opções curtas).
 * `opcoes`: `[{ k, t, on }]`; `prefixo` vira o `data-a` de cada uma.
 */
export function Fichas({ opcoes, aoTocar, rotulo, prefixo }) {
  return (
    <div class="v3-fichas" role="group" aria-label={rotulo}>
      {opcoes.map(o => (
        <button key={o.k} class="v3-ficha" aria-pressed={o.on ? 'true' : 'false'}
                data-a={prefixo ? prefixo + o.k : undefined} onClick={() => aoTocar(o.k)}>{o.t}</button>
      ))}
    </div>
  );
}

/** Grade de números com legenda. `itens`: `[{ k, valor, unidade, rotulo, aoTocar }]`. */
export function Quadros({ itens, colunas = 2 }) {
  return (
    <div class="v3-quadros" style={`--v3-col:${colunas}`}>
      {itens.map(q => {
        const dentro = <><b>{q.valor}{q.unidade && <small> {q.unidade}</small>}</b>{q.rotulo}</>;
        return q.aoTocar
          ? <button key={q.k} class="v3-quadro" onClick={q.aoTocar}>{dentro}</button>
          : <div key={q.k} class="v3-quadro">{dentro}</div>;
      })}
    </div>
  );
}

/** Etiqueta de estado. `tom`: nada (feito), `atencao`, `quieto`, `agora`. Sempre com palavra. */
export function Selo({ tom, children }) { return <span class={cls('v3-selo', tom)}>{children}</span>; }

/** Uma pergunta com duas ou três respostas. `respostas`: `[{ k, t }]`. */
export function Pergunta({ pergunta, nota, respostas, valor, aoResponder }) {
  return (
    <div class="v3-perg">
      <p>{pergunta}</p>
      {nota && <small>{nota}</small>}
      <div class="v3-perg-r">
        {respostas.map(r => (
          <button key={r.k} aria-pressed={r.k === valor ? 'true' : 'false'} onClick={() => aoResponder(r.k)}>{r.t}</button>
        ))}
      </div>
    </div>
  );
}

/** O estado vazio: diz o que falta e, se houver, a ação. Sem consolo. */
export function Vazio({ titulo, children }) {
  return <div class="v3-vazio"><h3>{titulo}</h3>{children}</div>;
}

/**
 * A TELA DE AÇÃO: uma coisa por tela, fundo de cor, botão grande embaixo.
 * `topo` é a linha de cima (sair, contexto), `pe` os botões, `links` as saídas.
 */
export function TelaDeAcao({ cor = 'lima', topo, pe, links, centro, children }) {
  return (
    <div class="v3 v3-acao" style={`--v3-cor:var(--${cor})`}>
      {topo && <div class="v3-acao-topo">{topo}</div>}
      <div class={cls('v3-acao-meio', centro && 'centro')}>{children}</div>
      {pe && <div class="v3-acao-pe">{pe}</div>}
      {links && <div class="v3-acao-links">{links}</div>}
    </div>
  );
}

/** A faixa de aviso: sem rede (quieta) ou falha ao guardar (`falha`, com ação). */
export function Faixa({ falha, acao, aoAgir, children }) {
  return (
    <div class={cls('v3-faixa', falha && 'falha')} role={falha ? 'alert' : 'status'}>
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
  useEffect(() => { trava(); return destrava; }, []);
  useEffect(() => abreCamada(caixa.current && caixa.current.parentElement, caixa.current), []);
  return (
    <div class="v3 v3-folha-w" style={`position:relative;z-index:${60 + (lugar || 0) * 2}`}>
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
