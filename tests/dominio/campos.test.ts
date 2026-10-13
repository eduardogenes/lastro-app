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
// escolha", §8), e o primitivo existe: `Campo` em `src/ui/folhas/editores.jsx`
// recebe `modo`. Mas `modo` é opcional e sem padrão — esquecer é legal —, e
// `tsconfig.json` tem `checkJs: false`, porque o casco migra na fase 3. Até lá
// o compilador não vê `.jsx`, e quem cobra a escolha é este arquivo.
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
  'src/ui/instrumento/edicao.jsx · addq':
    'busca de exercício ou grupo — §6.1 "busca: do sistema, SEMPRE", e há caso que cobra que o teclado não feche a cada letra',
  'src/ui/instrumento/edicao.jsx · nxn':
    'nome do exercício novo — §6.1 "criar exercício (6 campos): do sistema; seis campos, dois deles texto; é cadastro, não registro"',
  'src/ui/telas/historico.jsx · exnome':
    'renomear o exercício no histórico — é texto, e é sentado',
  'src/ui/telas/retroativo.jsx · add-nome':
    'nome do treino avulso — §6.1 "do sistema; é texto"',
  'src/ui/telas/protocolo.jsx · pr-obs':
    'nota da sessão de fotos — §6.1 "nota da sessão: do sistema; é texto"',
  'src/ui/telas/corpo.jsx · onde-':
    'como ele mediu, nas medidas com fita — §6.1 "próprio para o número, do sistema para o texto"',
  'src/ui/telas/prescricao.jsx · pr-motivo':
    'motivo da mudança do programa — §6.1 "do sistema", e a frente 1 escreveu por quê: "porque é texto e ele está sentado"'
};

// OS CAMPOS DE NÚMERO da tabela, com o painel que ela manda. Esta lista não
// depende do registro acima: é a §6.1 escrita como asserção, e é ela que sobra
// se alguém reescrever o registro sem ler a tabela.
const NUMERO: Record<string, 'decimal' | 'numeric'> = {
  // A CARGA DA SÉRIE SAIU DAQUI, e é o veredito da §6.1 sendo cumprido: ela é
  // teclado PRÓPRIO, não "do sistema com painel decimal". O campo virou botão
  // que abre o teclado de doze teclas, então não há `inputmode` a cobrar — e a
  // linha sai do registro em vez de mentir sobre um campo que não existe.
  'src/ui/exercicio.jsx · r*_*': 'numeric',        // repetições da série
  'src/ui/exercicio.jsx · q*': 'decimal',        // quantidade de alimento
  // A LISTA RÁPIDA DA AULA SAIU DAQUI pelo mesmo motivo da carga da série: a
  // §6.1 manda próprio nas duas grandezas dela, e os dois campos viraram botões
  // que abrem o teclado de doze teclas. Não há `inputmode` a cobrar.
  'src/ui/instrumento/edicao.jsx · nxq': 'decimal',   // prescrição do exercício novo
  'src/ui/telas/historico.jsx · ed*_0': 'decimal',    // correção da carga
  'src/ui/telas/historico.jsx · ed*_1': 'numeric',    // correção das reps
  'src/ui/telas/retroativo.jsx · ahora': 'numeric',   // §6.1 diz o modo com letra: "do sistema, inputmode=numeric"
  'src/ui/telas/corpo.jsx · bio-': 'decimal'          // os cinco da bioimpedância, um nó
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

test('todo campo que escolhe pelo primitivo diz o modo na chamada', () => {
  // `Campo` recebe `modo` e o repassa. Então o `<input>` dele SEMPRE declara, e
  // o caso de cima não vê nada: quem escolhe é o chamador, e é lá que se
  // esquece. Hoje os cinco campos de macro passam `modo="decimal"` e os de
  // texto omitem — o que este caso congela é que a omissão seja VISÍVEL.
  const src = semComentario(fs.readFileSync(path.join(RAIZ, 'src/ui/folhas/editores.jsx'), 'utf8'));
  assert.ok(/function Campo\(\{[^}]*\bmodo\b/.test(src),
    'o primitivo `Campo` deixou de receber `modo`: se o teclado passou a ser decidido ' +
    'dentro dele, este caso tem de mudar junto');

  const chamadas = [...src.matchAll(/<Campo\b/g)].map(m => tagDoCampo(src, m.index));
  assert.ok(chamadas.length >= 8, 'achei só ' + chamadas.length + ' chamadas de Campo: o leitor quebrou');

  // Texto por rótulo, declarado: é a mesma regra do registro, na outra ponta.
  const TEXTO_NO_PRIMITIVO = ['nome', 'etiqueta'];
  const muadas = chamadas.filter(t => {
    if (/\bmodo=/.test(t)) return false;
    const tipo = (t.match(/tipo=["{]?([a-z-]+)/) || [, 'text'])[1]!;
    if (TIPO_DECIDE.has(tipo)) return false;          // `tipo="time"` escolhe sozinho
    const rotulo = (t.match(/rotulo=["{]?([^"'}]*)/) || [, '?'])[1]!;
    return !TEXTO_NO_PRIMITIVO.includes(rotulo.trim());
  });
  assert.deepStrictEqual(muadas.map(t => (t.match(/rotulo=["{]?([^"'}]*)/) || [, '?'])[1]), [],
    'chamada de `Campo` sem `modo`: a assinatura permite esquecer (`modo` é opcional e ' +
    'sem padrão) e o `tsc` não vê `.jsx`, então é aqui que a escolha é cobrada');
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
