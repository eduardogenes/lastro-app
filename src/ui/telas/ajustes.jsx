// AJUSTES — a conta, o aparelho e a cópia de segurança.
//
// Não é um lugar: é um botão no canto do Agora (§1.6 da frente 1). Possui a
// conta e a sincronia, a cópia de segurança e a restauração, apagar o histórico,
// a versão e a atualização, e a troca manual de tema.
//
// **Não possui nenhuma decisão de treino ou de comida**, e é essa a linha que
// separa isto da Prescrição: sincronizar e baixar o JSON respondem "e se eu
// perder o aparelho?", que não é uma pergunta sobre o que foi prescrito.
//
// A cobrança de backup NÃO está aqui, de propósito. Ela é aviso de perda de
// dado, e aviso de perda atrás de um botão de canto é aviso que não se lê — o
// lugar dela é o topo do Agora, junto do aviso de aparelho que não está
// guardando. Os dois dizem a mesma coisa com causas diferentes.

import { Procedencia, Secao } from '../instrumento/primitivos.jsx';
import { TelaCheia } from '../instrumento/telacheia.jsx';

function Bloco({ titulo, children, texto }) {
  return (
    <div class="gu-bloco">
      <h3 class="ins-subtitle gu-bloco-t">{titulo}</h3>
      {texto && <p class="ins-body-sm ins-t3 gu-bloco-p">{texto}</p>}
      {children}
    </div>
  );
}

export function Ajustes({ ctx }) {
  const d = ctx.dadosDoApp();
  const n = ctx.nuvem();

  return (
    <TelaCheia olho="este aparelho" titulo="Ajustes" aoVoltar={ctx.fechaAjustes}>
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
    </TelaCheia>
  );
}
