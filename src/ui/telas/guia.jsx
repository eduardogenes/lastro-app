// GUIA — a camada de referência das duas metades, e a área de dados.
//
// A parte nova é a cadência da semana. Ela é o que sobrou do `mapa[7]` da
// nutrição depois que a fusão separou duas perguntas que estavam grudadas
// numa só: QUAL treino vem é sempre a rotação, que avança quando ele registra
// uma sessão; HOJE É DIA DE TREINAR é o que esta tela responde. Sem essa
// separação, o mapa e a rotação discordariam toda semana que ele pulasse um dia.
//
// A área de dados vem por último de propósito: é onde mora o único botão que
// destrói histórico, e ele fica no fim da última aba, atrás de confirmação.

import { Cabecalho, Procedencia, Secao } from '../instrumento/primitivos.jsx';

// Segunda primeiro, como se lê uma semana. O índice da cadência é getDay(),
// que começa no domingo — a conversão fica aqui e não no domínio.
// Domingo primeiro, como no calendário e no `Date#getDay` que indexa a cadência.
const SEMANA = [
  { rot: 'dom', i: 0 }, { rot: 'seg', i: 1 }, { rot: 'ter', i: 2 },
  { rot: 'qua', i: 3 }, { rot: 'qui', i: 4 }, { rot: 'sex', i: 5 },
  { rot: 'sáb', i: 6 }
];

/** Uma regra de execução do treinador. */
function Regra({ r }) {
  return (
    <div class={'gu-regra' + (r.warn ? ' atencao' : '')}>
      <div class="ins-label">{r.k}</div>
      <h3 class="ins-subtitle gu-regra-t">{r.t}</h3>
      {r.p.map((x, i) => (
        // O texto do treinador tem <b> no meio das frases; é conteúdo dele,
        // não marcação nossa, e vem de constante no código — nunca de entrada.
        <p key={i} class="ins-body-sm ins-t2 gu-regra-p" dangerouslySetInnerHTML={{ __html: x }} />
      ))}
    </div>
  );
}

/** Um bloco da área de dados: título, o que faz, e os botões. */
function Bloco({ titulo, children, texto }) {
  return (
    <div class="gu-bloco">
      <h3 class="ins-subtitle gu-bloco-t">{titulo}</h3>
      {texto && <p class="ins-body-sm ins-t3 gu-bloco-p">{texto}</p>}
      {children}
    </div>
  );
}

const SECOES = [
  { id: 'gu-semana', t: 'a semana' }, { id: 'gu-alvo', t: 'alvo do dia' },
  { id: 'gu-exec', t: 'execução' },   { id: 'gu-prog', t: 'o programa' },
  { id: 'gu-sinc', t: 'sincronizar' },{ id: 'gu-bkp', t: 'backup' },
  { id: 'gu-rest', t: 'restaurar' },  { id: 'gu-dados', t: 'seus dados' }
];

export function Guia({ ctx }) {
  const g = ctx.guia();
  const d = ctx.dadosDoApp();
  const n = ctx.nuvem();

  return (
    <>
      <Cabecalho olho="referência" titulo="Guia" />

      {d.cobraBackup && (
        <div class="gu-cobra">
          <div class="ins-label ins-amber">backup</div>
          <p class="ins-body-sm ins-t2">
            <b>{d.backupTxt}</b> Baixe o JSON agora. É a única cópia que não
            depende deste navegador.
          </p>
          <button class="ins-btn-primary" onClick={ctx.exportar}>baixar backup</button>
        </div>
      )}

      {/* O guia é a tela mais longa do app — quase sete telas de rolagem — e é de
          CONSULTA: entra-se nele com uma pergunta ("como restauro?"), não para
          ler do começo. Sem índice, achar era rolar. */}
      <Secao primeira rotulo="ir para" nota="a tela mais longa do app">
        <div class="ins-chips">
          {SECOES.map(x => (
            <button key={x.id} class="ins-chip" onClick={() => ctx.vaiParaSecao(x.id)}>{x.t}</button>
          ))}
        </div>
      </Secao>

      <Secao id="gu-semana" rotulo="a semana" nota="toque para alternar">
        <div class="gu-semana">
          {SEMANA.map(d2 => {
            const treina = g.cadencia[d2.i] === 'treino';
            return (
              <button
                key={d2.i}
                class={'gu-dia' + (treina ? ' on' : '')}
                onClick={() => ctx.alternaCadencia(d2.i)}
              >
                <span class="ins-label-sm">{d2.rot}</span>
                <span class="gu-dia-v">{treina ? 'treino' : 'folga'}</span>
              </button>
            );
          })}
        </div>
        <Procedencia>
          isto diz só em que dias você costuma treinar, e serve para prever as
          compras. Qual sessão vem é sempre a rotação: {g.rotacao}.
        </Procedencia>
      </Secao>

      <Secao id="gu-alvo" rotulo="alvo por tipo de dia" nota="calculado do plano">
        <div class="ins-lista">
          {g.alvos.map(a => (
            <div key={a.k} class="ins-linha">
              <span class="ins-linha-n">
                <span class="ins-linha-t">{a.t}</span>
                <span class="ins-linha-s">{a.s}</span>
              </span>
              <span class="ins-linha-v">{a.v}</span>
            </div>
          ))}
        </div>
        <Procedencia>
          somado dos alimentos do plano, não escrito à parte: mudar uma
          quantidade recalcula isto na hora.
        </Procedencia>
      </Secao>

      <Secao id="gu-exec" rotulo="execução" nota="as regras do treinador">
        {g.regras.map(r => <Regra key={r.k} r={r} />)}
      </Secao>

      <Secao id="gu-prog" rotulo="o programa">
        <Bloco
          titulo="Seus treinos"
          texto={`Os ${d.treinos} treinos, a ordem da rotação e os exercícios. Mudança aqui vale a partir do próximo treino; para mudar só o treino de hoje, use a edição na tela de treino.`}
        >
          <button class="ins-btn-secondary" onClick={ctx.abrePrograma}>
            abrir o programa{d.difTxt ? ' · ' + d.difTxt : ''}
          </button>
        </Bloco>

        <Bloco
          titulo="Retrospectiva do bloco"
          texto="O que evoluiu, o que ficou parado e onde a dor apareceu desde o começo deste bloco de 48 sessões."
        >
          <button class="ins-btn-secondary" onClick={ctx.abreRetro}>abrir retrospectiva</button>
        </Bloco>

        <Bloco
          titulo="Modo deload"
          texto="Mostra metade das séries de cada exercício mantendo as mesmas cargas. As sessões salvas nesse modo ficam marcadas no histórico, para a queda de volume não parecer regressão."
        >
          <button class="ins-btn-secondary" onClick={() => ctx.setDeload(!d.deload)}>
            {d.deload ? 'desativar o deload' : 'ativar o deload'}
          </button>
        </Bloco>
      </Secao>

      {/* A sincronização vem ANTES do backup de propósito: as duas respondem
          "e se eu perder o aparelho?", e a nuvem é a resposta que não depende
          de você lembrar. O backup continua sendo a cópia que não depende de
          ninguém — nem do Supabase. */}
      <Secao id="gu-sinc" rotulo="sincronizar">
        {n.dentro ? (
          <Bloco titulo={n.conta} texto={n.explica}>
            <div class="gu-sync">
              <span class={'ins-label ' + n.cor}>{n.estado}</span>
            </div>
            <button class="ins-btn-primary" disabled={n.rodando} onClick={ctx.sincronizaAgora}>
              {n.rodando ? 'sincronizando...' : 'sincronizar agora'}
            </button>
            <button class="ins-btn-secondary gu-b2" onClick={ctx.sairDaNuvem}>sair desta conta</button>
          </Bloco>
        ) : (
          <Bloco
            titulo="Entrar"
            texto="Entre com a mesma conta no celular e no computador e o registro passa a ser o mesmo nos dois. O app continua funcionando sem isto, e sem rede: a nuvem é cópia, não é a fonte."
          >
            <input
              class="ins-input gu-campo" type="email" id="nvemail" autocomplete="username"
              placeholder="e-mail" value={n.email}
              onInput={e => ctx.nuvemCampo('email', e.currentTarget.value)}
            />
            <input
              class="ins-input gu-campo" type="password" id="nvsenha" autocomplete="current-password"
              placeholder="senha" value={n.senha}
              onInput={e => ctx.nuvemCampo('senha', e.currentTarget.value)}
            />
            {n.erro && <p class="ins-body-sm ins-amber gu-bloco-p">{n.erro}</p>}
            <button class="ins-btn-primary" disabled={n.rodando} onClick={ctx.entrarNaNuvem}>
              {n.rodando ? 'entrando...' : 'entrar'}
            </button>
          </Bloco>
        )}
      </Secao>

      <Secao id="gu-bkp" rotulo="backup">
        <Bloco
          titulo="Exportar"
          texto="Baixa todo o histórico num arquivo JSON. Guarde antes de trocar de celular, limpar o navegador ou mexer no app."
        >
          <button class="ins-btn-primary" onClick={ctx.exportar}>baixar arquivo json</button>
          <button class="ins-btn-secondary gu-b2" onClick={ctx.mostraJSON}>
            {d.json ? 'esconder o texto' : 'mostrar o json para copiar'}
          </button>
          {d.json && (
            <>
              <textarea
                class="ins-input gu-json" id="jout" readOnly value={d.json}
                onClick={e => e.currentTarget.select()}
              />
              <button class="ins-btn-secondary gu-b2" onClick={ctx.copiaJSON}>
                copiar para a área de transferência
              </button>
            </>
          )}
        </Bloco>

        <Bloco
          titulo="Importar"
          texto="Restaura um backup. Substitui o que estiver salvo agora, com confirmação antes."
        >
          <label class="ins-btn-secondary gu-arquivo">
            escolher arquivo json
            <input
              type="file" accept="application/json,.json,.txt"
              onChange={e => ctx.importaArquivo(e.currentTarget)}
            />
          </label>
          <button class="ins-btn-secondary gu-b2" onClick={ctx.alternaColar}>
            colar o texto do backup
          </button>
          {d.colando && (
            <>
              <textarea class="ins-input gu-json" id="jin" placeholder="cole aqui o conteúdo do arquivo" />
              <button
                class="ins-btn-primary gu-b2"
                onClick={() => ctx.importaTexto(document.getElementById('jin').value)}
              >importar do texto</button>
            </>
          )}
        </Bloco>
      </Secao>

      <Secao id="gu-rest" rotulo="restaurar" nota="os dois preservam o histórico">
        <div class="gu-acoes">
          <button class="ins-btn-secondary ins-btn-destructive" onClick={ctx.restauraPrograma}>
            restaurar o programa do treinador
          </button>
          <button class="ins-btn-secondary ins-btn-destructive" onClick={ctx.restauraPlano}>
            restaurar o plano do nutricionista
          </button>
        </div>
        <Procedencia>
          nenhum dos dois toca no que você registrou nem no que cadastrou:
          voltam só a prescrição.
        </Procedencia>
      </Secao>

      <Secao id="gu-dados" rotulo="onde ficam seus dados">
        <div class="ins-lista">
          <div class="ins-linha">
            <span class="ins-linha-n"><span class="ins-linha-t">salvos em</span></span>
            <span class="ins-linha-v">{d.onde}</span>
          </div>
        </div>
        <Procedencia>{d.resumo}</Procedencia>
        <button class="ins-btn-secondary ins-btn-destructive gu-apagar" onClick={ctx.apagaTudo}>
          apagar todo o histórico
        </button>
        <Procedencia>
          isto não tem volta, e não apaga o programa nem o plano — só o que você
          registrou.
        </Procedencia>
      </Secao>
    </>
  );
}
