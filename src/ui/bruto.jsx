// Escape hatch da migração para componentes.
//
// A conversão é tela por tela. Enquanto uma tela ainda produz string de HTML,
// ela entra por aqui: o componente monta o que o construtor de string devolveu
// e os `onclick=` inline continuam funcionando, porque atributo resolve no
// clique e a ponte global ainda publica os nomes.
//
// Toda ocorrência de <Bruto> é dívida declarada. Quando não sobrar nenhuma,
// este arquivo, a ponte global e o `window.__escopo` saem juntos — e aí dá para
// religar minificação e tree-shaking no build.

/**
 * @param {{ html: string, class?: string }} props
 */
export function Bruto({ html, class: cls }) {
  return <div class={cls} dangerouslySetInnerHTML={{ __html: html }} />;
}
