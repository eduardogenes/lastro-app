// Quais lugares já têm tela no visual novo.
//
// Enquanto um lugar não está aqui, o app mostra a tela antiga dele mesmo com o
// visual novo ligado. Cada fase do plano acrescenta as suas
// (docs/redesign-3/00-plano.md). A chave é a do estado: `agora`, `dias`,
// `corpo`, `semana`, `prescricao`.
//
// Cada tela nova embrulha o próprio conteúdo em `<div class="v3">`: é essa
// classe que liga os estilos do visual novo, e o `<main>` do app fica como é.
export const TELAS_V3 = {};
