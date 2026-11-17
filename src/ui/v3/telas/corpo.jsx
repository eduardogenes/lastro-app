// O CORPO no visual novo (Fase 2): o lugar, o "Medir agora" com uma medida
// por tela e a folha de ligar medidas. Protótipo: docs/redesign-3/prototipos/
// corpo.html. Dados: `ctx.corpoV3()` e `ctx.medirV3()` em src/main.jsx.

import { useState } from 'preact/hooks';
import { ic } from '../icones.jsx';
import { Acoes, Apoio, Bloco, Botao, Chave, Folha, Linha, Secao, Segmentos, TelaDeAcao } from '../base.jsx';
import { Regua } from '../regua.jsx';
import { Foto } from '../foto.jsx';

const virgula = n => String(Math.round(n * 10) / 10).replace('.', ',');

/** A linha pequena de uma série, só a forma: sem eixo, sem número. */
function Mini({ serie }) {
  if (!serie || serie.length < 2) return null;
  const mn = Math.min(...serie), mx = Math.max(...serie), n = serie.length;
  const d = serie.map((y, i) => (i ? 'L' : 'M') + (i / (n - 1) * 64).toFixed(1) + ' ' +
    (30 - (mx === mn ? 0.5 : (y - mn) / (mx - mn)) * 30).toFixed(1)).join('');
  return (
    <svg class="v3-mini" viewBox="-3 -3 70 36" preserveAspectRatio="none" aria-hidden="true">
      <path d={d} fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  );
}

// ---------- o lugar ----------

export function CorpoV3({ ctx }) {
  const c = ctx.corpoV3();
  const [peso, setPeso] = useState(null);
  const v = peso == null ? c.peso.valor : peso;
  const mexeu = peso != null && Math.abs(peso - c.peso.valor) > 0.001;
  const abreQuadro = k => k === 'peso' ? ctx.abreEvolucao() : k === 'cintura' ? ctx.abreMedida('cintura') : ctx.abreMedida('bio');
  return (
    <div class="v3">
      <Bloco cor="ceu" chave="corpo" linha0={<><span>Corpo</span><span>{c.peso.ultima}</span></>}>
        <div class="v3-gigante v3-n" aria-live="polite">{virgula(v)}<small>kg</small></div>
        <Regua min={Math.max(20, Math.floor(c.peso.valor - 20))} max={Math.ceil(c.peso.valor + 20)} passo={0.1} cada={1} largura={12}
               valor={v} aoMudar={setPeso} rotulo="peso em kg" />
        <Acoes>
          {mexeu || !c.peso.hoje
            ? <Botao data-a="corpo-pesa" espera={!mexeu && !c.peso.hoje}
                     onClick={() => { ctx.pesaHoje(v); setPeso(null); }}>
                {mexeu || c.peso.hoje ? (c.peso.hoje ? 'Corrigir para ' : 'Guardar ') + virgula(v) + ' kg' : 'Guardar ' + virgula(v) + ' kg hoje'}
              </Botao>
            : <Botao data-a="corpo-pesa" espera disabled>{ic.ok} Guardado hoje</Botao>}
        </Acoes>
      </Bloco>

      <Secao titulo="Evolução" nota="toque para ver">
        <div class="v3-quadros" style="--v3-col:2">
          {c.quadros.map(q => (
            <button key={q.k} class="v3-quadro" data-a={'corpo-' + q.k} onClick={() => abreQuadro(q.k)}>
              <b>{q.valor}<small> {q.unidade}</small></b>{q.rotulo}<Mini serie={q.serie} />
            </button>
          ))}
        </div>
      </Secao>

      <Secao titulo="Medidas" nota={c.ultimaMedida}>
        <div>
          {c.medidas.map(m => (
            <Linha key={m.k} titulo={m.n} apoio={m.apoio} valor={m.valor || '—'} unidade={m.valor ? m.u : null}
                   data-a={'corpo-medida-' + m.k} aoTocar={() => ctx.abreMedida(m.k)} />
          ))}
          {c.desligadas.length > 0 && (
            <Linha titulo={'Mais ' + c.desligadas.length + ' medidas'} apoio={c.desligadas.join(', ') + ' · desligadas'} quieta mais
                   data-a="corpo-ligar" aoTocar={() => ctx.abreFolha({ k: 'ligarMedidas' })} />
          )}
        </div>
        {c.medidas.length > 0 && (
          <Acoes>
            <Botao tipo="contorno" cheio data-a="corpo-medir" onClick={() => ctx.abreMedirAgora()}>
              Medir agora · {c.medidas.length} {c.medidas.length === 1 ? 'medida' : 'medidas'}
            </Botao>
          </Acoes>
        )}
      </Secao>

      <Secao titulo="Bioimpedância" nota={c.bio ? c.bio.quando : 'uma vez por mês'}>
        <div>
          {c.bio
            ? <Linha titulo={c.bio.celulas[0].valor + ' de gordura'} apoio={c.bio.celulas[1].valor + ' de músculo · ' + c.bio.celulas[3].valor + ' de água'}
                     data-a="corpo-bio" aoTocar={() => ctx.abreMedida('bio')} />
            : <Linha titulo="Nenhuma leitura ainda" apoio="a balança de bioimpedância dá cinco números" quieta />}
          <Linha titulo="Nova leitura" mais data-a="corpo-bio-nova" aoTocar={ctx.abreBio} />
        </div>
      </Secao>

      <Secao titulo="Fotos" nota={c.fotos ? c.fotos.txt : 'a cada 14 dias'}>
        {c.fotos && (
          <button class="v3-fita v3-fita-b" data-a="corpo-fotos" onClick={ctx.abreCentroDasFotos} aria-label="Abrir as fotos do corpo">
            {c.fotos.lista.map(f => <Foto key={f.id} url={f.url} enq={f.enq} vazio="" />)}
          </button>
        )}
        <Acoes>
          <Botao tipo="contorno" cheio data-a="corpo-fotos-abre" onClick={ctx.abreCentroDasFotos}>{ic.camera} {c.fotos ? 'Fotos do corpo' : 'Primeira sessão de fotos'}</Botao>
        </Acoes>
      </Secao>
      <div class="v3-fim-da-tela" />
    </div>
  );
}

/** A folha de ligar e desligar medidas: desligar esconde, nunca apaga. */
export function FolhaLigarMedidas({ ctx }) {
  const d = ctx.medidasParaLigar();
  return (
    <Folha titulo="Medidas" sub="Ligue o que você mede. Desligar só esconde: o que já foi medido continua guardado." aoFechar={() => ctx.fechaFolha()}>
      <div class="v3-ligar">
        {d.fitas.map(f => (
          <Chave key={f.k} titulo={f.n} apoio={f.onde} ligada={f.ligada} data-a={'ligar-' + f.k} aoMudar={on => ctx.ligaFita(f.k, on)} />
        ))}
        <Chave titulo="Dobras com adipômetro" apoio="abdominal, suprailíaca e coxa, em mm" ligada={d.dobras}
               data-a="ligar-dobras" aoMudar={on => ctx.ligaModulo('dobras', on)} />
      </div>
      <Acoes><Botao onClick={() => ctx.fechaFolha()}>Pronto</Botao></Acoes>
    </Folha>
  );
}

// ---------- medir agora: uma medida por tela ----------

export function MedirAgora({ ctx }) {
  const d = ctx.medirV3();
  if (!d) return null;
  if (d.vazia) return <SemMedidas ctx={ctx} />;
  if (d.fim) return <Medido ctx={ctx} d={d} />;
  const m = d.m;
  const ultimaLeitura = d.passo === 'pronta';
  const frase = d.passo === 3 ? 'As duas diferem ' + d.diferenca + ' ' + m.u + '. Meça mais uma: fica a média das próximas.'
    : m.dobra && d.leituras.length ? 'Solte, pince de novo e leia. O app grava a do meio das três.'
    : d.leituras.length === 1 ? 'Primeira guardada. Tire a fita, passe de novo e guarde a segunda.'
    : ultimaLeitura ? (m.dobra ? 'Três lidas. Fica a do meio.' : 'As duas batem. Fica a média.')
    : d.ultima ? 'da última vez: ' + d.ultima : 'primeira vez: comece perto de ' + d.partida;
  const rotuloGuarda = d.passo === 1 ? 'Guardar a 1ª' : d.passo === 2 ? 'Guardar a 2ª' : 'Guardar a 3ª';
  return (
    <TelaDeAcao cor={m.dobra ? 'menta' : 'areia'}
      topo={<><button onClick={ctx.fechaMedidas} aria-label="Sair" data-a="medir-sair">{ic.x}</button>
              <span>{m.dobra ? 'adipômetro' : 'fita'} · <span class="v3-n">{d.i + 1} de {d.total}</span></span><span class="v3-vazio-alvo" /></>}
      pe={ultimaLeitura
        ? <Botao grande data-a="medir-segue" onClick={() => ctx.seguirMedida()}>{d.i + 1 < d.total ? 'Próxima' : 'Terminar'} {ic.seta}</Botao>
        : <Botao grande data-a="medir-guarda" onClick={ctx.guardaLeitura}>{ic.ok} {rotuloGuarda}</Botao>}
      links={<>
        {!m.dobra && d.leituras.length === 1
          ? <button data-a="medir-so-esta" onClick={() => ctx.seguirMedida()}>Guardar só esta</button>
          : <button data-a="medir-pula" onClick={() => ctx.pulaMedida()}>Pular esta</button>}
        <button data-a="medir-como" onClick={() => ctx.abreFolha({ k: 'comoMedir', titulo: m.n, onde: m.onde, como: m.como, regra: d.regra })}>Ver como medir</button>
      </>}>
      <Segmentos total={d.total} feitos={d.i} rotulo={'medida ' + (d.i + 1) + ' de ' + d.total} />
      <p class="v3-medir-onde"><b>{m.onde}</b></p>
      <h2 class="v3-medir-n">{m.n}</h2>
      <div class="v3-gigante v3-n" aria-live="polite">{virgula(d.valor)}<small>{m.u}</small></div>
      <Regua min={d.regua.min} max={d.regua.max} passo={d.regua.passo} cada={d.regua.cada} largura={m.dobra ? 14 : 12}
             valor={d.valor} aoMudar={ctx.setValorDaMedida} rotulo={m.n + ' em ' + m.u} />
      <p class="v3-medir-f">{frase}</p>
      {d.leituras.length > 0 && (
        <div class="v3-leituras">
          {d.leituras.map((l, j) => <span key={j} class="v3-n">{j + 1}ª · {l}</span>)}
          {d.leituras.length > 1 && <span class="m v3-n">grava {d.grava}</span>}
        </div>
      )}
    </TelaDeAcao>
  );
}

/** Nenhuma medida ligada: o caminho é ligar uma. */
function SemMedidas({ ctx }) {
  return (
    <TelaDeAcao cor="areia" topo={<button onClick={ctx.fechaMedidas} aria-label="Sair">{ic.x}</button>}
      pe={<Botao grande onClick={() => ctx.abreFolha({ k: 'ligarMedidas' })}>Ligar medidas</Botao>}>
      <h2 class="v3-medir-n">Nenhuma medida ligada</h2>
      <p class="v3-medir-f">Ligue as medidas que você faz com a fita (ou as dobras) e elas aparecem aqui, uma por tela.</p>
    </TelaDeAcao>
  );
}

function Medido({ ctx, d }) {
  return (
    <>
      <Bloco cor="menta" chave="medido" medio quando="guardadas"
             titulo={d.feitas.length + (d.feitas.length === 1 ? ' medida, com a hora de agora' : ' medidas, com a hora de agora')}>
        <Acoes><Botao data-a="medido-fecha" onClick={ctx.fechaMedidas}>Fechar</Botao></Acoes>
      </Bloco>
      <Secao>
        <div>
          {d.feitas.map(f => (
            <Linha key={f.k} titulo={f.n} valor={f.valor}
                   apoio={f.dif + (f.dobra ? ' · a do meio de ' + f.leituras : f.leituras > 1 ? ' · média de ' + f.leituras + ' leituras' : ' · uma leitura só')} />
          ))}
        </div>
        {d.conferir.length > 0 && <Apoio>Mudou mais que o comum desde a última: confira {d.conferir.map(c => c.n.toLowerCase()).join(', ')}. Se estiver errada, corrija na tela da medida.</Apoio>}
      </Secao>
    </>
  );
}

/** Como medir: o ponto e o jeito, de uma medida. */
export function FolhaComoMedir({ ctx, f }) {
  return (
    <Folha titulo={f.titulo} sub={f.onde} aoFechar={() => ctx.fechaFolha()}>
      <p class="v3-como">{f.como}</p>
      <Apoio>{f.regra}</Apoio>
      <Acoes><Botao onClick={() => ctx.fechaFolha()}>Entendi</Botao></Acoes>
    </Folha>
  );
}
