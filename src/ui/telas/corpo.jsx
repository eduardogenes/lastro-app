// CORPO — como está o corpo (docs/corpo/02-ux-corpo-livre.md, 06/11/2026).
//
// A página mostra o ESTADO; registrar abre a superfície de cada coisa:
// - o peso numa folha, com o número grande sendo a média da semana (domingo a
//   sábado, toda pesagem conta) e o peso de hoje pequeno;
// - fita e dobras num formulário só ("Registrar medidas");
// - a bioimpedância numa folha;
// - as fotos como sempre.
// Tocar numa medida abre o detalhe dela (gráfico, histórico, como medir, onde
// apagar). O detalhe do peso continua se chamando Evolução.
//
// Antes disto a página repetia um formulário inteiro por medida e passava de
// sete telas com tudo ligado (docs/corpo/01-ux-corpo.md, §2).

import { Cabecalho, GradeMetricas, Procedencia, Secao, Sparkline, Vazio } from '../instrumento/primitivos.jsx';

/**
 * As fotos de acompanhamento.
 *
 * Fica entre cintura e força de propósito: é a terceira série do mesmo assunto
 * — está funcionando? —, e a única que não vira número. Separá-la numa aba
 * própria a transformaria em álbum.
 *
 * Os dias desde a última sessão são INFORMAÇÃO, não cobrança. Passar de 14 põe
 * o número em âmbar e para por aí: não há sequência, não há medalha e não há
 * tela de parabéns em lugar nenhum deste produto.
 */
function Fotos({ f, ctx }) {
  return (
    <Secao rotulo="As fotos" nota={f.nota}>
      <div class="dd-fotos">
        <GradeMetricas
          colunas={2}
          celulas={[
            { k: 'd', rotulo: 'dias desde a última', valor: f.dias, cor: f.diasCor },
            { k: 'c', rotulo: 'cadência', valor: f.cadencia }
          ]}
        />

        {f.tem && (
          <div class="dd-fotos-pontos" aria-label="poses da última sessão">
            {f.pontos.map(p => (
              <span key={p.id} class={'dd-fotos-p' + (p.feita ? ' feita' : '')} title={p.n} />
            ))}
          </div>
        )}

        {/* O que só existe aqui (a D, comparar, estado 10): um despejo de
            cache do navegador leva embora, e a cópia em JSON não leva fotos. */}
        {f.soAqui && (
          <div class="dd-fotos-aqui" role="status">
            <p class="ins-body-sm ins-t1"><b>{f.soAqui.t}</b></p>
            <p class="ins-body-sm ins-t2">{f.soAqui.p}</p>
            {f.soAqui.conta
              ? <button class="ins-btn-secondary" data-a="fotos-subir" onClick={ctx.sincronizaAgora}>Subir agora</button>
              : <button class="ins-btn-secondary" data-a="fotos-conta" onClick={ctx.abreAjustes}>Entrar na conta</button>}
          </div>
        )}

        <div class="dd-fotos-b">
          <button class="ins-btn-primary" onClick={ctx.abreProtocolo}>{f.cta}</button>
          {f.podeComparar && (
            <button class="ins-btn-secondary" onClick={ctx.abreComparar}>Comparar</button>
          )}
        </div>
      </div>

      <Procedencia>
        a hora de cada foto fica anotada · as marcas de fita no chão são
        o que faz duas sessões serem comparáveis
      </Procedencia>
      <Procedencia>
        as fotos ficam neste aparelho e no seu bucket privado · não entram no
        backup em JSON
      </Procedencia>
    </Secao>
  );
}

/** A minicurva de uma medida: as últimas leituras, ligadas, com a última em destaque. */
function Mini({ valores }) {
  if (!valores || valores.length < 2) return null;
  const lo = Math.min.apply(null, valores), hi = Math.max.apply(null, valores);
  const r = hi - lo || 1;
  const x = i => 2 + i * (44 / (valores.length - 1));
  const y = v => 20 - (v - lo) / r * 16;
  const ult = valores.length - 1;
  return (
    <svg viewBox="0 0 48 24" aria-hidden="true">
      <polyline class="co-mini" points={valores.map((v, i) => x(i) + ',' + y(v)).join(' ')} />
      <circle class="co-mini-p" cx={x(ult)} cy={y(valores[ult])} r="2.5" />
    </svg>
  );
}

export function Corpo({ ctx }) {
  const p = ctx.painelDoCorpo();
  const vazio = ctx.corpoVazio();

  return (
    <>
      <Cabecalho olho="como está" titulo="Corpo" />

      {vazio && (
        <section class="ins-secao primeira co-vazio">
          <h2 class="ins-rotulo">{vazio.titulo}</h2>
          <p class="ins-body-sm ins-t2">{vazio.texto}</p>
          <ul class="ins-lista co-vazio-l">
            {vazio.linhas.map(l => (
              <li key={l.k} class="ins-linha">
                <span class="ins-linha-n">
                  <span class="ins-linha-t">{l.t}</span>
                  <span class="ins-linha-s">{l.d}</span>
                </span>
              </li>
            ))}
          </ul>
          {vazio.conta &&<p class="ins-body-xs ins-t3">{vazio.conta}</p>}
        </section>
      )}

      {/* O PESO: a média da semana grande, o peso de hoje pequeno. */}
      <Secao rotulo="Peso" nota="média da semana" primeira={!vazio}>
        <button class="co-linha co-peso" data-a="abre-evolucao" onClick={ctx.abreEvolucao}
                aria-label={'Peso: média da semana ' + p.peso.media + ' kg. Abrir a Evolução.'}>
          <span class="co-peso-n"><b class="co-peso-g">{p.peso.media}</b>{p.peso.media !== '—' && <span class="co-peso-u"> kg</span>}</span>
          <span class="co-chev" aria-hidden="true">›</span>
        </button>
        <p class="ins-body-sm ins-t2 co-peso-l">{p.peso.parcial}{p.peso.hoje ? ' · ' + p.peso.hoje : ''}</p>
        {p.peso.diferenca && <p class="ins-body-sm ins-t2 co-peso-l" data-a="peso-diferenca">{p.peso.diferenca}</p>}
        {p.peso.anterior && <p class="ins-body-sm ins-t3 co-peso-l">{p.peso.anterior}</p>}
        {p.peso.serie.some(x => x != null) && <div class="dd-spark"><Sparkline valores={p.peso.serie} /></div>}
        <button class="ins-btn-primary co-registra" data-a="registra-peso" onClick={ctx.abreRegistroDePeso}>Registrar peso</button>
      </Secao>

      {/* AS MEDIDAS: fita e dobras, uma linha por medida, na ordem do corpo. */}
      <Secao rotulo="Medidas" nota={p.ultimaMedida}>
        {p.medidas.length === 0 && <Vazio>Nenhuma medida ainda. Fita e dobras se registram juntas, na mesma noite das fotos.</Vazio>}
        <div class="co-lista">
          {p.medidas.map(m => (
            <button key={m.k} class="co-linha co-med" data-a={'medida-' + m.k} onClick={() => ctx.abreMedida(m.k)}>
              <span class="co-med-n">{m.n}</span>
              <span class="co-med-v"><b>{m.valor}</b><span class="ins-body-xs ins-t3">{m.variacao ? m.variacao + ' ' : ''}{m.desde}</span></span>
              <span class="co-med-s"><Mini valores={m.serie} /></span>
              <span class="co-chev" aria-hidden="true">›</span>
            </button>
          ))}
        </div>
        <button class="ins-btn-primary co-registra" data-a="registra-medidas" onClick={() => ctx.abreMedidas()}>Registrar medidas</button>
      </Secao>

      {/* A BIOIMPEDÂNCIA: os quatro números da última leitura. */}
      <Secao rotulo="Bioimpedância" nota={p.bio ? p.bio.quando : 'uma vez por mês'}>
        {p.bio
          ? <button class="co-linha co-bio-r" data-a="abre-bio" onClick={() => ctx.abreMedida('bio')}>
              <GradeMetricas colunas={2} celulas={p.bio.celulas} />
              <span class="co-chev" aria-hidden="true">›</span>
            </button>
          : <Vazio>Nenhuma leitura ainda.</Vazio>}
        <button class="ins-btn-secondary co-registra" data-a="nova-bio" onClick={ctx.abreBio}>Nova leitura</button>
      </Secao>

      <Fotos f={ctx.protocoloFotos()} ctx={ctx} />
    </>
  );
}
