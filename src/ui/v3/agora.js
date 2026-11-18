// O relógio de parede para a tela: redesenha a cada segundo e ao voltar para o
// app (o iOS congela o setInterval com a página em segundo plano).

import { useEffect, useState } from 'preact/hooks';

export function useAgora() {
  const [t, setT] = useState(() => Date.now());
  useEffect(() => {
    const bate = () => setT(Date.now());
    const id = setInterval(bate, 1000);
    document.addEventListener('visibilitychange', bate);
    return () => { clearInterval(id); document.removeEventListener('visibilitychange', bate); };
  }, []);
  return t;
}
