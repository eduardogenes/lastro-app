import { Fragment } from 'preact';

// O cartão de exercício da tela de treino.
//
// É a parte do app que mais merecia sair do render por string. Aqui moram os
// campos de carga e repetição, e era aqui que o `innerHTML` inteiro era
// reescrito a cada tecla: o teclado fechava, o foco tinha que ser devolvido à
// mão, e o valor do campo vivia só no DOM. Os dois bugs que apagaram série
// registrada nasceram nessa fronteira.
//
// Com componente, o Preact toca só no atributo que mudou. O input em foco
// continua em foco porque é o MESMO nó — não há mais foco para devolver.
//
// O componente não lê estado: recebe um view-model pronto (`vm`) e as ações
// (`acoes`). É o que permite testá-lo com dado de mentira, e o que garante que
// nome de exercício cadastrado por ele seja escapado — JSX escapa tudo que não
// é marcado como HTML, então `Supino 45"` ou `Rosca <b>` não têm como quebrar
// a tela nem virar marcação.

/**
 * O cabeçalho da tabela de séries.
 *
 * Existe porque a linha passou a ter quatro colunas, e sem rótulo o terceiro
 * número seria adivinhação. A coluna ANTERIOR é o que ele fez nesta mesma série
 * da última vez — a referência que antes só existia como placeholder do
 * primeiro campo e obrigava a contar de cabeça para saber a série 3.
 */
function Cabecalho({ vm }) {
  return (
    <div class="sethead">
      <div class="setno">série</div>
      <div class="setant">anterior</div>
      <div class="f">{vm.unidade}</div>
      <div class="f">{vm.seg ? 'seg' : 'reps'}</div>
      <div class="f">rir</div>
    </div>
  );
}

/** Uma linha de série: número, o que foi feito da última vez, e os três campos. */
function Linha({ i, k, linha, vm, acoes }) {
  return (
    <div class="setrow">
      <div class="setno">{k + 1}</div>
      <div class="setant">{linha.antes || '–'}</div>
      <div class="f">
        <input
          type="text" inputmode="decimal" id={`w${i}_${k}`}
          value={linha.valor[0] != null ? linha.valor[0] : ''}
          onInput={e => acoes.inp(e.currentTarget, i, k, 0)}
        />
      </div>
      <div class="f">
        <input
          type="text" inputmode="numeric" id={`r${i}_${k}`}
          value={linha.valor[1] != null ? linha.valor[1] : ''}
          onInput={e => acoes.inp(e.currentTarget, i, k, 1)}
        />
      </div>
      {/* Botão e não campo: um dígito não vale abrir o teclado numérico, que
          cobre metade da tela no meio da série. */}
      <button
        class={'rirbtn' + (linha.rirAberto ? ' on' : '') +
               (linha.valor[2] == null ? ' vazio' : '')}
        id={`q${i}_${k}`}
        onClick={() => acoes.abreRir(i, k)}
      >{linha.valor[2] != null ? linha.valor[2] : '·'}</button>
    </div>
  );
}

/**
 * A escala de RIR da linha, aberta.
 *
 * Aparece embaixo da própria série, com tudo à vista — o segundo toque grava e
 * fecha. Não é lista suspensa: suspensa esconde as opções até abrir, e custa o
 * mesmo número de toques.
 */
function EscalaRir({ i, k, linha, acoes }) {
  return (
    <div class="rirscale">
      <span class="rirscale-r">rir da série {k + 1}</span>
      <div class="rirscale-v">
        {linha.rirEscala.map(x => (
          <button
            key={x.v} class={'rirop' + (x.on ? ' on' : '')}
            onClick={() => acoes.poeRir(i, k, x.v)}
          >{x.v}</button>
        ))}
      </div>
    </div>
  );
}

/** O painel de substituição, quando aberto. */
function Troca({ i, vm, acoes }) {
  const opt = a => (
    <button
      key={a.id} class={'swapopt' + (vm.alt === a.id ? ' on' : '')}
      onClick={() => acoes.setAlt(i, a.id)}
    >
      {/* Sem foto não entra nada: nem moldura, nem espaço reservado. Uma fila
          de quadros vazios diria menos que a fila de nomes que já existe. */}
      {a.foto && <img class="swapfoto" src={a.foto} alt="" />}
      <span class="swaptxt"><b>{a.n}</b><span>{a.antes}</span></span>
    </button>
  );
  return (
    <div class="swap">
      <div class="swap-h">Máquina ocupada? Mesmo padrão de movimento:</div>
      {vm.troca.indicados.map(opt)}
      {vm.troca.outros.length > 0 && (
        <>
          <div class="swap-h" style="margin-top:12px">Outros de {vm.grupo}:</div>
          {vm.troca.outros.map(opt)}
        </>
      )}
      {vm.alt && (
        <button class="swapopt back-orig" onClick={() => acoes.setAlt(i, null)}>
          <b>Voltar para {vm.nomeOriginal}</b><span>Cancela a substituição.</span>
        </button>
      )}
      <button class="swapopt cancel" onClick={() => acoes.toggleSwap(i)}><b>Fechar</b></button>
    </div>
  );
}

/** O bloco de anotação e dor da sessão. */
function Anotacao({ i, vm, acoes }) {
  if (!vm.notaAberta) {
    return (
      <button class="notabtn" onClick={() => acoes.abrirNota(i)}>anotar algo</button>
    );
  }
  return (
    <div class="obs">
      <div class="obs-h">anotação desta sessão</div>
      <textarea
        class="note" id={`o${i}`}
        placeholder="o que aconteceu neste exercício (opcional)"
        value={vm.obs}
        onInput={e => acoes.obsIn(e.currentTarget, i)}
      />
      <div class="obs-h" style="margin-top:14px">dor de tendão</div>
      <div class="chips">
        {vm.dores.map(x => (
          <button
            key={x.k} class={'chip' + (x.on ? ' on' : '')}
            onClick={() => acoes.toggleDor(i, x.k)}
          >{x.t}</button>
        ))}
      </div>
    </div>
  );
}

/** Como esse peso é carregado. */
function Carga({ i, vm, acoes }) {
  if (!vm.cargaAberta) {
    return (
      <button class="notabtn" onClick={() => acoes.abrirCarga(i)}>
        carga: {vm.tipoNome}
      </button>
    );
  }
  return (
    <div class="obs">
      <div class="obs-h">como esse peso é carregado</div>
      <div class="chips">
        {vm.cargas.map(c => (
          <button
            key={c.k} class={'chip' + (c.sel ? ' sel' : '')}
            onClick={() => acoes.setCarga(i, c.k)}
          >{c.nome}</button>
        ))}
      </div>
      <p class="cue" style="margin:12px 0 0">{vm.tipoAjuda}</p>
    </div>
  );
}

/** O aviso de dor, que é o freio mais importante da tela. */
function Dor({ i, vm, acoes }) {
  if (vm.dorRep) {
    return (
      <div class="painbox">
        <b>Dor em {vm.dorRep} nas duas últimas sessões deste exercício.</b>
        {' '}A regra do programa é tirar o exercício por 2 semanas e trocar o ângulo,
        não empurrar por cima.
        {vm.temTroca && (
          <button
            class="painbtn"
            onClick={e => { e.stopPropagation(); acoes.abrirSubstituicao(i); }}
          >ver alternativas</button>
        )}
      </div>
    );
  }
  if (vm.dorLast) {
    return <div class="painflag">dor em {vm.dorLast} na última sessão deste exercício</div>;
  }
  return null;
}

export function Exercicio({ vm, acoes }) {
  const i = vm.i;
  return (
    <div class={'ex' + (vm.aberto ? ' open' : '') + (vm.pulado ? ' pulado' : '')}>
      <div class="ex-top" onClick={() => acoes.toggle(i)}>
        <div class="ord">{String(i + 1).padStart(2, '0')}</div>
        <div class="ex-body">
          <div class="ex-name">{vm.nome}</div>
          {vm.alt && <div class="swapped">no lugar de {vm.nomeOriginal}</div>}
          <div class="ex-sub">
            <span>{vm.series} × {vm.faixa}</span>
            <span class={'tag' + (vm.composto ? ' comp' : '')}>
              {vm.rir
                ? (vm.composto ? 'composto · RIR ' : 'isolador · RIR ') + vm.rir
                : (vm.composto ? 'composto · 1–2 na reserva' : 'isolador · última pode ir a 0–1')}
            </span>
            {vm.bi === 1 && <span class="tag bi-t">bi-set · sem pausa até o próximo</span>}
            {vm.bi === 2 && <span class="tag bi-t">bi-set · o descanso é aqui</span>}
            {vm.alt && <span class="tag swap-t">substituído</span>}
            {vm.deload && <span class="tag dl-t">deload</span>}
            {vm.estado === 'feito' && <span class="tag ok-t">feito</span>}
            {vm.estado === 'parcial' && <span class="tag parcial-t">parcial</span>}
            {vm.pulado && <span class="tag pulado-t">pulado</span>}
            {vm.up && !vm.pulado && <span class="up">↑ subir carga</span>}
          </div>
          <Dor i={i} vm={vm} acoes={acoes} />
          {vm.pausaTxt && <div class="pausaflag">{vm.pausaTxt}</div>}
        </div>
        <div class="chev">›</div>
      </div>

      {vm.pulado && (
        <div class="puladobox">
          <span>Pulado nesta sessão.</span>
          <button class="aqbtn" onClick={() => acoes.pularEx(i)}>desfazer</button>
        </div>
      )}

      <div class="sets">
        <p class="cue">{vm.cue}</p>

        {/* Um descanso por exercício, não um por linha: o valor era o mesmo em
            todas as séries, e repeti-lo tirava a coluna que faltava. */}
        {vm.bi === 1
          ? <button class="restlinha bi" onClick={() => acoes.proximoDoBiset(i)}>
              bi-set · ir para o próximo
            </button>
          : <button class="restlinha" onClick={() => acoes.startTimer(vm.descanso)}>
              descanso <b>{vm.descansoTxt}</b>
            </button>}

        <Cabecalho vm={vm} />
        {/* A chave vai no Fragment, não nos filhos: sem ela o Preact reconcilia
            a lista pela posição, e abrir a escala de uma série remonta os
            campos das outras — no meio da digitação, com foco dentro. */}
        {vm.linhas.map((linha, k) => (
          <Fragment key={k}>
            <Linha i={i} k={k} linha={linha} vm={vm} acoes={acoes} />
            {linha.rirAberto && <EscalaRir i={i} k={k} linha={linha} acoes={acoes} />}
          </Fragment>
        ))}

        {vm.cargaOpcional && (
          <div class="segnote">Carga opcional: deixe o campo vazio para só o peso do corpo.</div>
        )}
        {vm.totalHTML != null && (
          <div class="anilhas" id={`tot${i}`} dangerouslySetInnerHTML={{ __html: vm.totalHTML }} />
        )}

        {/* A coluna ANTERIOR já diz série a série o que ele fez. O que sobra
            aqui é só o agregado, que a coluna não tem como mostrar. */}
        {vm.ultima
          ? <div class="lastline">{vm.ultima.rotulo} da última vez: <b>{vm.ultima.valor}</b></div>
          : <div class="lastline">primeira vez neste exercício</div>}

        {vm.mostraAquecimento && (
          <div class={'aquec' + (vm.aq ? ' on' : '')}>
            <span><b>Aproximação:</b> 2 a 3 séries subindo carga antes da primeira valendo.</span>
            <button class="aqbtn" onClick={() => acoes.toggleAq(0)}>{vm.aq ? 'feito' : 'marcar'}</button>
          </div>
        )}

        <div class="exacoes">
          {vm.temTroca && (
            <button class="histbtn" onClick={() => acoes.toggleSwap(i)}>
              {vm.trocaAberta ? 'fechar' : 'trocar'}
            </button>
          )}
          <button class="histbtn" onClick={() => acoes.pularEx(i)}>pular</button>
          <button class="histbtn" onClick={() => acoes.openHist(i)}>histórico</button>
          {/* O rótulo muda com o estado: sem foto ele CONVIDA, com foto ele
              MOSTRA. Um botão só, e nenhuma linha nova no cartão. */}
          <button class="histbtn" onClick={() => acoes.abreFoto(i)}>
            {vm.temFoto ? 'aparelho' : 'foto'}
          </button>
        </div>

        {vm.trocaAberta && <Troca i={i} vm={vm} acoes={acoes} />}

        <div class="exlinks">
          <Carga i={i} vm={vm} acoes={acoes} />
          <Anotacao i={i} vm={vm} acoes={acoes} />
        </div>
      </div>
    </div>
  );
}
