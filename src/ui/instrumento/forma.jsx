// A FORMA DE CADA ESTADO DA COMIDA — forma e palavra, não só cor (a legenda da
// D). Usada no dia aberto de Dias e nas linhas da comida do Agora: o mesmo
// estado tem de ter o mesmo desenho nos dois lugares.
//
// `futuro` e `agora` só existem no Agora: a refeição que ainda não chegou é um
// fio fraco, e a da janela é o anel do acento.
//
// `recem`: a forma que o dedo acabou de marcar pela linha do Agora — ela pousa
// (`.df.recem`, `componentes.css`; peça 8 do motion). Quem a passa também dá à
// forma uma chave pelo estado, para outra marca ser outro nó e outro pouso.

export const NOME_DA_MARCA = {
  tudo: 'comi tudo', metade: 'metade', fora: 'fora do plano', nao: 'não comi',
  nsei: 'não sei', sem: 'sem marca', futuro: 'mais tarde', agora: 'agora'
};

export function Forma({ marca, recem }) {
  return (
    <svg class={'df ' + marca + (recem ? ' recem' : '')} viewBox="0 0 20 20" aria-hidden="true">
      {marca === 'tudo' && <><circle cx="10" cy="10" r="8" class="df-cheio" /><path d="M6 10.5l3 3 5-6" class="df-tinta" /></>}
      {marca === 'metade' && <><circle cx="10" cy="10" r="8" class="df-fio" /><path d="M10 2a8 8 0 0 1 0 16z" class="df-cheio" /></>}
      {marca === 'fora' && <><circle cx="10" cy="10" r="8" class="df-fio" /><path d="M4.5 15.5l11-11" class="df-traco" /></>}
      {marca === 'nao' && <><circle cx="10" cy="10" r="8" class="df-fio" /><path d="M5.5 10h9" class="df-traco" /></>}
      {marca === 'nsei' && <><circle cx="10" cy="10" r="8" class="df-trac" /><text x="10" y="14" text-anchor="middle" class="df-q">?</text></>}
      {marca === 'sem' && <circle cx="10" cy="10" r="8" class="df-trac" />}
      {marca === 'futuro' && <circle cx="10" cy="10" r="5" class="df-fut" />}
      {marca === 'agora' && <circle cx="10" cy="10" r="7" class="df-agora" />}
    </svg>
  );
}
