// As escolhas ficam neste cartão, inclusive quando ele abre numa folha pelo Hoje.
import { useEffect, useLayoutEffect, useRef, useState } from 'preact/hooks';
import { Apoio, Botao, Fichas, Folha, Saida } from '../base.jsx';
import { CamposDoCardio, Contador } from '../cardio.jsx';
import { ic } from '../icones.jsx';

const TURNOS = { manha: 'Manhã', tarde: 'Tarde', noite: 'Noite' };
const DURACOES = [[30, '30 min'], [45, '45 min'], [60, '1h'], [90, '1h30']];
const MODOS = { ultima: 'Como da última vez', prescrito: 'Como o prescrito', ajustar: 'Ajustar', presenca: 'Só que treinei' };
const INICIO = { k: '', grupos: [], dur: null, turno: '', hora: '' };

export function FolhaRegistroTreino({ ctx, f }) {
  const resumo = ctx.resumoDoDiaV3(f.data).treino;
  return <Folha titulo="Registrar um treino" sub={ctx.diaDoRegistro(f.data).dia} aoFechar={ctx.fechaFolha}>
    {resumo && <Apoio>{resumo.titulo} · {resumo.apoio}</Apoio>}
    <CartaoRegistro ctx={ctx} data={f.data} />
    <Saida data-a="registro-fechar" onClick={ctx.fechaFolha}>Fechar</Saida>
  </Folha>;
}

export function FolhaAjustarRegistro({ ctx, f }) {
  const [linhas, setLinhas] = useState(f.linhas);
  const [salvando, setSalvando] = useState(false);
  function muda(i, alteracao) { setLinhas(atual => atual.map((ex, j) => i === j ? { ...ex, ...alteracao } : ex)); }
  return <Folha titulo={f.titulo} sub="Mude só o que foi diferente." aoFechar={ctx.fechaFolha}>
    {linhas.map((ex, i) => <div class="v3-reg-ex" key={ex.id}>
      <div><b>{ex.nome}</b><Saida data-a={'ajuste-pula-' + i} aria-pressed={!!ex.nao}
        onClick={() => muda(i, { nao: !ex.nao })}>{ex.nao ? 'fiz' : 'não fiz'}</Saida></div>
      {!ex.nao && <div class="v3-reg-pares">
        <span>{ex.n} ×</span>
        <Contador valor={ex.carga.toLocaleString('pt-BR') + ' ' + ex.unidadeCarga} nome={'carga de ' + ex.nome} prefixo={'ajuste-carga-' + i + '-'}
          menos={ex.carga > 0 && (() => muda(i, { carga: Math.max(0, ex.carga - ex.passo) }))}
          mais={() => muda(i, { carga: ex.carga + ex.passo })} />
        <Contador valor={ex.reps + (ex.u && ex.u !== 'rep' ? ' s' : ' rep')} nome={'quantidade de ' + ex.nome} prefixo={'ajuste-reps-' + i + '-'}
          menos={ex.reps > 1 && (() => muda(i, { reps: ex.reps - 1 }))} mais={() => muda(i, { reps: ex.reps + 1 })} />
      </div>}
    </div>)}
    <Apoio>Todas as séries de um exercício entram iguais. Você pode corrigir uma série ao abrir o dia.</Apoio>
    <Botao cheio data-a="ajuste-guardar" disabled={salvando} onClick={async () => {
      setSalvando(true);
      if (await f.guardar(linhas)) ctx.fechaFolha();
      else setSalvando(false);
    }}>Guardar o treino</Botao>
  </Folha>;
}

export function CartaoRegistro({ ctx, data }) {
  const d = ctx.diaDoRegistro(data);
  const [r, setR] = useState(INICIO);
  const [outro, setOutro] = useState(false);
  const [cardio, setCardio] = useState(null);
  const [dispensou, setDispensou] = useState(false);
  const [semResposta, setSemResposta] = useState(false);
  const [aviso, setAviso] = useState(null);
  const [erro, setErro] = useState('');
  const ocupada = useRef(false), cartaoAoTirar = useRef(null), raiz = useRef(null), focaPergunta = useRef(false);
  const freq = d.frequencia;
  const soCardio = !d.sessoes && !freq && !!d.cardios.length;
  const perguntaInicial = outro || (!d.sessoes && !freq && !soCardio);
  const dados = r.turno && r.k !== 'livre' ? ctx.seriesDoRegistro(data, r.k, r.turno, r.hora) : null;
  const sigla = d.treinos.find(x => x.k === r.k)?.sigla;
  const nome = sigla === 'HX' ? 'HYROX' : sigla ? 'Treino ' + sigla : { livre: 'Treino livre', falta: 'Falta', cardio: 'Só cardio' }[r.k];
  const mudar = v => setR(atual => ({ ...atual, ...v }));

  useEffect(() => {
    if (!aviso) return;
    const timer = setTimeout(() => setAviso(null), 6000);
    return () => clearTimeout(timer);
  }, [aviso]);
  // Depois de guardar ou desfazer, o foco volta à primeira pergunta do cartão, e não ao corpo da página.
  // Se o toque veio da folha do Ajustar, espera ela terminar de fechar: o foco que sai de uma folha
  // fechando volta para quem a abriu, e por cima do nosso.
  useLayoutEffect(() => {
    if (!focaPergunta.current || !raiz.current) return;
    focaPergunta.current = false;
    let tentativas = 0;
    const foca = () => {
      const ajuste = document.querySelector('.v3-reg-ex');
      if (ajuste && !raiz.current?.contains(ajuste) && tentativas++ < 40) { setTimeout(foca, 50); return; }
      raiz.current?.querySelector('.v3-reg-letras button, .v3-cal-freq button, .v3-reg-passo button, [data-a="registro-outro"]')?.focus({ preventScroll: true });
    };
    if (document.querySelector('.v3-reg-ex')) setTimeout(foca, 50); else foca();
  });
  useLayoutEffect(() => {
    if (freq || !cartaoAoTirar.current) return;
    cartaoAoTirar.current.querySelector('[data-a="frequencia-descanso"]')?.focus({ preventScroll: true });
    cartaoAoTirar.current = null;
  }, [freq]);

  function limpa() {
    setR(INICIO); setOutro(false); setCardio(null); setErro('');
  }
  async function grava(acao) {
    if (ocupada.current) return false;
    ocupada.current = true;
    try {
      const registro = await acao();
      if (!registro) { setErro('Não foi possível guardar. Tente de novo.'); return false; }
      if (registro.erro) { setErro(registro.erro); return false; }
      limpa(); setAviso(registro); setDispensou(false); setSemResposta(false);
      focaPergunta.current = true;
      return true;
    } finally { ocupada.current = false; }
  }
  function frequencia(k, motivo) { return grava(() => ctx.respondeFrequencia(data, k, motivo)); }
  function escolheFrequencia(k) {
    if (k === freq) return;
    if (k === 'falta') { mudar({ k }); setCardio(null); }
    else frequencia(k);
  }
  function tirarResposta(e) {
    const cartao = e.currentTarget.closest('.v3-cal-det, .v3-folha');
    cartao.style.minHeight = cartao.getBoundingClientRect().height + 'px';
    cartaoAoTirar.current = cartao;
    setAviso(null); setSemResposta(false); ctx.respondeFrequencia(data, null);
  }
  function abreCardio(sozinho) {
    // os campos do cardio crescem para baixo: o aviso anterior sai para não ficar por cima do "Guardar"
    setAviso(null);
    if (sozinho) mudar({ k: 'cardio' });
    setCardio({ ...ctx.cardioInicial });
  }
  async function guardaCardio() {
    return grava(async () => {
      const c = await ctx.gravaCardioNoDia(d.t, cardio);
      if (c) return { texto: ctx.diaComMaiuscula(d.t) + ': ' + c.min + ' min de ' + c.m + '.', desfaz: () => ctx.tiraCardio(c.t) };
    });
  }
  function treino(modo, ajustes) { return grava(() => ctx.guardaRegistro(data, r, modo, ajustes)); }
  function como(modo) {
    if (modo === 'ajustar') ctx.abreFolha({ k: 'ajustarRegistro', titulo: nome + ' · ' + d.dia,
      linhas: dados.prescrito, guardar: linhas => treino(modo, linhas) });
    else treino(modo);
  }
  const frequencias = [{ k: 'descanso', t: 'Descanso' }, ...(!d.hoje ? [{ k: 'falta', t: 'Falta' }] : [])];
  const fichasFreq = <Fichas rotulo="Descanso ou falta" prefixo="frequencia-" opcoes={frequencias.map(x => ({ ...x, on: freq === x.k }))} aoTocar={escolheFrequencia} />;
  const motivos = <><Apoio>O motivo, se quiser dizer. Continua sendo falta.</Apoio>
    <Fichas rotulo="Motivo da falta" prefixo="motivo-" opcoes={ctx.motivosFalta.map(k => ({ k, t: k, on: freq === 'falta' && d.motivo === k }))}
      aoTocar={k => frequencia('falta', freq === 'falta' && d.motivo === k ? undefined : k)} /></>;
  async function desfaz() {
    const a = aviso;
    setAviso(null); limpa(); setDispensou(false);
    focaPergunta.current = true;
    if (await a.desfaz() === false) setErro('Não foi possível desfazer: o armazenamento recusou. Tente de novo.');
  }
  const turnos = ctx.turnosDoDia(data);
  const apoios = dados && {
    ultima: dados.ultima.length ? dados.series + (dados.series === 1 ? ' série' : ' séries') + ', as cargas de ' + dados.dataAnterior : 'Sem séries na sessão anterior',
    prescrito: 'As séries e repetições do treino, sem acrescentar carga',
    ajustar: 'A lista já preenchida para mudar o que foi diferente',
    presenca: 'Sem séries. Conta como dia treinado'
  };
  return <div class="v3-registro" ref={raiz}>
    {(!!r.k || outro) && <div class="v3-reg-escolhido">
      {nome && <b>{nome}</b>}{r.dur && <span>{DURACOES.find(([k]) => k === r.dur)?.[1] || r.dur + ' min'}</span>}{r.turno && <span>{ctx.turnoDito[r.turno]}</span>}
      <Saida data-a="registro-mudar" onClick={limpa}>mudar</Saida></div>}
    {!r.k && perguntaInicial && <div class={outro ? 'v3-reg-passo' : 'v3-cal-freq'}>
      <p>{outro && d.sessoes ? 'Qual foi o outro treino?' : 'O que foi esse dia?'}</p>
      <div class="v3-reg-letras">
        {d.treinos.map(x => <span class="v3-reg-letra" key={x.k}><button class={(x.proximo ? 'previsto ' : '') + (x.sigla === 'HX' ? 'hx' : '')}
          data-a={'registro-' + x.k} aria-label={(x.sigla === 'HX' ? 'HYROX' : 'Treino ' + x.sigla) + (x.proximo ? ', o próximo' : '')}
          onClick={() => mudar({ k: x.k })}>{x.sigla}</button>{x.proximo && <small aria-hidden="true">próximo</small>}</span>)}
        <button class="livre" data-a="registro-livre" onClick={() => mudar({ k: 'livre' })}>livre</button>
      </div>
      {!outro && <div class="v3-reg-frequencias">{fichasFreq}<button class="v3-ficha" data-a="registro-so-cardio" onClick={() => abreCardio(true)}>Só cardio</button></div>}
    </div>}
    {r.k === 'falta' && <div class="v3-cal-freq">{motivos}
      <Botao cheio data-a="frequencia-guardar" onClick={() => frequencia('falta')}>Guardar a falta</Botao></div>}
    {r.k === 'livre' && !r.dur && <div class="v3-reg-passo"><p>O que trabalhou?</p>
      <Fichas rotulo="O que trabalhou" multipla prefixo="registro-grupo-" opcoes={d.grupos.map(k => ({ k, t: k, on: r.grupos.includes(k) }))}
        aoTocar={k => mudar({ grupos: r.grupos.includes(k) ? r.grupos.filter(g => g !== k) : [...r.grupos, k] })} />
      <p>Quanto tempo?</p><Fichas rotulo="Duração" prefixo="registro-dur-" opcoes={DURACOES.map(([k, t]) => ({ k, t }))} aoTocar={dur => mudar({ dur })} /></div>}
    {(!!sigla || (r.k === 'livre' && !!r.dur)) && !r.turno && <div class="v3-reg-passo"><p>Em que turno?</p>
      <Fichas rotulo="Em que turno?" prefixo="registro-turno-" opcoes={Object.entries(TURNOS).filter(([k]) => turnos.includes(k)).map(([k, t]) => ({ k, t: <>{ic[k]}{t}</> }))} aoTocar={turno => mudar({ turno })} />
      <Apoio>Só o turno basta. A hora exata você põe depois, se quiser.</Apoio></div>}
    {r.turno && <>
      {dados && <div class="v3-reg-passo"><p>Como foi?</p>{Object.entries(MODOS).filter(([k]) => !d.sessoes || k !== 'ajustar').map(([k, t]) =>
        <button class={'v3-reg-op' + (k === 'ultima' && dados.ultima.length ? ' forte' : '')} data-a={'registro-' + k} key={k}
          disabled={k === 'ultima' && !dados.ultima.length || ['prescrito', 'ajustar'].includes(k) && !dados.prescrito.length}
          onClick={() => como(k)}><span><b>{t}</b><small>{apoios[k]}</small></span>{ic.dir}</button>)}</div>}
      <label class="v3-reg-hora"><span>Hora exata, se quiser{!r.hora && <small> · sem hora</small>}</span><input type="time" data-a="registro-hora" value={r.hora} onInput={e => {
        const hora = e.currentTarget.value, turno = ctx.turnoDaHora(data, hora);
        mudar({ hora, turno: turno || r.turno });
      }} /></label>
      {r.k === 'livre' && <Botao cheio data-a="registro-livre-guardar" onClick={() => treino('presenca')}>Guardar o treino livre</Botao>}
    </>}
    {!r.k && !outro && <>
      {freq && <div class="v3-cal-freq"><p>Descanso ou falta?</p>{fichasFreq}{freq === 'falta' && motivos}
        <Saida data-a="frequencia-tirar" onClick={tirarResposta}>Tirar a resposta</Saida></div>}
      {d.cardios.map(c => <div class="v3-reg-cardio-ok" key={c.t}><span>Cardio: {c.min} min de {c.m}{c.i && ', ' + c.i}.</span>
        <Saida data-a={'registro-tirar-cardio-' + c.t} onClick={() => grava(() => ctx.tiraCardio(c.t))}>tirar</Saida></div>)}
      {!cardio && (freq || d.sessoes > 0) && !d.cardios.length && !dispensou && <div class="v3-reg-passo"><p>Teve cardio também?</p>
        <Fichas rotulo="Teve cardio também?" prefixo="registro-cardio-" opcoes={[{ k: 'sim', t: 'Sim' }, { k: 'nao', t: 'Não' }]}
          aoTocar={k => k === 'sim' ? abreCardio(false) : setDispensou(true)} /></div>}
      {soCardio && !semResposta && <div class="v3-cal-freq"><p>E a musculação nesse dia?</p>{fichasFreq}
        <Saida data-a="registro-sem-resposta" onClick={() => setSemResposta(true)}>Deixar sem resposta</Saida></div>}
    </>}
    {cardio && <div class="v3-reg-passo">
      <p>O cardio</p>
      <CamposDoCardio campos={ctx.camposDoCardio(cardio)} prefixo="registro-cardio-" aoTocar={(k, v) => setCardio(f => ({ ...f, [k]: v }))} />
      <Botao cheio data-a="registro-cardio-guardar" onClick={guardaCardio}>Guardar o cardio</Botao>
      {!r.k && <Saida onClick={() => setCardio(null)}>Fechar o cardio</Saida>}</div>}
    {!r.k && !perguntaInicial && !cardio && <button class="v3-reg-outro" data-a="registro-outro" onClick={() => setOutro(true)}>
      {d.sessoes ? '+ Outro treino nesse dia' : 'Registrar um treino'}</button>}
    {erro && <p role="alert">{erro}</p>}
    {/* a vaga do aviso existe sempre, no fim do cartão: o aviso entra e sai sem mover nada,
        e o conteúdo rola para fora dele */}
    <div class="v3-reg-aviso-lugar">{aviso && <div class="v3-reg-aviso" role="status"><span>{aviso.texto}</span>
      <button data-a="aviso-acao" onClick={desfaz}>Desfazer</button></div>}</div>
  </div>;
}
