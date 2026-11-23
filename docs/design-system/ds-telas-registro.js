// Amostras navegáveis do cartão aprovado. Dias e a folha do Hoje usam o mesmo desenho.
const TURNOS_REG = { m: ['Manhã', 'manha'], t: ['Tarde', 'tarde'], n: ['Noite', 'noite'] };
const COMO_REG = { ultima: 'Como da última vez', prescrito: 'Como o prescrito', ajustar: 'Ajustar', presenca: 'Só que treinei' };
const EX_REG = {
  A: [['Supino inclinado', 3, 62.5, 10], ['Puxada aberta', 4, 55, 12], ['Elevação lateral', 4, 10, 15], ['Tríceps corda', 3, 25, 12]],
  B: [['Leg press', 4, 180, 12], ['Cadeira extensora', 3, 50, 15], ['Mesa flexora', 3, 40, 12], ['Panturrilha em pé', 4, 70, 15]],
  C: [['Remada baixa', 4, 60, 10], ['Desenvolvimento', 3, 22, 10], ['Rosca direta', 3, 14, 12]],
  D: [['Elevação lateral', 4, 10, 15], ['Panturrilha sentado', 4, 45, 15], ['Abdominal na polia', 3, 35, 15]],
  E: [['Supino reto', 3, 70, 8], ['Remada curvada', 3, 60, 10], ['Rosca martelo', 3, 14, 12]]
};
const novoCardioDemo = () => ({ m: 'bike', min: 30, i: 'moderado' });
const TURNO_DITO_REG = { m: 'de manhã', t: 'à tarde', n: 'à noite' };
// a carga do Ajustar anda com o passo do equipamento, como no app (2,5 kg na anilha e na barra, 1 kg no halter)
const PASSO_REG = { 'Leg press': 5, 'Supino inclinado': 2.5, 'Puxada aberta': 2.5, 'Remada baixa': 2.5, 'Supino reto': 2.5, 'Remada curvada': 2.5 };
const diasRegistroDemo = new Map();
let cartaoDemo, anteriorAoAjuste;
function botaoReg(acao, t, classe = '', extra = '') {
  return `<button data-reg="${acao}" class="${classe}" ${extra}>${t}</button>`;
}
function fichasReg(k, opcoes, selecionados = []) {
  return '<div class="fita-f">' + opcoes.map(v => botaoReg(k + '/' + v, v, '', 'aria-pressed="' + selecionados.includes(v) + '"')).join('') + '</div>';
}
function cardioReg(f) {
  const tempos = [15, 20, 30, 45, 60], outro = f.outro || !tempos.includes(f.min);
  return '<div class="v3-reg-passo"><p>O cardio</p><p class="v3-rotulo">Modalidade</p>' + fichasReg('m', ['bike','esteira inclinada','elíptico','remo'], [f.m]) +
    '<p class="v3-rotulo">Minutos</p>' + fichasReg('min', tempos.map(n => n + ' min').concat('outro'), [outro ? 'outro' : f.min + ' min']) +
    (outro ? '<div class="v3-reg-contador">' + botaoReg('passo/-5', '−', '', 'aria-label="Diminuir minutos"') + '<output aria-live="polite">' + f.min + ' min</output>' + botaoReg('passo/5', '+', '', 'aria-label="Aumentar minutos"') + '</div>' : '') +
    '<p class="v3-rotulo">Intensidade</p>' + fichasReg('i',['leve','moderado'],[f.i]) + botaoReg('guardarCardio','Guardar o cardio','vai') + '</div>';
}
function regDemo(chave, original, cd, dia, hoje, proximo) {
  if (!diasRegistroDemo.has(chave)) diasRegistroDemo.set(chave, { sessoes: original ? [original] : [], cardio: cd && novoCardioDemo() });
  const d = diasRegistroDemo.get(chave);
  if (cartaoDemo?.chave !== chave) cartaoDemo = { chave, grupos: [] };
  const r = cartaoDemo;
  Object.assign(r, { d, dia, hoje, proximo });
  const nome = k => k === 'livre' ? 'Treino livre' : k === 'HX' ? 'HYROX' : k === 'falta' ? 'Falta' : k === 'cardio' ? 'Só cardio' : 'Treino ' + k;
  const grupo = (p, h) => '<div class="v3-reg-passo"><p>' + p + '</p>' + h + '</div>';
  const opFreq = botaoReg('descanso','Descanso','peq') + (hoje ? '' : botaoReg('tipo/falta','Falta','peq'));
  let h = '';
  if (r.k || r.outro) h += '<div class="v3-reg-escolhido">' + (r.k ? '<b>' + nome(r.k) + '</b>' : '') + (r.dur ? '<span>' + r.dur + '</span>' : '') + (r.turno ? '<span>' + TURNO_DITO_REG[r.turno] + '</span>' : '') + botaoReg('mudar','mudar','saida') + '</div>';
  if (r.form) h += cardioReg(r.form);
  else if (r.k === 'falta') h += grupo('O motivo, se quiser dizer. Continua sendo falta.', fichasReg('motivo', MOTIVOS_DO_MES) + botaoReg('guardarFalta','Guardar a falta','vai'));
  else if (r.k === 'livre' && !r.dur) h += grupo('O que trabalhou?', fichasReg('grupo',['peito','costas','perna','ombro','braço','abdômen'],r.grupos)) +
    grupo('Quanto tempo?', fichasReg('dur',['30 min','45 min','1h','1h30']));
  else if (r.k && !r.turno) h += grupo('Em que turno?', '<div class="fita-f">' + Object.entries(TURNOS_REG).map(([k,[t,i]]) => botaoReg('turno/'+k,ic[i]+t)).join('') + '</div><small>Só o turno basta. A hora exata você põe depois, se quiser.</small>');
  else if (r.k) {
    if (r.k !== 'livre') h += grupo('Como foi?', Object.entries(COMO_REG).filter(([k]) => k !== 'ajustar' || !d.sessoes.length).map(([k,t]) =>
      botaoReg('como/' + k, '<span><b>' + t + '</b><small>' + ({ultima:EX_REG[r.k].reduce((n,e)=>n+e[1],0)+' séries, as cargas de segunda, 3/11',prescrito:'As séries e repetições do treino',ajustar:'Mude só o que foi diferente',presenca:'Sem séries. Conta como dia treinado'})[k] + '</small></span>' + ic.dir, 'v3-reg-op' + (k === 'ultima' ? ' forte' : ''), !EX_REG[r.k] && k !== 'presenca' ? 'disabled' : '')).join(''));
    h += '<label class="v3-reg-hora">Hora exata, se quiser<input type="time" data-reg-hora value="' + (r.hora || '') + '"></label>';
    if (r.k === 'livre') h += botaoReg('como/presenca','Guardar o treino livre','vai');
  } else if (r.outro || (!d.sessoes.length && !d.freq && !d.cardio)) {
    h += grupo(r.outro && d.sessoes.length ? 'Qual foi o outro treino?' : 'O que foi esse dia?', '<div class="v3-reg-letras">' +
      [...Object.keys(EX_REG),'HX','livre'].map(k => '<span class="v3-reg-letra">' + botaoReg('tipo/'+k, k, proximo === k ? 'previsto' : k === 'HX' ? 'hx' : k === 'livre' ? 'livre' : '') + (proximo === k ? '<small aria-hidden="true">próximo</small>' : '') + '</span>').join('') +
      '</div>' + (r.outro ? '' : '<div class="v3-reg-frequencias">' + opFreq + botaoReg('soCardio','Só cardio','peq') + '</div>'));
  } else {
    if (d.freq && !d.sessoes.length) h += grupo('Descanso ou falta?', opFreq + (d.freq === 'falta' ? fichasReg('motivo', MOTIVOS_DO_MES, [d.motivo]) : '') + botaoReg('tirarResposta','Tirar a resposta','saida'));
    if (d.cardio) h += '<div class="v3-reg-cardio-ok">Cardio: ' + d.cardio.min + ' min de ' + d.cardio.m + ', ' + d.cardio.i + '. ' + botaoReg('tirarCardio','tirar','saida') + '</div>';
    else if (!r.semCardio) h += grupo('Teve cardio também?', botaoReg('sim','Sim','peq') + botaoReg('nao','Não','peq'));
    if (d.cardio && !d.sessoes.length && !d.freq && !r.semResposta) h += grupo('E a musculação nesse dia?', opFreq + botaoReg('semResposta','Deixar sem resposta','saida'));
    h += botaoReg('outro', d.sessoes.length ? '+ Outro treino nesse dia' : 'Registrar um treino','v3-reg-outro');
  }
  // a vaga do aviso existe sempre, no fim do cartão, como no app
  const aviso = r.aviso ? '<div class="v3-reg-aviso" role="status"><span>' + r.aviso + '</span>' + botaoReg('desfazer','Desfazer') + '</div>' : '';
  return '<div class="v3-registro">' + h + '<div class="v3-reg-aviso-lugar">' + aviso + '</div></div>';
}
function ajustesReg() {
  const r = cartaoDemo;
  return H.folha('Treino ' + r.k + ' · ' + r.dia, 'Mude só o que foi diferente.', r.ajustes.map(([nome,n,carga,reps,nao],i) =>
    '<div class="v3-reg-ex"><div><b>' + nome + '</b>' + botaoReg('pula/'+i,nao?'fiz':'não fiz','saida') + '</div>' +
    (nao ? '' : '<div class="v3-reg-pares">' + n + ' × ' + [carga,reps].map((v,j) => '<span class="v3-reg-contador">' +
      botaoReg('aj/'+i+'/'+j+'/-1','−','','aria-label="Diminuir '+(j?'repetições':'carga')+'"') + '<output aria-live="polite">' + String(v).replace('.', ',') + (j?' rep':' kg') + '</output>' +
      botaoReg('aj/'+i+'/'+j+'/1','+','','aria-label="Aumentar '+(j?'repetições':'carga')+'"') + '</span>').join('') + '</div>') + '</div>').join('') +
    '<p class="txt">Todas as séries de um exercício entram iguais.</p>' + botaoReg('guardaAjuste','Guardar o treino','vai'));
}
// a data do aviso é curta, como no app: "Segunda, 9", sem o mês
function curta(x) { return String(x).split(' de ')[0].split(' · ')[0]; }
function maiuscula(x) { x = curta(x); return x.charAt(0).toUpperCase() + x.slice(1); }
function pintaReg() {
  if (!P.folha) topo().edicaoDia = (topo().edicaoDia || 0) + 1;
  desenhaAparelho();
}
document.addEventListener('input', e => {
  if (e.target.matches('[data-reg-hora]') && cartaoDemo) {
    cartaoDemo.hora = e.target.value;
    if (cartaoDemo.hora) {
      const h = Number(cartaoDemo.hora.slice(0,2)); cartaoDemo.turno = h < 5 || h >= 18 ? 'n' : h < 12 ? 'm' : 't';
    }
  }
});
document.addEventListener('click', e => {
  const b = e.target.closest('[data-reg]'); if (!b) return;
  const [acao, valor, campo, delta] = b.dataset.reg.split('/');
  const rapido = atual().id === 'f-cardio';
  const r = rapido ? atual() : cartaoDemo, d = r.d;
  function limpa() { Object.assign(r, { k:'', turno:'', hora:'', dur:null, grupos:[], outro:false, form:null, semResposta:false, semCardio:false }); }
  function guarda(texto, fn) {
    const antes = { ...d, freq:d.freq, motivo:d.motivo, sessoes:d.sessoes.slice() };
    fn(); limpa();
    r.aviso = texto; r.antes = antes;
    clearTimeout(r.timer); r.timer = setTimeout(() => { if (r.aviso === texto) { r.aviso = ''; if (r === cartaoDemo && $('#fone')) pintaReg(); } }, 6000);
  }
  function salvaTreino(modo) {
    const k = r.k, turno = r.turno, hora = r.hora;
    guarda([k === 'livre' ? 'Treino livre' : k === 'HX' ? 'HYROX' : 'Treino '+k,curta(r.dia),hora || TURNO_DITO_REG[turno],k !== 'livre' && ({ultima:'como da última vez',prescrito:'como o prescrito',ajustar:'ajustado',presenca:'só a presença'})[modo]].filter(Boolean).join(' · ') + '.',
      () => { d.sessoes.push({ k, turno, hora }); d.sessoes.sort((a,b) => (a.hora || {m:'08:00',t:'15:00',n:'20:00'}[a.turno]).localeCompare(b.hora || {m:'08:00',t:'15:00',n:'20:00'}[b.turno])); });
  }
  switch (acao) {
    case 'tipo': r.k = valor; break;
    case 'turno': r.turno = valor; break;
    case 'dur': r.dur = valor; break;
    case 'grupo': r.grupos = r.grupos.includes(valor) ? r.grupos.filter(g=>g!==valor) : [...r.grupos,valor]; break;
    case 'outro': r.outro=true; break;
    case 'mudar': limpa(); break;
    case 'descanso': guarda(maiuscula(r.dia)+': descanso.', () => { d.freq='desc'; d.motivo=''; }); break;
    case 'motivo': case 'guardarFalta': guarda(maiuscula(r.dia)+': falta'+(valor ? ', '+valor : '')+'.', () => { d.freq='falta'; d.motivo=valor||''; }); break;
    case 'tirarResposta': d.freq=''; d.motivo=''; r.aviso=''; break;
    case 'como':
      if (valor !== 'ajustar') { salvaTreino(valor); break; }
      r.ajustes = EX_REG[r.k].map(l=>l.slice()); anteriorAoAjuste = P.folha;
      P.folha = { id:'f-ajustar-registro', anterior:anteriorAoAjuste }; break;
    case 'pula': r.ajustes[valor][4]=!r.ajustes[valor][4]; break;
    case 'aj': { const i=Number(campo)+2, passo = i === 2 ? (PASSO_REG[r.ajustes[valor][0]] || 1) : 1; r.ajustes[valor][i]=Math.max(Number(campo),r.ajustes[valor][i]+Number(delta)*passo); break; }
    case 'guardaAjuste': P.folha=anteriorAoAjuste; salvaTreino('ajustar'); break;
    case 'sim': case 'soCardio': r.aviso=''; r.form=novoCardioDemo(); if (acao==='soCardio') r.k='cardio'; break;
    case 'nao': r.semCardio=true; break;
    case 'semResposta': r.semResposta=true; break;
    case 'tirarCardio': guarda(maiuscula(r.dia)+': cardio tirado.', () => { d.cardio=null; }); break;
    case 'm': case 'i': r.form[acao]=valor; break;
    case 'min': r.form.outro=valor==='outro'; if (!r.form.outro) r.form.min=parseInt(valor,10); break;
    case 'passo': r.form.outro=true; r.form.min=Math.max(5,Math.min(180,r.form.min+Number(valor))); break;
    case 'guardarCardio':
      if (rapido) { voltar(); return; }
      guarda(maiuscula(r.dia)+': '+r.form.min+' min de '+r.form.m+'.', () => { d.cardio=r.form; }); break;
    case 'desfazer': Object.assign(d,r.antes); r.aviso=''; break;
  }
  pintaReg();
});
