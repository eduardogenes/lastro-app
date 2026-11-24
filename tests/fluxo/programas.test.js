// Os PROGRAMAS (etapa 1 de docs/catalogo) na tela: colar um programa inteiro
// e começá-lo (com Desfazer), o aviso único da separação, reativar (bloqueado
// com treino aberto) e registrar um dia de antes da troca.

import { test } from 'vitest';
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { app, DIA } from './harness.js';

const NOVO = `Programa · v2.2 Lombar
Objetivo: Fase 1 da lombar.
Revisão 23/11
Treino SA · Peito superior + dorsal
- Supino inclinado no Smith · 4 x 6-10 · RIR 1-2 · 2:30 · peito superior
- Remada apoiada no peito · 3 x 8-12 · RIR 1
Treino IA · Glúteo + posterior
- Mesa flexora sentada · 4 x 8-12 · RIR 1
- Dead bug · 3 x 8/lado · core · carga: corpo
Treino HX · HYROX (aberto)`;

const fixture = () => JSON.parse(readFileSync(new URL('../dominio/fixtures/estado-plano-13.json', import.meta.url), 'utf8'));

async function lido(a, texto) {
  a.v('ctx.abreRevisao');
  await a.esperar();
  a.v('ctx.textoDaRevisao', { value: texto });
  a.clicar('[data-a="revisao-le"]');
  await a.esperar();
  // as perguntas do texto: tudo "é outro", para o teste não depender do catálogo
  const r = a.vJ('ctx.revisao');
  r.perguntas.forEach(q => a.v('ctx.respondeRevisao', q.nome, 'outro'));
  await a.esperar();
}

test('colar um programa inteiro: a sugestão é programa novo, e começar guarda o de agora e desfaz', async () => {
  const a = await app({ aba: 'agora' });
  await a.pronto();
  const antes = a.E('JSON.stringify({ prog: S.prog, rot: S.rot })');
  await lido(a, NOVO);
  assert.strictEqual(a.texto('.v3-dec-topo h1'), 'O que é este texto?');
  assert.strictEqual(a.$('[data-a="revisao-modo-novo"]').getAttribute('aria-checked'), 'true');
  assert.match(a.texto('.v3-porque'), /Nenhum treino do texto bate com os de agora: o texto traz SA e IA/);
  assert.strictEqual(a.$('#programa-nome').value, 'v2.2 Lombar');
  assert.strictEqual(a.texto('[data-a="revisao-aplica"]'), 'Começar o v2.2 Lombar');
  // a revisão mostraria a soma: a rotação com mais treinos, em alerta
  a.clicar('[data-a="revisao-modo-revisao"]');
  assert.match(a.texto('.v3-cons-l.alerta'), /A rotação fica com \d+ treinos/);
  a.clicar('[data-a="revisao-modo-novo"]');
  a.clicar('[data-a="revisao-aplica"]');
  await a.esperar(120);
  const S = a.S();
  assert.strictEqual(S.programas.lista[S.programas.ativo].nome, 'v2.2 Lombar');
  assert.strictEqual(S.programas.lista[S.programas.ativo].objetivo, 'Fase 1 da lombar.');
  assert.deepStrictEqual(S.rot, ['SA', 'IA', 'HX']);
  const guardados = Object.values(S.programas.lista).filter(p => p.estado === 'guardado');
  assert.strictEqual(guardados.length, 1);
  assert.ok(guardados[0].prog.A && guardados[0].prog.B, 'o de antes, guardado inteiro');
  assert.match(a.toast(), /^Começou o v2\.2 Lombar\./);
  assert.ok(S.progLog.some(e => /^Programa novo: 2 treinos/.test(e.txt) && e.p === S.programas.ativo));
  // desfazer: volta tudo
  a.clicar(a.$$('#toast button').find(b => /Desfazer/.test(b.textContent)) || '#toast button');
  await a.esperar(120);
  assert.strictEqual(a.E('JSON.stringify({ prog: S.prog, rot: S.rot })'), antes);
  assert.strictEqual(Object.keys(a.S().programas.lista).length, 1);
  a.fechar();
});

test('com "começa dd/mm", o programa fica em Próximo e o de agora segue', async () => {
  const a = await app({ aba: 'agora' });
  await a.pronto();
  const rot = a.E('JSON.stringify(S.rot)');
  await lido(a, NOVO.replace('Programa · v2.2 Lombar', 'Programa · v2.2 Lombar · começa 01/12'));
  assert.strictEqual(a.texto('[data-a="revisao-aplica"]'), 'Guardar até 01/12');
  a.clicar('[data-a="revisao-aplica"]');
  await a.esperar(120);
  const S = a.S();
  assert.strictEqual(a.E('JSON.stringify(S.rot)'), rot);
  const prox = Object.values(S.programas.lista).find(p => p.estado === 'proximo');
  assert.ok(prox && prox.comeca === '01/12');
  a.fechar();
});

test('a separação da migração aparece uma vez no Plano, e "Entendi" a tira', async () => {
  const a = await app({ aba: 'prescricao', estado: fixture() });
  await a.pronto();
  assert.deepStrictEqual(a.S().rot, ['SA', 'IA', 'SB', 'IB', 'SC', 'HX'], 'separado na abertura');
  assert.ok(a.$('[data-a="plano-separados"]'), 'o aviso');
  assert.match(a.texto('[data-a="plano-separados"]'), /A a E foram para o/);
  assert.ok(a.$('[data-a="plano-programas"]'), 'a porta da linha do tempo');
  a.clicar('[data-a="separados-ok"]');
  await a.esperar(60);
  assert.ok(!a.$('[data-a="plano-separados"]'));
  assert.strictEqual(a.S().programas.separados.visto, 1);
  a.fechar();
});

test('a linha do tempo, o guardado e reativar: bloqueado com treino aberto; depois, recomeça pelo primeiro', async () => {
  const a = await app({ aba: 'prescricao', estado: fixture() });
  await a.pronto();
  a.clicar('[data-a="plano-programas"]');
  await a.esperar();
  assert.strictEqual(a.texto('.v3-cab h1'), 'Programas');
  const P = a.S().programas;
  const velho = P.separados.de;
  a.clicar('[data-a="programa-' + velho + '"]');
  await a.esperar();
  assert.match(a.texto('.v3-pcab .k'), /Antes · do treinador · guardado/);
  a.E('S.sessao = { day: "SA", inicio: Date.now(), ultima: Date.now(), sid: Date.now() }');
  a.clicar('[data-a="programa-reativar"]');
  await a.esperar();
  assert.ok(a.$('[data-a="reativa-bloqueio"]'));
  assert.strictEqual(a.$('[data-a="reativa-ok"]').disabled, true);
  a.clicar('[data-a="reativa-nao"]');
  await a.esperar();
  a.E('S.sessao = null');
  a.clicar('[data-a="programa-reativar"]');
  await a.esperar();
  a.clicar('[data-a="reativa-ok"]');
  await a.esperar(120);
  assert.strictEqual(a.S().programas.ativo, velho);
  assert.deepStrictEqual(a.S().rot, ['A', 'B', 'C', 'D', 'E', 'HX']);
  assert.strictEqual(a.E('nextDay()'), 'A');
  a.fechar();
});

test('registrar um dia de antes da troca oferece os treinos do programa que valia, e grava nele', async () => {
  const est = fixture();
  const a = await app({ aba: 'dias', estado: est });
  await a.pronto();
  const t = est.progTreinador.em - 3 * DIA;
  const data = a.E('hojeISO(' + t + ')');
  const d = a.vJ('ctx.diaDoRegistro', data);
  assert.ok(d.programa, 'o nome do programa de antes');
  assert.deepStrictEqual(d.treinos.map(x => x.k), ['A', 'B', 'C', 'D', 'E', 'HX']);
  const r = await a.E(`CTX.guardaRegistro(${JSON.stringify(data)}, { k: 'C', turno: 'manha', grupos: [] }, 'presenca')`);
  assert.ok(r, 'gravou');
  const S = a.S();
  const m = S.done.find(x => x.day === 'C');
  assert.strictEqual(m.prog, S.programas.separados.de);
  assert.strictEqual(a.E('nextDay()'), 'SA', 'não mexe na rotação do ativo');
  a.fechar();
});

// ---------- a tabela de testes da revisão de dado ----------

test('a abertura que separa carimba pelo dado (um acima do maior), e a que só cria carimba programas com 1', async () => {
  const est = fixture();
  est.carimbos = { prog: 500, rot: 400, progTreinador: 450 };
  const a = await app({ aba: 'agora', estado: est });
  await a.pronto();
  const c = a.S().carimbos;
  assert.strictEqual(c.prog, 501); assert.strictEqual(c.rot, 501); assert.strictEqual(c.progTreinador, 501); assert.strictEqual(c.programas, 501);
  a.fechar();
  const b = await app({ aba: 'agora' });
  await b.pronto();
  assert.strictEqual(b.S().carimbos.programas, 1);
  b.fechar();
});

test('treino() acha a letra num guardado, e a prescrição e o previsto de um dia antes da troca são do programa de antes', async () => {
  const est = fixture();
  const t = est.progTreinador.em;
  est.done = [{ day: 'A', t: t - 5 * DIA, sid: t - 5 * DIA, dur: 0 }, { day: 'B', t: t - 4 * DIA, sid: t - 4 * DIA, dur: 0 }];
  const a = await app({ aba: 'dias', estado: est });
  await a.pronto();
  assert.strictEqual(a.E('treino("A").name'), est.prog.A.name);
  const data = a.E('hojeISO(' + (t - 3 * DIA) + ')');
  const d = a.vJ('ctx.diaDoRegistro', data);
  assert.strictEqual(d.treinos.find(x => x.proximo).k, 'C', 'o seguinte daquele programa');
  const s = a.vJ('ctx.seriesDoRegistro', data, 'A', 'manha', '');
  assert.deepStrictEqual(s.prescrito.map(x => x.id), est.prog.A.ex.map(x => x.id));
  a.fechar();
});

test('"Foi de outro programa": o dia de antes pode gravar no programa de agora', async () => {
  const est = fixture();
  const a = await app({ aba: 'dias', estado: est });
  await a.pronto();
  const data = a.E('hojeISO(' + (est.progTreinador.em - 3 * DIA) + ')');
  const P = a.S().programas;
  const d = a.vJ('ctx.diaDoRegistro', data, P.ativo);
  assert.deepStrictEqual(d.treinos.map(x => x.k), ['SA', 'IA', 'SB', 'IB', 'SC', 'HX']);
  assert.ok(d.programa.escolhido);
  await a.E(`CTX.guardaRegistro(${JSON.stringify(data)}, { k: 'IA', turno: 'manha', grupos: [], prog: ${JSON.stringify(P.ativo)} }, 'presenca')`);
  assert.strictEqual(a.S().done.find(x => x.day === 'IA').prog, P.ativo);
  a.fechar();
});

test('exportar, apagar o histórico e reimportar devolvem os programas', async () => {
  const a = await app({ aba: 'ajustes', estado: fixture() });
  await a.pronto();
  const antes = JSON.stringify(a.S().programas);
  a.v('showJSON');
  const bkp = a.v('payload');
  assert.ok(JSON.parse(bkp).data.programas);
  await a.v('wipe');
  await a.esperar();
  assert.strictEqual(JSON.stringify(a.S().programas), antes, 'apagar o histórico não apaga os programas');
  a.aba('ajustes');
  await a.v('importText', bkp);
  await a.esperar(60);
  assert.strictEqual(JSON.stringify(a.S().programas), antes);
  a.fechar();
});

test('trocar de programa com o armazenamento cheio volta tudo', async () => {
  const a = await app({ aba: 'prescricao', estado: fixture() });
  await a.pronto();
  const foto = () => a.E('JSON.stringify({ prog: S.prog, rot: S.rot, programas: S.programas, carimbos: S.carimbos })');
  const antes = foto();
  const velho = a.S().programas.separados.de;
  a.encheCota();
  await a.E('CTX.ativaPrograma(' + JSON.stringify(velho) + ')');
  await a.esperar(60);
  a.encheCota(false);
  assert.strictEqual(foto(), antes);
  a.fechar();
});

test('o Desfazer do programa novo recusa com um treino aberto', async () => {
  const a = await app({ aba: 'agora' });
  await a.pronto();
  await lido(a, NOVO);
  a.clicar('[data-a="revisao-aplica"]');
  await a.esperar(120);
  const desfaz = a.$$('#toast button').find(b => /Desfazer/.test(b.textContent));
  a.E('S.sessao = { day: "SA", inicio: Date.now(), ultima: Date.now(), sid: Date.now() }');
  a.clicar(desfaz);
  await a.esperar(60);
  assert.match(a.toast(), /Encerre o treino/);
  assert.strictEqual(a.S().programas.lista[a.S().programas.ativo].nome, 'v2.2 Lombar');
  a.fechar();
});

test('o Desfazer do programa novo recusa depois de outra mudança no programa', async () => {
  const a = await app({ aba: 'agora' });
  await a.pronto();
  await lido(a, NOVO);
  a.clicar('[data-a="revisao-aplica"]');
  await a.esperar(120);
  const desfaz = a.$$('#toast button').find(b => /Desfazer/.test(b.textContent));
  a.E('S.prog.SA.ex[0].s = 7');
  a.clicar(desfaz);
  await a.esperar(60);
  assert.match(a.toast(), /mudou depois/);
  assert.strictEqual(a.S().programas.lista[a.S().programas.ativo].nome, 'v2.2 Lombar');
  a.fechar();
});

test('o texto colado fica guardado junto do programa novo', async () => {
  const a = await app({ aba: 'agora' });
  await a.pronto();
  await lido(a, NOVO);
  a.clicar('[data-a="revisao-aplica"]');
  await a.esperar(120);
  const S = a.S();
  assert.strictEqual(S.programas.lista[S.programas.ativo].texto, NOVO);
  a.fechar();
});

test('"começa 05/01" colado em dezembro é janeiro do ano seguinte', async () => {
  const a = await app({ aba: 'agora' });
  await a.pronto();
  const criado = new Date(2026, 11, 20).getTime();
  assert.strictEqual(a.E('new Date(diaDoComeca("05/01", ' + criado + ')).getFullYear()'), 2027);
  assert.strictEqual(a.E('new Date(diaDoComeca("28/12", ' + criado + ')).getFullYear()'), 2026);
  a.fechar();
});
