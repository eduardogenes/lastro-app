// Gera TREINO.md a partir do próprio app, para o documento nunca divergir do
// que está no PLAN. Rodar com: node tests/gerar-treino.js
const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

const raiz = path.join(__dirname, '..');
const dom = new JSDOM(fs.readFileSync(path.join(raiz, 'index.html'), 'utf8'), {
  runScripts: 'dangerously',
  url: 'https://treino.test/',
  virtualConsole: new VirtualConsole(),
  beforeParse: function (w) { w.scrollTo = function () {}; }
});

const E = function (c) { return JSON.parse(dom.window.eval('JSON.stringify(' + c + ')')); };

setTimeout(function () {
  const PLAN = E('PROGRAMA'), ALT = E('ALT'), RULES = E('RULES'), ROT = E('ROT_BASE');
  const CARGAS = E('CARGAS'), PRIO = E('PRIO'), MODAIS = E('MODAIS');

  const L = [];
  const p = function (s) { L.push(s == null ? '' : s); };

  p('# Treino');
  p('');
  p('Rotação de seis treinos, não semana fixa: avança sozinho conforme você');
  p('registra. Cinco a seis sessões por semana.');
  p('');
  p('**Objetivo:** hipertrofia com ganho de gordura controlado.');
  p('');
  p('**Pontos fracos priorizados:** ' + PRIO.join(', ') + '.');
  p('');
  p('Este é o programa **do treinador**, como ele prescreveu. O programa que');
  p('abre no app pode ter divergido: veja a diferença em ajustes → programa.');
  p('');
  p('Gerado a partir do app. Para atualizar depois de mexer no `PROGRAMA`:');
  p('`node tests/gerar-treino.js`');
  p('');
  p('---');
  p('');

  // ---------- resumo ----------
  p('## Visão geral');
  p('');
  p('| Treino | Foco | Exercícios | Séries |');
  p('|---|---|---|---|');
  ROT.forEach(function (d) {
    const P = PLAN[d];
    const series = P.ex.reduce(function (a, e) { return a + e.s; }, 0);
    p('| **' + d + '** | ' + P.name + ' | ' + P.ex.length + ' | ' + series + ' |');
  });
  p('');

  // ---------- séries por músculo na rotação ----------
  const porMusculo = {};
  ROT.forEach(function (d) {
    PLAN[d].ex.forEach(function (ex) {
      porMusculo[ex.g] = (porMusculo[ex.g] || 0) + ex.s;
    });
  });
  const musculos = Object.keys(porMusculo).sort(function (a, b) {
    const pa = PRIO.indexOf(a), pb = PRIO.indexOf(b);
    if (pa !== pb) return (pa < 0 ? 99 : pa) - (pb < 0 ? 99 : pb);
    return porMusculo[b] - porMusculo[a];
  });
  p('### Séries por músculo na rotação completa');
  p('');
  p('Uma rotação são seis sessões, o que dá aproximadamente uma semana.');
  p('');
  p('| Músculo | Séries | |');
  p('|---|---|---|');
  musculos.forEach(function (g) {
    p('| ' + g + ' | ' + porMusculo[g] + ' | ' + (PRIO.indexOf(g) >= 0 ? 'prioridade' : '') + ' |');
  });
  p('');
  p('---');
  p('');

  // ---------- os treinos ----------
  ROT.forEach(function (d) {
    const P = PLAN[d];
    p('## Treino ' + d + ' — ' + P.name);
    p('');
    p('*' + P.tag + '*');
    p('');

    P.ex.forEach(function (ex, i) {
      const car = CARGAS[ex.car] || CARGAS.pino;
      const tipo = ex.c ? 'composto, 1–2 na reserva'
                        : 'isolador, última série pode ir a 0–1 na reserva';
      const desc = (ex.d || (ex.c ? 180 : 90));
      const descTxt = desc % 60 === 0 ? (desc / 60) + ' min' : desc + ' s';
      p('### ' + String(i + 1).padStart(2, '0') + '. ' + ex.n);
      p('');
      p('**' + ex.s + ' × ' + ex.r + '**' + (ex.u === 'seg' ? ' (por tempo)' : '')
        + ' · ' + ex.g + ' · ' + tipo + ' · descanso ' + descTxt);
      p('');
      p('Carga: ' + car.nome + '. ' + car.ajuda);
      p('');
      p('> ' + ex.cue);
      p('');
      if (ex.bi === 1) { p('Encadeia direto no próximo exercício, sem descanso entre os dois.'); p(''); }
      if (ex.bi === 2) { p('Segundo do par: o descanso de 90 s é só depois dele.'); p(''); }

      const alts = ALT[ex.n] || [];
      if (alts.length) {
        p('Se a máquina estiver ocupada:');
        p('');
        alts.forEach(function (a) { p('- **' + a.n + '** — ' + a.w); });
        p('');
      }
    });
    p('---');
    p('');
  });

  // ---------- regras ----------
  p('## Como executar');
  p('');
  RULES.forEach(function (r) {
    p('### ' + r.t);
    p('');
    p('*' + r.k + '*');
    p('');
    r.p.forEach(function (x) {
      p(x.replace(/<b>/g, '**').replace(/<\/b>/g, '**'));
      p('');
    });
  });
  p('---');
  p('');

  // ---------- cardio e dieta ----------
  p('## Cardio');
  p('');
  p('20 minutos, 2 a 3 vezes por semana, intensidade leve a moderada — dá para');
  p('conversar, sem ofegar. Modalidades: ' + MODAIS.join(', ') + '.');
  p('');
  p('Existe por saúde cardiovascular, capacidade de trabalho e regulação do');
  p('apetite. **Não é queima de caloria** — o objetivo é ganhar massa, e por isso');
  p('também não há HIIT: a justificativa dele é eficiência de queima, e o custo é');
  p('fadiga competindo com os treinos de perna.');
  p('');
  p('Sempre depois da musculação ou em dia separado. Nunca antes do treino, e');
  p('nunca no mesmo período dos treinos C ou F.');
  p('');
  p('## Ajuste da dieta');
  p('');
  p('Decide a **média semanal**, nunca o peso do dia. Peso 3 a 4 vezes por semana,');
  p('cintura 1 vez por semana, sempre no mesmo ponto e horário.');
  p('');
  p('| Situação | O que fazer |');
  p('|---|---|');
  p('| Média subindo menos de 0,15 kg por semana, por 2 semanas | Comer mais |');
  p('| Média subindo mais de 0,4 kg por semana, por 2 semanas | Comer menos |');
  p('| Cintura subindo mais de 1,5 cm no mês | Comer menos |');
  p('');
  p('A cintura tem prioridade sobre o peso: se ela sobe, o superávit está virando');
  p('gordura mesmo que a balança esteja na faixa.');
  p('');

  const saida = path.join(raiz, 'TREINO.md');
  fs.writeFileSync(saida, L.join('\n'));
  console.log('TREINO.md gerado: ' + L.length + ' linhas');
  process.exit(0);
}, 500);
