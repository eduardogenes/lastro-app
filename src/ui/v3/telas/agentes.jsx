// AJUSTES, AGENTES (docs/mcp/00-desenho.md, etapa 1, parte 2): os papéis que
// leem o Lastro pelo Claude, o que leram, a chave "Pode ler" por papel e
// "Desconectar o Claude". Protótipo aprovado: ~/lastro-rascunho/mcp/prototipo.fonte.html (v2).
// Dados: `ctx.agentesV3()` (main.jsx), lidos das tabelas `acessos` e `agentes`
// e dos grants do Supabase.

import { Acoes, Apoio, Botao, Caixa, Cabecalho, Chave, Folha, Linha, Saida, Secao } from '../base.jsx';
import { ic } from '../icones.jsx';

const ICONE = { treinador: 'halter', nutricionista: 'prato', assistente: 'lista' };
const TOM = { treinador: 'treino', nutricionista: 'refeicao', assistente: 'semana' };

function Passos({ nome }) {
  return (
    <ol class="v3-ag-passos">
      <li>No claude.ai, abra <b>Personalizar</b>, depois <b>Conectores</b>, e toque em <b>Adicionar conector personalizado</b>.</li>
      <li>Dê o nome {nome ? <b>Lastro · {nome}</b> : 'do papel'} e cole o endereço{nome ? ' abaixo' : ' dele, abaixo'}.</li>
      <li>Em cliente OAuth, escolha <b>Registrar automaticamente</b>.</li>
      <li>Entre e toque em <b>Permitir</b> na página do Lastro que abrir.</li>
    </ol>
  );
}

function Endereco({ ctx, k, nome }) {
  const copiado = ctx.agentesV3().copiado === k;
  return (
    <div class="v3-ag-end">
      <span class="v3-lin-t"><b>{nome}</b><span class="v3-ag-url">…/api/mcp/{k}</span></span>
      <button type="button" class={'v3-ag-copia' + (copiado ? ' ok' : '')} data-a={'agentes-copia-' + k}
              aria-label={'Copiar o endereço do ' + nome.toLowerCase()} onClick={() => ctx.copiaEnderecoDoAgente(k)}>
        {copiado ? <>{ic.ok}Copiado</> : 'Copiar'}
      </button>
    </div>
  );
}

export function AgentesV3({ ctx }) {
  const a = ctx.agentesV3();
  return (
    <>
      <Cabecalho titulo="Agentes" aoVoltar={ctx.fechaAgentes} />
      {a.carregando && !a.papeis && <Secao><Apoio>Lendo o que os agentes leram…</Apoio></Secao>}
      {a.erro && (
        <Secao>
          <Caixa tom="atencao" data-a="agentes-erro" titulo="Não deu para ler agora." nota={a.erro} />
          <Acoes><Botao tipo="contorno" cheio data-a="agentes-tenta" onClick={ctx.recarregaAgentes}>Tentar de novo</Botao></Acoes>
        </Secao>
      )}
      {a.papeis && a.vazio && (
        <>
          <Secao>
            <h2 class="v3-ag-vazio">Nenhum agente conectado</h2>
            <Apoio>O treinador, o nutricionista e o assistente podem ler o seu Lastro pelo Claude, cada um na parte dele. Nenhum grava nada no app.</Apoio>
          </Secao>
          <Secao titulo="Como conectar" nota="uma vez por papel"><Passos /></Secao>
          <Secao titulo="Endereços" nota="um por papel">
            <div>{a.papeis.map(p => <Endereco key={p.k} ctx={ctx} k={p.k} nome={p.nome} />)}</div>
            <Apoio>Depois de adicionado, o conector vale também no app do Claude no celular.</Apoio>
          </Secao>
        </>
      )}
      {a.papeis && !a.vazio && (
        <>
          <Secao><Apoio>Eles leem pelo Claude, cada um na parte dele. Nenhum grava nada no app.</Apoio></Secao>
          <Secao titulo="Pelo Claude" nota={a.resumo}>
            <div>
              {a.papeis.map(p => (
                <Linha key={p.k} titulo={p.nome} quieta={!p.ligado || !p.leu}
                       marca={ic[ICONE[p.k]]} marcaTom={p.ligado && p.leu ? TOM[p.k] : 'apagado'}
                       apoio={!p.leu ? 'ainda não leu nada' : p.ligado ? 'leu ' + p.ultima : 'desligado por você'}
                       data-a={'agentes-papel-' + p.k} aoTocar={() => ctx.abreFolha({ k: 'agente', p: p.k })} />
              ))}
            </div>
          </Secao>
          <Secao>
            <div><Linha titulo="Desconectar o Claude" apoio="os três param de ler" data-a="agentes-desconecta"
                        aoTocar={() => ctx.abreFolha({ k: 'desconectaClaude' })} /></div>
            <Apoio>O que eles leram fica guardado. Desconectar não apaga essas leituras.</Apoio>
          </Secao>
        </>
      )}
    </>
  );
}

export function FolhaAgente({ ctx, f }) {
  const a = ctx.agentesV3();
  const p = (a.papeis || []).find(x => x.k === f.p);
  if (!p) return null;
  return (
    <Folha titulo={p.nome} sub={p.leu ? 'Conectado pelo Claude.' : 'Ainda não leu nada. Se ainda não conectou, os passos estão abaixo.'} aoFechar={() => ctx.fechaFolha()}>
      <Chave titulo="Pode ler" apoio={p.ligado ? 'lê só a parte dele' : 'desligado: não lê nada'} ligada={p.ligado}
             data-a={'agente-chave-' + p.k} aoMudar={on => ctx.ligaAgente(p.k, on)} />
      <div class={p.ligado ? '' : 'v3-ag-desl'}>
        <div class="v3-ag-sec"><div class="v3-ag-sec-h"><h3>O que ele lê</h3><small>só lê</small></div>
          <ul class="v3-ef">
            {p.le.map(t => <li key={t}>{ic.ok}<span>{t}</span></li>)}
            {p.nao.map(t => <li key={t} class="v3-ag-nao">{ic.x}<span>Não lê {t}</span></li>)}
          </ul>
        </div>
        <div class="v3-ag-sec"><div class="v3-ag-sec-h"><h3>O que leu</h3><small>{a.tudo ? 'desde o começo' : 'últimos 7 dias'}</small></div>
          {p.dias.length ? (
            <div>
              {p.dias.map(d => (
                <div key={d.dia}>
                  <p class="v3-ag-dia">{d.dia}</p>
                  {d.itens.map((x, i) => <div key={i} class="v3-ag-leu"><time>{x.hora}</time><p>{x.texto}</p></div>)}
                </div>
              ))}
            </div>
          ) : <Apoio>{a.tudo ? 'Nenhuma leitura.' : 'Nenhuma leitura nos últimos 7 dias.'}</Apoio>}
          {!a.tudo && <Saida data-a="agente-mais" onClick={ctx.agentesDesdeOComeco}>Ver as leituras mais antigas</Saida>}
        </div>
        {!p.leu && <div class="v3-ag-sec"><div class="v3-ag-sec-h"><h3>Como conectar</h3></div><Passos nome={p.nome} /></div>}
        <div class="v3-ag-sec"><div class="v3-ag-sec-h"><h3>Endereço</h3><small>o do conector</small></div><div><Endereco ctx={ctx} k={p.k} nome={p.nome} /></div></div>
      </div>
    </Folha>
  );
}

export function FolhaDesconectaClaude({ ctx }) {
  const a = ctx.agentesV3();
  return (
    <Folha titulo="Desconectar o Claude?" aoFechar={() => ctx.fechaFolha()}
           sub="Os conectores param de ler na hora. Não apaga nada do app nem o que o Claude já leu nas conversas. Para voltar, adicione o conector de novo no Claude e permita outra vez.">
      {a.desconectando && <Apoio>Desconectando…</Apoio>}
      <Acoes>
        <Botao data-a="desconecta-manter" onClick={() => ctx.fechaFolha()}>Manter</Botao>
        <Botao tipo="contorno" data-a="desconecta-ok" disabled={a.desconectando} onClick={ctx.desconectaClaude}>Desconectar</Botao>
      </Acoes>
    </Folha>
  );
}
