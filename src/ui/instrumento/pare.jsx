// O PAINEL DE PARE — decisão 13, §3 da frente 3.
//
// O terceiro sinal deixou de dizer "destrói dado" e passou a dizer PARE: a
// gravação que falhou e a ação que vai destruir usam a mesma moldura, e o que as
// distingue é a palavra. Esta peça é a moldura da segunda família — "vai
// destruir" —, e existe porque o diálogo de confirmação do sistema não a permite: os
// botões dele chamam-se "OK" e "Cancelar", e a frente 3 escreveu, como regra de
// uma linha, que nenhum painel de pare tem botão com esses rótulos. O botão
// repete o verbo com o objeto ("Apagar o peso de 28/09"); a saída é "Deixar como
// está", nunca "Cancelar" — não há formulário a abandonar, há um dado que
// continua existindo se ele não tocar.
//
// O FOCO nasce na saída, e não no verbo: Enter num painel recém-aberto tem de
// ser o gesto que não apaga nada. E o painel é uma CAMADA (`camadasAbertas`):
// o Voltar do sistema, o gesto de borda do Safari e o Esc respondem "Deixar
// como está" pelo mesmo caminho que fecha qualquer camada.
//
// E ISOLA o resto como a folha isola (`abreCamada`, `folha.jsx`): até a peça 4
// do motion o `aria-modal` só descrevia, e o segundo Shift+Tab caía na aba
// "Prescrição", atrás do painel (docs/motion/05 §3.1). Ao fechar, o foco volta
// a quem o tinha, se ainda estiver na página.
//
// CHEGA IGUAL À FOLHA (dono, 16/10, pergunta 11, contra a recomendação de
// "parado"): sobe da borda com o quique e o véu acende, por CSS, no nó que
// nasce (`componentes.css`, "A CAMADA QUE CHEGA COM O QUIQUE"), e o toque que
// desce nele enquanto ele sobe vai ao que o dedo mirou (`miraSobODedo`). A frase é texto do
// painel e sobe inteira com ele, legível desde o primeiro quadro; nada nela se
// anima à parte. A SAÍDA desce em 350 ms, sem quique, pela transição de vista
// (peça 5): o painel já saiu do DOM no mesmo desenho, e o que desce é a foto
// dele (`componentes.css`, "A TROCA DE CAMADA"). O que a frente 4 escreveu ("um painel que chega
// animado diz 'apareci'") foi o argumento da recomendação; o dono decidiu o
// contrário.

import { useEffect, useLayoutEffect, useRef } from 'preact/hooks';
import { abreCamada, miraSobODedo } from './folha.jsx';

const relogio = () => (typeof performance !== 'undefined' && performance.now ? performance.now() : 0);

/**
 * @param {object} p
 * @param {{ id: number, texto: string, sim: string } | null} p.p
 * @param {(sim: boolean) => void} p.onResponde
 */
export function Pare({ p, onResponde }) {
  // O painel é um componente à parte, que nasce e morre com o pedido: a limpeza
  // do isolamento roda no DESMONTE, que é síncrono, no mesmo desenho em que o
  // painel sai. Num efeito com dependência ela rodaria um quadro depois, e um
  // toque logo depois de "Deixar como está" cairia num fundo ainda inerte.
  // Sem chave: um pedido novo com outro aberto reaproveita o nó, como antes.
  if (!p) return null;
  return <PainelDePare p={p} onResponde={onResponde} />;
}

function PainelDePare({ p, onResponde }) {
  const camada = useRef(null);
  const saida = useRef(null);
  useEffect(function () {
    return abreCamada(camada.current, saida.current);
  }, []);
  // Um pedido novo com este aberto: o foco volta à saída, como no primeiro.
  useEffect(function () {
    if (saida.current && !saida.current.closest('[inert]')) saida.current.focus({ preventScroll: true });
  }, [p.id]);
  return (
    <div class={'pare-w' + (p.tom === 'pergunta' ? ' pergunta-w' : '')} data-pare={p.id} ref={camada}
         onPointerDown={miraSobODedo}>
      <div class="ins-veu" />
      <div class="pare" role="alertdialog" aria-modal="true" aria-labelledby="pare-t">
        <p id="pare-t" class="pare-t">{p.texto}</p>
        <div class="pare-b">
          <button class="pare-sim" data-a="pare-sim" onClick={() => onResponde(true)}>{p.sim}</button>
          <button class="pare-nao" data-a="pare-nao" ref={saida} onClick={() => onResponde(false)}>
            {p.nao || 'Deixar como está'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// A família "FALHOU" — §3.2 da frente 3, §7.2 da frente 2
// ---------------------------------------------------------------------------
//
// A mesma moldura do pare, e o que a distingue é a palavra: abre por "Não
// guardei…" (verbo negado no passado, o sujeito é o app), diz a causa, diz o que
// NÃO aconteceu e até quando o valor vale. `role="alert"`, porque interrompe. Três
// saídas, todas ações, e a terceira é sair sem fazer nada — dispensar não
// escolhe por ele, e não apaga a marca.
//
// Isola o resto como a folha e o pare (`abreCamada`): até a peça 4 do motion o
// primeiro Shift+Tab já caía na barra de abas (docs/motion/05 §3.1). E NÃO SE
// MOVE: é meia tela em tinta de pare, ninguém deixa de vê-la, e uma subida
// faria os quatro botões varrerem a zona do polegar (docs/motion/03 §5.3). O
// que ela tinha de errado era o toque, e o conserto está logo abaixo.

const CAUSA = {
  cota: 'O armazenamento deste aparelho recusou a gravação: ele está cheio.',
  recusa: 'O armazenamento deste aparelho recusou a gravação.'
};

/**
 * O TOQUE QUE ERA PARA OUTRA COISA — o defeito 5 (docs/motion/03 §5.3; dono,
 * 16/10, pergunta 13: consertar junto, na peça 4 do motion).
 *
 * O aviso chega SOZINHO, ~0,8 s depois do toque que gravou (700 ms de represa
 * mais o desenho), cobrindo a metade de baixo da tela com os quatro botões na
 * zona do polegar. Quem já estava tocando no −15, no "+ série" ou no "Pular"
 * acertava "Copiar o registro inteiro" ou "Fechar este aviso" — e fechar
 * dispensava a explicação antes de lida.
 *
 * O conserto é de comportamento, e o aviso continua sem movimento: um toque de
 * dedo só aciona um botão do aviso se COMEÇOU no aviso, e pelo menos esta
 * janela depois de ele chegar. Um toque que desceu antes de o aviso existir
 * (em outra coisa) ou logo depois que ele apareceu é de um gesto que já estava
 * a caminho: ninguém freia um toque em menos de ~250 ms, e 400 dá a margem.
 * Ler a frase leva segundos, então quem toca de propósito nunca esbarra nela;
 * e o toque que ela engole não faz nada — o aviso fica, para ser lido.
 *
 * Só o DEDO (e o ponteiro): clique de teclado e de programa (`detail` 0) age
 * na hora, porque não há polegar a caminho; e num navegador sem Pointer Events
 * não há como saber onde o dedo desceu, e o aviso age como antes — nunca fica
 * sem resposta.
 */
export const JANELA_DO_AVISO_MS = 400;

/**
 * O clique veio de um toque mirado em outra coisa?
 * @param {{ detail?: number } | undefined} ev
 * @param {number} nasceu quando o aviso chegou
 * @param {number | null} apertou quando o dedo desceu DENTRO do aviso, se desceu
 */
function eraParaOutraCoisa(ev, nasceu, apertou) {
  if (!ev || !(ev.detail > 0)) return false;
  if (typeof PointerEvent === 'undefined') return false;
  return apertou == null || apertou - nasceu < JANELA_DO_AVISO_MS;
}

/**
 * @param {object} p
 * @param {{ motivo: string, oQue: string, valor: string | null } | null} p.f
 */
export function Falhou({ f, onTenta, onCopia, onBaixa, onFecha }) {
  // À parte, como o pare: a limpeza do isolamento roda no desmonte, no mesmo
  // desenho em que o aviso sai.
  if (!f) return null;
  return <AvisoDeFalha f={f} onTenta={onTenta} onCopia={onCopia} onBaixa={onBaixa} onFecha={onFecha} />;
}

function AvisoDeFalha({ f, onTenta, onCopia, onBaixa, onFecha }) {
  const camada = useRef(null);
  const primeiro = useRef(null);
  const nasceu = useRef(relogio());
  const apertou = useRef(null);
  useEffect(function () {
    const w = camada.current;
    const solta = abreCamada(w, primeiro.current);
    // Onde o dedo desceu: no aviso, e quando. Na captura, para nenhum filho
    // esconder o toque; e pelo nome do evento, e não por `onPointerDown`, que o
    // Preact só liga em minúsculas onde o elemento conhece `onpointerdown`.
    const desceu = function () { apertou.current = relogio(); };
    w.addEventListener('pointerdown', desceu, true);
    return function () { w.removeEventListener('pointerdown', desceu, true); solta(); };
  }, []);
  /** O botão age só com o toque que era para ele. */
  const deProposito = acao => ev => {
    if (eraParaOutraCoisa(ev, nasceu.current, apertou.current)) return undefined;
    return acao(ev);
  };
  return (
    <div class="pare-w falhou-w" ref={camada}>
      <div class="ins-veu" />
      <div class="pare" role="alert" aria-labelledby="falhou-t">
        <p id="falhou-t" class="pare-t">
          Não guardei {f.oQue}. {CAUSA[f.motivo] || CAUSA.recusa} Nada foi apagado e nada saiu do
          aparelho. {f.valor ? 'O valor continua aqui, ' + f.valor + ', enquanto o app estiver aberto.'
                             : 'O que foi registrado continua aqui enquanto o app estiver aberto.'}
          {f.salvo ? ' ' + f.salvo : ''}
        </p>
        <div class="pare-b">
          <button class="pare-sim" data-a="falhou-tenta" ref={primeiro} onClick={deProposito(onTenta)}>Tentar de novo</button>
          {onBaixa && <button class="pare-nao" data-a="falhou-baixa" onClick={deProposito(onBaixa)}>Baixar uma cópia de segurança</button>}
          <button class="pare-nao" data-a="falhou-copia" onClick={deProposito(onCopia)}>Copiar o registro inteiro</button>
          <button class="pare-nao" data-a="falhou-fecha" onClick={deProposito(onFecha)}>Fechar este aviso</button>
        </div>
      </div>
    </div>
  );
}

/**
 * A MARCA de não guardado, que fica depois de o aviso ser fechado. É o estado do
 * dado: ela some quando uma gravação der certo, e não quando o aviso some.
 * `role="status"`: informa, não interrompe — quem interrompeu foi o painel.
 */
export function NaoGuardado({ n, aberto, onTenta }) {
  if (!n || aberto) return null;
  return <FaixaNaoGuardado n={n} onTenta={onTenta} />;
}

/**
 * A faixa fica FIXA NO TOPO, por cima de tudo menos do pare — e cobria a única
 * saída do modo (a seta), a hora e o `···` (defeito 4, docs/motion/03 §8.3;
 * dono, 16/10, pergunta 13: consertar na peça 5). O conserto não a esconde nem
 * a move: ela publica a própria altura em `--ins-ng-h` (como a faixa da sessão
 * publica a dela), e as barras do topo — a do modo, a da tela cheia e o
 * cabeçalho das abas — passam a começar abaixo dela (`--ins-topo`, nos
 * tokens), em vez de abaixo da barra de status só. De layout, no mesmo desenho
 * em que ela nasce: nenhum quadro com a seta por baixo. Ao sair, a altura
 * volta a 0.
 */
function FaixaNaoGuardado({ n, onTenta }) {
  const ref = useRef(null);
  useLayoutEffect(function () {
    const raiz = document.documentElement;
    raiz.style.setProperty('--ins-ng-h', (ref.current ? ref.current.offsetHeight : 0) + 'px');
  });
  useLayoutEffect(function () {
    return function () { document.documentElement.style.setProperty('--ins-ng-h', '0px'); };
  }, []);
  return (
    <div class="ng-faixa" role="status" ref={ref}>
      <span>Não guardado neste aparelho · {n.oQue}</span>
      <button class="ng-b" data-a="ng-tenta" onClick={onTenta}>Tentar de novo</button>
    </div>
  );
}
