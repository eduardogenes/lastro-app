// Custódia dos dados: migração de formatos antigos, backup e reimportação.
// Regra 2 do projeto: nenhuma mudança pode quebrar o que já está salvo.
import { test } from 'vitest';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { app, DIA, FONTE } from './harness.js';

// Formato original: só logs e done, sem sid, dur, deload, cardio, body ou carga.
const ANTIGO = {
  logs: { A0: [{ t: Date.now() - 40 * DIA, sets: [[30, 10], [30, 10], [30, 9], [30, 9]] }] },
  done: [{ day: 'A', t: Date.now() - 40 * DIA }]
};

test('estado do formato original carrega com padrões', async () => {
  const a = await app({ estado: ANTIGO });
  assert.strictEqual(a.S().done.length, 1);
  assert.strictEqual(a.S().deload, false);
  assert.strictEqual(a.S().sessao, null);
  assert.strictEqual(a.S().export, 0);
  assert.deepStrictEqual(a.S().carga, {});
  assert.deepStrictEqual(a.S().cardio, []);
  assert.deepStrictEqual(a.S().body.peso, []);
  assert.strictEqual(a.v('nextDay'), 'B');
  a.fechar();
});

test('todas as telas renderizam com estado antigo', async () => {
  const a = await app({ estado: ANTIGO });
  ['hoje', 'treino', 'comida', 'dados', 'guia'].forEach(function (t) {
    a.aba(t);
    assert.ok(a.doc.getElementById('app').innerHTML.length > 600, 'aba ' + t + ' vazia');
  });
  a.fechar();
});

test('sessão sem sid abre no detalhe e mostra traço na duração', async () => {
  const a = await app({ estado: ANTIGO });
  a.v('abrirSessao', ANTIGO.done[0].t);
  assert.ok(a.$$('.hs').length > 0, 'exercícios do dia aparecem');
  assert.strictEqual(a.$$('.stats b')[0].textContent, '–', 'aquele tempo nunca foi medido');
  a.fechar();
});

test('a referência do exercício vem do histórico antigo', async () => {
  const a = await app({ estado: ANTIGO });
  a.v('go', 'A');
  a.v('toggle', 0);
  assert.match(a.texto('.ex.open .setrow .setant'), /^30 × /);
  a.fechar();
});

test('exportar carrega todos os campos do estado', async () => {
  const a = await app();
  a.v('toggle', 0);
  a.preencher(0, 0, 40, 10);
  a.aba('guia');
  await a.modo('o app');
  a.v('showJSON');

  const bkp = JSON.parse(a.doc.getElementById('jout').value);
  assert.strictEqual(bkp.app, 'lastro');
  assert.deepStrictEqual(
    Object.keys(bkp.data).sort(),
    ['body', 'cardio', 'carga', 'deload', 'done', 'draft', 'ex', 'export', 'logs',
     'mods', 'plano', 'prog', 'progLog', 'rot', 'sessao',
     // a fusão: sem estes no backup, trocar de celular perderia o plano
     // nutricional, a cadência e o ajuste calórico em vigor
     'ajuste', 'cadencia', 'comida', 'compras', 'dia', 'perfManual',
     // o ledger do ajuste: o saldo sozinho não diz de onde veio, e a regra
     // do nutricionista audita justamente as trocas contra a adesão da época
     'ajusteHist',
     // as leituras de gordura visual: é o sinal que destrava o corte, e sem
     // ele no backup trocar de celular faria o app voltar a só abrir revisão
     'gordura',
     // o quadro do box do dia em curso: se ficar de fora, trocar de aparelho
     // no meio da aula perde a lousa antes de ela virar nota da sessão
     'quadro',
     // a sincronização: o carimbo do estado e as lápides do que foi apagado
     'mtime', 'apagados',
     // os dias que ele marcou como descanso
     'descanso', 'fotos', 'promoPendente',
     // os modelos de aula de box: coleção com chave natural, some se ficar de fora
     'aulas',
     // os dias de comida já fechados — o histórico que a virada da data
     // costumava apagar
     'comidaHist',
     // o protocolo de fotos: a ORDEM de poses e as sessões. Só as referências
     // entram — os bytes moram no Cache Storage e replicam pelo bucket, e é
     // por isso que um backup em JSON continua cabendo num e-mail
     'protocolo'].sort()
  );
  a.fechar();
});

test('apagar e reimportar devolve os dados idênticos', async () => {
  const a = await app();
  a.v('toggle', 0);
  a.preencher(0, 0, 40, 10);
  a.preencher(0, 1, 40, 9);
  a.v('abrirAdicionar', (Date.now() - 2 * DIA));
  a.v('addSet', 'tipo', 'livre');
  a.v('addSet', 'grupo', 'dorsal');
  await a.v('gravarRetro', false);
  await a.esperar();

  a.aba('guia');
  await a.modo('o app');
  a.v('showJSON');
  const bkp = a.doc.getElementById('jout').value;
  const antes = JSON.parse(bkp).data;

  await a.v('wipe');
  await a.esperar();
  assert.strictEqual(a.S().done.length, 0);

  a.aba('guia');
  await a.v('importText', bkp);
  await a.esperar(60);

  assert.deepStrictEqual(a.S().logs, antes.logs);
  assert.strictEqual(a.S().done.length, antes.done.length);
  assert.strictEqual(a.E('S.done.filter(function (x) { return x.livre; }).length'), 1);
  a.fechar();
});

test('importar lixo não toca no estado', async () => {
  const a = await app();
  a.v('toggle', 0);
  a.preencher(0, 0, 40, 10);
  const antes = a.S().logs;

  a.aba('guia');
  await a.v('importText', '{ isso nao e json');
  assert.ok(a.toast().includes('JSON inválido'));

  await a.E('importText(JSON.stringify({ qualquer: 1 }))');
  assert.ok(a.toast().includes('não parece'));

  assert.deepStrictEqual(a.S().logs, antes);
  a.fechar();
});

test('importar aceita o objeto cru, sem envelope', async () => {
  const a = await app();
  const cru = JSON.stringify({ logs: ANTIGO.logs, done: ANTIGO.done });
  a.aba('guia');
  await a.v('importText', cru);
  await a.esperar(60);
  assert.strictEqual(a.S().done.length, 1);
  a.fechar();
});

test('histórico longo não é truncado', async () => {
  // O teto antigo de 12 apagava em silêncio o histórico de longo prazo.
  const logs = { A0: [] }, done = [];
  for (let k = 0; k < 40; k++) {
    const t = Date.now() - (60 - k) * DIA;
    logs.A0.push({ t: t, sid: t, sets: [[30 + k, 10]] });
    done.push({ day: 'A', t: t, sid: t, dur: 50 * 60000 });
  }
  const a = await app({ estado: { logs: logs, done: done } });
  assert.strictEqual(a.log('A',0).length, 40);
  assert.strictEqual(a.log('A',0)[0].sets[0][0], 30, 'a primeira sessão continua lá');
  a.fechar();
});

test('abrir o JSON conta como backup', async () => {
  const a = await app({ estado: { logs: {}, done: [{ day: 'A', t: Date.now() - 60 * DIA }] } });
  assert.ok(a.v('diasSemBackup') > 30);
  a.aba('guia');
  assert.ok(a.$('.gu-cobra'), 'o GUIA cobra o backup quando passou de 30 dias');
  assert.match(a.texto('.gu-cobra'), /backup|exportou/);

  a.v('showJSON');
  await a.esperar();
  assert.ok(a.S().export > 0, 'quem copia o texto na mão também fez backup');
  a.aba('guia');
  assert.strictEqual(a.$('.gu-cobra'), null, 'e para de cobrar depois que ele exporta');
  a.fechar();
});

test('dados sobrevivem a fechar e reabrir o app', async () => {
  const a = await app();
  a.v('toggle', 0);
  a.preencher(0, 0, 42.5, 10);
  await a.esperar(900);                 // espera o debounce do save
  const gravado = a.gravado();
  assert.ok(gravado, 'nada foi para o armazenamento');
  a.fechar();

  const b = await app({ estado: gravado });
  assert.deepStrictEqual(b.log('A',0)[0].sets[0], [42.5, 10]);
  b.fechar();
});

// ---------- troca de programa e reindexação ----------
// Duas migrações em cadeia. A do plano 2 arquivou o histórico do programa
// anterior, porque a chave era dia+posição e o exercício novo herdaria a
// carga do antigo. A do plano 3 reindexa tudo pelo exercício — e nisso
// devolve ao histórico ativo os arquivados que continuam no programa.

test('histórico do plano antigo é reindexado, não apagado', async () => {
  const t = Date.now() - 10 * DIA;
  const a = await app({ estado: {
    plano: 1,   // exatamente o estado de quem já usava o app
    logs: {
      A0: [{ t: t, sid: t, sets: [[30, 10], [30, 10]] }],                    // supino inclinado com halteres
      'B2~Remada unilateral na polia baixa': [{ t: t, sid: t, sets: [[40, 10]] }],
      C0: [{ t: t, sid: t, sets: [[100, 8]] }]
    },
    done: [{ day: 'A', t: t, sid: t, dur: 50 * 60000 }],
    carga: { A1: 'lado' }
  } });
  await a.esperar();

  const chaves = a.J('Object.keys(S.logs).sort()');
  assert.deepStrictEqual(chaves, [
    'agachamento-hack',
    'remada-unilateral-na-polia-baixa',
    'supino-inclinado-com-halteres'
  ], 'chave por exercício, não por posição');

  assert.strictEqual(a.S().plano, a.dado('PLANO_ATUAL'), 'a cadeia inteira roda');
  assert.deepStrictEqual(a.S().logs["supino-inclinado-com-halteres"][0].sets, [[30, 10], [30, 10]],
    'as séries continuam íntegras');
  assert.deepStrictEqual(a.S().carga, {}, 'correção de carga apontava para posição antiga');
  assert.strictEqual(a.S().done.length, 1, 'o calendário não é tocado');

  // agachamento hack saiu do programa mas é substituto do pendulum: continua
  // no catálogo. supino inclinado com halteres também.
  assert.ok(!!a.dado('CAT')["agachamento-hack"], 'exercício conhecido continua no catálogo');
  assert.strictEqual(a.dado('CAT')["agachamento-hack"].n, 'Agachamento hack');
  a.fechar();
});

test('exercício que sumiu do catálogo vira arquivado, com nome e histórico', async () => {
  const t = Date.now() - 10 * DIA;
  const a = await app({ estado: {
    plano: 2,
    logs: { 'antigo~Aparelho que não existe mais': [{ t: t, sid: t, sets: [[10, 10]] }] },
    done: []
  } });
  await a.esperar();
  const k = 'aparelho-que-nao-existe-mais';
  assert.ok(a.S().ex[k], 'entra no catálogo do usuário, marcado como arquivado');
  assert.strictEqual(a.E('CAT["' + k + '"].n'), 'Aparelho que não existe mais');
  assert.strictEqual(a.E('CAT["' + k + '"].arq'), 1);
  assert.strictEqual(a.S().logs[k].length, 1, 'histórico intacto');
  a.fechar();
});

test('substituto antigo passa a viver no histórico do próprio exercício', async () => {
  const t = Date.now() - 10 * DIA;
  const a = await app({ estado: {
    plano: 2,
    logs: { 'A1~Crossover na polia baixa': [{ t: t, sid: t, sets: [[20, 12]] }] },
    done: []
  } });
  await a.esperar();
  const h = a.S().logs['crossover-na-polia-baixa'];
  assert.ok(h, 'saiu da chave derivada');
  assert.strictEqual(h[0].sl, a.k('A', 1), 'guardando de que posição do treino veio');
  a.fechar();
});

test('exercício novo não herda a carga do que ocupava a posição', async () => {
  const t = Date.now() - 10 * DIA;
  const a = await app({ estado: {
    plano: 1,
    logs: { A0: [{ t: t, sid: t, sets: [[30, 10], [30, 10], [30, 10]] }] },
    done: [{ day: 'F', t: t, sid: t }]
  } });
  await a.esperar();
  a.v('go', 'A');
  a.v('toggle', 0);
  // vazio, não 'kg': a unidade fica no rótulo ao lado, e o placeholder é
  // reservado para o dado — a carga da última vez. Sem histórico, sem número.
  assert.strictEqual(a.doc.getElementById('w0_0').placeholder, '', 'sem referência: é outro exercício');
  assert.strictEqual(a.log('A', 0), null, 'o chest press não herdou nada do supino');
  assert.strictEqual(a.$('.up'), null, 'e sem selo de subir carga herdado');
  a.fechar();
});

test('sessão anterior à troca continua abrindo no calendário', async () => {
  const t = Date.now() - 10 * DIA;
  const a = await app({ estado: {
    plano: 1,
    logs: { A0: [{ t: t, sid: t, sets: [[30, 10], [30, 10]] }] },
    done: [{ day: 'A', t: t, sid: t, dur: 50 * 60000 }]
  } });
  await a.esperar();
  a.aba('dados');
  a.v('abrirSessao', t);
  const txt = a.doc.getElementById('app').textContent;
  assert.ok(txt.includes('Supino inclinado com halteres'), txt.slice(0, 300));
  assert.ok(txt.includes('fora do treino'), 'sinalizado como fora do treino de hoje');
  a.fechar();
});

test('a migração roda uma vez só', async () => {
  const t = Date.now() - 10 * DIA;
  const a = await app({ estado: {
    plano: 1, logs: { A0: [{ t: t, sid: t, sets: [[30, 10]] }] }, done: []
  } });
  await a.esperar();
  // As migrações recebem o estado desde que viraram módulo: dá para testá-las
  // contra uma fixture sem subir o app (ver tests/dominio/migracoes.test.js).
  assert.strictEqual(a.E('migraPlano(S)'), 0, 'segunda passada não mexe em nada');
  assert.strictEqual(a.E('migraPlano3(S)'), null);
  assert.deepStrictEqual(a.J('Object.keys(S.logs)'), ['supino-inclinado-com-halteres']);
  a.fechar();
});

test('o backup sai em UTF-8, e o acento sobrevive à volta', async () => {
  // Um backup real voltou de fora com "Peito superior + lateral + trÃ­ceps" e
  // "6â10": é o texto UTF-8 lido como Latin-1. O app grava certo — o Blob
  // sempre serializa a string em UTF-8 —, mas sem `charset` no tipo MIME o
  // leitor do outro lado adivinha, e adivinha errado.
  const a = await app();

  const txt = a.v('payload');
  const o = JSON.parse(txt);
  assert.ok(o.data.prog.A.name.includes('tríceps'), 'acento cru no export: ' + o.data.prog.A.name);
  assert.ok(/6–10/.test(o.data.prog.A.ex[0].r), 'travessão cru no export: ' + o.data.prog.A.ex[0].r);

  // a marca da corrupção, para o teste saber reconhecê-la
  const comoLatin1 = Buffer.from(o.data.prog.A.name, 'utf8').toString('latin1');
  assert.notStrictEqual(o.data.prog.A.name, comoLatin1);
  assert.ok(/Ã|â/.test(comoLatin1), 'é esta a forma que o texto assume quando lido errado');

  // e o tipo declarado no download diz qual é a codificação
  assert.ok(/application\/json;charset=utf-8/.test(FONTE),
    'o Blob do export precisa declarar charset=utf-8');

  a.fechar();
});

test('reimportar devolve TODOS os campos, não só as séries', async () => {
  // O caminho de volta dele é exportar e importar. A exportação leva o estado
  // inteiro e tem asserção que cobra isso; a importação é lista branca, e a
  // lista tinha ficado para trás em seis campos. Como `normalizaEstado()` roda
  // logo depois e devolve os seis vazios, o app abria limpo e não avisava nada:
  // o backup continuava no disco, intacto e inútil.
  const a = await app();

  // os seis que sumiam, com conteúdo reconhecível
  a.E(`S.ajusteHist = [{ t: 1, de: 0, para: -1, k: 'menos', p: 150, reg: 12 }]`);
  a.E(`S.aulas = [{ n: 'HYROX sexta', mov: [{ n: 'wall ball', s: 3, q: 20, u: 'rep' }] }]`);
  a.E(`S.comidaHist = [{ d: '2026-09-30', kcal: 2410, aderencia: 'plano' }]`);
  a.E(`S.gordura = [{ d: '2026-09-28', v: 'nao' }]`);
  a.E(`S.protocolo = { poses: ['frente-relaxado'], sessoes: [{ d: '2026-09-28', t: 1, m: 1, fotos: {} }] }`);
  a.E(`S.quadro = { day: 'F', texto: '5 RNDS · 20 WB', t: 1 }`);

  // As cinco chaves da bioimpedância, que a migração 9→10 abriu. Entram aqui
  // com conteúdo porque sem conteúdo a perda seria MUDA: `normalizaEstado()`
  // roda depois da importação e devolve a chave como lista vazia, então uma
  // lista branca incompleta passaria batida contra um corpo vazio. É o mesmo
  // mecanismo que escondeu os seis campos de topo.
  a.E(`S.body.bioPeso = [{ t: 1790000000000, v: 79.2, m: 1790000000000 }]`);
  a.E(`S.body.bioMusculo = [{ t: 1790000000000, v: 37.4, m: 1790000000000 }]`);
  a.E(`S.body.bioGordura = [{ t: 1790000000000, v: 14.1, m: 1790000000000 }]`);
  a.E(`S.body.bioGorduraPct = [{ t: 1790000000000, v: 17.8, m: 1790000000000 }]`);
  a.E(`S.body.bioAgua = [{ t: 1790000000000, v: 45.3, m: 1790000000000 }]`);
  // e os três campos novos do dia de comida, dentro de `S.dia`
  a.v('diaDeComida');
  a.E(`S.dia.done = { pos: 1790000000000 }`);
  a.E(`S.dia.como = { pos: 'fora' }`);
  a.E(`S.dia.aguaNaoContada = 1`);
  // a lista de perguntas de programa que esperam — coleção desde o plano 10
  a.E(`S.promoPendente = [{ sid: 1790000000000, day: 'A', t: 1790000000000, m: 1790000000000,
        mods: [{ k: 'sets', slot: 'pushdown', de: 2, para: 3 }],
        resumoMods: ['Pushdown: 2 → 3 séries'] }]`);
  await a.v('save');

  a.aba('guia');
  await a.modo('o app');
  a.v('showJSON');
  const bkp = a.doc.getElementById('jout').value;
  const antes = JSON.parse(bkp).data;

  await a.v('wipe');
  await a.esperar();
  a.aba('guia');
  await a.v('importText', bkp);
  await a.esperar(60);

  // nenhum campo exportado pode se perder na volta
  const depois = a.S();
  const sumiram = Object.keys(antes).filter(k => {
    // `mtime` é o carimbo do estado: ele muda ao gravar, e mudar é o certo.
    if (k === 'mtime') return false;
    const d = JSON.stringify(depois[k]), o = JSON.stringify(antes[k]);
    return o !== undefined && o !== 'null' && o !== '[]' && o !== '{}' && d !== o;
  });
  assert.deepStrictEqual(sumiram, [], 'campos perdidos na importação');

  // e os seis, nominalmente, porque são o motivo deste teste existir
  assert.strictEqual(a.S().ajusteHist.length, 1, 'o ledger do ajuste');
  assert.strictEqual(a.S().aulas.length, 1, 'os modelos de aula');
  assert.strictEqual(a.S().comidaHist.length, 1, 'os dias de comida fechados');
  assert.strictEqual(a.S().gordura.length, 1, 'as leituras de gordura visual');
  assert.strictEqual(a.S().protocolo.sessoes.length, 1, 'as sessões de foto');
  assert.strictEqual(a.E('S.quadro ? S.quadro.texto : null'), '5 RNDS · 20 WB', 'o quadro do dia');

  // e, nominalmente, o que entrou na migração 9→10: a lista branca da
  // importação é por CHAVE dentro de `body`, então uma grandeza nova que não
  // entrasse nela sumiria sem a asserção de topo notar
  assert.strictEqual(a.S().body.bioPeso.length, 1, 'o peso da bioimpedância');
  assert.strictEqual(a.S().body.bioMusculo[0].v, 37.4, 'a massa muscular esquelética');
  assert.strictEqual(a.S().body.bioGordura[0].v, 14.1, 'a massa de gordura');
  assert.strictEqual(a.S().body.bioGorduraPct[0].v, 17.8, 'o percentual de gordura');
  assert.strictEqual(a.S().body.bioAgua[0].v, 45.3, 'a água corporal total');
  assert.strictEqual(a.S().body.peso.length, antes.body.peso.length,
    'e a pesagem da manhã segue sendo outro registro, intocada');
  assert.strictEqual(a.S().dia.done.pos, 1790000000000, 'o instante da marca');
  assert.strictEqual(a.S().dia.como.pos, 'fora', 'qual refeição saiu do plano');
  assert.strictEqual(a.S().dia.aguaNaoContada, 1, '"não contei a água" como fato');
  assert.strictEqual(a.S().promoPendente.length, 1, 'a pergunta de programa que espera');
  assert.strictEqual(a.S().promoPendente[0].sid, 1790000000000, 'com a chave natural dela');
  a.fechar();
});

test('as sete medidas do corpo saem e voltam pelo nome, uma a uma', async () => {
  // A asserção da exportação (acima) tranca as chaves de TOPO, e `body` é uma
  // só. As grandezas moram dentro dela, e a importação as copia por nome: sem
  // este teste, acrescentar a oitava medida e esquecer a lista branca não
  // deixaria nada vermelho.
  const a = await app();
  const chaves = a.dado('MARCAS_DO_CORPO');
  assert.deepStrictEqual(chaves.slice().sort(), [
    'bioAgua', 'bioGordura', 'bioGorduraPct', 'bioMusculo', 'bioPeso', 'cintura', 'peso'
  ], 'peso da manhã, cintura e as cinco da bioimpedância');

  // uma medida reconhecível em cada, com valor diferente por grandeza
  chaves.forEach(function (k, i) {
    a.E('S.body[' + JSON.stringify(k) + '] = [{ t: ' + (1790000000000 + i) +
        ', v: ' + (10 + i) + ', m: 1 }]');
  });
  await a.v('save');

  a.aba('guia');
  await a.modo('o app');
  a.v('showJSON');
  const bkp = a.doc.getElementById('jout').value;
  assert.deepStrictEqual(Object.keys(JSON.parse(bkp).data.body).sort(), chaves.slice().sort(),
    'a exportação leva o estado inteiro, então as sete saem');

  await a.v('wipe');
  await a.esperar();
  a.aba('guia');
  await a.v('importText', bkp);
  await a.esperar(60);

  chaves.forEach(function (k, i) {
    assert.strictEqual(a.E('S.body[' + JSON.stringify(k) + '].length'), 1, k + ' voltou');
    assert.strictEqual(a.E('S.body[' + JSON.stringify(k) + '][0].v'), 10 + i,
      k + ' voltou com o valor dela, e não com o de outra grandeza');
  });
  a.fechar();
});

test('o estado congelado do plano 9 entra pelo boot e sai migrado', async () => {
  // A migração roda no boot E na importação, pelo mesmo caminho — é a regra do
  // `ARQUITETURA`. Os testes de domínio exercitam `migraPlano10` direto; este
  // prova que ela está LIGADA na cadeia do boot, e com o dado da época: o
  // arquivo é o estado inteiro que o build do plano 9 escreveu.
  const cru = fs.readFileSync(
    path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'dominio', 'fixtures', 'estado-plano-9.json'),
    'utf8'
  );
  const era = JSON.parse(cru);
  assert.strictEqual(era.plano, 9, 'a fixture é do plano 9');
  assert.deepStrictEqual(Object.keys(era.body).sort(), ['cintura', 'peso']);
  assert.deepStrictEqual(era.dia.done, { pos: 1, almoco: 1, lanche: 1 }, 'a marca era o literal 1');

  const a = await app({ estado: cru, agora: new Date(era.dia.data + 'T10:00:00').getTime() });
  await a.esperar();

  assert.strictEqual(a.S().plano, a.dado('PLANO_ATUAL'), 'a cadeia inteira roda no boot');
  assert.ok(a.S().plano >= 10, 'passou pela 9→10');

  const meiaNoite = new Date(era.dia.data + 'T00:00:00').getTime();
  assert.deepStrictEqual(a.S().dia.done,
    { pos: meiaNoite, almoco: meiaNoite, lanche: meiaNoite },
    'as três marcas ganharam o instante mais antigo compatível com a data');

  assert.deepStrictEqual(Object.keys(a.S().body).sort(), [
    'bioAgua', 'bioGordura', 'bioGorduraPct', 'bioMusculo', 'bioPeso', 'cintura', 'peso'
  ], 'as cinco chaves da bioimpedância existem');
  assert.deepStrictEqual(a.S().body.peso, era.body.peso,
    'e a pesagem da manhã atravessa intocada: ela é outro registro');
  assert.deepStrictEqual(a.S().body.bioPeso, [], 'a da balança começa vazia');

  assert.deepStrictEqual(a.S().comidaHist, era.comidaHist,
    'o histórico já tinha instante, e migração não reescreve o que está certo');

  assert.strictEqual(era.promoPendente, null, 'no plano 9 era documento');
  assert.deepStrictEqual(a.S().promoPendente, [], 'e sai como coleção');

  // e as telas abrem com ele, que é o que a regra 2 cobra
  ['hoje', 'treino', 'comida', 'dados', 'guia'].forEach(function (t) {
    a.aba(t);
    assert.ok(a.doc.getElementById('app').innerHTML.length > 600, 'aba ' + t + ' vazia');
  });
  a.fechar();
});

test('o estado congelado do plano 10 entra pelo boot e sai com a ceia', async () => {
  // A ceia é a única coisa da migração 10→11 que o app precisa levar ao estado:
  // o plano é documento persistido. O Neston chega pelo build, sem migração.
  const cru = fs.readFileSync(
    path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'dominio', 'fixtures', 'estado-plano-10.json'),
    'utf8'
  );
  const era = JSON.parse(cru);
  assert.strictEqual(era.plano, 10, 'a fixture é do plano 10');
  assert.deepStrictEqual(era.comida.plano.map(r => r.id),
    ['pre', 'treino', 'pos', 'almoco', 'lanche', 'jantar'], 'sem ceia');

  const a = await app({ estado: cru, agora: new Date(era.dia.data + 'T10:00:00').getTime() });
  await a.esperar();

  assert.strictEqual(a.S().plano, a.dado('PLANO_ATUAL'));
  assert.deepStrictEqual(a.J('S.comida.plano.map(function(r){return r.id})'),
    ['pre', 'treino', 'pos', 'almoco', 'lanche', 'jantar', 'ceia']);
  assert.strictEqual(a.E('S.comida.plano.filter(function(r){return r.id==="ceia"})[0].t'), '21:30');

  // o Neston está no catálogo sem nunca ter entrado no estado
  assert.ok(a.E('!!catalogoAlimentos().neston'), 'o catálogo é derivado do código');
  assert.deepStrictEqual(a.S().comida.alimentos, {}, 'e o estado não guarda a biblioteca');

  // a ceia aparece na timeline de HOJE, no relógio dela
  a.aba('hoje');
  await a.esperar();
  const ordem = a.J('CTX.hoje().refs.map(function(r){return r.t+" "+r.id})');
  assert.strictEqual(ordem[ordem.length - 1], '21:30 ceia', 'última do relógio');

  // e o dia já fechado não foi reescrito
  assert.deepStrictEqual(a.S().comidaHist, era.comidaHist,
    'o histórico congelado atravessa a migração intacto');

  // a importação é o OUTRO caminho pelo qual a migração tem que rodar: um
  // backup do plano 10 entra aqui e também sai com a ceia
  a.aba('guia');
  await a.v('importText', JSON.stringify({ app: 'lastro', data: era }));
  await a.esperar(60);
  assert.strictEqual(a.S().plano, a.dado('PLANO_ATUAL'), 'a cadeia roda na importação também');
  assert.deepStrictEqual(a.J('S.comida.plano.map(function(r){return r.id})'),
    ['pre', 'treino', 'pos', 'almoco', 'lanche', 'jantar', 'ceia'],
    'o backup do plano 10 restaurado não volta sem a ceia');
  a.fechar();
});

// ===========================================================================
// `ctx.apagaTudo` — a única ação do app que apaga o histórico inteiro
// ===========================================================================
//
// `wipe` já tinha rede: `dados` o usa quatro vezes como PREPARO de um caso de
// importação, e `fusao` :: *apagar o histórico não apaga o plano nutricional*
// cobre um campo. Nenhum caso cobria o ESCOPO — e num verbo sem desfazer o
// escopo é a capacidade. Estes entram por `ctx.apagaTudo`, que é a chave que a
// tela usa, e nenhum deles afirma que existe botão ligado nela.

/** O estado mais cheio que o app aceita: um campo de cada família. */
function estadoCheio(t) {
  return {
    logs: { A0: [{ t: t, sid: t, sets: [[60, 10]] }] },
    done: [{ day: 'A', t: t, sid: t }],
    cardio: [{ t: t, m: 'bike', min: 25, i: 'moderado' }],
    body: { peso: [{ t: t, v: 80 }], cintura: [{ t: t, v: 85 }] },
    carga: { A0: 'livre' },
    ex: { meu: { n: 'Meu aparelho', g: 'peito' } },
    aulas: [{ nome: 'sabado do box', blocos: [] }],
    comidaHist: [{ d: '2026-10-01', done: {}, agua: 0, escala: {}, tot: {}, pv: 1, m: t }],
    protocolo: { poses: ['frente'], sessoes: [{ t: t, fotos: {} }] },
    fotos: { A0: { k: 'x' } },
    apagados: { 'log:nada:1:nada': t },
    progLog: [{ t: t, k: 'troca' }],
    quadro: { texto: 'wod de sabado' }
  };
}

test('ctx.apagaTudo pergunta antes, e recusar não apaga nada', async () => {
  const t = Date.now() - 2 * DIA;
  const a = await app({ estado: estadoCheio(t) });

  a.recusar();
  await a.v('ctx.apagaTudo');
  await a.esperar(60);

  assert.strictEqual(a.S().done.length, 1, 'recusar deixa o histórico inteiro de pé');
  assert.strictEqual(Object.keys(a.S().logs).length, 1);
  const q = a.perguntas().join(' | ');
  assert.ok(/não tem volta/.test(q), 'e o aviso diz que não tem volta: ' + q);
  a.fechar();
});

test('ctx.apagaTudo leva o que foi REGISTRADO e deixa o que foi PRESCRITO', async () => {
  // A simetria do produto: apagar o registro nunca apaga a prescrição. Se um
  // destes dois grupos trocar de lado, este caso cai — e é a única coisa que
  // cai, porque nada mais olha o escopo.
  const t = Date.now() - 2 * DIA;
  const a = await app({ estado: estadoCheio(t) });
  const prog = JSON.stringify(a.S().prog), comida = JSON.stringify(a.S().comida);
  const rot = a.S().rot.slice();

  await a.v('ctx.apagaTudo');
  await a.esperar(60);
  const d = a.S();

  // o registrado vai
  assert.deepStrictEqual(Object.keys(d.logs), [], 'as séries vão');
  assert.deepStrictEqual(d.done, [], 'as sessões vão');
  assert.deepStrictEqual(d.cardio, [], 'o cardio vai');
  assert.deepStrictEqual(d.body.peso, [], 'as pesagens vão');
  assert.deepStrictEqual(d.body.cintura, [], 'as cinturas vão');
  assert.deepStrictEqual(d.carga, {}, 'a correção de tipo de carga vai');
  assert.deepStrictEqual(d.comidaHist, [], 'o histórico de comida vai');
  assert.strictEqual(d.export, 0, 'e a marca de backup zera: não há o que exportar');

  // o prescrito, e o que ELE criou, fica
  assert.strictEqual(JSON.stringify(d.prog), prog, 'o programa oficial fica');
  assert.deepStrictEqual(d.rot, rot, 'a rotação fica como estava, e não volta para a de fábrica');
  assert.deepStrictEqual(d.ex.meu, { n: 'Meu aparelho', g: 'peito' },
    'o aparelho que ELE cadastrou fica: não é registro, é catálogo');
  assert.deepStrictEqual(d.progLog, [{ t: t, k: 'troca' }], 'o diário do programa fica');
  assert.strictEqual(JSON.stringify(d.comida), comida, 'o plano nutricional fica');
  assert.strictEqual(d.cadencia[1], 'treino', 'a cadência da semana fica');
  assert.ok(d.comida.plano.length > 0, 'e a nutrição não fica sem catálogo — já ficou uma vez');
  a.fechar();
});

test('ctx.apagaTudo leva junto quatro coisas que ninguém declarou — o escopo de hoje', async () => {
  // ESTE CASO NÃO AFIRMA QUE ESTÁ CERTO. Ele grava o que o verbo faz hoje, nos
  // quatro campos que `wipe()` não lista nem como registro nem como prescrição:
  // o objeto novo que ele monta simplesmente não os carrega, e `normalizaEstado`
  // os preenche vazios depois. Se alguém decidir que um deles deve sobreviver,
  // este caso fica vermelho e aponta a linha — que é o contrário de descobrir
  // meses depois que a biblioteca de aulas sumiu num toque.
  //
  // O mais pesado dos quatro é `apagados`. `wipe()` apaga a chave de storage
  // LEGADA de propósito, com comentário, para a migração do boot não ressuscitar
  // amanhã o histórico — e no mesmo gesto joga fora toda lápide, que é
  // exatamente o que impede a FUSÃO do outro aparelho de ressuscitá-lo pela
  // outra porta.
  const t = Date.now() - 2 * DIA;
  const a = await app({ estado: estadoCheio(t) });

  assert.strictEqual(a.S().aulas.length, 1, 'o modelo de aula estava salvo');
  assert.strictEqual(a.S().protocolo.sessoes.length, 1, 'a sessão de fotos de corpo também');

  await a.v('ctx.apagaTudo');
  await a.esperar(60);
  const d = a.S();

  assert.deepStrictEqual(d.aulas, [],
    'a biblioteca de modelos de aula vai junto — e `S.ex`, que também é coisa que ELE criou, fica');
  assert.deepStrictEqual(d.protocolo, { poses: null, sessoes: [] },
    'as sessões de foto de corpo vão junto, sem podar os bytes no cache nem no bucket');
  assert.deepStrictEqual(d.fotos, {},
    'as referências de foto de aparelho vão junto, pelo mesmo caminho');
  assert.deepStrictEqual(d.apagados, {},
    'e TODA lápide vai junto, inclusive a de um registro que nada neste gesto apagou');
  a.fechar();
});

// ===========================================================================
// A custódia, pelas chaves de `CTX` — o caminho de volta do dono
// ===========================================================================
//
// Este app já perdeu seis campos numa importação, em silêncio (`6035a5c`), e o
// único caminho de volta dele é exportar e importar. As seis chaves de `CTX`
// que são esse caminho — `exportar`, `mostraJSON`, `copiaJSON`, `importaTexto`,
// `importaArquivo`, `alternaColar` — mais a leitura `dadosDoApp` não tinham
// caso próprio: a rede chegava nelas pelo nome de módulo (`showJSON`,
// `importText`), que o redesenho pode renomear sem avisar ninguém.
//
// Cobrem o modelo e não a fiação: que a capacidade existe e o que ela promete.
// Nenhum deles diz que a tela nova tem um botão de exportar ligado nela.
//
// Os dublês de plataforma continuam entrando por `a.E`, como o contrato da
// superfície manda: `URL.createObjectURL` e `navigator.clipboard` não existem
// no jsdom, e um dublê é instalação em `globalThis`, não verbo.

/** O caminho do download e o da área de transferência, que o jsdom não tem. */
function plataformaDeBackup(a) {
  a.E(`
    globalThis.__copiado = [];
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: {
      writeText: function (t) { globalThis.__copiado.push(t); return Promise.resolve(); }
    } });
    URL.createObjectURL = function () { return 'blob:teste/1'; };
    URL.revokeObjectURL = function () {};
  `);
}

const UMA_SESSAO = (function () {
  const t = Date.now() - 4 * DIA;
  return { logs: { A0: [{ t: t, sid: t, sets: [[62.5, 9]] }] },
           done: [{ day: 'A', t: t, sid: t }] };
})();

test('ctx.mostraJSON abre o backup na tela, conta como backup e fecha no segundo toque', async () => {
  const a = await app({ estado: UMA_SESSAO, aba: 'guia' });
  await a.modo('o app');
  assert.strictEqual(a.vJ('ctx.dadosDoApp').json, null, 'fechado por padrão');

  a.v('ctx.mostraJSON');
  await a.esperar();
  const txt = a.vJ('ctx.dadosDoApp').json;
  assert.ok(/"app": "lastro"/.test(txt), 'o que abre é o backup de verdade, com envelope');
  assert.ok(/62,?\.?5/.test(txt), 'e com a série dentro');
  assert.ok(a.S().export > 0, 'abrir conta como backup: quem copia na mão nunca passa pelo clipboard');

  a.v('ctx.mostraJSON');
  await a.esperar();
  assert.strictEqual(a.vJ('ctx.dadosDoApp').json, null, 'o mesmo verbo fecha');
  a.fechar();
});

test('ctx.copiaJSON leva o backup inteiro para a área de transferência', async () => {
  const a = await app({ estado: UMA_SESSAO, aba: 'guia' });
  plataformaDeBackup(a);

  await a.v('ctx.copiaJSON');
  await a.esperar(60);

  const copiado = a.J('globalThis.__copiado');
  assert.strictEqual(copiado.length, 1, 'copiou uma vez');
  const d = JSON.parse(copiado[0]).data;
  assert.strictEqual(d.done.length, 1, 'e o que foi copiado é o estado, não um resumo');
  assert.deepStrictEqual(d.logs[Object.keys(d.logs)[0]][0].sets[0], [62.5, 9]);
  assert.strictEqual(a.toast(), 'JSON copiado.');
  assert.ok(a.S().export > 0, 'copiar também conta como backup');
  a.fechar();
});

test('ctx.exportar gera o arquivo, e sem download cai no texto sem fingir que salvou', async () => {
  // Os dois caminhos importam. O do arquivo é o dele no iPhone; o do texto é a
  // rede de segurança — e ela NÃO pode carimbar o backup, porque nada foi
  // baixado. Carimbar ali faria o app parar de cobrar um backup que não existe.
  const semDownload = await app({ estado: UMA_SESSAO, aba: 'guia' });
  semDownload.v('ctx.exportar');
  await semDownload.esperar(40);
  assert.match(semDownload.toast(), /não funciona aqui/, 'avisa que o download falhou');
  assert.ok(/"app": "lastro"/.test(semDownload.vJ('ctx.dadosDoApp').json),
    'e põe o texto na tela, que é o caminho de volta');
  assert.strictEqual(semDownload.S().export, 0,
    'sem arquivo gerado, não há backup para carimbar');
  semDownload.fechar();

  const a = await app({ estado: UMA_SESSAO, aba: 'guia' });
  plataformaDeBackup(a);
  a.v('ctx.exportar');
  await a.esperar(40);
  assert.match(a.toast(), /^Arquivo lastro-\d{4}-\d{2}-\d{2}\.json gerado\.$/,
    'com download, o nome do arquivo leva a data: ' + a.toast());
  assert.ok(a.S().export > 0, 'e agora sim conta como backup');
  a.fechar();
});

test('ctx.importaTexto diz o que vai substituir, e recusar não troca nada', async () => {
  // O confirm da importação é a última porta antes de o histórico ser trocado.
  // Nenhum caso o lia: os outros aqui entram com o harness aceitando por padrão.
  const a = await app({ estado: UMA_SESSAO, aba: 'guia' });
  const bkp = JSON.stringify({ app: 'lastro', v: 1, data: {
    logs: { A0: [{ t: Date.now(), sid: Date.now(), sets: [[100, 5]] }] },
    done: [{ day: 'B', t: Date.now(), sid: Date.now() }, { day: 'C', t: Date.now(), sid: 1 }]
  } });

  a.recusar();
  await a.v('ctx.importaTexto', bkp);
  await a.esperar(60);

  assert.strictEqual(a.S().done.length, 1, 'recusar deixa o histórico daqui');
  assert.deepStrictEqual(a.log('A', 0)[0].sets[0], [62.5, 9], 'e a série daqui intacta');

  const q = a.perguntas().join(' | ');
  assert.ok(/Importar 2 sessões e 1 exercícios/.test(q), 'o aviso conta o que VEM: ' + q);
  assert.ok(/substitui o histórico atual \(1 sessões\)/.test(q), 'e o que SAI: ' + q);
  assert.ok(/Exporte antes/.test(q), 'e manda exportar antes: ' + q);

  a.aceitar();
  await a.v('ctx.importaTexto', bkp);
  await a.esperar(60);
  assert.strictEqual(a.S().done.length, 2, 'aceitar troca');
  a.fechar();
});

test('ctx.importaArquivo lê o arquivo, importa e esvazia o campo', async () => {
  // A única chave desta família que recebe um objeto do DOM, e por isso ficou
  // fora de `verbos` — o `Blob` tem de nascer no realm do jsdom. Entra pela
  // superfície por acesso direto (`a.m.ctx`), que é por nome e sem `eval`.
  //
  // Esvaziar `input.value` não é detalhe: sem isso, escolher o MESMO arquivo de
  // novo não dispara `change`, e a segunda importação não acontece.
  const a = await app({ estado: UMA_SESSAO, aba: 'guia' });
  await a.modo('o app');
  a.v('ctx.mostraJSON');
  const bkp = a.doc.getElementById('jout').value;

  await a.v('wipe');
  await a.esperar(60);
  assert.strictEqual(a.S().done.length, 0, 'o histórico foi');

  const campo = { files: [new a.window.Blob([bkp], { type: 'application/json' })], value: 'backup.json' };
  a.m.ctx.importaArquivo(campo);
  await a.esperar(120);

  assert.strictEqual(a.S().done.length, 1, 'o arquivo trouxe a sessão de volta');
  assert.deepStrictEqual(a.log('A', 0)[0].sets[0], [62.5, 9], 'com a série dentro');
  assert.strictEqual(campo.value, '', 'e o campo foi esvaziado, senão o mesmo arquivo não entra duas vezes');

  const vazio = { files: [], value: 'nada' };
  a.m.ctx.importaArquivo(vazio);
  await a.esperar(40);
  assert.strictEqual(a.S().done.length, 1, 'cancelar o seletor não mexe em nada');
  assert.strictEqual(vazio.value, 'nada', 'e não limpa um campo que não foi usado');
  a.fechar();
});

test('ctx.alternaColar abre e fecha a área de colar, e ctx.dadosDoApp conta o acervo', async () => {
  const a = await app({ estado: UMA_SESSAO, aba: 'guia' });

  assert.strictEqual(a.vJ('ctx.dadosDoApp').colando, false, 'fechada por padrão');
  a.v('ctx.alternaColar');
  assert.strictEqual(a.vJ('ctx.dadosDoApp').colando, true, 'abre');
  a.v('ctx.alternaColar');
  assert.strictEqual(a.vJ('ctx.dadosDoApp').colando, false, 'e o mesmo verbo fecha');

  // `dadosDoApp` é a leitura que diz ao dono o tamanho do que ele tem a perder
  const vm = a.vJ('ctx.dadosDoApp');
  assert.match(vm.resumo, /1 sessão registrada/, 'conta as sessões, no singular: ' + vm.resumo);
  assert.match(vm.resumo, /1 exercício com histórico/, 'e os exercícios: ' + vm.resumo);
  assert.match(vm.resumo, /0 sessões de cardio · 0 pesagens · 0 medidas de cintura/,
    'cardio, peso e cintura entram no acervo: ' + vm.resumo);
  assert.match(vm.backupTxt, /nunca exportou/, 'e cobra o backup que nunca houve');
  a.fechar();
});
