// A DOCA: a navegação do visual novo. Uma pílula escura com os cinco lugares
// e, ao lado, o botão "+" de registrar (só aparece quando o app oferece o
// registro: `aoRegistrar`).
//
// Os lugares continuam com as chaves de sempre no estado (`agora`,
// `prescricao`): o que muda é o nome que a pessoa lê, "Hoje" e "Plano".

import { useEffect, useState } from 'preact/hooks';
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

export function Doca({ ativa, onMuda, aoRegistrar }) {
  const mini = useEncolhe();
  const teclado = useTecladoAberto();
  return (
    <div class={'v3 v3-doca' + (mini ? ' mini' : '') + (teclado ? ' oculta' : '')}>
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
