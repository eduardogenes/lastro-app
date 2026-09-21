// Gera docs/TREINO.md a partir do próprio PROGRAMA, para o documento nunca
// divergir do código. Rodar com: npm run treino
//
// Antes isto subia um jsdom com o app inteiro só para alcançar `PROGRAMA` dentro
// do escopo do script. Agora o programa é um módulo: importa e pronto.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  ALT, CARGAS, MODAIS, PRIO, PROGRAMA, ROT_BASE as ROT, RULES
} from '../src/dominio/programa.ts';

const raiz = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

const L = [];
const p = function (s) { L.push(s == null ? '' : s); };

p('# Treino');
p('');
p('Rotação de ' + ROT.length + ' dias, não semana fixa: avança sozinho conforme você');
p('registra. Cinco sessões de musculação mais o HYROX de sábado; domingo descansa.');
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
  const P = PROGRAMA[d];
  const series = P.ex.reduce(function (a, e) { return a + e.s; }, 0);
  p('| **' + d + '** | ' + P.name + ' | ' + P.ex.length + ' | ' + series + ' |');
});
p('');

// ---------- séries por músculo na rotação ----------
// Exercício sem grupo declarado — as estações do HYROX — fica de fora: não há
// músculo a que atribuir, e contá-lo aqui faria a tabela mentir.
const porMusculo = {};
ROT.forEach(function (d) {
  PROGRAMA[d].ex.forEach(function (ex) {
    if (!ex.g) return;
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
p('Uma rotação são ' + ROT.length + ' sessões, o que dá uma semana.');
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
  const P = PROGRAMA[d];
  p('## Treino ' + d + ' — ' + P.name);
  p('');
  p('*' + P.tag + '*');
  p('');

  P.ex.forEach(function (ex, i) {
    const car = CARGAS[ex.car] || CARGAS.pino;
    const tipo = !ex.g ? 'condicionamento'
               : (ex.c ? 'composto' : 'isolador') + (ex.rir ? ', RIR ' + ex.rir : '');
    const desc = (ex.d || (ex.c ? 180 : 90));
    const descTxt = desc % 60 === 0 ? (desc / 60) + ' min' : desc + ' s';
    p('### ' + String(i + 1).padStart(2, '0') + '. ' + ex.n);
    p('');
    p('**' + ex.s + ' × ' + ex.r + '**' + (ex.u === 'seg' ? ' (por tempo)' : '')
      + (ex.g ? ' · ' + ex.g : '') + ' · ' + tipo + ' · descanso ' + descTxt);
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
p('Duas vezes por semana: **segunda, depois do treino A, 20 a 25 min**, e');
p('**quinta, no dia de recuperação, 25 a 30 min**. Intensidade leve a moderada —');
p('respirando mais forte, mas ainda dá para conversar. Modalidades: '
  + MODAIS.join(', ') + '.');
p('');
p('Existe por saúde cardiovascular, capacidade de trabalho e regulação do');
p('apetite. **Não é queima de caloria** — o objetivo é ganhar massa, e por isso');
p('também não há HIIT: a justificativa dele é eficiência de queima, e o custo é');
p('fadiga competindo com os treinos de perna.');
p('');
p('Sempre depois da musculação ou em dia separado. Nunca antes do treino, e');
p('nunca no mesmo período dos treinos B ou E, que são os dias de perna.');
p('');
p('## Ajuste da dieta');
p('');
p('Decide a **média semanal**, nunca o peso do dia, e o critério é de **duas');
p('semanas consecutivas** — não a média de duas. Peso 3 a 4 vezes por semana.');
p('');
p('A faixa-alvo é **+0,15 a +0,30 kg por semana**. É alvo de eficiência, não');
p('limite de velocidade: ganhar acima dela não é ruim por si, desde que esteja');
p('comprando músculo e performance.');
p('');
p('| Situação | O que fazer |');
p('|---|---|');
p('| Abaixo de 0,10 kg/semana por 2 semanas, com performance parada | +150 kcal |');
p('| Entre 0,15 e 0,30 kg/semana | Manter |');
p('| Entre 0,30 e 0,40 kg/semana | Manter e observar |');
p('| Acima de 0,40 kg/semana por 1 semana só | Nada |');
p('| Acima de 0,40 por 2 semanas, com aumento visual claro de gordura | −150 kcal |');
p('| Acima de 0,40 por 2 semanas, sem piora nas fotos | Manter |');
p('| Qualquer outro caso | Não alterar, continuar observando |');
p('');
p('**O peso sozinho nunca corta.** Ele abre revisão; o corte de −150 kcal só');
p('sai com adesão registrada E aumento visual claro de gordura. A regra é');
p('multifatorial de propósito.');
p('');
p('**O passo é fixo, nunca proporcional.** ±150 kcal, que na dieta-base são');
p('−60 g de arroz cozido no almoço e −60 g no jantar. Ganhar 0,90 kg/semana');
p('não gera corte maior que ganhar 0,41: os dados são ruidosos demais, e um');
p('corte proporcional transformaria água e glicogênio em déficit exagerado.');
p('');
p('**Depois de um ajuste, a nova ingestão vira a linha de base.** Cortou e o');
p('peso voltou à faixa? Mantém as calorias novas — não devolve as 150. Subir');
p('tem critério próprio, e é essa assimetria que evita o efeito sanfona.');
p('');
p('**Cintura saiu do algoritmo.** Ela era prioritária e vetava o peso; como');
p('medir não está acontecendo, as fotos padronizadas passaram a ser a segunda');
p('camada de confirmação. Medida ocasional vira informação complementar.');
p('');

const saida = path.join(raiz, 'docs', 'TREINO.md');
fs.writeFileSync(saida, L.join('\n'));
console.log('docs/TREINO.md gerado: ' + L.length + ' linhas');
