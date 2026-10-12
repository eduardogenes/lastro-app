// HOJE — a tela da fusão.
//
// É o argumento inteiro do merge numa tela só: o pré-treino das 5h45 e a
// sessão das 6h15 são a MESMA sequência, e ver as duas coisas em eixos
// separados era o que fazia parecerem dois apps. Aqui há uma timeline, ordenada
// por relógio, com refeição e treino na mesma espinha.
//
// A ordem das perguntas é lei 1 do sistema: "e agora?" antes de "como está o
// dia?" antes de "o que falta?". Por isso o cartão-foco vem primeiro, o bloco
// de energia depois e a lista por último.

import {
  CartaoFoco, GradeMetricas, HeroMetrica, Procedencia, Secao, Ticks, useAgora
} from '../instrumento/primitivos.jsx';
import { LinhaTimeline } from '../instrumento/timeline.jsx';
import { fmtDur, fmtHora, fmtInt, fmtLitros } from '../../dominio/formato';
import {
  minutosDe, resumoDaRefeicao, totalDaRefeicao, totalDoDia, totalRegistrado
} from '../../dominio/nutricao/calculo';

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
  const registrado = totalRegistrado(plano, catalogo, comidaDoDia, diaHoje.cadencia === 'treino', alta);

  const pctKcal = alvo.kcal ? (registrado.kcal / alvo.kcal) * 100 : 0;
  const hhmm = new Date(agora).toTimeString().slice(0, 5);

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
  const refDe = id => refs.filter(r => r.id === id)[0] || null;
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
        rotulo: 'no box',
        nome: 'Aula',
        resumo: 'O que o box programar. O quadro do dia vira a nota da sessão.',
        cta: 'fiz a aula →',
        onClick: ctx.abreTreinoDeHoje
      };
    }

    if (topo.k === 'treino') {
      const r = linhaDoTreino;
      return {
        rotulo: r ? r.t : 'hoje',
        nome: nomeDoTreino,
        contagem: r ? contagem(minutosDe(r.t), agora).txt : null,
        contagemRotulo: r ? contagem(minutosDe(r.t), agora).rotulo : null,
        // O palpite diz que é palpite. A regra nunca inventa: o parecer mediu o
        // preço de tratar palpite como fato em marcas falsas de buraco.
        resumo: topo.palpite
          ? 'Previsto pelo padrão da semana — confirme o tipo do dia no topo.'
          : sessao.resumo,
        cta: 'abrir o treino →',
        onClick: ctx.abreTreinoDeHoje
      };
    }

    if (topo.k === 'refeicao') {
      const r = refDe(topo.id);
      if (!r) return null;
      const c = contagem(topo.hora, agora);
      return {
        rotulo: r.id === posTreino ? r.t + ' · pós-treino' : r.t,
        nome: r.n,
        contagem: c.txt,
        // `janela` é o que separa "é agora" de "é a próxima coisa do dia". Sem
        // isso o cartão diria "faltam" sobre algo de três horas adiante com a
        // mesma voz de algo de dez minutos.
        contagemRotulo: topo.janela ? c.rotulo : 'mais tarde',
        resumo: resumoDaRefeicao(r, catalogo, alta, comidaDoDia.escala[r.id] ?? 1),
        cta: 'abrir e marcar →',
        onClick: () => ctx.abreRefeicao(topo.id)
      };
    }

    // resolvido: o dia fechou, e o topo confirma em vez de ficar mudo
    const r = refDe(topo.id);
    return {
      rotulo: 'dia fechado',
      nome: r ? r.n : 'tudo marcado',
      resumo: 'A última coisa marcada do dia. Se algo não foi assim, corrija.',
      cta: 'corrigir →',
      onClick: () => ctx.editaRefeicao(topo.id)
    };
  };

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
          <b class="ins-label">Este aparelho não está guardando</b>
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
          <b class="ins-label">Cópia de segurança atrasada</b>
          <p class="ins-body-sm">
            {app.backupTxt} Baixe o JSON nos ajustes. É a única cópia que não
            depende deste navegador.
          </p>
        </div>
      )}

      {f && <CartaoFoco agora={hhmm} {...f} />}

      <Secao rotulo="energia" nota={diaHoje.previsto ? 'previsão · confirme no topo' : null}>
        <HeroMetrica
          rotulo="registrado"
          meta={`alvo ${fmtInt(alvo.kcal)} kcal`}
          valor={fmtInt(registrado.kcal)}
          unidade="kcal"
          progresso={pctKcal}
        >
          <GradeMetricas
            colunas={3}
            celulas={[
              { k: 'p', rotulo: 'proteína', valor: `${Math.round(registrado.p)}`, nota: `de ${Math.round(alvo.p)} g` },
              { k: 'c', rotulo: 'carboidrato', valor: `${Math.round(registrado.c)}`, nota: `de ${Math.round(alvo.c)} g` },
              { k: 'g', rotulo: 'gordura', valor: `${Math.round(registrado.g)}`, nota: `de ${Math.round(alvo.g)} g` }
            ]}
          />
        </HeroMetrica>
        <Procedencia>{cadenciaTxt}</Procedencia>
      </Secao>

      <Secao rotulo="o dia" nota="toque em ··· para editar">
        {/* Não é aviso: é a procedência de um horário que não bate com o
            plano. A refeição que não cabia dentro do treino foi para depois
            dele, e a tela diz isso em vez de deixar o número sem explicação. */}
        {movidas.map(c => (
          <div key={c.id} class="hj-conflito ins-provenance">{c.txt}</div>
        ))}
        <div>
          {refs.map((r, i) => {
            const treino = ctx.ehLinhaDeTreino(r);
            const feito = treino ? sessao.feita : !!comidaDoDia.done[r.id];
            const t = totalDaRefeicao(r, catalogo, alta, comidaDoDia.escala[r.id] ?? 1);
            return (
              <LinhaTimeline
                key={r.id}
                hora={r.t}
                nome={treino ? (sessao.nome || 'Treino ' + diaHoje.treino) : r.n}
                /* "pós-treino" não é uma refeição, é um PAPEL que uma refeição
                   de relógio acumula — de manhã o café, à tarde o almoço, à
                   noite o jantar. Por isso é selo, e não nome. */
                selo={r.id === posTreino ? 'pós-treino' : null}
                valor={treino ? sessao.valor : fmtInt(t.kcal) + ' kcal'}
                resumo={treino ? sessao.resumo : resumoDaRefeicao(r, catalogo, alta, comidaDoDia.escala[r.id] ?? 1)}
                meta={treino ? sessao.meta
                  : `P ${Math.round(t.p)} · C ${Math.round(t.c)} · G ${Math.round(t.g)}`}
                feito={feito}
                agora={emFoco != null && r.id === emFoco}
                cor={emFoco != null && r.id === emFoco ? 'acid' : null}
                aoMarcar={treino ? null : () => ctx.marcaRefeicao(r.id)}
                aoAbrir={() => treino ? ctx.vaiPara('treino') : ctx.abreRefeicao(r.id)}
                aoEditar={treino ? null : () => ctx.editaRefeicao(r.id)}
                ultima={i === refs.length - 1}
              />
            );
          })}
        </div>
        <button class="ins-btn-add" onClick={ctx.novaRefeicao}>+ adicionar refeição</button>
      </Secao>

      {/* O CARDIO nasce aqui: o Agora é o dono do dado, porque é onde se
          registra (§1.7). É LINHA e não cartão — cada um tem um dia em que é
          previsto, e nenhum deles é "a próxima coisa a fazer" no sentido que o
          cartão responde (§5.5).
          O aviso de perna no mesmo dia é do treinador e sinaliza em vez de
          bloquear: a regra é não pôr cardio no mesmo período de treino de
          perna, e quem decide se ainda dá é ele. */}
      <Secao rotulo="cardio" nota={`${cardio.semana} de ${cardio.alvo} nesta semana`}>
      <div class={'cardl' + (cromo.cardio.feito ? ' feito' : '')}>
        <span class="cardl-t">cardio</span>
        <span class="cardl-n">{cromo.cardio.resumo}</span>
        <button class="cardl-b" onClick={ctx.abreCardio}>
          {cromo.cardio.aberto ? 'fechar' : 'registrar'}
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

      <Secao rotulo="água">
        <Ticks
          n={comidaDoDia.agua}
          total={COPOS}
          onMuda={ctx.setAgua}
          unidade={`${COPO} ml por toque`}
          medida={`${fmtLitros(comidaDoDia.agua * COPO)} / ${fmtLitros(COPOS * COPO)} l`}
        />
      </Secao>
    </>
  );
}
