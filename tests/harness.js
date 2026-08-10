// Sobe o app num DOM de mentira para os testes.
//
// O app não tem build nem módulos: é um HTML único com tudo inline. Então o
// harness carrega o arquivo, deixa o script rodar, e expõe `E()` para avaliar
// expressões dentro do escopo do app — é como se chega em S, view, PLAN e nas
// funções internas, que não são exportadas.
//
// Tudo que o iOS oferece e o jsdom não tem (áudio, wake lock, vibração) entra
// como dublê. O que eles registram é observável nos testes.

const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

const HTML = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

const DIA = 86400000;
const CHAVE = 'treino-eduardo-v1';

// segunda-feira 00:00 da semana de `t`, igual ao weekStart() do app
function inicioDaSemana(t) {
  const d = new Date(t);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
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
  const registro = { bipes: 0, wakeLock: 0, confirmou: [] };

  const console_ = new VirtualConsole();
  console_.on('jsdomError', function (e) { erros.push(e.message); });

  const dom = new JSDOM(HTML, {
    runScripts: 'dangerously',
    url: 'https://treino.test/',
    virtualConsole: console_,
    beforeParse: function (w) {
      w.scrollTo = function () {};
      w.confirm = function (msg) { registro.confirmou.push(msg); return o.confirmar !== false; };
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
    }
  });

  const w = dom.window;
  const d = w.document;
  const relogioReal = w.Date.now.bind(w.Date);

  const app = {
    dom: dom, window: w, doc: d, erros: erros, vibrou: vibrou, registro: registro,

    /** avalia uma expressão dentro do escopo do app */
    E: function (codigo) { return w.eval(codigo); },
    /** avalia e devolve já desserializado, para atravessar realms com segurança */
    J: function (codigo) { return JSON.parse(w.eval('JSON.stringify(' + codigo + ')')); },

    /** id do exercício que ocupa a posição i do treino d — a chave do histórico */
    k: function (dia, i) { return w.eval('id(' + JSON.stringify(dia) + ',' + i + ')'); },
    /** histórico daquela posição, já desserializado */
    log: function (dia, i) {
      return JSON.parse(w.eval('JSON.stringify(S.logs[id(' + JSON.stringify(dia) + ',' + i + ')] || null)'));
    },

    $: function (sel) { return d.querySelector(sel); },
    $$: function (sel) { return Array.from(d.querySelectorAll(sel)); },
    texto: function (sel) { const e = d.querySelector(sel); return e ? e.textContent.replace(/\s+/g, ' ').trim() : null; },

    /** espera o boot assíncrono do app (load() é async) */
    pronto: function () { return app.esperar(60); },
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

    /** o que ficou gravado no armazenamento */
    gravado: function () {
      const raw = w.localStorage.getItem(CHAVE);
      return raw ? JSON.parse(raw) : null;
    },

    fechar: function () {
      try { w.eval('stopTimer()'); } catch (e) {}
      try { w.close(); } catch (e) {}
    }
  };

  return app;
}

/** sobe o app e espera ele terminar de carregar */
async function app(opcoes) {
  const a = abrirApp(opcoes);
  await a.pronto();
  return a;
}

module.exports = { app, abrirApp, estadoVazio, inicioDaSemana, DIA, CHAVE, HTML };
