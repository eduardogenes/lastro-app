// Sobe o app num DOM de mentira para os testes.
//
// O harness testa o BUILD, não o fonte: lê `dist/index.html` e costura de volta
// o CSS e o JS que o Vite separou. Isso é de propósito — o que vai para o
// iPhone é o build, e um erro que só aparece depois de empacotar não pode
// passar batido. `npm test` roda `vite build` antes (script `pretest`).
//
// jsdom não executa `type="module"`, então o bundle entra como script clássico.
// O app expõe `window.__escopo` para avaliar expressões dentro do escopo do
// módulo — é como se chega em S, view e nas funções internas, que não são
// exportadas. Some quando os testes de domínio passarem a importar os módulos.
//
// Tudo que o iOS oferece e o jsdom não tem (áudio, wake lock, vibração) entra
// como dublê. O que eles registram é observável nos testes.

import fs from 'node:fs';
import path from 'node:path';
import { JSDOM, VirtualConsole } from 'jsdom';
import { fileURLToPath } from 'node:url';

const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

const DIST = path.join(RAIZ, 'dist');

function montarHTML() {
  const idx = path.join(DIST, 'index.html');
  if (!fs.existsSync(idx)) {
    throw new Error('dist/index.html não existe. Rode `npm run build` antes dos testes.');
  }
  const ler = function (rel) { return fs.readFileSync(path.join(DIST, rel), 'utf8'); };

  return fs.readFileSync(idx, 'utf8')
    .replace(/<script type="module"[^>]*src="\.?\/?(assets\/[^"]+\.js)"[^>]*><\/script>/,
      function (_, p) {
        // Tira a referência de sourcemap: dentro do jsdom ela não resolve, e o
        // Vitest tenta lê-la como caminho de disco ao formatar um stack —
        // batendo num diretório e derrubando o relatório inteiro do arquivo.
        const js = ler(p).replace(/\/\/# sourceMappingURL=.*$/m, '');
        return '<script>' + js + '<\/script>';
      })
    .replace(/<link rel="stylesheet"[^>]*href="\.?\/?(assets\/[^"]+\.css)"[^>]*>/,
      function (_, p) { return '<style>' + ler(p) + '<\/style>'; });
}

const HTML = montarHTML();

// O fonte, para as regras que são sobre COMO o código é escrito (regra 5, sem
// emoji) e não sobre o que o build produz. O bundler reescreve `const` em `var`
// e reindenta, então casar padrão de fonte contra o build dá falso negativo.
const SRC = path.join(RAIZ, 'src');
const FONTE = fs.readdirSync(SRC, { recursive: true })
  .filter(function (f) { return /\.(js|ts|jsx|tsx|css)$/.test(f); })
  .map(function (f) { return fs.readFileSync(path.join(SRC, f), 'utf8'); })
  .join('\n');

const DIA = 86400000;
const CHAVE = 'lastro-v1';
// A chave de antes do rename. Existe aqui para os testes da migração poderem
// semear o estado do jeito que ele está hoje no iPhone dele.
const CHAVE_LEGADO = 'treino-eduardo-v1';
// A sessão da nuvem tem chave própria: ela é DO APARELHO e não entra no estado
// sincronizado. Também foi renomeada, e também tem legado para promover.
const CHAVE_NUVEM = 'lastro-nuvem-v1';
const CHAVE_NUVEM_LEGADO = 'treino-nuvem-v1';

// segunda-feira 00:00 da semana de `t`, igual ao weekStart() do app
function inicioDaSemana(t) {
  const d = new Date(t);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());   // domingo, como weekStart
  return d.getTime();
}

function estadoVazio(extra) {
  return Object.assign({
    logs: {}, done: [], deload: false, draft: null, sessao: null,
    cardio: [], body: { peso: [], cintura: [] }, carga: {}, export: 0, plano: 2
  }, extra || {});
}

/**
 * @param {object} [opcoes]
 * @param {object|string} [opcoes.estado] estado inicial gravado no localStorage
 * @returns {object} app
 */
function abrirApp(opcoes) {
  const o = opcoes || {};
  const erros = [];
  const vibrou = [];
  const registro = { bipes: 0, wakeLock: 0, confirmou: [], respostas: [], aceita: true };

  const console_ = new VirtualConsole();
  console_.on('jsdomError', function (e) { erros.push(e.message); });

  const dom = new JSDOM(HTML, {
    runScripts: 'dangerously',
    // Com barra no fim, o parser de stack do Vitest resolve os frames do jsdom
    // para o diretório do projeto e estoura EISDIR ao formatar QUALQUER falha —
    // o relatório do arquivo inteiro some junto. Um nome de arquivo no fim
    // resolve para um caminho inexistente, que ele trata em silêncio.
    url: 'https://lastro.test/app.html',
    virtualConsole: console_,
    beforeParse: function (w) {
      w.scrollTo = function () {};
      w.confirm = function (msg) {
        registro.confirmou.push(msg);
        return o.confirmar !== false && registro.aceita;
      };
      // prompt devolve, em ordem, o que o teste enfileirou com responder()
      w.prompt = function (msg, padrao) {
        registro.confirmou.push(msg);
        return registro.respostas.length ? registro.respostas.shift() : padrao;
      };
      w.navigator.vibrate = function (p) { vibrou.push(p); return true; };

      // jsdom reporta 'prerender'; o app testa !document.hidden
      Object.defineProperty(w.document, 'hidden', { value: false, configurable: true });
      Object.defineProperty(w.document, 'visibilityState', { value: 'visible', configurable: true });

      w.AudioContext = function () {
        this.state = 'running';
        this.currentTime = 0;
        this.destination = {};
        this.resume = function () {};
        this.createGain = function () {
          return { gain: { setValueAtTime: function () {}, exponentialRampToValueAtTime: function () {} },
                   connect: function () {} };
        };
        this.createOscillator = function () {
          return { type: '', frequency: { setValueAtTime: function () {} },
                   connect: function () {}, start: function () { registro.bipes++; }, stop: function () {} };
        };
      };

      Object.defineProperty(w.navigator, 'wakeLock', {
        configurable: true,
        value: { request: function () {
          registro.wakeLock++;
          return Promise.resolve({ release: function () {}, addEventListener: function () {} });
        } }
      });

      // sem service worker nos testes
      Object.defineProperty(w.navigator, 'serviceWorker', {
        configurable: true,
        value: { register: function () { return Promise.reject(new Error('sem sw no teste')); } }
      });

      if (o.estado) {
        let e = o.estado;
        // Fixtures são escritas na forma posicional antiga ({ A0: [...] }),
        // porque é o que se lê. Entrar como plano 2 faz a migração reindexá-las
        // por exercício — e de quebra exercita a migração em toda suíte.
        // Teste que precisa de outro ponto de partida declara 'plano'.
        if (typeof e !== 'string' && e.plano === undefined) e = Object.assign({ plano: 2 }, e);
        w.localStorage.setItem(CHAVE, typeof e === 'string' ? e : JSON.stringify(e));
      }

      // Estado na chave ANTIGA, para exercitar a migração do boot. Pode vir
      // junto com `estado`: é assim que se reproduz a janela em que o build
      // antigo escreveu depois de a chave nova já existir.
      if (o.legado) {
        let e = o.legado;
        if (typeof e !== 'string' && e.plano === undefined) e = Object.assign({ plano: 2 }, e);
        w.localStorage.setItem(CHAVE_LEGADO, typeof e === 'string' ? e : JSON.stringify(e));
      }

      // Qualquer outra chave do aparelho, crua. É por aqui que se semeia a
      // sessão da nuvem, que não faz parte do estado e por isso não cabe em
      // `estado` nem em `legado`.
      if (o.chaves) {
        Object.keys(o.chaves).forEach(function (k) {
          const v = o.chaves[k];
          w.localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v));
        });
      }
    }
  });

  const w = dom.window;
  const d = w.document;
  const relogioReal = w.Date.now.bind(w.Date);

  const app = {
    dom: dom, window: w, doc: d, erros: erros, vibrou: vibrou, registro: registro,

    /** avalia uma expressão dentro do escopo do app */
    E: function (codigo) { return w.__escopo(codigo); },
    /** avalia e devolve já desserializado, para atravessar realms com segurança */
    J: function (codigo) { return JSON.parse(w.__escopo('JSON.stringify(' + codigo + ')')); },

    /** id do exercício que ocupa a posição i do treino d — a chave do histórico */
    k: function (dia, i) { return w.__escopo('id(' + JSON.stringify(dia) + ',' + i + ')'); },
    /** histórico daquela posição, já desserializado */
    log: function (dia, i) {
      return JSON.parse(w.__escopo('JSON.stringify(S.logs[id(' + JSON.stringify(dia) + ',' + i + ')] || null)'));
    },

    $: function (sel) { return d.querySelector(sel); },
    $$: function (sel) { return Array.from(d.querySelectorAll(sel)); },
    texto: function (sel) { const e = d.querySelector(sel); return e ? e.textContent.replace(/\s+/g, ' ').trim() : null; },

    /** espera o boot assíncrono do app (load() é async) */
    pronto: function () { return app.esperar(60); },
    /**
     * Abre uma aba da shell. Depois da fusão o app cai em HOJE, que é a tela
     * certa para quem acorda e olha o telefone — mas quase todo teste desta
     * pasta é sobre o TREINO, e por isso o harness abre lá por padrão. Quem
     * testa a fusão passa `aba` explicitamente.
     */
    aba: function (nome) { w.__escopo('CTX.vaiPara(' + JSON.stringify(nome) + ')'); },
    esperar: function (ms) { return new Promise(function (r) { setTimeout(r, ms == null ? 20 : ms); }); },

    /** preenche uma série; null em qualquer campo deixa o campo intocado */
    preencher: function (i, k, peso, reps) {
      if (peso !== null && peso !== undefined) app.digitar('w' + i + '_' + k, peso);
      if (reps !== null && reps !== undefined) app.digitar('r' + i + '_' + k, reps);
    },
    digitar: function (id, valor) {
      const el = d.getElementById(id);
      if (!el) throw new Error('campo ' + id + ' não existe na tela');
      el.value = String(valor);
      el.dispatchEvent(new w.Event('input', { bubbles: true }));
      return el;
    },
    clicar: function (sel) {
      const el = typeof sel === 'string' ? d.querySelector(sel) : sel;
      if (!el) throw new Error('elemento ' + sel + ' não existe na tela');
      el.dispatchEvent(new w.Event('click', { bubbles: true }));
    },

    /** avança o relógio do app sem esperar de verdade */
    viajar: function (ms) { w.Date.now = function () { return relogioReal() + ms; }; },
    relogioNormal: function () { w.Date.now = relogioReal; },

    toast: function () { const t = d.getElementById('toast'); return t ? t.textContent : null; },

    /** tudo que o app perguntou por confirm ou prompt */
    perguntas: function () { return registro.confirmou.slice(); },
    /** o próximo confirm passa a ser recusado */
    recusar: function () { registro.aceita = false; },
    aceitar: function () { registro.aceita = true; },
    /** enfileira a resposta de um prompt */
    responder: function (v) { registro.respostas.push(v); },

    /** o que ficou gravado no armazenamento */
    gravado: function () {
      const raw = w.localStorage.getItem(CHAVE);
      return raw ? JSON.parse(raw) : null;
    },

    /** o texto cru que sobrou na chave antiga; null quando a migração a apagou */
    legado: function () { return w.localStorage.getItem(CHAVE_LEGADO); },

    fechar: function () {
      try { w.__escopo('stopTimer()'); } catch (e) {}
      try { w.close(); } catch (e) {}
    }
  };

  return app;
}

/** sobe o app e espera ele terminar de carregar */
async function app(opcoes) {
  const a = abrirApp(opcoes);
  await a.pronto();
  a.aba((opcoes && opcoes.aba) || 'treino');
  return a;
}

export {
  app, abrirApp, estadoVazio, inicioDaSemana, DIA,
  CHAVE, CHAVE_LEGADO, CHAVE_NUVEM, CHAVE_NUVEM_LEGADO, HTML, FONTE
};