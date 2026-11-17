// A CÂMERA no visual novo. Protótipo: docs/redesign-3/prototipos/fotos.html
// ("a câmera"). Decisões: docs/redesign-3/02-captura.md.
//
// O padrão é obrigatório, e quem carrega é o app: o botão só destrava com as
// três luzes verdes (nível, altura e distância), ou depois de "Tirar mesmo
// assim", e cada foto guarda o que não estava verde. O nível vem do sensor;
// altura e distância, enquanto a detecção do corpo não está ativa, quem
// fotografa confere pelas linhas e toca na luz.
//
// O resto é o comportamento da câmera de sempre (`src/main.jsx`): o quadro vem
// pintado num canvas pela mesma função que monta a foto, a voz fala com quem
// está sendo fotografado, a foto torta pergunta antes de guardar, e sozinho um
// toque tira a sessão inteira.

import { useEffect, useRef } from 'preact/hooks';
import { ic } from '../icones.jsx';
import { Acoes, Botao, Saida } from '../base.jsx';
import { Foto } from '../foto.jsx';

const LUZ = [
  { k: 'nivel', icone: ic.nivel, t: 'Nível' },
  { k: 'altura', icone: ic.altura, t: 'Altura' },
  { k: 'distancia', icone: ic.distancia, t: 'Distância' }
];
const NOME = { nivel: 'nível', altura: 'altura', distancia: 'distância' };

/** O que acertar agora, numa frase. `sozinho` muda o sujeito: o apoio, e não as mãos. */
function oQueAcertar(k, d, sozinho, medida, x) {
  // com a detecção medindo, a frase diz o lado certo para mexer
  if (medida && k !== 'nivel' && x.pessoa === false) {
    return ['Ninguém inteiro no quadro.', 'a cabeça e os pés precisam aparecer'];
  }
  if (medida && k === 'altura' && x.dicaAltura && x.dicaAltura !== 'ok') {
    const sobe = x.dicaAltura === 'subir';
    return [sozinho ? (sobe ? 'Suba o apoio do celular.' : 'Desça o apoio do celular.') : (sobe ? 'Suba as mãos.' : 'Desça as mãos.'),
            sobe ? 'sobra mais espaço embaixo dos pés' : 'sobra mais espaço em cima da cabeça'];
  }
  if (medida && k === 'distancia' && x.dicaDistancia && x.dicaDistancia !== 'ok') {
    const perto = x.dicaDistancia === 'frente';
    return [sozinho ? (perto ? 'Chegue o apoio para a frente.' : 'Afaste o apoio.') : (perto ? 'Chegue a cadeira para a frente.' : 'Afaste a cadeira.'),
            perto ? 'o corpo está pequeno entre as linhas' : 'a cabeça ou os pés passam das linhas'];
  }
  if (k === 'nivel') {
    return medida && d.nivel
      ? ['Endireite o celular: ele está inclinado.', 'de lado ' + d.nivel.lado + ' · frente ' + d.nivel.frente]
      : ['Confira o nível: o celular em pé e reto, sem inclinar.', 'toque em Nível quando estiver'];
  }
  if (k === 'altura') {
    return [sozinho ? 'Acerte a altura do apoio: o mesmo espaço acima da cabeça e abaixo dos pés.'
                    : 'Suba ou desça as mãos até sobrar o mesmo espaço em cima e embaixo.',
            medida ? null : 'toque em Altura quando estiver'];
  }
  return [sozinho ? 'Chegue o apoio para a frente ou para trás: cabeça e pés nas linhas.'
                  : 'Chegue a cadeira para a frente ou para trás: cabeça e pés nas linhas.',
          medida ? null : 'toque em Distância quando estiver'];
}

export function CameraV3({ ctx }) {
  const d = ctx.cameraViva();
  const x = ctx.cameraV3();
  const video = useRef(null);
  const tela = useRef(null);

  // O quadro é pintado no ritmo do vídeo, pela função que monta a foto: o que
  // se enquadra é o que se guarda (ver a câmera antiga, mesmo motivo).
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
  useEffect(function () {
    const v = video.current;
    const s = ctx.streamDaCamera();
    if (!v || !s) return;
    try { if (v.srcObject !== s) v.srcObject = s; } catch (e) {}
    try { const p = v.play(); if (p && p.catch) p.catch(function () {}); } catch (e) {}
  });

  if (!d || !x) return null;
  const sozinho = d.quem === 'sozinho';

  if (d.erro) {
    return (
      <div class="v3-cam">
        <div class="v3-cam-topo"><button onClick={ctx.fechaCamera} aria-label="Sair da câmera">{ic.x}</button><div><b>A câmera não abriu</b></div></div>
        <div class="v3-cam-erro">
          <p class="v3-bloco-a">{d.erro}</p>
          <p class="v3-apoio">A câmera do sistema continua servindo: ela só não mostra a foto anterior por cima.</p>
          <Acoes><Botao onClick={ctx.fechaCamera}>Voltar à sessão</Botao></Acoes>
        </div>
      </div>
    );
  }

  const l = x.luzes;
  const falta = x.apagadas[0];
  const correndo = d.contagem != null || d.seguido;

  // o aviso de cima: um só, o mais importante
  let aviso = null;
  if (d.preta) aviso = { icone: ic.x, t: 'A ' + d.preta.toLowerCase() + ' saiu preta.', s: 'Ela volta no fim.' };
  else if (d.torta) aviso = null;
  else if (x.completa && !correndo) aviso = { ok: true, icone: ic.ok, t: 'As ' + d.total + ' estão guardadas.', s: d.miniatura ? 'dá para refazer a última no canto' : null };
  else if (x.forcado && falta) aviso = { icone: ic.x, t: 'Fora do padrão: ' + x.apagadas.map(k => NOME[k]).join(', ') + ' sem acertar.', s: 'fica anotado em cada foto' };
  else if (x.esperando && d.contagem == null) aviso = { ok: !falta, icone: ic.um, t: falta ? oQueAcertar(falta, d, true, l.medida[falta], x)[0] : 'Pare na marca.', s: 'a contagem começa com você parado' };
  else if (falta) { const m = oQueAcertar(falta, d, sozinho, l.medida[falta], x); aviso = { icone: LUZ.filter(z => z.k === falta)[0].icone, t: m[0], s: m[1] }; }
  else if (x.ajuste) aviso = { ok: true, icone: ic.ok, t: 'Tudo certo. Agora não saia do lugar até o fim.', s: x.dicaLado !== 'centro' ? 'o corpo está um pouco à ' + x.dicaLado + ' do meio' : null };
  else if (d.giroTxt) aviso = { ok: true, icone: ic.gira, t: d.giroTxt };

  // o botão do meio
  let botao;
  if (!d.pronta) botao = <button class="v3-disparo-b" disabled aria-label="Abrindo a câmera">{ic.camera}</button>;
  else if (correndo) botao = <button class="v3-disparo-b" data-a="cam-parar" onClick={ctx.cancelaDisparo} aria-label="Parar">{ic.pausa}</button>;
  else if (x.ajuste) botao = <button class="v3-disparo-b" data-a="cam-ajustado" disabled={!x.liberado} onClick={ctx.ajustado} aria-label="Confirmar o ajuste">{ic.ok}</button>;
  else if (sozinho) botao = <button class="v3-disparo-b" data-a="cam-disparo" disabled={!x.liberado} onClick={() => ctx.disparaCamera()} aria-label={d.rotulo}>{ic.play}</button>;
  else {
    // com alguém tirando, a foto sai quando o dedo ENCOSTA (F8): o clique do
    // mesmo toque, depois, não dispara de novo
    botao = (
      <button class="v3-disparo-b" data-a="cam-disparo" disabled={!x.liberado || d.guardando || !!d.torta} aria-label={d.rotulo}
              onPointerDown={e => { if (e.isPrimary !== false && (e.pointerType !== 'mouse' || e.button === 0)) ctx.disparaCamera('toque'); }}
              onClick={() => ctx.disparaCamera()}>{ic.camera}</button>
    );
  }
  const direita = !d.pronta ? 'abrindo…'
    : x.ajuste ? (x.liberado ? 'confirme o ajuste' : 'trava até ficar verde')
    : correndo ? 'toque para parar'
    : sozinho ? (x.liberado ? 'toque e vá para a marca' : 'trava até ficar verde')
    : (d.total - x.feitas) + (d.total - x.feitas === 1 ? ' falta' : ' faltam');

  return (
    <div class="v3-cam">
      <div class="v3-cam-topo">
        <button onClick={ctx.fechaCamera} data-a="cam-sair" aria-label="Sair da câmera">{ic.x}</button>
        <div>
          <b>{x.ajuste ? 'Ajuste, uma vez só' : d.pose}</b>
          <span class="v3-n">{x.ajuste
            ? (sozinho ? 'apoie o celular e confira pela tela' : 'depois é um toque por foto')
            : 'foto ' + d.indice + ' de ' + d.total + ' · posição ' + x.posicao + ' de ' + x.posicoes}</span>
        </div>
      </div>
      <div class="v3-segs" role="img" aria-label={x.feitas + ' de ' + d.total + ' fotos'}>
        {d.pontos.map((p, i) => (
          <i key={p.id} class={[p.feita ? 'f' : p.atual ? 'a' : '', i > 0 && x.grupos.indexOf(i) >= 0 ? 'q' : ''].filter(Boolean).join(' ') || undefined} />
        ))}
      </div>

      {aviso && (
        <div class={'v3-cam-aviso' + (aviso.ok ? ' ok' : '')} role="status" key={aviso.t}>
          {aviso.icone}<span>{aviso.t}{aviso.s && <small>{aviso.s}</small>}</span>
        </div>
      )}

      <div class="v3-visor">
        <video ref={video} class="v3-cam-video" autoplay playsinline muted />
        <canvas ref={tela} class="v3-cam-tela" aria-hidden="true" />
        {d.clarao && <div key={d.disparo} class="v3-cam-clarao" aria-hidden="true" />}
        {/* a sobreposta vai crua, sem o ajuste dela: é contra a sala como saiu
            que o celular se acerta */}
        {d.fantasma && d.refUrl && (
          <span class="v3-cam-sombra" style={'opacity:' + (d.opacidade / 100)}>
            <Foto url={d.refUrl} enq={null} alt={'Sobreposta: ' + d.refTxt} />
          </span>
        )}
        <i class={'v3-guia cab' + (l.distancia ? ' ok' : '')} aria-hidden="true"><span>cabeça</span></i>
        <i class={'v3-guia pes' + (l.distancia ? ' ok' : '')} aria-hidden="true"><span>pés</span></i>
        <i class={'v3-guia meio' + (l.altura ? ' ok' : '')} aria-hidden="true" />
        <i class={'v3-guia meio' + (l.altura ? ' ok' : '')} aria-hidden="true" />

        {d.contagem != null && (
          <div class="v3-cam-conta" role="status" aria-live="assertive">{d.contagem || ''}</div>
        )}
        {d.miniatura && (
          <div class="v3-cam-mini">
            <Foto url={d.miniatura.url} alt={'Acabou de sair: ' + d.miniatura.pose} />
            {d.miniatura.tremida && <small>pode ter tremido</small>}
            <button data-a="cam-refazer" onClick={ctx.refazUltima}>Refazer</button>
          </div>
        )}
        {d.torta && (
          <div class="v3-cam-torta" role="alert">
            <b>Esta saiu inclinada: {d.torta.txt}</b>
            <span>Repetir leva dois segundos. Guardada assim, fica marcada fora do padrão.</span>
            <Acoes>
              <Botao data-a="torta-repete" onClick={ctx.repeteTorta}>Repetir</Botao>
              <Botao tipo="contorno" data-a="torta-guarda" onClick={ctx.registraTorta}>Guardar assim</Botao>
            </Acoes>
          </div>
        )}
      </div>

      {d.naoGuardada && (
        <div class="v3-cam-aviso" role="alert">
          {ic.x}<span>{d.naoGuardada.titulo}<small>{d.naoGuardada.texto}</small></span>
        </div>
      )}

      <div class={'v3-luzes' + (x.ajuste ? '' : ' mini')}>
        {LUZ.map(z => {
          const ok = l[z.k], medida = l.medida[z.k];
          return (
            <button key={z.k} class={'v3-luz' + (ok ? ' ok' : '')} data-a={'luz-' + z.k}
                    aria-pressed={medida ? undefined : (ok ? 'true' : 'false')}
                    aria-label={z.t + ': ' + (ok ? 'certo' : medida ? 'acertar' : 'conferir')}
                    onClick={medida ? undefined : () => ctx.confereLuz(z.k, !ok)}>
              {ok ? ic.ok : z.icone}
              <span>{z.t}<small>{ok ? (medida ? 'certo' : 'conferido') : (medida ? 'acertar' : 'toque ao conferir')}</small></span>
            </button>
          );
        })}
      </div>

      {(x.ajuste || (sozinho && !correndo)) && x.deteccao === 'reserva' && (
        <p class="v3-apoio" data-a="cam-reserva">A detecção do corpo não está disponível agora: confira altura e distância pelas linhas e toque nas luzes.</p>
      )}
      {!x.ajuste && !sozinho && !d.torta && (
        <div class="v3-cam-fala">
          <p>“{x.fala}”{x.confira && <small>confira: {x.confira}</small>}</p>
          <button data-a="cam-fala" onClick={ctx.repeteFala} aria-label="Repetir a fala">{ic.som}</button>
        </div>
      )}

      {x.completa && !correndo && !d.torta
        ? <Acoes><Botao data-a="cam-ver-sessao" onClick={ctx.fechaCamera}>Ver a sessão {ic.seta}</Botao></Acoes>
        : (
          <div class="v3-disparo">
            {d.datas.length > 0
              ? <button class="v3-disparo-l v3-anterior" data-a="cam-anterior" aria-pressed={d.fantasma ? 'true' : 'false'}
                        onClick={() => ctx.setFantasmaDaCamera(!d.fantasma)}>foto anterior</button>
              : <span class="v3-disparo-l" />}
            {botao}
            <span class="v3-disparo-l v3-n">{direita}</span>
          </div>
        )}
      {!x.liberado && !x.forcado && d.pronta && (
        <Saida data-a="cam-mesmo-assim" onClick={() => ctx.abreFolha({
          k: 'aviso', seguro: true, titulo: 'Tirar mesmo assim?',
          texto: 'As fotos saem e ficam guardadas, mas cada uma entra marcada como fora do padrão, com o que ficou sem acertar (' +
            x.apagadas.map(k => NOME[k]).join(', ') + '). Na comparação ela aparece com esse aviso.',
          nao: 'Voltar e acertar', sim: 'Tirar fora do padrão', aoSim: ctx.tiraMesmoAssim
        })}>Tirar mesmo assim</Saida>
      )}
    </div>
  );
}
