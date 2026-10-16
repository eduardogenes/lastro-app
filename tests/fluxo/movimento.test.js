// O MOVIMENTO, na metade que só o DOM vê.
//
// A guarda de movimento mora quase toda em `tests/dominio/estilo.test.ts`, de
// fonte: tempo e curva só nos tokens, todo movimento no portão, só transform e
// opacity, nada escutando o fim de uma animação. Um caso precisa da árvore
// montada, e é este: a lista dos ANCESTRAIS DE UM FIXO, que a metade de fonte
// usa para saber quais regras não podem criar bloco de contenção.
//
// A lista é de fonte porque o defeito nasce de uma linha de CSS. Mas quem diz
// se ela está completa é a árvore: o `.ins-modo` ficou um ano fora dela, com a
// faixa da pergunta de 1h30 morando dentro dele, e um `transform` na entrada
// do modo levaria a faixa de y 805 para 1309 (docs/motion/04 §2.3). Ninguém
// precisa lembrar que um fixo foi morar num invólucro novo: este caso acha.
import { test } from 'vitest';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { app } from './harness.js';
import { ANCESTRAIS_DE_FIXO } from '../ancestrais-de-fixo.js';

const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const MIN = 60 * 1000;

/**
 * Os seletores FIXOS, lidos das folhas do app: todo bloco que declara
 * `position: fixed`. A bancada (`palco.css`) fica fora: o fixo dela mora no
 * documento de fora, onde o app não monta.
 */
function seletoresFixos() {
  const dir = path.join(RAIZ, 'src');
  const folhas = fs.readdirSync(dir).filter(f => f.endsWith('.css') && f !== 'palco.css');
  assert.ok(folhas.length >= 5, 'as folhas do app sumiram de src/: ' + folhas.join(', '));
  const sels = new Set();
  folhas.forEach(f => {
    const limpo = fs.readFileSync(path.join(dir, f), 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/@keyframes[^{]*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g, '')
      .replace(/@[a-z-]+[^{;]*\{/g, '');
    limpo.split('}').forEach(bloco => {
      const p = bloco.split('{');
      if (p.length !== 2 || !/(?:^|[;\s])position\s*:\s*fixed\b/.test(p[1])) return;
      p[0].split(',').map(s => s.trim()).filter(Boolean).forEach(s => sels.add(s));
    });
  });
  return [...sels];
}

/** Os nomes de um ancestral: id e classes; `html`/`body` pelo elemento; sem nada, a etiqueta. */
function nomesDe(el) {
  const tag = el.tagName.toLowerCase();
  const nomes = (tag === 'html' || tag === 'body') ? [tag] : [];
  if (el.id) nomes.push('#' + el.id);
  el.classList.forEach(c => nomes.push('.' + c));
  return nomes.length ? nomes : [tag];
}

function anota(a, onde, fixos, visto) {
  fixos.forEach(sel => {
    const pseudo = /::[a-z-]+$/.test(sel);
    a.$$(sel.replace(/::[a-z-]+$/, '')).forEach(el => {
      visto.fixos.add(sel);
      // o pseudo-elemento é filho do elemento que o origina: ele também é ancestral
      let n = pseudo ? el : el.parentElement;
      const cadeia = [];
      while (n) { cadeia.push(n); n = n.parentElement; }
      const texto = cadeia.map(c => nomesDe(c).join('')).join(' < ');
      cadeia.forEach(c => nomesDe(c).forEach(nome => {
        visto.nomes.add(nome);
        if (!ANCESTRAIS_DE_FIXO.includes(nome)) visto.fora.add(onde + ': ' + sel + ' em ' + texto);
      }));
    });
  });
}

test('a lista dos ancestrais de um fixo é a árvore: nem falta, nem sobra', async () => {
  const fixos = seletoresFixos();
  // o caso só vale se a leitura de fonte achou os fixos que se conhecem
  ['.ins-tabbar', '.ins-folha-w', '.ins-faixa', '#timer', '#toast'].forEach(s =>
    assert.ok(fixos.includes(s), 'a leitura das folhas perdeu o fixo ' + s + ': ' + fixos.join(', ')));
  const visto = { fixos: new Set(), nomes: new Set(), fora: new Set() };

  // o Agora com o descanso contando e um aviso curto; depois uma folha por cima
  let a = await app({ aba: 'agora' });
  a.v('startTimer', 120);
  a.E('toast("Guardado.")');
  await a.esperar();
  anota(a, 'Agora com descanso e aviso', fixos, visto);
  a.v('ctx.abreSeletorDeDia');
  await a.esperar(200);              // a trava do corpo entra no efeito da folha
  anota(a, 'folha aberta', fixos, visto);
  a.fechar();

  // uma tela cheia
  a = await app({ aba: 'ajustes' });
  anota(a, 'tela cheia (Ajustes)', fixos, visto);
  a.fechar();

  // o modo de sessão com a faixa da pergunta de 1h30 — o fixo DENTRO do modo
  a = await app();
  a.v('go', 'A');
  a.v('toggle', 0);
  a.preencher(0, 0, 40, 10);
  await a.esperar();
  a.E(`S.sessao.ultima = Date.now() - 95 * ${MIN}`);
  a.v('ctx.abreModoDeSessao');
  await a.pintar();
  assert.ok(a.$('.ins-modo .ins-faixa'), 'pré-condição: a faixa da pergunta está dentro do modo');
  anota(a, 'modo com a pergunta de 1h30', fixos, visto);
  a.fechar();

  // o painel de pare (na variante da pergunta)
  a = await app({ painelManual: true });
  a.v('iniciarSessao');
  await a.esperar();
  a.preencher(0, 0, 40, 10);
  a.v('finalizarSessao');
  await a.esperar();
  anota(a, 'painel de pare', fixos, visto);
  a.fechar();

  // o aviso de falha e, depois de fechado, a faixa de "não guardado"
  a = await app({ estado: { body: { peso: [], cintura: [] } } });
  a.aba('corpo');
  a.encheCota();
  a.m.ctx.setPeso(73.6);
  a.m.ctx.registraPeso();
  await a.esperar(60);
  anota(a, 'aviso de falha', fixos, visto);
  a.clicar('[data-a="falhou-fecha"]');
  await a.esperar();
  anota(a, 'faixa de não guardado', fixos, visto);
  a.fechar();

  // o registro que não abriu
  a = await app({ armazenamentoMudo: true });
  await a.esperar(4300);
  anota(a, 'abertura que falhou', fixos, visto);
  a.fechar();

  assert.deepStrictEqual(fixos.filter(s => !visto.fixos.has(s)), [],
    'fixo das folhas que este caso não abriu: ele ficaria sem a árvore conferida. ' +
    'Abra-o num dos passos acima.');
  assert.deepStrictEqual([...visto.fora], [],
    'um fixo tem ancestral que a guarda de contenção não olha. Ponha o nome em ' +
    'ANCESTRAIS_DE_FIXO (tests/ancestrais-de-fixo.js): uma regra dele com transform, ' +
    'filter ou will-change prenderia o fixo dentro do pai.');
  assert.deepStrictEqual(
    ANCESTRAIS_DE_FIXO.filter(n => n !== ':root' && n !== '*' && !visto.nomes.has(n)), [],
    'nome em ANCESTRAIS_DE_FIXO que nenhum fixo teve como ancestral: a lista só serve se for exata');
}, 15000);
