// A BIOIMPEDÂNCIA, numa folha (docs/corpo/02-ux-corpo-livre.md, §2.5).
//
// É o formulário que morava na tela Corpo, sem mudar a regra: os cinco números
// saem do mesmo visor e são UMA leitura, com um instante só. Quatro são
// obrigatórios e a água pode ficar vazia. Os números de antes ficam no lugar
// ("toque só no que mudou"); escolhendo um dia que já tem leitura, vêm os
// daquele dia. Data e hora editáveis; dia passado sem hora fica sem hora.

import { useState } from 'preact/hooks';
import { Folha } from '../instrumento/folha.jsx';
import { fmtSig } from '../../dominio/formato';

function horaAgora() {
  const d = new Date();
  return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
}

export function FolhaBio({ ctx }) {
  const [rascunho, setRascunho] = useState({});
  const [dia, setDia] = useState(null);
  const [hora, setHora] = useState(null);
  const bio = ctx.bioimpedancia(dia);
  const d = dia || bio.maxISO;
  const hoje = d === bio.maxISO;

  const guarda = async () => {
    const leitura = {};
    bio.campos.forEach(c => { leitura[c.k] = c.k in rascunho ? rascunho[c.k] : c.antes; });
    const h = hora || '';
    const quando = h ? new Date(d + 'T' + h + ':00').getTime() : (hoje ? Date.now() : Date.parse(d + 'T12:00:00'));
    await ctx.registraBioDaFolha(leitura, quando, !h && !hoje);
  };

  return (
    <Folha olho={bio.nota} titulo="Bioimpedância" aoFechar={() => ctx.fechaFolha()}
           acao={<button class="ins-btn-primary" data-a="registra-bio" onClick={guarda}>Guardar os cinco</button>}>
      <p class="ins-body-sm ins-t2 co-bio-i">{bio.instrucao}</p>
      <div class="co-quando">
        <label class="co-quando-c">
          <span class="ins-label-sm">dia</span>
          <input class="ins-input" type="date" id="bio-dia" max={bio.maxISO} value={d}
                 aria-label="data da leitura"
                 onInput={e => { setDia(e.currentTarget.value); setHora(null); }} />
        </label>
        <label class="co-quando-c">
          <span class="ins-label-sm">hora</span>
          <input class="ins-input" type="time" id="bio-hora"
                 value={hora != null ? hora : (hoje ? horaAgora() : '')}
                 aria-label="hora da leitura"
                 onInput={e => setHora(e.currentTarget.value)} />
        </label>
      </div>
      {!hoje && !hora && <p class="ins-body-xs ins-t3">Sem hora, a leitura fica registrada só com a data.</p>}
      <div class="co-bio">
        {bio.campos.map(c => (
          <label key={c.k} class="co-bio-c">
            <span class="ins-label-sm">{c.rotulo}</span>
            <input
              class="ins-input" id={'bio-' + c.k} type="text" inputMode="decimal" aria-label={c.rotulo}
              value={c.k in rascunho ? rascunho[c.k] : c.antes}
              onInput={e => { const v = e.currentTarget.value; setRascunho(prev => Object.assign({}, prev, { [c.k]: v })); }}
            />
            {c.valor != null && (
              <span class="ins-body-xs ins-t3 co-bio-era">
                era {c.antes}{(function () {
                  const v = parseFloat(String(c.k in rascunho ? rascunho[c.k] : c.antes).replace(',', '.'));
                  const x = isNaN(v) ? 0 : Math.round((v - c.valor) * 10) / 10;
                  return x ? ' · ' + fmtSig(x) : '';
                })()}
              </span>
            )}
          </label>
        ))}
      </div>
      <p class="ins-body-xs ins-t3 co-bio-ob">
        Quatro números são obrigatórios. A água corporal total pode ficar vazia — e
        vazia não é zero.
      </p>
      <p class="ins-body-xs ins-t3 co-bio-nada">Nada está registrado até você tocar em Guardar os cinco.</p>
    </Folha>
  );
}
