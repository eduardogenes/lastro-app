// PRESCRIÇÃO — o que foi prescrito, e o que eu mudo?
//
// O quinto dos cinco lugares, e o que recebe mais endereços de uma vez: o plano
// alimentar e a biblioteca de alimentos vinham da aba COMIDA; o alvo por tipo de
// dia, as regras de execução do treinador e a cadência da semana vinham do
// GUIA, modo "prescrição" e modo "o app".
//
// O INTERRUPTOR do deload NÃO veio: ele foi para o menu `···` da sessão por
// decisão do dono. O que ficou aqui é a REGRA do treinador sobre deload
// ("Deload por evidência, não por calendário"), que é referência — e referência
// é posse de Prescrição. A regra e o interruptor têm nomes parecidos e naturezas
// opostas.
//
// O que ficou FORA, e foi para Ajustes: sincronizar, backup, restaurar e "onde
// ficam seus dados". Prescrição "não possui nenhum registro" (§1.5) — e
// sincronia e cópia de segurança não são prescrição, são conta e aparelho.
//
// A cadência veio para cá por decisão de posse, contra o lugar onde ela estava:
// o GUIA a punha no modo "o app" com a razão escrita "a cadência é AJUSTE, não
// referência". A frente 1 a lista como posse de Prescrição (§1.5), e a razão que
// vence é a pergunta: em que dias costumo treinar é prescrição de rotina, e é
// contra ela que o palpite do dia se calcula. O comentário original fica abaixo,
// porque o argumento dele continua de pé — ela é tocável, não é leitura.
//
// QUATRO chips, um por assunto, e não os três da COMIDA mais os dois do GUIA:
// aninhar chip dentro de chip esconde metade do lugar atrás de duas escolhas. O
// corte é por pergunta — o que o treinador prescreveu, o que eu como, do que
// eu como, e em que dias.

import {
  Cabecalho, Chips, GradeMetricas, Procedencia, Secao, Vazio
} from '../instrumento/primitivos.jsx';
import { LinhaExpansivel } from '../instrumento/folha.jsx';
import { useState } from 'preact/hooks';
import { fmtDate } from '../../dominio/formato';
import { CATEGORIAS } from '../../dominio/nutricao/alimentos';
import { fmtKg } from '../../dominio/nutricao/calculo';

// Domingo primeiro, como no calendário e no `Date#getDay` que indexa a cadência.
const SEMANA = [
  { rot: 'dom', i: 0 }, { rot: 'seg', i: 1 }, { rot: 'ter', i: 2 },
  { rot: 'qua', i: 3 }, { rot: 'qui', i: 4 }, { rot: 'sex', i: 5 },
  { rot: 'sáb', i: 6 }
];

const HORIZONTES = [
  { k: 7, t: '7 dias' }, { k: 14, t: '14 dias' }, { k: 30, t: '30 dias' }
];

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

function Biblioteca({ ctx, busca }) {
  const alimentos = ctx.alimentosFiltrados(busca);
  return (
    <>
      {CATEGORIAS.map(([k, rotulo]) => {
        const grupo = alimentos.filter(a => a.cat === k);
        if (!grupo.length) return null;
        return (
          <div key={k} class="cm-cat">
            <div class="ins-label cm-cat-h">{rotulo}</div>
            <div class="ins-lista">
              {grupo.map(a => (
                <button key={a.id} class="ins-linha" onClick={() => ctx.editaAlimento(a.id)}>
                  <span class="ins-linha-n">
                    <span class={'ins-linha-t' + (a.meu ? ' ins-acid' : '')}>{a.n}</span>
                    <span class="ins-linha-s">
                      P {a.p} · C {a.c} · G {a.g} · por 100 {a.u}
                    </span>
                  </span>
                  <span class="ins-linha-v">{a.kcal} kcal</span>
                </button>
              ))}
            </div>
          </div>
        );
      })}
      {alimentos.length === 0 && <Vazio>Nenhum alimento com esse nome.</Vazio>}
    </>
  );
}

function Compras({ ctx }) {
  const { linhas, previsao, dias, comprado } = ctx.compras();
  const porCat = CATEGORIAS
    .map(([k, rotulo]) => [rotulo, linhas.filter(l => l.cat === k)])
    .filter(([, l]) => l.length);

  return (
    <>
      <Chips
        opcoes={HORIZONTES}
        valor={dias}
        onMuda={ctx.setHorizonteCompras}
      />
      <Procedencia>
        previsão pela semana típica · {previsao.treino} de treino e {previsao.descanso} de
        descanso em {dias} dias. A rotação decide qual treino vem; a cadência só
        estima quantos serão.
      </Procedencia>

      {porCat.length === 0 && <Vazio>O plano está vazio, então não há o que comprar.</Vazio>}

      {porCat.map(([rotulo, ls]) => (
        <div key={rotulo} class="cm-cat">
          <div class="ins-label cm-cat-h">{rotulo}</div>
          <div class="ins-lista">
            {ls.map(l => (
              <button
                key={l.f}
                class={'ins-linha' + (comprado[l.f] ? ' comprado' : '')}
                onClick={() => ctx.marcaCompra(l.f)}
              >
                <span class="ins-linha-n">
                  <span class="ins-linha-t">{l.n}</span>
                  {l.procedencia && <span class="ins-provenance">{l.procedencia}</span>}
                </span>
                <span class="ins-linha-v">{fmtKg(l.comprar, l.u)}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}

const MODOS = [
  { k: 'programa', t: 'programa' },
  { k: 'comida', t: 'comida' },
  { k: 'alimentos', t: 'alimentos' },
  { k: 'semana', t: 'semana' }
];

export function Prescricao({ ctx }) {
  // Uma aberta por vez: duas regras abertas já devolvem a rolagem que a lista
  // existe para tirar, e nenhuma delas se lê em comparação com a outra.
  const [regraAberta, setRegraAberta] = useState(null);
  const [modo, setModo] = useState('programa');
  const [busca, setBusca] = useState('');
  const [motivos, setMotivos] = useState({});
  const fila = ctx.mudancasQueEsperam();
  const esperando = fila.filter(g => !g.venceu);
  const venceram = fila.filter(g => g.venceu);
  const g = ctx.guia();
  const d = ctx.dadosDoApp();
  const plano = ctx.planoCompleto();
  const resumo = ctx.resumoDoPlano();

  return (
    <>
      <Cabecalho olho="o que foi prescrito" titulo="Prescrição" />

      <Secao primeira>
        <Chips opcoes={MODOS} valor={modo} onMuda={setModo} />
      </Secao>

      {modo === 'programa' && <>

      {/* A PORTA DO PROGRAMA. A §1.5 lista "o programa dele e a rotação" como
          posse de Prescrição, e ela não tinha porta para o editor: as duas que
          existiam eram a tela do treino (hoje dentro do modo) e o painel de
          volume da Semana, que leva lá quando o volume sai do alvo. Nenhuma das
          duas é "quero mexer no meu programa" — uma é no meio do treino, a outra
          é consequência de um número.
          Ele fica no topo do chip porque é a ação do lugar; o que vem abaixo é
          referência. */}
      <Secao primeira>
        <button class="ins-btn-primary" data-a="abre-programa"
                onClick={ctx.abrePrograma}>abrir o programa</button>
        <Procedencia>
          o que o treinador prescreveu, o que você mudou, e o histórico de cada
          mudança com o motivo
        </Procedencia>
      </Secao>

      {/* A FILA DAS MUDANÇAS QUE ESPERAM, e ela vem antes da referência de
          propósito: aqui há decisão pendente, e abaixo há consulta. A lei 1 do
          sistema é "e agora?" antes de "como está?".

          Cada linha diz as quatro coisas do passo 3 do fluxo do vencimento: o
          que mudou, de que sessão veio, quando VENCE — o dia em que aquele
          treino volta — e a conta de volume se virar permanente. A conta é
          TRANSIÇÃO ("passa de 12 para 13 contra 12 prescritas"), que é a forma
          que o dono pediu e a única que `impactoDoMod` produz.

          As duas respostas ficam lado a lado e do mesmo tamanho: não há resposta
          padrão, e dar mais área a uma delas é escolher por ele. E são por
          MUDANÇA, não por sessão — uma sessão pode ter subido uma série que ele
          quer manter e trocado um exercício que ele não quer. */}
      {esperando.length > 0 && (
        <Secao rotulo="esperando decisão"
               nota={esperando.length === 1 ? '1 sessão' : esperando.length + ' sessões'}>
          {esperando.map(g => (
            <div key={g.sid} class="pr-espera">
              <div class="ins-label pr-espera-h">
                treino {g.dia} · {fmtDate(g.quando)}
                {g.vence != null && <em class="pr-vence">vence em {fmtDate(g.vence)}</em>}
              </div>

              {g.mudancas.map((m, i) => (
                <div key={m.txt} class="pr-mud">
                  <div class="ins-body-sm pr-mud-t">{m.txt}</div>
                  {m.impacto && (
                    <div class={'ins-body-xs pr-mud-i' + (m.acima ? ' acima' : '')}>
                      {m.impacto}
                    </div>
                  )}
                  <div class="pr-mud-b">
                    <button class="ins-btn-secondary" data-a="so-naquele-dia"
                            onClick={() => ctx.respondeMudanca(g.sid, i, false, motivos[g.sid])}>
                      Foi só naquele dia
                    </button>
                    <button class="ins-btn-primary" data-a="virou-permanente"
                            onClick={() => ctx.respondeMudanca(g.sid, i, true, motivos[g.sid])}>
                      Virou permanente
                    </button>
                  </div>
                </div>
              ))}

              {/* O motivo é opcional e é texto, porque ele está sentado quando
                  decide isto. Vai para o histórico do programa junto da
                  mudança: é a resposta de "mudei isso quando, e por quê?". */}
              <input
                class="ins-input pr-motivo"
                type="text"
                placeholder="por quê? (opcional)"
                aria-label={'Motivo da decisão sobre o treino ' + g.dia}
                value={motivos[g.sid] || ''}
                /* Atualizador funcional, pela mesma razão do rascunho da
                   bioimpedância: com duas sessões na fila, a versão por closure
                   lia o mapa do último render e um motivo apagava o outro. */
                onInput={e => {
                  const v = e.currentTarget.value;
                  setMotivos(prev => Object.assign({}, prev, { [g.sid]: v }));
                }}
              />
            </div>
          ))}
          <Procedencia>
            sem resposta até o dia em que aquele treino volta, a mudança fica
            como só daquele dia — dito, e desfazível. Nada entra no programa em
            silêncio, e nada é descartado em silêncio.
          </Procedencia>
        </Secao>
      )}

      {/* VENCEU SEM VOCÊ. A mudança não some quando ele não decide: ela fica
          como "só daquele dia", e isso é DITO — "ficou como só daquele dia
          quando o treino A voltou" — e DESFAZÍVEL, com "tornar permanente
          agora" (§8.1, passo 5). Nada entra no programa em silêncio, e nada é
          descartado em silêncio.

          Uma resposta só aqui, e não duas: "só daquele dia" já é o que
          aconteceu, e oferecê-la de novo seria pedir que ele confirmasse o que
          o tempo já decidiu. O que falta é a porta de volta. */}
      {venceram.length > 0 && (
        <Secao rotulo="venceu sem você"
               nota={venceram.length === 1 ? '1 sessão' : venceram.length + ' sessões'}>
          {venceram.map(g => (
            <div key={g.sid} class="pr-espera venceu">
              <div class="ins-label pr-espera-h">treino {g.dia} · {fmtDate(g.quando)}</div>
              {g.mudancas.map((m, i) => (
                <div key={m.txt} class="pr-mud">
                  <div class="ins-body-sm pr-mud-t">{m.txt}</div>
                  <div class="ins-body-xs pr-mud-i">
                    ficou como só daquele dia quando o treino {g.dia} voltou
                  </div>
                  {m.impacto && (
                    <div class={'ins-body-xs pr-mud-i' + (m.acima ? ' acima' : '')}>
                      {m.impacto}
                    </div>
                  )}
                  <div class="pr-mud-b">
                    <button class="ins-btn-secondary" data-a="tornar-permanente"
                            onClick={() => ctx.respondeMudanca(g.sid, i, true, motivos[g.sid])}>
                      Tornar permanente agora
                    </button>
                  </div>
                </div>
              ))}
              <input
                class="ins-input pr-motivo"
                type="text"
                placeholder="por quê? (opcional)"
                aria-label={'Motivo de tornar permanente a mudança do treino ' + g.dia}
                value={motivos[g.sid] || ''}
                /* Atualizador funcional, pela mesma razão do rascunho da
                   bioimpedância: com duas sessões na fila, a versão por closure
                   lia o mapa do último render e um motivo apagava o outro. */
                onInput={e => {
                  const v = e.currentTarget.value;
                  setMotivos(prev => Object.assign({}, prev, { [g.sid]: v }));
                }}
              />
            </div>
          ))}
        </Secao>
      )}
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
        {/* A procedência da pegada é dita UMA vez, aqui, e não em cada
            exercício: repeti-la em 48 cartões seria ruído, e este é o lugar
            onde as regras do treinador moram — o contraste fica visível. */}
        <Procedencia>
          a linha de <b>pegada</b> no treino não vem do seu treinador: é
          referência de execução. Onde ela não aparece, é porque resumir seria
          pior que calar — no terra romeno o que protege a lombar é o quadril,
          não a mão. Pegada que ele prescreveu está na dica do exercício.
        </Procedencia>
      </Secao>
      </>}

      {modo === 'comida' && <>
      {aba === 'plano' && (
        <Secao rotulo="refeições" nota="a edição vale para todo dia">
          <div class="ins-lista">
            {plano.map(r => (
              <button key={r.id} class="ins-linha" onClick={() => ctx.editaRefeicao(r.id)}>
                <span class="ins-linha-n">
                  <span class="ins-linha-t">{r.n}</span>
                  <span class="ins-linha-s">
                    {r.t} · {r.quando === 'sempre' ? 'todo dia'
                      : r.quando === 'treino' ? 'só em dia de treino' : 'só em dia de alta'}
                    {' · '}{r.itens.length} {r.itens.length === 1 ? 'item' : 'itens'}
                  </span>
                </span>
                <span class="ins-linha-v">{r.kcal} kcal</span>
              </button>
            ))}
          </div>
          <button class="ins-btn-add" onClick={ctx.novaRefeicao}>+ adicionar refeição</button>
        </Secao>
      )}

      {/* O que o plano soma. DOIS totais e não um: pré-treino e treino só
          entram em dia de treino, então um número só estaria errado metade da
          semana — e a lista acima já promete essa distinção em cada linha.

          Fecha a tela também no sentido literal: sem isto o plano acabava no
          botão tracejado e sobravam 220px de vazio até a tab bar, enquanto toda
          outra tela do app termina a 29px dela. */}
      {aba === 'plano' && (
        <Secao rotulo="o dia fecha em" nota={resumo.refeicoes + ' refeições no plano'}>
          <GradeMetricas
            colunas={2}
            celulas={[
              { k: 't', rotulo: 'dia de treino', valor: resumo.treino.kcal, nota: resumo.treino.macros },
              { k: 'd', rotulo: 'dia sem treino', valor: resumo.descanso.kcal, nota: resumo.descanso.macros }
            ]}
          />
          <Procedencia>
            somado do plano, não do que foi comido — o registrado do dia fica em HOJE
          </Procedencia>
        </Secao>
      )}
      </>}

      {modo === 'alimentos' && <>
      {aba === 'alimentos' && (
        <Secao rotulo="biblioteca" nota="o que você cadastrou aparece em ácido">
          <input
            class="ins-input" type="search" inputmode="search"
            placeholder="buscar alimento" value={busca}
            onInput={e => setBusca(e.currentTarget.value)}
          />
          <div class="cm-espaco" />
          <button class="ins-btn-add" onClick={ctx.novoAlimento}>+ cadastrar alimento</button>
          <div class="cm-espaco" />
          <Biblioteca ctx={ctx} busca={busca} />
        </Secao>
      )}
      {aba === 'compras' && (
        <Secao rotulo="lista" nota="derivada do plano · nada aqui é digitado">
          <Compras ctx={ctx} />
        </Secao>
      )}
      </>}

      {modo === 'semana' && <>
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

      {/* O DELOAD SAIU DAQUI, e é decisão do dono (a 6 das quinze): ele foi
          para o menu `···` da sessão. O argumento que caiu era bom e fica
          escrito, porque é o que ninguém pode esquecer ao implementar — "um
          interruptor que corta metade das séries não deve estar a um toque no
          meio de uma sessão. O app existe em parte para frear, e o caminho de
          menor esforço tem que ser o conservador".
          O LUGAR era o freio, e ele decidiu mover sabendo disso. Então o freio
          virou a PALAVRA: o item do menu diz o corte em número antes do toque,
          e nunca é um interruptor com o nome sozinho (frente 3, §7.6). */}
      </>}
    </>
  );
}
