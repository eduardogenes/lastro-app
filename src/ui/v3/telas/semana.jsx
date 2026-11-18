// A SEMANA no visual novo (Fase 4): o que fazer com a comida (o veredito do
// nutricionista e o que a regra olha) e as séries da semana por região do
// corpo, separando as feitas das que ainda vêm. Protótipo: docs/redesign-3/
// prototipos/hoje.html ("Semana"). Dados: `ctx.semanaV3`.

import { ic } from '../icones.jsx';
import { Acoes, Apoio, Bloco, Botao, Cabecalho, Folha, Linha, Quadros, Saida, Secao, Vazio } from '../base.jsx';

export function SemanaV3({ ctx }) {
  const s = ctx.semanaV3();
  const v = s.veredito;
  const precisaDias = (v.portoes || []).some(g => g.k === 'adesao' && !g.ok);
  const comida = ctx.moduloLigado('comida');
  const feitas = s.regioes.reduce((n, r) => n + r.feitas, 0);
  const vem = s.regioes.reduce((n, r) => n + r.vem, 0);
  return (
    <div class="v3">
      {!comida && (
        <Bloco cor="semana" chave="semana-treino" linha0={<><span>Semana</span><span>o treino</span></>}
               titulo={feitas + (feitas === 1 ? ' série feita' : ' séries feitas')}
               apoio={vem ? 'E ' + vem + ' ainda vêm até domingo, pelos treinos que faltam.' : 'Nada mais previsto até domingo.'} />
      )}
      {comida && <>
      <Bloco cor={v.k === 'mais' ? 'treino' : 'semana'} chave={'semana-' + v.t} linha0={<><span>Semana</span><span>o que fazer com a comida</span></>}
             titulo={v.t} apoio={v.p}>
        <Acoes>
          {v.podeAplicar && v.acaoTxt && <Botao data-a="semana-aplica" onClick={ctx.aplicaAjuste}>{v.acaoTxt.charAt(0).toUpperCase() + v.acaoTxt.slice(1)}</Botao>}
          {precisaDias && <Botao tipo={v.podeAplicar ? 'contorno' : 'principal'} data-a="semana-responder" onClick={ctx.abreResponderDias}>Responder os dias</Botao>}
        </Acoes>
        {v.naoVolta && <p class="v3-bloco-a">{v.naoVolta}</p>}
        {v.podeDesfazer && <Saida data-a="semana-desfaz" onClick={ctx.desfazAjuste}>Desfazer o último ajuste</Saida>}
      </Bloco>
      {v.portoes && (
        <Secao titulo="O que a regra olha">
          <div>
            {v.portoes.map(g => (
              <div key={g.k} class="v3-crit">
                <span class={'g' + (g.ok ? '' : ' n')}>{g.ok ? ic.ok : ic.x}</span>
                <div><b>{g.t}</b><span>{g.d}</span></div>
              </div>
            ))}
          </div>
          {v.promessa && <Apoio>{v.promessa}</Apoio>}
        </Secao>
      )}
      {v.estado && <Secao><Apoio>{v.estado}</Apoio></Secao>}
      </>}
      <Secao titulo="Séries da semana" nota={'dia ' + s.dia + ' de 7' + (s.vemDias.length ? ' · ainda vêm: ' + s.vemDias.join(', ') : '')}>
        <div>
          {s.regioes.map(r => (
            <Linha key={r.regiao} titulo={r.regiao.charAt(0).toUpperCase() + r.regiao.slice(1)}
                   apoio={r.feitas + ' feitas' + (r.vem ? ' · ' + r.vem + ' ainda vêm' : '')}
                   valor={String(r.feitas + r.vem)} unidade="na semana" data-a={'semana-' + r.regiao}
                   aoTocar={() => ctx.abreFolha({ k: 'musculos', regiao: r.regiao })} />
          ))}
        </div>
        <Apoio>"Ainda vêm" são as séries dos treinos que faltam nesta semana, pela rotação e pelos dias de treino.</Apoio>
      </Secao>
      <Secao>
        <Linha titulo="Retrospectiva do bloco" apoio="o que evoluiu e o que ficou parado desde o começo do bloco"
               data-a="semana-retro" aoTocar={ctx.abreRetro} />
      </Secao>
      <div class="v3-fim-da-tela" />
    </div>
  );
}

/** Os músculos de uma região: feitas e as que ainda vêm. */
export function FolhaMusculos({ ctx, f }) {
  const r = ctx.semanaV3().regioes.filter(x => x.regiao === f.regiao)[0];
  if (!r) return null;
  return (
    <Folha titulo={r.regiao.charAt(0).toUpperCase() + r.regiao.slice(1)} sub={r.feitas + ' séries feitas e ' + r.vem + ' que ainda vêm nesta semana.'} aoFechar={() => ctx.fechaFolha()}>
      <div>
        {r.musculos.map(m => (
          <div key={m.g} class="v3-musc">
            <span class="v3-lin-t"><b>{m.g}</b><span>{m.feitas} feitas{m.vem ? ' · ' + m.vem + ' ainda vêm' : ''}</span></span>
            <span class="v3-musc-b" aria-hidden="true">
              <i class="f" style={'flex:' + m.feitas} /><i class="v" style={'flex:' + m.vem} />
            </span>
          </div>
        ))}
      </div>
      <Acoes><Botao onClick={() => ctx.fechaFolha()}>Fechar</Botao></Acoes>
    </Folha>
  );
}

/** Uma linha da retrospectiva: o exercício, de onde saiu e aonde chegou. */
function LinhaDoBloco({ x }) {
  const meta = Array.isArray(x.meta) ? x.meta.join(' · ') : x.meta;
  return <Linha quieta titulo={x.nome} apoio={x.series.filter(Boolean).join(' · ') + (meta ? ' · ' + meta : '')} valor={x.delta} />;
}

/**
 * A RETROSPECTIVA DO BLOCO: olha para trás sem pedir nada. "Parados" não é
 * acusação: carga igual do começo ao fim pode ser o certo (estabilização,
 * deload, exercício novo). Dados: `ctx.retrospectiva`.
 */
export function RetrospectivaV3({ ctx }) {
  const d = ctx.retrospectiva();
  return (
    <>
      <Cabecalho titulo="O bloco" nota={d.meta} aoVoltar={ctx.fechaRetro} />
      <div class="v3-pad">
        <h2 class="v3-pergunta-t">{d.titulo}</h2>
        <Quadros colunas={3} itens={d.stats.map(s => ({ k: s.k, valor: s.valor, rotulo: s.rotulo }))} />
      </div>
      {d.evol.length > 0 && (
        <Secao titulo="O que evoluiu"><div>{d.evol.map((x, i) => <LinhaDoBloco key={i} x={x} />)}</div></Secao>
      )}
      {d.parados.length > 0 && (
        <Secao titulo="Os parados no bloco">
          <div>{d.parados.map((x, i) => <LinhaDoBloco key={i} x={x} />)}</div>
          <Apoio>Mesma carga do começo ao fim, com 3 ou mais sessões. Não quer dizer que esteja errado; quer dizer que vale olhar.</Apoio>
        </Secao>
      )}
      {d.evol.length === 0 && d.parados.length === 0 && (
        <div class="v3-pad"><Vazio titulo="Ainda cedo para comparar"><p>A retrospectiva fica útil a partir de três sessões por exercício no bloco.</p></Vazio></div>
      )}
      {d.dores && (
        <Secao titulo="A dor no bloco"><p class="v3-atencao"><b>{d.dores}.</b> Vale olhar se está concentrada em algum exercício antes de começar o próximo bloco.</p></Secao>
      )}
      {d.deloads && <Secao><Apoio>{d.deloads}</Apoio></Secao>}
      <div class="v3-pad"><Acoes><Botao tipo="contorno" cheio data-a="retro-fecha" onClick={ctx.fechaRetro}>Fechar</Botao></Acoes></div>
      <div class="v3-fim-curto" />
    </>
  );
}
