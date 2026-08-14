// Os editores de COMIDA: refeição, seletor de alimento, alimento.
//
// Três leis do sistema só existem de verdade quando estas folhas existem:
//
//   3. Não existe modo de edição. A refeição carrega o próprio `···`; o item
//      dentro dela expande no lugar. Nada é somente-leitura até destravar.
//   4. Destrutivo um nível para dentro, em coral, abaixo do construtivo —
//      nunca na lista, onde o polegar passa raspando.
//   6. Editar é permanente, ajustar é de hoje, e o RÓTULO diz qual é qual.
//      Mexer na quantidade aqui muda o plano para todo dia; o controle de
//      porção da folha de refeição é "só de hoje" e zera com a data. São telas
//      diferentes de propósito.

import { useState } from 'preact/hooks';
import { Folha, LinhaExpansivel } from '../instrumento/folha.jsx';
import { Chips, Procedencia, Stepper, Vazio } from '../instrumento/primitivos.jsx';
import { CATEGORIAS } from '../../dominio/nutricao/alimentos';

const QUANDO = [
  { k: 'sempre', t: 'todo dia' },
  { k: 'treino', t: 'só treino' },
  { k: 'alta', t: 'só alta' }
];

/** Campo de texto com rótulo. A prosa fica na display; o número, em mono. */
function Campo({ rotulo, valor, onMuda, tipo = 'text', modo, dica }) {
  return (
    <label class="ed-campo">
      <span class="ins-label">{rotulo}</span>
      <input
        class="ins-input" type={tipo} inputmode={modo}
        value={valor}
        onInput={e => onMuda(e.currentTarget.value)}
      />
      {dica && <Procedencia>{dica}</Procedencia>}
    </label>
  );
}

/* ---------- refeição ---------- */

export function FolhaEditaRefeicao({ ctx, id }) {
  const r = ctx.refeicaoParaEditar(id);
  const [aberto, setAberto] = useState(null);
  const [campos, setCampos] = useState({ n: r.n, t: r.t, tag: r.tag, quando: r.quando, nota: r.nota });

  const muda = (k, v) => {
    const novo = Object.assign({}, campos, { [k]: v });
    setCampos(novo);
    if (r.id) ctx.salvaRefeicao(r.id, { [k]: v });
  };

  return (
    <Folha
      olho={r.novo ? 'nova refeição' : 'editar refeição'}
      titulo={campos.n || 'Refeição'}
      meta={campos.t}
      nivel={50}
      aoFechar={ctx.fechaFolha}
      acao={r.novo
        ? <button class="ins-btn-primary" onClick={() => { ctx.salvaRefeicao(null, campos); ctx.fechaFolha(); }}>
            criar refeição
          </button>
        : <button class="ins-btn-secondary ins-btn-destructive" onClick={() => ctx.removeRefeicao(r.id)}>
            remover do plano
          </button>}
    >
      <Campo rotulo="nome" valor={campos.n} onMuda={v => muda('n', v)} />
      <Campo rotulo="horário" valor={campos.t} onMuda={v => muda('t', v)} tipo="time" />
      <Campo rotulo="etiqueta" valor={campos.tag} onMuda={v => muda('tag', v)}
             dica="aparece acima do nome, em caixa alta" />

      <div class="ed-campo">
        <span class="ins-label">aparece em</span>
        <Chips opcoes={QUANDO} valor={campos.quando} onMuda={v => muda('quando', v)} />
        <Procedencia>
          uma condição por refeição, não um plano por dia da semana.
        </Procedencia>
      </div>

      <div class="ed-campo">
        <span class="ins-label">nota</span>
        <textarea
          class="ins-input ed-nota" value={campos.nota}
          placeholder="por que esta refeição é assim"
          onInput={e => muda('nota', e.currentTarget.value)}
        />
      </div>

      {!r.novo && (
        <>
          <div class="ins-label ed-h">o que tem dentro · muda para todo dia</div>
          {r.itens.length === 0
            ? <Vazio>Nenhum alimento nesta refeição ainda.</Vazio>
            : <div class="ins-lista">
                {r.itens.map(i => (
                  <LinhaExpansivel
                    key={i.idx}
                    aberta={aberto === i.idx}
                    aoAbrir={() => setAberto(aberto === i.idx ? null : i.idx)}
                    cabecalho={
                      <span class="ed-item">
                        <span class="ed-item-n">
                          <span class={'ins-linha-t' + (i.sumido ? ' ins-amber' : '')}>{i.n}</span>
                          {i.alta && <span class="ins-linha-s">só em dia de alta demanda</span>}
                        </span>
                        <span class="ins-linha-v">{i.q} {i.u}</span>
                      </span>
                    }
                  >
                    <Stepper
                      valor={i.q} passo={i.u === 'g' ? 5 : 10} min={0} max={2000}
                      fmt={v => v + ' ' + i.u}
                      onMuda={v => ctx.setQuantidade(r.id, i.idx, v)}
                    />
                    <button
                      class={'ins-chip' + (i.alta ? ' on' : '')}
                      onClick={() => ctx.alternaAlta(r.id, i.idx)}
                    >só em dia de alta</button>
                    <div class="ins-lx-acoes">
                      <button
                        class="ins-btn-secondary"
                        onClick={() => ctx.abreFolha({ k: 'seletor', ref: r.id, idx: i.idx })}
                      >trocar</button>
                      <button
                        class="ins-btn-secondary ins-btn-destructive"
                        onClick={() => { ctx.removeItem(r.id, i.idx); setAberto(null); }}
                      >remover</button>
                    </div>
                  </LinhaExpansivel>
                ))}
              </div>}

          <button
            class="ins-btn-add ed-add"
            onClick={() => ctx.abreFolha({ k: 'seletor', ref: r.id, idx: null })}
          >+ adicionar alimento</button>

          <button class="ins-btn-secondary ed-dup" onClick={() => ctx.duplicaRefeicao(r.id)}>
            duplicar refeição
          </button>
        </>
      )}
    </Folha>
  );
}

/* ---------- seletor de alimento ---------- */

export function FolhaSeletor({ ctx, ref: refId, idx }) {
  const [q, setQ] = useState('');
  const lista = ctx.alimentosParaSeletor(q);
  const escolhe = id => idx == null ? ctx.adicionaItem(refId, id) : ctx.trocaItem(refId, idx, id);

  return (
    <Folha
      olho={idx == null ? 'adicionar' : 'trocar por'}
      titulo="Alimento"
      nivel={70}
      aoFechar={ctx.fechaFolha}
      acao={
        <button class="ins-btn-add" onClick={() => ctx.abreFolha({ k: 'editaAlimento', id: null })}>
          + cadastrar alimento novo
        </button>
      }
    >
      <input
        class="ins-input" type="search" placeholder="buscar alimento"
        value={q} onInput={e => setQ(e.currentTarget.value)}
      />

      {lista.length === 0 && <Vazio>Nenhum alimento com esse nome.</Vazio>}

      {CATEGORIAS.map(([k, rotulo]) => {
        const grupo = lista.filter(a => a.cat === k);
        if (!grupo.length) return null;
        return (
          <div key={k} class="cm-cat">
            <div class="ins-label cm-cat-h">{rotulo}</div>
            <div class="ins-lista">
              {grupo.map(a => (
                <button key={a.id} class="ins-linha" onClick={() => escolhe(a.id)}>
                  <span class="ins-linha-n">
                    <span class={'ins-linha-t' + (a.meu ? ' ins-acid' : '')}>{a.n}</span>
                    <span class="ins-linha-s">P {a.p} · C {a.c} · G {a.g} · por 100 {a.u}</span>
                  </span>
                  <span class="ins-linha-v">{a.kcal} kcal</span>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </Folha>
  );
}

/* ---------- alimento ---------- */

export function FolhaEditaAlimento({ ctx, id }) {
  const a = ctx.alimentoParaEditar(id);
  const [c, setC] = useState(a);
  const muda = (k, v) => setC(Object.assign({}, c, { [k]: v }));
  const num = v => { const n = parseFloat(String(v).replace(',', '.')); return isNaN(n) ? 0 : n; };

  return (
    <Folha
      olho={a.novo ? 'cadastrar' : (a.daPrescricao ? 'da prescrição' : 'seu alimento')}
      titulo={c.n || 'Alimento'}
      nivel={80}
      aoFechar={ctx.fechaFolha}
      acao={
        <button
          class="ins-btn-primary"
          onClick={() => ctx.salvaAlimento(a.id, {
            n: c.n || 'Alimento', cat: c.cat, u: c.u,
            kcal: num(c.kcal), p: num(c.p), c: num(c.c), g: num(c.g), cru: num(c.cru)
          })}
        >{a.novo ? 'cadastrar' : 'salvar'}</button>
      }
    >
      <Campo rotulo="nome" valor={c.n} onMuda={v => muda('n', v)} />

      <div class="ed-campo">
        <span class="ins-label">categoria</span>
        <Chips
          opcoes={CATEGORIAS.map(([k, t]) => ({ k, t: t.toLowerCase() }))}
          valor={c.cat} onMuda={v => muda('cat', v)}
        />
      </div>

      <div class="ed-campo">
        <span class="ins-label">unidade</span>
        <Chips
          opcoes={[{ k: 'g', t: 'gramas' }, { k: 'ml', t: 'mililitros' }]}
          valor={c.u} onMuda={v => muda('u', v)}
        />
      </div>

      <div class="ins-label ed-h">por 100 {c.u}</div>
      <div class="ed-macros">
        <Campo rotulo="kcal" valor={c.kcal} onMuda={v => muda('kcal', v)} modo="decimal" />
        <Campo rotulo="proteína" valor={c.p} onMuda={v => muda('p', v)} modo="decimal" />
        <Campo rotulo="carboidrato" valor={c.c} onMuda={v => muda('c', v)} modo="decimal" />
        <Campo rotulo="gordura" valor={c.g} onMuda={v => muda('g', v)} modo="decimal" />
      </div>

      <Campo
        rotulo="fator cru" valor={c.cru} onMuda={v => muda('cru', v)} modo="decimal"
        dica="quanto comprar para cada 1 de pronto. Frango cozido é 1,31. Zero quer dizer que não converte."
      />

      {!a.novo && (
        <button class="ins-btn-secondary ins-btn-destructive ed-rm" onClick={() => ctx.removeAlimento(a.id)}>
          {a.daPrescricao ? 'esconder da biblioteca' : 'remover da biblioteca'}
        </button>
      )}
      {a.daPrescricao && (
        <Procedencia>
          veio da prescrição do nutricionista. Editar aqui muda só a sua cópia;
          restaurar o plano no GUIA devolve o original.
        </Procedencia>
      )}
    </Folha>
  );
}
