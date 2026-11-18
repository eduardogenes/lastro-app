// O TECLADO DE CADA CAMPO — a rede da frente 2 §6.
//
// Mora aqui e não em `teclado.test.ts` porque são dois assuntos: lá é o teclado
// PRÓPRIO, de doze teclas, e aqui é qual teclado cada campo do app abre. Eu já
// os escrevi no mesmo nome de arquivo uma vez e o segundo apagou o primeiro —
// o registro inteiro voltou do git.
//
// A regra da frente, em uma frase: teclado próprio onde a entrada acontece de
// pé, dentro da sessão, com uma mão, e o valor é um número curto de faixa
// conhecida; teclado do sistema onde a entrada é texto, ou longa, ou acontece
// sentado, ou pode ser colada. A tabela da §6.1 tem vinte linhas, e eu as
// conferi uma por uma contra o fonte: **as linhas "do sistema" estão todas
// honradas**, e não havia conserto a fazer. As linhas "próprio" dependem do
// teclado de doze teclas, que ainda não existe.
//
// Então o que falta não é conserto, é PORTÃO: hoje um campo numérico novo nasce
// sem teclado nenhum e nada fica vermelho. `inputmode` ausente é o teclado
// alfabético num campo de número — custa um toque a mais por campo, de pé, para
// chegar aos dígitos, e some na revisão porque a tela parece certa.
//
// ---- Por que o portão é de FONTE, e não de tipo ----
//
// A assinatura seria o lugar certo ("a assinatura não permite omitir a
// escolha", §8), mas `tsconfig.json` tem `checkJs: false`: o compilador não vê
// `.jsx`, e quem cobra a escolha é este arquivo.
//
// ---- Duas coisas que me enganaram ao medir, e que o analisador trata ----
//
// 1. **`inputMode` em camelCase.** Os cinco campos de bioimpedância usam
//    `inputMode="decimal"` (o Preact mapeia os dois), e a primeira varredura
//    que eu fiz, com regex em minúsculas, deu `FALTA` nos cinco. Eu quase
//    "consertei" campo certo. A busca aqui ignora a caixa.
// 2. **`<input[^>]*>` para no `=>` do `onInput`.** Metade dos campos tem
//    `onInput={e => ...}` dentro da tag, e `[^>]*` corta ali. Minha medição só
//    não errou por sorte de ORDEM — `type` e `inputmode` vinham antes do
//    `onInput` em todos. `tagDoCampo` conta chaves e fecha no `>` de nível
//    zero, que é a única leitura que não depende da ordem.
//
// E comentário não é campo: `src/main.jsx` cita `<input>` em três comentários
// (o stepper, o anúncio da série, a câmera) e `src/infra/camera.ts` num quarto.
// Os quatro apareciam como campos sem teclado na varredura crua.

import { test } from 'vitest';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

// ============================================================
// O ANALISADOR
// ============================================================

/** Sem comentário de bloco nem de linha: `<input>` citado em prosa não é campo. */
function semComentario(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
}

/**
 * A tag inteira que começa em `i`, fechando no `>` de nível ZERO de chaves.
 *
 * É o conserto do erro descrito no cabeçalho: dentro da tag há expressões JSX
 * com `=>` e com `>` solto, e qualquer leitura por `[^>]*` corta no primeiro.
 */
function tagDoCampo(src: string, i: number): string {
  let nivel = 0;
  for (let j = i; j < src.length; j++) {
    const c = src[j];
    if (c === '{') nivel++;
    else if (c === '}') nivel--;
    else if (c === '>' && nivel === 0) return src.slice(i, j + 1);
  }
  return src.slice(i);
}

type Campo = { arq: string; linha: number; tipo: string; modo: string; chave: string };

/** Todo `<input>` de um fonte, com o teclado que ele declara. */
function camposDe(arq: string, bruto: string): Campo[] {
  const src = semComentario(bruto);
  const achados: Campo[] = [];
  for (const m of src.matchAll(/<input\b/g)) {
    const tag = tagDoCampo(src, m.index);
    const tipo = (tag.match(/type=["{]?([a-z-]+)/i) || [, 'text'])[1]!;
    const modo = (tag.match(/inputmode=["{]?([a-z]+)/i) || [, ''])[1]!;
    // A chave é o `id` quando existe, e a classe distintiva quando não. O `id`
    // em template (`` id={`w${i}`} ``) vira `w*`: o registro conta nós do
    // FONTE, e um `.map` é um nó — os cinco campos de bioimpedância são uma
    // linha só aqui, de propósito.
    const bruteId = (tag.match(/\bid=\{?[`"']([^`"']*)/) || [, ''])[1]!;
    const classe = (tag.match(/\bclass=\{?[`"']([^`"']*)/) || [, ''])[1]!;
    const chave = (bruteId || classe.split(/\s+/).filter(c => c && c !== 'ins-input').join(' ') || '—')
      .replace(/\$\{[^}]*\}/g, '*');
    achados.push({
      arq, linha: src.slice(0, m.index).split('\n').length,
      tipo: tipo.toLowerCase(), modo: modo.toLowerCase(), chave
    });
  }
  return achados;
}

/** Os fontes que têm campo. Descobertos, e a falta é reprovada pelo caso 4. */
function todosOsCampos(): Campo[] {
  const fora: Campo[] = [];
  const anda = (dir: string) => {
    for (const e of fs.readdirSync(path.join(RAIZ, dir), { withFileTypes: true })) {
      const rel = dir + '/' + e.name;
      if (e.isDirectory()) anda(rel);
      else if (/\.(jsx?|tsx?)$/.test(e.name)) {
        const txt = fs.readFileSync(path.join(RAIZ, rel), 'utf8');
        if (txt.includes('<input')) fora.push(...camposDe(rel, txt));
      }
    }
  };
  anda('src');
  if (!fora.length) {
    throw new Error('nenhum campo encontrado em src: o analisador quebrou, e caso verde ' +
      'sobre zero campos é pior que vermelho');
  }
  return fora;
}

// ============================================================
// O REGISTRO
// ============================================================

// Os tipos que ESCOLHEM o teclado sozinhos: ou o tipo já abre o painel certo,
// ou não há digitação nenhuma. Declarar `inputmode` neles é ruído.
const TIPO_DECIDE = new Set([
  'checkbox', 'radio', 'file', 'range', 'color',
  'date', 'time', 'datetime-local', 'month', 'week',
  'email', 'password', 'search', 'tel', 'url'
]);

// AS LINHAS DE TEXTO, declaradas uma por uma com a razão da §6.1. Texto deixa
// de ser a ausência de escolha e passa a ser uma escolha escrita: um campo novo
// só fica verde se alguém der um `inputmode` a ele OU acrescentar a linha aqui,
// e as duas coisas são a escolha sendo feita.
//
// O limite, dito: clonar um campo de texto já declarado passa calado, porque a
// chave é a mesma. O que o portão pega é campo cuja ESCOLHA nunca foi feita.
const TEXTO: Record<string, string> = {
  'src/ui/v3/telas/hoje.jsx · registrar-texto':
    'o texto livre do "+" ("almocei e tomei 2 copos") — é frase, e o teclado é o das letras',
  'src/ui/v3/telas/plano.jsx · alimentos-busca':
    'busca de alimento no visual novo — busca é do sistema, sempre, como a de exercício',
  'src/ui/v3/telas/progressao.jsx · renomeia-ex':
    'renomear o exercício no visual novo — o mesmo caso do de cima: texto, e sentado',
  'src/ui/v3/telas/catalogo.jsx · novo-ex-nome':
    'nome do exercício novo no visual novo — o mesmo caso do `nxn`: é texto, e é cadastro',
  'src/ui/v3/telas/comida.jsx · ref-nome':
    'nome da refeição no visual novo — é texto, e é cadastro',
  'src/ui/v3/telas/comida.jsx · ref-etiqueta':
    'etiqueta da refeição ("pré-treino") — é texto, e é cadastro',
  'src/ui/v3/telas/comida.jsx · alimento-nome':
    'nome do alimento no visual novo — é texto, e é cadastro',
  'src/ui/v3/telas/diaaberto.jsx · lanca-nome':
    'nome do treino avulso no visual novo — o mesmo caso do de baixo: é texto',
};

// OS CAMPOS DE NÚMERO da tabela, com o painel que ela manda. Esta lista não
// depende do registro acima: é a §6.1 escrita como asserção, e é ela que sobra
// se alguém reescrever o registro sem ler a tabela.
const NUMERO: Record<string, 'decimal' | 'numeric'> = {
  // carga e quantidade aceitam vírgula; hora, minutos e repetições são inteiros
  'src/ui/v3/telas/catalogo.jsx · novo-ex-q': 'decimal',     // carga do exercício novo
  'src/ui/v3/telas/treino.jsx · rapida-c-': 'decimal',     // carga na lista rápida da aula
  'src/ui/v3/telas/treino.jsx · rapida-v-': 'numeric',     // repetições na lista rápida
  'src/ui/v3/telas/comida.jsx · alimento-cru': 'decimal',   // quantidade crua do alimento
  'src/ui/v3/telas/diaaberto.jsx · scomeco': 'numeric',     // hora em que a sessão passada começou
  'src/ui/v3/telas/diaaberto.jsx · ahora': 'numeric'        // hora do treino lançado depois
};

const nome = (c: Campo) => c.arq + ' · ' + c.chave;

// ============================================================
// OS CASOS
// ============================================================

test('todo campo do app declara o teclado que abre', () => {
  const muados = todosOsCampos().filter(c =>
    !c.modo && !TIPO_DECIDE.has(c.tipo) && !(nome(c) in TEXTO));
  assert.deepStrictEqual(muados.map(c => nome(c) + ' (' + c.arq + ':' + c.linha + ')'), [],
    'campo sem `inputmode` abre o teclado ALFABÉTICO. Se é número, declare o painel ' +
    '(`decimal` ou `numeric`); se é texto, acrescente a linha em TEXTO com a razão — ' +
    'o que não pode é a escolha não ter sido feita');
});

test('os campos de número da tabela têm o painel que a tabela manda', () => {
  const porNome = new Map(todosOsCampos().map(c => [nome(c), c]));
  const erradas: string[] = [];
  for (const [k, esperado] of Object.entries(NUMERO)) {
    const c = porNome.get(k);
    if (!c) { erradas.push(k + ': não existe mais no fonte'); continue; }
    if (c.modo !== esperado) erradas.push(k + ': é `' + (c.modo || 'nenhum') + '`, a tabela manda `' + esperado + '`');
  }
  assert.deepStrictEqual(erradas, [],
    'a §6.1 diz o painel campo por campo, e a carga é `decimal` por uma razão escrita: ' +
    'C2 marcou a casa decimal fixa como ponto a favor, e `limpaNum(el, dec)` normaliza a vírgula');
});

test('nenhuma linha declarada ficou órfã no registro', () => {
  // O outro sentido, e é o que falta em registro descoberto: linha que descreve
  // campo que não existe mais mente, e pior — se o campo virou NÚMERO e a linha
  // dele continua em TEXTO, o caso de cima fica verde sobre um campo errado.
  const vivos = new Set(todosOsCampos().map(nome));
  const orfas = [...Object.keys(TEXTO), ...Object.keys(NUMERO)].filter(k => !vivos.has(k));
  assert.deepStrictEqual(orfas, [],
    'linha declarada sem campo no fonte: se o campo saiu, a linha sai com ele; se mudou ' +
    'de chave, a linha muda junto');
});
