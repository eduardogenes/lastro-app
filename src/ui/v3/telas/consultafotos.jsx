// As fotos para OLHAR, no visual novo: o centro das fotos, comparar, no tempo,
// a galeria (com a foto aberta e a lixeira) e o ajuste do enquadramento.
// Protótipo: docs/redesign-3/prototipos/fotos.html. Dados: `ctx.*V3()` em
// src/main.jsx, que somam a ressalva de cada sessão ao que já existia.

import { useEffect, useRef, useState } from 'preact/hooks';
import { ic } from '../icones.jsx';
import { Acoes, Apoio, Bloco, Botao, Cabecalho, Folha, Linha, Pergunta, Saida, Secao, Seletor, Selo, Vazio } from '../base.jsx';
import { Foto } from '../foto.jsx';
import { GIRO_MAX, ZOOM_MAX, zoomMinimo } from '../../../dominio/enquadramento';

const virgula = (n, c) => String(Number(n).toFixed(c)).replace('.', ',');

/** O selo de uma sessão: "no padrão" com o visto, ou a ressalva em tangerina. */
function SeloDaSessao({ noPadrao, txt }) {
  return noPadrao ? <Selo>{ic.ok} no padrão</Selo> : <Selo tom="atencao">{txt}</Selo>;
}

/** As poses numa fileira que rola de lado. */
function Poses({ poses, valor, aoMudar }) {
  return (
    <div class="v3-poses" role="group" aria-label="Pose">
      {poses.map(p => (
        <button key={p.k} aria-pressed={p.k === valor ? 'true' : 'false'} onClick={() => aoMudar(p.k)}>{p.t}</button>
      ))}
    </div>
  );
}

// ---------- o centro das fotos ----------

export function CentroDasFotos({ ctx }) {
  const c = ctx.centroDasFotosV3();
  if (!c) return null;
  return (
    <>
      <Bloco cor="lilas" chave="centro-fotos"
             linha0={<><button onClick={ctx.fechaCentroDasFotos} data-a="fotos-voltar">{ic.volta} Corpo</button><span>fotos do corpo</span></>}
             quando={c.quando} titulo={c.titulo} apoio={c.apoio}>
        <Acoes>
          <Botao data-a="fotos-nova" onClick={ctx.abreProtocolo}>{ic.camera} {c.hojePelaMetade ? 'Continuar a de hoje' : 'Nova sessão'}</Botao>
        </Acoes>
      </Bloco>
      {c.ultima && (
        <Secao titulo="Última sessão" nota={c.ultima.txt}>
          <div class="v3-fita">{c.ultima.fotos.map(f => <Foto key={f.id} url={f.url} enq={f.enq} alt={f.n} vazio="" />)}</div>
          <div class="v3-fita-s"><SeloDaSessao noPadrao={c.ultima.noPadrao} txt={c.ultima.selo} /></div>
        </Secao>
      )}
      <Secao>
        <div>
          <Linha titulo="Comparar" apoio={c.comparar || 'nasce com a segunda sessão'} quieta={!c.comparar}
                 data-a="fotos-comparar" aoTocar={c.comparar ? () => ctx.abreComparar() : undefined} />
          <Linha titulo="No tempo" apoio={c.noTempo || 'nasce com a segunda sessão'} quieta={!c.noTempo}
                 data-a="fotos-tempo" aoTocar={c.noTempo ? () => ctx.abreNoTempo() : undefined} />
          <Linha titulo="Galeria" apoio={c.galeria} data-a="fotos-galeria" aoTocar={ctx.abreGaleria} />
        </div>
      </Secao>
    </>
  );
}

// ---------- comparar ----------

/** A cortina: a foto nova por cima, recortada a partir da divisa; o dedo anda a divisa. */
function Cortina({ ctx, c }) {
  const caixa = useRef(null);
  const anda = e => {
    const r = caixa.current.getBoundingClientRect();
    ctx.setCorte(Math.round(Math.max(4, Math.min(96, (e.clientX - r.left) / r.width * 100))));
  };
  return (
    <>
      <div class="v3-cortina" ref={caixa}
           onPointerDown={e => { if (e.currentTarget.setPointerCapture) e.currentTarget.setPointerCapture(e.pointerId); anda(e); }}
           onPointerMove={e => { if (e.buttons || e.pointerType === 'touch') anda(e); }}>
        <Foto url={c.de.url} enq={c.de.enq} alt={'Antes: ' + c.de.data} vazio={c.de.aviso} />
        {c.ate.url && (
          <span class="v3-cortina-cima" style={'clip-path: inset(0 0 0 ' + c.corte + '%)'}>
            <Foto url={c.ate.url} enq={c.ate.enq} alt={'Depois: ' + c.ate.data} />
          </span>
        )}
        <i class="v3-cortina-pega" style={'left:' + c.corte + '%'} aria-hidden="true" />
        <span class="v3-cortina-et e v3-n">{c.de.data}</span>
        <span class="v3-cortina-et d v3-n">{c.ate.data}</span>
      </div>
      <input class="v3-faixa-r" type="range" min="0" max="100" value={c.corte} data-a="cortina-divisa"
             aria-label={'A divisa entre ' + c.de.data + ' e ' + c.ate.data}
             onInput={e => ctx.setCorte(Number(e.currentTarget.value))} />
    </>
  );
}

function Lado({ ctx, x, rotulo }) {
  const abre = () => ctx.abreFolha({ k: 'fotoComparada', d: x.d, data: x.data, tem: x.tem });
  return (
    <button class="v3-par-f" data-a={'par-' + rotulo} onClick={abre} aria-label={'Foto de ' + x.data + ': ajustar ou apagar'}>
      <Foto url={x.url} enq={x.enq} alt={x.data} vazio={x.aviso} />
    </button>
  );
}

export function Comparar({ ctx }) {
  const c = ctx.comparacaoV3();
  if (!c) return null;
  let palco;
  if (!c.par) palco = <div class="v3-pad"><Vazio titulo="Ainda sem par"><p>{c.vazio}</p></Vazio></div>;
  else if (c.modo === 'cortina') palco = <div class="v3-pad"><Cortina ctx={ctx} c={c} /></div>;
  else if (c.modo === 'sobre') {
    palco = (
      <div class="v3-pad">
        <div class="v3-sobre">
          <Foto url={c.de.url} enq={c.de.enq} alt={'Antes: ' + c.de.data} vazio={c.de.aviso} />
          {c.ate.url && <span class="v3-sobre-cima" style={'opacity:' + (c.opacidade / 100)}><Foto url={c.ate.url} enq={c.ate.enq} alt={'Depois: ' + c.ate.data} /></span>}
        </div>
        <input class="v3-faixa-r" type="range" min="0" max="100" value={c.opacidade} data-a="sobre-mistura"
               aria-label="Quanto da foto mais nova aparece" onInput={e => ctx.setOpacidade(Number(e.currentTarget.value))} />
      </div>
    );
  } else palco = <div class="v3-par"><Lado ctx={ctx} x={c.de} rotulo="de" /><Lado ctx={ctx} x={c.ate} rotulo="ate" /></div>;

  return (
    <>
      <Cabecalho titulo="Comparar" nota={c.dias != null ? c.dias + (c.dias === 1 ? ' dia' : ' dias') : c.meta} aoVoltar={ctx.fechaComparar} />
      <Poses poses={c.poses} valor={c.pose} aoMudar={ctx.setPoseComparada} />
      {c.par && (
        <div class="v3-pad">
          <Seletor rotulo="Como comparar" valor={c.modo} aoMudar={ctx.setModoDaComparacao}
                   opcoes={[{ k: 'lado', t: 'Lado a lado' }, { k: 'cortina', t: 'Cortina' }, { k: 'sobre', t: 'Sobrepor' }]} />
        </div>
      )}
      {palco}
      {c.par && (
        <>
          <div class="v3-datas">
            {[[c.de, c.seloDe], [c.ate, c.seloAte]].map(([x, s], k) => (
              <div key={k}>
                <b class="v3-n">{x.data}</b>
                <span>{x.hora ? x.hora + ' · ' : ''}{x.peso}</span>
                <SeloDaSessao noPadrao={s.noPadrao} txt={s.txt} />
              </div>
            ))}
          </div>
          <div class="v3-trilha" role="group" aria-label="Sessões desta pose">
            {c.datas.map(x => (
              <button key={x.d} class={x.d === c.de.d ? 'de' : x.d === c.ate.d ? 'ate' : undefined}
                      aria-label={'Sessão de ' + x.txt + (x.noPadrao ? '' : ', com ressalva')} data-a={'trilha-' + x.d}
                      onClick={() => ctx.tocaSessaoComparada(x.d)}>
                <i class={x.noPadrao ? undefined : 'r'} />{x.d === c.de.d || x.d === c.ate.d ? x.txt : ''}
              </button>
            ))}
          </div>
          <Secao>
            {c.curto
              ? <><Apoio><b>{c.curto.titulo}.</b> {c.curto.texto}</Apoio><Saida data-a="par-longo" onClick={ctx.voltaAoParLongo}>{c.curto.voltar}</Saida></>
              : <Apoio>{c.intervalo}. Toque numa sessão da linha para trocar a data mais perto dela.</Apoio>}
            {c.recuou && <Apoio><b>{c.recuou.titulo}.</b> {c.recuou.texto}</Apoio>}
            {c.notas.map(n => <Apoio key={n}>Nota: {n}</Apoio>)}
            <Acoes>
              <Botao tipo="contorno" cheio data-a="mandar" onClick={() => ctx.abreFolha({ k: 'mandar' })}>Mandar para os agentes</Botao>
            </Acoes>
            {ctx.pedidoDoPar() && <Apoio>Mandado em {ctx.pedidoDoPar().quando}{ctx.pedidoDoPar().todas ? ', com as onze poses' : ''}.</Apoio>}
          </Secao>
          {c.pergunta && (
            <Secao>
              <Pergunta pergunta={c.pergunta.t} nota={c.pergunta.nota} respostas={c.pergunta.opcoes}
                        valor={c.pergunta.valor} aoResponder={ctx.setGordura} />
            </Secao>
          )}
        </>
      )}
    </>
  );
}

/** A folha da foto tocada na comparação: ajustar, ou apagar (vai para a lixeira). */
export function FolhaFotoComparada({ ctx, f }) {
  const ajusta = () => { const c = ctx.comparacaoV3(); ctx.fechaFolha(); if (c) ctx.abreAjuste(f.d, c.pose); };
  return (
    <Folha titulo={f.data} sub="Ajustar não mexe na foto original. Apagar manda para a lixeira por 30 dias." aoFechar={() => ctx.fechaFolha()}>
      <Acoes><Botao tipo="contorno" cheio data-a="comparada-ajustar" disabled={!f.tem} onClick={ajusta}>Ajustar enquadramento</Botao></Acoes>
      <Saida data-a="comparada-apagar" onClick={() => { ctx.fechaFolha(); ctx.apagaFotoComparada(f.d); }}>Apagar esta foto</Saida>
    </Folha>
  );
}

/** A folha de mandar o par para os agentes: só esta pose, ou as onze das duas sessões. */
export function FolhaMandar({ ctx, f }) {
  const c = ctx.comparacaoV3();
  if (!c || !c.par) return null;
  const qual = f.qual || 'pose';
  const nome = (c.poses.filter(p => p.k === c.pose)[0] || {}).t || '';
  const escolhe = k => ctx.mudaFolha({ qual: k });
  const op = [
    { k: 'pose', icone: ic.ok, t: 'Só esta pose', a: nome + ', ' + c.de.data + ' e ' + c.ate.data },
    { k: 'todas', icone: ic.camera, t: 'As ' + c.poses.length + ' poses', a: 'o par inteiro das duas sessões' }
  ];
  return (
    <Folha titulo="Mandar para os agentes" aoFechar={() => ctx.fechaFolha()}
           sub="Vai o par, com data, hora, peso da semana e o que mudou em cada sessão. Sempre no mesmo formato, para a leitura ser comparável.">
      {op.map(o => (
        <button key={o.k} class="v3-esc" aria-pressed={qual === o.k ? 'true' : 'false'} data-a={'mandar-' + o.k} onClick={() => escolhe(o.k)}>
          <span class="v3-esc-o">{o.icone}</span><span class="v3-esc-t"><b>{o.t}</b><span>{o.a}</span></span>
        </button>
      ))}
      <Acoes><Botao data-a="mandar-ok" onClick={() => { ctx.fechaFolha(); ctx.mandaParaOsAgentes(qual); }}>Mandar</Botao></Acoes>
    </Folha>
  );
}

// ---------- no tempo ----------

export function NoTempo({ ctx }) {
  const t = ctx.noTempoV3();
  const relogio = useRef(null);
  useEffect(() => () => clearInterval(relogio.current), []);
  if (!t) return null;
  const s = t.sessoes[t.i];
  const passa = () => {
    clearInterval(relogio.current);
    let i = 0;
    ctx.setIndiceNoTempo(0);
    relogio.current = setInterval(() => {
      i++;
      if (i >= t.sessoes.length) { clearInterval(relogio.current); return; }
      ctx.setIndiceNoTempo(i);
    }, 420);
  };
  return (
    <>
      <Cabecalho titulo="No tempo" nota={t.sessoes.length + (t.sessoes.length === 1 ? ' sessão' : ' sessões')} aoVoltar={ctx.fechaNoTempo} />
      <Poses poses={t.poses} valor={t.pose} aoMudar={k => { clearInterval(relogio.current); ctx.setPoseNoTempo(k); }} />
      {!s ? <div class="v3-pad"><Vazio titulo="Sem foto nesta pose"><p>Escolha outra pose acima.</p></Vazio></div> : (
        <>
          <div class="v3-tempo-f"><Foto url={s.url} enq={s.enq} alt={'Sessão de ' + s.txt} vazio="buscando…" /></div>
          <div class="v3-datas">
            <div><b class="v3-n">{s.txt}</b><span>sessão {t.i + 1} de {t.sessoes.length}</span></div>
            <div><b class="v3-n">{s.peso || 'sem peso'}</b><span>média da semana</span>{!s.noPadrao && <Selo tom="atencao">{s.selo}</Selo>}</div>
          </div>
          <div class="v3-pad">
            <input class="v3-faixa-r" type="range" min="0" max={Math.max(0, t.sessoes.length - 1)} step="1" value={t.i} data-a="tempo-r"
                   aria-label="Sessão" onInput={e => { clearInterval(relogio.current); ctx.setIndiceNoTempo(Number(e.currentTarget.value)); }} />
          </div>
          <Secao>
            <Acoes><Botao data-a="tempo-play" disabled={t.sessoes.length < 2} onClick={passa}>{ic.play} Passar do começo</Botao></Acoes>
            <Apoio>Arraste para ir e voltar. Como todas saem do mesmo lugar e na mesma distância, o corpo fica parado e só a mudança aparece.</Apoio>
          </Secao>
        </>
      )}
    </>
  );
}

// ---------- galeria ----------

export function GaleriaV3({ ctx }) {
  const g = ctx.galeriaV3();
  if (!g) return null;
  return (
    <>
      <Cabecalho titulo="Galeria" aoVoltar={ctx.fechaGaleria}
                 acao={<button onClick={ctx.abreLixeira} data-a="galeria-lixeira" aria-label={'Lixeira' + (g.naLixeira ? ', ' + g.naLixeira : ', vazia')}>{ic.lixo}</button>} />
      {!g.sessoes.length && <div class="v3-pad"><Vazio titulo="Nenhuma foto ainda"><p>As fotos de cada sessão aparecem aqui, da mais nova para a mais antiga.</p></Vazio></div>}
      {g.sessoes.map(s => (
        <Secao key={s.d} titulo={s.data} nota={<SeloDaSessao noPadrao={s.selo.noPadrao} txt={s.selo.txt} />}>
          <div class="v3-grade" style="--v3-col:6;gap:4px">
            {s.fotos.map(f => (
              <button key={f.pose} data-a={'galeria-' + s.d + '-' + f.pose} aria-label={f.n + ', ' + s.data}
                      onClick={() => ctx.abreFotoDaGaleria(s.d, f.pose)}>
                <Foto url={f.url} enq={f.enq} alt={f.n} vazio="" />
              </button>
            ))}
          </div>
          <Apoio>{s.conta} poses</Apoio>
        </Secao>
      ))}
    </>
  );
}

export function GaleriaFotoV3({ ctx }) {
  const g = ctx.galeriaV3();
  const f = g && g.foto;
  // "Ver como fica": a sugestão do app desenhada na foto, sem gravar nada
  // amarrada à foto: passar para outra pose desliga a prévia
  const [previa, setPrevia] = useState(null);
  if (!f) return null;
  const chave = f.d + '|' + f.pose;
  const vendo = previa === chave && !!f.sug;
  const apaga = () => ctx.abreFolha({
    k: 'aviso', titulo: 'Apagar esta foto?', texto: 'Ela vai para a lixeira e fica 30 dias. Dá para devolver de lá.',
    sim: 'Apagar', nao: 'Manter', aoSim: () => ctx.apagaDaGaleria(f.d, f.pose)
  });
  return (
    <>
      <Cabecalho titulo={f.data} aoVoltar={ctx.fechaFotoDaGaleria}
                 acao={<button onClick={apaga} data-a="foto-apagar" aria-label="Apagar esta foto">{ic.lixo}</button>} />
      <div class="v3-ver"><Foto url={f.url} enq={vendo ? f.sug : f.enq} alt={f.n} vazio={f.aviso || 'buscando…'} /></div>
      {f.sug && (
        <div class="v3-sug" role="status">
          <p><b>O app sugere alinhar esta foto.</b> Aproxima e centraliza até a cabeça e os pés caírem nas linhas. O arquivo não muda.</p>
          <div class="v3-sug-b">
            <button class="v3-sug-ver" data-a="sug-ver" aria-pressed={vendo ? 'true' : 'false'} onClick={() => setPrevia(vendo ? null : chave)}>{vendo ? 'Ver como saiu' : 'Ver como fica'}</button>
            <button class="v3-sug-sim" data-a="sug-aceitar" onClick={() => { setPrevia(null); ctx.aceitaAlinhamento(f.d, f.pose); }}>Aceitar</button>
          </div>
          <Saida data-a="sug-nao" onClick={() => { setPrevia(null); ctx.dispensaAlinhamento(f.d, f.pose); }}>Agora não</Saida>
        </div>
      )}
      <div class="v3-ver-n">
        <button disabled={!f.anterior} data-a="foto-anterior" onClick={() => ctx.abreFotoDaGaleria(f.d, f.anterior)} aria-label="Pose anterior">{ic.volta}</button>
        <div><b>{f.n}</b><span class="v3-n">foto {f.indice} de {f.total}{f.peso ? ' · ' + f.peso : ''}{f.hora ? ' · ' + f.hora : ''}</span></div>
        <button disabled={!f.proxima} data-a="foto-proxima" onClick={() => ctx.abreFotoDaGaleria(f.d, f.proxima)} aria-label="Próxima pose">{ic.dir}</button>
      </div>
      <Secao>
        <Acoes>
          <Botao tipo="contorno" cheio data-a="foto-ajustar" onClick={() => ctx.abreAjuste(f.d, f.pose)}>Ajustar enquadramento</Botao>
          <Botao tipo="contorno" data-a="foto-comparar" onClick={() => { ctx.fechaGaleria(); ctx.abreComparar(f.pose); }}>Comparar</Botao>
        </Acoes>
        <Apoio>{f.ressalva} Ajustar não mexe na foto original.</Apoio>
      </Secao>
    </>
  );
}

export function LixeiraV3({ ctx }) {
  const g = ctx.galeriaV3();
  if (!g) return null;
  return (
    <>
      <Cabecalho titulo="Lixeira" aoVoltar={ctx.fechaLixeira} nota={g.lixeira.length ? g.lixeira.length + (g.lixeira.length === 1 ? ' foto' : ' fotos') : null} />
      {!g.lixeira.length
        ? <div class="v3-pad"><Vazio titulo="Vazia"><p>O que você apagar fica aqui por 30 dias e pode voltar.</p></Vazio></div>
        : (
          <Secao>
            <div>
              {g.lixeira.map(x => (
                <div key={x.k} class="v3-lixo">
                  <Foto url={x.url} alt={x.n} vazio="" />
                  <span class="v3-lin-t"><b>{x.n}</b><span>sessão de {x.sessao} · {x.quando} · {x.restam}</span></span>
                  <button class="v3-lixo-b" data-a={'lixeira-volta-' + x.k} onClick={() => ctx.restauraDaLixeira(x.k)}>Devolver</button>
                </div>
              ))}
            </div>
            <Saida data-a="lixeira-esvazia" onClick={ctx.esvaziaLixeira}>Esvaziar a lixeira</Saida>
          </Secao>
        )}
    </>
  );
}

// ---------- ajustar o enquadramento ----------

export function AjustarV3({ ctx }) {
  const d = ctx.ajusteEmEdicao();
  const arraste = useRef(null);
  if (!d) return null;
  // o arrasto em fração do quadro: o mesmo gesto move o mesmo tanto em qualquer tela
  const comeca = e => {
    const c = e.currentTarget.getBoundingClientRect();
    arraste.current = { x: e.clientX, y: e.clientY, l: c.width, a: c.height };
    if (e.currentTarget.setPointerCapture) e.currentTarget.setPointerCapture(e.pointerId);
  };
  const move = e => {
    const p = arraste.current; if (!p) return;
    ctx.arrastaAjuste((e.clientX - p.x) / p.l, (e.clientY - p.y) / p.a);
    arraste.current = { x: e.clientX, y: e.clientY, l: p.l, a: p.a };
  };
  const solta = () => { arraste.current = null; };
  const zMin = zoomMinimo(d.enq.r);
  return (
    <>
      <Cabecalho titulo="Ajustar" nota={d.pose + ' · ' + d.data} aoVoltar={ctx.fechaAjuste} />
      <div class="v3-quadro-aj" onPointerDown={comeca} onPointerMove={move} onPointerUp={solta} onPointerCancel={solta}>
        <Foto url={d.url} enq={d.enq} alt={d.pose} vazio="buscando…" />
        {d.fantasma && d.refUrl && <span class="v3-quadro-aj-f"><Foto url={d.refUrl} enq={d.refEnq} alt={'Contra ' + d.refTxt} /></span>}
        <i class="v3-guia cab" aria-hidden="true"><span>cabeça</span></i>
        <i class="v3-guia pes" aria-hidden="true"><span>pés</span></i>
      </div>
      <div class="v3-ctl">
        <label for="aj-giro">Girar <b class="v3-n">{virgula(d.enq.r, 1)}°</b></label>
        <input id="aj-giro" class="v3-faixa-r" type="range" min={-GIRO_MAX} max={GIRO_MAX} step="0.1" value={d.enq.r}
               data-a="aj-giro" onInput={e => ctx.setGiroDoAjuste(Number(e.currentTarget.value))} />
        <label for="aj-zoom">Aproximar <b class="v3-n">{virgula(d.enq.z, 2)}×</b></label>
        <input id="aj-zoom" class="v3-faixa-r" type="range" min={zMin} max={ZOOM_MAX} step="0.01" value={d.enq.z}
               data-a="aj-zoom" onInput={e => ctx.setZoomDoAjuste(Number(e.currentTarget.value))} />
      </div>
      {d.datas.length > 0 && (
        <Secao titulo="Alinhar contra" nota={d.fantasma ? 'a outra foto aparece por cima' : null}>
          <div class="v3-poses v3-poses-dentro" role="group" aria-label="Alinhar contra">
            <button aria-pressed={!d.fantasma ? 'true' : 'false'} onClick={() => ctx.setFantasmaDoAjuste(false)}>nenhuma</button>
            {d.datas.map(o => (
              <button key={o.d} aria-pressed={d.fantasma && d.fantasmaD === o.d ? 'true' : 'false'}
                      onClick={() => { ctx.setFantasmaDoAjuste(true); ctx.setDataDoFantasma(o.d); }}>{o.txt}</button>
            ))}
          </div>
        </Secao>
      )}
      <Secao>
        <Apoio>Arraste a foto e ponha a cabeça e os pés nas linhas: é o mesmo quadro da câmera.</Apoio>
        <Acoes>
          <Botao data-a="aj-salvar" onClick={ctx.salvaAjuste}>Salvar</Botao>
          <Botao tipo="contorno" data-a="aj-original" disabled={!d.sujo} onClick={ctx.zeraAjuste}>Original</Botao>
        </Acoes>
      </Secao>
    </>
  );
}
