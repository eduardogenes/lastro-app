// A câmera de dentro do app, com a foto anterior por cima do quadro vivo.
//
// É a diferença entre corrigir e prevenir. Ajustar depois conserta o
// enquadramento dentro do que a foto pegou; alinhar ANTES do disparo conserta a
// foto. Nenhum recorte devolve o pé que saiu do quadro.
//
// Dois modos, porque são duas situações (04/11):
//
// ALGUÉM TIRA, o padrão. Outra pessoa segura o celular, sentada no lugar
// marcado (`recomendacoes-quem-fotografa.md`). A sessão começa pelo ajuste de
// altura e distância, e depois cada toque é UMA foto — nada sai sozinho. Quem
// fotografa lê a tela: o erro comum em cima, a linha do que conferir embaixo,
// a miniatura com Refazer, e o aviso de foto torta, que pergunta antes de
// guardar. A voz fala só com a pessoa fotografada.
//
// SOZINHO. O celular apoiado e a pessoa a três metros, onde ninguém alcança o
// botão: aí o TEMPORIZADOR não é conveniência, e a sessão CONTINUA aqui
// dentro, sozinha — depois de cada disparo a voz diz o giro e a pose seguinte,
// e a contagem curta começa quando a voz acaba.

import { useEffect, useRef } from 'preact/hooks';
import { FotoAjustada } from '../instrumento/fotoajustada.jsx';
import { Procedencia, Secao, Vazio } from '../instrumento/primitivos.jsx';
import { TelaCheia } from '../instrumento/telacheia.jsx';

const TEMPOS = [0, 3, 10];

export function Camera({ ctx }) {
  const d = ctx.cameraViva();
  const video = useRef(null);
  const tela = useRef(null);

  // A TELA DA CÂMERA é um canvas pintado a cada quadro pela MESMA função que
  // monta a foto (`desenhaQuadro`, em infra/camera.ts). Mostrar o <video> direto
  // deixava o Safari decidir o corte: no iPhone, medido em 03/11, a tela
  // mostrava 55% × 55% do que a câmera do sistema mostra — 1,8× mais perto — e
  // o que se enquadrava não era o que se guardava. O <video> continua embaixo,
  // tocando: é de onde os quadros saem, e é o que aparece até o primeiro quadro
  // pintado.
  //
  // O ritmo é o do VÍDEO, não o da tela: `requestVideoFrameCallback` chama a
  // cada quadro novo da câmera, e só então. Isto não é movimento de interface —
  // é a imagem da câmera —, e por isso não passa pela porta de `movimento.js`.
  // Sem esse recurso, cerca de 30 quadros por segundo bastam para enquadrar.
  useEffect(function () {
    let vivo = true, t = 0;
    const pinta = function () {
      if (!vivo) return;
      const v = video.current;
      if (v && tela.current) ctx.pintaTelaDaCamera(tela.current, v);
      if (v && typeof v.requestVideoFrameCallback === 'function') v.requestVideoFrameCallback(pinta);
      else t = setTimeout(pinta, 33);
    };
    pinta();
    return function () { vivo = false; clearTimeout(t); };
  }, []);

  // O stream é preso ao <video> depois da montagem, e não por atributo: ele é
  // um objeto vivo, não uma URL, e o Preact não tem como escrevê-lo no JSX.
  useEffect(function () {
    const v = video.current;
    const s = ctx.streamDaCamera();
    if (!v || !s) return;
    try { if (v.srcObject !== s) v.srcObject = s; } catch (e) {}
    // `play()` devolve promessa que rejeita quando o gesto ainda não veio; não
    // é erro que interesse a ninguém, e deixá-la solta suja o console
    try { const p = v.play(); if (p && p.catch) p.catch(function () {}); } catch (e) {}
  });

  if (!d) return null;
  const alguem = d.quem === 'alguem';

  if (d.erro) {
    return (
      <TelaCheia olho="câmera" meta={d.data} titulo={d.pose}
                 aoVoltar={ctx.fechaCamera} corpo="hwrap">
        <Vazio>{d.erro}</Vazio>
        <Procedencia>
          a câmera do sistema continua servindo — ela dá a melhor qualidade que o
          aparelho sabe produzir, só não deixa sobrepor a foto anterior
        </Procedencia>
        <button class="ins-btn-secondary cam-sair" onClick={ctx.fechaCamera}>Voltar à pose</button>
      </TelaCheia>
    );
  }

  return (
    <TelaCheia
      olho={d.data} titulo={'Pose ' + d.indice + ' de ' + d.total + ' · ' + d.pose}
      aoVoltar={ctx.fechaCamera} corpo="hwrap"
    >
      {/* Os blocos no topo (a D, estado 2): a pose em que está e as que
          fecharam, do tamanho de um dedo — o que se lê a três metros. */}
      <div class="cam-blocos" aria-hidden="true">
        {d.pontos.map(p => (
          <i key={p.id} class={'cam-bloco' + (p.naoGuardada ? ' nao' : p.feita ? ' feita' : p.adiada ? ' adiada' : '') + (p.atual ? ' atual' : '')} />
        ))}
      </div>
      {/* A FOTO PRETA (a D, estado 6): a pose volta no fim, e a voz diz.
          O GIRO até a pose nova (estado 4): a maior coisa da tela, lida a três
          metros. */}
      {d.preta && <p class="cam-preta" role="status">A {d.preta.toLowerCase()} saiu preta. Ela volta no fim.</p>}
      {d.giroTxt && <p class={'cam-giro' + (alguem ? ' perto' : '')} aria-live="polite">{d.giroTxt}</p>}
      {/* Para quem fotografa, em cima do quadro: o erro que mais aparece nesta
          pose (F18). No ajuste não há pose ainda para errar. */}
      {alguem && !d.ajuste && <p class="cam-erro ins-body-sm ins-t2">erro comum · {d.erroComum}</p>}
      <div class={'cam-quadro' + (alguem ? ' perto' : '')}>
        <video ref={video} class="cam-video" autoplay playsinline muted />
        <canvas ref={tela} class="cam-tela" aria-hidden="true" />
        {/* O clarão do disparo: um nó por foto (a chave é o número do
            disparo), e quem o apaga é a animação, não um relógio. */}
        {d.clarao && <div key={d.disparo} class="cam-clarao" aria-hidden="true" />}

        {/* A sobreposta vai crua, sem o zoom do ajuste dela: o quadro vivo
            também é cru, e é contra a sala como saiu que o celular se acerta. */}
        {d.fantasma && d.refUrl && (
          <FotoAjustada
            url={d.refUrl} enq={null} alt={'Sobreposta: ' + d.refTxt}
            classe="cam-ghost" estilo={'opacity:' + (d.opacidade / 100)}
          />
        )}

        {/* As guias da cabeça e dos pés: o corpo inteiro entre as duas, perto
            delas. A margem de 4% é a tolerância da auditoria das fotos — os pés
            vinham ficando a 2–5% da borda, e a cabeça já encostou no topo. */}
        <div class="cam-guias" aria-hidden="true">
          <i class="cam-guia cam-guia-cabeca"><span>cabeça</span></i>
          <i class="cam-guia cam-guia-pes"><span>pés</span></i>
          {/* A regra do centro (F3): com o celular no nível, o meio da tela é a
              altura da lente. O quadril da pessoa aqui, e a lente está nele. */}
          <i class="cam-quadril cam-quadril-e" /><i class="cam-quadril cam-quadril-d"><span>quadril</span></i>
        </div>

        {d.grade && (
          <div class="aj-grade" aria-hidden="true">
            <i class="aj-v1" /><i class="aj-v2" /><i class="aj-h1" /><i class="aj-h2" />
            <i class="aj-eixo" />
          </div>
        )}

        {/* O nível do celular, acertado antes de sair de perto dele. Só o
            TAMANHO de cada inclinação: o lado para onde ela vai o sensor não
            garante (ver infra/nivel.ts). */}
        {d.nivel && (
          <div class={'cam-nivel' + (d.nivel.ok ? ' ok' : '')} role="status">
            {d.nivel.ok ? 'no nível' : 'de lado ' + d.nivel.lado + ' · frente ' + d.nivel.frente}
          </div>
        )}

        {/* A contagem cobre o quadro porque a três metros é a única coisa que
            ele precisa enxergar daqui. */}
        {d.contagem != null && (
          <div class="cam-contagem" role="status" aria-live="assertive">
            <span>{d.contagem || '·'}</span>
          </div>
        )}

        {/* A FOTO QUE ACABOU DE SAIR, 3 s no canto (F17): quem fotografa vê
            o pé fora, o braço colado, e refaz antes de a pessoa mudar de pose.
            A que pode ter tremido (F12) diz, e o Refazer dela leva o destaque. */}
        {d.miniatura && (
          <div class="cam-mini">
            {d.miniatura.url && <img src={d.miniatura.url} alt={'Acabou de sair: ' + d.miniatura.pose} />}
            {d.miniatura.tremida && <span class="cam-mini-aviso">pode ter tremido</span>}
            <button class={d.miniatura.tremida ? 'ins-btn-primary' : 'ins-btn-secondary'}
                    onClick={ctx.refazUltima}>Refazer</button>
          </div>
        )}
      </div>

      {/* O AJUSTE, uma vez, na primeira pose (F3): a altura pela regra do
          centro, a distância pelas linhas, e ninguém sai do lugar até o fim. */}
      {alguem && d.ajuste && (
        <ol class="cam-ajuste">
          {d.ajuste.map((l, k) => <li key={k} class="ins-body-sm ins-t1">{l}</li>)}
        </ol>
      )}
      {/* O que conferir antes do toque (F15, F16): fora da imagem, porque texto
          por cima taparia justamente a cabeça e os pés. Com a miniatura no
          canto, a linha é a da foto que acabou de sair. */}
      {alguem && !d.ajuste && !d.torta && (
        <div class="cam-confira" aria-live="polite">
          <span class="ins-label">{d.miniatura ? 'confira na foto' : 'confira antes de tocar'}</span>
          {d.confira.map((l, k) => <p key={k} class="cam-confira-l">{l}</p>)}
        </div>
      )}

      {/* O disparo logo abaixo do quadro, e preso ao fundo da tela quando a
          tela rola: antes ele ficava 200 px abaixo da dobra, e para tocá-lo o
          quadro saía de vista. Durante a sequência ele vira o "parar" — da
          contagem e de tudo que viria depois dela. */}
      {/* A FOTO TORTA (pedido do dono, 04/11): a foto saiu, mas não é
          guardada sem pergunta. Repetir é o caminho certo e leva o destaque;
          registrar assim grava a inclinação verdadeira junto. */}
      {d.torta ? (
        <div class="cam-torta" role="alert">
          <p class="ins-body ins-t1"><b>A foto saiu torta:</b> {d.torta.txt}.</p>
          <div class="cam-torta-b">
            <button class="ins-btn-primary" onClick={ctx.repeteTorta}>Repetir</button>
            <button class="ins-btn-secondary" onClick={ctx.registraTorta}>Registrar assim</button>
          </div>
        </div>
      ) : (d.contagem != null || d.seguido)
        ? <button class="ins-btn-secondary cam-disparo" onClick={ctx.cancelaDisparo}>Parar</button>
        : (alguem && d.ajuste)
          ? (
            <button class="ins-btn-primary cam-disparo" disabled={!d.pronta} onClick={ctx.ajustado}>
              {d.pronta ? d.rotulo : 'abrindo a câmera…'}
            </button>
          )
          : (
            // Com alguém tirando, a foto sai quando o dedo ENCOSTA (F8): o
            // clique do mesmo toque, depois, não dispara de novo.
            <button class="ins-btn-primary cam-disparo" disabled={!d.pronta || d.guardando}
                    onPointerDown={alguem ? (e => { if (e.isPrimary !== false && (e.pointerType !== 'mouse' || e.button === 0)) ctx.disparaCamera('toque'); }) : undefined}
                    onClick={() => ctx.disparaCamera()}>
              {d.pronta ? d.rotulo : 'abrindo a câmera…'}
            </button>
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
      <div class="aj-modos">
        {/* A fala não se repete sozinha (F20): quem fotografa pede quando a
            pessoa não ouviu. */}
        {alguem && <button class="ins-chip" onClick={ctx.repeteFala}>repetir a fala</button>}
        <button class={'ins-chip' + (d.grade ? ' on' : '')}
                onClick={() => ctx.setGradeDaCamera(!d.grade)}>grade</button>
        {d.datas.length > 0 && (
          <button class={'ins-chip' + (d.fantasma ? ' on' : '')}
                  onClick={() => ctx.setFantasmaDaCamera(!d.fantasma)}>sobrepor</button>
        )}
      </div>

      {d.fantasma && d.datas.length > 0 && (
        <>
          <div class="aj-fantasma">
            <span class="ins-label">Alinhar contra</span>
            <select class="ins-input aj-sel" value={d.fantasmaD || ''}
                    onChange={e => ctx.setDataDoFantasmaDaCamera(e.currentTarget.value)}>
              {d.datas.map(o => <option key={o.d} value={o.d}>{o.txt}</option>)}
            </select>
          </div>
          <div class="cam-op">
            <span class="ins-label">Mistura</span>
            <input type="range" min="10" max="90" value={d.opacidade}
                   aria-label="opacidade da foto sobreposta"
                   onInput={e => ctx.setOpacidadeDaCamera(Number(e.currentTarget.value))} />
          </div>
        </>
      )}

      <Secao rotulo="Quem tira">
        <div class="cam-tempos">
          <button class={'ins-chip' + (alguem ? ' on' : '')} onClick={() => ctx.setQuemTira('alguem')}>alguém tira para mim</button>
          <button class={'ins-chip' + (!alguem ? ' on' : '')} onClick={() => ctx.setQuemTira('sozinho')}>tiro sozinho</button>
        </div>
      </Secao>

      {!alguem && (
        <Secao rotulo="A primeira contagem" nota="depois dela, as poses seguem sozinhas">
          <div class="cam-tempos">
            {TEMPOS.map(t => (
              <button key={t} class={'ins-chip' + (d.timer === t ? ' on' : '')}
                      onClick={() => ctx.setTimerDaCamera(t)}>
                {t === 0 ? 'sem' : t + 's'}
              </button>
            ))}
          </div>
        </Secao>
      )}

      {alguem ? (
        <>
          <Procedencia>
            um toque, uma foto: nada sai sozinho. A voz fala só com quem está
            sendo fotografado; quem fotografa lê a tela
          </Procedencia>
          <Procedencia>
            fora do nível, a foto sai, e o app pergunta antes de guardar. As
            linhas decidem a distância; a sobreposta ajuda a achar o lugar
          </Procedencia>
        </>
      ) : (
        <>
          <Procedencia>
            um toque tira a sessão inteira: a voz diz o giro e a pose seguinte, e a
            contagem curta começa quando ela termina
          </Procedencia>
          <Procedencia>
            posicione o celular até a sala coincidir com a sobreposta — é o
            enquadramento que se está acertando aqui, não a pose
          </Procedencia>
        </>
      )}
      <Procedencia>
        o quadro vivo tem menos resolução que a câmera do sistema. Vale pela
        consistência: nenhum recorte depois devolve o pé que saiu do quadro
      </Procedencia>
    </TelaCheia>
  );
}
