// COMIDA — a biblioteca de alimentos, o plano e as compras.
//
// Compras não é uma lista guardada: é derivada do plano × a previsão da semana,
// convertida de pronto para cru onde há fator. Cada linha convertida carrega a
// procedência, porque "1,3 kg" sem dizer que veio de "1 kg pronto" é um número
// que ninguém confere no açougue.

import { useState } from 'preact/hooks';
import { Cabecalho, Chips, Procedencia, Secao, Vazio } from '../instrumento/primitivos.jsx';
import { CATEGORIAS } from '../../dominio/nutricao/alimentos';
import { fmtKg } from '../../dominio/nutricao/calculo';

const HORIZONTES = [
  { k: 7, t: '7 dias' }, { k: 14, t: '14 dias' }, { k: 30, t: '30 dias' }
];

function Biblioteca({ ctx, busca }) {
  const alimentos = ctx.alimentosFiltrados(busca);
  return (
    <>
      {CATEGORIAS.map(([k, rotulo]) => {
        const grupo = alimentos.filter(a => a.cat === k);
        if (!grupo.length) return null;
        return (
          <div key={k} class="cm-cat">
            <div class="ins-label cm-cat-h">{rotulo}</div>
            <div class="ins-lista">
              {grupo.map(a => (
                <button key={a.id} class="ins-linha" onClick={() => ctx.editaAlimento(a.id)}>
                  <span class="ins-linha-n">
                    <span class={'ins-linha-t' + (a.meu ? ' ins-acid' : '')}>{a.n}</span>
                    <span class="ins-linha-s">
                      P {a.p} · C {a.c} · G {a.g} · por 100 {a.u}
                    </span>
                  </span>
                  <span class="ins-linha-v">{a.kcal} kcal</span>
                </button>
              ))}
            </div>
          </div>
        );
      })}
      {alimentos.length === 0 && <Vazio>Nenhum alimento com esse nome.</Vazio>}
    </>
  );
}

function Compras({ ctx }) {
  const { linhas, previsao, dias, comprado } = ctx.compras();
  const porCat = CATEGORIAS
    .map(([k, rotulo]) => [rotulo, linhas.filter(l => l.cat === k)])
    .filter(([, l]) => l.length);

  return (
    <>
      <Chips
        opcoes={HORIZONTES}
        valor={dias}
        onMuda={ctx.setHorizonteCompras}
      />
      <Procedencia>
        previsão pela semana típica · {previsao.treino} de treino e {previsao.descanso} de
        descanso em {dias} dias. A rotação decide qual treino vem; a cadência só
        estima quantos serão.
      </Procedencia>

      {porCat.length === 0 && <Vazio>O plano está vazio, então não há o que comprar.</Vazio>}

      {porCat.map(([rotulo, ls]) => (
        <div key={rotulo} class="cm-cat">
          <div class="ins-label cm-cat-h">{rotulo}</div>
          <div class="ins-lista">
            {ls.map(l => (
              <button
                key={l.f}
                class={'ins-linha' + (comprado[l.f] ? ' comprado' : '')}
                onClick={() => ctx.marcaCompra(l.f)}
              >
                <span class="ins-linha-n">
                  <span class="ins-linha-t">{l.n}</span>
                  {l.procedencia && <span class="ins-provenance">{l.procedencia}</span>}
                </span>
                <span class="ins-linha-v">{fmtKg(l.comprar, l.u)}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}

export function Comida({ ctx }) {
  const [aba, setAba] = useState('plano');
  const [busca, setBusca] = useState('');
  const plano = ctx.planoCompleto();

  return (
    <>
      <Cabecalho olho="comida" titulo="Plano" />

      <Secao primeira>
        <Chips
          opcoes={[
            { k: 'plano', t: 'plano' },
            { k: 'alimentos', t: 'alimentos' },
            { k: 'compras', t: 'compras' }
          ]}
          valor={aba}
          onMuda={setAba}
        />
      </Secao>

      {aba === 'plano' && (
        <Secao rotulo="refeições" nota="a edição vale para todo dia">
          <div class="ins-lista">
            {plano.map(r => (
              <button key={r.id} class="ins-linha" onClick={() => ctx.editaRefeicao(r.id)}>
                <span class="ins-linha-n">
                  <span class="ins-linha-t">{r.n}</span>
                  <span class="ins-linha-s">
                    {r.t} · {r.quando === 'sempre' ? 'todo dia'
                      : r.quando === 'treino' ? 'só em dia de treino' : 'só em dia de alta'}
                    {' · '}{r.itens.length} {r.itens.length === 1 ? 'item' : 'itens'}
                  </span>
                </span>
                <span class="ins-linha-v">{r.kcal} kcal</span>
              </button>
            ))}
          </div>
          <button class="ins-btn-add" onClick={ctx.novaRefeicao}>+ adicionar refeição</button>
        </Secao>
      )}

      {aba === 'alimentos' && (
        <Secao rotulo="biblioteca" nota="o que você cadastrou aparece em ácido">
          <input
            class="ins-input" type="search" inputmode="search"
            placeholder="buscar alimento" value={busca}
            onInput={e => setBusca(e.currentTarget.value)}
          />
          <div class="cm-espaco" />
          <button class="ins-btn-add" onClick={ctx.novoAlimento}>+ cadastrar alimento</button>
          <div class="cm-espaco" />
          <Biblioteca ctx={ctx} busca={busca} />
        </Secao>
      )}

      {aba === 'compras' && (
        <Secao rotulo="lista" nota="derivada do plano · nada aqui é digitado">
          <Compras ctx={ctx} />
        </Secao>
      )}
    </>
  );
}
