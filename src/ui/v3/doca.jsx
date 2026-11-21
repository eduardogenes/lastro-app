// A DOCA: a navegação do visual novo. Uma pílula escura com os cinco lugares
// e, ao lado, o botão "+" de registrar (só aparece quando o app oferece o
// registro: `aoRegistrar`).
//
// Os lugares continuam com as chaves de sempre no estado (`agora`,
// `prescricao`): o que muda é o nome que a pessoa lê, "Hoje" e "Plano".

import { useEffect, useRef, useState } from 'preact/hooks';
import { ic } from './icones.jsx';

export const LUGARES = [
  { k: 'agora',      t: 'Hoje',   i: 'hoje' },
  { k: 'dias',       t: 'Dias',   i: 'dias' },
  { k: 'corpo',      t: 'Corpo',  i: 'corpo' },
  { k: 'semana',     t: 'Semana', i: 'semana' },
  { k: 'prescricao', t: 'Plano',  i: 'plano' }
];

/** Encolhe ao rolar para baixo, volta ao rolar para cima. Quem rola é a janela. */
function useEncolhe() {
  const [mini, setMini] = useState(false);
  useEffect(() => {
    let ultimo = window.scrollY || 0;
    const rolou = () => {
      const y = window.scrollY || 0;
      if (y > ultimo + 6 && y > 60) setMini(true);
      else if (y < ultimo - 6 || y < 30) setMini(false);
      ultimo = y;
    };
    window.addEventListener('scroll', rolou, { passive: true });
    return () => window.removeEventListener('scroll', rolou);
  }, []);
  return mini;
}

/** Verdadeiro enquanto um campo de texto tem o foco: o teclado está aberto. */
function useTecladoAberto() {
  const [aberto, setAberto] = useState(false);
  useEffect(() => {
    const eCampo = el => el && /^(INPUT|TEXTAREA)$/.test(el.tagName);
    const entra = e => { if (eCampo(e.target)) setAberto(true); };
    const sai = e => { if (eCampo(e.target)) setAberto(false); };
    document.addEventListener('focusin', entra);
    document.addEventListener('focusout', sai);
    return () => { document.removeEventListener('focusin', entra); document.removeEventListener('focusout', sai); };
  }, []);
  return aberto;
}

/**
 * A TIRA DO TREINO ABERTO: pílula lima 10 acima da doca, em todo lugar com
 * sessão aberta. Toque: volta ao treino. `t`: `{ nome, feitas, prescritas }`.
 */
export function Tira({ t, aoTocar }) {
  const conta = t.prescritas ? ' · ' + t.feitas + ' de ' + t.prescritas : '';
  return (
    <button class="v3-tira" data-a="tira-treino" onClick={aoTocar}
            aria-label={'Voltar ao treino aberto: ' + t.nome + (t.prescritas ? ', ' + t.feitas + ' de ' + t.prescritas + ' séries' : '')}>
      <i aria-hidden="true" /><span>{t.nome}{conta}</span>{ic.dir}
    </button>
  );
}

/**
 * No app instalado no iPhone, com a página mais curta que a tela (o Hoje
 * quase vazio), o iOS ancora o que é `fixed` embaixo num fundo que desconta a
 * barra de status, e a doca sobe uns 45 pt em relação aos outros lugares. A
 * doca mede onde ficou e volta para o fundo de verdade da tela. Fora do app
 * instalado não faz nada.
 */
function useDocaNoFundo(ref) {
  useEffect(() => {
    const instalado = navigator.standalone === true ||
      (typeof matchMedia === 'function' && matchMedia('(display-mode: standalone)').matches);
    if (!instalado) return;
    let pedido = 0;
    const acerta = () => {
      pedido = 0;
      const el = ref.current; if (!el) return;
      el.style.translate = '';
      const deitado = window.innerWidth > window.innerHeight;
      const alto = deitado ? Math.min(screen.width, screen.height) : Math.max(screen.width, screen.height);
      const r = el.getBoundingClientRect();
      const desvio = alto - parseFloat(getComputedStyle(el).bottom || '0') - r.bottom;
      if (Math.abs(desvio) >= 2 && Math.abs(desvio) <= 80) el.style.translate = '0 ' + Math.round(desvio) + 'px';
    };
    const agenda = () => { if (!pedido) pedido = requestAnimationFrame(acerta); };
    window.addEventListener('resize', agenda);
    window.addEventListener('orientationchange', agenda);
    window.addEventListener('pageshow', agenda);
    const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(agenda) : null;
    if (ro) ro.observe(document.body);
    agenda();
    return () => {
      window.removeEventListener('resize', agenda); window.removeEventListener('orientationchange', agenda);
      window.removeEventListener('pageshow', agenda); if (ro) ro.disconnect();
    };
  }, []);
}

export function Doca({ ativa, onMuda, aoRegistrar, tira, aoVoltarAoTreino }) {
  const mini = useEncolhe();
  const teclado = useTecladoAberto();
  const ref = useRef(null);
  useDocaNoFundo(ref);
  // no Hoje, o bloco do momento (e, rolado, a pílula que gruda no topo) já diz
  // que o treino está aberto: a tira diria a mesma coisa duas vezes
  const mostraTira = !!tira && ativa !== 'agora';
  return (
    <div ref={ref} class={'v3 v3-doca' + (mini ? ' mini' : '') + (teclado ? ' oculta' : '')}>
      {mostraTira && <Tira t={tira} aoTocar={aoVoltarAoTreino} />}
      <nav class="v3-doca-n" aria-label="Lugares">
        {LUGARES.map(l => (
          <button key={l.k} aria-label={l.t} aria-current={l.k === ativa ? 'page' : undefined}
                  onClick={() => onMuda(l.k)}>
            {ic[l.i]}<span>{l.t}</span>
          </button>
        ))}
      </nav>
      {aoRegistrar && (
        <button class="v3-doca-m" aria-label="Registrar" onClick={aoRegistrar}>{ic.mais}</button>
      )}
    </div>
  );
}
