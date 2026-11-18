// A SESSÃO DE FOTOS no visual novo: antes, durante (quando a câmera fecha no
// meio) e o fim. A câmera é outra tela (`camera.jsx`).
// Protótipo: docs/redesign-3/prototipos/fotos.html ("Nova sessão", "Para quem
// vai fotografar" e o fim). Decisões da captura: docs/redesign-3/02-captura.md.

import { ic } from '../icones.jsx';
import { Acoes, Apoio, Botao, Cabecalho, Bloco, Faixa, Folha, Linha, Saida, Secao, Segmentos, Selo } from '../base.jsx';
import { Foto } from '../foto.jsx';

const QUEM = [
  { k: 'sempre', icone: ic.dois, t: 'A pessoa de sempre', a: 'Ela já conhece. Vai direto para a câmera.' },
  { k: 'novo', icone: ic.um, t: 'Alguém que nunca fez', a: 'O app explica em três passos, na tela, para ela.' },
  { k: 'sozinho', icone: ic.tripe, t: 'Eu, sozinho', a: 'Celular apoiado, contagem e voz. Sem tocar na tela.' }
];
const MUDA = [
  { k: 'lugar', igual: 'mesmo lugar', outro: 'outro lugar' },
  { k: 'luz', igual: 'mesma luz', outro: 'outra luz' },
  { k: 'roupa', igual: 'mesma roupa', outro: 'outra roupa' }
];

/** O destino `protocolo`: a nova sessão, a sessão pela metade ou o fim. */
export function SessaoDeFotos({ ctx }) {
  const s = ctx.sessaoDeFotos();
  if (!s) return null;
  if (s.passo === 'montagem') return <NovaSessao ctx={ctx} s={s} />;
  const fim = ctx.fimDaSessaoV3();
  if (fim) return <Fim ctx={ctx} fim={fim} />;
  return <PelaMetade ctx={ctx} s={s} />;
}

function NovaSessao({ ctx, s }) {
  const n = ctx.novaSessaoV3();
  const muda = n.muda;
  const troca = k => ctx.setMudaDaSessao(muda.indexOf(k) >= 0 ? muda.filter(x => x !== k) : muda.concat([k]));
  const preparo = () => ctx.abreFolha({ k: 'preparo', itens: s.montagem.itens, ordem: s.montagem.ordem });
  return (
    <>
      <Cabecalho titulo="Nova sessão" nota={'~4 min · ' + n.total + ' fotos'} aoVoltar={ctx.fechaProtocolo} />
      <Secao titulo="Quem vai segurar o celular?">
        {QUEM.map(q => (
          <button key={q.k} class="v3-esc" aria-pressed={n.quem === q.k ? 'true' : 'false'}
                  data-a={'quem-' + q.k} onClick={() => ctx.setQuemSegura(q.k)}>
            <span class="v3-esc-o">{q.icone}</span>
            <span class="v3-esc-t"><b>{q.t}</b><span>{q.a}</span></span>
          </button>
        ))}
      </Secao>
      {n.temAnterior && (
        <Secao titulo="Tudo como da última vez?" nota="toque no que mudou">
          <div class="v3-cond">
            {MUDA.map(m => {
              const mudou = muda.indexOf(m.k) >= 0;
              return (
                <button key={m.k} aria-pressed={mudou ? 'true' : 'false'} data-a={'muda-' + m.k} onClick={() => troca(m.k)}>
                  {mudou ? ic.x : ic.ok}{mudou ? m.outro : m.igual}
                </button>
              );
            })}
          </div>
          <Apoio>
            {muda.length
              ? 'A sessão continua valendo. O que mudou fica escrito nela e aparece ao comparar.'
              : 'Nada mudou: a sessão entra na comparação sem ressalva. A lente o app trava na 1×.'}
          </Apoio>
        </Secao>
      )}
      <Secao>
        <Acoes>
          {n.quem === 'novo'
            ? <Botao data-a="sessao-passar" onClick={ctx.abrePassosDasFotos}>Passar o celular {ic.seta}</Botao>
            : <Botao data-a="sessao-camera" onClick={ctx.vaiParaACamera}>Abrir a câmera {ic.seta}</Botao>}
        </Acoes>
        <Saida data-a="sessao-preparo" onClick={preparo}>{n.temAnterior ? 'Ver o preparo completo' : 'Primeira sessão: ver o preparo'}</Saida>
      </Secao>
    </>
  );
}

/** O destino `passos`: para quem nunca fotografou, antes da câmera. */
export function PassosDasFotos({ ctx }) {
  const n = ctx.novaSessaoV3();
  if (!n) return null;
  return (
    <>
      <Cabecalho titulo="Para quem vai fotografar" aoVoltar={ctx.fechaPassosDasFotos} />
      <section class="v3-cartao">
        <h1 class="v3-bloco-t m" tabindex="-1">São {n.total} fotos e uns 4 minutos.</h1>
        <p class="v3-bloco-a">Você não precisa saber de nada. A tela diz o que acertar, e a voz fala com quem está sendo fotografado.</p>
      </section>
      <Secao>
        <div class="v3-passos">
          <div><i>1</i><div><b>Sente na cadeira marcada</b><span>Cotovelos apoiados nos joelhos. É isso que deixa o celular parado.</span></div></div>
          <div><i>2</i><div><b>Acerte três coisas, uma vez</b><span>Nível, altura e distância. Cada uma fica verde quando está certa.</span></div></div>
          <div><i>3</i><div><b>Depois, não saia do lugar</b><span>É um toque por foto. Se uma sair torta, o app avisa e você repete.</span></div></div>
        </div>
        <Acoes><Botao data-a="passos-entendi" onClick={ctx.vaiParaACamera}>Entendi {ic.seta}</Botao></Acoes>
      </Secao>
    </>
  );
}

/** A câmera fechou no meio: o que falta, e os dois caminhos para tirar. */
function PelaMetade({ ctx, s }) {
  const feitas = s.pontos.filter(p => p.feita).length;
  return (
    <>
      <Cabecalho titulo="Sessão de hoje" nota={feitas + ' de ' + s.total} aoVoltar={ctx.fechaProtocolo} />
      <Secao>
        <Segmentos total={s.total} feitos={feitas} rotulo={feitas + ' de ' + s.total + ' fotos'} />
        {s.naoGuardada && (
          <Faixa falha acao="Tentar de novo" aoAgir={ctx.tentaFotoDaPose}>{s.naoGuardada.titulo}</Faixa>
        )}
        <Acoes>
          {s.temCamera
            ? <Botao data-a="sessao-camera" onClick={ctx.vaiParaACamera}>{ic.camera} {feitas ? 'Continuar' : 'Abrir a câmera'}</Botao>
            : <label class="v3-btn p">{ic.camera} Tirar: {s.pose.n.toLowerCase()}
                <input type="file" accept="image/*" capture="environment" hidden onChange={e => ctx.tiraFotoDoCorpo(e.currentTarget)} />
              </label>}
        </Acoes>
        {s.temCamera && (
          <label class="v3-saida">Usar a câmera do sistema nesta pose
            <input type="file" accept="image/*" capture="environment" hidden onChange={e => ctx.tiraFotoDoCorpo(e.currentTarget)} />
          </label>
        )}
        <Apoio>A sessão fica salva como está. A câmera do sistema não mostra a foto anterior por cima; a do app, sim.</Apoio>
      </Secao>
      <Secao titulo="As poses" nota="toque para escolher">
        <div>
          {s.pontos.map((p, i) => (
            <Linha key={p.id} marca={i + 1} titulo={p.n} quieta={p.feita && !p.atual}
                   apoio={p.naoGuardada ? 'não guardada' : p.feita ? 'feita' : p.adiada ? 'volta no fim' : 'falta'}
                   valor={p.atual ? <Selo tom="agora">agora</Selo> : null}
                   aoTocar={() => ctx.vaiParaPose(p.id)} />
          ))}
        </div>
      </Secao>
    </>
  );
}

function Fim({ ctx, fim }) {
  const vaiComparar = () => { ctx.fechaProtocolo(); ctx.abreComparar(); };
  return (
    <>
      <Bloco cor={fim.fora ? 'atencao' : 'feito'} chave="fim-fotos" medio
             linha0={<><span>sessão de hoje</span>{fim.tempo && <span class="v3-n">{fim.tempo}</span>}</>}
             quando="guardada" titulo={fim.titulo}
             apoio={[
               fim.muda || (fim.noPadrao ? 'Mesmo lugar, mesma luz, mesma roupa, lente 1×.' : null),
               fim.fora ? 'As marcadas saíram fora do padrão: valem, e aparecem com o aviso ao comparar.' : null,
               fim.sugeridas ? (fim.sugeridas === 1 ? 'Uma foto tem alinhamento sugerido' : fim.sugeridas + ' fotos têm alinhamento sugerido') + ': aceite na galeria.' : null
             ].filter(Boolean).join(' ')}>
        <Acoes>
          <Botao data-a="fim-medir" onClick={ctx.medirDepoisDasFotos}>Medir agora</Botao>
          {fim.comparar && <Botao tipo="contorno" data-a="fim-comparar" onClick={vaiComparar}>Comparar</Botao>}
        </Acoes>
        <Saida data-a="fim-fechar" onClick={ctx.fechaProtocolo}>Fechar</Saida>
      </Bloco>
      <Secao titulo={'As ' + fim.fotos.length} nota="toque para refazer uma">
        <div class="v3-grade">
          {fim.fotos.map(f => (
            <button key={f.id} data-a={'fim-foto-' + f.id} aria-label={'Refazer: ' + f.n + (f.fora ? ', fora do padrão' : '')}
                    onClick={() => ctx.refazPoseDaSessao(f.id)}>
              <Foto url={f.url} enq={f.enq} alt={f.n} marca={f.fora} vazio="buscando…" />
            </button>
          ))}
        </div>
      </Secao>
      <Secao titulo="A cópia">
        <Apoio>{fim.subida}</Apoio>
        {fim.peso && <Apoio>Peso desta sessão: {fim.peso}.</Apoio>}
        {fim.comparar && <Apoio>{fim.comparar}: a mesma pose, o par mais longo.</Apoio>}
        <Apoio>{fim.proxima}</Apoio>
      </Secao>
    </>
  );
}

/** A folha do preparo: o que fica igual entre uma sessão e outra. */
export function FolhaPreparo({ ctx, f }) {
  return (
    <Folha titulo="O preparo" sub="O que fica igual de uma sessão para outra. É isso que torna duas datas comparáveis." aoFechar={() => ctx.fechaFolha()}>
      <div class="v3-preparo">
        {(f.itens || []).map(it => (
          <div key={it.k}><b>{it.rotulo} <em>· {it.valor}</em></b><p>{it.nota}</p></div>
        ))}
      </div>
      {f.ordem && <Apoio>A ordem das poses: {f.ordem}.</Apoio>}
      <Acoes><Botao onClick={() => ctx.fechaFolha()}>Entendi</Botao></Acoes>
    </Folha>
  );
}
