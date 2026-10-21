// O menu `···` da sessão: as opções do treino inteiro, e não as de cada série.
//
// Desenho do dono (21/10): o título é o treino ("Treino B · hoje"), e dentro
// fica, na ordem da sessão, o que se decide sobre ela — fazer outro treino,
// editar o de hoje, o deload — e depois como ela acaba: encerrar ou descartar.
// Tudo, menos o descartar, também continua na tela do treino. O menu é um
// caminho a mais, e não uma mudança de casa.
//
// O DELOAD continua com o freio na palavra. Ele saiu de Ajustes por decisão do
// dono (decisão 6), e o argumento que caiu com ele era bom o bastante para
// ficar escrito:
//
//   "um interruptor que corta metade das séries não deve estar a um toque no
//    meio de uma sessão. O app existe em parte para frear, e o caminho de menor
//    esforço tem que ser o conservador."
//
// O lugar ERA o freio. Então o freio passou do lugar para a PALAVRA: o item não
// é um interruptor com nome, é uma frase que diz o corte em número antes do
// toque (frente 3, §7.6). Os números saem do prescrito daquele dia, calculados
// na hora de abrir.

import { Folha } from '../instrumento/folha.jsx';

/** Um item de duas linhas: o que o toque faz, e embaixo o efeito, com número. */
function Item({ a, item, classe, onClick }) {
  return (
    <button class={'ins-linha ms-item' + (classe ? ' ' + classe : '')} data-a={a} onClick={onClick}>
      <span class="ins-linha-n">
        <span class="ins-linha-t">{item.rotulo}</span>
        <span class="ins-body-xs ins-t3 ms-detalhe">{item.detalhe}</span>
      </span>
    </button>
  );
}

export function FolhaMenuDaSessao({ ctx }) {
  const m = ctx.menuDaSessao();
  const fecha = () => ctx.fechaFolha();

  return (
    <Folha olho="a sessão" titulo={m.titulo} aoFechar={fecha}>
      <div class="ins-lista">
      {/* A fileira da tela, igual: ácido no treino de agora, fio no próximo da
          sequência. Tocar troca e fecha, como a de lá troca e rola ao topo. */}
      {m.troca && (
        <div class="ms-troca">
          <span class="ins-linha-t" id="ms-troca-t">{m.troca.rotulo}</span>
          <div class="tr-rot" role="group" aria-labelledby="ms-troca-t">
            {m.troca.dias.map(x => (
              <button key={x.k} data-a={'menu-treino-' + x.k}
                      class={'tr-dia' + (x.on ? ' on' : '') + (x.proximo ? ' next' : '')}
                      aria-pressed={x.on ? 'true' : 'false'}
                      onClick={() => {
                        fecha();
                        if (!x.on) ctx.vaiParaDia(x.k);
                      }}>{x.t}</button>
            ))}
          </div>
        </div>
      )}

      {m.editar && (
        <Item a="menu-editar" item={m.editar} onClick={() => {
          fecha();
          ctx.modoEdicao();
        }} />
      )}

      {/* Duas linhas no botão, e a de baixo é o freio: ela diz o que o toque
          FAZ, em número, antes do toque. Um rótulo sozinho — "ativar deload" —
          é exatamente o que a frente 3 proíbe aqui. */}
      {m.deload && (
        <div>
          <Item a="deload" item={m.deload} onClick={() => {
            ctx.setDeload(!m.deload.ligado);
            fecha();
          }} />
          {/* A regra que o lugar antigo dizia sem palavra, agora dita onde o
              toque acontece — e só antes de ligar, que é o sentido que o freio
              segura. Literal e assinada: é a do programa, não um resumo dela
              (§7.6). Fica no mesmo bloco do item: o fio vem depois dela. */}
          {m.deload.regra && (
            <p class="ins-body-xs ms-regra">Treinador: “{m.deload.regra}”</p>
          )}
        </div>
      )}

      {/* "Encerrar" e não "finalizar" (§7.7, decisão 1): uma palavra só no app
          inteiro. A linha de baixo diz o fim que o toque grava, antes dele. */}
      {m.encerrar && (
        <Item a="encerrar" item={m.encerrar} onClick={() => {
          fecha();
          ctx.finalizarSessao();
        }} />
      )}
      {/* Por último e na cor do pare: é o único item que apaga. O toque ainda
          passa pelo pare, que diz quantas séries vão embora. */}
      {m.descartar && (
        <Item a="descartar" item={m.descartar} classe="ms-apaga" onClick={() => {
          fecha();
          ctx.descartarSessao();
        }} />
      )}
      </div>
    </Folha>
  );
}
