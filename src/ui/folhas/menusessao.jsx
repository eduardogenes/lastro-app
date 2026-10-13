// O menu `···` da sessão: o que é RARO, e por isso não fica à vista.
//
// Nasce com um item só — o deload — e isso é por decisão, não por falta de
// ideia. A decisão 6 do dono mandou o interruptor sair de Ajustes para cá, e o
// argumento que caiu com ele era bom o bastante para ficar escrito:
//
//   "um interruptor que corta metade das séries não deve estar a um toque no
//    meio de uma sessão. O app existe em parte para frear, e o caminho de menor
//    esforço tem que ser o conservador."
//
// **O lugar ERA o freio.** Ele decidiu movê-lo sabendo disso — foi perguntado
// duas vezes na mesma noite e manteve a decisão depois de o cartão ser
// corrigido. Então o freio passa do LUGAR para a PALAVRA, e é isto que esta
// folha desenha: o item NÃO é um interruptor com nome, é uma frase que diz o
// corte em número antes do toque (frente 3, §7.6, com a linha "nunca: um
// interruptor com o nome sozinho · 'Ativar deload'").
//
// Os números são do dado e não de exemplo: saem do prescrito daquele dia e da
// conta do deload, calculados na hora de abrir.

import { Folha } from '../instrumento/folha.jsx';

export function FolhaMenuDaSessao({ ctx }) {
  const m = ctx.menuDaSessao();
  const fecha = () => ctx.fechaFolha();
  if (!m) return null;

  return (
    <Folha olho="a sessão" titulo="O que é raro" aoFechar={fecha}>
      {/* "Encerrar" e não "finalizar" (§7.7, decisão 1): uma palavra só no app
          inteiro. A linha de baixo diz o fim que o toque grava, antes dele. */}
      {m.encerrar && (
        <button class="ins-linha ms-item" data-a="encerrar" onClick={() => {
          fecha();
          ctx.finalizarSessao();
        }}>
          <span class="ins-linha-n">
            <span class="ins-linha-t">{m.encerrar.rotulo}</span>
            <span class="ins-body-xs ins-t3 ms-detalhe">{m.encerrar.detalhe}</span>
          </span>
        </button>
      )}
      {/* Duas linhas no botão, e a de baixo é o freio: ela diz o que o toque
          FAZ, em número, antes do toque. Um rótulo sozinho — "ativar deload" —
          é exatamente o que a frente 3 proíbe aqui. */}
      <button class="ins-linha ms-item" data-a="deload" onClick={() => {
        ctx.setDeload(!m.deload.ligado);
        fecha();
      }}>
        <span class="ins-linha-n">
          <span class="ins-linha-t">{m.deload.rotulo}</span>
          <span class="ins-body-xs ins-t3 ms-detalhe">{m.deload.detalhe}</span>
        </span>
      </button>
      {/* A regra que o lugar antigo dizia sem palavra, agora dita onde o toque
          acontece — e só antes de ligar, que é o sentido que o freio segura.
          Literal e assinada: é a do programa, não um resumo dela (§7.6). */}
      {m.deload.regra && (
        <p class="ins-body-xs ms-regra">Treinador: “{m.deload.regra}”</p>
      )}
    </Folha>
  );
}
