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
 * A lista rápida: a aula inteira numa tela, um campo por movimento.
 *
 * O ritmo de registro de uma aula de box não é o da musculação. Entre duas
 * séries há 60 a 180 segundos parado, e é aí que se registra; entre dois
 * rounds de um circuito não há nada — o coach já chamou o próximo e o celular
 * está na mochila. A janela real é DEPOIS da aula, ofegante e curta, e nela
 * abrir cartão por cartão é o que não acontece.
 *
 * Continua sem botão de salvar, e aqui isso não é dogma: cada campo projeta no
 * histórico como qualquer outro do app. O que muda é a densidade, não a regra.
 */
export function RegistroRapido({ c, acoes }) {
  if (!c.ativo) {
    return (
      <button class="ins-btn-add tr-rapido" onClick={acoes.abre}>
        registrar a aula toda de uma vez
      </button>
    );
  }
  return (
    <div class="rapido">
      <div class="swap-h ins-label">A aula inteira · toque em fechar quando terminar</div>
      {c.linhas.map(l => (
        <div class={'rapl' + (l.feito ? ' feito' : '')} key={l.i}>
          <div class="rapl-n">
            <b>{l.nome}</b>
            <span>{l.prescricao}{l.nota ? ' · ' + l.nota : ''}</span>
          </div>
          <div class="rapl-c">
            <label class="rapl-f">
              <span>{l.unidade}</span>
              <input type="text" inputmode="decimal" id={`fw${l.i}`}
                     aria-label={`carga de ${l.nome}, ${l.unidade}`}
                     value={l.carga}
                     onInput={e => acoes.inp(e.currentTarget, l.i, 0)} />
            </label>
            <label class="rapl-f">
              <span>{l.medida}</span>
              <input type="text" inputmode="numeric" id={`fr${l.i}`}
                     aria-label={`${l.medida} de ${l.nome}`}
                     value={l.valor}
                     onInput={e => acoes.inp(e.currentTarget, l.i, 1)} />
            </label>
          </div>
        </div>
      ))}
      <button class="swapopt cancel" onClick={acoes.abre}><b>Fechar</b></button>
    </div>
  );
}

/**
 * As portas rápidas do dia aberto: repetir o sábado passado e os modelos.
 *
 * Existe porque montar uma aula de cinco movimentos em cinco rounds custava 66
 * interações — 32 toques e 34 teclas — antes do primeiro número. Aula de box
 * muda toda semana, mas o vocabulário do box não muda, e é essa a folga que
 * estas duas portas exploram.
 *
 * Elas põem PRESCRIÇÃO, nunca resultado. Um modelo que trouxesse as cargas da
 * última vez pareceria registro pronto, e registro que aparece sozinho é o
 * jeito mais rápido de encher o histórico de número que ninguém fez.
 */
export function Aulas({ c, acoes }) {
  if (!c.painelAberto) {
    // Fechado é uma linha só, e ela some quando não há nada a oferecer: sem
    // sábado anterior e sem modelo salvo, o botão abriria o vazio.
    if (!c.ultima && !c.modelos.length && !c.podeSalvar) return null;
    return (
      <button class="ins-btn-add tr-aulas" onClick={acoes.abre}>
        aulas salvas e o sábado passado
      </button>
    );
  }
  return (
    <div class="addex">
      <div class="swap-h ins-label">Montar a aula de hoje</div>

      {c.ultima && (
        <button class="swapopt" onClick={acoes.repete}>
          {/* Em `.swaptxt` e não solto: `.swapopt` é flex, e `b` e `span`
              soltos viram duas colunas — o que serve para "nome do exercício /
              grupo", e quebra num rótulo de ação que ocupa três linhas. */}
          <span class="swaptxt">
            <b>Repetir o sábado passado</b>
            <span>{c.ultima.n} {c.ultima.n === 1 ? 'movimento' : 'movimentos'} · {c.ultima.quando} · entra sem carga nenhuma</span>
          </span>
        </button>
      )}

      {c.modelos.length > 0 && (
        <div class="swap-g">
          <div class="swap-h ins-label">Modelos</div>
          {c.modelos.map(m => (
            <div class="aulal" key={m.id}>
              <button class="swapopt aulal-b" onClick={() => acoes.aplica(m.id)}>
                <span class="swaptxt"><b>{m.nome}</b><span>{m.sub}</span></span>
              </button>
              {/* Destrutivo um nível para dentro e em coral, nunca na lista:
                  aqui ele está na linha do próprio objeto, que é o nível de
                  dentro dele. */}
              <button class="aulal-x" aria-label={`apagar o modelo ${m.nome}`}
                      onClick={() => acoes.apaga(m.id)}>apagar</button>
            </div>
          ))}
        </div>
      )}

      {c.podeSalvar && (
        <button class="swapopt novo" onClick={acoes.salva}>
          <span class="swaptxt">
            <b>Salvar a aula de hoje como modelo</b>
            <span>Guarda os movimentos e como cada um se mede. Não guarda carga nem resultado.</span>
          </span>
        </button>
      )}

      <button class="swapopt cancel" onClick={acoes.abre}><b>Fechar</b></button>
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
          {/* A grandeza. Sem ela, movimento de aula de box nascia como série de
              hipertrofia: "Burpee" entrava 3 × 10–15, com campo de carga e
              selo de RIR, e não havia onde corrigir. */}
          <select id="nxu" class="addq">
            {c.novo.unidades.map(x => <option key={x.k} value={x.k}>{x.t}</option>)}
          </select>
          <input type="text" inputmode="decimal" id="nxq" class="addq"
                 placeholder="quanto em cada passada (opcional)" />
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
