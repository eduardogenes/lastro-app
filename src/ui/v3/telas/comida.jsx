// OS EDITORES DE COMIDA no visual novo (prerrequisito da Fase 5): a refeição,
// a escolha de um alimento e o alimento. Mesmos dados e mesmas portas do
// visual antigo (`ctx.refeicaoParaEditar`, `ctx.salvaRefeicao`,
// `ctx.alimentosParaSeletor`, `ctx.salvaAlimento`…).
//
// A regra que estas folhas carregam: EDITAR É PERMANENTE. Mexer aqui muda o
// plano de todo dia, e o texto diz isso; o ajuste "só de hoje" mora na folha
// da refeição do Hoje. E o que destrói fica um nível para dentro, por último.

import { useState } from 'preact/hooks';
import { ic } from '../icones.jsx';
import { Acoes, Apoio, Botao, Chave, Fichas, Folha, Linha, Saida, Seletor, Vazio } from '../base.jsx';
import { Regua } from '../regua.jsx';
import { CATEGORIAS } from '../../../dominio/nutricao/alimentos';

const QUANDO = [{ k: 'sempre', t: 'Todo dia' }, { k: 'treino', t: 'Só em dia de treino' }, { k: 'alta', t: 'Só em dia de alta demanda' }];

/** Um item da refeição, aberto no lugar: quantidade, "só em alta", trocar e tirar. */
function ItemAberto({ ctx, r, i, aoFechar }) {
  const [q, setQ] = useState(i.q);
  return (
    <div class="v3-dia-ed">
      <div class="v3-gigante v3-n v3-gigante-m">{Math.round(q)}<small>{i.u}</small></div>
      <Regua min={0} max={Math.max(300, Math.ceil(i.q * 2 / 50) * 50)} passo={i.u === 'g' ? 5 : 10} cada={50} largura={10}
             valor={q} aoMudar={setQ} rotulo={i.n + ' em ' + i.u} />
      <Acoes><Botao data-a={'ed-item-qtd-' + i.idx} disabled={Math.round(q) === i.q} onClick={() => ctx.setQuantidade(r.id, i.idx, q)}>
        Guardar {Math.round(q)} {i.u}
      </Botao></Acoes>
      <Chave titulo="Só em dia de alta demanda" ligada={i.alta} data-a={'ed-item-alta-' + i.idx} aoMudar={() => ctx.alternaAlta(r.id, i.idx)} />
      <Acoes><Botao tipo="contorno" cheio data-a={'ed-item-troca-' + i.idx} onClick={() => ctx.abreFolha({ k: 'seletor', ref: r.id, idx: i.idx })}>Trocar por outro alimento</Botao></Acoes>
      <Saida data-a={'ed-item-tira-' + i.idx} onClick={() => { ctx.removeItem(r.id, i.idx); aoFechar(); }}>Tirar da refeição</Saida>
    </div>
  );
}

/** A refeição do plano: nome, hora, quando aparece, nota, e o que tem dentro. */
export function FolhaEditaRefeicaoV3({ ctx, f }) {
  const r = ctx.refeicaoParaEditar(f.id);
  const [aberto, setAberto] = useState(null);
  const [campos, setCampos] = useState({ n: r.n, t: r.t, tag: r.tag, quando: r.quando, nota: r.nota });
  // atualização pela função: dois campos tocados antes de um desenho não se apagam
  const muda = (k, v) => {
    setCampos(c => Object.assign({}, c, { [k]: v }));
    if (r.id) ctx.salvaRefeicao(r.id, { [k]: v });
  };
  return (
    <Folha titulo={campos.n || (r.novo ? 'Nova refeição' : 'Refeição')}
           sub={r.novo ? 'Entra no plano de todo dia.' : 'Muda o plano de todo dia. O que você já marcou em dias passados não muda.'}
           aoFechar={() => ctx.fechaFolha()}>
      <label class="v3-rotulo" for="ref-nome">Nome</label>
      <input id="ref-nome" class="v3-campo" type="text" value={campos.n} placeholder="Lanche da tarde" onInput={e => muda('n', e.currentTarget.value)} />
      <label class="v3-rotulo" for="ref-hora">Horário</label>
      <input id="ref-hora" class="v3-campo" type="time" value={campos.t} onInput={e => muda('t', e.currentTarget.value)} />
      <label class="v3-rotulo" for="ref-etiqueta">Etiqueta, se quiser</label>
      <input id="ref-etiqueta" class="v3-campo" type="text" value={campos.tag} placeholder="pré-treino" onInput={e => muda('tag', e.currentTarget.value)} />
      <p class="v3-rotulo">Aparece</p>
      <Fichas rotulo="Aparece" prefixo="ref-quando-" aoTocar={k => muda('quando', k)}
              opcoes={QUANDO.map(x => ({ k: x.k, t: x.t, on: campos.quando === x.k }))} />
      <label class="v3-rotulo" for="ref-nota">Nota</label>
      <textarea id="ref-nota" class="v3-campo v3-nota" value={campos.nota} placeholder="por que esta refeição é assim"
                onInput={e => muda('nota', e.currentTarget.value)} />

      {r.novo ? (
        <Acoes><Botao data-a="ref-cria" disabled={!campos.n.trim()} onClick={() => { ctx.salvaRefeicao(null, campos); ctx.fechaFolha(); }}>Criar a refeição</Botao></Acoes>
      ) : (
        <>
          <p class="v3-rotulo">O que tem dentro, para todo dia</p>
          {r.itens.length === 0
            ? <Vazio titulo="Nenhum alimento ainda"><p>Adicione o primeiro abaixo.</p></Vazio>
            : r.itens.map(i => (
              <div key={i.idx}>
                <Linha titulo={i.n} apoio={i.sumido ? 'este alimento não está mais na biblioteca' : i.alta ? 'só em dia de alta demanda' : null}
                       valor={String(i.q)} unidade={i.u} data-a={'ed-item-' + i.idx} aria-expanded={aberto === i.idx ? 'true' : 'false'}
                       aoTocar={() => setAberto(aberto === i.idx ? null : i.idx)} />
                {aberto === i.idx && <ItemAberto key={i.f + i.q} ctx={ctx} r={r} i={i} aoFechar={() => setAberto(null)} />}
              </div>
            ))}
          <Acoes><Botao tipo="contorno" cheio data-a="ref-adiciona" onClick={() => ctx.abreFolha({ k: 'seletor', ref: r.id, idx: null })}>{ic.mais} Adicionar alimento</Botao></Acoes>
          <div class="v3-saidas">
            <Saida data-a="ref-duplica" onClick={() => ctx.duplicaRefeicao(r.id)}>Duplicar a refeição</Saida>
            <Saida data-a="ref-remove" onClick={() => ctx.removeRefeicao(r.id)}>Tirar do plano</Saida>
          </div>
        </>
      )}
    </Folha>
  );
}

/** Escolher um alimento, para pôr na refeição ou trocar um item. */
export function FolhaSeletorV3({ ctx, f }) {
  const [q, setQ] = useState('');
  const lista = ctx.alimentosParaSeletor(q);
  const escolhe = id => f.idx == null ? ctx.adicionaItem(f.ref, id) : ctx.trocaItem(f.ref, f.idx, id);
  return (
    <Folha titulo={f.idx == null ? 'Adicionar alimento' : 'Trocar por'} sub="Por 100 g ou 100 ml." aoFechar={() => ctx.fechaFolha()}>
      <input id="seletor-busca" class="v3-campo" type="search" value={q} placeholder="Buscar alimento" aria-label="Buscar alimento" autocomplete="off"
             onInput={e => setQ(e.currentTarget.value)} />
      {lista.length === 0 && <Vazio titulo="Nada com esse nome"><p>Cadastre o alimento com os números do rótulo.</p></Vazio>}
      {CATEGORIAS.map(([k, rotulo]) => {
        const grupo = lista.filter(a => a.cat === k);
        if (!grupo.length) return null;
        return (
          <div key={k}>
            <p class="v3-rotulo">{rotulo}</p>
            {grupo.map(a => (
              <Linha key={a.id} titulo={a.n} apoio={'P ' + a.p + ' · C ' + a.c + ' · G ' + a.g + (a.meu ? ' · seu' : '')}
                     valor={String(a.kcal)} unidade="kcal" data-a={'seletor-' + a.id} aoTocar={() => escolhe(a.id)} />
            ))}
          </div>
        );
      })}
      <Acoes><Botao tipo="contorno" cheio data-a="seletor-novo"
                    onClick={() => ctx.trocaFolha({ k: 'editaAlimento', id: null, para: { ref: f.ref, idx: f.idx } })}>{ic.mais} Cadastrar alimento novo</Botao></Acoes>
    </Folha>
  );
}

const num = v => { const n = parseFloat(String(v).replace(',', '.')); return isNaN(n) ? 0 : n; };
const MACROS = [['kcal', 'Calorias (kcal)'], ['p', 'Proteína (g)'], ['c', 'Carboidrato (g)'], ['g', 'Gordura (g)']];

/** O alimento: nome, categoria, unidade, os números por 100 e o fator cru. */
export function FolhaEditaAlimentoV3({ ctx, f }) {
  const a = ctx.alimentoParaEditar(f.id);
  const [c, setC] = useState(a);
  const muda = (k, v) => setC(x => Object.assign({}, x, { [k]: v }));
  return (
    <Folha titulo={c.n || (a.novo ? 'Novo alimento' : 'Alimento')}
           sub={a.novo ? 'Com os números do rótulo.' : a.daPrescricao ? 'Veio do plano do nutricionista. Editar muda só a sua cópia.' : 'Seu alimento.'}
           aoFechar={() => ctx.fechaFolha()}>
      <label class="v3-rotulo" for="alimento-nome">Nome</label>
      <input id="alimento-nome" class="v3-campo" type="text" value={c.n} onInput={e => muda('n', e.currentTarget.value)} />
      <p class="v3-rotulo">Categoria</p>
      <Fichas rotulo="Categoria" prefixo="alimento-cat-" aoTocar={k => muda('cat', k)}
              opcoes={CATEGORIAS.map(([k, t]) => ({ k, t, on: c.cat === k }))} />
      <p class="v3-rotulo">Unidade</p>
      <Seletor rotulo="Unidade" valor={c.u} aoMudar={k => muda('u', k)} opcoes={[{ k: 'g', t: 'gramas' }, { k: 'ml', t: 'mililitros' }]} />
      <p class="v3-rotulo">Por 100 {c.u}</p>
      <div class="v3-macros">
        {MACROS.map(([k, rotulo]) => (
          <label key={k} class="v3-macro">
            <span class="v3-rotulo">{rotulo}</span>
            <input id={'alimento-' + k} class="v3-campo" type="text" inputmode="decimal" value={c[k]} onInput={e => muda(k, e.currentTarget.value)} />
          </label>
        ))}
      </div>
      <label class="v3-rotulo" for="alimento-cru">Fator cru</label>
      <input id="alimento-cru" class="v3-campo" type="text" inputmode="decimal" value={c.cru} onInput={e => muda('cru', e.currentTarget.value)} />
      <Apoio>Quanto comprar para cada 1 de pronto (frango cozido é 1,31). Zero quer dizer que não converte.</Apoio>
      <Acoes><Botao data-a="alimento-salva" onClick={() => ctx.salvaAlimento(a.id, {
        n: c.n || 'Alimento', cat: c.cat, u: c.u, kcal: num(c.kcal), p: num(c.p), c: num(c.c), g: num(c.g), cru: num(c.cru)
      })}>{a.novo ? 'Cadastrar' : 'Guardar'}</Botao></Acoes>
      {!a.novo && (
        <Saida data-a="alimento-remove" onClick={() => ctx.removeAlimento(a.id)}>
          {a.daPrescricao ? 'Esconder da biblioteca' : 'Tirar da biblioteca'}
        </Saida>
      )}
      {a.daPrescricao && <Apoio>Voltar ao plano do nutricionista, em Ajustes, devolve o original.</Apoio>}
    </Folha>
  );
}
