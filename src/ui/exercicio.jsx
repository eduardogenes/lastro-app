import { Fragment } from 'preact';
import { Regua } from './instrumento/regua.jsx';
import { Teclado } from './instrumento/teclado.jsx';

// O nome por extenso de cada medida, para o `aria-label` do campo. Os campos
// não têm rótulo visível — quem rotula é o cabeçalho, que é desenho e não
// semântica —, então é aqui que o VoiceOver descobre a grandeza.
const NOME_DA_MEDIDA = {
  seg: 'segundos', reps: 'repetições', m: 'metros', cal: 'calorias'
};

// A unidade da carga por extenso, para o rótulo do número guardado: "55
// quilos", porque número abreviado não se lê em voz (§8.1 da frente 3).
const UNIDADE_DITA = { 'kg': 'quilos', 'kg/lado': 'quilos por lado', '+kg': 'quilos a mais' };

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
    <div class={'sethead' + (vm.temRir ? '' : ' sem-rir')}>
      <div class="setno">{vm.seg ? 'passada' : 'série'}</div>
      <div class="setant">anterior</div>
      <div class="f">{vm.unidade}</div>
      <div class="f">{vm.medida}</div>
      {/* RIR é linguagem de hipertrofia. Numa aula de box era uma coluna
          inteira de botões que não queriam dizer nada — 25 deles numa aula de
          cinco movimentos em cinco rounds. */}
      {vm.temRir && <div class="f">rir</div>}
    </div>
  );
}

/**
 * Uma linha de série: número, o que foi feito da última vez, e os três campos.
 *
 * ---- Os nomes acessíveis ----
 *
 * Os campos não têm rótulo visível: quem rotula é o cabeçalho da tabela, que é
 * desenho (`div`), não semântica. Para o VoiceOver isto era o cartão mais usado
 * do produto virando seis campos de texto idênticos, sem dizer nem a grandeza
 * nem a série. Cada um leva o `aria-label` inteiro — "carga da série 2, kg" —
 * porque é ele que é lido no lugar do rótulo que não existe.
 *
 * ---- A coluna ANTERIOR é tocável ----
 *
 * Era um `div` inerte, e mostrava exatamente o que ia ser digitado. Virou botão
 * que preenche a série. Continua parecendo texto de propósito: ela é referência
 * primeiro e atalho depois, e um botão desenhado como botão pediria atenção que
 * a linha não tem para dar. Sem histórico ela volta a ser um traço inerte —
 * não há o que copiar.
 */
function Linha({ i, k, linha, vm, acoes }) {
  const unidade = vm.seg ? NOME_DA_MEDIDA[vm.medida] || vm.medida : 'repetições';
  return (
    <div class={'setrow' + (vm.temRir ? '' : ' sem-rir')}>
      <div class="setno">{k + 1}</div>
      {linha.temAnterior ? (
        <button
          class="setant setant-b"
          aria-label={`repetir a série ${k + 1} anterior: ${linha.antes}`}
          onClick={() => acoes.usaAnterior(i, k)}
        >{linha.antes}</button>
      ) : (
        <div class="setant">–</div>
      )}
      {/* A CARGA: botão, e o toque abre o teclado próprio. §6.1 manda próprio
          aqui, e era o último campo da sessão a abrir o teclado do sistema.
          Não há placeholder porque não havia: a referência tem UMA casa, que é
          a coluna ANTERIOR, e ela não some quando ele começa a digitar. */}
      <div class="f">
        <button
          class={'repbtn' + (linha.valor[0] == null ? ' vazio' : '') +
                 (linha.teclado && linha.teclado.decimal ? ' on' : '')}
          id={`w${i}_${k}`}
          aria-label={linha.valor[0] != null
            ? `Série ${k + 1}: ${String(linha.valor[0]).replace('.', ',')} ${UNIDADE_DITA[vm.unidade] || vm.unidade}. Tocar para corrigir.`
            : `registrar carga da série ${k + 1}, ${vm.unidade}`}
          onClick={() => acoes.abreTecladoDeCarga(i, k)}
        >{linha.valor[0] != null ? linha.valor[0] : '·'}</button>
      </div>
      {/* A REPETIÇÃO: botão e não campo, quando a grandeza é repetição.
          É a decisão 8 do dono — registrar repetição é tocar num número — e o
          que o toque abre é a régua, embaixo da linha. O campo continua nos
          exercícios medidos por tempo, metro ou caloria: 500 m não cabe numa
          régua de onze valores.
          A porta "outro valor" devolve o campo nesta mesma célula, e é por isso
          que o `id` é o mesmo nos dois desenhos: quem corrige pelo campo
          continua achando o lugar. */}
      <div class="f">
        {vm.temRegua ? (
          <button
            class={'repbtn' + (linha.valor[1] == null ? ' vazio' : '') +
                   (linha.regua || (linha.teclado && !linha.teclado.decimal) ? ' on' : '')}
            id={`r${i}_${k}`}
            aria-label={linha.valor[1] != null
              ? `Série ${k + 1}: ${linha.valor[1]} ${unidade}. Tocar para corrigir.`
              : `registrar ${unidade} da série ${k + 1}`}
            onClick={() => acoes.abreRegua(i, k)}
          >{linha.valor[1] != null ? linha.valor[1] : '·'}</button>
        ) : (
          <input
            type="text" inputmode="numeric" id={`r${i}_${k}`}
            aria-label={`${unidade} da série ${k + 1}`}
            value={linha.valor[1] != null ? linha.valor[1] : ''}
            onInput={e => acoes.inp(e.currentTarget, i, k, 1)}
          />
        )}
      </div>
      {/* Botão e não campo: um dígito não vale abrir o teclado numérico, que
          cobre metade da tela no meio da série. */}
      {vm.temRir && (
        <button
          class={'rirbtn' + (linha.rirAberto ? ' on' : '') +
                 (linha.valor[2] == null ? ' vazio' : '')}
          id={`q${i}_${k}`}
          aria-label={linha.valor[2] != null
            ? `Série ${k + 1}: ${linha.valor[2]} na reserva. Tocar para corrigir.`
            : `definir repetições na reserva da série ${k + 1}`}
          onClick={() => acoes.abreRir(i, k)}
        >{linha.valor[2] != null ? linha.valor[2] : '·'}</button>
      )}
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

/**
 * O painel da MÁQUINA OCUPADA, quando aberto — §7.3 da frente 3.
 *
 * As saídas vão por PREÇO (§7.4 da frente 2): fazer antes o próximo não troca
 * nada; um substituto troca o exercício de hoje; pular é o último recurso. E vale
 * só para hoje, o que o painel diz antes de tudo. A dispensa é "Fechar e fazer
 * mesmo assim": ele não cancelou nada, ele decidiu fazer.
 */
function Troca({ i, vm, acoes }) {
  const opt = a => (
    <button
      key={a.id} class={'swapopt' + (vm.alt === a.id ? ' on' : '')}
      onClick={() => acoes.setAlt(i, a.id)}
    >
      {/* Sem foto não entra nada: nem moldura, nem espaço reservado. Uma fila
          de quadros vazios diria menos que a fila de nomes que já existe. */}
      {a.foto && <img class="swapfoto" src={a.foto} alt="" />}
      <span class="swaptxt">
        <b>{a.indicado ? '★ ' : ''}{a.n}{a.indicado && <em class="swap-ind"> · indicado pelo treinador</em>}</b>
        <span>{[a.ultima, a.nota].filter(Boolean).join(' · ')}</span>
      </span>
    </button>
  );
  return (
    <div class="swap">
      <div class="swap-h">Máquina ocupada</div>
      <div class="swap-sub">{vm.nome}</div>
      <p class="swap-regra">Vale só para hoje. O programa não muda.</p>
      {vm.proximo && (
        <button class="swapopt" data-a="faz-antes" onClick={() => acoes.fazAntesOProximo(i)}>
          <span class="swaptxt"><b>Fazer antes o próximo</b><span>{vm.proximo} agora; esta volta logo depois</span></span>
        </button>
      )}
      {vm.troca.indicados.map(opt)}
      {vm.troca.outros.length > 0 && (
        <>
          <div class="swap-h" style="margin-top:12px">Outros de {vm.grupo}:</div>
          {vm.troca.outros.map(opt)}
        </>
      )}
      {vm.alt && (
        <button class="swapopt back-orig" onClick={() => acoes.setAlt(i, null)}>
          <b>Voltar para {vm.nomeOriginal}</b><span>Desfaz a substituição de hoje.</span>
        </button>
      )}
      <button class="swapopt" data-a="pula-hoje" onClick={() => acoes.pularEx(i)}>
        <span class="swaptxt"><b>Pular hoje</b><span>fica escrito como pulado; dá para desfazer na linha</span></span>
      </button>
      <button class="swapopt cancel" onClick={() => acoes.toggleSwap(i)}><b>Fechar e fazer mesmo assim</b></button>
    </div>
  );
}

/** O bloco de anotação e dor da sessão. */
function Anotacao({ i, vm, acoes }) {
  if (!vm.notaAberta) {
    return (
      <button class="notabtn" onClick={() => acoes.abrirNota(i)}>Anotar algo</button>
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

/**
 * A medida do dia: a grandeza e quanto dela o box passou.
 *
 * Mora atrás de um link e não em cima da tabela, pelo mesmo motivo que a
 * carga: é decisão de uma vez por movimento, e quem precisa do espaço é a
 * linha de série. O resumo fechado já responde sozinho ("500 m"), que é a
 * condição do contrato para poder recolher alguma coisa.
 */
function Medida({ i, vm, acoes }) {
  if (!vm.medidaAberta) {
    return (
      <button class="notabtn" onClick={() => acoes.abrirMedida(i)}>
        Medida: {vm.medidaResumo}
      </button>
    );
  }
  return (
    <div class="obs">
      <div class="obs-h">o que o box passou neste movimento</div>
      <div class="chips">
        {vm.unidades.map(u => (
          <button
            key={u.k} class={'chip' + (u.sel ? ' sel' : '')}
            onClick={() => acoes.setUnidade(i, u.k)}
          >{u.t}</button>
        ))}
      </div>
      <label class="medq">
        <span class="obs-h">quanto, em cada passada</span>
        <input
          type="text" inputmode="decimal" id={`q${i}`}
          aria-label="quantidade prescrita em cada passada"
          value={vm.q}
          onInput={e => acoes.setQ(e.currentTarget, i)}
        />
      </label>
      <p class="cue" style="margin:12px 0 0">
        Em metro e caloria a série guarda o tempo, e o que se compara ao longo
        dos meses é o ritmo. Em repetição e segundo a série guarda quanto saiu.
      </p>
    </div>
  );
}

/** Como esse peso é carregado. */
function Carga({ i, vm, acoes }) {
  if (!vm.cargaAberta) {
    return (
      <button class="notabtn" onClick={() => acoes.abrirCarga(i)}>
        Carga: {vm.tipoNome}
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

/**
 * O aviso de dor, que é o freio mais importante da tela — §7.4 da frente 3.
 *
 * A dor repetida é o ÚNICO estado ruim que não se dispensa sem responder: a
 * régua só volta depois da escolha, e "fazer mesmo assim" também é escolha, e
 * fica registrada. A regra vem nas palavras do TREINADOR, literais e atribuídas
 * — a paráfrase que havia aqui trocava "nunca empurre" por "não empurrar".
 */
function Dor({ i, vm, acoes }) {
  if (vm.dorRep) {
    return (
      <div class="painbox">
        <b>Dor em {vm.dorRep} nas duas últimas sessões deste exercício: {vm.dorDatas}.</b>
        <p class="pain-regra">
          Treinador: “Apareceu: tire aquele exercício por 2 semanas e substitua por
          outro ângulo. Nunca empurre porque ‘está fraquinha’.”
        </p>
        {vm.dorBloqueia ? (
          <>
            <p class="pain-escolha">
              Escolha uma das três para a régua voltar. “Fazer mesmo assim” também é
              escolha, e fica registrada.
            </p>
            {vm.temTroca && (
              <button class="painbtn" data-a="dor-subs"
                      onClick={e => { e.stopPropagation(); acoes.abrirSubstituicao(i); }}>
                Ver os {vm.nSubs} substitutos
              </button>
            )}
            <button class="painbtn" data-a="dor-pula"
                    onClick={e => { e.stopPropagation(); acoes.pularEx(i); }}>Pular hoje</button>
            <button class="painbtn" data-a="dor-mesmo"
                    onClick={e => { e.stopPropagation(); acoes.aceitaDor(i); }}>Fazer mesmo assim</button>
            <p class="pain-nota">Qualquer escolha fica registrada no dia.</p>
          </>
        ) : vm.dorAceita ? (
          <p class="pain-nota">Feito mesmo assim — registrado no dia.</p>
        ) : null}
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
    /* `data-ex` é o endereço do cartão: abrir um exercício rola até ele, e
       quem rola é o casco, que não tem referência a este nó de outro jeito. */
    <div class={'ex' + (vm.aberto ? ' open' : '') + (vm.pulado ? ' pulado' : '')} data-ex={i}>
      <div class="ex-top" onClick={() => acoes.toggle(i)}>
        {/* A miniatura ocupa a calha que era só do número. Sem foto ela não
            some: vira o próprio caminho de tirar uma, e por isso para o toque
            antes de chegar no cartão — abrir o exercício e abrir a câmera são
            intenções diferentes. */}
        <button
          class={'exfoto' + (vm.foto ? '' : ' vazia')}
          onClick={e => { e.stopPropagation(); acoes.abreFoto(i); }}
          aria-label={vm.foto ? 'Ver o aparelho' : 'Adicionar foto do aparelho'}
        >
          {vm.foto
            ? <img src={vm.foto} alt="" />
            : <span class="exfoto-p" />}
          <span class="ord">{String(i + 1).padStart(2, '0')}</span>
        </button>
        <div class="ex-body">
          <div class="ex-name">{vm.nome}</div>
          {vm.alt && <div class="swapped">no lugar de {vm.nomeOriginal}</div>}
          <div class="ex-sub">
            {/* Num movimento com grandeza, o que o box passou É a prescrição:
                "5 × 500 m". Sem ela o cartão dizia só "5", que não é nada — nem
                se sabia de que 5 se tratava. */}
            {/* id: atualizaPrescricao() escreve aqui enquanto ele digita a
                quantidade, sem re-render — o porquê está em main.jsx. */}
            <span id={`presc${i}`}>{vm.series}{vm.prescricao ? ' × ' + vm.prescricao
                              : vm.faixa ? ' × ' + vm.faixa : ''}</span>
            {/* RIR não se aplica a exercício medido por tempo: "isolador ·
                última pode ir a 0–1" num remo de 1000 m é linguagem de
                hipertrofia aplicada a condicionamento, e era um dos sinais de
                que o sábado estava modelado como o que não é. */}
            {!vm.seg && (
              <span class={'tag' + (vm.composto ? ' comp' : '')}>
                {vm.rir
                  ? (vm.composto ? 'composto · RIR ' : 'isolador · RIR ') + vm.rir
                  : (vm.composto ? 'composto · 1–2 na reserva' : 'isolador · última pode ir a 0–1')}
              </span>
            )}
            {vm.bi === 1 && <span class="tag bi-t">bi-set · sem pausa até o próximo</span>}
            {vm.bi === 2 && <span class="tag bi-t">bi-set · o descanso é aqui</span>}
            {vm.alt && <span class="tag swap-t">substituído</span>}
            {/* O número de séries ali NÃO é o prescrito, e a marca diz isso
                (§7.6): "deload" sozinho dizia o modo, não o que ele fez com a
                linha. */}
            {vm.deload && (
              <span class="tag dl-t">
                {vm.series} {vm.series === 1 ? 'série' : 'séries'} hoje · metade do prescrito, por deload
              </span>
            )}
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
          {/* Pulado não é esquecido: fica escrito e não volta a ser pedido — e o
              caminho de volta existe, aqui onde o dedo está (§7.5 da frente 3).
              As duas metades juntas, porque lidas separadas parecem se
              contradizer. */}
          <span>Pulado hoje. Fica escrito como pulado e não volta a ser pedido; desfazer põe de volta na fila.</span>
          <button class="aqbtn" onClick={() => acoes.pularEx(i)}>Desfazer</button>
        </div>
      )}

      <div class="sets">
        <p class="cue">{vm.cue}</p>

        {/* A pegada fica ACIMA do descanso e abaixo da dica: ela é sobre fazer a
            série, o descanso é sobre o que vem depois, e a ordem de leitura
            segue a ordem dos fatos.

            Não é botão e não parece a `cue`: a dica é prosa, na voz do
            treinador; isto é rótulo mono + valor, na voz do app. A distinção
            visual é a única coisa que impede as duas de se confundirem, e a
            procedência está dita por extenso no GUIA, uma vez, em vez de por
            exercício. */}
        {vm.pegada && (
          <div class="peglinha">{vm.pegadaRotulo} <b>{vm.pegada}</b></div>
        )}

        {/* Um descanso por exercício, não um por linha: o valor era o mesmo em
            todas as séries, e repeti-lo tirava a coluna que faltava. */}
        {vm.bi === 1
          ? <button class="restlinha bi" onClick={() => acoes.proximoDoBiset(i)}>
              bi-set · ir para o próximo
            </button>
          : <button class="restlinha" onClick={() => acoes.startTimer(vm.descanso, 'descanso · ' + vm.nome)}>
              descanso <b>{vm.descansoTxt}</b>
            </button>}

        {/* A RÉGUA ESPERA a escolha diante da dor repetida (§7.4): é o único
            estado ruim que não se dispensa sem responder. */}
        {!vm.dorBloqueia && <>
        <Cabecalho vm={vm} />
        {/* A chave vai no Fragment, não nos filhos: sem ela o Preact reconcilia
            a lista pela posição, e abrir a escala de uma série remonta os
            campos das outras — no meio da digitação, com foco dentro. */}
        {vm.linhas.map((linha, k) => (
          <Fragment key={k}>
            <Linha i={i} k={k} linha={linha} vm={vm} acoes={acoes} />
            {linha.regua && (
              <Regua
                slots={linha.regua.slots}
                valor={linha.valor[1]}
                marca={linha.regua.marca}
                corrige={linha.regua.corrige}
                rotulo={`repetições da série ${k + 1}`}
                aoEscolher={v => acoes.poeRep(i, k, v)}
                aoAndar={dir => acoes.andaRegua(dir)}
                aoOutro={() => acoes.abreOutroValor()}
              />
            )}
            {linha.teclado && (
              <Teclado
                texto={linha.teclado.texto}
                decimal={linha.teclado.decimal}
                unidade={linha.teclado.unidade}
                rotulo={`digitar ${linha.teclado.unidade} da série ${k + 1}`}
                aoTeclar={t => acoes.tecla(t)}
                aoFechar={() => acoes.fechaTeclado()}
              />
            )}
            {linha.rirAberto && <EscalaRir i={i} k={k} linha={linha} acoes={acoes} />}
          </Fragment>
        ))}
        </>}

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
            <button class="aqbtn" onClick={() => acoes.toggleAq(0)}>{vm.aq ? 'Feito' : 'Marcar'}</button>
          </div>
        )}

        <div class="exacoes">
          {vm.temTroca && (
            <button class="histbtn" onClick={() => acoes.toggleSwap(i)}>
              {vm.trocaAberta ? 'Fechar' : 'Trocar'}
            </button>
          )}
          <button class="histbtn" onClick={() => acoes.pularEx(i)}>Pular</button>
          <button class="histbtn" onClick={() => acoes.openHist(i)}>Histórico</button>
          {/* O rótulo muda com o estado: sem foto ele CONVIDA, com foto ele
              MOSTRA. Um botão só, e nenhuma linha nova no cartão. */}
          <button class="histbtn" onClick={() => acoes.abreFoto(i)}>
            {vm.temFoto ? 'Aparelho' : 'Foto'}
          </button>
        </div>

        {vm.trocaAberta && <Troca i={i} vm={vm} acoes={acoes} />}

        <div class="exlinks">
          {vm.seg && <Medida i={i} vm={vm} acoes={acoes} />}
          <Carga i={i} vm={vm} acoes={acoes} />
          <Anotacao i={i} vm={vm} acoes={acoes} />
        </div>
      </div>
    </div>
  );
}
