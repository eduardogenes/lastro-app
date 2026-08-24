// A superfície de edição de exercício.
//
// Existe nos dois lugares em que se mexe numa lista de exercícios: o treino de
// HOJE (vale um dia) e o PROGRAMA (vale para sempre). São decisões de peso
// diferente, e as telas dizem isso com todas as letras — mas o gesto é o
// mesmo: subir, descer, mais série, menos série, trocar, remover.
//
// Por isso a linha é um componente só e quem executa entra por `acoes`. Duas
// cópias divergiriam na primeira correção feita só de um lado, e o app já teve
// esse bug: o passo de série virou 1..8 na edição do dia e continuou sem teto
// no programa por meses.

export function LinhaEditavel({ l, acoes, children }) {
  return (
    <div class={'edx' + (l.mexido ? ' mexido' : '')}>
      <div class="edx-h">
        <div class="ord">{l.ord}</div>
        <div class="edx-n">
          {l.nome}
          {l.noLugarDe && <em>{l.noLugarDe}</em>}
          <span>{l.meta}</span>
        </div>
        <div class="edx-mv">
          <button onClick={() => acoes.subir(l.i)} disabled={l.primeira} aria-label="subir">↑</button>
          <button onClick={() => acoes.descer(l.i)} disabled={l.ultima} aria-label="descer">↓</button>
        </div>
      </div>

      <div class="edx-c">
        <div class="stepper">
          <button onClick={() => acoes.menos(l.i)} disabled={l.series <= 1}>−</button>
          <b>{l.series}</b><span>séries</span>
          <button onClick={() => acoes.mais(l.i)} disabled={l.series >= 8}>+</button>
        </div>
        <button class="edx-b" onClick={() => acoes.trocar(l.i)}>trocar</button>
        <button class="edx-b rm" onClick={() => acoes.remover(l.i)}>remover</button>
      </div>

      {children}

      {l.impacto && (
        <div class={'edx-imp ins-provenance' + (l.impacto.acima ? ' acima ins-amber' : '')}>
          {l.impacto.txt}
        </div>
      )}

      {l.troca && <Troca i={l.i} t={l.troca} acoes={acoes} />}
    </div>
  );
}

/**
 * A lista de substituição, aberta dentro da própria linha.
 *
 * Cada opção mostra a última carga registrada NELA, não a do exercício que
 * está saindo: quem troca de máquina no meio do treino precisa saber com quanto
 * voltou da última vez naquela, e é a única informação que evita começar do
 * zero por falta de memória.
 */
export function Troca({ i, t, acoes }) {
  return (
    <div class="swap">
      {t.grupos.map((g, k) => (
        <div class="swap-g" key={k}>
          <div class="swap-h ins-label">{g.rotulo}</div>
          {g.opcoes.map(a => (
            <button class="swapopt" key={a.id} onClick={() => acoes.escolheTroca(i, a.id)}>
              <b>{a.n}</b><span>{a.antes}</span>
            </button>
          ))}
        </div>
      ))}
      {t.voltar && (
        <button class="swapopt back-orig" onClick={() => acoes.escolheTroca(i, null)}>
          <b>{t.voltar.t}</b><span>{t.voltar.sub}</span>
        </button>
      )}
      <button class="swapopt cancel" onClick={() => acoes.fechaTroca(i)}><b>Fechar</b></button>
    </div>
  );
}

/**
 * O catálogo, para adicionar exercício.
 *
 * O campo de busca é `id="addq"` porque `buscaEx()` re-renderiza a lista a
 * cada tecla e precisa devolver o foco ao campo — o teclado do iPhone fecha se
 * o elemento focado sumir, e reabrir custa meio segundo por letra digitada.
 */
export function AddEx({ c, acoes }) {
  return (
    <div class="addex">
      <div class="swap-h ins-label">Adicionar ao treino {c.dia}</div>
      <input type="text" class="addq" id="addq" placeholder="buscar exercício ou grupo"
             value={c.busca} onInput={e => acoes.busca(e.currentTarget.value)} />

      <div class="addlist">
        {c.achados.length === 0
          ? <p class="cue ins-body-sm ins-t3">Nada com esse nome no catálogo.</p>
          : c.achados.map(x => (
              <button class="swapopt" key={x.id} onClick={() => acoes.adiciona(x.id)}>
                <b>{x.n}</b><span>{x.sub}</span>
              </button>
            ))}
      </div>

      {c.novo ? (
        <div class="novoex">
          <div class="swap-h ins-label">Exercício novo</div>
          <input type="text" id="nxn" class="addq" placeholder="nome do exercício" />
          <select id="nxg" class="addq">
            <option value="">grupo muscular</option>
            {c.novo.grupos.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
          <select id="nxc" class="addq">
            {c.novo.cargas.map(x => <option key={x.k} value={x.k}>{x.t}</option>)}
          </select>
          <label class="nxk">
            <input type="checkbox" id="nxk" /> é um composto (descanso mais longo)
          </label>
          <button class="ins-btn-primary dbtn" onClick={acoes.cria}>Criar e adicionar</button>
        </div>
      ) : (
        <button class="swapopt novo" onClick={acoes.abreNovo}>
          <b>Cadastrar exercício novo</b>
          <span>Equipamento que o app ainda não conhece. Ele passa a ter histórico próprio.</span>
        </button>
      )}

      <button class="swapopt cancel" onClick={acoes.fecha}><b>Fechar</b></button>
    </div>
  );
}
