// A DOCA: a navegação do visual novo. Uma pílula escura com os cinco lugares
// e, ao lado, o botão "+" de registrar (só aparece quando o app oferece o
// registro: `aoRegistrar`).
//
// Os lugares continuam com as chaves de sempre no estado (`agora`,
// `prescricao`): o que muda é o nome que a pessoa lê, "Hoje" e "Plano".

import { useEffect, useLayoutEffect, useState } from 'preact/hooks';
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
 * O bloco do momento ainda está à vista? No Hoje, a tira do treino aberto só
 * aparece quando ele já saiu da tela, para não dizer a mesma coisa duas vezes.
 */
function useBlocoAVista(liga) {
  const [aVista, setAVista] = useState(true);
  // medido ANTES de pintar, e de novo a cada vez que liga: o valor de quando o
  // Hoje foi deixado rolado não vale ao voltar a ele (a tira piscava)
  useLayoutEffect(() => {
    if (!liga) { setAVista(true); return undefined; }
    const mede = () => {
      const b = document.querySelector('main .v3-bloco');
      setAVista(!!b && b.getBoundingClientRect().bottom > 56);
    };
    mede();
    window.addEventListener('scroll', mede, { passive: true });
    return () => window.removeEventListener('scroll', mede);
  }, [liga]);
  return aVista;
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

export function Doca({ ativa, onMuda, aoRegistrar, tira, aoVoltarAoTreino }) {
  const mini = useEncolhe();
  const teclado = useTecladoAberto();
  // no Hoje, o bloco do momento já diz que o treino está aberto
  const blocoAVista = useBlocoAVista(!!tira && ativa === 'agora');
  const mostraTira = !!tira && !(ativa === 'agora' && blocoAVista);
  return (
    <div class={'v3 v3-doca' + (mini ? ' mini' : '') + (teclado ? ' oculta' : '')}>
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
