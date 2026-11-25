// A MÍDIA DO EXERCÍCIO (Fase D, protótipo aprovado em 25/11/2026).
//
// Na tela da série: um QUADRO LARGO (16:9) com a animação de duas imagens —
// início e pico, alternando —, tocar amplia, e o chip "Ver execução m:ss" no
// canto abre o vídeo. Sem animação, a mídia é só o botão do vídeo, inteiro na
// largura. Sem nada, a tela fica como era. No bi-set, cada estação mostra a
// sua animação (só a da vez se mexe) e o vídeo fica num chip abaixo do par.
//
// O vídeo é do YouTube, num iframe sem cookies, já no trecho, sem som de
// saída e repetindo; sem rede, o chip fica cinza e diz por quê. Nada aqui
// grava estado: a sugestão de uma mídia melhor fica no aparelho até a fila de
// curadoria existir (Fase F).

import { useEffect, useState } from 'preact/hooks';
import { ic } from '../icones.jsx';
import { Acoes, Botao, Folha } from '../base.jsx';

/** Está com rede? Muda com o aparelho, sem recarregar. */
export function useComRede() {
  const [on, setOn] = useState(typeof navigator === 'undefined' || navigator.onLine !== false);
  useEffect(() => {
    const sim = () => setOn(true), nao = () => setOn(false);
    window.addEventListener('online', sim); window.addEventListener('offline', nao);
    return () => { window.removeEventListener('online', sim); window.removeEventListener('offline', nao); };
  }, []);
  return on;
}

/** As duas imagens alternando; com "reduzir movimento" ou pausado, fica no início. */
function Duo({ anim, parado, alt }) {
  return (
    <>
      <img class="v3-mq-a" src={anim.inicio} alt={alt ? alt + ', posição inicial' : ''} loading="lazy" decoding="async" />
      <img class={'v3-mq-b' + (parado ? ' parado' : '')} src={anim.pico} alt="" aria-hidden="true" loading="lazy" decoding="async" />
    </>
  );
}

/** O chip do vídeo: preto com a duração; sem rede, cinza e explicado. */
function ChipVideo({ ctx, m, rede, classe }) {
  if (!m.video) return null;
  if (!rede) {
    return <span class={'v3-mchip cinza ' + (classe || '')} role="note">{ic.semrede}<span>Vídeo sem internet</span></span>;
  }
  return (
    <button class={'v3-mchip ' + (classe || '')} data-a="midia-video" onClick={e => { e.stopPropagation(); ctx.abreVideo(m); }}
            aria-label={'Ver a execução de ' + m.n + (m.video.dur ? ', trecho de ' + m.video.dur : '')}>
      {ic.play}<span>Ver execução</span>{m.video.dur && <small class="v3-n">{m.video.dur}</small>}
    </button>
  );
}

/**
 * A mídia da série solo. Com animação: o quadro largo, que amplia ao toque.
 * Só com vídeo: o botão do vídeo em largura cheia (o quadro vazio só ocuparia
 * a tela que o registro precisa). Sem nada: não aparece.
 */
export function MidiaDaSerie({ ctx, m }) {
  const rede = useComRede();
  const [pausa, setPausa] = useState(false);
  if (!m || (!m.anim && !m.video)) return null;
  if (!m.anim) {
    return rede
      ? <button class="v3-mvideo" data-a="midia-video" onClick={() => ctx.abreVideo(m)}>
          {ic.play}<span>Ver execução</span>{m.video.dur && <small class="v3-n">{m.video.dur}</small>}
        </button>
      : <p class="v3-mvideo cinza" role="note">{ic.semrede}<span>Vídeo da execução: precisa de internet</span></p>;
  }
  return (
    <div class={'v3-mq' + (pausa ? ' pausa' : '')}>
      <button class="v3-mq-toque" data-a="midia-amplia" aria-label={'Ampliar o movimento de ' + m.n} onClick={() => ctx.ampliaMidia(m)}>
        <Duo anim={m.anim} parado={pausa} alt={m.n} />
        <span class="v3-mq-qd" aria-hidden="true"><i />início<i />pico</span>
      </button>
      <button class="v3-mq-pausa" data-a="midia-pausa" aria-label={pausa ? 'Retomar o movimento' : 'Pausar o movimento'} onClick={() => setPausa(!pausa)}>
        {pausa ? ic.play : ic.pausa}
      </button>
      <ChipVideo ctx={ctx} m={m} rede={rede} classe="sobre" />
    </div>
  );
}

/** A animação dentro da estação do bi-set (só a da vez se mexe). */
export function MidiaDaEstacao({ m, ativa }) {
  if (!m || !m.anim) return null;
  return <span class={'v3-mest' + (ativa ? ' a' : '')} aria-hidden="true"><Duo anim={m.anim} parado={!ativa} /></span>;
}

/** Os vídeos do par, abaixo das estações: um chip por estação que tem vídeo. */
export function VideosDoPar({ ctx, estacoes }) {
  const rede = useComRede();
  const com = estacoes.filter(e => e.midia && e.midia.video);
  if (!com.length) return null;
  return (
    <div class="v3-mpar" role="group" aria-label="Vídeos da execução">
      {com.map(e => rede
        ? <button key={e.i} class="v3-mchip claro" data-a={'midia-video-' + e.i} onClick={() => ctx.abreVideo(e.midia)}
                  aria-label={'Ver a execução de ' + e.n}>
            {ic.play}<span>{e.n}</span>{e.midia.video.dur && <small class="v3-n">{e.midia.video.dur}</small>}
          </button>
        : <span key={e.i} class="v3-mchip cinza" role="note">{ic.semrede}<span>{e.n}: sem internet</span></span>)}
    </div>
  );
}

function Pontos({ pontos }) {
  if (!pontos || !pontos.length) return null;
  return (
    <ol class="v3-mpontos" aria-label="Pontos-chave da execução">
      {pontos.map((p, k) => <li key={k}><i aria-hidden="true">{k + 1}</i><span>{p}</span></li>)}
    </ol>
  );
}

/**
 * O VÍDEO: o trecho da execução, já tocando sem som e repetindo; os
 * pontos-chave para ler enquanto assiste; abrir no YouTube ou ver inteiro.
 */
export function FolhaVideo({ ctx, f }) {
  const m = f.m;
  const v = m && m.video;
  const rede = useComRede();
  if (!v) return null;
  return (
    <Folha titulo={m.n} aoFechar={ctx.fechaFolha}>
      {rede
        ? <div class="v3-mplayer">
            <iframe src={v.embed} title={'Execução de ' + m.n + ', vídeo de ' + (v.canal || 'YouTube')}
                    allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen loading="lazy"
                    referrerpolicy="strict-origin-when-cross-origin" />
          </div>
        : <p class="v3-mplayer off" role="note">{ic.semrede}<span>Sem internet agora. O vídeo toca quando a conexão voltar.</span></p>}
      <p class="v3-mtrecho">
        <span>Trecho <b class="v3-n">{v.trecho}</b>{v.dur && <> · <span class="v3-n">{v.dur}</span></>}</span>
        <span>começa sem som · repete o trecho</span>
      </p>
      <Pontos pontos={m.pontos} />
      <Acoes>
        <a class="v3-mlink-b" href={v.url} target="_blank" rel="noopener" data-a="midia-youtube">{ic.seta}Abrir no YouTube</a>
      </Acoes>
      <div class="v3-mlinks">
        <a href={v.inteiro} target="_blank" rel="noopener" data-a="midia-inteiro">Ver o vídeo inteiro</a>
        <button data-a="midia-sugere" onClick={() => ctx.sugereFolha(m)}>Sugerir um melhor</button>
      </div>
      <p class="v3-mfonte">Vídeo de <b>{v.canal || 'um canal do YouTube'}</b>, no YouTube. Escolhido na curadoria do Lastro.</p>
    </Folha>
  );
}

/** A ANIMAÇÃO AMPLIADA: o movimento grande, as duas posições lado a lado e os pontos. */
export function FolhaAmpliaMidia({ ctx, f }) {
  const m = f.m;
  const rede = useComRede();
  const [pausa, setPausa] = useState(false);
  if (!m || !m.anim) return null;
  return (
    <Folha titulo={m.n} aoFechar={ctx.fechaFolha}>
      <div class={'v3-mq grande' + (pausa ? ' pausa' : '')}>
        <span class="v3-mq-toque"><Duo anim={m.anim} parado={pausa} alt={m.n} /><span class="v3-mq-qd" aria-hidden="true"><i />início<i />pico</span></span>
        <button class="v3-mq-pausa" data-a="midia-pausa-g" aria-label={pausa ? 'Retomar o movimento' : 'Pausar o movimento'} onClick={() => setPausa(!pausa)}>
          {pausa ? ic.play : ic.pausa}
        </button>
      </div>
      <div class="v3-mduas">
        <figure><img src={m.anim.inicio} alt={m.n + ', posição inicial'} /><figcaption>início</figcaption></figure>
        <figure><img src={m.anim.pico} alt={m.n + ', pico do movimento'} /><figcaption>pico</figcaption></figure>
      </div>
      <Pontos pontos={m.pontos} />
      {m.video && (rede
        ? <Acoes><Botao cheio data-a="midia-amplia-video" onClick={() => { ctx.fechaFolha(); ctx.abreVideo(m); }}>{ic.play} Ver execução{m.video.dur ? ' · ' + m.video.dur : ''}</Botao></Acoes>
        : <p class="v3-mvideo cinza" role="note">{ic.semrede}<span>Vídeo da execução: precisa de internet</span></p>)}
      {m.anim.credito && <p class="v3-mfonte">Imagens: {m.anim.credito}.</p>}
      <div class="v3-mlinks"><button data-a="midia-sugere-a" onClick={() => ctx.sugereFolha(m)}>Sugerir uma imagem ou vídeo melhor</button></div>
    </Folha>
  );
}

/** "Sec" ou "m:ss" → segundos; vazio → null; ruim → NaN. */
function segundos(t) {
  const s = String(t || '').trim();
  if (!s) return null;
  const m = s.match(/^(\d+):([0-5]\d)$/);
  if (m) return Number(m[1]) * 60 + Number(m[2]);
  return /^\d+$/.test(s) ? Number(s) : NaN;
}

/**
 * SUGERIR UMA MÍDIA MELHOR: o link, o trecho e o porquê. Entra na curadoria;
 * a mídia de agora continua até a sugestão ser aprovada.
 */
export function FolhaSugereMidia({ ctx, f }) {
  const m = f.m || {};
  const [link, setLink] = useState('');
  const [ini, setIni] = useState('');
  const [fim, setFim] = useState('');
  const [por, setPor] = useState('');
  const [foi, setFoi] = useState(null);
  const a = segundos(ini), b = segundos(fim);
  const linkOk = /^https:\/\/(www\.)?(youtube\.com|youtu\.be|m\.youtube\.com)\//.test(link.trim()) || /^https:\/\/\S+\.(webp|png|jpe?g|gif|mp4)(\?\S*)?$/i.test(link.trim());
  const trechoOk = !Number.isNaN(a) && !Number.isNaN(b) && (a == null || b == null || b > a);
  const pode = linkOk && trechoOk;
  if (foi) {
    return (
      <Folha titulo="Sugestão guardada" aoFechar={ctx.fechaFolha}>
        <p class="v3-maviso" role="status">{ic.ok}<span>{foi === 'ok'
          ? 'Vai para a curadoria. A mídia de agora continua até a sua ser aprovada.'
          : 'Este aparelho não conseguiu guardar a sugestão. Tente de novo mais tarde.'}</span></p>
        <Acoes><Botao cheio data-a="midia-sugere-fecha" onClick={ctx.fechaFolha}>Fechar</Botao></Acoes>
      </Folha>
    );
  }
  return (
    <Folha titulo={'Sugerir para ' + (m.n || 'este exercício')} sub="Um vídeo do YouTube com a execução certa e sem enrolação, de preferência em português, ou uma imagem com licença livre." aoFechar={ctx.fechaFolha}>
      <label class="v3-mcampo" for="sug-link">Link
        <input id="sug-link" class="v3-campo" inputmode="url" autocomplete="off" placeholder="https://youtu.be/…" value={link} onInput={e => setLink(e.currentTarget.value)} />
      </label>
      <div class="v3-mduas-c">
        <label class="v3-mcampo" for="sug-ini">Começa em
          <input id="sug-ini" class="v3-campo" inputmode="numeric" placeholder="1:10" value={ini} onInput={e => setIni(e.currentTarget.value)} />
        </label>
        <label class="v3-mcampo" for="sug-fim">Termina em
          <input id="sug-fim" class="v3-campo" inputmode="numeric" placeholder="1:40" value={fim} onInput={e => setFim(e.currentTarget.value)} />
        </label>
      </div>
      <label class="v3-mcampo" for="sug-por">Por que é melhor (opcional)
        <textarea id="sug-por" class="v3-campo" rows="2" value={por} onInput={e => setPor(e.currentTarget.value)} />
      </label>
      {link.trim() && !linkOk && <p class="v3-mfonte" role="alert">Use um link do YouTube ou de uma imagem (https).</p>}
      {!trechoOk && <p class="v3-mfonte" role="alert">O trecho vai em segundos ou m:ss, e o fim vem depois do começo.</p>}
      <Acoes>
        <Botao cheio data-a="midia-sugere-envia" disabled={!pode}
               onClick={() => setFoi(ctx.sugereMidia({ n: m.n || '', link: link.trim(), inicio: a, fim: b, por: por.trim() }) ? 'ok' : 'falhou')}>
          Enviar sugestão
        </Botao>
      </Acoes>
    </Folha>
  );
}
