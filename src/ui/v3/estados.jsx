// OS ESTADOS no visual novo (Fase 4): as faixas fixas no topo. "Não guardado"
// é a única que não some sozinha, porque é a única em que se pode perder
// registro; "sem rede" avisa uma vez, sem bloquear nada (tudo fica no
// aparelho). Protótipo: docs/redesign-3/prototipos/resto.html ("Estados").
// O painel de detalhe da falha (copiar, baixar) está em `pare.jsx`.

import { useEffect, useState } from 'preact/hooks';
import { Faixa } from './base.jsx';

function useSemRede() {
  const [off, setOff] = useState(() => typeof navigator !== 'undefined' && navigator.onLine === false);
  useEffect(() => {
    const muda = () => setOff(navigator.onLine === false);
    window.addEventListener('online', muda);
    window.addEventListener('offline', muda);
    return () => { window.removeEventListener('online', muda); window.removeEventListener('offline', muda); };
  }, []);
  return off;
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
