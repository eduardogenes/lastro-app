/* As telas, parte 1: Hoje, Treino, Dias. Cada tela diz o que é (camada), de
   onde se chega, para onde leva, e desenha cada estado com dado realista. */

const L0 = (hora, extra) => `<button data-folha="f-tipo-dia" aria-label="segunda, 16 de novembro, dia de treino. Mudar o tipo do dia">segunda, 16 nov · <span class="n">${hora}</span> · ${extra || 'treino'}${ic.baixo}</button><button data-folha="f-aparece" aria-label="Escolher o que aparece">${ic.ajuste}</button>`;

/* ======================= HOJE ======================= */
function linhaDoDia(est) {
  const h = { treino: 365, aula: 365, andamento: 400, parado: 470, confirmar: 560, refeicao: 760, noite: 1260, livre: 900, 'sem-comida': 365 }[est] || 365;
  const min = s => { const [a, b] = s.split('h').map(Number); return a * 60 + b; };
  const feitas = { treino: [], aula: [], andamento: ['pre'], parado: ['pre'], confirmar: ['pre', 'treino', 'cafe'], refeicao: ['pre', 'treino', 'cafe'], noite: ['pre', 'treino', 'cafe', 'almoco'], livre: ['pre', 'treino', 'cafe'] }[est] || [];
  const itens = [...D.REF.slice(0, 1), { id: 'treino', h: '06h15', n: 'Treino B', tr: 1 }, ...D.REF.slice(1)];
  const agoraId = { treino: 'treino', aula: 'treino', andamento: 'treino', parado: 'treino', refeicao: 'almoco' }[est];
  const prox = itens.find(r => !feitas.includes(r.id) && min(r.h) > h);
  return { html: `<div class="ld" role="list">${itens.map(r => { const ok = feitas.includes(r.id), ag = r.id === agoraId, falta = !ok && !ag && h - min(r.h) >= 60;
      return `<button role="listitem" class="${ok ? 'ok' : ag ? 'agora' : falta ? 'falta' : ''}" ${r.tr ? 'data-ir="serie"' : `data-folha="f-refeicao"`} aria-label="${r.n}, ${r.h}${ok ? ', feito' : falta ? ', sem resposta' : ''}"><span class="p">${ok ? ic.ok : r.tr ? ic.halter : ic.prato}</span><span class="n">${r.h}</span></button>`; }).join('')}</div>
    <p class="ld-leg"><span>${prox ? `a seguir: <b>${prox.n}</b>, ${prox.h}` : 'nada mais para hoje'}</span>${prox && prox.k ? `<span class="n">${prox.k} kcal</span>` : ''}</p>`, n: feitas.length, tot: itens.length };
}
function seQuiser(agua, peso, cardio) {
  return H.secao('Se quiser', 'nada aqui é obrigatório', `<div class="instr">
    <button class="gota" aria-label="Somar um copo de água. ${agua} de 14"><span class="nivel" style="height:${agua / 14 * 100}%"></span><span class="rt">Água · +1</span><span class="v n">${agua}<small> /14</small></span></button>
    <button class="gota" data-lugar="corpo"><span class="rt">Peso${peso ? ' · hoje' : ''}</span><span class="v n">${peso ? vir(peso) : '<small>pôr</small>'}</span></button>
    <button class="gota" data-folha="f-cardio"><span class="nivel" style="height:${cardio * 50}%;background:var(--assunto-treino)"></span><span class="rt">Cardio</span><span class="v n">${cardio}<small> /2</small></span></button></div>`);
}
function ritmo(ontem, lembrete) {
  const sem = [['S', 'cheia', 'B'], ['T', 'cheia', 'C'], ['Q', 'cheia', 'D'], ['Q', 'cheia', 'A'], ['S', 'meia', ''], ['D', 'vazia', ''], ['S', 'hoje', '']];
  return H.secao('Seu ritmo', 'últimos 7 dias', `<div class="ritmo">${sem.map(d => `<button data-lugar="dias" aria-label="${d[0]}${d[2] ? ', treino ' + d[2] : ''}"><span class="bola ${d[1]}">${d[2]}</span>${d[0]}</button>`).join('')}</div>
    ${lembrete ? `<div class="caixa" style="background:var(--assunto-corpo)" role="note"><p>Fotos do corpo amanhã<small>Quinta, 26/11, à noite. São 11 fotos e uns 4 minutos; separe a mesma roupa da última vez.</small></p><div class="bs">${H.peq('Abrir as fotos', { f: 1, ir: 'fotos' })}${H.peq('Agora não', { c: 1, desfazer: 'Lembrete dispensado até amanhã.' })}</div></div>` : ''}
    ${ontem ? H.pergunta('Ontem ficou em branco. Foi como o plano?', 'Sem resposta, o dia fica fora da conta. Não vira zero.', ['Foi, sim', 'Quase', 'Não lembro']) : ''}`);
}
tela({ id: 'hoje', n: 'Hoje', g: 'hoje', c: 'lugar', lugar: 'hoje',
  d: 'O topo diz o que importa agora, com um botão só; a cor diz o assunto. Embaixo, o dia inteiro numa linha, o que está ligado e os últimos sete dias. Role para ver a ação grudar no topo e a doca encolher.',
  es: [['treino', '06h05 · treino daqui a 10 min'], ['aula', 'dia de aula do box'], ['andamento', 'treino em andamento'], ['parado', 'treino parado há tempo'], ['confirmar', 'confirmar a duração'], ['refeicao', '12h40 · almoço'], ['noite', '21h00 · pergunta da noite'], ['livre', 'livre, com lembrete das fotos'], ['sem-comida', 'comida desligada'], ['vazio', 'primeiro dia, sem treino']],
  vai: ['serie', 'aula', 'f-registrar', 'f-refeicao', 'f-aparece', 'f-tipo-dia', 'f-cardio', 'registrar-passado', 'sessao-passada', 'fotos'],
  gruda: e => ({ treino: ['Treino B<small>22 séries</small>', 'Começar', 'serie'], andamento: ['Treino B<small>8 de 22</small>', 'Voltar', 'serie'], refeicao: ['Almoço<small>12h30 · 719 kcal</small>', 'Comi', ''], noite: ['A comida de hoje<small>foi como o plano?</small>', 'Foi, sim', ''], aula: ['Aula do box<small>hoje, 07h00</small>', 'Fiz a aula', 'aula'] }[e] || null) ? (x => `<span>${x[0]}</span><button ${x[2] ? `data-ir="${x[2]}"` : ''}>${x[1]}</button>`)({ treino: ['Treino B<small>22 séries</small>', 'Começar', 'serie'], andamento: ['Treino B<small>8 de 22</small>', 'Voltar', 'serie'], refeicao: ['Almoço<small>12h30 · 719 kcal</small>', 'Comi', ''], noite: ['A comida de hoje<small>foi como o plano?</small>', 'Foi, sim', ''], aula: ['Aula do box<small>hoje, 07h00</small>', 'Fiz a aula', 'aula'] }[e]) : '',
  r: e => {
    if (e === 'vazio') return H.momento({ cor: 'assunto-treino', linha0: `<span>segunda, 16 nov · <span class="n">09h12</span></span><button data-folha="f-aparece" aria-label="Escolher o que aparece">${ic.ajuste}</button>`, quando: 'ainda sem treino', titulo: 'Nada para agora.', grande: 1, apoio: 'Quando houver um treino no app, o próximo aparece aqui, com um botão só.', acoes: H.vai('Pôr o meu treino ' + ic.seta, { ir: 'revisao' }), saidas: H.saida('Registrar um treino livre', { ir: 'registrar-passado--fora' }) })
      + H.secao('Enquanto isso', '', `<div class="lista">${H.lin({ t: 'Colar o texto do treinador', a: 'o app organiza em treinos e séries', ir: 'revisao' })}${H.lin({ t: 'Escolher o que acompanhar', a: 'peso, água, cardio, fotos', folha: 'f-aparece' })}</div>`);
    const cor = { treino: 'assunto-treino', aula: 'assunto-corpo', andamento: 'assunto-treino', parado: 'assunto-treino', confirmar: 'assunto-corpo', refeicao: 'assunto-refeicao', noite: 'assunto-corpo', livre: 'assunto-feito', 'sem-comida': 'assunto-treino' }[e];
    const hora = { treino: '06h05', aula: '06h40', andamento: '06h38', parado: '07h52', confirmar: '09h20', refeicao: '12h40', noite: '21h00', livre: '15h00', 'sem-comida': '06h05' }[e];
    let m;
    if (e === 'treino' || e === 'sem-comida') m = H.momento({ cor, linha0: L0(hora), quando: 'daqui a 10 min', vivo: 1, titulo: 'Treino B', apoio: 'Pernas completas e panturrilhas. 22 séries, perto de uma hora.', acoes: H.vai('Começar ' + ic.seta, { ir: 'serie' }), saidas: H.saida('Hoje não vou treinar', { folha: 'f-tipo-dia' }) + H.saida('Já treinei e não anotei', { ir: 'registrar-passado' }) });
    if (e === 'aula') m = H.momento({ cor, linha0: L0(hora, 'aula'), quando: 'hoje, 07h00', vivo: 1, titulo: 'Aula do box', apoio: 'Anote no fim, um número por movimento. Ou repita a última aula.', acoes: H.vai('Fiz a aula ' + ic.seta, { ir: 'aula' }), saidas: H.saida('Hoje não vou', { folha: 'f-tipo-dia' }) });
    if (e === 'andamento') m = H.momento({ cor, linha0: L0(hora), quando: 'em andamento · 23 min', vivo: 1, titulo: 'Treino B', apoio: '8 de 22 séries guardadas. A próxima é terra romeno no Smith.', acoes: H.vai('Voltar ao treino ' + ic.seta, { ir: 'serie' }) });
    if (e === 'parado') m = H.momento({ cor, linha0: L0(hora), quando: 'parado há 1 h 10 min', titulo: 'Treino B', apoio: 'A última série foi às 06h42. Ainda está treinando?', acoes: H.vai('Continuo treinando', { ir: 'serie' }) + H.alt('Já parei', { ir: 'fim-treino' }), saidas: H.saida('Fiz mais do que anotei', { ir: 'por-em-dia' }) });
    if (e === 'confirmar') m = H.momento({ cor, linha0: L0(hora), quando: 'o treino de hoje cedo', titulo: 'Treino B', apoio: 'Fechou sozinho às 07h41: das 06h15 às 07h12, 57 min. Está certo?', acoes: H.vai('Está certo', { desfazer: 'Duração confirmada: 57 min.' }) + H.alt('Corrigir', { ir: 'sessao-passada' }) });
    if (e === 'refeicao') m = H.momento({ cor, linha0: L0(hora), quando: 'era às 12h30', vivo: 1, titulo: 'Almoço', apoio: 'Arroz, feijão, frango e mais 3.', acoes: H.vai(ic.ok + ' Comi', { desfazer: 'Almoço marcado como o plano.' }) + H.alt('Ver', { folha: 'f-refeicao' }), saidas: H.saida('Não foi assim', { folha: 'f-refeicao--diferente' }) });
    if (e === 'noite') m = H.momento({ cor, linha0: L0(hora), quando: '2 refeições ficaram sem resposta', titulo: 'A comida de hoje foi como o plano?', acoes: H.vai('Foi, sim', { desfazer: 'Hoje: foi como o plano.' }) + H.alt('Quase', { desfazer: 'Hoje: quase como o plano.' }), saidas: H.saida('Não sei dizer', { desfazer: 'Hoje fica fora da conta.' }) });
    if (e === 'livre') m = H.momento({ cor, fino: 1, anima: false, linha0: L0(hora), quando: 'tudo em dia', titulo: 'Livre até as 16h00', apoio: 'O próximo é o lanche da tarde. Ele aparece aqui meia hora antes.' });
    const ld = linhaDoDia(e === 'sem-comida' ? 'treino' : e);
    const corpoDia = e === 'sem-comida'
      ? H.secao('O dia', '0 de 1', `<div class="lista">${H.lin({ o: ic.halter, t: 'Treino B', a: '06h15 · 22 séries', ir: 'serie' })}</div>`)
      : H.secao('O dia', `${ld.n} de ${ld.tot}`, ld.html);
    return `<div style="--cor-agora:var(--${cor})">${m}</div>${corpoDia}
      ${seQuiser(e === 'noite' ? 9 : e === 'refeicao' || e === 'livre' ? 6 : 0, e === 'treino' || e === 'aula' || e === 'sem-comida' ? null : 77.4, e === 'noite' ? 1 : 0)}
      ${ritmo(e !== 'noite' && e !== 'sem-comida', e === 'livre')}`;
  } });

tela({ id: 'f-registrar', n: 'Registrar (o "+")', g: 'hoje', c: 'folha', base: 'hoje',
  d: 'O "+" da doca. O mais provável agora vem primeiro, em lima; o resto em areia. O texto livre entende frases simples e diz o que guardou, ou que não entendeu.',
  es: [['normal', 'sugestões'], ['entendeu', 'texto: entendeu'], ['naoentendeu', 'texto: não entendeu']],
  vai: ['serie', 'f-cardio', 'f-comi-outra', 'corpo'],
  r: e => H.folha('Registrar', 'O mais provável agora vem primeiro. Ou escreva do seu jeito.', `
    <form class="diga" onsubmit="return false"><input placeholder="almocei e tomei 2 copos" aria-label="Escreva o que quer registrar" value="${e === 'entendeu' ? 'almocei e tomei 2 copos' : e === 'naoentendeu' ? 'fiz abdominal' : ''}" enterkeyhint="send"><button aria-label="Guardar">${ic.seta}</button></form>
    <p class="eco" aria-live="polite">${e === 'entendeu' ? ic.ok + '<span>Guardado: almoço como o plano, 2 copos de água.</span>' : e === 'naoentendeu' ? ic.duvida + '<span>Não entendi "fiz abdominal". Tente "almocei", "2 copos" ou "pesei 77,6", ou use os botões abaixo.</span>' : ''}</p>
    <div class="sug"><button class="pri" data-desfazer="Almoço marcado como o plano."><span><b>Comi o almoço</b><br><span>719 kcal · como o plano</span></span>${ic.ok}</button>
      <button data-desfazer="Copo somado: 7 de 14."><b>+1 copo de água</b><span>6 de 14 hoje</span></button>
      <button data-lugar="corpo"><b>Peso de hoje</b><span>última: 77,6 kg</span></button>
      <button data-folha="f-cardio"><b>Cardio</b><span>bike, 25 min</span></button>
      <button data-folha="f-comi-outra"><b>Comi outra coisa</b><span>fora do plano</span></button></div>`) });

tela({ id: 'f-refeicao', n: 'Uma refeição do dia', g: 'hoje', c: 'folha', base: 'hoje',
  d: 'O que tem na refeição e marcar. "Não foi assim" abre as três respostas da exceção, em vez de "Pulei esta": o app separa quem comeu outra coisa de quem não comeu.',
  es: [['normal', 'a refeição'], ['diferente', 'não foi assim'], ['marcada', 'já marcada']], vai: ['f-comi-outra'],
  r: e => e === 'diferente'
    ? H.folha('Almoço', 'O que aconteceu? Não precisa detalhar.', `<div class="lista" style="margin-top:12px">${H.op(ic.prato, 'Comi outra coisa', 'diga o tamanho, sem pesar nada', { folha: 'f-comi-outra' })}${H.op(ic.prato, 'Comi metade', 'a mesma refeição, menos', { desfazer: 'Almoço: comi metade.' })}${H.op(ic.x, 'Não comi', 'fica anotado; a regra conta o dia como "quase"', { desfazer: 'Almoço: não comi.' })}${H.op(ic.duvida, 'Não sei dizer', 'fica fora da conta', { desfazer: 'Almoço fica fora da conta.' })}</div>`)
    : H.folha('Almoço', '<span class="n">12h30 · 719 kcal</span>' + (e === 'marcada' ? ' · marcado às 12h52, como o plano' : ''), `<div class="itens" style="margin-top:10px">${D.REF[2].it.map(i => `<div><span>${i[0]}</span><span class="n">${i[1]}</span></div>`).join('')}</div>
      <div class="acoes">${e === 'marcada' ? H.alt('Desmarcar', { cheio: 1, desfazer: 'Almoço desmarcado.' }) : H.vai(ic.ok + ' Comi', { desfazer: 'Almoço marcado como o plano.' }) + H.alt('Não foi assim', { est: 'diferente' })}</div>`) });

tela({ id: 'f-comi-outra', n: '"Comi outra coisa", com o tamanho', g: 'hoje', c: 'folha', base: 'hoje',
  d: 'Decisão do dono (17/11): o tamanho é guardado. Quatro respostas grandes, sem pesar nem listar. É dado novo: pede campo, migração e a pasta dos agentes.',
  r: () => H.folha('Comi outra coisa', 'No lugar do almoço. Não precisa pesar nem listar: só o tamanho, comparado ao do plano.', `<div class="sug" role="radiogroup" aria-label="Tamanho" style="margin-top:16px">
    <button role="radio" data-radio aria-checked="false"><b>Parecido</b><span>mesma quantidade</span></button><button role="radio" data-radio aria-checked="false"><b>Bem mais</b><span>refeição grande</span></button>
    <button role="radio" data-radio aria-checked="false"><b>Bem menos</b><span>quase nada</span></button><button role="radio" data-radio aria-checked="false"><b>Não sei</b><span>fica fora da conta</span></button></div>
    <div class="acoes">${H.vai('Guardar', { desfazer: 'Almoço: outra coisa, parecido.' })}</div>`) });

tela({ id: 'f-aparece', n: 'O que aparece', g: 'hoje', c: 'folha', base: 'hoje',
  d: 'O ícone de ajuste no bloco do Hoje. O treino fica sempre; o resto se liga e desliga. Desligar esconde, nunca apaga. No fim, a porta dos Ajustes.', vai: ['ajustes'],
  r: () => H.folha('O que aparece', 'O treino fica sempre. O resto é seu: ligue só o que for usar. Desligar não apaga nada.', `<div class="lista" style="margin-top:12px">${H.chave('Comida', 'o plano do nutricionista e a pergunta do dia', 1)}${H.chave('Água', 'contar copos', 1)}${H.chave('Peso', 'a pesagem da manhã', 1)}${H.chave('Cardio', 'as duas sessões da semana', 1)}${H.chave('Medidas', 'fita e adipômetro', 0)}${H.chave('Fotos do corpo', 'sessão a cada 14 dias', 1)}</div>
    <div class="lista" style="margin-top:10px">${H.lin({ t: 'Ajustes', a: 'conta, cópia de segurança, lembretes', ir: 'ajustes' })}</div>`) });

tela({ id: 'f-cardio', n: 'Cardio', g: 'hoje', c: 'folha', base: 'hoje',
  d: 'Lacuna do protótipo. Escolha do aparelho em fichas, minutos pela régua, intensidade em seletor. Um "Guardar".',
  r: () => H.folha('Cardio', 'Hoje: 20 a 25 min, leve. 1 de 2 nesta semana.', `<div class="corpo">${H.fichas(['Bike', 'Esteira', 'Elíptico', 'Escada', 'Outro'], 0, 'Aparelho').replace('class="fita-f"', 'class="fita-f" style="padding:4px 0 2px;margin:0"')}</div>
    <div class="gigante p n" style="margin-top:16px"><span id="cd-v">25</span><small>min</small></div>${regua({ mn: 5, mx: 90, st: 1, v: 25, cada: 5, px: 22, nome: 'Minutos', un: 'min', alvo: '#cd-v' })}
    <div style="margin-top:10px">${H.seg(['Leve', 'Moderado', 'Forte'], 'Leve', 'Intensidade')}</div>
    <div class="acoes">${H.vai(ic.ok + ' Guardar', { desfazer: 'Cardio guardado: bike, 25 min, leve.' })}</div>`) });

tela({ id: 'f-tipo-dia', n: 'O tipo do dia', g: 'hoje', c: 'folha', base: 'hoje',
  d: 'Tocar na data do bloco, ou "Hoje não vou treinar". Treino ou descanso (o efeito na comida dito antes do toque), o turno (muda os horários das refeições), "demanda alta" (dia de mais esforço, a regra do nutricionista sobe a comida) e, no app, "Como foi o dia" (a aderência que a régua da comida lê).',
  r: () => H.folha('Segunda, 16 de novembro', 'Isto muda só hoje. A semana de treino continua a mesma.', `
    <div class="corpo">${H.seg(['Treino', 'Descanso'], 'Treino', 'Tipo do dia')}</div>
    <h3 class="h" style="margin-top:18px">Turno <small>muda os horários das refeições</small></h3><div class="corpo">${H.seg(['Manhã', 'Tarde', 'Noite'], 'Manhã', 'Turno')}</div>
    <div class="lista" style="margin-top:10px">${H.chave('Demanda alta', 'dia de trabalho físico ou de mais esforço: o plano sobe a comida', 0)}${H.lin({ t: 'Já treinei hoje', a: 'registrar o treino que não anotou', ir: 'registrar-passado' })}</div>
    <div class="acoes">${H.vai('Pronto', { fecha: 1 })}</div>`) });

/* ======================= TREINO ======================= */
const EXa = D.EX[0];
const topoTreino = (rel, n, f) => H.topoA(`<button class="ico" data-voltar aria-label="Recolher o treino">${ic.baixo}</button>`, `Treino B · <span class="n">${rel}</span>`, `<button class="ico" data-folha="f-lista-treino" aria-label="Ver e reordenar os exercícios">${ic.lista}</button>`) + H.segs(n || 22, f || 0, f || 0);
tela({ id: 'serie', n: 'Uma série por tela', g: 'treino', c: 'acao', lugar: 'hoje', glob: { treino: true },
  d: 'A série já vem com a carga e as repetições da última vez. Igual? Um toque em "Feito". Toque em carga ou repetição para escolher o que a régua muda. Embaixo, ao alcance do polegar, tudo o que se aperta no treino.',
  es: [['normal', 'série 1, como da última vez'], ['subir', 'sugestão: subir a carga'], ['intervalo', 'aviso: intervalo longo'], ['trocado', 'exercício trocado hoje'], ['meio', 'série 2, com a 1ª feita'], ['falhou', 'a série não foi guardada']],
  vai: ['descanso', 'f-lista-treino', 'f-mudar', 'por-em-dia', 'exercicio', 'fim-treino'], v: 'Recolhe o treino; ele continua aberto, e a tira aparece nos lugares.',
  r: e => {
    const ex = e === 'subir' ? D.EX[1] : EXa, nome = e === 'trocado' ? 'Hack machine' : ex.n, u = ex.h[ex.h.length - 1];
    const kg = e === 'subir' ? 45 : 60, rep = e === 'subir' ? 12 : e === 'meio' ? 10 : 9;
    const feitas = e === 'meio' ? `<span class="f n">${ic.ok}60 × 9</span><span class="a n">série 2</span>` : e === 'subir' ? `<span class="a n">série 1</span><span class="n">2</span><span class="n">3</span><span class="n">4</span>` : `<span class="a n">série 1</span><span class="n">2</span>`;
    const extra = e === 'subir' ? H.caixa('', 'Subir para 47,5 kg?', 'Na última vez você fez 12 em todas as séries com 45. É a regra do treinador: com a carga nova, o alvo volta para 8 a 10.', H.peq('Manter', { c: 1 }) + H.peq('Subir', { f: 1 }))
      : e === 'intervalo' ? H.caixa('a', 'Faz 14 minutos desde a última série. Fez outras nesse tempo?', 'O descanso aqui é de 3 min.', H.peq('Pôr em dia', { f: 1, ir: 'por-em-dia' }) + H.peq('Não, só parei', { est: 'normal' }))
      : e === 'falhou' ? H.caixa('a', 'A série não foi guardada.', 'O aparelho recusou a gravação. Os números continuam aqui.', H.peq('Tentar de novo', { f: 1, est: 'normal' }) + H.peq('Copiar em texto', { c: 1 })) : '';
    return `<div class="acao-t">${topoTreino(e === 'meio' ? '04:12' : e === 'intervalo' ? '31:40' : '00:00', e === 'subir' ? 22 : 22, e === 'meio' ? 1 : e === 'subir' ? 2 : e === 'intervalo' ? 3 : 0)}
      ${e === 'meio' || e === 'subir' || e === 'intervalo' ? '' : `<p class="dica"><b>Treinador:</b> ${ex.d}</p>`}<div class="feitas">${feitas}</div>${extra}
      <div class="meio-a"><h2 class="nome-a">${nome}</h2><p class="linha-a">${ex.f[0]}–${ex.f[1]} repetições, sobrando ${ex.rir}${e === 'trocado' ? ' · no lugar do agachamento' : ''}</p>
        <div class="par"><button data-par aria-pressed="false"><span class="rt">${ex.un}</span><span class="gr n">${vir(kg)}</span></button><span class="x" aria-hidden="true">×</span><button data-par aria-pressed="true"><span class="rt">repetições</span><span class="gr n" id="v-rep">${rep}</span></button></div>
        ${regua({ mn: 1, mx: 30, st: 1, v: rep, cada: 5, px: 30, nome: 'Repetições', un: 'repetições', alvo: '#v-rep', passos: false })}
        <p class="ref">${e === 'trocado' ? 'exercício novo hoje: sem histórico' : `da última vez: <span class="n">${vir(u[1])} × ${u[2][e === 'meio' ? 1 : 0]}</span>`}</p></div>
      <div class="pe-a">${H.vai(ic.ok + ' Feito', { g: 1, ir: 'descanso' })}</div>
      <div class="saidas e">${H.saida('Mudar', { folha: 'f-mudar' })}${H.saida('Já fiz mais do que anotei', { ir: 'por-em-dia' })}${H.saida('Histórico', { ir: 'exercicio' })}</div></div>`;
  } });

tela({ id: 'descanso', n: 'Descanso', g: 'treino', c: 'acao', lugar: 'hoje', glob: { treino: true },
  d: 'Começa sozinho ao confirmar a série. A cor enche a tela de baixo para cima no tempo do descanso: de longe, sem ler, dá para saber quanto falta. "Sobraram quantas?" grava o RIR da série que acabou, se quiser.',
  es: [['normal', '1 min 50 s faltando'], ['fim', 'acabando']], vai: ['serie'],
  r: e => `<div class="acao-t pausa"><div class="enche" style="height:${e === 'fim' ? 92 : 38}%"></div>${topoTreino('03:41', 22, 1)}
    <div class="meio-a c"><p class="linha-a" style="text-align:center">descanso</p><div class="contagem n" role="timer" aria-label="faltam ${e === 'fim' ? '12 segundos' : '1 minuto e 50 segundos'}">${e === 'fim' ? '0:12' : '1:50'}</div>
      <div class="sobrou"><p>Sobraram quantas repetições? Se quiser dizer.</p>${H.resp(['0', '1', '2', '3', '4+'], e === 'fim' ? '1' : null, { nome: 'Repetições que sobraram', fundo: 1 })}</div>
      <div class="prox"><div class="tx"><span>a seguir · série 2 de 2</span><b>Agachamento no Smith</b><span class="n">60 × 10</span></div><button class="peq" data-desfazer="Copo somado: 7 de 14.">Água +1</button></div></div>
    <div class="pe-a">${H.vai('Começar já', { g: 1, ir: 'serie--meio' })}</div><div class="saidas c">${H.peq('−15 s', { c: 1 })}${H.peq('+15 s', { c: 1 })}</div></div>` });

tela({ id: 'f-lista-treino', n: 'A lista do treino', g: 'treino', c: 'folha', base: 'serie',
  d: 'O ícone de lista no topo. Ir a um exercício, mudar a ordem de hoje (só os que ainda vêm), deload, abrir as opções e encerrar.',
  vai: ['f-menu-sessao', 'fim-treino'],
  r: () => { let ini = 0; return H.folha('Treino B', '8 de 22 séries. Toque para ir a um exercício; as setas mudam a ordem de hoje.', `<div class="lista" style="margin-top:10px">${D.EX.map((x, i) => { const fe = i < 3 ? x.s : 0; ini += x.s;
      return `<div class="op ${fe ? 'feito' : i === 3 ? 'atual' : ''}"><button class="o n" aria-label="Ir para ${x.n}" data-fecha>${fe ? ic.ok : i + 1}</button><span class="tx"><b>${x.n}</b><span class="n">${x.s} séries · ${fe} feitas</span></span>${i > 3 ? `<span class="mv"><button aria-label="Subir ${x.n}">${ic.cima}</button><button aria-label="Descer ${x.n}">${ic.baixo}</button></span>` : ''}</div>`; }).join('')}</div>
    ${H.chave('Deload hoje', 'corta para 13 séries, nas mesmas cargas', 0)}
    <div class="acoes">${H.alt('Opções', { folha: 'f-menu-sessao' })}${H.alt('Encerrar o treino', { cheio: 1, ir: 'fim-treino' })}</div>`); } });

tela({ id: 'f-mudar', n: 'Mudar este exercício', g: 'treino', c: 'folha', base: 'serie',
  d: '"Mudar", embaixo da série. Tudo vale só neste treino; no fim, o app pergunta se vira regra.',
  vai: ['f-dor', 'f-foto-aparelho', 'exercicio', 'f-catalogo'],
  r: () => H.folha('Mudar hoje', 'Agachamento no Smith. Vale só neste treino; no fim o app pergunta se vira regra.', `<div class="lista" style="margin-top:10px">
    ${H.op(ic.troca, 'Trocar por hack machine', 'mesmo músculo, mesmas séries', { est: 'x', fecha: 1 })}${H.op(ic.troca, 'Trocar por outro', 'buscar no catálogo', { folha: 'f-catalogo' })}
    ${H.op(ic.mais, 'Mais uma série', '2 → 3', { fecha: 1 })}${H.op(ic.fim, 'Fazer cadeira flexora antes', 'o aparelho está ocupado', { fecha: 1 })}
    ${H.op(ic.pula, 'Pular hoje', 'fica anotado como pulado', { desfazer: 'Agachamento pulado hoje.' })}${H.op(ic.cam, 'O aparelho', 'a foto, para achar o mesmo', { folha: 'f-foto-aparelho' })}
    ${H.op(ic.atencao, 'Senti dor aqui', 'anota e mostra o que o treinador manda fazer', { folha: 'f-dor' })}</div>`) });

tela({ id: 'f-dor', n: 'Dor anotada', g: 'treino', c: 'folha', base: 'serie',
  d: 'O freio cita a regra e de quem ela é. Nunca conselho do app.',
  r: () => H.folha('Dor anotada', 'Agachamento no Smith, série 1. Fica no histórico com a data.', `<div class="caixa" style="background:var(--superficie-quieta);box-shadow:none"><p>Treinador:<small style="font-size:15px;line-height:1.45">“Apareceu dor: tire aquele exercício por 2 semanas e substitua por outro ângulo. Nunca empurre porque ‘está fraquinha’.”</small></p></div>
    <div class="acoes">${H.vai('Ver os substitutos', { folha: 'f-mudar' })}</div><div class="saidas">${H.saida('Fazer mesmo assim, e fica anotado', { fecha: 1 })}</div>`) });

tela({ id: 'f-menu-sessao', n: 'Opções do treino', g: 'treino', c: 'folha', base: 'serie',
  d: 'Lacuna do protótipo. O que vale para a sessão inteira, e não para um exercício.', vai: ['editor', 'progressao', 'fim-treino'],
  r: () => H.folha('Opções do treino', 'Treino B, aberto às 06h15.', `<div class="lista" style="margin-top:10px">
    ${H.op(ic.troca, 'Fazer outro treino hoje', 'trocar o B pelo C; as séries feitas ficam', { fecha: 1 })}${H.op(ic.editar, 'Editar o treino B', 'muda o programa, a partir do próximo', { ir: 'editor', dir: 1 })}
    ${H.op(ic.sobe, 'Progressão do treino', 'quem está pronto para subir', { ir: 'progressao', dir: 1 })}${H.op(ic.fim, 'Encerrar o treino', '8 de 22 séries', { ir: 'fim-treino', dir: 1 })}
    ${H.op(ic.lixo, 'Descartar esta sessão', 'apaga as 8 séries de hoje', { folha: 'f-confirma--descartar' })}</div>`) });

tela({ id: 'por-em-dia', n: 'Pôr em dia', g: 'treino', c: 'destino', lugar: 'hoje',
  d: 'Treinou e não anotou. Marque o que fez; cada um entra com todas as séries que faltam, as repetições da última vez, e a carga se acerta no passo (mexer na carga já marca). "Fiz tudo como da última vez" grava tudo num toque e volta ao treino. Sem marca, o principal espera ("Marque o que você fez"). Fica marcado como "registrado depois" e conta igual para a progressão. É tela, não folha: é lista que rola.',
  es: [['meio', 'no meio do treino'], ['depois', 'depois: o treino que já fiz']], vai: ['serie', 'fim-treino'],
  r: e => { const lin = D.EX.slice(0, 7).map((x, i) => { const ja = e === 'meio' && i < 2, on = i === 2 || i === 3, u = x.h[x.h.length - 1];
      return `<div class="pd ${ja ? 'ja' : on ? 'on' : ''}"><button class="ck" data-marca aria-checked="${on}" ${ja ? 'aria-disabled="true"' : ''} aria-label="${x.n}: fiz">${ic.ok}</button><span class="nm"><b>${x.n}</b><span class="n">${ja ? 'já anotado' : x.s + (x.s === 1 ? ' série' : ' séries') + ' · ' + u[2].join(' ') + ' rep'}</span></span>${ja ? '' : `<span class="st"><button aria-label="Menos 2,5 kg">−</button><b class="n">${vir(u[1])}</b><button aria-label="Mais 2,5 kg">+</button></span>`}</div>`; }).join('');
    return H.cab(e === 'depois' ? 'Treino que já fiz' : 'Pôr em dia', '2 marcados') + `<section class="secao" style="padding-top:2px"><p class="txt">Marque o que você fez. Cada um entra com as repetições da última vez; acerte a carga se mudou. Fica anotado como “registrado depois”.</p>
      ${e === 'depois' ? `<div class="corpo" style="margin-top:12px">${H.seg(['Treino A', 'Treino B', 'Treino C'], 'Treino B', 'Que treino foi')}</div>` : ''}
      <div class="acoes" style="margin-top:12px">${H.alt(ic.ok + ' Fiz tudo como da última vez', { cheio: 1 })}</div>
      <div class="lista" style="margin-top:6px">${lin}</div>
      <div class="acoes">${H.vai((e === 'depois' ? 'Guardar o treino ' : 'Guardar e continuar ') + ic.seta, { ir: e === 'depois' ? 'fim-treino' : 'serie' })}</div>
      <p class="txt">${e === 'depois' ? 'O que ficar sem marca entra como não feito.' : 'O app volta para o primeiro exercício que ainda falta.'} Dá para corrigir série por série depois, no histórico.</p></section>`; } });

tela({ id: 'fim-treino', n: 'Fim do treino', g: 'treino', c: 'acao', lugar: 'hoje',
  d: 'Devolve os números, sem comemorar. Se algo mudou hoje, pergunta de cada mudança se passa a valer; sem resposta, fica só hoje.',
  es: [['mudou', 'com mudanças: vira regra?'], ['igual', 'sem mudanças'], ['vazio', 'nada mais na fila']], vai: ['hoje', 'plano'],
  r: e => e === 'vazio'
    ? `<div class="acao-t pausa">${topoTreino('52:10', 22, 22)}<div class="meio-a c"><p class="linha-a">nada mais na fila</p><h2 class="heroi m">Tudo feito.</h2><p class="apoio">As 22 séries estão guardadas. Encerre para fechar o relógio.</p></div><div class="pe-a">${H.vai('Encerrar o treino', { g: 1, est: 'mudou' })}</div><div class="saidas c">${H.saida('Fazer mais um exercício', { folha: 'f-catalogo' })}</div></div>`
    : `<div class="acao-t pausa">${topoTreino('58:02', 22, 22)}<div style="padding-top:18px"><p class="linha-a">guardado · 58 min</p><h2 class="heroi m">22 séries. Treino B fechado.</h2>
      <p class="apoio">2 exercícios registrados depois, com as repetições da última vez. Carga nova em cadeira flexora: 47,5 kg.</p></div>
      ${e === 'mudou' ? `<h2 class="h" style="margin-top:18px">O que você mudou hoje <small>vira regra?</small></h2>
        <div class="decide"><p>Trocou agachamento no Smith por hack machine</p><small>Treino B · mesmas séries e faixa</small>${H.resp(['Só hoje', 'Passa a valer'], null, { nome: 'Trocou agachamento' })}</div>
        <div class="decide"><p>Mais uma série em cadeira flexora</p><small>4 → 5 séries · muda as séries de posterior na semana</small>${H.resp(['Só hoje', 'Passa a valer'], null, { nome: 'Mais uma série' })}</div>
        <p class="txt">Sem resposta agora, a pergunta continua no Hoje até o próximo B; aí fica só daquele dia. O que passar a valer aparece no Plano como diferença do treinador.</p>` : ''}
      <div class="pe-a" style="margin-top:auto;padding-top:18px">${H.vai('Fechar', { g: 1, lugar: 'hoje' })}</div><div class="saidas c">${H.saida('Ver as séries', { ir: 'sessao-passada' })}</div></div>` });

tela({ id: 'aula', n: 'Aula do box', g: 'treino', c: 'acao', lugar: 'hoje',
  d: 'Lacuna do protótipo. A aula não tem prescrição fixa: começa vazia e se monta de quatro jeitos (repetir a última, um modelo, colar o texto, foto da lousa). Depois, a lista rápida: um número por movimento, no fim da aula. Cor lilás: aula é do corpo, não do programa.',
  es: [['comeco', 'começar a aula'], ['lista', 'lista rápida'], ['lousa', 'foto da lousa lida']], vai: ['f-aula-texto', 'f-catalogo', 'serie'],
  r: e => {
    const topo = H.topoA(`<button class="ico" data-voltar aria-label="Recolher a aula">${ic.baixo}</button>`, `Aula do box · <span class="n">${e === 'comeco' ? '00:00' : '52:00'}</span>`, `<button class="ico" data-folha="f-menu-sessao" aria-label="Opções">${ic.lista}</button>`);
    if (e === 'comeco') return `<div class="acao-t" style="--cor:var(--assunto-corpo)">${topo}<div style="padding-top:14px"><p class="linha-a">segunda, 07h00</p><h2 class="heroi">Aula de hoje</h2><p class="apoio">Comece pelo que já sabe. Anotar é no fim, um número por movimento.</p></div>
      <div class="sug" style="margin-top:18px"><button class="pri" data-est="lista"><span><b>Repetir a última aula</b><br><span>quinta, 12/11 · 6 movimentos</span></span>${ic.repete}</button>
        <button data-est="lista"><b>Um modelo</b><span>HYROX, EMOM, AMRAP</span></button><button data-folha="f-aula-texto"><b>Colar o texto</b><span>do grupo do box</span></button>
        <button data-est="lousa"><b>Foto da lousa</b><span>o app lê os movimentos</span></button><button data-folha="f-catalogo"><b>Montar</b><span>um movimento por vez</span></button></div>
      <div class="saidas c" style="margin-top:auto">${H.saida('Não fiz a aula hoje', { lugar: 'hoje' })}</div></div>`;
    const mv = [['Remo', 'm', 1000, 'm'], ['Wall ball', 'rep', 75, 'rep · 9 kg'], ['Burpee broad jump', 'm', 80, 'm'], ['Farmer carry', 'm', 200, 'm · 2 × 24 kg'], ['Sled push', 'm', 50, 'm · 100 kg'], ['Sandbag lunge', 'm', 100, 'm · 20 kg']];
    return `<div class="acao-t" style="--cor:var(--assunto-corpo)">${topo}<div style="padding-top:10px"><h2 class="nome-a">${e === 'lousa' ? 'Lousa lida: 6 movimentos' : 'HYROX simulado'}</h2><p class="linha-a">${e === 'lousa' ? 'Confira o que o app leu. Toque num movimento para corrigir.' : 'Toque no número para mudar; vale para todas as passadas.'}</p></div>
      ${e === 'lousa' ? `<div class="caixa" style="margin-top:10px"><p>“2 rounds: 1000 m remo, 75 wall ball 9 kg, 80 m burpee broad jump…”<small>lido da foto de 07h02 · ${H.saida('ver a foto')}</small></p></div>` : ''}
      <div class="lista" style="margin-top:8px">${mv.map(m => `<div class="it" style="border-color:rgba(15,15,13,.18)"><span class="tx"><b>${m[0]}</b><span style="color:var(--texto)">${m[3]}</span></span><button class="qt n" style="background:var(--superficie)" data-folha="f-quantidade">${milhar(m[2])}</button></div>`).join('')}</div>
      <div class="acoes" style="margin-top:10px">${H.alt(ic.mais + ' Movimento', { cheio: 1, folha: 'f-catalogo' })}${H.alt('Série por série', { cheio: 1, ir: 'serie' })}</div>
      <div class="pe-a" style="margin-top:auto;padding-top:16px">${H.vai(ic.ok + ' Guardar a aula', { g: 1, ir: 'fim-treino--igual' })}</div><div class="saidas c">${H.saida('Guardar como modelo')}</div></div>`;
  } });

tela({ id: 'f-aula-texto', n: 'Colar o texto da aula', g: 'treino', c: 'folha', base: 'aula',
  d: 'O texto do grupo do box. O app lê e mostra a lista para conferir; o que não entendeu fica de fora, dito.',
  r: () => H.folha('Colar o texto da aula', 'Como veio do grupo. O app separa os movimentos e as quantidades, e você confere antes de guardar.', `<label class="campo"><span>Texto da aula</span><textarea>WOD 16/11 – HYROX sim
2 rounds:
1000m row
75 wall ball (9kg)
80m burpee broad jump
200m farmer carry 2x24</textarea></label><div class="acoes">${H.vai('Ler o texto ' + ic.seta, { ir: 'aula--lista' })}</div>`) });

tela({ id: 'f-catalogo', n: 'Catálogo de exercícios', g: 'treino', c: 'folha', base: 'editor',
  d: 'Buscar e adicionar; o que não existe se cria com nome, grupo e unidade. Usado no editor, no "Trocar por outro" e na aula.',
  es: [['busca', 'buscando'], ['vazio', 'nada com esse nome'], ['novo', 'criar um novo']],
  r: e => e === 'novo'
    ? H.folha('Novo exercício', 'Vale para todos os treinos. O nome dá para trocar depois sem perder histórico.', `${H.campo('Nome', 'text', 'Agachamento búlgaro com halteres')}<h3 class="h" style="margin-top:16px">Músculo principal</h3><div class="corpo">${H.fichas(['Quadríceps', 'Posterior', 'Glúteo', 'Peito', 'Costas', 'Ombro', 'Braços'], 0, 'Músculo').replace('class="fita-f"', 'class="fita-f" style="margin:0 calc(-1*var(--margem))"')}</div>
      <h3 class="h" style="margin-top:12px">Como se conta a carga</h3><div class="corpo">${H.seg(['kg', 'kg por lado', 'halter', 'corpo'], 'halter', 'Carga')}</div><div class="acoes">${H.vai('Criar e adicionar', { desfazer: 'Agachamento búlgaro entrou no treino B.' })}</div>`)
    : H.folha('Adicionar exercício', 'No treino B, depois de leg press.', `<label class="busca" style="margin-top:12px">${ic.lupa}<input value="${e === 'vazio' ? 'búlgaro' : 'agach'}" aria-label="Buscar exercício"><button class="ico" aria-label="Limpar">${ic.x}</button></label>
      ${e === 'vazio' ? H.vazio('Nada com “búlgaro”', 'Crie o exercício com o nome que você usa. O histórico começa nele.', H.vai(ic.mais + ' Criar “búlgaro”', { est: 'novo' })) : `<div class="lista" style="margin-top:8px">${[['Agachamento no Smith', 'quadríceps · no treino B'], ['Agachamento livre', 'quadríceps'], ['Agachamento sumô', 'adutores, glúteo'], ['Agachamento hack', 'quadríceps']].map(x => H.lin({ t: x[0], a: x[1], marca: 'mais', desfazer: x[0] + ' entrou no treino B.' })).join('')}</div><div class="acoes">${H.alt(ic.mais + ' Criar um novo', { cheio: 1, est: 'novo' })}</div>`}`) });

tela({ id: 'f-foto-aparelho', n: 'Foto do aparelho', g: 'treino', c: 'folha', base: 'exercicio',
  d: 'Para achar o mesmo aparelho na academia. Uma foto por exercício.', es: [['sem', 'sem foto'], ['com', 'com foto']],
  r: e => H.folha('O aparelho', 'Agachamento no Smith. Para achar o mesmo na academia.', e === 'com'
    ? `<div class="foto" style="margin-top:14px;aspect-ratio:4/3;background:linear-gradient(160deg,#CFC8B8,#E4DFD3)"><svg viewBox="0 0 120 90" style="inset:10%;width:80%;height:80%"><path d="M30 80V10M90 80V10M22 30h76M50 30v20h20V30" fill="none" stroke="#3A3934" stroke-width="5" stroke-linecap="round"/></svg></div><p class="txt">Tirada em 07/10, 06h22.</p><div class="acoes">${H.alt('Trocar a foto', { cheio: 1 })}${H.alt(ic.lixo, { desfazer: 'Foto do aparelho apagada.' })}</div>`
    : `${H.vazio('Sem foto ainda', 'Tire uma do aparelho como ele fica na sua academia, com a regulagem que você usa.', H.vai(ic.cam + ' Tirar a foto') )}`) });

/* ======================= DIAS ======================= */
const MES = { 1: 'A', 2: '·', 3: 'B', 4: 'D', 5: 'B', 6: 'E', 7: 'HX', 10: 'B', 11: 'C', 12: 'D', 13: 'A' };
const COM = { 1: 1, 3: 1, 4: 1, 5: 1, 6: 1, 7: 1, 10: 1, 11: 1, 12: 1 };
tela({ id: 'dias', n: 'Dias', g: 'dias', c: 'lugar', lugar: 'dias',
  d: 'O mês em grade: preto é treino (com a letra), o ponto é comida respondida, riscado é dia em branco. Embaixo, o dia escolhido, com a pergunta da comida.',
  es: [['treino', 'dia com treino'], ['branco', 'dia em branco'], ['hoje', 'hoje']], vai: ['dia-aberto', 'responder'],
  r: e => { const sel = e === 'branco' ? 9 : e === 'hoje' ? 16 : 13; let sem = '';
    for (let w = 0; w < 4; w++) { sem += '<div class="sem">'; for (let k = 1; k <= 7; k++) { const d = w * 7 + k, t = MES[d], fut = d > 16; sem += `<button class="dd ${t && t !== '·' ? 't' : ''} ${!t && !fut && d !== 16 && !COM[d] ? 'v' : ''} ${fut ? 'fut' : ''} ${d === 16 ? 'hoje' : ''} ${d === sel ? 'sel' : ''}" ${fut ? 'disabled' : `data-est="${d === 9 ? 'branco' : d === 16 ? 'hoje' : 'treino'}"`} aria-label="dia ${d}${t && t !== '·' ? ', treino ' + t : ''}${COM[d] ? ', comida respondida' : ''}"><small>${d}</small>${t && t !== '·' ? t : ''}${COM[d] ? '<i class="c"></i>' : ''}</button>`; } sem += '</div>'; }
    const t = MES[sel];
    return H.cab('Dias', 'novembro · 10 treinos em 16 dias', { lugar: 1 }) + `<section class="secao" style="padding-top:6px"><div class="sem" style="margin-bottom:6px">${['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(x => `<span>${x}</span>`).join('')}</div><div class="mes">${sem}</div>
      <div class="legm"><span><i style="background:var(--texto)"></i>treino</span><span><i style="background:var(--assunto-feito);box-shadow:inset 0 0 0 1px var(--texto)"></i>comida respondida</span><span><i style="background:repeating-linear-gradient(135deg,var(--superficie-quieta) 0 3px,transparent 3px 6px);box-shadow:inset 0 0 0 1px var(--contorno)"></i>em branco</span></div></section>
      ${H.secao({ 13: 'sexta, 13 de novembro', 9: 'segunda, 9 de novembro', 16: 'segunda, 16 · hoje' }[sel], '', `${H.quadros([{ v: t && t !== '·' ? 'Treino ' + t : '—', l: t && t !== '·' ? '20 séries · 58 min' : 'sem treino', ir: 'dia-aberto' }, { v: sel === 9 ? '—' : '77,4', l: 'peso' }, { v: sel === 13 ? '8 de 14' : '—', l: 'água' }], 3)}
        ${sel === 13 ? H.pergunta('Comida: foi como o plano', 'Conta para os 14 dias da regra. Toque para corrigir.', ['Foi, sim', 'Quase', 'Não lembro'], 'Foi, sim') : H.pergunta('A comida deste dia foi como o plano?', 'Sem resposta, o dia fica fora da conta. Não vira zero.', ['Foi, sim', 'Quase', 'Não lembro'])}
        <div class="acoes">${H.alt('Abrir o dia ' + ic.seta, { cheio: 1, ir: 'dia-aberto' })}</div>`)}
      ${H.secao('', '', `<div class="acoes" style="margin-top:0">${H.vai('Responder os dias em branco ' + ic.seta, { ir: 'responder' })}</div><p class="txt"><span class="n">9</span> de 14 respondidos. A regra do nutricionista precisa de 11.</p>`)}
      ${H.secao('No mês', '', H.quadros([{ v: '4,75', l: 'dias de treino por semana' }, { v: '06h15', l: 'horário mais comum' }, { v: '1', l: 'cardio no mês' }], 3))}`; } });

tela({ id: 'responder', n: 'Responder os dias', g: 'dias', c: 'acao', lugar: 'dias',
  d: 'Um dia por tela, do mais recente para trás. Um toque por dia; "voltar um" desfaz o último; "todos os que faltam" responde de uma vez.',
  es: [['meio', 'um dia'], ['fim', 'o fim']], vai: ['semana', 'dias'], v: 'Recolhe. As respostas já dadas ficam.',
  r: e => { const pts = Array.from({ length: 14 }, (_, i) => i < 5 ? (i === 2 ? 'a' : 'f') : i === 5 ? (e === 'fim' ? 'f' : 'v') : e === 'fim' ? (i === 9 ? 'n' : 'f') : '');
    const segs = `<div class="segs g" role="img" aria-label="${e === 'fim' ? 14 : 6} de 14">${pts.map(c => `<i class="${c === 'a' ? 'f' : c}" ${c === 'a' ? 'style="opacity:.55"' : ''}></i>`).join('')}</div>`;
    const topo = H.topoA(`<button class="ico" data-voltar aria-label="Fechar">${ic.x}</button>`, `<span class="n">${e === 'fim' ? '14' : '6'} de 14</span>`, e === 'fim' ? '' : '<button class="saida" style="min-width:44px">voltar um</button>');
    return e === 'fim'
      ? `<div class="acao-t" style="--cor:var(--assunto-feito)">${topo}${segs}<div class="meio-a c"><h2 class="heroi">13 dias respondidos.</h2><p class="apoio">Já dá para a regra do nutricionista decidir. O que ficou como “não lembro” não conta contra você.</p></div>
        <div class="pe-a" style="display:grid;gap:8px">${H.vai('Ver o veredito ' + ic.seta, { g: 1, lugar: 'semana' })}${H.alt('Voltar aos dias', { voltar: 1 })}</div><div class="saidas c"></div></div>`
      : `<div class="acao-t" style="--cor:var(--assunto-corpo)">${topo}${segs}<div class="meio-a c"><h2 class="heroi">quarta, 11</h2><p class="linha-a" style="margin-top:10px">Dia de Treino C, de manhã. A comida foi como o plano?</p></div>
        <div class="pe-a" style="display:grid;gap:8px">${H.vai('Foi, sim', { g: 1, est: 'fim' })}<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">${H.alt('Quase')}${H.alt('Não lembro')}</div></div><div class="saidas c">${H.saida('Todos os que faltam foram como o plano', { est: 'fim' })}</div></div>`; } });

tela({ id: 'dia-aberto', n: 'O dia aberto', g: 'dias', c: 'destino', lugar: 'dias',
  d: 'Tudo o que aconteceu num dia, para conferir e corrigir: o treino (que abre a sessão), o cardio, o peso, a comida refeição por refeição.',
  es: [['treino', 'dia de treino'], ['vazio', 'nenhum registro']], vai: ['sessao-passada', 'f-poe-dia', 'registrar-passado', 'f-cardio'],
  r: e => H.cab('sexta, 13 de novembro', 'registrado no dia') + (e === 'vazio'
    ? `<section class="secao" style="padding-top:4px">${H.vazio('Nenhum treino, nenhum descanso', 'Este dia ficou em branco. Ele fica fora das contas até você dizer o que foi.', H.vai('Pôr o dia em dia', { folha: 'f-poe-dia' }))}</section>`
    : H.secao('Treino', '', `<div class="lista">${H.lin({ o: 'A', oc: 'f', t: 'Treino A', a: '06h02 às 07h00 · 20 séries · 58 min', ir: 'sessao-passada' })}${H.lin({ o: ic.bike, t: 'Cardio: bike', a: '25 min, leve · 18h10', folha: 'f-cardio' })}</div>`)
    + H.secao('Corpo', '', `<div class="lista">${H.lin({ t: 'Peso', a: 'de manhã', val: '77,6', un: 'kg', folha: 'f-corrige-pesagem' })}</div>`)
    + H.secao('A comida do dia', 'foi como o plano', `<div class="lista">${D.REF.map((r, i) => H.lin({ t: r.n, a: r.h + ' · ' + (i === 3 ? 'outra coisa, parecido' : 'como o plano'), val: i === 3 ? H.selo('fora', 'a') : H.selo('ok', '', ic.ok), folha: 'f-refeicao' })).join('')}</div>`)
    + H.secao('', '', `<div class="acoes" style="margin-top:0">${H.alt('Pôr o dia em dia', { cheio: 1, folha: 'f-poe-dia' })}</div>`)) });

tela({ id: 'f-poe-dia', n: 'Pôr o dia em dia', g: 'dias', c: 'folha', base: 'dia-aberto',
  d: 'Para o dia que ficou em branco: o que foi, de uma vez.', vai: ['registrar-passado', 'f-cardio'],
  r: () => H.folha('Pôr o dia em dia', 'Segunda, 9 de novembro. O que entrar aqui fica marcado como registrado depois.', `<div class="lista" style="margin-top:10px">${H.op(ic.halter, 'Treinei neste dia', 'marca os exercícios feitos, como da última vez', { ir: 'registrar-passado', dir: 1 })}${H.op(ic.ok, 'Foi descanso', 'marca o dia como descanso', { desfazer: '09/11 marcado como descanso.' })}${H.op(ic.bike, 'Fiz cardio', 'bike, esteira, outro', { folha: 'f-cardio', dir: 1 })}</div>
    <h3 class="h" style="margin-top:16px">A comida</h3>${H.resp(['Foi, sim', 'Quase', 'Não lembro'], null, { fundo: 1, nome: 'A comida' })}`) });

tela({ id: 'sessao-passada', n: 'Sessão passada', g: 'dias', c: 'destino', lugar: 'dias',
  d: 'Lacuna conhecida. Começo e fim corrigíveis; cada série corrigível na folha da série. "Registrado depois" e "não feita" aparecem marcados. Apagar a sessão pede confirmação.',
  es: [['normal', 'a sessão'], ['falha', 'uma série não foi guardada']], vai: ['f-serie-passada', 'f-confirma'],
  r: e => H.cab('Treino A', 'sexta, 13/11') + `<section class="secao" style="padding-top:4px">${H.quadros([{ v: '06h02', l: 'começo', folha: 'f-hora' }, { v: '07h00', l: 'fim', folha: 'f-hora' }, { v: '58 min', l: 'duração' }], 3)}</section>
    ${e === 'falha' ? `<section class="secao" style="padding-top:12px">${H.caixa('a', 'Remada curvada, série 3 não foi guardada.', 'Ao corrigir, o aparelho recusou. O número continua na folha da série.', H.peq('Tentar de novo', { f: 1, folha: 'f-serie-passada--falhou' }))}</section>` : ''}
    ${H.secao('As séries', 'toque numa para corrigir', `${[['Supino inclinado com halteres', [['30', 10], ['30', 9], ['30', 8, 'dp']]], ['Puxada aberta', [['65', 12], ['65', 11], ['65', 10]]], ['Remada curvada', [['50', 10], ['50', 9], ['—', 0, 'nf']]], ['Elevação lateral', [['10', 15], ['10', 14], ['10', 13], ['10', 12]]]].map(x => `<div class="grupo-t"><span>${x[0]}</span></div><div class="feitas" style="margin-top:6px">${x[1].map((s, k) => `<button class="${s[2] === 'nf' ? '' : s[2] === 'dp' ? 'dp' : 'f'} n" data-folha="f-serie-passada${s[2] === 'nf' ? '--naofeita' : ''}" style="min-height:44px;padding:0 12px;border-radius:99px;display:flex;align-items:center;gap:6px;font:700 14px var(--f-titulo);${s[2] === 'nf' ? 'box-shadow:inset 0 0 0 1.5px var(--contorno)' : s[2] === 'dp' ? 'background:var(--superficie-quieta)' : 'background:var(--acao);color:var(--assunto-treino)'}" aria-label="série ${k + 1}${s[2] === 'nf' ? ', não feita' : s[2] === 'dp' ? ', registrada depois' : ''}">${s[2] === 'nf' ? 'não feita' : s[0] + ' × ' + s[1]}</button>`).join('')}</div>`).join('')}
      <div class="legm" style="margin-top:12px"><span><i style="background:var(--acao)"></i>feita</span><span><i style="background:var(--superficie-quieta)"></i>registrada depois</span><span><i style="box-shadow:inset 0 0 0 1.5px var(--contorno)"></i>não feita</span></div>`)}
    ${H.secao('', '', `<div class="lista">${H.lin({ t: 'A mudança do dia', a: 'trocou crucifixo por peck deck · ficou só hoje', marca: 'nada', tag: 'div' })}</div><div class="acoes">${H.alt(ic.lixo + ' Apagar esta sessão', { cheio: 1, folha: 'f-confirma' })}</div>`)}` });

tela({ id: 'f-serie-passada', n: 'Uma série passada', g: 'dias', c: 'folha', base: 'sessao-passada',
  d: 'As mesmas réguas da série de hoje, com o RIR, "não foi feita" e apagar. Se falhar ao guardar, o número fica na folha e o botão vira "Tentar de novo".',
  es: [['normal', 'corrigir'], ['naofeita', 'não feita'], ['falhou', 'falhou ao guardar']],
  r: e => H.folha('Remada curvada · série 3', 'sexta, 13/11. Corrigir aqui não muda o programa.', e === 'naofeita'
    ? `${H.vazio('Esta série não foi feita', 'Fica no histórico assim, e não conta para a progressão.', H.vai('Foi feita: pôr os números', { est: 'normal' }))}`
    : `<div class="par" style="margin-top:8px"><button data-par aria-pressed="false"><span class="rt">kg</span><span class="gr n">50</span></button><span class="x">×</span><button data-par aria-pressed="true"><span class="rt">repetições</span><span class="gr n" id="sp-r">8</span></button></div>
      ${regua({ mn: 1, mx: 30, st: 1, v: 8, cada: 5, px: 30, nome: 'Repetições', un: 'repetições', alvo: '#sp-r', passos: false })}
      <p class="txt" style="margin-top:8px">Sobraram quantas? <span style="color:var(--texto-legenda)">(RIR: repetições que sobraram)</span></p>${H.resp(['0', '1', '2', '3+', 'não sei'], '1', { fundo: 1, nome: 'Repetições que sobraram' })}
      ${e === 'falhou' ? H.caixa('a', 'Não guardei.', 'O aparelho recusou a gravação. Os números continuam aqui.') : ''}
      <div class="acoes">${H.vai(e === 'falhou' ? 'Tentar de novo' : ic.ok + ' Guardar', { desfazer: 'Série 3 corrigida: 50 × 8.' })}</div>
      <div class="saidas e">${H.saida('Não foi feita', { est: 'naofeita' })}${H.saida('Apagar esta série', { desfazer: 'Série 3 apagada.' })}</div>`) });

tela({ id: 'f-hora', n: 'Corrigir a hora', g: 'dias', c: 'folha', base: 'sessao-passada',
  d: 'O seletor de hora é uma régua de cinco em cinco minutos. "Agora" é um atalho.',
  r: () => H.folha('Fim do treino', 'sexta, 13/11. Começou às 06h02.', `<div class="gigante p n" style="margin-top:16px"><span id="hr-v">07h00</span></div>${regua({ mn: 6, mx: 9, st: 1 / 12, v: 7, cada: 1, px: 14, nome: 'Hora', un: '', passos: true })}<p class="ref">duração: 58 min</p><div class="acoes">${H.vai(ic.ok + ' Guardar', { desfazer: 'Fim do treino: 07h00.' })}</div>`) });

tela({ id: 'registrar-passado', n: 'Registrar treino passado', g: 'dias', c: 'destino', lugar: 'hoje',
  d: '"Já treinei e não anotei". Primeiro qual treino foi e quando (régua de dias), depois "Pôr em dia" com os exercícios. "Fora da prescrição" registra um treino livre.',
  es: [['qual', 'qual treino'], ['fora', 'fora da prescrição']], vai: ['por-em-dia--depois'],
  r: e => H.cab('Treino que não anotei', '') + `<section class="secao" style="padding-top:4px"><h2 class="h">Quando</h2><div class="corpo"><div class="dias-f" role="radiogroup" aria-label="Dia">${[['ter', 10], ['qua', 11], ['qui', 12], ['sex', 13], ['sáb', 14], ['dom', 15], ['seg', 16]].map((d, i) => `<button role="radio" data-radio aria-checked="${i === 6}">${d[0]}<b>${d[1]}</b></button>`).join('')}</div></div></section>
    ${e === 'fora' ? H.secao('O que foi', '', `${H.campo('Nome', 'text', 'Corrida na praia')}<div class="corpo" style="margin-top:12px">${H.seg(['Força', 'Cardio', 'Outro'], 'Cardio', 'Tipo')}</div><div class="acoes">${H.vai('Guardar', { desfazer: 'Treino livre guardado.' })}</div>`)
      : H.secao('Que treino foi', 'pela rotação, hoje era o B', `<div role="radiogroup" aria-label="Treino">${D.TR.map(t => H.esc('', `<b class="n" style="font:800 20px var(--f-titulo)">${t[0]}</b>`, 'Treino ' + t[0], t[1] + ' · ' + t[2] + ' séries', t[0] === 'B')).join('')}${H.esc('', ic.mais, 'Fora da prescrição', 'um treino livre, que não é do programa', false).replace('data-radio', 'data-radio data-est="fora"')}</div>
        <div class="acoes">${H.vai('Marcar os exercícios ' + ic.seta, { ir: 'por-em-dia--depois' })}</div>`)}` });

tela({ id: 'f-confirma', n: 'Confirmação', g: 'geral', c: 'folha', base: 'sessao-passada',
  d: 'Só para o que não tem volta. O caminho seguro é o principal; o destrutivo é o contorno, com o verbo. Voltar, Esc e o véu respondem o seguro.',
  es: [['apagar', 'apagar sessão'], ['descartar', 'descartar o treino de hoje'], ['restaurar', 'restaurar cópia'], ['comeco', 'voltar ao começo']],
  r: e => { const c = { apagar: ['Apagar esta sessão?', 'As 15 séries do treino A de 13/11 saem do histórico, e a progressão passa a olhar a sessão anterior. Não apaga o programa.', 'Apagar'], descartar: ['Descartar o treino de hoje?', 'As 8 séries de hoje saem. O que foi feito em outros dias fica.', 'Descartar'], restaurar: ['Restaurar a cópia de 29/10?', 'O que está neste aparelho é substituído pelo que está no arquivo. Antes de trocar, o app guarda uma cópia do estado atual.', 'Restaurar'], comeco: ['Voltar ao começo?', 'Isto não tem volta, e não apaga o programa nem o plano: só o que você registrou neste aparelho e na conta.', 'Apagar tudo'] }[e];
    return H.folha(c[0], c[1], `<div class="acoes">${H.vai('Manter', { fecha: 1 })}${H.alt(c[2], { fecha: 1 })}</div>`); } });
