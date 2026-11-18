// O Corpo para CONSULTAR, no visual novo (Fase 2): o peso, uma medida (e a
// bioimpedância), tudo na mesma data, a correção de um número e a leitura nova
// da bioimpedância, um número por passo. Protótipo: docs/redesign-3/
// prototipos/corpo.html. Dados: `ctx.pesoV3`, `ctx.medidaV3`,
// `ctx.naMesmaDataV3` e `ctx.camposDaBioV3`, em src/main.jsx.

import { useState } from 'preact/hooks';
import { ic } from '../icones.jsx';
import { Acoes, Apoio, Botao, Cabecalho, Folha, Linha, Saida, Secao, Segmentos, Seletor, Selo, Vazio } from '../base.jsx';
import { Grafico } from '../grafico.jsx';
import { Regua } from '../regua.jsx';
import { Foto } from '../foto.jsx';

const virgula = n => (Math.round(n * 10) / 10).toFixed(1).replace('.', ',');
const duas = n => (Math.round(n * 100) / 100).toFixed(2).replace('.', ',');
/** O nome do gráfico diz a conclusão: "de 74,3 para 77,6 kg em 8 semanas". */
const conclusao = (nome, serie, u) => {
  if (!serie || serie.length < 2) return nome;
  const a = serie[0], b = serie[serie.length - 1];
  const sem = Math.max(1, Math.round((b.t - a.t) / (7 * 864e5)));
  return nome + ', de ' + virgula(a.v) + ' para ' + virgula(b.v) + ' ' + u + ' em ' + sem + (sem === 1 ? ' semana' : ' semanas');
};
const TOM = { 'no alvo': undefined, 'abaixo do alvo': 'quieto', 'acima do alvo': 'atencao' };

// ---------- peso ----------

export function PesoV3({ ctx }) {
  const p = ctx.pesoV3();
  const [todas, setTodas] = useState(false);
  if (!p) return null;
  const corrige = x => ctx.abreFolha({ k: 'corrigeMarca', marca: 'peso', t: x.t, data: x.data + ' às ' + x.hora, u: 'kg', valor: parseFloat(x.valor.replace(',', '.')) });
  return (
    <>
      <Cabecalho titulo="Peso" nota={p.meta} aoVoltar={ctx.fechaEvolucao} />
      {p.vazio ? <div class="v3-pad"><Vazio titulo="Nenhuma pesagem ainda"><p>Pese de manhã, em jejum, 3 a 4 vezes por semana. A régua fica no topo do Corpo.</p></Vazio></div> : (
        <>
          <div class="v3-pad">
            <div class="v3-gigante v3-n v3-gigante-m">{p.atual}<small>kg{p.variacao ? ' · ' + p.variacao : ''}</small></div>
            <Seletor rotulo="Quanto tempo" valor={p.faixa} aoMudar={ctx.setFaixaDoPeso}
                     opcoes={[{ k: '4', t: '4 semanas' }, { k: 'tudo', t: 'Tudo' }]} />
            <Grafico linha={p.semanas} pontos={p.pontos} alvo={p.faixa === 'tudo' ? p.alvo : null} de={p.de} ate={p.ate}
                     altura={150} bolas rotulo={conclusao('Média semanal do peso', p.semanas, 'kg')} />
            <div class="v3-leg">
              <span><i class="l" />média da semana</span><span><i class="p" />pesagem do dia</span>
              {p.faixa === 'tudo' && p.alvo && <span><i class="a" />alvo: +{duas(p.alvo.min)} a +{duas(p.alvo.max)} por semana</span>}
            </div>
          </div>
          <Secao titulo="Por semana" nota="kg em relação à anterior">
            <div>
              {p.taxas.map(t => (
                <div key={t.w} class="v3-taxa">
                  <span class="v3-lin-t"><b>{t.intervalo}</b><span>{t.nota}</span></span>
                  <b class="v3-taxa-v v3-n">{t.valor}</b>
                  <Selo tom={t.classe.indexOf('sem taxa') === 0 ? 'quieto' : TOM[t.classe]}>{t.classe.indexOf('sem taxa') === 0 ? 'sem taxa' : t.classe}</Selo>
                </div>
              ))}
            </div>
            <Apoio>{p.frase}</Apoio>
          </Secao>
          <Secao titulo="Pesagens" nota="toque para corrigir">
            <div>
              {(todas ? p.pesagens : p.pesagens.slice(0, 5)).map(x => (
                <Linha key={x.t} titulo={x.data} apoio={x.hora} valor={x.valor} data-a={'pesagem-' + x.t} aoTocar={() => corrige(x)} />
              ))}
            </div>
            {!todas && p.pesagens.length > 5 && <Saida onClick={() => setTodas(true)}>ver as {p.pesagens.length}</Saida>}
          </Secao>
        </>
      )}
      <div class="v3-fim-curto" />
    </>
  );
}

/** Corrigir um número: a régua no valor dele, e apagar como saída. */
export function FolhaCorrigeMarca({ ctx, f }) {
  const [v, setV] = useState(f.valor);
  const passo = f.u === 'mm' ? 0.5 : 0.1;
  return (
    <Folha titulo={(f.marca === 'peso' ? 'Pesagem de ' : 'Medida de ') + f.data}
           sub={f.marca === 'peso' ? 'Digitou errado? Arraste até o número certo. A média da semana se refaz sozinha.' : 'Digitou errado? Arraste até o número certo. O dia e a hora ficam.'}
           aoFechar={() => ctx.fechaFolha()}>
      <div class="v3-gigante v3-n">{virgula(v)}<small>{f.u}</small></div>
      <Regua min={Math.max(0.5, Math.floor(f.valor - 15))} max={Math.ceil(f.valor + 15)} passo={passo} cada={f.u === 'mm' ? 5 : 1}
             valor={v} aoMudar={setV} rotulo={(f.marca === 'peso' ? 'peso' : 'medida') + ' em ' + f.u} />
      <Acoes>
        <Botao data-a="corrige-ok"
               onClick={() => { ctx.fechaFolha(); if (Math.abs(v - f.valor) >= 0.001) ctx.corrigeMarca(f.marca, f.t, v); }}>{ic.ok} Guardar</Botao>
      </Acoes>
      <Saida data-a="corrige-apaga" onClick={() => { ctx.fechaFolha(); ctx.apagaMedida(f.marca, f.t); }}>{f.marca === 'peso' ? 'Apagar esta pesagem' : 'Apagar esta medida'}</Saida>
    </Folha>
  );
}

// ---------- uma medida (e a bioimpedância) ----------

export function MedidaV3({ ctx }) {
  const d = ctx.medidaV3();
  if (!d) return null;
  if (d.k === 'bio') return <BioV3 ctx={ctx} d={d} />;
  const serie = d.serie;
  const de = serie.length ? serie[0].t - 3 * 86400000 : 0, ate = serie.length ? Math.max(serie[serie.length - 1].t, Date.now()) : 1;
  const corrige = x => ctx.abreFolha({ k: 'corrigeMarca', marca: d.k, t: x.t, data: x.data, u: d.u, valor: parseFloat(x.valor.replace(',', '.')) });
  return (
    <>
      <Cabecalho titulo={d.n} nota={d.ponto} aoVoltar={ctx.fechaMedida} />
      <div class="v3-pad">
        {serie.length
          ? <div class="v3-gigante v3-n v3-gigante-m">{d.atual.split(' ')[0]}<small>{d.u}{d.variacao ? ' · ' + d.variacao : ''}</small></div>
          : <Vazio titulo="Ainda sem medida"><p>Com duas medidas aparece a linha, com as sessões de fotos marcadas embaixo.</p></Vazio>}
        {serie.length > 1 && (
          <>
            <Grafico linha={serie} marcas={d.fotosNoTempo} de={de} ate={ate} altura={110} bolas
                     rotulo={conclusao(d.n, serie, d.u || '')} />
            <div class="v3-leg"><span><i class="m" />sessão de fotos</span></div>
          </>
        )}
        <Acoes><Botao data-a="medida-medir" onClick={() => ctx.abreMedirAgora(d.k)}>Medir agora {ic.seta}</Botao></Acoes>
      </div>
      <Secao titulo="Como medir">
        <p class="v3-como"><b>{d.ponto}.</b> {d.como}</p>
        <Apoio>{d.regra}</Apoio>
      </Secao>
      {d.historico.length > 0 && (
        <Secao titulo="Histórico" nota="toque para corrigir ou apagar">
          <div>
            {d.historico.map(x => (
              <Linha key={x.t} titulo={x.data} apoio={x.hora + (x.mudou ? ' · ponto diferente: ' + x.onde : '')} valor={x.valor}
                     data-a={'historico-' + x.t} aoTocar={() => corrige(x)} />
            ))}
          </div>
        </Secao>
      )}
      <div class="v3-fim-curto" />
    </>
  );
}

function BioV3({ ctx, d }) {
  const comDado = d.series.filter(s => s.pontos.length);
  return (
    <>
      <Cabecalho titulo="Bioimpedância" nota={d.historico.length + (d.historico.length === 1 ? ' leitura' : ' leituras')} aoVoltar={ctx.fechaMedida} />
      {!comDado.length && <div class="v3-pad"><Vazio titulo="Nenhuma leitura ainda"><p>Uma por mês, na mesma balança, de manhã e em jejum.</p></Vazio></div>}
      {comDado.length > 0 && (
        <Secao>
          <div class="v3-quadros" style="--v3-col:2">
            {comDado.map(s => {
              const a = s.pontos[s.pontos.length - 2], u = s.pontos[s.pontos.length - 1];
              const dv = a ? Math.round((u.v - a.v) * 10) / 10 : null;
              return (
                <div key={s.k} class="v3-quadro">
                  <b>{s.ultima}</b>{s.n}{dv != null ? ' · ' + (dv > 0 ? '+' : '') + virgula(dv) : ''}
                  {s.pontos.length > 1 && <Grafico linha={s.pontos} de={s.pontos[0].t} ate={u.t} altura={40} rotulo={'Evolução: ' + s.n} />}
                </div>
              );
            })}
          </div>
        </Secao>
      )}
      <Secao>
        <Acoes><Botao data-a="bio-nova" onClick={ctx.abreBio}>Nova leitura</Botao></Acoes>
      </Secao>
      {d.historico.length > 0 && (
        <Secao titulo="Leituras" nota="a mais nova primeiro">
          <div>
            {d.historico.map(x => <Linha key={x.t} titulo={x.data + ' · ' + x.hora} apoio={x.valores}
                                         data-a={'bio-leitura-' + x.t} aoTocar={() => ctx.apagaLeituraBio(x.t)} />)}
          </div>
          <Apoio>Tocar numa leitura pergunta se é para apagá-la.</Apoio>
        </Secao>
      )}
      <div class="v3-fim-curto" />
    </>
  );
}

/** A leitura nova da bioimpedância: um número por passo, pela régua. */
export function FolhaBioV3({ ctx, f }) {
  const campos = ctx.camposDaBioV3();
  const i = f.i || 0;
  const valores = f.valores || {};
  const c = campos[i];
  const v = valores[c.k] != null ? valores[c.k] : c.partida;
  const muda = n => ctx.mudaFolha({ valores: Object.assign({}, valores, { [c.k]: n }) });
  const ultimo = i === campos.length - 1;
  const segue = (pular) => {
    const novos = Object.assign({}, valores);
    if (pular) delete novos[c.k]; else novos[c.k] = v;
    if (!ultimo) { ctx.mudaFolha({ i: i + 1, valores: novos }); return; }
    ctx.registraBioDaFolha(novos, Date.now(), false);
  };
  return (
    <Folha titulo="Nova leitura" sub={'Os números da balança, um por vez · ' + (i + 1) + ' de ' + campos.length} aoFechar={() => ctx.fechaFolha()}>
      <Segmentos total={campos.length} feitos={i} />
      <h3 class="v3-bio-n">{c.rotulo}</h3>
      {c.dica && <Apoio>{c.dica}</Apoio>}
      <div class="v3-gigante v3-n v3-gigante-m">{virgula(v)}<small>{c.u}</small></div>
      <Regua key={c.k} min={Math.max(0.5, Math.floor(c.partida - 25))} max={Math.ceil(c.partida + 25)} passo={0.1} cada={1}
             valor={v} aoMudar={muda} rotulo={c.rotulo + ' em ' + c.u} />
      <Apoio>{c.ultima ? 'da última vez: ' + c.ultima : 'primeira leitura'}</Apoio>
      <Acoes><Botao data-a="bio-segue" onClick={() => segue(false)}>{ultimo ? 'Guardar a leitura' : 'Próximo'} {ultimo ? null : ic.seta}</Botao></Acoes>
      {c.opcional && <Saida data-a="bio-pula" onClick={() => segue(true)}>{ultimo ? 'Guardar sem este' : 'Pular este'}</Saida>}
    </Folha>
  );
}

// ---------- tudo na mesma data ----------

export function NaMesmaData({ ctx }) {
  const d = ctx.naMesmaDataV3();
  if (!d) return null;
  const DIA = 86400000;
  const n = Math.max(0, Math.round((d.fim - d.inicio) / DIA));
  const i = Math.max(0, Math.min(n, Math.round((d.t - d.inicio) / DIA)));
  return (
    <>
      <Cabecalho titulo="Na mesma data" aoVoltar={ctx.fechaNaMesmaData} />
      <div class="v3-pad">
        <h2 class="v3-data-g">{d.data}</h2>
        <input class="v3-faixa-r" type="range" min="0" max={n} step="1" value={i} data-a="mesma-data"
               aria-label="Data" aria-valuetext={d.data} onInput={e => ctx.setDiaNaMesmaData(d.inicio + Number(e.currentTarget.value) * DIA)} />
        <Apoio>Arraste para escolher o dia. Cada número é o último até ele, com a data em que foi medido.</Apoio>
      </div>
      {d.sessao && (
        <Secao titulo="Fotos" nota={'sessão de ' + d.sessao.txt}>
          <div class="v3-fita">{d.sessao.fotos.map(f => <Foto key={f.id} url={f.url} enq={f.enq} vazio="" />)}</div>
        </Secao>
      )}
      <Secao titulo="Medidas">
        {d.medidas.length
          ? <div>{d.medidas.map(m => <Linha key={m.k} titulo={m.n} apoio={m.quando} valor={m.valor} unidade={m.u} />)}</div>
          : <Apoio>Nada medido até este dia.</Apoio>}
      </Secao>
      <div class="v3-fim-curto" />
    </>
  );
}
