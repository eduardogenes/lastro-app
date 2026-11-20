// O CATÁLOGO DE EXERCÍCIOS no visual novo (prerrequisito da Fase 5): buscar e
// adicionar ao treino, ou cadastrar um exercício que o app ainda não conhece.
// Abre do editor do programa (a adição fica no programa) e da aula (fica só no
// dia). Dados e portas: `ctx.catalogoV3`, `ctx.adicionaDoCatalogoV3`,
// `ctx.criaNoCatalogoV3`, que chegam em `addExercicio` e `criarExercicioCom`.

import { useState } from 'preact/hooks';
import { ic } from '../icones.jsx';
import { Acoes, Apoio, Botao, Chave, Fichas, Folha, Linha, Saida, Vazio } from '../base.jsx';

export function FolhaCatalogo({ ctx, f }) {
  const c = ctx.catalogoV3(f.trocaDe);
  const troca = Number.isInteger(f.trocaDe);
  const [novo, setNovo] = useState({ nome: '', grupo: '', carga: 'pino', unidade: '', q: '', composto: false });
  const m = (k, v) => setNovo(x => Object.assign({}, x, { [k]: v }));
  const sub = c.permanente ? 'Entra no programa, para as próximas vezes.' : 'Só no treino de hoje. O programa não muda.';
  if (c.novo) {
    return (
      <Folha titulo="Exercício novo" sub="Ele passa a ter histórico próprio, como os outros." aoFechar={ctx.fechaCatalogoV3}>
        <label class="v3-rotulo" for="novo-ex-nome">Nome</label>
        <input id="novo-ex-nome" class="v3-campo" type="text" value={novo.nome} placeholder="Remada na máquina articulada"
               onInput={e => m('nome', e.currentTarget.value)} />
        <p class="v3-rotulo">Como se mede</p>
        <Fichas rotulo="Como se mede" prefixo="novo-ex-u-" aoTocar={k => m('unidade', k)}
                opcoes={c.novo.unidades.map(u => ({ k: u.k, t: u.t, on: novo.unidade === u.k }))} />
        {!novo.unidade && (
          <>
            <p class="v3-rotulo">Grupo muscular</p>
            <Fichas rotulo="Grupo muscular" prefixo="novo-ex-g-" aoTocar={k => m('grupo', k)}
                    opcoes={c.novo.grupos.map(g => ({ k: g, t: g, on: novo.grupo === g }))} />
          </>
        )}
        <p class="v3-rotulo">A carga</p>
        <Fichas rotulo="A carga" prefixo="novo-ex-c-" aoTocar={k => m('carga', k)}
                opcoes={c.novo.cargas.map(x => ({ k: x.k, t: x.t, on: novo.carga === x.k }))} />
        {novo.unidade && (
          <>
            <label class="v3-rotulo" for="novo-ex-q">Quanto em cada passada, se quiser</label>
            <input id="novo-ex-q" class="v3-campo" type="text" inputmode="decimal" value={novo.q} onInput={e => m('q', e.currentTarget.value)} />
          </>
        )}
        <Chave titulo="É um composto" apoio="descanso mais longo entre as séries" ligada={novo.composto} data-a="novo-ex-composto"
               aoMudar={on => m('composto', on)} />
        <Acoes><Botao data-a="novo-ex-cria" disabled={novo.nome.trim().length < 3} onClick={() => ctx.criaNoCatalogoV3(novo)}>Criar e adicionar</Botao></Acoes>
        <Saida data-a="novo-ex-volta" onClick={() => ctx.novoNoCatalogoV3(false)}>Voltar à busca</Saida>
      </Folha>
    );
  }
  return (
    <Folha titulo={troca ? 'Trocar por outro' : 'Adicionar ao treino ' + c.dia} sub={sub} aoFechar={ctx.fechaCatalogoV3}>
      <input id="catalogo-busca" class="v3-campo" type="search" value={c.busca} placeholder="Buscar exercício ou grupo"
             aria-label="Buscar exercício ou grupo" autocomplete="off" onInput={e => ctx.buscaCatalogoV3(e.currentTarget.value)} />
      {c.achados.length === 0
        ? <Vazio titulo="Nada com esse nome"><p>{troca ? 'Tente outro nome ou grupo.' : 'Se o aparelho é novo para o app, cadastre abaixo.'}</p></Vazio>
        : c.achados.map(x => (
          <Linha key={x.id} titulo={x.n} apoio={x.sub + (x.ref ? ' · ' + x.ref : '')} mais data-a={'catalogo-' + x.id}
                 aoTocar={() => {
                   if (troca) { ctx.acoesEx.setAlt(f.trocaDe, x.id); ctx.concluiFolha(); }
                   else ctx.adicionaDoCatalogoV3(x.id);
                 }} />
        ))}
      {!troca && <><Acoes><Botao tipo="contorno" cheio data-a="catalogo-novo" onClick={() => ctx.novoNoCatalogoV3(true)}>{ic.mais} Cadastrar exercício novo</Botao></Acoes>
      <Apoio>Para o equipamento que o app ainda não conhece.</Apoio></>}
    </Folha>
  );
}
