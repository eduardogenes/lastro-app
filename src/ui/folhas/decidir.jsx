// DECIDIR A MUDANÇA, sem sair do Agora (a D, `agora-descanso.html`, estado 7).
//
// O mesmo item da lista de Prescrição, numa folha: o que mudou, de que sessão
// veio, a conta do volume ANTES da decisão (decisão 1, F179) e a regra do
// treinador sobre séries a mais, na voz dele (F99). Cada botão grava no toque.
// Fechar a folha não decide nada, e a frase de baixo diz o que acontece se
// ninguém decidir.

import { Folha } from '../instrumento/folha.jsx';

export function FolhaDecidir({ ctx }) {
  const d = ctx.decisaoNoAgora();
  if (!d) return null;
  return (
    <Folha olho={d.olho} titulo={d.titulo} aoFechar={ctx.fechaFolha}>
      {d.grupos.map(g => (
        <div key={g.sid} class="dc-g">
          {d.grupos.length > 1 && <p class="ins-body-sm ins-t2 dc-g-h">{g.origem}</p>}
          {g.mudancas.map((m, i) => (
            <div key={m.txt} class="dc-m">
              {(d.grupos.length > 1 || g.mudancas.length > 1) && <p class="ins-body ins-t1">{m.txt}</p>}
              {m.impacto && (
                <p class={'ins-body-sm dc-imp' + (m.acima ? ' acima' : '')}>
                  <b>Se ficar no programa</b> · {m.impacto}
                </p>
              )}
              {m.regra && (
                <p class="ins-body-sm ins-t2 dc-regra">{m.regra} <span class="ins-t3">regra do treinador</span></p>
              )}
              <div class="ag-l-btns">
                <button class="ins-btn-secondary" data-a={'so-naquele-dia-' + g.sid + '-' + i}
                        onClick={() => ctx.decideNoAgora(g.sid, m.i, false)}>Foi só naquele dia</button>
                <button class="ins-btn-primary" data-a={'fica-no-programa-' + g.sid + '-' + i}
                        onClick={() => ctx.decideNoAgora(g.sid, m.i, true)}>Fica no programa</button>
              </div>
            </div>
          ))}
          <p class="ins-body-xs ins-t3 dc-se">{g.seNinguem}</p>
        </div>
      ))}
    </Folha>
  );
}
