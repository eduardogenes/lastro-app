import { test } from 'vitest';
import assert from 'node:assert/strict';
import { app, agoraEstavel, DIA } from './harness.js';
import { dataLocal } from '../../src/dominio/protocolo';
import { montaArquivos } from '../../ferramentas/espelho/monta';

const agora = agoraEstavel(5, 30), ontem = agora - DIA, data = dataLocal(ontem);
const sel = k => '[data-a="' + k + '"]';
async function toca(a, k) {
  const b = a.$(sel(k)); assert.ok(b && !b.disabled, k);
  b.click(); await a.esperar();
}
async function emDias(extra = {}) {
  const a = await app({ agora, aba: 'dias', estado: { plano: 13, logs: {}, done: [], cardio: [], ...extra } });
  await toca(a, 'dia-' + data);
  return a;
}
async function escolhe(a, k, turno) {
  await toca(a, 'registro-' + k); await toca(a, 'registro-turno-' + turno);
}
const novas = (s, sid) => Object.entries(s.logs).flatMap(([id, logs]) => logs.filter(l => l.sid === sid).map(l => ({ id, ...l })));

test('a última sessão da letra fornece os pares, com lacunas, mesmo entre outro treino e uma sessão futura', async () => {
  const a = await emDias();
  try {
    const id = a.E("S.prog.B.ex[0].id");
    a.E(`S.done = [{day:'B',sid:11,t:${ontem-3*DIA}}, {day:'A',sid:12,t:${ontem-DIA}}, {day:'B',sid:13,t:${agora}}];
      S.logs[${JSON.stringify(id)}] = [{sid:11,t:${ontem-3*DIA},sets:[[22,9,2],null,[24,7]],dor:['joelho']},
      {sid:12,t:${ontem-DIA},sets:[[80,1]]}, {sid:13,t:${agora},sets:[[99,1]]}]`);
    await a.pintar();
    assert.equal(a.$('.v3-reg-letras .previsto').textContent, 'B');
    assert.equal(a.$('.v3-reg-letras .previsto').parentNode.querySelector('small').textContent, 'próximo', 'o rótulo fica embaixo, fora do botão');
    await escolhe(a, 'B', 'manha');
    assert.equal(a.S().done.length, 3);
    await toca(a, 'registro-mudar'); assert.equal(a.S().done.length, 3);
    await escolhe(a, 'B', 'tarde'); await toca(a, 'registro-ultima');
    const s = a.gravado(), m = s.done.find(x => dataLocal(x.t) === data);
    assert.equal(m.hora, 'turno'); assert.equal(new Date(m.t).getHours(), 15);
    const [l] = novas(s, m.sid); assert.deepEqual(l.sets, [[22,9],null,[24,7]]);
    assert.equal(l.id, id); assert.equal(l.dp, 1); assert.equal(l.dor, undefined);
    assert.match(a.texto('.v3-reg-aviso'), /Treino B · .* · à tarde · como da última vez\./);
    assert.ok(!a.vJ('ctx.mes').horario.pontos.includes(15 * 60));
    const backup = a.v('payload'), outro = await app({ estado: null, agora });
    try {
      await outro.v('importText', backup);
      assert.deepEqual(outro.S().done.find(x => x.sid === m.sid), m);
      for (const [x,y] of [[s,outro.S()], [outro.S(),s]]) assert.equal(a.vJ('funde', x,y,agora).estado.done.find(v => v.sid === m.sid).hora, 'turno');
      const arq = montaArquivos(outro.S(), { agora });
      assert.match(arq['treino/historico/' + data.slice(0,7) + '.md'], /de tarde \(sem hora exata\)/);
      assert.ok(arq['treino/series.csv'].split('\n').some(x => x.startsWith(data + ',,' + m.sid)));
    } finally { outro.fechar(); }
    await toca(a, 'aviso-acao');
    const depois = a.gravado();
    assert.equal(depois.done.length, 3); assert.equal(novas(depois, m.sid).length, 0);
    assert.ok(depois.apagados['done:' + m.sid]); assert.ok(Object.keys(depois.apagados).some(k => k.startsWith('log:' + id + ':' + m.sid)));
    assert.equal(a.vJ('funde', s, depois, agora).estado.done.length, 3);
  } finally { a.fechar(); }
});

test('prescrito e ajustar usam a prescrição e preservam o treino ao vivo e a falta coberta', async () => {
  const a = await emDias({ falta: { [data]: { m: ontem, motivo: 'viagem' } } });
  try {
    const [id, outro] = a.J('S.prog.B.ex.slice(0,2).map(x => x.id)');
    a.E(`S.prog.B.ex=S.prog.B.ex.slice(0,2); Object.assign(S.prog.B.ex[0], {s:3,r:'6–9'});
      S.done.push({day:'B',sid:7,t:${ontem-DIA}}, {day:'B',sid:9,t:${agora}});
      S.sessao={day:'B',sid:9,inicio:${agora},ultima:${agora}}; S.draft={day:'B',ex:{}};
      S.mods={day:'B',list:[{k:'rm',slot:${JSON.stringify(id)}}]};
      S.logs[${JSON.stringify(id)}]=[{t:${ontem-DIA},sid:7,sets:[[12,8],[14,6]]}]`);
    await a.pintar(); const antes = a.S();
    await toca(a,'registro-outro'); await escolhe(a,'B','manha'); await toca(a,'registro-prescrito');
    let s = a.gravado(), m = s.done.find(x => dataLocal(x.t) === data);
    assert.deepEqual(novas(s,m.sid).find(l => l.id===id).sets, [[0,6],[0,6],[0,6]]);
    assert.deepEqual(s.sessao, antes.sessao); assert.deepEqual(s.draft, antes.draft); assert.deepEqual(s.mods, antes.mods);
    assert.deepEqual(s.falta[data], antes.falta[data]); assert.equal(a.$(sel('frequencia-tirar')),null);
    await toca(a,'aviso-acao'); assert.ok(a.$(sel('frequencia-tirar')));
    await toca(a,'registro-outro'); await escolhe(a,'B','tarde'); await toca(a,'registro-ajustar');
    assert.ok(a.$('[role="dialog"]')); assert.match(a.texto('.v3-reg-ex'), /12/);
    await toca(a,'ajuste-carga-0-mais'); await toca(a,'ajuste-reps-0-menos'); await toca(a,'ajuste-pula-1');
    assert.equal(a.gravado().done.length, antes.done.length); await toca(a,'ajuste-guardar');
    s = a.gravado(); m = s.done.find(x => dataLocal(x.t) === data);
    const [l] = novas(s,m.sid);
    assert.ok(l.sets[0][0] > 12); assert.deepEqual(l.sets, Array(3).fill([l.sets[0][0],7]));
    assert.equal(l.dp,1); assert.ok(!novas(s,m.sid).some(x => x.id===outro));
  } finally { a.fechar(); }
});

test('duas letras são ordenadas pelo turno, a sequência segue a última e o arco é do primeiro treino', async () => {
  const a = await emDias();
  try {
    await escolhe(a,'B','noite'); await toca(a,'registro-presenca');
    await toca(a,'registro-outro'); assert.equal(a.$(sel('frequencia-falta')),null); assert.equal(a.$(sel('registro-so-cardio')),null);
    assert.equal(a.$('.v3-reg-letras .previsto').textContent,'C');
    await escolhe(a,'A','manha'); assert.equal(a.$(sel('registro-ajustar')),null);
    const campo = a.$(sel('registro-hora')); campo.value='06:13'; campo.dispatchEvent(new a.window.Event('input',{bubbles:true})); await a.esperar();
    await toca(a,'registro-presenca');
    const s=a.gravado(), cel=sel('dia-'+data);
    assert.deepEqual(s.done.map(x=>[x.day,x.hora]), [['A',1],['B','turno']]); assert.deepEqual(s.logs,{});
    assert.deepEqual(a.$$(cel+' .v3-cal-bola').map(x=>x.textContent),['A','B']);
    assert.equal(a.$(cel+' circle').getAttribute('cx'),'3'); assert.equal(a.vJ('ctx.mes').horario.mediana,'6h13');
    await toca(a,'registro-outro'); assert.equal(a.$('.v3-reg-letras .previsto').textContent,'C');
    await toca(a,'registro-mudar'); await toca(a,'aviso-acao'); assert.deepEqual(a.gravado().done.map(x=>x.day),['B']);
  } finally { a.fechar(); }
});

for (const entrada of ['Hoje','+']) test(entrada + ' abre o mesmo cartão de hoje e guarda o treino livre só no fim', async () => {
  const a=await app({agora,estado:{plano:13,logs:{},done:[],dia:{data:dataLocal(agora),cadencia:'treino',done:{},agua:0,escala:{}}}});
  try {
    a.v('ctx.fechaModoDeSessao'); await a.esperar();
    if (entrada === '+') { a.clicar('.v3-doca-m'); await a.esperar(); await toca(a,'reg-ja-treinei'); }
    else await toca(a,'hoje-ja-treinei');
    assert.ok(a.$('[role="dialog"][aria-label="Registrar um treino"]'));
    await toca(a,'registro-livre'); await toca(a,'registro-grupo-peito'); await toca(a,'registro-dur-45');
    // 05:30: a noite de hoje ainda não começou, e o registro de hoje nunca fica no futuro
    assert.equal(a.$(sel('registro-turno-noite')),null); assert.equal(a.$(sel('registro-turno-tarde')),null);
    await toca(a,'registro-turno-manha'); assert.equal(a.S().done.length,0); await toca(a,'registro-livre-guardar');
    const [m]=a.gravado().done; assert.equal(dataLocal(m.t),dataLocal(agora)); assert.deepEqual(m.grupos,['peito']);
    assert.equal(m.dur,45*60000); assert.equal(m.hora,'turno'); assert.ok(m.t <= agora, 'o turno de hoje vale até agora'); assert.equal(m.livre,1); assert.ok(a.$(sel('registro-cardio-sim')));
  } finally { a.fechar(); }
});

for (const resposta of ['treino anterior','HX','descanso','falta','só cardio']) test('cardio com '+resposta+' entra no dia e tirar conserva a resposta', async () => {
  const anterior = resposta === 'treino anterior';
  const a = await emDias(anterior ? {done:[{day:'B',sid:1,t:ontem,retro:1}]} : {});
  try {
    if (resposta === 'HX') { await escolhe(a,'HX','noite'); await toca(a,'registro-presenca'); }
    if (resposta === 'descanso') await toca(a,'frequencia-descanso');
    if (resposta === 'falta') { await toca(a,'frequencia-falta'); assert.equal(a.S().falta[data],undefined); await toca(a,'motivo-trabalho'); }
    if (resposta !== 'só cardio') await toca(a,'registro-cardio-sim'); else await toca(a,'registro-so-cardio');
    assert.deepEqual(a.$$('.v3-registro [aria-label="Minutos"] button').map(x=>x.textContent),['15 min','20 min','30 min','45 min','60 min','outro']);
    await toca(a,'registro-cardio-guardar');
    const s=a.gravado(), [c]=s.cardio; assert.equal(c.semHora,1);
    assert.match(a.texto('.v3-reg-cardio-ok'),/Cardio: 30 min de bike, moderado\./);
    const bola=sel('dia-'+data)+' .v3-cal-bola'; assert.ok(a.$(bola).classList.contains('cardio'));
    if (resposta === 'só cardio') { assert.match(a.texto('.v3-cal-freq'),/E a musculação nesse dia/); await toca(a,'registro-sem-resposta'); assert.equal(a.texto(bola),'?'); }
    if (resposta === 'falta') assert.equal(s.falta[data].motivo,'trabalho');
    await toca(a,'registro-tirar-cardio-'+c.t);
    const fim=a.gravado(); assert.equal(fim.cardio.length,0); const morte=fim.apagados['cardio:'+c.t]; assert.ok(morte);
    assert.match(a.texto('.v3-reg-aviso'),/: cardio tirado\./);
    // o "tirar" tem Desfazer: o mesmo registro volta, sem a lápide, e com carimbo depois dela
    await toca(a,'aviso-acao');
    const volta=a.gravado(); assert.equal(volta.cardio.length,1); assert.equal(volta.cardio[0].t,c.t);
    assert.equal(volta.apagados['cardio:'+c.t],undefined); assert.ok(volta.cardio[0].alt>morte);
    assert.equal(a.vJ('funde',fim,volta,agora).estado.cardio.length,1,'a volta vence o tirar no outro aparelho');
    await toca(a,'registro-tirar-cardio-'+c.t);
    assert.ok(!a.$(bola).classList.contains('cardio')); assert.deepEqual(fim.done,s.done);
    assert.deepEqual(fim.falta,s.falta); assert.deepEqual(fim.descanso,s.descanso);
    if (anterior) {
      await toca(a,'registro-outro'); await escolhe(a,'HX','noite'); await toca(a,'registro-presenca');
      assert.equal(a.$(sel('dia-'+data)+' .v3-cal-arco'),null,'a primeira sessão era sem hora');
    }
  } finally { a.fechar(); }
});

test('outro atravessa os atalhos, respeita os limites e conserva minutos antigos até tocar no contador', async () => {
  const a=await emDias({cardio:[{t:ontem,m:'remo',min:197,i:'leve'}]});
  try {
    await toca(a,'dia-abre'); await toca(a,'dia-cardio');
    assert.match(a.texto('.v3-reg-contador'),/197 min/);
    await toca(a,'dia-cardio-min-outro'); assert.equal(a.S().cardio[0].min,197);
    await toca(a,'dia-cardio-min-menos'); assert.equal(a.gravado().cardio[0].min,180);
    assert.ok(a.$(sel('dia-cardio-min-mais')).disabled);
    await toca(a,'dia-cardio-min-15'); await toca(a,'dia-cardio-min-outro');
    await toca(a,'dia-cardio-min-menos'); await toca(a,'dia-cardio-min-menos'); assert.ok(a.$(sel('dia-cardio-min-menos')).disabled);
    await toca(a,'dia-poe'); assert.equal(a.$(sel('poe-treinei')),null); await toca(a,'poe-cardio');
    assert.equal(a.$(sel('dia-cardio-novo-min-mais')),null,'começa em 30 min, um dos atalhos: o "outro" fica fechado');
    await toca(a,'dia-cardio-novo-min-outro');
    await toca(a,'dia-cardio-novo-min-mais'); await toca(a,'dia-cardio-novo-min-mais'); await toca(a,'dia-cardio-grava');
    assert.ok(a.gravado().cardio.some(c=>c.min===40));
    a.v('ctx.fechaDia'); a.v('ctx.abreCardio'); await a.esperar();
    await toca(a,'cardio-min-60'); await toca(a,'cardio-min-outro'); await toca(a,'cardio-min-menos'); await toca(a,'cardio-grava');
    assert.ok(a.gravado().cardio.some(c=>c.min===55 && dataLocal(c.t)===dataLocal(agora)));
  } finally { a.fechar(); }
});

test('dois aparelhos registram B e C no mesmo turno, sem sincronizar: os dois ficam, e o Desfazer de um não leva o outro', async () => {
  const um = await emDias(), outroA = await app({ agora: agora + 7, aba: 'dias', estado: { plano: 13, logs: {}, done: [], cardio: [] } });
  try {
    await toca(outroA, 'dia-' + data);
    await escolhe(um, 'B', 'manha'); await toca(um, 'registro-presenca');
    await escolhe(outroA, 'C', 'manha'); await toca(outroA, 'registro-presenca');
    const s1 = um.gravado(), s2 = outroA.gravado();
    assert.equal(s1.done[0].t, s2.done[0].t, 'o mesmo instante representativo do turno');
    assert.notEqual(s1.done[0].sid, s2.done[0].sid, 'a identidade nasce no toque, e não no turno');
    for (const [x, y] of [[s1, s2], [s2, s1]]) {
      assert.deepEqual(um.vJ('funde', x, y, agora).estado.done.map(m => m.day).sort(), ['B', 'C']);
    }
    await toca(um, 'aviso-acao');
    const desfeito = um.gravado();
    assert.deepEqual(um.vJ('funde', desfeito, s2, agora).estado.done.map(m => m.day), ['C'], 'o Desfazer de B não apaga C');
  } finally { um.fechar(); outroA.fechar(); }
});

test('o instante e o sid novos pulam as lápides', async () => {
  const t8 = new Date(ontem); t8.setHours(8, 0, 0, 0);
  const a = await emDias({ apagados: { ['done:' + t8.getTime()]: agora - DIA, ['done:' + agora]: agora - DIA } });
  try {
    await escolhe(a, 'B', 'manha'); await toca(a, 'registro-presenca');
    const [m] = a.gravado().done;
    assert.notEqual(m.t, t8.getTime(), 'o instante não cai numa sessão apagada');
    assert.notEqual(m.sid, agora, 'nem o sid');
  } finally { a.fechar(); }
});

for (const gravacao of ['treino', 'descanso', 'cardio', 'tirar o cardio', 'desfazer o treino']) test('armazenamento cheio: ' + gravacao + ' não muda nada e o cartão diz', async () => {
  const a = await emDias(gravacao === 'tirar o cardio' ? { cardio: [{ t: ontem, m: 'remo', min: 20, i: 'leve', alt: 1, semHora: 1 }] } : {});
  try {
    if (gravacao === 'desfazer o treino') { await escolhe(a, 'B', 'manha'); await toca(a, 'registro-presenca'); }
    const antes = a.S();
    a.encheCota();
    if (gravacao === 'treino') { await escolhe(a, 'B', 'manha'); await toca(a, 'registro-presenca'); }
    if (gravacao === 'descanso') await toca(a, 'frequencia-descanso');
    if (gravacao === 'cardio') { await toca(a, 'registro-so-cardio'); await toca(a, 'registro-cardio-guardar'); }
    if (gravacao === 'tirar o cardio') await toca(a, 'registro-tirar-cardio-' + ontem);
    if (gravacao === 'desfazer o treino') await toca(a, 'aviso-acao');
    const depois = a.S();
    for (const k of ['done', 'logs', 'cardio', 'descanso', 'falta', 'apagados']) assert.deepEqual(depois[k], antes[k], k + ' ficou como estava');
    assert.ok(a.$('.v3-registro [role="alert"]'), 'e o cartão diz que não guardou');
  } finally { a.fechar(); }
});

test('armazenamento cheio no Desfazer do "tirar": o cardio continua tirado, com a lápide, e o cartão diz', async () => {
  const a = await emDias({ cardio: [{ t: ontem, m: 'remo', min: 20, i: 'leve', alt: 1, semHora: 1 }] });
  try {
    await toca(a, 'registro-tirar-cardio-' + ontem);
    const tirado = a.S();
    a.encheCota();
    await toca(a, 'aviso-acao');
    const depois = a.S();
    assert.deepEqual(depois.cardio, tirado.cardio); assert.equal(depois.apagados['cardio:' + ontem], tirado.apagados['cardio:' + ontem]);
    assert.ok(a.$('.v3-registro [role="alert"]'));
  } finally { a.fechar(); }
});

test('o cardio de um dia passado cai na hora das 12h, deslocado pelo toque; o de hoje nunca depois de agora', async () => {
  const a = await emDias();
  try {
    await toca(a, 'registro-so-cardio'); await toca(a, 'registro-cardio-guardar');
    const [c] = a.gravado().cardio, meio = new Date(ontem); meio.setHours(12, 0, 0, 0);
    assert.equal(c.t - meio.getTime(), agora % 3600000, 'o deslocamento vem do instante do toque');
    assert.ok(c.t >= meio.getTime() && c.t < meio.getTime() + 3600000, 'e fica no mesmo dia, na hora das 12h');
  } finally { a.fechar(); }
  const h = await app({ agora, estado: { plano: 13, logs: {}, done: [], cardio: [], dia: { data: dataLocal(agora), cadencia: 'treino', done: {}, agua: 0, escala: {} } } });
  try {
    h.v('ctx.fechaModoDeSessao'); await h.esperar(); await toca(h, 'hoje-ja-treinei');
    await toca(h, 'registro-so-cardio'); await toca(h, 'registro-cardio-guardar');
    const [c] = h.gravado().cardio;
    assert.ok(c.t <= agora, 'às 05h30, o cardio de hoje não vai para o meio-dia');
  } finally { h.fechar(); }
});

test('a hora exata no futuro é recusada, com a frase dela', async () => {
  const h = await app({ agora, estado: { plano: 13, logs: {}, done: [], dia: { data: dataLocal(agora), cadencia: 'treino', done: {}, agua: 0, escala: {} } } });
  try {
    h.v('ctx.fechaModoDeSessao'); await h.esperar(); await toca(h, 'hoje-ja-treinei');
    await toca(h, 'registro-B'); await toca(h, 'registro-turno-manha');
    const campo = h.$(sel('registro-hora')); campo.value = '07:10'; campo.dispatchEvent(new h.window.Event('input', { bubbles: true })); await h.esperar();
    await toca(h, 'registro-presenca');
    assert.equal(h.gravado().done.length, 0);
    assert.equal(h.texto('.v3-registro [role="alert"]'), 'Essa hora ainda não chegou.');
  } finally { h.fechar(); }
});

test('a sessão ao vivo entra em ordem, mesmo com um registro de instante posterior vindo de outro aparelho', async () => {
  const a = await app({ agora, estado: { plano: 13, logs: {}, done: [{ day: 'A', t: agora + 60000, sid: agora + 60000, retro: 1, hora: 'turno', m: agora }] } });
  try {
    a.v('anotaSerie', 0, 0, 0, 60); a.v('anotaSerie', 0, 0, 1, 8); await a.esperar();
    const done = a.S().done;
    assert.ok(done.length === 2 && done[0].t <= done[1].t, 'S.done em ordem de instante: ' + done.map(m => m.t - agora).join(', '));
  } finally { a.fechar(); }
});
