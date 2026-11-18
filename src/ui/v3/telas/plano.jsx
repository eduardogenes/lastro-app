// O PLANO no visual novo (Fase 4): o que espera decisão, os treinos, a semana
// de treino, a comida do nutricionista (quantidade pela régua), os alimentos e
// as compras. Protótipos: docs/redesign-3/prototipos/hoje.html ("Plano") e
// resto.html ("comida", "alimentos", "compras"). Dados: `ctx.planoV3`,
// `ctx.refeicaoDoPlanoV3`, `ctx.comprasV3`, `ctx.alimentosFiltrados`.

import { useState } from 'preact/hooks';
import { ic } from '../icones.jsx';
import { Acoes, Apoio, Botao, Cabecalho, Folha, Linha, Saida, Secao, Seletor, Vazio } from '../base.jsx';
import { Regua } from '../regua.jsx';

export function PlanoV3({ ctx }) {
  const p = ctx.planoV3();
  const [tipo, setTipo] = useState('treino');
  const refs = p.refeicoes.filter(r => tipo === 'treino' || r.quando !== 'treino');
  const total = tipo === 'treino' ? p.resumo.treino : p.resumo.descanso;
  return (
    <div class="v3">
      <Cabecalho titulo="Plano" raiz nota={p.treinos.length + ' treinos · ' + p.resumo.refeicoes + ' refeições'} />
      {p.esperam.length > 0 && (
        <Secao titulo="Esperando você" nota="vira regra?">
          {p.esperam.map(g => g.mudancas.map((m, i) => (
            <div key={g.sid + '-' + i} class="v3-decide">
              <p>{m.txt}</p>
              <small>{g.vence}{m.impacto ? ' · ' + m.impacto : ''}</small>
              <div class="v3-acoes">
                <Botao tipo="contorno" data-a={'espera-hoje-' + i} onClick={() => ctx.respondeMudanca(g.sid, i, false)}>Só daquele dia</Botao>
                <Botao tipo="contorno" data-a={'espera-sempre-' + i} onClick={() => ctx.respondeMudanca(g.sid, i, true)}>{g.entra}</Botao>
              </div>
            </div>
          )))}
        </Secao>
      )}
      <Secao titulo="Treinos" nota="toque para editar">
        <div class="v3-tiles">
          {p.treinos.map(t => (
            <div key={t.d} class="v3-tile">
              <button class="v3-tile-b" data-a={'plano-treino-' + t.d} onClick={() => ctx.acoesPrograma.abreDia(t.d)}>
                <span class="v3-tile-l">{t.d}</span>
                <span class="v3-lin-t"><b>{t.nome}</b><span>{t.aberto ? 'aula' : t.series + ' séries'}{t.hoje ? ' · hoje' : ''}</span></span>
              </button>
            </div>
          ))}
        </div>
        <div>
          <Linha titulo="Programa inteiro" apoio="ordem, diferenças do treinador, histórico" data-a="plano-programa" aoTocar={ctx.abrePrograma} />
          <Linha titulo="Progressão" apoio="prontos para subir, ganhando repetição, parados" data-a="plano-progressao" aoTocar={() => ctx.abreProgressao()} />
          <Linha titulo="Revisão do treinador" apoio="colar o texto novo" data-a="plano-revisao" aoTocar={ctx.abreRevisao} />
        </div>
      </Secao>
      <Secao titulo="Dias de treino" nota="toque para trocar">
        <div class="v3-semana-c">
          {p.cadencia.map(d => (
            <button key={d.i} class={'v3-dia' + (d.treino ? ' t' : '')} aria-pressed={d.treino ? 'true' : 'false'} data-a={'cadencia-' + d.i}
                    aria-label={d.rotulo + ': ' + (d.treino ? 'treino' : 'folga')} onClick={() => ctx.alternaCadencia(d.i)}>
              <small>{d.rotulo}</small>{d.treino ? 'treino' : 'folga'}
            </button>
          ))}
        </div>
        <Apoio>Diz só em que dias você costuma treinar, e serve para prever a semana e as compras. Qual treino vem é sempre a rotação.</Apoio>
      </Secao>
      {!ctx.moduloLigado('comida') ? (
        <Secao titulo="Comida" nota="desligada">
          <Apoio>A comida está desligada: o app mostra só o treino. O plano continua guardado.</Apoio>
          <Acoes><Botao tipo="contorno" data-a="plano-liga-comida" onClick={() => ctx.ligaModulo('comida', true)}>Ligar a comida</Botao></Acoes>
        </Secao>
      ) : (
      <Secao titulo="Comida" nota="do nutricionista">
        <Seletor rotulo="Tipo de dia" valor={tipo} aoMudar={setTipo} opcoes={[{ k: 'treino', t: 'Dia de treino' }, { k: 'descanso', t: 'Dia de descanso' }]} />
        <div class="v3-gigante v3-n v3-gigante-m">{total.kcal}<small>kcal · {total.macros}</small></div>
        <div>
          {refs.map(r => (
            <Linha key={r.id} titulo={r.n} apoio={r.t + ' · ' + (r.itens || []).length + ' itens' + (r.quando === 'treino' ? ' · só em dia de treino' : '')}
                   valor={String(r.kcal)} unidade="kcal" data-a={'plano-ref-' + r.id} aoTocar={() => ctx.abreFolha({ k: 'refeicaoDoPlano', id: r.id })} />
          ))}
        </div>
        <Apoio>Ajuste em vigor: {p.resumo.ajuste}.</Apoio>
        <Acoes>
          <Botao tipo="contorno" data-a="plano-alimentos" onClick={() => ctx.abreFolha({ k: 'alimentos' })}>Alimentos</Botao>
          <Botao tipo="contorno" data-a="plano-compras" onClick={() => ctx.abreFolha({ k: 'compras' })}>Compras</Botao>
        </Acoes>
        <Saida onClick={ctx.novaRefeicao}>{'+'} Refeição</Saida>
      </Secao>
      )}
      <Secao>
        <Linha titulo="Ajustes" apoio="conta, cópia de segurança, lembretes" data-a="plano-ajustes" aoTocar={ctx.abreAjustes} />
      </Secao>
      <div class="v3-fim-da-tela" />
    </div>
  );
}

/** Uma refeição do plano: tocar numa quantidade abre a régua dela. */
export function FolhaRefeicaoDoPlano({ ctx, f }) {
  const r = ctx.refeicaoDoPlanoV3(f.id);
  const [q, setQ] = useState(null);
  if (!r) return null;
  const it = f.item != null ? r.itens[f.item] : null;
  const valor = q != null ? q : it ? it.q : 0;
  return (
    <Folha titulo={r.n} sub={r.t + ' · ' + r.kcal + ' kcal'} aoFechar={() => ctx.fechaFolha()}>
      {it ? (
        <>
          <h3 class="v3-bio-n">{it.n}</h3>
          <div class="v3-gigante v3-n v3-gigante-m">{Math.round(valor)}<small>{it.u}</small></div>
          <Regua min={0} max={Math.max(300, Math.ceil(it.q * 2 / 50) * 50)} passo={5} cada={50} largura={10} valor={valor} aoMudar={setQ} rotulo={it.n + ' em ' + it.u} />
          <Acoes><Botao data-a="plano-qtd-ok" disabled={Math.round(valor) === it.q}
                        onClick={() => { ctx.setQuantidade(r.id, it.i, valor); setQ(null); ctx.mudaFolha({ item: null }); }}>Guardar {Math.round(valor)} {it.u}</Botao></Acoes>
          <Saida onClick={() => { setQ(null); ctx.mudaFolha({ item: null }); }}>Voltar à refeição</Saida>
        </>
      ) : (
        <>
          <div class="v3-itens">
            {r.itens.map(x => (
              <div key={x.i} class="v3-item">
                <span class="v3-lin-t"><b>{x.n}</b><span>{x.kcal != null ? x.kcal + ' kcal' : ''}{x.alta ? ' · só em dia de alta demanda' : ''}</span></span>
                <button class="v3-qtd v3-n" data-a={'plano-item-' + x.i} onClick={() => ctx.mudaFolha({ item: x.i })}>{x.q} {x.u}</button>
              </div>
            ))}
          </div>
          <Apoio>A mudança vale daqui para a frente. O que você já marcou em dias passados não muda.</Apoio>
          <Saida onClick={() => { ctx.fechaFolha(); ctx.editaRefeicao(r.id); }}>Trocar ou tirar alimentos</Saida>
        </>
      )}
    </Folha>
  );
}

/** Os alimentos: buscar, e criar um novo com o rótulo. */
export function FolhaAlimentos({ ctx }) {
  const [busca, setBusca] = useState('');
  const l = ctx.alimentosFiltrados(busca);
  return (
    <Folha titulo="Alimentos" sub={l.length + (l.length === 1 ? ' alimento' : ' alimentos')} aoFechar={() => ctx.fechaFolha()}>
      <input id="alimentos-busca" class="v3-campo" value={busca} placeholder="Buscar alimento" aria-label="Buscar alimento" autocomplete="off"
             onInput={e => setBusca(e.currentTarget.value)} />
      <div>
        {l.slice(0, 60).map(a => (
          <Linha key={a.id} titulo={a.n} apoio={'P ' + a.p + ' · C ' + a.c + ' · G ' + a.g + ' por 100 ' + a.u} valor={String(a.kcal)} unidade="kcal"
                 aoTocar={() => { ctx.fechaFolha(); ctx.editaAlimento(a.id); }} />
        ))}
        {!l.length && <Vazio titulo="Nada com esse nome"><p>Dá para criar o alimento com as calorias e os macros do rótulo.</p></Vazio>}
      </div>
      <Acoes><Botao tipo="contorno" cheio data-a="alimento-novo" onClick={() => { ctx.fechaFolha(); ctx.novoAlimento(); }}>{ic.mais} Novo alimento</Botao></Acoes>
    </Folha>
  );
}

/** As compras: o plano até a próxima compra, marcar o comprado. */
export function FolhaCompras({ ctx }) {
  const c = ctx.comprasV3();
  const feitas = c.linhas.filter(l => c.comprado[l.f]).length;
  return (
    <Folha titulo="Compras" sub={feitas + ' de ' + c.linhas.length + ' · para ' + c.dias + ' dias (' + c.previsao.treino + ' de treino)'} aoFechar={() => ctx.fechaFolha()}>
      <Seletor rotulo="Até a próxima compra" valor={String(c.dias)} aoMudar={k => ctx.setHorizonteCompras(k)}
               opcoes={[{ k: '7', t: '7 dias' }, { k: '14', t: '14 dias' }, { k: '30', t: '30 dias' }]} />
      <div class="v3-compras">
        {c.linhas.map(l => (
          <button key={l.f} class={'v3-compra' + (c.comprado[l.f] ? ' ok' : '')} aria-pressed={c.comprado[l.f] ? 'true' : 'false'}
                  data-a={'compra-' + l.f} onClick={() => ctx.marcaCompra(l.f)}>
            <span class="ck">{ic.ok}</span><span class="v3-lin-t"><b>{l.n}</b>{l.procedencia && <span>{l.procedencia}</span>}</span><span class="v3-n">{l.txt}</span>
          </button>
        ))}
        {!c.linhas.length && <Vazio titulo="Nada a comprar"><p>O plano está vazio.</p></Vazio>}
      </div>
      {c.foraDaPrevisao.length > 0 && <Apoio>Dias de alta demanda não entram nesta previsão: {c.foraDaPrevisao.join(', ')}.</Apoio>}
    </Folha>
  );
}
