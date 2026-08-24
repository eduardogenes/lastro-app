// Gera docs/ANALISE-VOLUME.md a partir do PROGRAMA: a composição de cada
// músculo, para o treinador avaliar seleção e redundância antes de mexer em
// número. Rodar com: npm run volume
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { NIVEIS, PRIORIDADES, PROGRAMA, ROT_BASE as ROT, nivelDe } from '../src/dominio/programa.ts';

const raiz = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

const porMusculo = {};
let total = 0;
ROT.forEach(function (d) {
  PROGRAMA[d].ex.forEach(function (ex, i) {
    (porMusculo[ex.g] = porMusculo[ex.g] || []).push({ d: d, i: i, n: ex.n, s: ex.s, r: ex.r, c: ex.c });
    total += ex.s;
  });
});

const L = [];
const p = function (s) { L.push(s == null ? '' : s); };

p('# O que são as ' + total + ' séries');
p('');
p('Gerado do `PROGRAMA` do app. Serve para responder a pergunta do treinador:');
p('não *quantas* séries, mas **quais**.');
p('');
p('`npm run volume` refaz depois de qualquer mudança no plano. É a prescrição');
p('**do treinador**: o programa que abre no app pode ter divergido.');
p('');
p('> A contagem é de **séries diretas**, atribuídas a um músculo principal.');
p('> Tríceps também trabalha nos supinos, bíceps nas puxadas, glúteo no terra');
p('> e no leg press, e deltoide anterior no peito. O estímulo real desses é');
p('> maior que o número da tabela.');
p('');

const ordem = Object.keys(porMusculo).sort(function (a, b) {
  const na = NIVEIS.indexOf(nivelDe(a)), nb = NIVEIS.indexOf(nivelDe(b));
  if (na !== nb) return na - nb;
  const sa = porMusculo[a].reduce(function (x, e) { return x + e.s; }, 0);
  const sb = porMusculo[b].reduce(function (x, e) { return x + e.s; }, 0);
  return sb - sa;
});

NIVEIS.forEach(function (nv) {
  const mus = ordem.filter(function (g) { return nivelDe(g) === nv; });
  if (!mus.length) return;
  const titulo = { maxima:'Prioridade máxima', secundaria:'Prioridade secundária',
                   normal:'Desenvolvimento normal', indireto:'Estímulo indireto basta' }[nv];
  p('## ' + titulo);
  p('');
  mus.forEach(function (g) {
    const lista = porMusculo[g];
    const soma = lista.reduce(function (x, e) { return x + e.s; }, 0);
    const dias = {};
    lista.forEach(function (e) { dias[e.d] = (dias[e.d] || 0) + e.s; });
    p('### ' + g + ' — ' + soma + ' séries');
    p('');
    p('Distribuição: ' + Object.keys(dias).map(function (d) { return d + ' (' + dias[d] + ')'; }).join(', '));
    p('');
    p('| Treino | Exercício | Séries × reps | |');
    p('|---|---|---|---|');
    lista.forEach(function (e) {
      p('| ' + e.d + ' | ' + e.n + ' | ' + e.s + ' × ' + e.r + ' | ' + (e.c ? 'composto' : 'isolador') + ' |');
    });
    p('');

    // repetição literal do mesmo exercício em dias diferentes
    const cont = {};
    lista.forEach(function (e) { cont[e.n] = (cont[e.n] || 0) + 1; });
    const repetidos = Object.keys(cont).filter(function (n) { return cont[n] > 1; });
    if (repetidos.length) {
      p('Aparece em mais de um treino: ' + repetidos.map(function (n) { return '**' + n + '**'; }).join(', ') + '.');
      p('');
    }
  });
});

p('---');
p('');
p('## Distribuição por sessão');
p('');
p('| Treino | Foco | Séries |');
p('|---|---|---|');
ROT.forEach(function (d) {
  p('| ' + d + ' | ' + PROGRAMA[d].name + ' | ' + PROGRAMA[d].ex.reduce(function (a, e) { return a + e.s; }, 0) + ' |');
});
p('');
p('Total: **' + total + ' séries** em ' + ROT.length + ' sessões, média de ' +
  (Math.round(total / ROT.length * 10) / 10).toString().replace('.', ',') + ' por sessão.');
p('');

fs.writeFileSync(path.join(raiz, 'docs', 'ANALISE-VOLUME.md'), L.join('\n'));
console.log('docs/ANALISE-VOLUME.md gerado: ' + L.length + ' linhas');
