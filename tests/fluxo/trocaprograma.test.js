// A troca de programa de agosto de 2026, do ponto de vista do aparelho dele:
// seis treinos viram cinco, e meses de carga registrada têm que atravessar
// intactos. É o que esta troca prometeu e o que nenhuma futura pode quebrar.
import { test } from 'vitest';
import assert from 'node:assert';
import { app, DIA } from './harness.js';

test('restaurar o programa novo preserva o histórico do antigo', async () => {
  const t = Date.now() - 5 * DIA;
  // estado como o dele: histórico nos ids do programa ANTIGO, plano 5
  const a = await app({ estado: {
    plano: 5,
    logs: {
      'chest-press-inclinado-convergente': [{ t, sid: t, sets: [[55, 10], [55, 9], [55, 8]] }],
      'pendulum-squat':                    [{ t, sid: t, sets: [[120, 8], [120, 8]] }],
      'cadeira-flexora-sentada':           [{ t, sid: t, sets: [[45, 12]] }],
      'remada-horizontal-na-maquina':      [{ t, sid: t, sets: [[70, 10]] }],
      'tibial-anterior':                   [{ t, sid: t, sets: [[20, 15]] }]
    },
    done: [{ day: 'F', t, sid: t }],
    carga: { 'pendulum-squat': 'lado' }
  } });

  await a.esperar();
  await a.E('restaurarTudo()');
  await a.esperar();

  assert.deepStrictEqual(a.J('rot()'), ['A','B','C','D','E','HX'],
    'cinco dias de musculação mais o HYROX');
  assert.strictEqual(a.E('S.prog.HX.name'), 'HYROX');
  assert.strictEqual(a.E('difTotal()'), 0, 'igual ao treinador');

  // o histórico seguiu o exercício para a nova posição
  assert.strictEqual(a.k('A', 0), 'chest-press-inclinado-convergente');
  assert.strictEqual(a.log('A', 0).length, 1, 'chest press manteve o histórico');
  assert.strictEqual(a.E('S.logs["pendulum-squat"].length'), 1);
  assert.strictEqual(a.J('S.carga')['pendulum-squat'], 'lado', 'a correção de carga acompanhou');

  // a coluna ANTERIOR mostra o que ele fez, agora no dia B
  a.E('go("B")');
  a.E('toggle(0)');
  assert.match(a.texto('.ex.open .setrow .setant'), /^120 × /,
    'a evolução continua: o app mostra a carga do treino antigo');

  // exercício que saiu do programa continua nomeado, não vira slug cru
  assert.strictEqual(a.E('CAT["remada-horizontal-na-maquina"].n'), 'Remada horizontal na máquina');
  assert.strictEqual(a.E('CAT["tibial-anterior"].n'), 'Tibial anterior');
  assert.ok(!a.E('CAT["tibial-anterior"].sumido'), 'não é fantasma');

  // RIR alvo aparece no cartão, e o registrado entra na própria série
  a.E('go("A")');
  a.E('toggle(0)');
  assert.ok(a.texto('.ex.open .tag').includes('RIR 1–2'), a.texto('.ex.open .tag'));
  a.preencher(0, 0, 57.5, 9);
  a.clicar(a.doc.getElementById('q0_0'));
  a.clicar(a.$$('.ex.open .rirscale .rirop')[1]);
  assert.deepStrictEqual(a.log('A', 0).slice(-1)[0].sets[0], [57.5, 9, 1],
    'carga, repetição e RIR na mesma série');

  // sessão antiga do F continua abrindo sem quebrar
  a.aba('dados');
  assert.ok(a.doc.getElementById('app').innerHTML.length > 600);
  a.fechar();
});

test('backup exportado e reimportado preserva o RIR do plano e o da série', async () => {
  const a = await app();
  await a.E('restaurarTudo()');
  a.E('toggle(0)');
  a.preencher(0, 0, 60, 8);
  a.clicar(a.doc.getElementById('q0_0'));
  a.clicar(a.$$('.ex.open .rirscale .rirop')[1]);   // o RIR daquela série
  await a.esperar();
  const json = a.E('payload()');
  a.fechar();

  const b = await app();
  await b.E('importText(' + JSON.stringify(json) + ')');
  await b.esperar();
  assert.strictEqual(b.E('S.prog.A.ex[0].rir'), '1–2', 'o RIR prescrito sobreviveu ao backup');
  assert.strictEqual(b.E('S.logs["chest-press-inclinado-convergente"][0].sets[0][2]'), 1,
    'o RIR da série sobreviveu ao backup, na terceira posição');
  b.fechar();
});

test('backup antigo (plano 2) cai nos ids da época, não no programa de hoje', async () => {
  const t = Date.now() - 30 * DIA;
  // C0 no plano 2 era pendulum squat; hoje o índice 0 do C é uma remada
  const antigo = JSON.stringify({ app:'treino-eduardo', v:1, data:{
    plano: 2, logs: { 'C0': [{ t, sid: t, sets: [[100, 8]] }] }, done: [], carga: {}
  }});
  const a = await app();
  await a.E('importText(' + JSON.stringify(antigo) + ')');
  await a.esperar();
  assert.ok(a.E('S.logs["pendulum-squat"]'), 'histórico foi para o exercício certo da época');
  assert.strictEqual(a.E('S.plano'), 6);
  a.fechar();
});

test('o HYROX é sessão da rotação sem virar série de hipertrofia', async () => {
  const a = await app();
  await a.E('restaurarTudo()');
  await a.esperar();

  // é o sexto dia, chega pela rotação como qualquer outro
  a.E('go("HX")');
  assert.strictEqual(a.E('treino("HX").name'), 'HYROX');

  // ...mas nasce VAZIO: quem programa o sábado é o box, e nada é prescrito de
  // véspera. A prova inteira entra pelo atalho, quando é dia de simulação.
  assert.strictEqual(a.E('treino("HX").ex.length'), 0, 'o dia aberto começa sem nada');
  await a.E('poeSimulacao()');
  await a.esperar();
  assert.strictEqual(a.E('treino("HX").ex.length'), 9, 'as nove estações entram de uma vez');
  assert.strictEqual(a.E('treino("HX").ex[0].n'), 'Corrida');

  // registra por TEMPO: o segundo campo é segundo, e a carga é opcional
  a.E('toggle(0)');
  // o primeiro .unit é o da carga; o segundo é o que diz reps ou segundos
  assert.strictEqual(a.$$('.ex.open .sethead .f')[1].textContent, 'seg');
  a.preencher(0, 0, null, 252);
  a.preencher(0, 1, null, 258);
  const h = a.log('HX', 0);
  assert.strictEqual(h.length, 1);
  assert.strictEqual(h[0].u, 'seg', 'a entrada se declara por tempo');
  assert.deepStrictEqual(h[0].sets[0], [0, 252]);

  // e não conta como série de nenhum músculo
  const mus = a.J('seriesPorMusculo(0, Date.now() + 1)');
  assert.deepStrictEqual(mus, {}, 'corrida não é série de quadríceps');
  assert.strictEqual(a.E('ALVO_TOTAL'), 90, 'o alvo continua sendo só a musculação');
  assert.strictEqual(a.E('ALVO[""]'), undefined);

  // sem selo de subir carga e sem lista de troca: sled não tem substituto
  assert.ok(!a.$('.ex.open .up'), 'tempo melhor não é carga maior');
  a.E('toggle(2)');
  assert.strictEqual(a.E('treino("HX").ex[2].n'), 'Sled push');
  assert.deepStrictEqual(a.J('altList("HX", 2)'), [],
    'exercício sem grupo não puxa "mesmo grupo muscular" nem oferece troca');

  // a tela de programa chama o dia de estações, não de séries
  a.E('abrirPrograma("HX")');
  assert.ok(a.texto('.htitle').includes('HYROX'));
  // A meta do sábado não é uma conta: dizer "0 séries" prometeria um número
  // que o box nunca vai respeitar.
  assert.strictEqual(a.E('programaDia("HX").meta'), 'o que o box programar');
  a.fechar();
});

test('o dia aberto não pede promoção nem cobra pendência', async () => {
  // O app existe em parte para FREAR mudança de programa, e isso está certo de
  // segunda a sexta. No sábado vira obstáculo: o que entra no dia É o dia, não
  // uma emenda a ele, e não há conteúdo permanente para aquilo virar.
  const a = await app();
  a.E('go("HX")');
  await a.esperar();

  assert.ok(a.E('diaAberto("HX")'), 'sábado é dia aberto');
  assert.ok(!a.E('diaAberto("A")'), 'e segunda não');

  // nada prescrito, nada pendente — não há o que cobrar no fim
  const p = a.J("pendencias('HX', 0, [])");
  assert.deepStrictEqual(p.nada, [], 'nada prescrito, nada pendente');

  await a.E('poeSimulacao()');
  await a.esperar();
  assert.strictEqual(a.J("modsDoDia('HX').length"), 9, 'as estações entraram como mods do dia');

  a.E('toggle(0)');
  a.preencher(0, 0, null, 252);
  await a.esperar();
  await a.E('finalizarSessao()');
  await a.esperar(60);

  assert.ok(!a.J('!!view.promo'),
    'e mesmo com nove mods no dia, nenhuma pergunta de promoção');
  assert.ok(!a.J('!!S.sessao'), 'a sessão encerrou direto');
  a.fechar();
});

test('as estações da prova continuam no catálogo depois de sair da prescrição', async () => {
  // Quem já registrou um sled push precisa que o exercício continue existindo,
  // senão o histórico fica órfão sob uma chave sem dono.
  const a = await app();
  ['sled-push', 'sled-pull', 'wall-balls', 'ski-erg', 'corrida'].forEach(function (k) {
    assert.ok(a.E('!!CAT[' + JSON.stringify(k) + ']'), 'sumiu do catálogo: ' + k);
  });
  a.fechar();
});
