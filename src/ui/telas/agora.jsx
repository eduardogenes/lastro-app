// HOJE — a tela da fusão.
//
// É o argumento inteiro do merge numa tela só: o pré-treino das 5h45 e a
// sessão das 6h15 são a MESMA sequência. A comida de hoje é uma lista de
// linhas, ordenada por relógio, com refeição e treino na mesma espinha (a D,
// `momento-2.html` e `agora-descanso.html`).
//
// A ordem das perguntas é lei 1 do sistema: "e agora?" antes de "como está o
// dia?". Por isso o cartão vem primeiro e as linhas depois. Cada linha abre no
// lugar com o que o cartão teria, e um toque grava.
//
// Saíram daqui, pelo desenho: o bloco de energia com os macros (nenhuma tarefa
// da D o pede; a adesão se conta em dias e marcas, não em kcal registradas), o
// "···" de editar a refeição e o "+ adicionar refeição" (o plano mora em
// Prescrição, onde os dois continuam).

import {
  CartaoFoco, Procedencia, Secao, Stepper, useAgora
} from '../instrumento/primitivos.jsx';
import { Forma, NOME_DA_MARCA } from '../instrumento/forma.jsx';
import { fmtDur, fmtHora, fmtHoraDita, fmtInt } from '../../dominio/formato';
import {
  minutosDe, resumoDaRefeicao, totalDaRefeicao
} from '../../dominio/nutricao/calculo';

/** "8h00", de "08:00": a hora em prosa, sem o zero da frente. */
function horaDitaDe(t) { return t.replace(/^0(\d)/, '$1').replace(':', 'h'); }

/** Minutos desde a meia-noite, do relógio que a tela recebe. */
function minutosDoDia(t) { const d = new Date(t); return d.getHours() * 60 + d.getMinutes(); }

const COPO = 250;
const COPOS = 14;

/** "faltam 1h20" / "há 12 min" — a contagem do cartão-foco. */
function contagem(alvoMin, agoraMs) {
  const d = new Date(agoraMs);
  const agoraMin = d.getHours() * 60 + d.getMinutes();
  const dif = alvoMin - agoraMin;
  const abs = Math.abs(dif);
  const h = Math.floor(abs / 60), m = abs % 60;
  const txt = h ? `${h}h${String(m).padStart(2, '0')}` : `${m}min`;
  return { txt, atrasado: dif < 0, rotulo: dif < 0 ? 'atrás' : 'faltam' };
}

export function Agora({ ctx }) {
  const agora = useAgora();
  const {
    dia, plano, catalogo, diaHoje, comidaDoDia, alta, alvo, sessao, cadenciaTxt,
    refs, posTreino, movidas
  } = ctx.hoje();

  // O cartão de cima vem da REGRA (`src/dominio/agora.ts`), não daqui.
  //
  // O que havia aqui era uma cascata de três recursos que olhava NOVENTA
  // MINUTOS PARA TRÁS (`minutosDe(r.t) >= agoraMin - 90`) — a regra escrita da
  // direção D, que o protótipo pegou se virando contra si mesma: marcado o
  // lanche das 16h, o almoço das 12h30 voltava ao topo como se fosse agora. A
  // regra nova só olha para frente, e o `null` dela é resposta legítima: dia de
  // descanso fora de qualquer janela não tem cartão, e o que passou sem marca é
  // linha, nunca cartão.
  const topo = ctx.cartaoDeCima();
  const cardio = ctx.corpo().cardio;
  const cromo = ctx.cromoDoTreino();
  const app = ctx.dadosDoApp();
  const exp = ctx.loginExpirou();
  const vence = ctx.esperandoDecisao();
  const dec = ctx.decisaoNoAgora();
  const dias = ctx.quatorzeDias();
  const refDe = id => refs.filter(r => r.id === id)[0] || null;
  const linha = ctx.linhaDaComida();
  // a leitura de volta: o último toque, o que passou sem marca antes dele e o próximo
  const volta = (function () {
    const u = linha.ultima;
    if (!u) return null;
    const r = refs.filter(x => x.id === u.id)[0];
    if (!r) return null;
    const esc = comidaDoDia.escala[r.id] ?? 1;
    const como = comidaDoDia.como && comidaDoDia.como[r.id];
    const minU = minutosDe(r.t);
    const refeicoes = refs.filter(x => !ctx.ehLinhaDeTreino(x));
    const prox = refeicoes.filter(x => minutosDe(x.t) > minutosDoDia(agora) && !comidaDoDia.done[x.id])[0];
    return {
      id: r.id, nome: r.n, quando: comidaDoDia.done[r.id],
      estado: como || (esc === 0.5 ? 'metade' : 'tudo'),
      antes: refeicoes.filter(x => minutosDe(x.t) < minU && !comidaDoDia.done[x.id]).map(x => x.n.toLowerCase()),
      proximo: prox ? prox.n.toLowerCase() + ' às ' + horaDitaDe(prox.t) : null
    };
  })();
  const ag = ctx.agua();
  const linhaDoTreino = refs.filter(r => ctx.ehLinhaDeTreino(r))[0] || null;

  // A linha acesa da timeline é o ASSUNTO do cartão, e não uma segunda escolha:
  // duas regras para a mesma pergunta divergiriam, e a tela diria duas coisas.
  const emFoco = !topo ? null
    : topo.k === 'refeicao' || topo.k === 'resolvido' ? topo.id
    : (topo.k === 'treino' || topo.k === 'aula' || topo.k === 'sessao')
      ? (linhaDoTreino && linhaDoTreino.id) : null;

  const cartao = () => {
    if (!topo) return null;
    const nomeDoTreino = sessao.nome || 'Treino ' + diaHoje.treino;

    if (topo.k === 'sessao') {
      // A pergunta de 1h30 MANTÉM o topo em vez de virar outro cartão: é o
      // mesmo assunto, e mudá-lo de lugar faria a resposta se esconder.
      //
      // E as DUAS respostas dela vêm para cá, com as palavras da faixa. No
      // Agora a tira de baixo não é desenhada (o cartão a substitui, e com a
      // contagem de séries que ela não tem), então se a pergunta chegasse aqui
      // com um toque só — "ir para a sessão" — o Agora PERDERIA a capacidade de
      // responder "já parei". A frase é a do modelo, não uma minha: uma fonte
      // só para a sentença, senão as duas divergem.
      const faixa = topo.pergunta ? ctx.faixaDaSessao() : null;
      return {
        procedencia: 'sessão aberta desde ' + sessao.desde,
        rotulo: 'treino aberto',
        nome: 'Treino ' + topo.dia,
        contagem: String(topo.guardadas),
        contagemRotulo: 'de ' + topo.prescritas + (topo.prescritas === 1 ? ' série' : ' séries'),
        resumo: topo.pergunta ? (faixa && faixa.txt) : sessao.resumo,
        cta: topo.pergunta ? null : 'voltar à sessão →',
        onClick: topo.pergunta ? undefined : ctx.voltaAoTreino,
        acoes: topo.pergunta ? [
          { t: 'continuo treinando', a: 'continuo', onClick: ctx.continuaSessao },
          { t: 'já parei', a: 'ja-parei', onClick: ctx.encerraSessaoEsquecida }
        ] : undefined
      };
    }

    if (topo.k === 'confirmar') {
      return {
        // Fora da tabela da §1.1: a procedência aqui é a do FIM, que o app
        // estimou na última série (V3: estimativa se diz estimativa).
        procedencia: 'fim estimado pelo app',
        rotulo: 'o treino de antes',
        nome: 'Treino ' + topo.dia,
        resumo: 'Fechei na última série: ' + fmtHora(topo.inicio) + ' → ' + fmtHora(topo.fim)
              + ', cerca de ' + fmtDur(topo.fim - topo.inicio) + ' (aproximada).',
        // Duas respostas OPOSTAS, e nenhuma é a padrão: o cartão deixa de ser
        // botão e as duas ficam à vista, do mesmo tamanho.
        acoes: [
          { t: 'Está certo', a: 'fim-ok', onClick: () => ctx.confirmaDuracao(topo.fim) },
          // A porta que já existe para "ver aquela sessão": a tela cheia dela é
          // onde o tempo se edita. `ctx.abrirSessao` não existe em `CTX` — é
          // verbo nu da tabela —, e inventar um apelido aqui daria dois
          // caminhos para a mesma coisa.
          { t: 'Corrigir o fim', a: 'fim-corrigir',
            onClick: () => ctx.abreSessaoDoDia({ k: 'sessao', t: topo.fim }) }
        ]
      };
    }

    if (topo.k === 'aula') {
      // Um botão só, e é a frente 1 literal. A aula É a sessão daquele dia, e
      // "fiz a aula" leva ao lugar onde ela se registra — o modo.
      return {
        procedencia: 'na prescrição · Treino ' + diaHoje.treino,
        rotulo: 'no box',
        nome: 'Aula',
        resumo: 'O que o box programar. O quadro do dia vira a nota da sessão.',
        cta: 'Fiz a aula →',
        onClick: ctx.abreTreinoDeHoje
      };
    }

    if (topo.k === 'treino') {
      const r = linhaDoTreino;
      return {
        procedencia: 'na prescrição · Treino ' + diaHoje.treino,
        rotulo: r ? r.t : 'hoje',
        nome: nomeDoTreino,
        contagem: r ? contagem(minutosDe(r.t), agora).txt : null,
        contagemRotulo: r ? contagem(minutosDe(r.t), agora).rotulo : null,
        // O palpite diz que é palpite. A regra nunca inventa: o parecer mediu o
        // preço de tratar palpite como fato em marcas falsas de buraco.
        resumo: topo.palpite
          ? 'Previsto pelo padrão da semana — confirme o tipo do dia no topo.'
          : sessao.resumo,
        cta: 'Abrir o treino →',
        onClick: ctx.abreTreinoDeHoje
      };
    }

    if (topo.k === 'refeicao') {
      const r = refDe(topo.id);
      if (!r) return null;
      const c = contagem(topo.hora, agora);
      return {
        procedencia: doPlano(r),
        rotulo: r.id === posTreino ? r.t + ' · pós-treino' : r.t,
        nome: r.n,
        contagem: c.txt,
        // só existe cartão de refeição dentro da janela de 30 min (a regra,
        // `src/dominio/agora.ts`): a contagem é sempre a de "é agora"
        contagemRotulo: c.rotulo,
        resumo: resumoDaRefeicao(r, catalogo, alta, comidaDoDia.escala[r.id] ?? 1),
        // Os três botões NO cartão (a D, `momento-2.html`, estado 1): um toque
        // grava, e "Não comi isso" faz a única pergunta no lugar deles.
        acoes: linha.pergunta === r.id ? [
          { t: 'Sei o que comi', a: 'cartao-fora', onClick: () => ctx.marcaLinhaDaComida(r.id, 'fora') },
          { t: 'Não sei', a: 'cartao-nsei', onClick: () => ctx.marcaLinhaDaComida(r.id, 'nsei') },
          { t: 'Não comi nada', a: 'cartao-nao', onClick: () => ctx.marcaLinhaDaComida(r.id, 'nao') }
        ] : [
          { t: 'Comi tudo', a: 'cartao-tudo', onClick: () => ctx.marcaLinhaDaComida(r.id, 'tudo') },
          { t: 'Metade', a: 'cartao-metade', onClick: () => ctx.marcaLinhaDaComida(r.id, 'metade') },
          { t: 'Não comi isso', a: 'cartao-naocomi', onClick: () => ctx.marcaLinhaDaComida(r.id, 'pergunta') }
        ]
      };
    }

    // resolvido: o dia fechou, e o topo confirma em vez de ficar mudo
    const r = refDe(topo.id);
    return {
      procedencia: r ? doPlano(r) : 'no plano',
      rotulo: 'dia fechado',
      nome: r ? r.n : 'tudo marcado',
      resumo: 'A última coisa marcada do dia. Se algo não foi assim, corrija.',
      cta: 'Corrigir →',
      onClick: () => ctx.editaRefeicao(topo.id)
    };
  };

  // "no plano às 16h00" — e a refeição que o treino empurrou não está no plano
  // naquele horário: dizer que está seria inventar a procedência.
  const horaDita = t => t.replace(/^0(\d)/, '$1').replace(':', 'h');
  const doPlano = r => movidas.some(m => m.id === r.id)
    ? 'depois do treino, às ' + horaDita(r.t)
    : 'no plano às ' + horaDita(r.t);

  const f = cartao();

  return (
    <>
      {/* ACIMA do cartão, e não é cartão: não disputa o topo porque não é uma
          ação — é a condição de validade de todas as outras (§5.0).
          Diz até QUANDO vale o que ele tocar, e que aquele dia não entra na
          conta dos 14 dias que a regra do corte lê. Sem a segunda metade, ele
          marcaria o dia inteiro e descobriria depois que a adesão não mexeu. */}
      {!ctx.guardando() && (
        <div class="ins-aviso-perda" role="status">
          <b class="ins-rotulo">Este aparelho não está guardando</b>
          <p class="ins-body-sm">
            Aba privada ou armazenamento bloqueado. O que você marcar vale até
            fechar esta aba — e não entra na conta dos 14 dias.
          </p>
        </div>
      )}

      {/* A COBRANÇA DE BACKUP, pela mesma razão do aviso de cima e com causa
          diferente: lá o aparelho não está guardando; aqui está, e a cópia que
          não depende deste navegador está velha. Vinha do GUIA, onde ficava
          numa tela de referência que ninguém abre sem motivo — e aviso de perda
          de dado que depende de alguém ir olhar é aviso que não se lê. Os
          Ajustes herdaram todo o resto daquela tela, menos este. */}
      {app.cobraBackup && (
        <div class="ins-aviso-perda" role="status">
          <b class="ins-rotulo">Cópia de segurança atrasada</b>
          <p class="ins-body-sm">
            {app.backupTxt} Baixe o JSON nos ajustes. É a única cópia que não
            depende deste navegador.
          </p>
        </div>
      )}

      {/* A SESSÃO DE LOGIN QUE EXPIROU (a D, prescricao estado 11): não é sem
          rede, que fica em silêncio. Diz o que está a salvo, o que falta, e as
          duas saídas — entrar de novo, ou a cópia que não depende de conta. */}
      {exp && (
        <div class="ins-aviso-perda" role="status">
          <b class="ins-rotulo">A sua sessão de login expirou</b>
          <p class="ins-body-sm">{exp.texto}{exp.esperando ? ' ' + exp.esperando : ''}{exp.ultima ? ' ' + exp.ultima : ''}</p>
          <div class="ag-l-btns">
            <button class="ins-btn-secondary" data-a="login-entra" onClick={ctx.abreAjustes}>Entrar de novo</button>
            <button class="ins-btn-secondary" data-a="login-copia" onClick={ctx.exportar}>Baixar cópia</button>
          </div>
        </div>
      )}

      {/* "Para decidir com calma": o vencimento da mudança do dia é AVISO e não
          cartão (§5.6), e aparece na manhã do dia em que aquele treino volta.
          UMA linha, não a lista — o Agora não possui a lista das mudanças que
          esperam (§1.1), e o dono dela é Prescrição. O que o Agora faz é
          apontar, e o "Ver" leva até lá.
          Fica ABAIXO do cartão de propósito: é para decidir com calma, e a
          próxima coisa a fazer vem antes do que pode esperar. */}
      {f && <CartaoFoco {...f} />}

      {/* A LEITURA DE VOLTA do último toque (a D, `momento-2.html`, estado 2):
          o que ficou marcado, quando, neste aparelho, com "Desfazer"; o que
          passou sem marca antes dele; e o próximo do plano. Sem cobrança. */}
      {volta && (
        <div class="ag-volta" role="status">
          <div class="ag-volta-l">
            <Forma marca={volta.estado} />
            <span class="ag-volta-t">
              <b>{volta.nome} · {NOME_DA_MARCA[volta.estado]}</b>
              <small>marcado às {fmtHoraDita(volta.quando)}, neste aparelho</small>
            </span>
            <button class="ins-btn-secondary" data-a="volta-desfaz"
                    onClick={() => ctx.marcaLinhaDaComida(volta.id, 'desfaz')}>Desfazer</button>
          </div>
          {volta.antes.length > 0 && (
            <p class="ins-body-sm ins-t2">Antes dele, sem marca hoje: <b>{volta.antes.join(', ')}</b>.</p>
          )}
          {volta.proximo && <p class="ins-body-sm ins-t2">Próximo no plano: <b>{volta.proximo}</b>.</p>}
        </div>
      )}

      {/* A PESAGEM DA MANHÃ e, quando vence, A SESSÃO DE FOTOS: linhas com um
          botão, abaixo do cartão, e não cartão (frente 1 §5, regra 5; o M1‑13
          da D). Sem rótulo de seção: cada linha já se nomeia (§2, R1). */}
      <Secao continua>
        <div class="ins-lista ag-corpo">
          {ctx.linhasDoCorpo().map(l => (
            <div key={l.k} class="ins-linha" data-linha={l.k}>
              <span class="ins-linha-n">
                <span class="ins-linha-t">{l.t} · {l.v}</span>
                <span class="ins-linha-s">{l.d}</span>
              </span>
              {l.acao && (
                <button class="ins-btn-secondary" data-a={'agora-' + l.k}
                        onClick={l.k === 'peso' ? () => ctx.vaiPara('corpo') : ctx.abreProtocolo}>{l.acao}</button>
              )}
            </div>
          ))}
        </div>
      </Secao>

      {/* A MUDANÇA QUE ESPERA DECISÃO (a D, `agora-descanso.html`, estado 6).
          "Decidir" abre a decisão ali mesmo, sem trocar de lugar. No dia em que
          aquele treino volta, a linha diz que vence hoje.
          DIVERGÊNCIA DECLARADA: a D a quer só no Agora sem cartão e sem sessão;
          a frente 2 (§9.2) exige que encerrar com mudança INFORME — guardado em
          silêncio é tão ruim quanto descartado. Fica sempre que algo espera,
          abaixo do cartão quando há cartão (não disputa o topo). É a pergunta 4
          do desenhista, com o dono. */}
      {dec && (
        <div class={'ins-linha ag-vence' + (vence && vence.vence ? ' vence' : '')}>
          <span class="ins-linha-n">
            <span class="ins-linha-t">{vence && vence.vence ? vence.txt : dec.linha.titulo}</span>
            <span class="ins-linha-s">{dec.linha.detalhe}</span>
          </span>
          <button class="ins-btn-secondary" data-a="decidir" onClick={ctx.abreDecisao}>Decidir</button>
        </div>
      )}

      <Secao rotulo="A comida de hoje"
             nota={fmtInt(alvo.kcal) + ' kcal no plano de ' + (diaHoje.cadencia === 'treino' ? 'treino' : 'descanso')}>
        {/* Não é aviso: é a procedência de um horário que não bate com o
            plano. A refeição que não cabia dentro do treino foi para depois
            dele, e a tela diz isso em vez de deixar o número sem explicação. */}
        {movidas.map(c => (
          <div key={c.id} class="hj-conflito ins-provenance">{c.txt}</div>
        ))}
        <ul class="ag-linhas">
          {refs.map(r => {
            const treino = ctx.ehLinhaDeTreino(r);
            const quando = comidaDoDia.done[r.id];
            const esc = comidaDoDia.escala[r.id] ?? 1;
            const como = comidaDoDia.como && comidaDoDia.como[r.id];
            const estado = treino
              ? (sessao.feita ? 'tudo' : minutosDe(r.t) > minutosDoDia(agora) ? 'futuro' : 'sem')
              : quando ? (como || (esc === 0.5 ? 'metade' : 'tudo'))
              : emFoco != null && r.id === emFoco ? 'agora'
              : minutosDe(r.t) > minutosDoDia(agora) ? 'futuro' : 'sem';
            const t = treino ? null : totalDaRefeicao(r, catalogo, alta, esc);
            const dir = treino ? (sessao.valor || sessao.meta)
              : quando ? NOME_DA_MARCA[estado] + ' · ' + fmtHoraDita(quando)
              : estado === 'futuro' ? fmtInt(t.kcal) + ' kcal'
              : NOME_DA_MARCA[estado];
            const aberta = !treino && linha.aberta === r.id;
            return (
              <li key={r.id} class={'ag-l ' + estado + (aberta ? ' aberta' : '')}>
                <button class="ag-l-b" data-a={'linha-' + r.id} aria-expanded={treino ? undefined : (aberta ? 'true' : 'false')}
                        onClick={() => treino ? ctx.vaiPara('treino') : ctx.abreLinhaDaComida(r.id)}>
                  <Forma marca={estado} />
                  <span class="ag-l-h">{r.t.replace(/^0(\d)/, '$1').replace(':', 'h')}</span>
                  <span class="ag-l-n">
                    {treino ? (sessao.nome || 'Treino ' + diaHoje.treino) : r.n}
                    {r.id === posTreino && <small>pós-treino</small>}
                  </span>
                  <span class="ag-l-s">{dir}</span>
                </button>
                {aberta && (
                  <div class="ag-l-ab">
                    <p class="ins-body-xs ins-t3 ag-l-proc">{doPlano(r)}</p>
                    <p class="ins-body-sm ins-t2 ag-l-itens">
                      {resumoDaRefeicao(r, catalogo, alta, esc)} · {fmtInt(t.kcal)} kcal
                    </p>
                    {quando ? (
                      <div class="ag-l-feita">
                        <span class="ins-body-sm ins-t2">{NOME_DA_MARCA[estado]}, marcado às {fmtHoraDita(quando)}, neste aparelho</span>
                        <button class="ins-btn-secondary" data-a={'desfaz-' + r.id}
                                onClick={() => ctx.marcaLinhaDaComida(r.id, 'desfaz')}>Desfazer</button>
                      </div>
                    ) : linha.pergunta === r.id ? (
                      <div class="ag-l-perg">
                        <p class="ins-body ins-t1">Sabe o que comeu no lugar?</p>
                        <div class="ag-l-btns">
                          <button class="ins-btn-secondary" data-a={'fora-' + r.id}
                                  onClick={() => ctx.marcaLinhaDaComida(r.id, 'fora')}>Sei o que comi</button>
                          <button class="ins-btn-secondary" data-a={'nsei-' + r.id}
                                  onClick={() => ctx.marcaLinhaDaComida(r.id, 'nsei')}>Não sei</button>
                          <button class="ins-btn-secondary" data-a={'nao-' + r.id}
                                  onClick={() => ctx.marcaLinhaDaComida(r.id, 'nao')}>Não comi nada</button>
                        </div>
                        <p class="ins-body-xs ins-t3">
                          Sem saber, a refeição conta como marcada e pesa zero na adesão — melhor que um número inventado.
                        </p>
                      </div>
                    ) : (
                      <>
                        <button class="ins-btn-primary ag-l-tudo" data-a={'tudo-' + r.id}
                                onClick={() => ctx.marcaLinhaDaComida(r.id, 'tudo')}>Comi tudo</button>
                        <div class="ag-l-btns">
                          <button class="ins-btn-secondary" data-a={'metade-' + r.id}
                                  onClick={() => ctx.marcaLinhaDaComida(r.id, 'metade')}>Metade</button>
                          <button class="ins-btn-secondary" data-a={'naocomi-' + r.id}
                                  onClick={() => ctx.marcaLinhaDaComida(r.id, 'pergunta')}>Não comi isso</button>
                        </div>
                      </>
                    )}
                    {/* As outras porções (¾, 1¼, 1½) moram na folha da refeição:
                        a linha do desenho só tem a metade. Porta mantida para
                        não perder a capacidade — registrada como divergência. */}
                    {!quando && (
                      <button class="ag-l-lk" data-a={'porcao-' + r.id} onClick={() => ctx.abreRefeicao(r.id)}>
                        Outra porção
                      </button>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
        <Procedencia>{cadenciaTxt}</Procedencia>
      </Secao>

      {/* A ÁGUA, em linha: a conta e o desenho da conta. "+1 copo" grava no
          toque; tocar no número corrige no lugar. Não vem preenchida, e "não
          contei" não é zero (F194). */}
      <div class="ag-agua">
        <div class="ag-agua-l">
          <button class="ag-agua-t" data-a="agua-corrige" aria-expanded={ag.corrigindo ? 'true' : 'false'}
                  aria-label={'água: ' + ag.n + ' de ' + COPOS + ' copos. Tocar corrige.'}
                  onClick={ctx.abreCorrecaoDaAgua}>
            <span class="ins-body ins-t1">{ag.n ? <>Água · <b>{ag.n}</b> de {COPOS} copos</> : 'Água'}</span>
            <small class="ins-body-sm ins-t2">
              {ag.n
                ? fmtInt(ag.n * COPO) + ' ml de ' + fmtInt(COPOS * COPO) + ' ml'
                : (ag.naoContada ? 'marcada como não contada' : 'nenhum copo marcado') + ' · meta: ' + COPOS + ' copos de ' + COPO + ' ml'}
            </small>
            <span class="ag-copos" aria-hidden="true">
              {Array.from({ length: COPOS }).map((_, i) => <i key={i} class={i < ag.n ? 'f' : ''} />)}
            </span>
          </button>
          <button class="ins-btn-secondary ag-agua-b" data-a="agua-mais" onClick={ctx.maisUmCopo}>+1 copo</button>
        </div>
        {ag.corrigindo && (
          <div class="ag-agua-c">
            <Stepper valor={ag.n} min={0} max={30} onMuda={ctx.setAgua} fmt={v => v + (v === 1 ? ' copo' : ' copos')} />
          </div>
        )}
        {ag.falhou && (
          <div class="ag-agua-f" role="alert">
            <b class="ins-body-sm">O {ag.falhou}º copo não foi gravado</b>
            <p class="ins-body-sm">O armazenamento deste aparelho recusou. A conta continua em {ag.falhou - 1}, que é o que está guardado.</p>
            <div class="ag-l-btns">
              <button class="ins-btn-secondary" data-a="agua-tenta" onClick={ctx.maisUmCopo}>Tentar de novo</button>
              <button class="ins-btn-secondary" data-a="agua-copia" onClick={ctx.exportar}>Baixar a cópia de segurança</button>
            </div>
          </div>
        )}
      </div>

      {/* O CARDIO nasce aqui: o Agora é o dono do dado, porque é onde se
          registra (§1.7). É LINHA e não cartão — cada um tem um dia em que é
          previsto, e nenhum deles é "a próxima coisa a fazer" no sentido que o
          cartão responde (§5.5).
          O aviso de perna no mesmo dia é do treinador e sinaliza em vez de
          bloquear: a regra é não pôr cardio no mesmo período de treino de
          perna, e quem decide se ainda dá é ele. */}

      {/* No DESCANSO não há seção de cardio (a D, `agora-descanso.html`,
          estado 1: "não há outro cartão, faixa ou convite"): o cardio entra
          pela folha do tipo do dia, "Já fiz alguma coisa hoje → Cardio", e é
          ela que abre o registro aqui. No dia de treino a seção fica — o fim
          das sessões A e D, o outro lugar do cardio na D, não tem desenho. */}
      {(diaHoje.cadencia === 'treino' || cromo.cardio.aberto) && (
      <Secao>
      {/* Sem rótulo (frente 3 §2, R1): a primeira linha já diz "Cardio" e o placar. */}
      <div class={'cardl' + (cromo.cardio.feito ? ' feito' : '')}>
        <span class="cardl-t">Cardio</span>
        <span class="cardl-n">{cromo.cardio.resumo}</span>
        <button class="cardl-b" onClick={ctx.abreCardio}>
          {cromo.cardio.aberto ? 'Fechar' : 'Registrar'}
        </button>
      </div>

      {/* Registro rápido no lugar: sair da tela para anotar 25 min de bike
          seria mais atrito que a própria bike. */}
      {cromo.cardio.aberto && (
        <div class="cardq">
          <div class="chips">
            {cromo.cardio.modais.map(m => (
              <button key={m.k} class={'chip' + (m.on ? ' sel' : '')}
                      onClick={() => ctx.cardioSet('m', m.k)}>{m.t}</button>
            ))}
          </div>
          <div class="chips cardq-2">
            {cromo.cardio.minutos.map(v => (
              <button key={v.k} class={'chip' + (v.on ? ' sel' : '')}
                      onClick={() => ctx.cardioSet('min', v.k)}>{v.t}</button>
            ))}
            {cromo.cardio.intensidades.map(v => (
              <button key={v.k} class={'chip' + (v.on ? ' sel' : '')}
                      onClick={() => ctx.cardioSet('i', v.k)}>{v.t}</button>
            ))}
          </div>
          {cromo.cardio.aviso && <div class="cwarn">{cromo.cardio.aviso}</div>}
          <button class="ins-btn-primary dbtn cardq-b" onClick={ctx.addCardio}>
            {cromo.cardio.acao}
          </button>
        </div>
      )}
        {cardio.perna && cardio.perna.length > 0 && (
          <Procedencia>
            você salvou o treino {cardio.perna.join(' e ')} hoje. A regra é não
            pôr cardio no mesmo período de treino de perna — se ainda der, deixe
            para outro dia.
          </Procedencia>
        )}
        {/* A regra do treinador sobre QUANDO fazer: guia do registro, e por isso
            fica junto dele e não no placar. Quem está decidindo se registra é
            quem precisa dela. */}
        <Procedencia>{cardio.regra}</Procedencia>
      </Secao>
      )}

      {/* OS CATORZE DIAS que a regra do corte lê. §1.1 os lista como posse do
          Agora, e o §5.7 os nomeia no estado mais mudo que esta tela tem: num
          dia de descanso fora de qualquer janela "ficam a linha do dia, a água e
          a contagem dos 14 dias, e não há cartão".
          Contagem, e NUNCA percentual: os dois são a mesma matemática e o oposto
          na cabeça — um número contra 100% implícito funciona como nota, e é a
          mesma razão por que a adesão por refeição se conta em dias.
          A casa de HOJE fica vazia de propósito: o dia corrente só entra na
          conta quando a data vira, e é a mesma janela que o portão lê. */}
      <section class="ag-14" aria-label="os dias conhecidos dos últimos 14">
        <div class="ag-14-c" aria-hidden="true">
          {dias.celulas.map(c => <i key={c.iso} class={'ag-14-d ' + c.estado} />)}
        </div>
        <div class="ag-14-l" aria-hidden="true"><span>{dias.primeiro}</span><span>hoje</span></div>
        <p class="ins-body-sm ins-t2 ag-14-t">
          {dias.conta}<b>{dias.registrados}</b>. {dias.regra}{dias.hojeExplica ? ' ' + dias.hojeExplica : ''}
        </p>
        {dias.ontem && (
          <div class="ag-14-o">
            <p class="ins-body-sm ins-t2">{dias.ontem.txt}</p>
            <button class="ins-btn-secondary" data-a="poe-ontem" onClick={() => ctx.abrePoeODia(dias.ontem.iso)}>
              Pôr ontem em dia
            </button>
          </div>
        )}
      </section>


    </>
  );
}
