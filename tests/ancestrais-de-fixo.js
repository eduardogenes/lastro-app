// OS ANCESTRAIS DE UM ELEMENTO FIXO — uma lista só, para as duas metades da
// guarda que a usa.
//
// Elemento `position: fixed` se ancora na janela DESDE QUE nenhum ancestral
// crie bloco de contenção (`transform`, `translate`, `scale`, `filter`,
// `will-change`, `contain`…). Se um criar, o fixo passa a rolar com o pai: a
// barra de abas vai de y 849 para 1251 com um `transform` no `#app`, e a faixa
// da pergunta de 1h30 vai de 805 para 1309 com um no `.ins-modo`
// (docs/motion/04 §2.3). Animar a entrada do modo NESTE elemento é um pisca
// garantido.
//
// As duas metades:
//  - a de FONTE (`tests/dominio/estilo.test.ts`, "nada entre um fixo e a
//    janela cria bloco de contenção") reprova regra destes seletores que
//    declare uma propriedade que contém, ou que mova outra coisa que opacidade;
//  - a de DOM (`tests/fluxo/movimento.test.js`) abre o app nos lugares onde há
//    fixo, sobe de cada fixo até `html` e confere que esta lista é EXATA:
//    ancestral que ela não nomeia reprova (foi assim que o `.ins-modo` ficou
//    de fora), e nome que nenhum fixo teve como ancestral também.
//
// `:root` é o `html`, e `*` é todo elemento: os dois servem à metade de fonte
// (uma regra `*` ou `:root` alcança os ancestrais) e não têm o que conferir no
// DOM. `.ins-travado` é a classe que o `body` ganha com folha aberta: uma regra
// escrita só com ela alcançaria o ancestral de todo fixo, então ela é nome da
// lista como `body`.
export const ANCESTRAIS_DE_FIXO = ['html', 'body', ':root', '*', '#app', '.ins-modo', '.ins-travado'];
