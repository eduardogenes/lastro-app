// O que uma TECLA faz com o que já está digitado.
//
// A parte pura do teclado próprio da §6.2. Mora no domínio e não no componente
// porque é conta, não desenho — e porque é ela que carrega a decisão sobre a
// casa decimal, que é a única coisa discutível do teclado.
//
// ---- A VÍRGULA, e uma divergência que eu declaro em vez de esconder ----
//
// A §6.1 manda, para a carga da série, "próprio, **com vírgula e casa decimal
// fixa**", e o parêntese de C2 diz o que casa decimal fixa quer dizer:
// `"736" → 73,6`. É o modelo da máquina registradora, e ele mata F63 (a vírgula
// do teclado do iPhone que um campo `number` descarta) e F275 (peso válido
// recusado) **na entrada**, porque não existe separador a digitar.
//
// **Eu implementei a outra metade da frase — vírgula de verdade — e não a casa
// decimal fixa.** A razão, e ela é de toques:
//
//  - no modelo da registradora, 60 kg custa **três** toques (`6`, `0`, `0`), e
//    carga redonda é o caso comum: o programa dele tem 60, 40, 55, 22,5;
//  - e o erro que ele produz cai no caso COMUM: quem digita `6`, `0` querendo 60
//    recebe 6,0. O erro do modelo com vírgula cai no caso menos comum (quem
//    digita `2`, `2`, `5` querendo 22,5 recebe 225);
//  - os dois fatos que a casa decimal fixa mataria já morrem aqui de outro jeito:
//    **este teclado digita os próprios caracteres e a própria conversão**, então
//    não há campo `number` descartando vírgula nem navegador a interpretar nada.
//
// **É decisão reversível num lugar só** (`DECIMAL_FIXA`, em
// `src/dominio/teclado.ts`), e ela diverge do parêntese de um especialista. Se
// ele preferir a registradora, é uma linha.

/**
 * O modelo de entrada da casa decimal.
 *
 * `false` — livre, com vírgula: `6`,`0` = 60 e `2`,`2`,`,`,`5` = 22,5.
 * `true`  — registradora: `7`,`3`,`6` = 73,6 (o parêntese de C2 na §6.1).
 *
 * A divergência está argumentada no cabeçalho deste arquivo. O ponto de
 * reversão é esta linha.
 */
export const DECIMAL_FIXA = false;

/** O que uma tecla faz com o texto digitado. Pura, para o caso poder provar. */
export function teclar(texto: string, tecla: string, decimal: boolean): string {
  if (tecla === '⌫') return texto.slice(0, -1);
  if (tecla === ',') {
    if (!decimal || texto.indexOf(',') >= 0 || texto === '') return texto;
    return texto + ',';
  }
  if (!/^[0-9]$/.test(tecla)) return texto;
  if (DECIMAL_FIXA && decimal) {
    const so = (texto.replace(/\D/g, '') + tecla).replace(/^0+(?=\d)/, '');
    const cheio = so.length < 2 ? '0'.repeat(2 - so.length) + so : so;
    return cheio.slice(0, -1) + ',' + cheio.slice(-1);
  }
  // uma casa decimal, e só: a carga não tem centésimo, e o 22,55 que o dedo
  // produz sem querer entraria no histórico que alimenta a leitura de força
  const casas = texto.split(',')[1];
  if (casas != null && casas.length >= 1) return texto;
  if (texto === '0' && tecla !== ',') return tecla;
  return texto + tecla;
}

