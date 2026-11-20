// A SEMANA no visual novo (Fase 4): o que fazer com a comida (o veredito do
// nutricionista e o que a regra olha) e as séries da semana por região do
// corpo, separando as feitas das que ainda vêm. Protótipo: docs/redesign-3/
// prototipos/hoje.html ("Semana"). Dados: `ctx.semanaV3`.

import { ic } from '../icones.jsx';
import { Acoes, Apoio, Bloco, Botao, Cabecalho, Folha, Linha, Quadros, Saida, Secao, Vazio } from '../base.jsx';

/**
 * Uma região (ou um músculo) em barra: as feitas em tinta e as que ainda vêm
 * tracejadas, na mesma escala de todas as linhas.
 */
function Barra({ nome, feitas, vem, max, aoTocar, ...resto }) {
  const dentro = <>
    <span class="v3-mus-l"><b>{nome}</b>{' '}<span class="v3-n">{feitas} feitas{vem ? ' · ' + vem + ' ainda vêm' : ''}</span></span>
    <span class="v3-mus-b" aria-hidden="true"><i class="f" style={'width:' + (feitas / max * 100) + '%'} /><i class="v" style={'width:' + (vem / max * 100) + '%'} /></span>
  </>;
  return aoTocar ? <button class="v3-mus" onClick={aoTocar} {...resto}>{dentro}</button> : <div class="v3-mus" {...resto}>{dentro}</div>;
}

export function SemanaV3({ ctx }) {
  const s = ctx.semanaV3();
  const v = s.veredito;
  const precisaDias = (v.portoes || []).some(g => g.k === 'adesao' && !g.ok);
  const comida = ctx.moduloLigado('comida');
  const feitas = s.regioes.reduce((n, r) => n + r.feitas, 0);
  const vem = s.regioes.reduce((n, r) => n + r.vem, 0);
  const maxSeries = Math.max(1, ...s.regioes.map(r => r.feitas + r.vem));
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
          {/* aplicar abre a folha que diz o que muda, antes do toque */}
          {v.podeAplicar && v.acaoTxt && <Botao data-a="semana-aplica" onClick={() => ctx.abreFolha({ k: 'aplicar' })}>Aplicar no plano</Botao>}
          {precisaDias && <Botao tipo={v.podeAplicar ? 'contorno' : 'principal'} data-a="semana-responder" onClick={ctx.abreResponderDias}>Responder os dias {ic.seta}</Botao>}
        </Acoes>
        {v.podeDesfazer && <Saida data-a="semana-desfaz" onClick={ctx.desfazAjuste}>Desfazer o último ajuste</Saida>}
      </Bloco>
      {v.portoes && (
        <Secao titulo="O que a regra olha">
          <div>
            {v.portoes.map(g => (
              <div key={g.k} class="v3-crit">
                <span class={'g' + (g.ok ? '' : ' n')} aria-hidden="true">{g.ok ? ic.ok : ic.x}</span>
                <div><b>{g.t}</b><span>{g.d}</span></div>
              </div>
            ))}
          </div>
          {v.promessa && <Apoio>{v.promessa}</Apoio>}
        </Secao>
      )}
      {/* o que está valendo no plano de comida: sem título, a linha ficava solta */}
      {v.estado && <Secao titulo="No plano agora"><Apoio>{v.estado}</Apoio></Secao>}
      </>}
      <Secao titulo="Séries da semana" nota={'dia ' + s.dia + ' de 7'}>
        <div>
          {s.regioes.map(r => (
            <Barra key={r.regiao} nome={r.regiao.charAt(0).toUpperCase() + r.regiao.slice(1)} feitas={r.feitas} vem={r.vem} max={maxSeries}
                   data-a={'semana-' + r.regiao} aoTocar={() => ctx.abreFolha({ k: 'musculos', regiao: r.regiao })} />
          ))}
        </div>
        <div class="v3-legm" role="group" aria-label="Legenda das séries">
          <span><i class="t" />feitas</span><span><i class="vem" />nos treinos que faltam</span>
        </div>
        <Apoio>{s.vemDias.length ? 'Ainda vêm os treinos ' + s.vemDias.join(', ') + ', pela rotação e pelos dias de treino. ' : ''}Só vira aviso o que não couber nos treinos que ainda faltam.</Apoio>
      </Secao>
      <Secao>
        <div>
          {ctx.moduloLigado('cardio') && <Linha titulo="Cardio" apoio={s.cardio} data-a="semana-cardio" aoTocar={ctx.abreCardio} />}
          <Linha titulo="Progressão de carga" apoio="quem está pronto para subir, ganhando repetição ou parado" data-a="semana-progressao" aoTocar={() => ctx.abreProgressao()} />
          <Linha titulo="Retrospectiva do bloco" apoio="o que evoluiu e o que ficou parado desde o começo do bloco"
                 data-a="semana-retro" aoTocar={ctx.abreRetro} />
        </div>
      </Secao>
      <div class="v3-fim-da-tela" />
    </div>
  );
}

/** Os músculos de uma região: feitas e as que ainda vêm, nas mesmas barras. */
export function FolhaMusculos({ ctx, f }) {
  const r = ctx.semanaV3().regioes.filter(x => x.regiao === f.regiao)[0];
  if (!r) return null;
  const max = Math.max(1, ...r.musculos.map(m => m.feitas + m.vem));
  return (
    <Folha titulo={r.regiao.charAt(0).toUpperCase() + r.regiao.slice(1)} sub={r.feitas + ' feitas e ' + r.vem + ' ainda vêm nesta semana.'} aoFechar={() => ctx.fechaFolha()}>
      <div class="v3-opcoes">
        {r.musculos.map(m => <Barra key={m.g} nome={m.g} feitas={m.feitas} vem={m.vem} max={max} />)}
      </div>
    </Folha>
  );
}

/**
 * APLICAR NO PLANO: o que muda, antes do toque, e o que não volta sozinho.
 * Aplicado, o aviso oferece desfazer (o restaurar do plano, um nível acima).
 */
export function FolhaAplicar({ ctx }) {
  const v = ctx.semanaV3().veredito;
  if (!v || !v.podeAplicar) return null;
  const aplica = async () => {
    ctx.fechaFolha();
    // o aviso só depois de o aparelho aceitar; se recusar, a faixa de falha diz
    if (!(await ctx.aplicaAjuste(true))) return;
    ctx.avisaComDesfazer('Aplicado: ' + v.acaoTxt.replace(/^aplicar /, '') + ' por dia.', ctx.desfazAjuste);
  };
  return (
    <Folha titulo={v.acaoTxt.charAt(0).toUpperCase() + v.acaoTxt.slice(1)} sub={v.naoVolta || 'Fica anotado quando e por quê.'} aoFechar={() => ctx.fechaFolha()}>
      <Acoes><Botao data-a="aplicar-ok" onClick={aplica}>Aplicar</Botao><Botao tipo="contorno" data-a="aplicar-nao" onClick={() => ctx.fechaFolha()}>Agora não</Botao></Acoes>
    </Folha>
  );
}

/** Uma linha da retrospectiva: o exercício, de onde saiu e aonde chegou. */
function LinhaDoBloco({ x }) {
  const meta = Array.isArray(x.meta) ? x.meta.join(' · ') : x.meta;
  return <Linha titulo={x.nome} apoio={x.series.filter(Boolean).join(' · ') + (meta ? ' · ' + meta : '')} valor={x.delta} />;
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
