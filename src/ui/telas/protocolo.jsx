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

import { Procedencia, Secao, Vazio } from '../instrumento/primitivos.jsx';
import { TelaCheia } from '../instrumento/telacheia.jsx';

/** A régua de nove pontos. Diz onde ele está e o que falta, sem ocupar linha. */
function Pontos({ pontos, aoIr }) {
  return (
    <div class="pr-pontos" role="list">
      {pontos.map(p => (
        <button
          key={p.id} role="listitem"
          class={'pr-ponto' + (p.feita ? ' feita' : '') + (p.atual ? ' atual' : '')}
          aria-label={p.n + (p.feita ? ' · feita' : ' · falta')}
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
      <button class="ins-btn-primary pr-comecar" onClick={aoComecar}>começar a sessão</button>
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
    <TelaCheia olho={'pose ' + d.indice + ' de ' + d.total} meta={p.bloco} titulo={p.n}
               aoVoltar={ctx.fechaProtocolo} corpo="hwrap">
      <Pontos pontos={d.pontos} aoIr={ctx.vaiParaPose} />

      {/* A referência primeiro, e maior: é contra ela que o enquadramento é
          feito. A foto de hoje entra ao lado quando existe. */}
      <div class={'pr-fotos' + (p.url ? ' dupla' : '')}>
        {/* Ter a referência e ter os BYTES dela são duas coisas: a sessão pode
            estar podada do cache, ou ter descido do outro aparelho com os bytes
            ainda a caminho. Desenhar a <img> nesse intervalo dá um quadro
            quebrado — o mesmo motivo pelo qual a foto do aparelho não desenha
            nada enquanto o cache não respondeu. */}
        <figure class="pr-fig">
          {p.ref && p.ref.url
            ? <img class="pr-img" src={p.ref.url} alt={'Referência: ' + p.n + ' em ' + p.ref.txt} />
            : (
              <div class="pr-img pr-sem">
                <span class="ins-body-sm ins-t5">
                  {p.ref ? 'buscando a foto…' : 'primeira vez nesta pose'}
                </span>
              </div>
            )}
          <figcaption class="ins-label">{p.ref ? 'referência · ' + p.ref.txt : 'sem referência'}</figcaption>
        </figure>
        {p.url && (
          <figure class="pr-fig">
            <img class="pr-img" src={p.url} alt={'Hoje: ' + p.n} />
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

      {/* `capture` abre a câmera direto no celular e é ignorado no computador,
          onde vira seletor de arquivo — os dois caminhos servem. */}
      <label class="ins-btn-primary pr-disparo">
        {p.url ? 'refazer esta foto' : 'tirar a foto'}
        <input type="file" accept="image/*" capture="environment"
               onChange={e => ctx.tiraFotoDoCorpo(e.currentTarget)} />
      </label>

      <div class="pr-nav">
        <button class="ins-btn-secondary" disabled={!d.anterior}
                onClick={ctx.posAnterior}>‹ anterior</button>
        <button class="ins-btn-secondary" disabled={!d.proxima}
                onClick={ctx.posProxima}>próxima ›</button>
      </div>

      {/* A nota é da SESSÃO, não da pose: é o que explica, três meses depois, o
          mês que parece fora da curva. Um campo, nunca um formulário. */}
      <Secao rotulo="nota da sessão" nota="opcional">
        <input
          class="ins-input pr-obs" type="text" value={d.obs}
          placeholder="voltando de gripe, outra academia, roupa diferente…"
          onInput={e => ctx.setNotaDaSessao(e.currentTarget.value)}
        />
      </Secao>

      {p.url && (
        <button class="ins-btn-secondary ins-btn-destructive pr-apagar"
                onClick={() => ctx.apagaFotoDoCorpo(p.id)}>apagar esta foto</button>
      )}

      {d.faltando > 0
        ? <Procedencia>faltam {d.faltando} de {d.total} · a sessão fica salva como está</Procedencia>
        : <Vazio>Sessão completa. As nove poses estão registradas.</Vazio>}
    </TelaCheia>
  );
}
