// Quanto custa um render() em cada tela, e se os nós sobrevivem a ele.
//
// Rodar (detalhes, WebKit e CPU lenta no topo de desempenho-comum.mjs):
//   CHROME=~/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome \
//     node docs/motion/_medicao/desempenho-render.mjs http://localhost:4724/ docs/motion/_medicao/shots/desempenho
//   (LENTO=4 para a CPU 4× mais lenta; MOTOR=webkit para o WebKit; DIAS=365 para um ano de registro)
//
// Para cada tela: (1) a ENTRADA — o render() que a constrói, medido do lado do
// script (performance.now em volta da chamada) e o estilo+layout que ele deixa
// pendente (forçado com offsetHeight); (2) o RE-RENDER sem mudança nenhuma — é o
// que acontece quando um render() cai no meio de uma animação; (3) quantos nós o
// re-render cria, tira ou mexe (MutationObserver), e se o <main> e o primeiro
// botão da tela são os MESMOS nós depois dele. Por fim, o custo de gravar
// (save(): JSON.stringify do registro inteiro + localStorage).
import { abre, escopo, grava, mediana, maximo, MOTOR, LENTO, DIAS } from './desempenho-comum.mjs';

const { b, p, erros } = await abre();

const TELAS = [
  ['agora', `CTX.vaiPara('agora')`],
  ['dias', `CTX.vaiPara('dias')`],
  ['corpo', `CTX.vaiPara('corpo')`],
  ['semana', `CTX.vaiPara('semana')`],
  ['prescricao', `CTX.vaiPara('prescricao')`],
  ['ajustes (tela cheia)', `CTX.vaiPara('agora'); CTX.abreAjustes()`],
  ['dia aberto (tela cheia)', `CTX.vaiPara('dias'); CTX.abreDia(Date.now() - 2*86400000)`],
  ['programa (tela cheia)', `CTX.vaiPara('prescricao'); CTX.abrePrograma()`],
  ['modo de sessão, fechado', `CTX.vaiPara('agora'); CTX.abreTreinoDeHoje()`],
  ['modo de sessão, exercício aberto + régua', `CTX.vaiPara('agora'); CTX.abreTreinoDeHoje(); toggle(0); anotaSerie(0, 0, 0, 40); abreRegua(0, 0); render()`]
];

// Ponto neutro: fecha camada por camada pelo próprio Voltar do app, e vai ao Agora.
const neutro = () => escopo(p, `
  for (let n = 0; n < 20 && camadasAbertas(view).length; n++) voltarUmaCamada();
  CTX.vaiPara('agora'); render();`);

// A PRIMEIRA entrada em cada tela, a frio (caches de fonte e de estilo vazios):
// medida à parte, e depois uma passada de aquecimento. No WebKit do Linux a
// primeira entrada custa centenas de ms de layout por causa da busca de fonte
// de recurso (fontconfig) — artefato da máquina, não do iPhone; por isso a
// tabela principal mede a tela JÁ visitada uma vez.
const frio = {};
for (const [nome, abreTela] of TELAS) {
  await neutro(); await p.waitForTimeout(150);
  frio[nome] = await escopo(p, `(function () { const a0 = performance.now(); ${abreTela}; const a1 = performance.now();
    document.body.offsetHeight; return [a1 - a0, performance.now() - a1]; })()`);
}

const linhas = [];
for (const [nome, abreTela] of TELAS) {
  // volta a um ponto neutro (Agora, sem tela cheia) e espera assentar
  await neutro();
  await p.waitForTimeout(250);
  const r = await escopo(p, `
    (function () {
      // ENTRADA
      const a0 = performance.now();
      ${abreTela};
      const a1 = performance.now();
      document.body.offsetHeight;
      const a2 = performance.now();
      const nos = document.querySelectorAll('#app *').length;
      // RE-RENDER sem mudança, 15 vezes
      const main = document.querySelector('#app main') || document.querySelector('#app .tc') || document.querySelector('#app > *');
      const btn = document.querySelector('#app button');
      if (main) main.__marca = 1; if (btn) btn.__marca = 1;
      let add = 0, rem = 0, attr = 0, txt = 0;
      const mo = new MutationObserver(function (l) { l.forEach(function (m) {
        if (m.type === 'childList') { add += m.addedNodes.length; rem += m.removedNodes.length; }
        else if (m.type === 'attributes') attr++; else txt++; }); });
      mo.observe(document.getElementById('app'), { subtree: true, childList: true, attributes: true, characterData: true });
      const js = [], lay = [];
      for (let i = 0; i < 15; i++) {
        const t0 = performance.now(); render(); const t1 = performance.now();
        document.body.offsetHeight; const t2 = performance.now();
        js.push(t1 - t0); lay.push(t2 - t1);
      }
      const regs = mo.takeRecords(); regs.forEach(function (m) {
        if (m.type === 'childList') { add += m.addedNodes.length; rem += m.removedNodes.length; }
        else if (m.type === 'attributes') attr++; else txt++; });
      mo.disconnect();
      const main2 = document.querySelector('#app main') || document.querySelector('#app .tc') || document.querySelector('#app > *');
      const btn2 = document.querySelector('#app button');
      return {
        entradaJs: a1 - a0, entradaLayout: a2 - a1, nos: nos,
        reJs: js, reLayout: lay,
        mutacoesPor15: { add: add, rem: rem, attr: attr, txt: txt },
        mainPersiste: !!(main2 && main2.__marca), botaoPersiste: !!(btn2 && btn2.__marca),
        altura: document.documentElement.scrollHeight
      };
    })()
  `);
  linhas.push({
    tela: nome,
    nos: r.nos,
    alturaPx: r.altura,
    entradaJsMs: Math.round(r.entradaJs * 10) / 10,
    entradaLayoutMs: Math.round(r.entradaLayout * 10) / 10,
    primeiraVezJsMs: Math.round(frio[nome][0] * 10) / 10,
    primeiraVezLayoutMs: Math.round(frio[nome][1] * 10) / 10,
    reRenderJsMedianaMs: mediana(r.reJs), reRenderJsMaxMs: maximo(r.reJs),
    reRenderLayoutMedianaMs: mediana(r.reLayout),
    mutacoesEm15: r.mutacoesPor15,
    mainPersiste: r.mainPersiste, botaoPersiste: r.botaoPersiste
  });
  await p.screenshot({ path: `${process.argv[3] || 'docs/motion/_medicao/shots/desempenho'}/render-${MOTOR}-${nome.replace(/[^a-z]+/gi, '-')}.png` });
}

// O custo de gravar: o registro inteiro serializado e escrito, a cada gravação.
await neutro();
const gravar = await escopo(p, `
  (async function () {
    const s = [], j = [];
    for (let i = 0; i < 10; i++) {
      const t0 = performance.now(); const txt = JSON.stringify(S); const t1 = performance.now();
      j.push(t1 - t0);
      const n0 = window.__m.sets.length;
      const g0 = performance.now(); const pr = save(); const g1 = performance.now(); await pr; const g2 = performance.now();
      s.push({ sincrono: g1 - g0, total: g2 - g0, set: (window.__m.sets[n0] || {}).dur });
    }
    return { kb: Math.round(JSON.stringify(S).length / 1024), stringify: j, save: s };
  })()
`);

const fontes = await p.evaluate(() => [...document.fonts].filter(f => f.status === 'loaded').length + ' de ' + document.fonts.size + ' faces carregadas');
const saida = {
  motor: MOTOR, cpuLenta: LENTO, diasDeHistorico: DIAS, fontes,
  telas: linhas,
  gravar: {
    registroKb: gravar.kb,
    stringifyMedianaMs: mediana(gravar.stringify),
    saveSincronoMedianaMs: mediana(gravar.save.map(x => x.sincrono)),
    saveTotalMedianaMs: mediana(gravar.save.map(x => x.total)),
    setItemMedianaMs: mediana(gravar.save.map(x => x.set))
  },
  erros
};
console.table(linhas.map(l => ({ tela: l.tela, nos: l.nos, frioJs: l.primeiraVezJsMs, frioLayout: l.primeiraVezLayoutMs, entradaJs: l.entradaJsMs, entradaLayout: l.entradaLayoutMs,
  reJs: l.reRenderJsMedianaMs, reJsMax: l.reRenderJsMaxMs, mut: l.mutacoesEm15.add + l.mutacoesEm15.rem + l.mutacoesEm15.attr + l.mutacoesEm15.txt,
  persiste: l.mainPersiste && l.botaoPersiste })));
console.log(JSON.stringify({ gravar: saida.gravar, fontes, erros }));
console.log('gravado em', grava('render', saida));
await b.close();
