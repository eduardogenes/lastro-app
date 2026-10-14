// O PESO DE HOJE, no descanso (a D, momento 1, estado 2): a mesma régua de
// 100 g e o mesmo teclado da tela do corpo, numa folha curta, para a pesagem
// que acontece no meio do treino não pedir sair da sessão. Sempre HOJE — o
// peso de outro dia mora na tela do corpo.

import { Folha } from '../instrumento/folha.jsx';
import { Stepper } from '../instrumento/primitivos.jsx';
import { Teclado } from '../instrumento/teclado.jsx';
import { fmtDec } from '../../dominio/formato';

export function FolhaPesoRapido({ ctx }) {
  const p = ctx.pesoRapido();
  return (
    <Folha olho="a sessão continua aberta" titulo="O peso de hoje" aoFechar={() => ctx.fechaFolha()}>
      <div class="dd-registro">
        <Stepper valor={p.valor} passo={0.1} min={20} max={250} fmt={v => fmtDec(v) + ' kg'} onMuda={ctx.setPeso} />
        <button class="ins-btn-secondary" data-a="peso-rapido-anota" onClick={ctx.registraPesoRapido}>Anotar</button>
      </div>
      {p.teclado
        ? <Teclado texto={p.teclado.texto} decimal={p.teclado.decimal} unidade={p.teclado.unidade}
                   rotulo="digitar o peso de hoje em kg" aoTeclar={t => ctx.tecla(t)} aoFechar={ctx.fechaTeclado} />
        : <button class="dd-tclbtn" data-a="peso-rapido-tcl" onClick={() => ctx.abreTecladoDeCorpo('peso')}>Digitar o número</button>}
      <p class="ins-body-sm ins-t3">De manhã, antes de treinar, com a mesma roupa.</p>
    </Folha>
  );
}
