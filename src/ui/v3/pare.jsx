// A CONFIRMAÇÃO e o AVISO DE FALHA no visual novo (prerrequisito da Fase 5).
// Mesmos dados e mesmas portas do painel antigo (`ctx.pare()`,
// `ctx.respondePare`, `ctx.falhou()`, `ctx.tentaGravar`…), na moldura da
// folha. Protótipos: "Apagar esta foto?" (fotos.html), com "Manter" como
// principal e a ação que apaga ao lado, em contorno; e a falha de resto.html,
// com "Tentar de novo" principal e "Copiar o registro" como saída.
//
// Ficam acima de qualquer folha (o pare pode ser pedido de dentro de uma) e
// o foco começa no caminho seguro.

import { useEffect, useRef } from 'preact/hooks';
import { Acoes, Botao, Saida } from './base.jsx';
import { trava, destrava, abreCamada } from './camada.js';

// `foco` é o seletor do botão seguro: o Botao é componente, não leva ref.
function Moldura({ rotulo, papel, foco, refCaixa, children, ...resto }) {
  const caixa = useRef(null);
  useEffect(() => { trava(); return destrava; }, []);
  useEffect(() => abreCamada(caixa.current && caixa.current.parentElement, caixa.current && caixa.current.querySelector(foco)), []);
  return (
    <div class="v3 v3-folha-w v3-pare-w" {...resto}>
      <div class="v3-veu" />
      <section class="v3-folha" role={papel} aria-modal="true" aria-labelledby={rotulo}
               ref={el => { caixa.current = el; if (refCaixa) refCaixa.current = el; }} tabindex="-1">
        {children}
      </section>
    </div>
  );
}

export function PareV3({ p, onResponde }) {
  if (!p) return null;
  return <PainelV3 key={p.id} p={p} onResponde={onResponde} />;
}

function PainelV3({ p, onResponde }) {
  const caixa = useRef(null);
  useEffect(() => {
    const b = caixa.current && caixa.current.querySelector('[data-a="pare-nao"]');
    if (b && !b.closest('[inert]')) b.focus({ preventScroll: true });
  }, [p.id]);
  return (
    <Moldura rotulo="pare-t" papel="alertdialog" foco='[data-a="pare-nao"]' refCaixa={caixa} data-pare={p.id}>
      <p id="pare-t" class="v3-pare-t">{p.texto}</p>
      <Acoes>
        <Botao data-a="pare-nao" onClick={() => onResponde(false)}>{p.nao || 'Deixar como está'}</Botao>
        <Botao tipo="contorno" data-a="pare-sim" onClick={() => onResponde(true)}>{p.sim}</Botao>
      </Acoes>
    </Moldura>
  );
}

const CAUSA = {
  cota: 'O armazenamento deste aparelho recusou a gravação: ele está cheio.',
  recusa: 'O armazenamento deste aparelho recusou a gravação.'
};

/**
 * O aviso chega sozinho, logo depois do toque que gravou, e cobre a zona do
 * polegar. Um toque de dedo só age se desceu DENTRO do aviso e pelo menos
 * 400 ms depois de ele chegar; clique de teclado ou de programa (`detail` 0)
 * age na hora. O toque engolido não faz nada: o aviso fica, para ser lido.
 */
const JANELA_MS = 400;
function eraParaOutraCoisa(ev, nasceu, apertou) {
  if (!ev || !(ev.detail > 0)) return false;
  if (typeof PointerEvent === 'undefined') return false;
  return apertou == null || apertou - nasceu < JANELA_MS;
}

export function FalhouV3({ f, onTenta, onCopia, onBaixa }) {
  if (!f) return null;
  return <AvisoV3 f={f} onTenta={onTenta} onCopia={onCopia} onBaixa={onBaixa} />;
}

function AvisoV3({ f, onTenta, onCopia, onBaixa }) {
  const caixa = useRef(null);
  const nasceu = useRef(Date.now());
  const apertou = useRef(null);
  useEffect(() => {
    const w = caixa.current;
    if (!w) return undefined;
    const desceu = () => { apertou.current = Date.now(); };
    w.addEventListener('pointerdown', desceu, true);
    return () => w.removeEventListener('pointerdown', desceu, true);
  }, []);
  const deProposito = acao => ev => {
    if (eraParaOutraCoisa(ev, nasceu.current, apertou.current)) return undefined;
    return acao(ev);
  };
  return (
    <Moldura rotulo="falhou-t" papel="alertdialog" foco='[data-a="falhou-tenta"]' refCaixa={caixa}>
      <h2 id="falhou-t">Não guardei {f.oQue}</h2>
      <p class="v3-folha-s">
        {CAUSA[f.motivo] || CAUSA.recusa} Nada foi apagado e nada saiu do aparelho.{' '}
        {f.valor ? 'O valor continua aqui, ' + f.valor + ', enquanto o app estiver aberto.'
                 : 'O que foi registrado continua aqui enquanto o app estiver aberto.'}
        {f.salvo ? ' ' + f.salvo : ''}
      </p>
      <Acoes>
        <Botao cheio data-a="falhou-tenta" onClick={deProposito(onTenta)}>Tentar de novo</Botao>
      </Acoes>
      <div class="v3-saidas">
        <Saida data-a="falhou-copia" onClick={deProposito(onCopia)}>Copiar o registro em texto</Saida>
        {onBaixa && <Saida data-a="falhou-baixa" onClick={deProposito(onBaixa)}>Baixar uma cópia</Saida>}
      </div>
    </Moldura>
  );
}
