// A sessão de fotos de acompanhamento.
//
// Tela cheia e não folha: são nove poses em sequência, e a tab bar convidaria a
// sair no meio — o mesmo motivo do histórico e da retrospectiva.
//
// O que esta tela faz de diferente de um botão de câmera é mostrar a FOTO
// ANTERIOR daquela pose antes do disparo. Duas fotos só se comparam quando o
// enquadramento é o mesmo, e a geometria da câmera o app não alcança — ela mora
// nas marcas de fita no chão. Enquadrar contra a anterior evita o desvio; tentar
// alinhar depois só o conserta, e mal.
//
// Não há botão de salvar, como não há na sessão de treino: a sessão nasce na
// primeira foto e continua de onde parou se ele sair no meio.

import { FotoAjustada } from '../instrumento/fotoajustada.jsx';
import { Procedencia, Secao } from '../instrumento/primitivos.jsx';
import { TelaCheia } from '../instrumento/telacheia.jsx';

/** A régua de nove pontos. Diz onde ele está e o que falta, sem ocupar linha. */
function Pontos({ pontos, aoIr }) {
  return (
    <div class="pr-pontos" role="list">
      {pontos.map(p => (
        <button
          key={p.id} role="listitem"
          class={'pr-ponto' + (p.naoGuardada ? ' nao' : p.feita ? ' feita' : p.adiada ? ' adiada' : '') + (p.atual ? ' atual' : '')}
          aria-label={p.n + (p.naoGuardada ? ' · não guardada' : p.feita ? ' · feita' : p.adiada ? ' · volta no fim' : ' · falta')}
          aria-current={p.atual ? 'step' : undefined}
          onClick={() => aoIr(p.id)}
        />
      ))}
    </div>
  );
}

/**
 * O que fica congelado entre uma sessão e outra.
 *
 * Aparece uma vez, antes da primeira foto, e some depois — perguntar a cada
 * sessão o que é fixo por definição seria o oposto de não perguntar o que já se
 * sabe. Quem segura o celular lê isto em voz alta.
 */
function Montagem({ m, aoComecar }) {
  return (
    <>
      <Secao primeira rotulo="antes da primeira foto" nota="o que fica congelado">
        <div class="pr-setup">
          {m.itens.map(i => (
            <div class="pr-setup-l" key={i.k}>
              <span class="ins-label">{i.rotulo}</span>
              <span class="ins-data pr-setup-v">{i.valor}</span>
              <p class="ins-body-sm ins-t3 pr-setup-p">{i.nota}</p>
            </div>
          ))}
        </div>
        <Procedencia>
          distância, altura da lente e direção da luz mudam a silhueta mais do
          que duas semanas de treino. Marque o chão com fita na primeira vez e
          repita as marcas depois.
        </Procedencia>
      </Secao>
      {/* A ordem das nove (a D, estado 1): uma rotação contínua, sempre para o
          mesmo lado, sem sair da marca. */}
      <Secao rotulo="A ordem das nove poses">
        <p class="ins-body-sm ins-t2 pr-ordem">{m.ordem}.</p>
        <p class="ins-body-sm ins-t1 pr-ordem"><b>Gire sempre para o mesmo lado</b>, sem sair da marca.</p>
      </Secao>
      <button class="ins-btn-primary pr-comecar" onClick={aoComecar}>Começar a sessão</button>
      <p class="ins-body-xs ins-t3 pr-som">Este toque também liga o som: no iPhone, ele só existe depois de um toque.</p>
    </>
  );
}

export function Protocolo({ ctx }) {
  const d = ctx.sessaoDeFotos();
  if (!d) return null;

  if (d.passo === 'montagem') {
    return (
      <TelaCheia olho="protocolo" meta={d.meta} titulo="A montagem"
                 aoVoltar={ctx.fechaProtocolo} corpo="hwrap">
        <Montagem m={d.montagem} aoComecar={ctx.comecaSessaoDeFotos} />
      </TelaCheia>
    );
  }

  const p = d.pose;

  return (
    // A exceção de R3 (frente 3 §2): lido a três metros, o "pose 3 de 9" não é
    // olho de 12 px — vira título, com o nome da pose junto.
    <TelaCheia olho={p.bloco} titulo={'Pose ' + d.indice + ' de ' + d.total + ' · ' + p.n}
               aoVoltar={ctx.fechaProtocolo} corpo="hwrap">
      <Pontos pontos={d.pontos} aoIr={ctx.vaiParaPose} />
      {/* O FIM (a D, estado 10): o que a sessão deixa guardado, e o que se pode
          fazer agora. A comparação é oferta, não pergunta. */}
      {d.fim && (
        <section class="pr-fim" aria-label="sessão guardada">
          <b class="ins-body ins-t1">Sessão guardada · {d.fim.poses}</b>
          {d.fim.tempo && <p class="ins-body-sm ins-t2">{d.fim.tempo}</p>}
          <p class="ins-body-sm ins-t2" data-a="fim-subida">{d.fim.subida}</p>
          {d.fim.peso && <p class="ins-body-sm ins-t2">Peso desta sessão: {d.fim.peso}</p>}
          {(d.fim.comparar || d.fim.pergunta) && (
            <div class="pr-fim-b">
              {d.fim.comparar && <button class="ins-btn-secondary" data-a="fim-comparar" onClick={ctx.abreComparar}>{d.fim.comparar}</button>}
              {d.fim.pergunta && <button class="ins-btn-secondary" data-a="fim-pergunta" onClick={ctx.abreComparar}>{d.fim.pergunta}</button>}
            </div>
          )}
          <p class="ins-body-sm ins-t3">{d.fim.proxima}</p>
        </section>
      )}
      {/* A POSE QUE NÃO COUBE (a D, `sessao-fotos.html`, estado 9): a sessão
          parou, e a tela diz qual e por quê, com a saída ao lado. */}
      {d.naoGuardada && (
        <div class="pr-naoguardada" role="alert">
          <b class="ins-rotulo">{d.naoGuardada.titulo}</b>
          <p class="ins-body-sm ins-t2">{d.naoGuardada.texto}</p>
          <div class="ag-l-btns">
            <button class="ins-btn-primary" data-a="pose-tenta" onClick={ctx.tentaFotoDaPose}>Tentar de novo</button>
            {d.naoGuardada.copia && (
              <button class="ins-btn-secondary" data-a="pose-copia" onClick={ctx.exportar}>Baixar cópia</button>
            )}
          </div>
        </div>
      )}

      {/* A referência primeiro, e maior: é contra ela que o enquadramento é
          feito. A foto de hoje entra ao lado quando existe. */}
      <div class={'pr-fotos' + (p.url ? ' dupla' : '')}>
        {/* Ter a referência e ter os BYTES dela são duas coisas: a sessão pode
            estar podada do cache, ou ter descido do outro aparelho com os bytes
            ainda a caminho. `FotoAjustada` desenha o aviso em vez da <img>
            nesse intervalo — o mesmo motivo pelo qual a foto do aparelho não
            desenha nada enquanto o cache não respondeu. */}
        <figure class="pr-fig">
          <FotoAjustada
            url={p.ref && p.ref.url} enq={p.ref && p.ref.enq}
            alt={p.ref ? 'Referência: ' + p.n + ' em ' + p.ref.txt : ''}
            vazio={p.ref ? p.ref.aviso : 'primeira vez nesta pose'}
            aoTentar={p.ref && p.ref.retomar ? () => ctx.tentaFotos(p.ref.d) : null}
          />
          <figcaption class="ins-label">{p.ref ? 'referência · ' + p.ref.txt : 'sem referência'}</figcaption>
        </figure>
        {p.url && (
          <figure class="pr-fig">
            <FotoAjustada url={p.url} enq={p.enq} alt={'Hoje: ' + p.n} />
            <figcaption class="ins-label ins-acid">hoje</figcaption>
          </figure>
        )}
      </div>

      <div class="pr-como">
        <div class="ins-label">execução · corpo a {p.giro}° · braços {p.bracos}</div>
        <ol class="pr-lista">
          {p.como.map((l, i) => <li key={i} class="ins-body-sm ins-t2">{l}</li>)}
        </ol>
      </div>

      <Procedencia>revela {p.revela}</Procedencia>
      <Procedencia>erro comum · {p.erro}</Procedencia>

      {/* Dois caminhos de captura, e a ordem diz qual é o padrão.
          A câmera de dentro do app mostra a foto anterior por cima do quadro
          vivo: alinhar ANTES do disparo é o que nenhum recorte depois conserta.
          A do sistema fica embaixo porque continua valendo — ela dá a melhor
          qualidade que o aparelho sabe produzir, e é quem atende quando a
          interna não está disponível. `capture` a abre direto no celular e é
          ignorado no computador, onde vira seletor de arquivo. */}
      {d.temCamera && (
        <button class="ins-btn-primary pr-disparo" onClick={ctx.abreCamera}>
          {p.url ? 'refazer com sobreposição' : 'tirar com sobreposição'}
        </button>
      )}
      <label class={(d.temCamera ? 'ins-btn-secondary' : 'ins-btn-primary') + ' pr-disparo'}>
        {d.temCamera
          ? 'usar a câmera do sistema'
          : (p.url ? 'refazer esta foto' : 'tirar a foto')}
        <input type="file" accept="image/*" capture="environment"
               onChange={e => ctx.tiraFotoDoCorpo(e.currentTarget)} />
      </label>

      <div class="pr-nav">
        <button class="ins-btn-secondary" disabled={!d.anterior}
                onClick={ctx.posAnterior}>‹ anterior</button>
        <button class="ins-btn-secondary" disabled={!d.proxima}
                onClick={ctx.posProxima}>Próxima ›</button>
      </div>

      {/* A nota é da SESSÃO, não da pose: é o que explica, três meses depois, o
          mês que parece fora da curva. Um campo, nunca um formulário. */}
      <Secao rotulo="A nota da sessão" nota="opcional">
        <input
          class="ins-input pr-obs" type="text" value={d.obs}
          placeholder="voltando de gripe, outra academia, roupa diferente…"
          onInput={e => ctx.setNotaDaSessao(e.currentTarget.value)}
        />
      </Secao>

      {p.url && (
        <div class="pr-sobre">
          {/* Ajustar vem antes de apagar, e não é ordem alfabética: quase todo
              motivo para apagar uma foto — saiu torta, saiu mais longe — é um
              motivo para ajustá-la primeiro. */}
          <button class="ins-btn-secondary"
                  onClick={() => ctx.abreAjuste(d.d, p.id)}>Ajustar</button>
          <button class="ins-btn-secondary ins-btn-destructive"
                  onClick={() => ctx.apagaFotoDoCorpo(p.id)}>Apagar</button>
        </div>
      )}

      {d.faltando > 0 && <Procedencia>faltam {d.faltando} de {d.total} · a sessão fica salva como está</Procedencia>}
    </TelaCheia>
  );
}
