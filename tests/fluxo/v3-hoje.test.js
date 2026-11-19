// O Hoje no visual novo (direção 3, Fase 4): o bloco do momento pela mesma
// regra (`cartaoDeCima`), a linha do dia, o "se quiser" que obedece ao que
// está ligado, o "+" com o texto livre, a pergunta da noite e a de ontem.

import { test } from 'vitest';
import assert from 'node:assert';
import { app, agoraEstavel, DIA } from './harness.js';
import { dataLocal } from '../../src/dominio/protocolo';

const dia = (h, m, extra) => Object.assign({ data: dataLocal(agoraEstavel(h, m)), done: {}, agua: 0, escala: {}, cadencia: 'treino', alta: 0 }, extra || {});
async function noHoje(h, m, extra) {
  const a = await app({ agora: agoraEstavel(h, m), estado: Object.assign({ logs: {}, done: [], dia: dia(h, m) }, extra || {}) });
  await a.pronto();
  // num dia de treino o app abre no treino; o Hoje fica por baixo dele
  a.v('ctx.fechaModoDeSessao');
  a.v('ctx.comecaAqui');        // aparelho vazio: passa da primeira vez
  await a.esperar();
  return a;
}

test('às 12h05 o momento é o almoço, e "Comi" marca pela porta de sempre', async () => {
  const a = await noHoje(12, 5);
  assert.strictEqual(a.vJ('ctx.hojeV3').bloco.k, 'refeicao');
  assert.ok(/Almoço/.test(a.texto('.v3-bloco-t')), a.texto('.v3-bloco-t'));
  assert.ok(a.$('[data-a="linha-almoco"].agora'), 'a linha do dia marca o momento');
  a.clicar('[data-a="hoje-comi"]');
  await a.esperar(40);
  assert.ok(a.E('!!diaDeComida().done.almoco'), 'marcado');
  assert.ok(a.$('[data-a="linha-almoco"].ok'), 'e a linha mostra');
  a.fechar();
});

test('a refeição: "Comi" oferece desfazer, e "Não foi assim" abre as respostas da exceção', async () => {
  const a = await noHoje(12, 5);
  a.clicar('[data-a="hoje-comi"]');
  await a.esperar(40);
  assert.ok(a.E('!!diaDeComida().done.almoco'), 'marcado na hora');
  assert.strictEqual(a.$('[data-a="aviso-acao"]').textContent, 'Desfazer');
  a.clicar('[data-a="aviso-acao"]');
  await a.esperar(40);
  assert.ok(!a.E('!!diaDeComida().done.almoco'), 'desfeito');
  // um principal por bloco: a exceção mora na folha
  assert.ok(!a.$('[data-a="hoje-fora"]'), 'o bloco não troca os botões');
  a.clicar('[data-a="hoje-nao-comi"]');
  await a.esperar(40);
  assert.ok(a.$('[data-a="ref-fora"]') && a.$('[data-a="ref-nao"]') && a.$('[data-a="ref-nsei"]'), 'as respostas, na folha');
  a.clicar('[data-a="ref-nao"]');
  await a.esperar(40);
  assert.strictEqual(a.E('diaDeComida().como && diaDeComida().como.almoco'), 'nao', 'não comi');
  a.fechar();
});

test('"Comi outra coisa": o tamanho em quatro respostas, e "Guardar" só com uma escolhida', async () => {
  const a = await noHoje(12, 5);
  a.clicar('[data-a="hoje-nao-comi"]');
  await a.esperar(40);
  a.clicar('[data-a="ref-fora"]');
  await a.esperar(40);
  assert.ok(/^Comi outra coisa/.test(a.texto('.v3-folha')), 'a folha troca para a do tamanho: ' + a.texto('.v3-folha'));
  assert.ok(!a.$('[data-a="ref-nao"]'), 'e não empilha sobre a da refeição');
  assert.strictEqual(a.$$('.v3-folha').length, 1, 'uma folha só');
  assert.ok(a.$('.v3-folha-w[data-troca]'), 'trocada no lugar: sem subir de novo nem reacender o véu');
  // o Voltar devolve a primeira (02 §8), e ela volta como estava
  a.v('ctx.fechaFolha');
  await a.esperar(40);
  assert.ok(a.$('[data-a="ref-nao"]') && a.$('[data-a="ref-metade"]'), 'de volta a "não foi assim"');
  a.clicar('[data-a="ref-fora"]');
  await a.esperar(40);
  const grupo = a.$('.v3-tam[role="radiogroup"]');
  assert.ok(grupo, 'escolha única');
  assert.deepStrictEqual(a.$$('.v3-tam [role="radio"] b').map(x => x.textContent), ['Parecido', 'Bem mais', 'Bem menos', 'Não sei']);
  assert.ok(a.$$('.v3-tam [role="radio"]').every(x => x.getAttribute('aria-checked') === 'false'), 'nenhuma vem marcada');
  // sem escolha, Guardar não grava
  assert.strictEqual(a.$('[data-a="tam-guarda"]').getAttribute('aria-disabled'), 'true');
  a.clicar('[data-a="tam-guarda"]');
  await a.esperar(40);
  assert.ok(!a.E('!!diaDeComida().done.almoco'), 'nada gravado sem o tamanho');
  a.clicar('[data-a="tam-mais"]');
  await a.esperar(20);
  assert.strictEqual(a.$('[data-a="tam-mais"]').getAttribute('aria-checked'), 'true');
  assert.strictEqual(a.$('[data-a="tam-guarda"]').getAttribute('aria-disabled'), null, 'com a escolha, Guardar vale');
  a.clicar('[data-a="tam-guarda"]');
  await a.esperar(80);
  assert.strictEqual(a.E('diaDeComida().como.almoco'), 'fora', 'a marca é "fora"');
  assert.strictEqual(a.E('diaDeComida().tam.almoco'), 'mais', 'com o tamanho');
  await a.esperar(800);      // a gravação da marca é represada por 700 ms (`queueSave`)
  assert.strictEqual(a.gravado().dia.tam.almoco, 'mais', 'e está no disco');
  assert.strictEqual(a.toast().replace('Desfazer', ''), 'Almoço: outra coisa, bem mais.', a.toast());
  // a folha da refeição marcada diz o tamanho
  a.v('ctx.abreFolha', { k: 'refeicao', id: 'almoco' });
  await a.esperar(40);
  assert.ok(/outra coisa, bem mais/.test(a.texto('.v3-folha')), a.texto('.v3-folha'));
  // desmarcar e desfazer o desmarcar devolve a marca inteira, com o tamanho
  a.clicar('[data-a="ref-desfaz"]');
  await a.esperar(60);
  assert.ok(!a.E('!!diaDeComida().done.almoco'), 'desmarcado');
  assert.ok(!a.E('diaDeComida().tam && diaDeComida().tam.almoco'), 'o tamanho saiu com a marca');
  assert.ok(a.E(`S.apagados['comida:' + diaDeComida().data + ':almoco'] > 0`), 'com a lápide, para a fusão');
  a.clicar('[data-a="aviso-acao"]');
  await a.esperar(60);
  assert.strictEqual(a.E('diaDeComida().como.almoco'), 'fora', 'a marca voltou');
  assert.strictEqual(a.E('diaDeComida().tam.almoco'), 'mais', 'com o tamanho de antes');
  a.fechar();
});

test('"Comi outra coisa": marcada no meio do caminho, a folha diz o que está e oferece trocar', async () => {
  const a = await noHoje(12, 5);
  a.clicar('[data-a="hoje-nao-comi"]');
  await a.esperar(40);
  a.clicar('[data-a="ref-fora"]');
  await a.esperar(40);
  a.clicar('[data-a="tam-mais"]');
  await a.esperar(20);
  // a sincronia traz a marca do outro aparelho enquanto ele escolhe
  a.v('ctx.marcaLinhaDaComida', 'almoco', 'tudo');
  await a.esperar(20);
  a.clicar('[data-a="tam-guarda"]');
  await a.esperar(40);
  assert.ok(a.$('[data-a="tam-conflito"]'), 'a folha fica aberta e diz');
  assert.ok(/Está marcado: como o plano/.test(a.texto('.v3-folha')), a.texto('.v3-folha'));
  assert.ok(!a.E('diaDeComida().como'), 'nada foi trocado sem ele pedir');
  a.clicar('[data-a="tam-troca"]');
  await a.esperar(60);
  assert.strictEqual(a.E('diaDeComida().como.almoco'), 'fora', 'trocou');
  assert.strictEqual(a.E('diaDeComida().tam.almoco'), 'mais');
  assert.ok(!a.$('.v3-folha'), 'e a folha fechou');
  a.clicar('[data-a="aviso-acao"]');
  await a.esperar(60);
  assert.ok(a.E('!!diaDeComida().done.almoco'), 'desfazer devolve a marca que estava');
  assert.ok(!a.E('diaDeComida().como') && !a.E('diaDeComida().tam'), 'como o plano, sem tamanho');
  a.fechar();
});

test('"Comi outra coisa" tira a porção que sobrou de antes, e não troca uma marca de versão mais nova', async () => {
  const a = await noHoje(12, 5);
  // a porção solta de uma marca que a sincronia levou
  a.E(`diaDeComida().escala.almoco = 0.5`);
  a.v('ctx.marcaLinhaDaComida', 'almoco', 'fora', 'mais');
  await a.esperar(40);
  assert.ok(!a.E('diaDeComida().escala.almoco'), '"bem mais" não fica pela metade');
  // uma versão mais nova marcou o jantar de um jeito que esta não conhece
  a.v('ctx.marcaLinhaDaComida', 'almoco', 'desfaz');
  a.v('ctx.abreFolha', { k: 'comiOutra', id: 'almoco' });
  await a.esperar(40);
  a.clicar('[data-a="tam-menos"]');
  a.E(`diaDeComida().done.almoco = Date.now(); diaDeComida().como = { almoco: 'pouco' }; render();`);
  await a.esperar(20);
  a.clicar('[data-a="tam-guarda"]');
  await a.esperar(40);
  assert.ok(/versão mais nova/.test(a.texto('.v3-folha')), a.texto('.v3-folha'));
  assert.ok(!a.$('[data-a="tam-troca"]'), 'sem "Trocar": o desfazer daqui não saberia refazê-la');
  a.clicar('[data-a="tam-deixa"]');
  await a.esperar(40);
  assert.strictEqual(a.E('diaDeComida().como.almoco'), 'pouco', 'a marca dela fica');
  a.fechar();
});

test('"Comi outra coisa" também sai do "+", e desfazer pelo aviso tira a marca e o tamanho', async () => {
  const a = await noHoje(12, 5);
  a.v('ctx.abreRegistrar');
  await a.esperar(40);
  a.clicar('[data-a="reg-outra"]');
  await a.esperar(40);
  assert.ok(a.$('.v3-tam'), 'a folha do tamanho');
  a.clicar('[data-a="tam-nsei"]');
  await a.esperar(20);
  a.clicar('[data-a="tam-guarda"]');
  await a.esperar(80);
  assert.strictEqual(a.E('diaDeComida().tam.almoco'), 'nsei', '"não sei" é resposta, e fica guardada');
  assert.strictEqual(a.toast().replace('Desfazer', ''), 'Almoço: outra coisa, sem saber o tamanho.');
  a.clicar('[data-a="aviso-acao"]');
  await a.esperar(60);
  assert.ok(!a.E('!!diaDeComida().done.almoco'), 'desfeito');
  assert.ok(!a.E('diaDeComida().tam'), 'sem tamanho solto');
  await a.esperar(800);      // a gravação represada (`queueSave`)
  const g = a.gravado();
  assert.ok(g && g.dia && !g.dia.done.almoco && !g.dia.tam, 'nem no disco');
  a.fechar();
});

test('o "+": o texto livre grava o que entendeu e diz o que não entendeu', async () => {
  const a = await noHoje(13, 0);
  a.clicar('.v3-doca-m');
  await a.esperar(40);
  assert.ok(a.$('#registrar-texto'), 'a folha do "+"');
  const campo = a.$('#registrar-texto');
  campo.value = 'almocei e tomei 2 copos';
  campo.dispatchEvent(new a.window.Event('input', { bubbles: true }));
  await a.esperar();
  a.$('.v3-diga').dispatchEvent(new a.window.Event('submit', { bubbles: true, cancelable: true }));
  await a.esperar(80);
  assert.ok(a.E('!!diaDeComida().done.almoco'), 'o almoço');
  assert.strictEqual(a.vJ('ctx.agua').n, 2, 'e os dois copos');
  assert.ok(/Guardado: almoço, 2 copos/.test(a.texto('.v3-eco')), a.texto('.v3-eco'));

  campo.value = 'fui e voltei';
  campo.dispatchEvent(new a.window.Event('input', { bubbles: true }));
  await a.esperar();
  a.$('.v3-diga').dispatchEvent(new a.window.Event('submit', { bubbles: true, cancelable: true }));
  await a.esperar(60);
  assert.ok(/Não entendi/.test(a.texto('.v3-eco')));
  a.fechar();
});

test('"se quiser" obedece ao que está ligado, e a chave muda na hora', async () => {
  const a = await noHoje(15, 0);
  assert.ok(a.$('[data-a="hoje-agua"]'), 'a água ligada por padrão');
  a.clicar('[data-a="hoje-aparece"]');
  await a.esperar(40);
  a.clicar('[data-a="aparece-agua"]');
  await a.esperar();
  assert.strictEqual(a.$('[data-a="aparece-agua"]').getAttribute('aria-checked'), 'false', 'a chave desligou sem fechar a folha');
  a.v('ctx.fechaFolha');
  await a.esperar();
  assert.ok(!a.$('[data-a="hoje-agua"]'), 'e a água sumiu do Hoje');
  a.clicar('[data-a="hoje-agua"]'.replace('hoje-agua', 'hoje-peso'));
  await a.esperar();
  assert.strictEqual(a.vista().aba, 'corpo', 'o peso leva à régua do Corpo');
  a.fechar();
});

test('de noite, "Foi, sim" fecha o dia com "Desfazer", e desfazer desmarca só o que a resposta marcou', async () => {
  const a = await noHoje(21, 0);
  a.E(`diaDeComida().done.cafe = 1; queueSave(); render();`);   // uma já marcada antes
  await a.esperar(40);
  const antes = a.J('Object.keys(diaDeComida().done).sort()');
  a.clicar('[data-a="noite-sim"]');
  await a.esperar(60);
  assert.strictEqual(a.E('CTX.respostaDoDia(hojeISO())'), 'sim', 'respondido');
  assert.ok(a.J('Object.keys(diaDeComida().done)').length > antes.length, 'marcou as que faltavam');
  assert.strictEqual(a.$('[data-a="aviso-acao"]').textContent, 'Desfazer');
  a.clicar('[data-a="aviso-acao"]');
  await a.esperar(60);
  assert.deepStrictEqual(a.J('Object.keys(diaDeComida().done).sort()'), antes, 'só a que já estava marcada continua');
  assert.notStrictEqual(a.E('CTX.respostaDoDia(hojeISO())'), 'sim', 'e a resposta saiu');
  a.fechar();
});

test('de noite, com refeições sem resposta, o momento pergunta pelo dia, e responder grava', async () => {
  const a = await noHoje(21, 0);
  assert.strictEqual(a.vJ('ctx.hojeV3').bloco.k, 'noite');
  a.clicar('[data-a="noite-quase"]');
  await a.esperar(60);
  assert.strictEqual(a.E('CTX.respostaDoDia(hojeISO())'), 'quase');
  a.fechar();
});

test('ontem em branco: a pergunta aparece no ritmo, e responder fecha o dia de ontem', async () => {
  const ontem = dataLocal(agoraEstavel(10) - DIA);
  const a = await noHoje(10, 0, { comidaHist: [{ d: ontem, done: {}, agua: 0, escala: {}, tot: {}, pv: 1, m: 1 }] });
  assert.ok(a.texto('.v3-perg').includes('Ontem ficou em branco'));
  a.clicar('.v3-perg-r button:first-child');
  await a.esperar(60);
  assert.strictEqual(a.E(`CTX.respostaDoDia(${JSON.stringify(ontem)})`), 'sim');
  assert.ok(!a.$('.v3-perg'), 'e a pergunta sai');
  a.fechar();
});

test('cardio: o toque no Hoje abre a folha, e gravar registra pela porta de sempre', async () => {
  const a = await noHoje(15, 0);
  a.clicar('[data-a="hoje-cardio"]');
  await a.esperar(40);
  assert.ok(a.$('[data-a="cardio-grava"]'), 'a folha do cardio');
  a.clicar('[data-a="cardio-m-remo"]');
  a.clicar('[data-a="cardio-min-30"]');
  await a.esperar();
  // escolha única: o leitor de tela ouve "selecionado" (radiogroup)
  assert.strictEqual(a.$('[data-a="cardio-min-30"]').getAttribute('aria-checked'), 'true');
  assert.ok(/30 min de remo/.test(a.texto('[data-a="cardio-grava"]')));
  a.clicar('[data-a="cardio-grava"]');
  await a.esperar(60);
  const c = a.E('S.cardio[S.cardio.length - 1]');
  assert.strictEqual(c.m, 'remo'); assert.strictEqual(c.min, 30);
  assert.ok(!a.$('[data-a="cardio-grava"]'), 'e a folha fecha');
  a.fechar();
});

test('o tipo do dia: "Hoje não vou treinar" vira descanso, e a folha da data volta, com turno e demanda alta', async () => {
  const a = await noHoje(5, 30);
  assert.strictEqual(a.vJ('ctx.hojeV3').bloco.k, 'treino');
  // "hoje não vou treinar" abre o tipo do dia, que diz o efeito antes do toque
  a.clicar('[data-a="hoje-nao-treino"]');
  await a.esperar(40);
  assert.ok(a.$('[data-a="dia-e-descanso"]'), 'a folha do tipo do dia');
  a.clicar('[data-a="dia-e-descanso"]');
  await a.esperar(40);
  a.v('ctx.fechaFolha');
  await a.esperar(40);
  assert.strictEqual(a.E('diaDeComida().cadencia'), 'descanso');
  assert.notStrictEqual(a.vJ('ctx.hojeV3').bloco.k, 'treino', 'o bloco deixa de ser o treino');
  assert.ok(/descanso/.test(a.texto('[data-a="hoje-tipo"]')));
  a.clicar('[data-a="hoje-tipo"]');
  await a.esperar(40);
  assert.ok(a.$('[data-a="jafiz-cardio"]'), 'descanso oferece o "já fiz"');
  a.clicar('[data-a="dia-e-treino"]');
  await a.esperar(40);
  assert.strictEqual(a.E('diaDeComida().cadencia'), 'treino');
  assert.ok(a.$('[data-a="turno-noite"]'), 'a folha fica aberta, agora com o turno do treino');
  a.clicar('[data-a="dia-alta"]');
  await a.esperar();
  assert.strictEqual(a.E('diaDeComida().alta'), 1, 'demanda alta');
  a.clicar('[data-a="aderencia-fora"]');
  await a.esperar();
  assert.strictEqual(a.E('diaDeComida().aderencia'), 'fora');
  a.clicar('[data-a="turno-noite"]');
  await a.esperar();
  assert.strictEqual(a.E('diaDeComida().turno'), 'noite');
  assert.ok(a.$('[data-a="dia-pronto"]'), 'escolher o turno não fecha a folha');
  assert.strictEqual(a.E('view.pilha.length'), 1, 'uma folha só');
  a.clicar('[data-a="dia-pronto"]');
  await a.esperar();
  assert.strictEqual(a.E('view.pilha.length'), 0);
  a.fechar();
});

test('sem a comida: o Hoje é só o treino, o Plano diz como ligar, e nada pergunta da comida', async () => {
  const a = await noHoje(12, 5);
  assert.strictEqual(a.vJ('ctx.hojeV3').bloco.k, 'refeicao', 'com a comida, o almoço');
  a.v('ctx.ligaModulo', 'comida', false);
  await a.esperar();
  const h = a.vJ('ctx.hojeV3');
  assert.notStrictEqual(h.bloco.k, 'refeicao', 'sem a comida, o almoço sai do bloco');
  assert.ok(h.linha.every(x => x.treino), 'a linha do dia é só o treino');
  assert.ok(!a.$('[data-a="linha-almoco"]'));
  a.v('ctx.vaiPara', 'prescricao');
  await a.esperar(40);
  assert.ok(a.$('[data-a="plano-liga-comida"]'), 'o Plano oferece ligar de volta');
  assert.ok(!a.$('[data-a^="plano-ref-"]'), 'sem as refeições');
  a.clicar('[data-a="plano-liga-comida"]');
  await a.esperar();
  assert.ok(a.$('[data-a^="plano-ref-"]'), 'ligada de novo, o plano volta inteiro');
  a.fechar();
});

test('o lembrete das fotos: com a chave ligada, aparece na véspera, abre as fotos e "Agora não" esconde', async () => {
  const a = await noHoje(15, 0);
  // a última sessão foi há 13 dias: amanhã é dia
  a.E(`(function () { const d = hojeISO(Date.now() - 13 * 86400000); S.protocolo.sessoes = [{ d: d, fotos: { frente: { v: 1, ext: 'webp' } } }]; render(); })()`);
  await a.esperar();
  assert.ok(!a.$('[data-a="hoje-lembrete"]'), 'desligado por padrão');
  a.v('ctx.abreAjustes');
  await a.esperar();
  a.clicar('[data-a="ajustes-lembrete-fotos"]');
  await a.esperar();
  a.v('ctx.fechaAjustes');
  await a.esperar(40);
  assert.ok(/Amanhã é dia das fotos/.test(a.texto('[data-a="hoje-lembrete"]')), a.texto('.v3'));
  a.clicar('[data-a="lembrete-dispensa"]');
  await a.esperar();
  assert.ok(!a.$('[data-a="hoje-lembrete"]'), 'agora não');
  a.E('view.lembreteDispensado = null; render();');
  await a.esperar();
  a.clicar('[data-a="lembrete-abre"]');
  await a.esperar(40);
  assert.ok(a.vista().fotos, 'abre o centro das fotos');
  a.fechar();
});
