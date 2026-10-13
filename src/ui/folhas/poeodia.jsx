// A FOLHA DE PÔR O DIA EM DIA — registrar a terça que ele esqueceu de marcar.
//
// A tarefa que o app não tinha. O chão é `poeComidaNoDia` (frente 0), o modelo é
// `CTX.poeODiaEmDia` / `CTX.marcaNoDiaPassado`, e este é o desenho da frente 2
// (§4.2 a §4.5). As cinco decisões do dono de 06/10 estão todas dentro.
//
// ---- As três coisas que esta folha diz em voz alta ----
//
// 1. **"Este dia foi contado contra o plano de hoje."** O plano daquela data não
//    existe em lugar nenhum — `pv` guarda QUANDO ele era aquele, não O QUE era.
//    Se ele puser em dia uma terça de antes da ceia entrar, o dia é recalculado
//    contra um plano de sete refeições. A folha diz qual plano usou.
// 2. **Pôr um dia em dia não apaga nada.** Marca nova vence marca velha chave a
//    chave; o resto fica. **Não há "limpar o dia"**, e não pode haver: apagar um
//    dia do histórico é destrutivo e não foi desenhado.
// 3. **Nada aqui está registrado até ele tocar.** A pré-marcação é SUGESTÃO, e a
//    folha nomeia a CAUSA da marca em vez de nomear a marca.
//
// ---- O que um toque faz ----
//
// **O primeiro toque grava o dia inteiro como está sugerido**, e cada toque
// seguinte corrige uma linha (decisão P3.i.6). Não é "o toque grava aquela
// linha" — é "o toque transforma a sugestão inteira em registro, com a linha
// tocada já corrigida". Qualquer outra leitura exige um botão de guardar, e o
// botão está proibido.
//
// E é por isso que a frase de leitura de volta é obrigatória: se um toque grava
// sete refeições, a tela tem de dizer as sete. Ela vive num nó
// `aria-live="polite"`, porque a gravação acontece no toque.
//
// ---- O que NÃO existe aqui ----
//
// **Não há "Cancelar".** Fechar sem tocar não grava nada — o véu, o Voltar do
// sistema e o `×` levam todos ao mesmo lugar. Mas se ele tocou uma linha, o dia
// está gravado, e fechar não desfaz: não existe lote. O que existe é reabrir e
// corrigir, que é o caso de uso para o qual `poeComidaNoDia` foi escrita.
// Oferecer um cancelar que não cancela é falso.
//
// **Não há nível 4 de folha.** Esta é nível 1; a régua de porções abre DENTRO
// dela, não como folha nova — "na quarta ninguém mais sabe o que fechar leva de
// volta para onde".

import { useState } from 'preact/hooks';
import { Folha } from '../instrumento/folha.jsx';
import { Procedencia } from '../instrumento/primitivos.jsx';

/** As cinco marcas, na ordem em que o dedo as encontra. */
const MARCAS = [
  { k: 'tudo', t: 'Tudo' },
  { k: 'metade', t: 'Metade' },
  { k: 'fora', t: 'Fora' },
  { k: 'nsei', t: 'Não sei' },
  // O quinto, e é o que destrava o portão: declarar "não comi" com um toque
  // produz dia CONTADO em vez de silêncio, e silêncio não conta para o 11 em 14.
  { k: 'nao', t: 'Não comi' }
];

const PORCAO_TXT = { 0.5: '½', 0.75: '¾', 1: 'cheia', 1.25: '1¼', 1.5: '1½' };

export function FolhaPoeODia({ ctx, data }) {
  // A régua de porções abre por LINHA, e uma por vez: duas abertas devolvem a
  // rolagem que a folha existe para tirar.
  const [regua, setRegua] = useState(null);
  const d = ctx.poeODiaEmDia(data);
  if (!d) return null;

  return (
    <Folha olho={'pôr em dia · ' + data} titulo="O que você comeu"
           aoFechar={ctx.fechaFolha}>

      {/* A SUGESTÃO DECLARADA, e o texto nomeia a CAUSA da marca em vez de
          nomear a marca. É o que paga a decisão 5 do dono — a última refeição
          continua pré-marcada por passagem de horário —, e a frente 3 escreveu a
          frase: o risco é a folha aberta às 22h sugerir que ele já tomou a ceia,
          e um toque em qualquer linha gravar a sugestão inteira. */}
      {!d.fechado && (
        <Procedencia>
          nada aqui está registrado até você tocar · o que vem marcado vem pelo
          horário do plano, não porque o app sabe
        </Procedencia>
      )}

      <div class="pd-linhas">
        {d.linhas.map(l => (
          <div key={l.id} class={'pd-linha' + (l.sugerida ? ' sugerida' : '')}>
            <div class="pd-topo">
              <span class="ins-label-sm pd-hora">{l.hora}</span>
              <span class="ins-linha-t pd-nome">{l.nome}</span>
            </div>
            {/* A procedência da marca, em PALAVRA e não em cor — é 1.4.1, e a
                distinção entre sugerido e declarado não pode ser só de cor. */}
            {l.procedencia && (
              <div class="ins-body-xs ins-t3 pd-proc">{l.procedencia}</div>
            )}
            <div class="ins-body-xs ins-t3 pd-resumo">{l.resumo}</div>

            <div class="pd-marcas">
              {MARCAS.map(m => (
                <button
                  key={m.k}
                  class={'ins-chip pd-marca' + (l.marca === m.k ? ' on' : '')}
                  data-a={'marca-' + l.id + '-' + m.k}
                  aria-pressed={l.marca === m.k ? 'true' : 'false'}
                  onClick={() => { setRegua(null); ctx.marcaNoDiaPassado(data, l.id, m.k, null); }}
                >{m.t}</button>
              ))}
            </div>

            {/* A PORÇÃO acima de 1, decisão 3: os mesmos cinco valores que o dia
                corrente já tem. "Comi uma vez e meia o almoço" passa a se dizer
                de um dia passado — antes isso só existia no dia de hoje.
                Abre DENTRO da folha, e não como folha nova: não há nível 4. */}
            <button class="ins-btn-secondary pd-porcao" data-a={'porcao-' + l.id}
                    onClick={() => setRegua(regua === l.id ? null : l.id)}>
              porção · {PORCAO_TXT[l.escala] || l.escala}
            </button>
            {regua === l.id && (
              <div class="ins-chips pd-regua">
                {d.porcoes.map(p => (
                  <button key={p}
                          class={'ins-chip' + (l.escala === p ? ' on' : '')}
                          data-a={'porcao-' + l.id + '-' + p}
                          onClick={() => {
                            setRegua(null);
                            ctx.marcaNoDiaPassado(data, l.id, l.marca === 'metade' ? 'tudo' : l.marca, p);
                          }}>{PORCAO_TXT[p] || p}</button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* A FRASE, e o nó é região viva. Se um toque grava sete refeições, a tela
          diz as sete — com as palavras que foram gravadas, e inclusive o que
          ficou sem marca. */}
      <div class="pd-frase ins-body-sm" role="status" aria-live="polite">{d.frase}</div>

      <Procedencia>{d.plano}</Procedencia>
      {/* O limite 2, dito: a folha não oferece limpar, e não pode. */}
      <Procedencia>
        corrigir aqui não apaga nada · marca nova vence a antiga, e o resto fica
      </Procedencia>
    </Folha>
  );
}
