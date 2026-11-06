// REGISTRAR PESO, numa folha (docs/corpo/02-ux-corpo-livre.md, §2.3).
//
// A tela Corpo mostra o estado; registrar sobe de baixo, com o número e o
// Salvar na metade de baixo da tela, onde o polegar alcança. Já vem com o
// último peso: ajustar 100 g é um toque, outro número se digita. Data e hora
// são editáveis.

import { Folha } from '../instrumento/folha.jsx';
import { Stepper } from '../instrumento/primitivos.jsx';
import { Teclado } from '../instrumento/teclado.jsx';
import { fmtDec } from '../../dominio/formato';

export function FolhaPeso({ ctx }) {
  const p = ctx.registroDePeso();
  return (
    <Folha olho="o peso da manhã" titulo="Registrar peso" aoFechar={() => ctx.fechaFolha()}
           acao={<button class="ins-btn-primary" data-a="peso-salva" onClick={ctx.salvaPeso}>Salvar</button>}>
      <div class="co-quando">
        <label class="co-quando-c">
          <span class="ins-label-sm">dia</span>
          <input class="ins-input" type="date" id="peso-dia" value={p.dia.iso} max={p.dia.max}
                 onInput={e => ctx.setDiaCorpo('peso', e.currentTarget.value)} />
        </label>
        <label class="co-quando-c">
          <span class="ins-label-sm">hora</span>
          <input class="ins-input" type="time" id="peso-hora" value={p.hora}
                 onInput={e => ctx.setHoraCorpo('peso', e.currentTarget.value)} />
        </label>
      </div>
      <p class="ins-body-xs ins-t3">{p.dia.jaTem}</p>
      <div class="co-peso-v">
        <Stepper valor={p.valor} passo={0.1} min={20} max={250} fmt={v => fmtDec(v) + ' kg'} onMuda={ctx.setPeso} />
      </div>
      {p.ultima && <p class="ins-body-sm ins-t3 co-peso-ult">{p.ultima}</p>}
      {p.teclado
        ? <Teclado texto={p.teclado.texto} decimal={p.teclado.decimal} unidade={p.teclado.unidade}
                   rotulo="digitar o peso em kg" aoTeclar={t => ctx.tecla(t)} aoFechar={ctx.fechaTeclado} />
        : <button class="dd-tclbtn" data-a="peso-tcl" onClick={() => ctx.abreTecladoDeCorpo('peso')}>Digitar o número</button>}
    </Folha>
  );
}
