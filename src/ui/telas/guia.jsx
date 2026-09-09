// GUIA — a prescrição das duas metades, e a máquina do app.
//
// A tela juntava três naturezas debaixo de um nome só: o que o treinador e o
// nutricionista prescreveram (que se LÊ), a máquina do app — nuvem, backup,
// restaurar, apagar — (que se OPERA), e atalhos para outros destinos. Somava
// 4,3 telas de rolagem e precisava de um índice interno para se navegar, que é
// o sintoma clássico de uma tela que é mais de uma.
//
// Agora são dois modos, com o mesmo componente que a COMIDA e o DADOS usam:
// `prescrição` abre direto no que foi prescrito, e `o app` guarda a máquina —
// inclusive o único botão que destrói histórico, que assim deixa de ficar no
// caminho de quem só queria conferir a regra do RIR.
//
// A parte nova é a cadência da semana. Ela é o que sobrou do `mapa[7]` da
// nutrição depois que a fusão separou duas perguntas que estavam grudadas
// numa só: QUAL treino vem é sempre a rotação, que avança quando ele registra
// uma sessão; HOJE É DIA DE TREINAR é o que esta tela responde. Sem essa
// separação, o mapa e a rotação discordariam toda semana que ele pulasse um dia.
//

import { Cabecalho, Chips, Procedencia, Secao } from '../instrumento/primitivos.jsx';
import { LinhaExpansivel } from '../instrumento/folha.jsx';
import { useState } from 'preact/hooks';

// Segunda primeiro, como se lê uma semana. O índice da cadência é getDay(),
// que começa no domingo — a conversão fica aqui e não no domínio.
// Domingo primeiro, como no calendário e no `Date#getDay` que indexa a cadência.
const SEMANA = [
  { rot: 'dom', i: 0 }, { rot: 'seg', i: 1 }, { rot: 'ter', i: 2 },
  { rot: 'qua', i: 3 }, { rot: 'qui', i: 4 }, { rot: 'sex', i: 5 },
  { rot: 'sáb', i: 6 }
];

/**
 * Uma regra de execução do treinador — o título à vista, a prosa a um toque.
 *
 * As catorze regras abertas somavam 4.428px: 64% do guia inteiro, cinco telas
 * de rolagem só delas. E são material de REFERÊNCIA — lê-se uma vez com calma e
 * depois se volta procurando UMA regra, o que era rolar até achar.
 *
 * O que fica visível é o título, e ele não é rótulo: é a regra inteira ("Dupla
 * progressão: primeiro repetição, depois carga"). O que se recolhe é a
 * justificativa. Por isso a lista fechada não esconde nada — ela vira o índice
 * das regras, que antes não existia.
 */
function Regra({ r, aberta, aoAbrir }) {
  return (
    <div class={'gu-regra' + (r.warn ? ' atencao' : '')}>
      <LinhaExpansivel
        aberta={aberta}
        aoAbrir={aoAbrir}
        cabecalho={
          <>
            <span class="ins-label gu-regra-k">{r.k}</span>
            <span class="ins-subtitle gu-regra-t">{r.t}</span>
          </>
        }
      >
        {r.p.map((x, i) => (
          // O texto do treinador tem <b> no meio das frases; é conteúdo dele,
          // não marcação nossa, e vem de constante no código — nunca de entrada.
          <p key={i} class="ins-body-sm ins-t2 gu-regra-p" dangerouslySetInnerHTML={{ __html: x }} />
        ))}
      </LinhaExpansivel>
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

// Os dois assuntos. `prescrição` é o padrão: é o que a tela promete pelo nome,
// e é o único dos dois que se lê sem ter ido lá com uma tarefa em mente.
const MODOS = [
  { k: 'prescricao', t: 'prescrição' },
  { k: 'app', t: 'o app' }
];

export function Guia({ ctx }) {
  // Uma aberta por vez: duas regras abertas já devolvem a rolagem que a lista
  // existe para tirar, e nenhuma delas se lê em comparação com a outra.
  const [regraAberta, setRegraAberta] = useState(null);
  const [modo, setModo] = useState('prescricao');
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

      {/* Os modos tomaram o lugar do índice "ir para": um sumário interno resolvia
          um problema que a própria altura da tela criava, e com dois modos de
          duas telas cada não há mais o que sumariar. */}
      <Secao primeira>
        <Chips opcoes={MODOS} valor={modo} onMuda={setModo} />
      </Secao>

      {modo === 'prescricao' && <>

      <Secao rotulo="alvo por tipo de dia" nota="calculado do plano">
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

      <Secao rotulo="execução" nota="toque para abrir">
        {g.regras.map(r => (
          <Regra
            key={r.k} r={r}
            aberta={regraAberta === r.k}
            aoAbrir={() => setRegraAberta(regraAberta === r.k ? null : r.k)}
          />
        ))}
      </Secao>

      </>}

      {modo === 'app' && <>

      {/* A cadência é AJUSTE, não referência: você toca nela para dizer em que
          dias costuma treinar. Vinha primeiro na tela por acidente de ordem. */}
      <Secao rotulo="a semana" nota="toque para alternar">
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

      {/* O deload ganhou seção própria porque a antiga, "o programa", virou uma
          seção com um item só: "Seus treinos" saiu — `abrir o programa` já
          existe no TREINO e no DADOS, e esta era a terceira porta para o mesmo
          destino, a única embrulhada num parágrafo — e a retrospectiva foi para
          o DADOS, onde mora o resto do que é olhar para trás.

          Fica AQUI, e não no TREINO, de propósito: um interruptor que corta
          metade das séries não deve estar a um toque no meio de uma sessão. O
          app existe em parte para frear, e o caminho de menor esforço tem que
          ser o conservador. O estado dele já aparece no TREINO quando ligado. */}
      <Secao rotulo="deload">
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
      <Secao rotulo="sincronizar">
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
              aria-label="e-mail da conta" placeholder="e-mail" value={n.email}
              onInput={e => ctx.nuvemCampo('email', e.currentTarget.value)}
            />
            <input
              class="ins-input gu-campo" type="password" id="nvsenha" autocomplete="current-password"
              aria-label="senha da conta" placeholder="senha" value={n.senha}
              onInput={e => ctx.nuvemCampo('senha', e.currentTarget.value)}
            />
            {n.erro && <p class="ins-body-sm ins-amber gu-bloco-p">{n.erro}</p>}
            <button class="ins-btn-primary" disabled={n.rodando} onClick={ctx.entrarNaNuvem}>
              {n.rodando ? 'entrando...' : 'entrar'}
            </button>
          </Bloco>
        )}
      </Secao>

      <Secao rotulo="backup">
        <Bloco
          titulo="Exportar"
          texto="Guarde antes de trocar de celular, limpar o navegador ou mexer no app."
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

      <Secao rotulo="restaurar" nota="os dois preservam o histórico">
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

      <Secao rotulo="onde ficam seus dados">
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

      </>}
    </>
  );
}
