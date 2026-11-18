// OS ESTADOS no visual novo (Fase 4): as faixas fixas no topo. "Não guardado"
// é a única que não some sozinha, porque é a única em que se pode perder
// registro; "sem rede" avisa uma vez, sem bloquear nada (tudo fica no
// aparelho). Protótipo: docs/redesign-3/prototipos/resto.html ("Estados").
// O painel de detalhe da falha (copiar, baixar) está em `pare.jsx`.

import { useEffect, useState } from 'preact/hooks';
import { Faixa } from './base.jsx';

/**
 * SEM REDE avisa UMA vez e some em 4 s (03-padroes-e-voz.md, "Sem rede"): tudo
 * funciona sem rede, e a faixa parada no topo só ocupava lugar. Só volta a
 * avisar se a rede voltar e cair de novo. A marca fica fora do componente para
 * valer entre um desenho e outro.
 */
const AVISO_SEM_REDE_MS = 4000;
let jaAvisouSemRede = false;
function useSemRede() {
  const [mostra, setMostra] = useState(false);
  useEffect(() => {
    let relogio = null;
    const avisa = () => {
      if (jaAvisouSemRede) return;
      jaAvisouSemRede = true;
      setMostra(true);
      clearTimeout(relogio);
      relogio = setTimeout(() => setMostra(false), AVISO_SEM_REDE_MS);
    };
    const muda = () => {
      if (navigator.onLine === false) avisa();
      else { jaAvisouSemRede = false; clearTimeout(relogio); setMostra(false); }
    };
    if (typeof navigator !== 'undefined' && navigator.onLine === false) avisa();
    window.addEventListener('online', muda);
    window.addEventListener('offline', muda);
    return () => { clearTimeout(relogio); window.removeEventListener('online', muda); window.removeEventListener('offline', muda); };
  }, []);
  return mostra;
}

export function EstadosV3({ ctx }) {
  const n = ctx.naoGuardado();
  const aberto = !!ctx.falhou();
  const off = useSemRede();
  if ((!n || aberto) && !off) return null;
  return (
    <div class="v3 v3-estados">
      {n && !aberto && (
        <Faixa falha acao="Tentar de novo" aoAgir={ctx.tentaGravar}>Não guardado neste aparelho · {n.oQue}</Faixa>
      )}
      {off && <Faixa>Sem rede. Tudo fica guardado neste aparelho.</Faixa>}
    </div>
  );
}
