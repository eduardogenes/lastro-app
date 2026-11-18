/* As telas, parte 2: Corpo, Fotos, Semana, Plano, Ajustes, primeira vez e o
   que vale para o app inteiro. */

/* ======================= CORPO ======================= */
const MED = [['cintura', 'Cintura', 86.0, '+1,5 cm desde 01/10', 'Na altura do umbigo', 'Fita paralela ao chão, barriga relaxada. Meça no fim de uma expiração normal.', 138], ['braco', 'Braço direito', null, 'ainda sem medida', 'No meio do braço, relaxado', 'Braço solto ao lado do corpo. A fita no ponto médio entre o ombro e o cotovelo.', 100]];
const boneco = y => `<svg viewBox="0 0 120 300" aria-hidden="true">${gente({ v: 'frente', b: 'A' }, 8).replace(/^<svg[^>]*>|<\/svg>$/g, '')}<path d="M32 ${y}L88 ${y}" stroke="#D2F23A" stroke-width="9" stroke-linecap="round"/><path d="M32 ${y}L88 ${y}" stroke="#0F0F0D" stroke-width="2" stroke-linecap="round" stroke-dasharray="2 5"/></svg>`;
tela({ id: 'corpo', n: 'Corpo', g: 'corpo', c: 'lugar', lugar: 'corpo',
  d: 'O peso de hoje se arrasta na régua, no próprio bloco lilás. Embaixo, a evolução em quadros, as medidas ligadas, a bioimpedância e a entrada das fotos.',
  es: [['pesar', 'ainda não pesou hoje'], ['pesado', 'pesou hoje'], ['vazio', 'conta sem dado']], vai: ['peso', 'medida', 'bio', 'mesma-data', 'medir', 'f-ligar-medidas', 'fotos'],
  r: e => e === 'vazio'
    ? H.momento({ cor: 'assunto-corpo', anima: false, linha0: '<span>Corpo</span><span>nenhuma pesagem</span>', meio: `<div class="gigante n" style="margin-top:8px"><span id="pz">75,0</span><small>kg</small></div><div style="height:8px"></div>${regua({ mn: 40, mx: 160, st: .1, v: 75, cada: 1, px: 12, nome: 'Peso', un: 'kg', dec: 1, alvo: '#pz', passos: false })}`, acoes: `<button class="vai espera" data-guarda="Guardar # kg">Arraste a régua para pesar hoje</button>` })
      + H.secao('', '', H.vazio('Uma pesagem não faz linha.', 'Com duas aparece a diferença; com uma semana, a média. Não precisa pesar todo dia.'))
      + H.secao('Também dá para acompanhar', 'só o que você ligar', `<div class="lista">${H.lin({ t: 'Medidas com fita', a: 'desligado · toque para ligar', off: 1, marca: 'mais', folha: 'f-ligar-medidas' })}${H.lin({ t: 'Bioimpedância', a: 'uma leitura por mês', marca: 'mais', ir: 'bio-nova' })}${H.lin({ t: 'Fotos do corpo', a: 'a cada 14 dias, no mesmo padrão', marca: 'mais', ir: 'fotos--primeira' })}</div>`)
    : H.momento({ cor: 'assunto-corpo', anima: false, linha0: `<span>Corpo</span><span>${e === 'pesado' ? 'pesado hoje, 06h48' : 'última: sexta, 13/11'}</span>`, meio: `<div class="gigante n" style="margin-top:8px"><span id="pg">77,6</span><small>kg</small></div><div style="height:8px"></div>${regua({ mn: 60, mx: 100, st: .1, v: 77.6, cada: 1, px: 12, nome: 'Peso de hoje', un: 'kg', dec: 1, alvo: '#pg', passos: false })}`,
        acoes: e === 'pesado' ? `<button class="vai" data-desfazer="Pesagem de hoje desfeita.">${ic.ok} Guardado hoje</button>` : `<button class="vai espera" data-guarda="Guardar # kg">Arraste a régua para pesar hoje</button>` })
      + H.secao('Evolução', '8 semanas', H.quadros([{ v: '+3,3', u: 'kg', l: 'peso', sp: mini(D.SEM), ir: 'peso' }, { v: '+1,5', u: 'cm', l: 'cintura', sp: mini([84.5, 86]), ir: 'medida' }, { v: '12,5', u: '%', l: 'gordura · +1,5', sp: mini([11, 12.5]), ir: 'bio' }, { v: '38,7', u: 'kg', l: 'músculo · +0,6', sp: mini([38.1, 38.7]), ir: 'bio' }]) + `<div class="acoes" style="margin-top:10px">${H.vai('Ver tudo na mesma data ' + ic.seta, { ir: 'mesma-data' })}</div>`)
      + H.secao('Medidas', 'fita · última em 29/10', `<div class="lista">${MED.map(m => H.lin({ t: m[1], a: m[3], val: m[2] ? f1(m[2]) : '—', un: 'cm', ir: 'medida' + (m[2] ? '' : '--sem') })).join('')}${H.lin({ t: 'Mais 6 medidas', a: 'coxa, panturrilha, peito, quadril e dobras · desligadas', off: 1, marca: 'mais', folha: 'f-ligar-medidas' })}</div>
        <div class="acoes" style="margin-top:8px">${H.alt('Medir agora · 2 medidas', { cheio: 1, ir: 'medir' })}</div>`)
      + H.secao('Bioimpedância', '06/11 · uma vez por mês', `<div class="lista">${H.lin({ t: '12,5 % de gordura', a: '38,7 kg de músculo · 49,3 L de água', ir: 'bio' })}</div>`)
      + H.secao('Fotos', '12/11 · próxima em 10 dias', `<button class="fita-fotos" data-ir="fotos" style="width:100%" aria-label="Abrir as fotos do corpo">${[0, 2, 5, 8, 10].map(i => foto(D.POSES[0], i)).join('')}</button>`) });

tela({ id: 'f-ligar-medidas', n: 'O que medir', g: 'corpo', c: 'folha', base: 'corpo',
  r: () => H.folha('O que medir', 'Ligue só o que for acompanhar. Desligar não apaga o que já foi medido.', `<div class="lista" style="margin-top:12px">${[['Cintura', 'na altura do umbigo', 1], ['Braço direito', 'no meio do braço, relaxado', 1], ['Coxa direita', 'no meio da coxa', 0], ['Panturrilha direita', 'na parte mais larga', 0], ['Peito', 'na linha dos mamilos', 0], ['Quadril', 'na parte mais larga', 0], ['Dobras com adipômetro', 'abdominal e suprailíaca, em milímetros', 0]].map(x => H.chave(x[0], x[1], x[2])).join('')}</div>`) });

tela({ id: 'medir', n: 'Medir agora', g: 'corpo', c: 'acao', lugar: 'corpo',
  d: 'Uma medida por tela, com o desenho de onde passar a fita. A segunda leitura é sempre pedida; se diferirem mais de 0,5, uma terceira decide. "Guardar só esta" existe e marca a medida.',
  es: [['primeira', '1ª leitura'], ['segunda', 'pedindo a 2ª'], ['terceira', 'as duas diferem'], ['dobra', 'dobra com adipômetro'], ['fim', 'medidas guardadas']], vai: ['f-como-medir', 'corpo'], v: 'Recolhe. As leituras guardadas ficam.',
  r: e => {
    if (e === 'fim') return `<div class="acao-t" style="--cor:var(--assunto-feito)">${H.topoA(`<button class="ico" data-voltar aria-label="Fechar">${ic.x}</button>`, 'medidas de hoje')}<div style="padding-top:12px"><p class="linha-a">guardadas · 16/11, 21h14</p><h2 class="heroi m">2 medidas, com a hora de agora</h2></div>
      <div class="lista" style="margin-top:14px">${H.lin({ tag: 'div', t: 'Cintura', a: '+0,3 cm desde a última · média de 2 leituras', val: '86,3', un: 'cm', marca: 'nada' })}${H.lin({ tag: 'div', t: 'Braço direito', a: 'primeira medida · ' + H.selo('uma leitura só', 'a'), val: '35,4', un: 'cm', marca: 'nada' })}</div>
      <div class="pe-a" style="margin-top:auto">${H.vai('Fechar', { g: 1, voltar: 1 })}</div><div class="saidas c">${H.saida('Ver no Corpo', { voltar: 1 })}</div></div>`;
    const dob = e === 'dobra', leit = { primeira: [], segunda: ['86,2'], terceira: ['86,2', '86,9'], dobra: [] }[e];
    return `<div class="acao-t" style="--cor:var(--${dob ? 'assunto-semana' : 'assunto-corpo'})">${H.topoA(`<button class="ico" data-voltar aria-label="Sair">${ic.x}</button>`, `${dob ? 'adipômetro' : 'fita'} · <span class="n">${dob ? '3 de 4' : '1 de 2'}</span>`)}${H.segs(dob ? 4 : 2, dob ? 2 : 0, dob ? 2 : 0)}
      <div class="onde"><div class="bon">${boneco(dob ? 142 : 138)}</div><p><b>${dob ? 'Dois dedos ao lado do umbigo' : 'Na altura do umbigo'}</b>${dob ? 'Pinça vertical. Leia dois segundos depois de soltar o adipômetro.' : 'Fita paralela ao chão, barriga relaxada, no fim de uma expiração normal.'}</p></div>
      <div class="meio-a"><h2 class="nome-a">${dob ? 'Dobra abdominal' : 'Cintura'}</h2><div class="gigante n" style="margin:10px 0 12px"><span id="md-v">${dob ? '14,0' : e === 'terceira' ? '86,5' : '86,0'}</span><small>${dob ? 'mm' : 'cm'}</small></div>
        ${dob ? regua({ mn: 2, mx: 60, st: .5, v: 14, cada: 5, px: 14, nome: 'Dobra', un: 'mm', dec: 1, alvo: '#md-v' }) : regua({ mn: 60, mx: 130, st: .1, v: e === 'terceira' ? 86.5 : 86, cada: 1, px: 12, nome: 'Cintura', un: 'cm', dec: 1, alvo: '#md-v' })}
        <p class="ref">${{ primeira: 'da última vez: 86,0 cm', segunda: 'Primeira guardada. Tire a fita, passe de novo e guarde a segunda.', terceira: 'As duas diferem 0,7 cm. Meça mais uma: fica a média das três.', dobra: 'da última vez: 13,5 mm' }[e]}</p>
        <div class="leit">${leit.map((l, j) => `<span class="n">${j + 1}ª · ${l}</span>`).join('')}</div></div>
      <div class="pe-a">${H.vai(ic.ok + ' ' + ({ primeira: 'Guardar a 1ª', segunda: 'Guardar a 2ª', terceira: 'Guardar a 3ª', dobra: 'Guardar a 1ª' }[e]), { g: 1, est: { primeira: 'segunda', segunda: 'fim', terceira: 'fim', dobra: 'fim' }[e] })}</div>
      <div class="saidas e">${e === 'segunda' ? H.saida('Guardar só esta', { est: 'fim' }) : H.saida('Pular esta', { est: 'fim' })}${H.saida('Ver como medir', { folha: 'f-como-medir' })}</div></div>`;
  } });

tela({ id: 'f-como-medir', n: 'Como medir', g: 'corpo', c: 'folha', base: 'medir',
  r: () => H.folha('Cintura', '<b>Na altura do umbigo.</b> Fita paralela ao chão, barriga relaxada, no fim de uma expiração normal.', `<p class="fs">Fita justa na pele, sem apertar e sem folga. Sempre do lado direito, sempre no mesmo horário. Meça duas vezes; se diferirem mais de 0,5 cm, uma terceira decide.</p><div class="acoes">${H.vai('Entendi', { fecha: 1 })}</div>`) });

tela({ id: 'peso', n: 'Peso', g: 'corpo', c: 'destino', lugar: 'corpo',
  d: 'A média da semana em linha, as pesagens do dia em pontos e a faixa do alvo. A taxa por semana embaixo, com o selo de acima ou abaixo do alvo. Cada pesagem se corrige.',
  es: [['tudo', 'tudo'], ['4', '4 semanas']], vai: ['f-corrige-pesagem', 'semana'],
  r: e => H.cab('Peso', '43 pesagens') + `<section class="secao" style="padding-top:4px"><div class="gigante p n">77,6<small>kg · +3,3 em 8 semanas</small></div>
    <div class="corpo" style="margin-top:12px">${H.seg(['4 semanas', 'Tudo'], e === '4' ? '4 semanas' : 'Tudo', 'Período').replace(/data-radio aria-checked="(true|false)">4 semanas/, 'data-radio data-est="4" aria-checked="$1">4 semanas').replace(/data-radio aria-checked="(true|false)">Tudo/, 'data-radio data-est="tudo" aria-checked="$1">Tudo')}</div>
    <div style="margin-top:10px">${linha(D.SEMPTS, { x0: e === '4' ? 29 : 0, pontos: D.PESAGENS, banda: e === '4' ? null : [0, 74.3], h: 150, bolas: true, rotulos: e === '4' ? ['19/10', '16/11'] : ['20/09', '16/11'], rotulo: 'Média semanal do peso, de 74,3 para 77,6 kg em 8 semanas' })}</div>
    <div class="leg"><span><i style="background:var(--texto)"></i>média da semana</span><span><i style="background:rgba(15,15,13,.3)"></i>pesagem do dia</span>${e === '4' ? '' : '<span><i style="background:#D3C6FF"></i>alvo: +0,15 a +0,30 por semana</span>'}</div></section>
    ${H.secao('Por semana', 'kg em relação à anterior', `${[['08/11 a 14/11', 4, '+0,08', 'abaixo', 'q'], ['01/11 a 07/11', 4, '−0,37', 'abaixo', 'q'], ['25/10 a 31/10', 3, '−0,03', 'abaixo', 'q'], ['18/10 a 24/10', 4, '+0,90', 'acima', 'a']].map(t => `<div class="taxa"><span class="tx">${t[0]}<small>${t[1]} pesagens</small></span><b class="n">${t[2]}</b>${H.selo(t[3] + ' do alvo', t[4])}</div>`).join('')}
      <p class="txt">Duas semanas seguidas abaixo de +0,10 é o que a regra do nutricionista olha. O que fazer com isso está em Semana.</p>`)}
    ${H.secao('Pesagens', 'toque para corrigir', `<div class="lista">${D.PESAGENS.slice(-4).reverse().map(p => H.lin({ cls: 'hist', t: dataDe(p[0]), a: 'de manhã', val: f1(p[1]), un: 'kg', folha: 'f-corrige-pesagem' })).join('')}</div><div class="saidas">${H.saida('ver as 43')}</div>`)}` });

tela({ id: 'f-corrige-pesagem', n: 'Corrigir uma pesagem', g: 'corpo', c: 'folha', base: 'peso',
  d: 'Lacuna conhecida. A mesma régua, a data e a hora; apagar manda o aviso com desfazer, porque é reversível.',
  r: () => H.folha('Pesagem de 13/11', 'sexta, de manhã, 06h51. A média da semana se refaz sozinha.', `<div class="gigante n" style="margin-top:16px"><span id="cp">77,6</span><small>kg</small></div>${regua({ mn: 60, mx: 100, st: .1, v: 77.6, cada: 1, px: 12, nome: 'Peso', un: 'kg', dec: 1, alvo: '#cp' })}
    <div class="acoes">${H.vai(ic.ok + ' Guardar', { desfazer: 'Pesagem de 13/11 corrigida.' })}</div><div class="saidas">${H.saida('Apagar esta pesagem', { desfazer: 'Pesagem de 13/11 apagada.' })}</div>`) });

tela({ id: 'medida', n: 'Uma medida', g: 'corpo', c: 'destino', lugar: 'corpo',
  d: 'A linha da medida com as sessões de fotos marcadas embaixo, como medir e o histórico, que se corrige ou apaga.',
  es: [['com', 'com histórico'], ['sem', 'ainda sem medida']], vai: ['medir', 'f-corrige-medida'],
  r: e => H.cab(e === 'sem' ? 'Braço direito' : 'Cintura', e === 'sem' ? 'no meio do braço' : 'na altura do umbigo') + `<section class="secao" style="padding-top:4px">
    ${e === 'sem' ? `<h2 class="heroi m" style="margin-top:4px">Ainda sem medida</h2><p class="txt">Com duas medidas aparece a linha; com três, a tendência.</p>`
      : `<div class="gigante p n">86,0<small>cm · +1,5 desde 01/10</small></div>${linha([[11, 84.5], [25, 85.1], [39, 86.0]], { bolas: true, marcas: [0, 11, 25, 39, 53], h: 110, folga: 1, x0: 0, x1: 57, rotulos: ['20/09', '16/11'], rotulo: 'Cintura, de 84,5 para 86,0 cm' })}<div class="leg"><span><i style="background:var(--texto);width:3px;height:10px"></i>sessão de fotos</span></div>`}
    <div class="acoes">${H.vai('Medir agora ' + ic.seta, { ir: 'medir' })}</div></section>
    ${H.secao('Como medir', '', `<div class="onde" style="margin-top:0"><div class="bon">${boneco(e === 'sem' ? 100 : 138)}</div><p><b>${e === 'sem' ? 'No meio do braço, relaxado' : 'Na altura do umbigo'}</b>${e === 'sem' ? 'Braço solto ao lado do corpo, a fita no ponto médio entre o ombro e o cotovelo.' : 'Fita paralela ao chão, barriga relaxada.'} Meça duas vezes; se diferirem mais de 0,5 cm, uma terceira decide.</p></div>`)}
    ${e === 'sem' ? '' : H.secao('Histórico', 'toque para corrigir ou apagar', `<div class="lista">${[['29/10', '86,0', 'média de 2'], ['15/10', '85,1', 'uma leitura só'], ['01/10', '84,5', 'média de 3']].map(h => H.lin({ cls: 'hist', t: h[0], a: 'à noite · ' + h[2], val: h[1], un: 'cm', folha: 'f-corrige-medida' })).join('')}</div>`)}` });

tela({ id: 'f-corrige-medida', n: 'Corrigir ou apagar medida', g: 'corpo', c: 'folha', base: 'medida',
  d: 'Lacuna conhecida. Igual à pesagem, com as leituras que deram a média à vista.',
  r: () => H.folha('Cintura, 15/10', 'Uma leitura só, às 21h10. Corrigir troca o valor; as fotos do mesmo dia não mudam.', `<div class="gigante n" style="margin-top:16px"><span id="cm">85,1</span><small>cm</small></div>${regua({ mn: 60, mx: 130, st: .1, v: 85.1, cada: 1, px: 12, nome: 'Cintura', un: 'cm', dec: 1, alvo: '#cm' })}
    <div class="acoes">${H.vai(ic.ok + ' Guardar', { desfazer: 'Cintura de 15/10 corrigida.' })}</div><div class="saidas">${H.saida('Apagar esta medida', { desfazer: 'Cintura de 15/10 apagada.' })}</div>`) });

tela({ id: 'bio', n: 'Bioimpedância', g: 'corpo', c: 'destino', lugar: 'corpo',
  d: 'Quatro quadros; a massa de gordura não se digita, sai do peso e do percentual. As leituras se corrigem como a medida.', vai: ['bio-nova', 'f-corrige-medida'],
  r: () => H.cab('Bioimpedância', '2 leituras') + `<section class="secao" style="padding-top:4px">${H.quadros([{ v: '12,5 %', l: 'gordura · +1,5', sp: mini([11, 12.5]) }, { v: '38,7 kg', l: 'músculo · +0,6', sp: mini([38.1, 38.7]) }, { v: '9,6 kg', l: 'massa de gordura · +1,3', sp: mini([8.3, 9.6]) }, { v: '49,3 L', l: 'água · +0,1', sp: mini([49.2, 49.3]) }])}
    <p class="txt">Leituras de 06/10 e 06/11. A massa de gordura não é digitada: sai do peso e do percentual.</p><div class="acoes">${H.vai('Nova leitura ' + ic.seta, { ir: 'bio-nova' })}</div><p class="txt">Uma vez por mês, na mesma balança e no mesmo horário. A próxima cai perto de 06/12.</p></section>
    ${H.secao('Leituras', '', `<div class="lista">${H.lin({ cls: 'hist', t: '06/11', a: '38,7 kg de músculo · 49,3 L', val: '12,5', un: '%', folha: 'f-corrige-medida' })}${H.lin({ cls: 'hist', t: '06/10', a: '38,1 kg de músculo · 49,2 L', val: '11,0', un: '%', folha: 'f-corrige-medida' })}</div>`)}` });

tela({ id: 'bio-nova', n: 'Nova leitura de bioimpedância', g: 'corpo', c: 'acao', lugar: 'corpo',
  d: 'Lacuna conhecida. O mesmo fluxo de "Medir agora": um número por tela, na régua, partindo da leitura anterior. O peso da leitura o app preenche.',
  es: [['gordura', 'gordura'], ['musculo', 'músculo'], ['agua', 'água']], vai: ['bio'],
  r: e => { const i = ['gordura', 'musculo', 'agua'].indexOf(e), c = [['Gordura', '%', 12.5, 3, 40, 'da última vez: 12,5 %'], ['Músculo', 'kg', 38.7, 20, 60, 'da última vez: 38,7 kg'], ['Água', 'L', 49.3, 30, 70, 'da última vez: 49,3 L']][i];
    return `<div class="acao-t" style="--cor:var(--assunto-corpo)">${H.topoA(`<button class="ico" data-voltar aria-label="Sair">${ic.x}</button>`, `balança · <span class="n">${i + 1} de 3</span>`)}${H.segs(3, i, i)}
      <p class="dica">Peso desta leitura: <b class="n">77,6 kg</b>, o de hoje de manhã. A massa de gordura sai sozinha.</p>
      <div class="meio-a"><h2 class="nome-a">${c[0]}</h2><div class="gigante n" style="margin:10px 0 12px"><span id="bn">${f1(c[2])}</span><small>${c[1]}</small></div>${regua({ mn: c[3], mx: c[4], st: .1, v: c[2], cada: 1, px: 12, nome: c[0], un: c[1], dec: 1, alvo: '#bn' })}<p class="ref">${c[5]}</p></div>
      <div class="pe-a">${H.vai(i < 2 ? 'Próxima ' + ic.seta : ic.ok + ' Guardar a leitura', { g: 1, est: i < 2 ? ['musculo', 'agua'][i] : null, voltar: i === 2 ? 1 : null })}</div><div class="saidas e">${H.saida('Pular este número', { est: i < 2 ? ['musculo', 'agua'][i] : 'agua' })}<span></span></div></div>`; } });

tela({ id: 'mesma-data', n: 'Tudo na mesma data', g: 'corpo', c: 'destino', lugar: 'corpo',
  d: 'Arraste o cursor no tempo: peso, cintura, gordura, músculo e a foto mudam juntos. Cada número é a leitura mais recente até aquela data, com a data dela.',
  r: () => H.cab('Tudo na mesma data', '') + `<section class="secao" style="padding-top:2px"><div id="md-g">${linha(D.SEMPTS, { pontos: D.PESAGENS, marcas: [0, 11, 25, 39, 53], cur: 39, curY: D.pesoEm(39), h: 130, x0: 0, x1: 56, rotulo: 'Peso ao longo do tempo, com o cursor em 29/10' })}</div>
    <input type="range" min="0" max="56" value="39" id="md-cur" aria-label="Data" aria-valuetext="29/10">
    <div class="cursor"><div>${foto(D.POSES[0], 7)}<p style="font:600 12px var(--f-texto);color:var(--texto-legenda);text-align:center;margin-top:4px" class="n">fotos de 29/10</p></div>
      <div><p class="n" style="font:800 30px/1 var(--f-titulo);letter-spacing:-.03em;margin-bottom:8px" id="md-d">29/10</p>${H.quadros([{ v: f1(D.pesoEm(39)) + ' kg', l: 'peso · +3,6' }, { v: '86,0 cm', l: 'cintura · 29/10' }, { v: '11,0 %', l: 'gordura · 06/10' }, { v: '38,1 kg', l: 'músculo · 06/10' }])}</div></div>
    <p class="txt">Arraste para andar no tempo. Os traços embaixo do gráfico são as sessões de fotos.</p></section>` });

/* ======================= FOTOS ======================= */
const PO = D.POSES;
tela({ id: 'fotos', n: 'Centro das fotos', g: 'fotos', c: 'destino', lugar: 'corpo',
  d: 'A próxima sessão, a última, e as três consultas. Entra pelo Corpo e pelo lembrete do Hoje.',
  es: [['normal', 'com sessões'], ['primeira', 'nenhuma sessão ainda'], ['metade', 'sessão pela metade']], vai: ['nova-sessao', 'comparar', 'no-tempo', 'galeria', 'sessao-metade'],
  r: e => H.momento({ cor: 'assunto-corpo', anima: false, linha0: `<button data-voltar>${ic.volta} Corpo</button><span>fotos do corpo</span>`,
      quando: e === 'primeira' ? 'a cada 14 dias' : e === 'metade' ? 'começada hoje, 21h04' : 'a cada 14 dias · a última foi há 4', titulo: e === 'primeira' ? 'A primeira sessão' : e === 'metade' ? '6 de 11 fotos' : 'Próxima em 10 dias', grande: 1,
      apoio: e === 'primeira' ? '11 fotos, uns 4 minutos, com alguém segurando o celular. O app guia o enquadramento para todas saírem iguais.' : e === 'metade' ? 'Faltam as 5 de costas e o perfil esquerdo. O ajuste da câmera vale até 22h04.' : 'Quinta, 26 de novembro. Dá para fazer antes, se quiser: a comparação usa a data de cada sessão.',
      acoes: e === 'metade' ? H.vai(ic.cam + ' Continuar', { ir: 'camera--pose' }) : H.vai(ic.cam + (e === 'primeira' ? ' Começar' : ' Nova sessão'), { ir: 'nova-sessao' }), saidas: e === 'metade' ? H.saida('Ver as 6 que saíram', { ir: 'sessao-metade' }) : '' })
    + (e === 'primeira' ? H.secao('', '', H.vazio('Ainda sem foto', 'Com duas sessões dá para comparar; com quatro, ver o corpo mudar no tempo.'))
      : H.secao('Última sessão', '12/11 · 11 de 11 no padrão', `<div class="fita-fotos">${PO.slice(0, 6).map(p => foto(p, 10)).join('')}</div>`) + H.secao('', '', `<div class="lista">${H.lin({ t: 'Comparar', a: 'duas datas da mesma pose, de três jeitos', ir: 'comparar' })}${H.lin({ t: 'No tempo', a: 'as 11 sessões de uma pose, em sequência', ir: 'no-tempo' })}${H.lin({ t: 'Galeria', a: '121 fotos em 11 sessões · 2 na lixeira', ir: 'galeria' })}</div>`)) });

tela({ id: 'nova-sessao', n: 'Nova sessão', g: 'fotos', c: 'destino', lugar: 'corpo',
  d: 'Quem vai segurar o celular (a pessoa de sempre é o padrão; sozinho é exceção) e "tudo como da última vez?". O que mudou fica escrito na sessão; a lente não pode mudar.',
  es: [['sempre', 'a pessoa de sempre'], ['mudou', 'algo mudou'], ['lente', 'outra lente']], vai: ['camera', 'passos', 'f-preparo'],
  r: e => { const c = { lugar: 1, luz: e !== 'mudou', roupa: 1, lente: e !== 'lente' };
    return H.cab('Nova sessão', '~4 min · 11 fotos') + H.secao('Quem vai segurar o celular?', '', `<div role="radiogroup" aria-label="Quem vai segurar">${H.esc('', ic.dois, 'A pessoa de sempre', 'Ela já conhece. Vai direto para a câmera.', 1)}${H.esc('', ic.um, 'Alguém que nunca fez', 'O app explica em três passos, na tela, para ela.', 0)}${H.esc('', ic.tripe, 'Eu, sozinho', 'Celular apoiado, contagem e voz. Sem tocar na tela.', 0)}</div>`)
      + H.secao('Tudo como da última vez?', 'toque no que mudou', `<div class="cond">${[['lugar', 'mesmo lugar', 'outro lugar'], ['luz', 'mesma luz', 'outra luz'], ['roupa', 'mesma roupa', 'outra roupa'], ['lente', 'lente 1×', 'outra lente']].map(x => `<button role="checkbox" aria-checked="${!!c[x[0]]}" data-est="${x[0] === 'luz' ? (c.luz ? 'mudou' : 'sempre') : x[0] === 'lente' ? (c.lente ? 'lente' : 'sempre') : e}">${c[x[0]] ? ic.ok : ic.x}${c[x[0]] ? x[1] : x[2]}</button>`).join('')}</div>
        <p class="txt">${e === 'sempre' ? 'Nada mudou: a sessão entra na comparação sem ressalva.' : e === 'mudou' ? 'A sessão continua valendo. “Outra luz” fica escrito nela e aparece ao comparar.' : 'A lente não pode mudar: ela deforma o corpo. O app trava a câmera na 1×.'}</p>`)
      + H.secao('', '', `<div class="lista">${H.lin({ t: 'O preparo', a: 'roupa, luz, a cadeira marcada', folha: 'f-preparo' })}</div><div class="acoes">${H.vai('Abrir a câmera ' + ic.seta, { ir: 'camera--permissao' })}</div>`); } });

tela({ id: 'f-preparo', n: 'O preparo', g: 'fotos', c: 'folha', base: 'nova-sessao',
  r: () => H.folha('O preparo', 'O que deixa as fotos comparáveis. Leva dois minutos, uma vez.', `<div class="passos-n">${[['Mesma roupa', 'A da última vez: sunga preta. Sem camiseta.'], ['Mesma luz', 'A luz do teto acesa, a da janela fechada. À noite fica igual sempre.'], ['A cadeira marcada', 'A 2,5 m da parede, na fita do chão. Quem fotografa senta nela.'], ['Pés no T', 'Na marca do chão, de frente para a câmera.']].map((p, i) => `<div><i>${i + 1}</i><div><b>${p[0]}</b><span>${p[1]}</span></div></div>`).join('')}</div><div class="acoes">${H.vai('Pronto', { fecha: 1 })}</div>`) });

tela({ id: 'passos', n: 'Para quem nunca fotografou', g: 'fotos', c: 'destino', lugar: 'corpo',
  r: () => H.cab('Para quem vai fotografar', '') + `<section class="momento" style="--cor:var(--assunto-treino);border-radius:34px;margin:8px 12px 0"><h1 class="heroi m" style="margin-top:14px">São 11 fotos e uns 4 minutos.</h1><p class="apoio">Você não precisa saber de nada. A tela diz o que acertar, e a voz fala com quem está sendo fotografado.</p></section>
    ${H.secao('', '', `<div class="passos-n">${[['Sente na cadeira marcada', 'Cotovelos apoiados nos joelhos. É isso que deixa o celular parado.'], ['Acerte três coisas, uma vez', 'Inclinação, altura e distância. Cada uma fica verde quando está certa.'], ['Depois, não saia do lugar', 'É um toque por foto. Se uma sair torta, o app avisa e você repete.']].map((p, i) => `<div><i>${i + 1}</i><div><b>${p[0]}</b><span>${p[1]}</span></div></div>`).join('')}</div><div class="acoes">${H.vai('Entendi ' + ic.seta, { ir: 'camera--permissao' })}</div>`)}` });

tela({ id: 'camera', n: 'A câmera', g: 'fotos', c: 'acao', lugar: 'corpo',
  d: 'Lacuna conhecida: a câmera real. O nível vem do sensor; altura e distância, da detecção do corpo, com a frase do que mexer. O disparo só destrava com as três luzes verdes (ou "Tirar mesmo assim", que marca a sessão). Depois do ajuste, as luzes encolhem e a voz fala com quem posa.',
  es: [['permissao', 'pedindo a câmera'], ['negada', 'câmera negada'], ['carregando', 'abrindo'], ['ninguem', 'ninguém inteiro no quadro'], ['nivel', 'ajuste: nível'], ['altura', 'ajuste: altura'], ['certo', 'tudo certo'], ['pose', 'uma pose'], ['gira', 'troca de posição'], ['sozinho', 'sozinho, contagem'], ['torta', 'saiu torta'], ['forcado', 'fora do padrão']],
  vai: ['f-mesmo-assim', 'fotos-fim'], v: 'Sai da câmera. As fotos tiradas ficam; a sessão aparece pela metade no centro das fotos.',
  r: e => {
    const aj = ['pose', 'gira', 'sozinho', 'torta', 'forcado'].includes(e), p = PO[e === 'gira' ? 4 : e === 'torta' ? 5 : 2], pose = e === 'gira' ? 4 : e === 'torta' ? 5 : 2;
    const luz = { nivel: [0, 0, 0], altura: [1, 0, 1], certo: [1, 1, 1], ninguem: [1, 0, 0] }[e] || [1, 1, 1];
    const topo = `<div class="topo-a" style="justify-content:flex-start;gap:6px"><button class="ico" data-voltar aria-label="Sair da câmera">${ic.x}</button><div style="flex:1;min-width:0"><b style="display:block;font:800 22px/1.05 var(--f-titulo);letter-spacing:-.02em">${aj ? p.n : 'Ajuste, uma vez só'}</b><span style="font:600 13px var(--f-texto);color:var(--texto-2)">${aj ? `foto ${pose + 1} de 11 · posição ${pose >= 4 ? 2 : 1} de 4` : 'depois é um toque por foto'}</span></div></div>`;
    const segs = `<div style="margin:2px 0 8px">${H.segs(11, aj ? pose : 0, aj ? pose : -1, [4, 7, 10])}</div>`;
    if (e === 'permissao' || e === 'negada' || e === 'carregando') return `<div class="acao-t pausa" style="padding-inline:14px">${topo}${segs}<div class="visor" style="background:var(--superficie-quieta)"><div class="centro">${e === 'carregando' ? `<b>Abrindo a câmera…</b><span>A de trás, na lente 1×.</span>` : e === 'permissao' ? `${ic.cam.replace('<svg', '<svg style="width:44px;height:44px"')}<b>O app precisa da câmera</b><span>As fotos ficam no aparelho e, com a conta, na sua cópia. Ninguém mais vê.</span>${H.vai('Permitir a câmera', { est: 'nivel', style: 'flex:0 0 auto;padding:0 26px;margin-top:6px' })}` : `<b>A câmera está bloqueada</b><span>Em Ajustes do iPhone › Safari › Câmera, escolha “Permitir”. Depois volte aqui.</span>${H.alt('Tentar de novo', { est: 'nivel', style: 'margin-top:6px' })}`}</div></div>
      <div class="disparo"><span class="lat tx"></span><button class="botao" aria-disabled="true" aria-label="Disparo travado">${ic.cadeado}</button><span class="lat tx"></span></div></div>`;
    const fr = { ninguem: [ic.atencao, 'Ninguém inteiro no quadro.', 'a cabeça e os pés precisam aparecer'], nivel: [ic.nivel, 'Endireite o celular: ele está inclinado.', 'de lado 4,2° · frente 1,1°'], altura: [ic.alt, 'Suba as mãos.', 'sobra mais espaço embaixo dos pés'], certo: [ic.ok, 'Tudo certo. Agora não saia do lugar até o fim.', ''], gira: [ic.gira, 'Um quarto de volta para a esquerda.', ''], forcado: [ic.atencao, 'Fora do padrão: altura sem acertar. Fica anotado.', ''] }[e];
    const tf = { ninguem: 'translateX(46%)', nivel: 'rotate(5deg)', altura: 'translateY(9%)' }[e] || 'none';
    return `<div class="acao-t pausa" style="padding-inline:14px">${topo}${segs}
      ${fr ? `<div class="aviso-c ${['certo', 'gira'].includes(e) ? 'ok' : ''}" role="status">${fr[0]}<span>${fr[1]}${fr[2] ? `<small>${fr[2]}</small>` : ''}</span></div>` : ''}
      <div class="visor"><div class="guia ${luz[2] ? 'ok' : ''}" style="top:9%"><span>cabeça</span></div><div class="guia meio" style="top:50%"></div><div class="guia ${luz[2] ? 'ok' : ''}" style="bottom:7%"><span>pés</span></div>
        ${aj ? `<div class="sombra">${gente(p, 9, true)}</div>` : ''}<div class="gente" style="transform:${tf}">${gente(p, 10)}</div>
        ${e === 'torta' ? `<div class="torta"><b>Esta saiu inclinada: 3,1°</b><span>O limite é 2°. Repetir leva dois segundos.</span><div class="acoes" style="margin-top:12px">${H.vai('Repetir', { est: 'pose', style: 'min-height:50px' })}${H.alt('Guardar assim', { est: 'pose', style: 'min-height:50px' })}</div></div>` : ''}
        ${e === 'sozinho' ? '<div class="conta5 n" role="timer" aria-label="3 segundos">3</div>' : ''}</div>
      <div class="luzes ${aj ? 'mini' : ''}">${[['nivel', ic.nivel, 'Nível', 'sensor'], ['altura', ic.alt, 'Altura', 'detecção'], ['dist', ic.dist, 'Distância', 'detecção']].map((g, i) => `<button class="${luz[i] ? 'ok' : ''}" aria-label="${g[2]}: ${luz[i] ? 'certo' : 'acertar'}">${luz[i] ? ic.ok : g[1]}<span>${g[2]}<small>${luz[i] ? 'certo' : 'acertar'}</small></span></button>`).join('')}</div>
      ${aj ? `<div class="fala"><p>“${p.fala}”<small>confira: ${p.conf}</small></p><button aria-label="Repetir a fala">${ic.som}</button></div>` : `<div class="saidas c">${luz.every(Boolean) ? '' : H.saida('Tirar mesmo assim', { folha: 'f-mesmo-assim' })}</div>`}
      <div class="disparo"><button class="lat" aria-pressed="true">foto anterior</button>
        <button class="botao" ${luz.every(Boolean) || e === 'forcado' ? '' : 'aria-disabled="true"'} data-est="${aj ? (e === 'sozinho' ? 'pose' : 'gira') : 'pose'}" aria-label="${aj ? 'Tirar a foto' : 'Confirmar o ajuste'}">${aj ? (e === 'sozinho' ? ic.play : ic.cam) : luz.every(Boolean) ? ic.ok : ic.cadeado}</button>
        <span class="lat tx n">${aj ? (e === 'sozinho' ? 'toque para pausar' : (11 - pose) + ' faltam') : luz.every(Boolean) ? 'toque para confirmar' : 'travado até ficar verde'}</span></div></div>`;
  } });

tela({ id: 'f-mesmo-assim', n: 'Tirar mesmo assim?', g: 'fotos', c: 'folha', base: 'camera',
  r: () => H.folha('Tirar mesmo assim?', 'As fotos saem e ficam guardadas, mas a sessão entra marcada como fora do padrão, com o que ficou sem acertar. Na comparação ela aparece com esse aviso.', `<div class="acoes">${H.vai('Voltar e acertar', { fecha: 1 })}</div><div class="saidas">${H.saida('Tirar fora do padrão', { ir: 'camera--forcado' })}</div>`) });

tela({ id: 'sessao-metade', n: 'Sessão pela metade', g: 'fotos', c: 'destino', lugar: 'corpo',
  d: 'O que já saiu, o que falta, e retomar. Refazer uma pose é tocar nela.', vai: ['camera', 'fotos-fim'],
  r: () => H.cab('Sessão de hoje', '6 de 11') + H.secao('As poses', 'toque para ver ou refazer', `<div class="grade">${PO.map((p, i) => i < 6 ? `<button aria-label="${p.n}, tirada">${foto(p, 10)}</button>` : `<button data-ir="camera--pose" aria-label="${p.n}, falta" style="aspect-ratio:3/4;border-radius:var(--r-miniatura);box-shadow:inset 0 0 0 1.5px var(--contorno);display:flex;align-items:center;justify-content:center;font:700 12px/1.2 var(--f-titulo);padding:6px;text-align:center">${p.n}</button>`).join('')}</div>`)
    + H.secao('', '', `<div class="acoes" style="margin-top:0">${H.vai(ic.cam + ' Continuar de costas', { ir: 'camera--pose' })}</div><p class="txt">O ajuste da câmera vale por uma hora. Depois, o app pede para acertar de novo, uma vez.</p><div class="saidas">${H.saida('Encerrar com 6 de 11', { ir: 'fotos-fim--fora' })}</div>`) });

tela({ id: 'fotos-fim', n: 'Fim da sessão', g: 'fotos', c: 'destino', lugar: 'corpo',
  d: 'Menta quando tudo no padrão; atenção quando fora. Devolve o número e a ressalva, e leva a comparar.',
  es: [['padrao', 'todas no padrão'], ['ressalva', 'com ressalva'], ['fora', 'fora do padrão']], vai: ['comparar', 'fotos'],
  r: e => H.momento({ cor: e === 'fora' ? 'atencao' : 'assunto-feito', anima: false, linha0: '<span>sessão de hoje</span><span class="n">3 min 50 s</span>', quando: 'guardada',
      titulo: { padrao: '11 de 11, todas no padrão', ressalva: '11 de 11, com uma ressalva', fora: '11 de 11, fora do padrão' }[e],
      apoio: { padrao: 'Mesmo lugar, mesma luz, mesma roupa, lente 1×.', ressalva: 'Anotado nesta sessão: outra luz. Aparece ao comparar.', fora: 'A altura não foi acertada. A sessão vale, e aparece com esse aviso ao comparar.' }[e],
      acoes: H.vai('Comparar com 06/07 ' + ic.seta, { ir: 'comparar' }), saidas: H.saida('Fechar', { voltar: 1 }) + H.saida('Medir agora', { ir: 'medir' }) })
    + H.secao('As onze', 'toque para ver ou refazer', `<div class="grade">${PO.map((p, i) => `<button aria-label="${p.n}">${foto(p, 10, e !== 'padrao' && i === 4)}</button>`).join('')}</div>`)
    + H.secao('Próxima', 'aviso na véspera, se quiser', `<p class="txt" style="margin-top:0">Segunda, 30 de novembro.</p>`) });

tela({ id: 'comparar', n: 'Comparar', g: 'fotos', c: 'destino', lugar: 'corpo',
  d: 'Duas datas da mesma pose, de três jeitos. O par que abre é o mais longo: em duas semanas a diferença é quase toda água. A linha das sessões marca a que tem ressalva.',
  es: [['lado', 'lado a lado'], ['cortina', 'cortina'], ['sobre', 'sobrepor'], ['sempar', 'uma sessão só']], vai: ['f-mandar', 'f-foto-comparada'],
  r: e => { if (e === 'sempar') return H.cab('Comparar', '') + H.secao('', '', H.vazio('Ainda sem par', 'Com a segunda sessão, daqui a 14 dias, a comparação aparece aqui. Uma sessão sozinha está na galeria.', H.alt('Abrir a galeria', { cheio: 1, ir: 'galeria' })));
    const a = D.SES[0], b = D.SES[10], p = PO[0];
    const palco = e === 'lado' ? `<div class="par-f"><button data-folha="f-foto-comparada" aria-label="Abrir a de ${a[0]}">${foto(p, 0)}</button><button data-folha="f-foto-comparada" aria-label="Abrir a de ${b[0]}">${foto(p, 10)}</button></div>`
      : e === 'cortina' ? `<div class="cortina" id="cortina">${foto(p, 10)}<div class="cima">${foto(p, 0)}</div><div class="pega"></div><span class="et n" style="left:10px">${a[0]}</span><span class="et n" style="right:10px">${b[0]}</span></div>`
      : `<div class="sobre">${foto(p, 0)}<div class="cima" id="sb-c" style="opacity:.5">${foto(p, 10, false, 'style="background:none"')}</div></div><input type="range" id="sb" min="0" max="100" value="50" aria-label="Quanto da foto mais nova aparece">`;
    return H.cab('Comparar', '129 dias') + H.fichas(PO.map(x => x.n), 0, 'Pose') + `<section class="secao" style="padding-top:10px">${H.seg(['Lado a lado', 'Cortina', 'Sobrepor'], { lado: 'Lado a lado', cortina: 'Cortina', sobre: 'Sobrepor' }[e], 'Modo').replace(/data-radio aria-checked="(\w+)">Lado/, 'data-radio data-est="lado" aria-checked="$1">Lado').replace(/data-radio aria-checked="(\w+)">Cortina/, 'data-radio data-est="cortina" aria-checked="$1">Cortina').replace(/data-radio aria-checked="(\w+)">Sobrepor/, 'data-radio data-est="sobre" aria-checked="$1">Sobrepor')}
      <div style="margin-top:10px">${palco}</div>
      <div class="datas" style="margin-top:8px">${H.q({ v: a[0], l: '72,4 kg na semana' })}${H.q({ v: b[0], l: '77,9 kg · <span class="n">+5,5</span>' })}</div>
      <div class="trilha" style="margin-top:12px"><div class="pts">${D.SES.map((s, i) => `<button class="${i === 0 ? 'de' : i === 10 ? 'ate' : ''} ${s[3] ? 'fora' : ''}" aria-label="sessão de ${s[0]}${s[3] ? ', ' + s[3] : ''}"><i></i>${i === 0 || i === 10 ? s[0] : ''}</button>`).join('')}</div></div>
      <p class="txt">Toque numa sessão para trocar a data mais próxima. A laranja tem ressalva: outra luz.</p>
      <div class="acoes">${H.alt(ic.envia + ' Mandar para os agentes', { cheio: 1, folha: 'f-mandar' })}</div></section>`; } });

tela({ id: 'f-foto-comparada', n: 'Foto comparada, aberta', g: 'fotos', c: 'folha', base: 'comparar',
  r: () => H.folha('06/07', 'Frente relaxado · 72,4 kg na semana · no padrão, nível 0,3°.', `<div style="margin:14px 24px 0">${foto(PO[0], 0)}</div><div class="acoes">${H.alt('Ajustar enquadramento', { cheio: 1, ir: 'ajustar' })}${H.alt('Abrir a sessão', { ir: 'galeria' })}</div>`) });

tela({ id: 'f-mandar', n: 'Mandar para os agentes', g: 'fotos', c: 'folha', base: 'comparar',
  d: 'Sempre no mesmo formato, para a leitura ser comparável. Depende de rede: sem rede, diz que manda quando voltar.', es: [['normal', 'com rede'], ['semrede', 'sem rede']],
  r: e => H.folha('Mandar para os agentes', 'Vai o par desta pose, com data, hora, peso da semana e o que mudou em cada sessão.', `<div role="radiogroup" aria-label="O que mandar">${H.esc('', ic.ok, 'Só esta pose', 'Frente relaxado, 06/07 e 12/11', 1)}${H.esc('', ic.cam, 'As 11 poses', 'o par inteiro das duas sessões', 0)}</div>
    <div class="acoes">${H.vai(e === 'semrede' ? 'Mandar quando a rede voltar' : 'Mandar', { desfazer: e === 'semrede' ? 'Fica na fila até a rede voltar.' : 'Mandado: Frente relaxado, 06/07 e 12/11.' })}</div>${e === 'semrede' ? '<p class="txt">Sem rede agora. O pedido fica guardado e sai sozinho.</p>' : ''}`) });

tela({ id: 'no-tempo', n: 'No tempo', g: 'fotos', c: 'destino', lugar: 'corpo',
  d: 'As sessões de uma pose como um filme. Como todas saem do mesmo lugar, o corpo fica parado e só a mudança aparece.',
  r: () => H.cab('No tempo', '11 sessões') + H.fichas(PO.map(x => x.n), 0, 'Pose') + `<div style="padding:10px 64px 0" id="nt-f">${foto(PO[0], 10)}</div>
    <section class="secao" style="padding-top:8px"><div class="datas">${H.q({ v: '<span id="nt-d">12/11</span>', l: 'sessão <span id="nt-i">11</span> de 11' })}${H.q({ v: '<span id="nt-p">77,9</span> kg', l: 'média da semana' })}</div>
    <input type="range" id="nt" min="0" max="10" value="10" aria-label="Sessão" style="margin-top:6px"><div class="acoes" style="margin-top:4px">${H.vai(ic.play + ' Passar do começo', { cls: 'nt-play' })}</div>
    <p class="txt">Arraste para ir e voltar. Com “reduzir movimento”, o filme passa foto a foto, sem fundir.</p></section>` });

tela({ id: 'galeria', n: 'Galeria', g: 'fotos', c: 'destino', lugar: 'corpo',
  d: 'Por sessão, com o selo: no padrão (menta) ou a ressalva (atenção). A lixeira fica no canto.', vai: ['foto-aberta', 'lixeira'],
  r: () => H.cab('Galeria', '', { dir: `<button class="ico" data-ir="lixeira" aria-label="Lixeira, 2 fotos">${ic.lixo}</button>` }) + [10, 9, 8, 7].map(i => `<section class="secao" style="${i < 10 ? 'border-top:1.5px solid var(--divisoria);margin-top:14px' : ''}"><h2 class="h"><span class="n">${D.SES[i][0]}</span>${D.SES[i][3] ? H.selo(D.SES[i][3], 'a') : H.selo('no padrão', '', ic.ok)}</h2>
    <div class="grade corpo" style="--col:6;gap:4px">${PO.slice(0, 6).map((p, k) => `<button data-ir="foto-aberta${i === 10 && k === 4 ? '--sugestao' : ''}" aria-label="${p.n}, ${D.SES[i][0]}">${foto(p, i)}</button>`).join('')}</div><div class="saidas">${H.saida('ver as 11', { ir: 'foto-aberta' })}</div></section>`).join('') });

tela({ id: 'foto-aberta', n: 'Foto aberta', g: 'fotos', c: 'destino', lugar: 'corpo',
  d: 'Andar entre as poses, ajustar, comparar daqui, apagar (vai para a lixeira, com desfazer). Quando a detecção sugeriu um alinhamento, a sugestão do app aparece: "Ver como fica", aceitar ou "Agora não".',
  es: [['normal', 'a foto'], ['sugestao', 'com alinhamento sugerido']], vai: ['ajustar', 'comparar'],
  r: e => H.cab('12/11', '', { dir: `<button class="ico" data-desfazer="Foto na lixeira por 30 dias." aria-label="Apagar esta foto">${ic.lixo}</button>` }) + `<div style="padding:6px 48px 0">${foto(PO[e === 'sugestao' ? 4 : 0], 10, false, e === 'sugestao' ? 'style="transform:rotate(-1.2deg) scale(1.04)"' : '')}</div>
    <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 12px 0"><button class="ico" aria-label="Pose anterior">${ic.volta}</button><div style="text-align:center"><b style="font:700 18px var(--f-titulo)">${PO[e === 'sugestao' ? 4 : 0].n}</b><span style="display:block;font:500 13px var(--f-texto);color:var(--texto-2)" class="n">foto ${e === 'sugestao' ? 5 : 1} de 11 · 77,9 kg na semana · 21h1${e === 'sugestao' ? 4 : 0}</span></div><button class="ico" aria-label="Próxima pose">${ic.dir}</button></div>
    ${e === 'sugestao' ? H.secao('', '', `<div class="caixa" style="background:var(--assunto-corpo);margin-top:0"><p>O app sugere alinhar esta foto<small>Girar 1,2° e aproximar 4%, para a cabeça e os pés caírem nas linhas como nas outras sessões.</small></p><div class="bs">${H.peq('Ver como fica', { c: 1 })}${H.peq('Aceitar', { f: 1, desfazer: 'Alinhamento aceito. A original fica guardada.' })}${H.peq('Agora não', { c: 1 })}</div></div>`) : ''}
    ${H.secao('', '', `<div class="acoes" style="margin-top:0">${H.alt('Ajustar enquadramento', { cheio: 1, ir: 'ajustar' })}${H.alt('Comparar', { cheio: 1, ir: 'comparar' })}</div><p class="txt">No padrão: nível 0,4°, lente 1×. Ajustar não mexe na foto original.</p>`)}` });

tela({ id: 'ajustar', n: 'Ajustar o enquadramento', g: 'fotos', c: 'destino', lugar: 'corpo',
  r: () => H.cab('Ajustar', 'Frente relaxado') + `<div class="quadro-a"><span id="aj-f" style="display:block">${foto(PO[0], 10)}</span></div>
    <div class="ctl"><label for="aj-r">Girar <b class="n" id="aj-rv">0,0°</b></label><input type="range" id="aj-r" min="-6" max="6" step=".1" value="0"></div>
    <div class="ctl" style="padding-top:0"><label for="aj-z">Aproximar <b class="n" id="aj-zv">1,00×</b></label><input type="range" id="aj-z" min="1" max="2" step=".01" value="1"></div>
    ${H.secao('', '', `<p class="txt" style="margin-top:0">Ponha a cabeça e os pés nas linhas tracejadas. É o mesmo quadro da câmera.</p><div class="acoes" style="margin-top:10px">${H.vai('Guardar', { voltar: 1 })}${H.alt('Original')}</div>`, { style: 'padding-top:4px' })}` });

tela({ id: 'lixeira', n: 'Lixeira das fotos', g: 'fotos', c: 'destino', lugar: 'corpo',
  d: 'Lacuna conhecida. Cada foto apagada fica 30 dias: restaurar volta para a sessão (com desfazer); apagar de vez pede confirmação, porque não tem volta.',
  es: [['itens', 'com fotos'], ['vazia', 'vazia']], vai: ['f-lixeira-apagar'],
  r: e => H.cab('Lixeira', e === 'vazia' ? '' : '2 fotos') + (e === 'vazia' ? H.secao('', '', H.vazio('Vazia', 'O que você apagar fica aqui por 30 dias e pode voltar.'))
    : H.secao('', '', `<p class="txt" style="margin-top:0">Cada foto fica 30 dias e depois some sozinha.</p><div class="lista" style="margin-top:8px">${[[2, '29/10', 'some em 27 dias'], [6, '15/10', 'some em 9 dias']].map(x => `<div class="lix">${foto(PO[x[0]], 8)}<span class="tx"><b>${PO[x[0]].n}</b><span class="n">sessão de ${x[1]} · ${x[2]}</span></span>${H.peq('Restaurar', { c: 1, desfazer: 'Foto restaurada na sessão de ' + x[1] + '.' })}</div>`).join('')}</div>
      <div class="acoes">${H.alt(ic.lixo + ' Apagar as 2 de vez', { cheio: 1, folha: 'f-lixeira-apagar' })}</div>`)) });

tela({ id: 'f-lixeira-apagar', n: 'Apagar de vez', g: 'fotos', c: 'folha', base: 'lixeira',
  r: () => H.folha('Apagar as 2 de vez?', 'Elas saem do aparelho e da cópia na conta, e não voltam. As sessões de 29/10 e 15/10 continuam com 10 de 11.', `<div class="acoes">${H.vai('Manter na lixeira', { fecha: 1 })}${H.alt('Apagar de vez', { fecha: 1 })}</div>`) });

/* ======================= SEMANA ======================= */
tela({ id: 'semana', n: 'Semana', g: 'semana', c: 'lugar', lugar: 'semana',
  d: 'O veredito da comida no topo, com o que a regra olha; as séries por região separando feitas de ainda vêm, para a segunda-feira não parecer alarme.',
  es: [['naomexer', 'não mexer: faltam dias'], ['pode', 'pode subir'], ['cedo', 'ainda cedo']], vai: ['responder', 'f-aplicar', 'f-musculos', 'retro', 'progressao', 'peso'],
  r: e => (e === 'cedo'
      ? H.momento({ cor: 'assunto-semana', anima: false, linha0: '<span>Semana</span><span>o que fazer com a comida</span>', titulo: 'Ainda cedo.', grande: 1, apoio: 'A regra olha duas semanas de peso. Com 5 pesagens até domingo, o veredito sai na segunda.' })
      : H.momento({ cor: e === 'pode' ? 'assunto-treino' : 'assunto-semana', anima: false, linha0: '<span>Semana</span><span>o que fazer com a comida</span>', titulo: e === 'pode' ? 'Pode subir.' : 'Não mexer.', grande: 1,
        apoio: e === 'pode' ? 'O peso parou por duas semanas e a comida foi seguida. Pela regra do nutricionista, o arroz sobe de 500 para 550 g por dia.' : 'O peso parou, mas falta saber se você comeu o plano. Responda os dias e o veredito sai.',
        acoes: e === 'pode' ? H.vai('Aplicar no plano', { folha: 'f-aplicar' }) + H.alt('Ainda não') : H.vai('Responder os dias ' + ic.seta, { ir: 'responder' }) }))
    + H.secao('O que a regra olha', 'do nutricionista', `<div>${[['', ic.ok, 'O peso parou', '−0,37 e +0,08 kg por semana. Duas seguidas abaixo de 0,10.'], [e === 'pode' ? '' : 'n', e === 'pode' ? ic.ok : ic.x, `Comida: ${e === 'pode' ? 12 : 9} de 14 dias`, e === 'pode' ? 'Passou dos 11 que a regra pede.' : 'A regra precisa de 11 dias respondidos.'], ['q', ic.duvida, 'Força: ainda sem dado', 'Faltam 4 semanas de carga em 3 exercícios. Acontece sozinho, treinando.']].map(c => `<div class="crit"><span class="g ${c[0]}" aria-hidden="true">${c[1]}</span><div><b>${c[2]}</b><span>${c[3]}</span></div></div>`).join('')}</div>`)
    + H.secao('Séries da semana', 'dia 2 de 7', `${[['Pernas', 22, 6, 28], ['Peito e ombro', 0, 24, 24], ['Costas', 0, 17, 17], ['Braços', 4, 11, 15]].map(m => `<button class="mus" data-folha="f-musculos"><span class="l1">${m[0]}<span class="n">${m[1]} feitas · ${m[2]} ainda vêm · alvo ${m[3]}</span></span><span class="br"><i class="f" style="width:${m[1] / m[3] * 100}%"></i><i class="v" style="width:${m[2] / m[3] * 100}%"></i></span></button>`).join('')}
      <div class="legm"><span><i style="background:var(--acao)"></i>feitas</span><span><i style="background:repeating-linear-gradient(135deg,var(--texto-legenda) 0 3px,var(--superficie-quieta) 3px 6px)"></i>nos treinos que faltam</span></div><p class="txt">A semana começou ontem. Só vira aviso o que não couber nos treinos que ainda faltam.</p>`)
    + H.secao('', '', `<div class="lista">${H.lin({ t: 'Cardio', a: '1 de 2 nesta semana · hoje: 20 a 25 min, leve', folha: 'f-cardio' })}${H.lin({ t: 'Progressão de carga', a: '1 exercício pronto para subir', ir: 'progressao' })}${H.lin({ t: 'Retrospectiva do bloco', a: '22 sessões em 4,7 semanas', ir: 'retro' })}</div>`) });

tela({ id: 'f-aplicar', n: 'Aplicar no plano', g: 'semana', c: 'folha', base: 'semana--pode',
  r: () => H.folha('Arroz: 500 → 550 g', 'Entra no almoço e no jantar, 25 g em cada, a partir de amanhã. O dia sobe cerca de 64 kcal. Fica anotado quando e por quê.', `<div class="acoes">${H.vai('Aplicar', { desfazer: 'Aplicado: arroz em 550 g por dia.' })}${H.alt('Agora não', { fecha: 1 })}</div>`) });
TELAS['f-aplicar'].base = 'semana';

tela({ id: 'f-musculos', n: 'Os músculos de uma região', g: 'semana', c: 'folha', base: 'semana',
  r: () => H.folha('Pernas', '22 feitas e 6 ainda vêm nesta semana, no treino D de quinta.', `<div style="margin-top:10px">${[['Quadríceps', 8, 0, 8], ['Posterior', 7, 0, 7], ['Glúteo', 3, 0, 3], ['Adutores', 2, 0, 2], ['Panturrilha', 2, 6, 8]].map(m => `<div class="mus"><span class="l1">${m[0]}<span class="n">${m[1]} feitas · ${m[2]} vêm · alvo ${m[3]}</span></span><span class="br"><i class="f" style="width:${m[1] / m[3] * 100}%"></i><i class="v" style="width:${m[2] / m[3] * 100}%"></i></span></div>`).join('')}</div>`) });

tela({ id: 'retro', n: 'Retrospectiva do bloco', g: 'semana', c: 'destino', lugar: 'semana',
  d: 'Lacuna conhecida. O bloco inteiro (desde a última revisão do treinador) em quatro respostas: quanto treinou, o que evoluiu, o que parou, a dor. É o que se leva para o treinador.',
  es: [['normal', 'bloco com dado'], ['cedo', 'ainda cedo']], vai: ['exercicio', 'progressao'],
  r: e => H.cab('O bloco', '14/10 a 16/11') + (e === 'cedo' ? H.secao('', '', H.vazio('Ainda cedo para comparar', 'O bloco começou há 9 dias. Com três semanas, aparece o que evoluiu e o que parou.'))
    : `<section class="secao" style="padding-top:4px">${H.quadros([{ v: '22', l: 'sessões' }, { v: '4,7', l: 'semanas' }, { v: '4,7', l: 'treinos por semana' }], 3)}</section>`
      + H.secao('O que evoluiu', '6 exercícios', `<div class="lista">${[['Cadeira flexora sentada', '40 → 47,5 kg', 'sobe'], ['Agachamento no Smith', '55 → 60 kg por lado', ''], ['Leg press', '150 → 160 kg', '']].map(x => H.lin({ t: x[0], a: x[1], sp: mini([1, 2, 2, 3, 4]), ir: 'exercicio' })).join('')}</div>`)
      + H.secao('Os parados no bloco', '2', `<div class="lista">${H.lin({ t: 'Terra romeno no Smith', a: '50 kg, 9 · 9 · 8 há 4 sessões', val: H.selo('parado', 'a'), ir: 'exercicio' })}${H.lin({ t: 'Panturrilha em pé', a: '70 kg, 10 · 9 · 8 há 3 sessões', val: H.selo('parado', 'a'), ir: 'exercicio' })}</div>`)
      + H.secao('A dor no bloco', '', `<div class="lista">${H.lin({ tag: 'div', t: 'Ombro direito, 2 vezes', a: 'desenvolvimento, 28/10 e 04/11 · trocado por elevação frontal', marca: 'nada' })}</div><div class="acoes">${H.alt(ic.copia + ' Copiar para o treinador', { cheio: 1, desfazer: 'Retrospectiva copiada em texto.' })}</div>`)) });

/* ======================= PLANO ======================= */
tela({ id: 'plano', n: 'Plano', g: 'plano', c: 'lugar', lugar: 'plano',
  d: 'O que espera decisão no topo (e o que vence), os treinos, os dias de treino, a comida do nutricionista, alimentos e compras.',
  es: [['normal', 'com decisão pendente'], ['vence', 'decisão vencendo hoje'], ['nada', 'nada pendente'], ['semcomida', 'comida desligada']], vai: ['programa', 'editor', 'progressao', 'revisao', 'f-refeicao-plano', 'f-alimentos', 'f-compras', 'f-nova-refeicao'],
  r: e => H.cab('Plano', '5 treinos · 6 refeições', { lugar: 1 })
    + (e === 'nada' || e === 'semcomida' ? '' : H.secao('Esperando você', 'vira regra?', `${e === 'vence' ? H.caixa('a', 'Vence hoje, no treino B', 'Se você não responder até começar o B, a troca fica só daquele dia.') : ''}<div class="decide"><p>Trocou agachamento no Smith por hack machine</p><small>no treino B de 09/11 · ${e === 'vence' ? 'vence hoje' : 'vence no próximo B, quinta'}</small>${H.resp(['Só aquele dia', 'Passa a valer'], null, { nome: 'Trocou agachamento' })}</div>`))
    + H.secao('Treinos', 'toque para editar', `<div class="tiles">${D.TR.map(t => `<button class="tile ${t[0] === 'B' ? 'hoje' : ''}" data-ir="editor"><span class="L">${t[0]}</span><span><b>${t[1]}</b><span>${t[2]} séries${t[0] === 'B' ? ' · hoje' : t[3] ? ' · ' + t[3] + (t[3] === 1 ? ' diferença' : ' diferenças') : ''}</span></span></button>`).join('')}</div>
      <div class="lista" style="margin-top:6px">${H.lin({ t: 'Programa inteiro', a: 'ordem, 9 diferenças do treinador, histórico', ir: 'programa' })}${H.lin({ t: 'Progressão', a: '1 para subir · 1 parado · 7 ganhando repetição', ir: 'progressao' })}${H.lin({ t: 'Revisão do treinador', a: 'colar o texto novo', ir: 'revisao' })}</div>`)
    + H.secao('Dias de treino', 'toque para trocar', `<div class="sem">${['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => `<button class="dd ${[1, 2, 3, 4, 5].includes(i) ? 't' : ''}" aria-pressed="${[1, 2, 3, 4, 5].includes(i)}" aria-label="${['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'][i]}">${d}</button>`).join('')}</div><p class="txt">Isto diz só em que dias você costuma treinar. Qual sessão vem é sempre a rotação: A, B, C, D, E.</p>`)
    + (e === 'semcomida' ? H.secao('Comida', '', `<div class="lista">${H.lin({ t: 'Comida desligada', a: 'ligue para acompanhar um plano alimentar', off: 1, marca: 'mais', folha: 'f-aparece' })}</div>`)
      : H.secao('Comida', '3.204 kcal em dia de treino', `${H.seg(['Dia de treino', 'Dia de descanso'], 'Dia de treino', 'Tipo de dia')}<div class="lista" style="margin-top:6px">${D.REF.map(r => H.lin({ t: r.n, a: r.h + ' · ' + r.it.length + ' itens' + (r.so ? ' · só em dia de treino' : ''), val: r.k, un: 'kcal', folha: 'f-refeicao-plano', n: 1 })).join('')}</div>
        <div class="acoes">${H.alt(ic.mais + ' Refeição', { cheio: 1, folha: 'f-nova-refeicao' })}${H.alt('Alimentos', { cheio: 1, folha: 'f-alimentos' })}</div><div class="lista" style="margin-top:6px">${H.lin({ t: 'Lista de compras', a: 'o plano de uma semana, 13 itens', folha: 'f-compras' })}</div>`)) });

tela({ id: 'programa', n: 'Programa', g: 'plano', c: 'destino', lugar: 'plano',
  d: 'Mudança aqui vale a partir do próximo treino. Os treinos, a ordem, as diferenças do treinador e o histórico de mudanças (quando e por quê, com desfazer).', vai: ['editor', 'diferencas', 'historico-mudancas', 'revisao', 'f-criar-treino'],
  r: () => H.cab('Programa', '95 séries · 9 diferenças') + `<section class="secao" style="padding-top:2px"><p class="txt" style="margin-top:0">Mudança aqui vale a partir do próximo treino. Para mudar só hoje, use “Mudar” durante o treino.</p><div class="tiles" style="margin-top:10px">${D.TR.map(t => `<button class="tile ${t[0] === 'B' ? 'hoje' : ''}" data-ir="editor"><span class="L">${t[0]}</span><span><b>${t[1]}</b><span>${t[2]} séries${t[3] ? ' · ' + t[3] + (t[3] === 1 ? ' diferença' : ' diferenças') : ''}</span></span></button>`).join('')}</div></section>
    ${H.secao('', '', `<div class="lista">${H.lin({ t: 'A ordem dos treinos', a: 'A, B, C, D, E · toque para mudar' })}${H.lin({ t: 'As 9 diferenças do treinador', a: 'o que você mudou, quando e por quê', ir: 'diferencas' })}${H.lin({ t: 'Histórico de mudanças', a: '14 mudanças desde 14/10', ir: 'historico-mudancas' })}${H.lin({ t: 'Revisão do treinador', a: 'colar o texto novo', ir: 'revisao' })}${H.lin({ t: 'Criar treino novo', a: 'do zero ou copiando um', marca: 'mais', folha: 'f-criar-treino' })}</div>`)}` });

tela({ id: 'diferencas', n: 'O que está diferente do treinador', g: 'plano', c: 'destino', lugar: 'plano', vai: ['editor'],
  r: () => H.cab('O que está diferente', '9 diferenças') + [['Treino A', [['↑', 'm', 'Supino inclinado: 3 → 4 séries', 'desde 21/10 · você disse: “o peito ficou para trás”']]], ['Treino D', [['+', '', 'Abdominal na polia entra', 'desde 28/10'], ['−', 't', 'Prancha sai', 'desde 28/10']]], ['Treino E', [['↑', 'm', 'Rosca direta: 2 → 3 séries', 'desde 04/11'], ['+', '', 'Face pull entra', 'desde 04/11']]]].map(g => H.secao(g[0], '', `<div>${g[1].map(m => `<div class="mud"><span class="sn ${m[1]}" aria-hidden="true">${m[0]}</span><span class="tx"><b>${m[2]}</b><span>${m[3]}</span></span>${H.peq('Voltar ao do treinador', { c: 1, desfazer: 'Voltou ao do treinador.' })}</div>`).join('')}</div>`)).join('') });

tela({ id: 'historico-mudancas', n: 'Histórico de mudanças', g: 'plano', c: 'destino', lugar: 'plano',
  r: () => H.cab('Mudanças', '14 desde 14/10') + H.secao('Novembro', '', `<div>${[['04/11', 'Face pull entra no treino E', 'você, no fim do treino'], ['04/11', 'Rosca direta: 2 → 3 séries', 'você, no editor'], ['28/10', 'Revisão do treinador: 3 mudanças aplicadas', 'texto colado']].map(m => `<div class="mud"><span class="sn m n" style="font-size:12px">${m[0].slice(0, 2)}</span><span class="tx"><b>${m[1]}</b><span>${m[0]} · ${m[2]}</span></span>${H.peq('Desfazer', { c: 1, desfazer: 'Mudança desfeita.' })}</div>`).join('')}</div>`) });

tela({ id: 'editor', n: 'Editor de um treino', g: 'plano', c: 'destino', lugar: 'plano',
  d: 'A faixa de cima mostra as séries por músculo e quanto saiu do que o treinador prescreveu, enquanto se mexe. Ordem pelas setas, séries pelo passo.', vai: ['f-catalogo', 'exercicio', 'f-renomear'],
  r: () => { const soma = { 'quadríceps': 6, 'posterior': 7, 'glúteo': 3, 'adutores': 2, 'panturrilha': 5 }, alvo = { 'quadríceps': 5, 'posterior': 7, 'glúteo': 3, 'adutores': 2, 'panturrilha': 5 };
    return H.cab('Treino B', '23 séries') + `<div class="vol" aria-label="Séries por músculo neste treino">${Object.keys(soma).map(g => { const d = soma[g] - alvo[g]; return `<span class="${d > 0 ? 'mais-v' : d < 0 ? 'menos-v' : ''}"><b class="n">${soma[g]}${d ? ' (' + (d > 0 ? '+' : '') + d + ')' : ''}</b>${g}</span>`; }).join('')}</div>
    <section class="secao" style="padding-top:8px"><div>${D.EX.map((x, i) => `<div class="ed"><span class="mv"><button aria-label="Subir ${x.n}">${ic.cima}</button><button aria-label="Descer ${x.n}">${ic.baixo}</button></span><button class="nm" data-ir="exercicio"><b>${x.n}</b><span>${x.g} · ${x.f[0]}–${x.f[1]}${i === 0 ? '<em>treinador: 2</em>' : ''}</span></button><span class="st"><button aria-label="Menos uma série em ${x.n}">−</button><b class="n">${i === 0 ? 3 : x.s}</b><button aria-label="Mais uma série em ${x.n}">+</button></span></div>`).join('')}</div>
    <div class="acoes">${H.alt(ic.mais + ' Exercício', { cheio: 1, folha: 'f-catalogo' })}${H.alt('Voltar ao do treinador', { desfazer: 'Treino B voltou ao do treinador.' })}</div><p class="txt">A faixa de cima mostra as séries por músculo neste treino e quanto saiu do que o treinador prescreveu.</p></section>`; } });

tela({ id: 'f-criar-treino', n: 'Criar treino', g: 'plano', c: 'folha', base: 'programa',
  r: () => H.folha('Criar treino', 'Ele entra no fim da rotação. Dá para mudar a ordem depois.', `${H.campo('Nome', 'text', 'Treino F')}<h3 class="h" style="margin-top:16px">Começar</h3><div role="radiogroup" aria-label="Começar">${H.esc('', ic.mais, 'Do zero', 'vazio, para adicionar exercício por exercício', 1)}${H.esc('', ic.copia, 'Copiando um', 'escolher o treino de base na próxima tela', 0)}</div><div class="acoes">${H.vai('Criar ' + ic.seta, { ir: 'editor' })}</div>`) });

tela({ id: 'f-renomear', n: 'Trocar o nome', g: 'plano', c: 'folha', base: 'exercicio',
  r: () => H.folha('Trocar o nome', 'O histórico continua neste exercício. O nome muda em todos os treinos.', `${H.campo('Nome', 'text', 'Cadeira flexora sentada')}<div class="acoes">${H.vai('Guardar', { desfazer: 'Nome trocado.' })}</div>`) });

tela({ id: 'revisao', n: 'Revisão do treinador', g: 'plano', c: 'destino', lugar: 'plano',
  d: 'Decisão do dono (17/11): mudança por mudança. Cola o texto, o app lê, mostra cada mudança com a chave; o que ficar de fora continua como diferença sua. Pede regra nova no app (aplicar parte de um treino).',
  es: [['colar', 'colar o texto'], ['lendo', 'lendo'], ['mudancas', 'as mudanças'], ['nada', 'nada lido']], vai: ['programa'],
  r: e => {
    if (e === 'colar' || e === 'lendo') return H.cab('Revisão do treinador', '') + `<section class="secao" style="padding-top:4px"><p class="txt" style="margin-top:0">Cole aqui o texto que o treinador mandou. O app lê, mostra cada mudança e você escolhe quais entram.</p>
      <label class="campo"><span>Texto da revisão</span><textarea>Treino B: entra hack machine 3x8-12 depois do agachamento, sai a extensora. Flexora cai para 3 séries.
Treino D: elevação lateral sobe para 5 séries.
Treino C: face pull 2x12-15 no fim.</textarea></label>
      <div class="acoes">${e === 'lendo' ? H.vai('Lendo…', { off: 1 }) : H.vai('Ler a revisão ' + ic.seta, { est: 'mudancas' })}</div></section>`;
    if (e === 'nada') return H.cab('Nada lido', '') + H.secao('', '', H.vazio('O app não achou mudanças no texto', 'Ele procura nome de treino, de exercício e séries (“3x8-12”). Confira se o texto veio inteiro, ou edite o programa à mão.', H.alt('Editar o texto', { cheio: 1, est: 'colar' }) + H.alt('Abrir o programa', { cheio: 1, ir: 'programa' })));
    const M = [['Treino B', [['+', '', 'Hack machine entra', '3 × 8–12, depois do agachamento', 1], ['−', 't', 'Cadeira extensora sai', 'era 1 × 10–15', 0], ['↓', 'm', 'Cadeira flexora: 4 → 3 séries', '', 1]]], ['Treino D', [['↑', 'm', 'Elevação lateral: 4 → 5 séries', '', 1]]], ['Treino C', [['+', '', 'Face pull entra', '2 × 12–15, no fim', 1]]]];
    return H.cab('5 mudanças', '4 marcadas') + M.map(g => H.secao(g[0], '', `<div>${g[1].map(m => `<button class="mud" role="switch" data-chave aria-checked="${!!m[4]}"><span class="sn ${m[1]}" aria-hidden="true">${m[0]}</span><span class="tx"><b>${m[2]}</b>${m[3] ? `<span>${m[3]}</span>` : ''}</span><span class="chave" aria-hidden="true"></span></button>`).join('')}</div>`)).join('').replace(/class="mud"/g, 'class="mud chave-l"')
      + H.secao('', '', `<div class="acoes" style="margin-top:0">${H.vai('Aplicar 4 mudanças', { desfazer: '4 mudanças aplicadas. Valem a partir do próximo treino.' })}</div><p class="txt">O programa do treinador passa a ser este. O que você deixar de fora continua aparecendo como diferença sua. Dá para desfazer.</p>`);
  } });

tela({ id: 'progressao', n: 'Progressão', g: 'plano', c: 'destino', lugar: 'plano',
  d: 'Prontos para subir, ganhando repetição, parados. A regra é a do treinador e está escrita embaixo.', vai: ['exercicio'],
  r: () => H.cab('Progressão', 'Treino B') + [['Prontos para subir', 'bateram o topo em todas as séries', [D.EX[1]]], ['Ganhando repetição', 'ainda dentro da faixa', [D.EX[0], D.EX[3], D.EX[5]]], ['Parados', 'mesma carga e repetições há 3 sessões', [D.EX[2]]]].map(g => H.secao(g[0], g[1], `<div class="lista">${g[2].map(x => { const u = x.h[x.h.length - 1]; return H.lin({ t: x.n, a: u[2].join(' · ') + ' na última', sp: mini(x.h.map(h => h[1] * (1 + h[2].reduce((a, b) => a + b, 0) / h[2].length / 30))), val: vir(u[1]), un: x.un.replace(' por lado', '/lado'), ir: 'exercicio' }); }).join('')}</div>`)).join('')
    + H.secao('', '', `<p class="txt" style="margin-top:0">A regra é a do treinador: primeiro ganhar repetição até o topo da faixa em todas as séries, depois subir a carga.</p>`) });

tela({ id: 'exercicio', n: 'Um exercício', g: 'plano', c: 'destino', lugar: 'plano',
  d: 'O próximo passo em cor (lima: subir; atenção: parado; areia: falta pouco), a carga por sessão, e sessão a sessão com a série que bateu o topo em destaque. Tocar numa sessão abre a sessão passada.',
  es: [['subir', 'pronto para subir'], ['parado', 'parado'], ['rep', 'ganhando repetição']], vai: ['sessao-passada', 'f-foto-aparelho', 'f-renomear'],
  r: e => { const x = e === 'subir' ? D.EX[1] : e === 'parado' ? D.EX[2] : D.EX[0], u = x.h[x.h.length - 1], a = x.h[0];
    const ps = { subir: ['', 'Na próxima, suba para 47,5 kg', 'Você fez 12 repetições em todas as séries com 45. Com a carga nova, o alvo volta para 8 a 10.'], parado: ['p', 'Parado há 4 sessões', 'Mesma carga e mesmas repetições. Não quer dizer erro: vale olhar descanso, sono e a ordem no treino antes de mexer.'], rep: ['n', 'Falta pouco para subir', 'Mantenha 60 kg. Série 1: mais 1. Quando as duas chegarem a 10, sobe.'] }[e];
    return H.cab(x.n, '', { longo: 1 }) + `<section class="secao" style="padding-top:4px"><div class="gigante m n">${vir(u[1])}<small>${x.un} · ${sinal(u[1] - a[1])} desde ${a[0]}</small></div><div class="passo ${ps[0]}"><b>${ps[1]}</b><span>${ps[2]}</span></div>
      <div style="margin-top:12px">${linha(x.h.map((h, i) => [i, h[1]]), { bolas: true, h: 90, folga: 2.5, corFim: '#D2F23A', rotulos: [a[0], u[0]], rotulo: 'Carga por sessão, de ' + vir(a[1]) + ' para ' + vir(u[1]) })}</div></section>
      ${H.secao('Sessão a sessão', `${x.s} × ${x.f[0]}–${x.f[1]} · sobrando ${x.rir}`, `<div>${x.h.slice().reverse().map(h => `<button class="sess" data-ir="sessao-passada"><span class="n">${h[0]}</span><span class="rs">${h[2].map(r => `<i class="n ${r >= x.f[1] ? 't' : ''}">${r}</i>`).join('')}</span><b class="n">${vir(h[1])} kg</b></button>`).join('')}</div><p class="txt">Em destaque, a série que bateu o topo da faixa.</p>`)}
      ${H.secao('', '', `<div class="lista">${H.lin({ t: 'Foto do aparelho', a: 'para achar o mesmo na academia', marca: 'mais', folha: 'f-foto-aparelho' })}${H.lin({ t: 'Trocar o nome', a: 'o histórico continua neste exercício', folha: 'f-renomear' })}</div>`)}`; } });

const AL = [['Arroz branco cozido', 128, 2.5, 28, .3], ['Feijão cozido', 76, 4.8, 13.6, .5], ['Frango cozido', 165, 31, 0, 3.6], ['Legumes e verduras', 35, 2, 7, .2], ['Azeite de oliva', 887, 0, 0, 100], ['Kiwi', 61, 1.1, 14.7, .5], ['Cuscuz cozido', 112, 2.2, 25, .7], ['Leite integral', 61, 3.2, 4.7, 3.3], ['Banana', 89, 1.1, 23, .3], ['Aveia', 389, 17, 66, 7], ['Whey concentrado', 400, 78, 8, 6]];
tela({ id: 'f-refeicao-plano', n: 'Uma refeição do plano', g: 'plano', c: 'folha', base: 'plano',
  d: 'Macros somados dos alimentos; a quantidade de cada um muda na régua. A mudança vale daqui para a frente.', vai: ['f-quantidade', 'f-seletor'],
  r: () => H.folha('Almoço', '<span class="n">12h30 · 6 itens</span>', `<div class="quadros" style="--col:4;margin-top:12px">${H.q({ v: '719', l: 'kcal' })}${H.q({ v: '45 g', l: 'proteína' })}${H.q({ v: '89 g', l: 'carbo' })}${H.q({ v: '20 g', l: 'gordura' })}</div>
    <h3 class="h" style="margin-top:16px">O que tem dentro <small>toque na quantidade</small></h3><div class="corpo">${D.REF[2].it.map(i => `<div class="it"><span class="tx"><b>${i[0]}</b><span class="n">${i[2]} kcal</span></span><button class="qt n" data-folha="f-quantidade">${i[1]}</button></div>`).join('')}</div>
    <div class="acoes">${H.alt(ic.mais + ' Alimento', { cheio: 1, folha: 'f-seletor' })}</div><p class="txt">A mudança vale daqui para a frente. O que você já marcou em dias passados não muda.</p>`) });

tela({ id: 'f-quantidade', n: 'Quantidade de um alimento', g: 'plano', c: 'folha', base: 'plano',
  r: () => H.folha('Arroz branco cozido', 'Almoço · arraste para mudar a quantidade', `<div class="gigante p n" style="margin:18px 0 10px"><span id="q-v">250</span><small>g · <span data-kcal-de>320</span> kcal</small></div>${regua({ mn: 0, mx: 500, st: 5, v: 250, cada: 50, px: 14, nome: 'Quantidade', un: 'g', alvo: '#q-v', kcal: 128 })}
    <div class="acoes">${H.vai('Usar esta quantidade', { desfazer: 'Arroz no almoço: nova quantidade.' })}</div><div class="saidas">${H.saida('Tirar da refeição', { desfazer: 'Arroz saiu do almoço.' })}</div>`) });

tela({ id: 'f-nova-refeicao', n: 'Nova refeição', g: 'plano', c: 'folha', base: 'plano',
  d: 'Lacuna conhecida. Nome, hora pela régua, e em que dias vale. Os alimentos entram depois, um a um.',
  r: () => H.folha('Nova refeição', 'Entra no plano daqui para a frente.', `${H.campo('Nome', 'text', 'Lanche da noite')}<h3 class="h" style="margin-top:16px">Hora</h3><div class="gigante p n" style="margin-top:8px">20h30</div>${regua({ mn: 5, mx: 23, st: .25, v: 20.5, cada: 1, px: 14, nome: 'Hora', un: 'h' })}
    <h3 class="h" style="margin-top:6px">Em que dias</h3><div class="corpo">${H.seg(['Todos', 'Treino', 'Descanso'], 'Todos', 'Dias')}</div><div class="acoes">${H.vai('Criar e pôr alimentos ' + ic.seta, { folha: 'f-seletor' })}</div>`) });

tela({ id: 'f-alimentos', n: 'Alimentos', g: 'plano', c: 'folha', base: 'plano',
  es: [['lista', 'lista'], ['vazio', 'busca sem resultado']], vai: ['f-alimento'],
  r: e => H.folha('Alimentos', '11 no app · por 100 g', `<label class="busca" style="margin-top:12px">${ic.lupa}<input value="${e === 'vazio' ? 'tapioca' : ''}" placeholder="Buscar alimento" aria-label="Buscar alimento">${e === 'vazio' ? `<button class="ico" aria-label="Limpar">${ic.x}</button>` : ''}</label>
    ${e === 'vazio' ? H.vazio('Nada com “tapioca”', 'Dá para criar o alimento com as calorias e os macros do rótulo.', H.vai(ic.mais + ' Criar “tapioca”', { folha: 'f-alimento--novo' })) : `<div class="lista" style="margin-top:8px">${AL.slice(0, 7).map(a => H.lin({ t: a[0], a: `P ${vir(a[2])} · C ${vir(a[3])} · G ${vir(a[4])}`, val: a[1], un: 'kcal', folha: 'f-alimento', n: 1 })).join('')}</div><div class="acoes">${H.alt(ic.mais + ' Novo alimento', { cheio: 1, folha: 'f-alimento--novo' })}</div>`}`) });

tela({ id: 'f-seletor', n: 'Escolher alimento', g: 'plano', c: 'folha', base: 'plano',
  r: () => H.folha('Pôr no almoço', 'Toque para adicionar; a quantidade vem a seguir.', `<label class="busca" style="margin-top:12px">${ic.lupa}<input value="ba" aria-label="Buscar alimento"><button class="ico" aria-label="Limpar">${ic.x}</button></label><div class="lista" style="margin-top:8px">${[AL[8], ['Batata-doce cozida', 86, 1.6, 20, .1], ['Batata inglesa cozida', 52, 1.2, 11.9, 0]].map(a => H.lin({ t: a[0], a: a[1] + ' kcal por 100 g', marca: 'mais', folha: 'f-quantidade' })).join('')}</div>`) });

tela({ id: 'f-alimento', n: 'Criar ou editar alimento', g: 'plano', c: 'folha', base: 'plano',
  d: 'Lacuna conhecida. Quatro números do rótulo, por 100 g. É o único lugar do app com teclado numérico: o rótulo traz o número exato, e não há "de onde partir" para a régua.',
  es: [['editar', 'editar'], ['novo', 'novo'], ['erro', 'número que não fecha']],
  r: e => H.folha(e === 'novo' ? 'Novo alimento' : 'Arroz branco cozido', e === 'novo' ? 'Os números do rótulo, por 100 g.' : 'Por 100 g. Muda em todas as refeições que usam.', `${H.campo('Nome', 'text', e === 'novo' ? 'Tapioca' : 'Arroz branco cozido')}
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">${H.campo('Calorias (kcal)', 'text', e === 'novo' ? '' : '128', { im: 'decimal' })}${H.campo('Proteína (g)', 'text', e === 'novo' ? '' : '2,5', { im: 'decimal' })}${H.campo('Carboidrato (g)', 'text', e === 'novo' ? '' : '28', { im: 'decimal', erro: e === 'erro' ? 'Os macros somam 420 kcal, mais que as 128 do rótulo. Confira.' : null })}${H.campo('Gordura (g)', 'text', e === 'novo' ? '' : '0,3', { im: 'decimal' })}</div>
    <div class="acoes">${H.vai('Guardar', { desfazer: 'Alimento guardado.' })}</div>${e === 'editar' ? `<div class="saidas">${H.saida('Apagar este alimento', { desfazer: 'Alimento apagado. Ele saiu de 2 refeições.' })}</div>` : ''}`) });

tela({ id: 'f-compras', n: 'Lista de compras', g: 'plano', c: 'folha', base: 'plano',
  r: () => H.folha('Compras', 'O plano de um dia de treino vezes sete, em alimento pronto.', `<div class="lista" style="margin-top:8px">${[['Arroz branco cozido', '3,5 kg', 1], ['Leite integral', '5,3 L', 1], ['Frango cozido', '1,1 kg', 0], ['Banana', '1,7 kg', 0], ['Cuscuz cozido', '1,4 kg', 0], ['Legumes e verduras', '1,4 kg', 0], ['Feijão cozido', '700 g', 0]].map(x => `<button class="lin marca" role="checkbox" data-marca aria-checked="${!!x[2]}"><span class="ck">${ic.ok}</span><span class="tx"><b>${x[0]}</b></span><span class="val n" style="font-size:15px">${x[1]}</span></button>`).join('')}</div><div class="acoes">${H.alt(ic.copia + ' Copiar a lista', { cheio: 1, desfazer: 'Lista copiada em texto.' })}</div>`) });

/* ======================= AJUSTES E PRIMEIRA VEZ ======================= */
tela({ id: 'ajustes', n: 'Ajustes', g: 'ajustes', c: 'destino', lugar: 'hoje',
  d: 'Conta, o que aparece, lembretes, cópia de segurança e o que apaga. Chega-se pelo "Ajustes" no fim da folha "O que aparece".',
  es: [['conta', 'com conta'], ['semconta', 'sem conta'], ['erro', 'senha errada'], ['entrando', 'entrando']], vai: ['f-colar-copia', 'f-confirma'],
  r: e => H.cab('Ajustes', '') + H.secao('Conta', e === 'conta' ? 'sincronizado há 2 min' : 'só neste aparelho', e === 'conta'
      ? `<div class="lista">${H.lin({ tag: 'div', o: ic.nuvem, t: 'Sua conta', a: 'registro igual no celular e no computador; fotos com cópia', marca: 'nada' })}</div><div class="saidas">${H.saida('Sair desta conta')}</div>`
      : `<p class="txt" style="margin-top:0">O app funciona sem conta e sem rede. Com a conta, o registro fica igual no celular e no computador, e as fotos ganham cópia.</p>${H.campo('E-mail', 'email', e === 'semconta' ? '' : 'voce@exemplo.com', { ac: 'email', im: 'email', erro: e === 'erro' ? 'E-mail ou senha não conferem. Confira os dois e tente de novo.' : null })}${H.campo('Senha', 'password', e === 'semconta' ? '' : '••••••••', { ac: 'current-password' })}<div class="acoes">${H.vai(e === 'entrando' ? 'Entrando…' : 'Entrar', { off: e === 'entrando' })}</div>`)
    + H.secao('O que aparece', '', `<div class="lista">${H.chave('Comida', '', 1)}${H.chave('Água', '', 1)}${H.chave('Peso', '', 1)}${H.chave('Cardio', '', 1)}${H.chave('Medidas', '', 0)}${H.chave('Fotos do corpo', '', 1)}</div>`)
    + H.secao('Lembretes', 'dentro do app', `<div class="lista">${H.chave('Véspera das fotos', 'um aviso no Hoje, no dia anterior à sessão', 1)}</div>`)
    + H.secao('Cópia de segurança', 'última: 29/10', `<div class="lista">${H.lin({ t: 'Guardar uma cópia', a: 'um arquivo com todo o registro, sem as fotos' })}${H.lin({ t: 'Restaurar de um arquivo', a: 'substitui o que está neste aparelho', folha: 'f-confirma--restaurar' })}${H.lin({ t: 'Colar a cópia como texto', a: 'quando o arquivo não abre no celular', folha: 'f-colar-copia' })}</div>`)
    + H.secao('Recomeçar', '', `<div class="lista">${H.lin({ t: 'Voltar ao programa do treinador', a: 'desfaz as 9 diferenças; o histórico fica', folha: 'f-confirma--restaurar' })}${H.lin({ t: 'Voltar ao plano do nutricionista', a: 'desfaz as mudanças de quantidade', folha: 'f-confirma--restaurar' })}${H.lin({ t: 'Voltar ao começo', a: 'apaga tudo o que você registrou', folha: 'f-confirma--comeco' })}</div>`) });

tela({ id: 'f-colar-copia', n: 'Colar a cópia como texto', g: 'ajustes', c: 'folha', base: 'ajustes',
  d: 'Lacuna conhecida. Para quando o arquivo não abre: colar o texto do arquivo. O app confere antes e diz o que tem nele.', es: [['colar', 'colar'], ['lido', 'lido, antes de restaurar'], ['erro', 'texto que não é cópia']],
  r: e => H.folha('Colar a cópia', 'Abra o arquivo .json da cópia, copie tudo e cole aqui.', `<label class="campo ${e === 'erro' ? 'erro' : ''}"><span>Texto da cópia</span><textarea>${e === 'colar' ? '' : '{"app":"lastro","versao":12,"S":{"done":[…'}</textarea>${e === 'erro' ? `<span class="msg">${ic.atencao}Isto não é uma cópia do app: falta o começo, “{"app":"lastro"”. Copie o arquivo inteiro.</span>` : ''}</label>
    ${e === 'lido' ? H.caixa('', 'Cópia de 29/10, 22h14', '312 sessões, 1.940 refeições marcadas, 61 pesagens. Restaurar substitui o que está neste aparelho; antes, o app guarda uma cópia do estado atual.') : ''}
    <div class="acoes">${e === 'lido' ? H.vai('Restaurar esta cópia', { folha: 'f-confirma--restaurar' }) : H.vai('Conferir o texto', { est: 'lido' })}</div>`) });

tela({ id: 'pv-treino', n: 'Primeira vez: seu treino', g: 'ajustes', c: 'destino', lugar: 'hoje',
  d: 'Decisão do dono (17/11): três passos, a pessoa começa vazia e traz o que é dela. Cada passo tem "pular". Restaurar ou entrar na conta é a saída para quem já usa o app.', vai: ['pv-comida', 'revisao', 'ajustes'],
  r: () => `<header class="cab d"><span style="min-width:44px"></span><h1 class="l">Seu treino</h1><button class="saida" data-ir="pv-comida" style="padding:0 12px">pular</button></header><div style="padding:4px var(--margem) 0">${H.segs(3, 0, 0)}</div>
    <div class="passo-f">${H.secao('', '', `<h2 class="heroi m" style="margin-top:0">De onde vem o seu treino?</h2><p class="txt">O app não monta treino: ele executa o que foi prescrito para você.</p><div role="radiogroup" aria-label="De onde vem">${H.esc('', ic.texto, 'Tenho o texto do treinador', 'Você cola e o app organiza em treinos e séries.', 1)}${H.esc('', ic.halter, 'Monto depois', 'Dá para registrar treino livre enquanto isso.', 0)}</div>`)}
      <div class="pe-f">${H.vai('Continuar ' + ic.seta, { ir: 'pv-comida' })}<div class="saidas">${H.saida('Já uso o app em outro aparelho', { ir: 'ajustes--semconta' })}</div></div></div>` });

tela({ id: 'pv-comida', n: 'Primeira vez: sua comida', g: 'ajustes', c: 'destino', lugar: 'hoje', vai: ['pv-acompanhar'],
  r: () => `<header class="cab d"><button class="ico" data-voltar aria-label="Voltar">${ic.volta}</button><h1 class="l">Sua comida</h1><button class="saida" data-ir="pv-acompanhar" style="padding:0 12px">pular</button></header><div style="padding:4px var(--margem) 0">${H.segs(3, 1, 1)}</div>
    <div class="passo-f">${H.secao('', '', `<h2 class="heroi m" style="margin-top:0">E a comida?</h2><p class="txt">Com um plano, o registro vira uma pergunta por dia. Sem plano, o app só não acompanha comida.</p><div role="radiogroup" aria-label="Comida">${H.esc('', ic.prato, 'Tenho um plano alimentar', 'Você monta as refeições no Plano, uma vez.', 1)}${H.esc('', ic.x, 'Não acompanho comida', 'A parte de comida fica desligada. Dá para ligar depois.', 0)}</div>`)}
      <div class="pe-f">${H.vai('Continuar ' + ic.seta, { ir: 'pv-acompanhar' })}<div class="saidas"></div></div></div>` });

tela({ id: 'pv-acompanhar', n: 'Primeira vez: o que acompanhar', g: 'ajustes', c: 'destino', lugar: 'hoje', vai: ['hoje--vazio'],
  r: () => `<header class="cab d"><button class="ico" data-voltar aria-label="Voltar">${ic.volta}</button><h1 class="l">O que acompanhar</h1><span style="min-width:44px"></span></header><div style="padding:4px var(--margem) 0">${H.segs(3, 2, 2)}</div>
    <div class="passo-f">${H.secao('', '', `<h2 class="heroi m" style="margin-top:0">O que mais você quer ver?</h2><p class="txt">Nada aqui é obrigatório, e tudo se liga e desliga depois.</p><div class="lista" style="margin-top:8px">${H.chave('Peso', 'a pesagem da manhã', 1)}${H.chave('Água', 'contar copos', 0)}${H.chave('Cardio', 'sessões da semana', 0)}${H.chave('Fotos do corpo', 'sessão padronizada a cada 14 dias', 0)}</div>`)}
      <div class="pe-f">${H.vai('Abrir o app ' + ic.seta, { lugar: 'hoje' })}<div class="saidas"></div></div></div>` });

/* ======================= O APP INTEIRO ======================= */
tela({ id: 'f-falhou', n: 'O que não foi guardado', g: 'geral', c: 'folha', base: 'hoje',
  d: 'A faixa "não guardei" fica no topo até resolver. Esta folha diz o que era, por que, e oferece tentar de novo e copiar em texto. Nunca apaga o que a pessoa informou.',
  r: () => H.folha('1 série não foi guardada', 'Leg press, série 2: 160 kg × 12, às 06h51. O aparelho recusou a gravação. O número continua na tela até dar certo.', `<div class="acoes">${H.vai('Tentar de novo', { fecha: 1 })}</div><div class="saidas">${H.saida('Copiar o registro em texto', { desfazer: 'Copiado: Leg press, 160 kg × 12.' })}</div>`) });

tela({ id: 'estados', n: 'Estados do app inteiro', g: 'geral', c: 'destino', lugar: 'hoje',
  d: 'Os avisos que valem em qualquer tela. Ligue "sem rede", "falha ao guardar" e "treino aberto" no painel ao lado (no celular, nas fichas abaixo) para ver em cima de qualquer tela.',
  r: () => H.cab('Estados', 'o que o app diz') + H.secao('Simular', 'em qualquer tela', `<div class="cond">${[['rede', 'Sem rede'], ['falha', 'Falha ao guardar'], ['treino', 'Treino aberto']].map(x => `<button data-glob="${x[0]}" aria-checked="${P.glob[x[0]]}" style="background:${P.glob[x[0]] ? 'var(--acao);color:var(--texto-sobre-acao)' : 'var(--superficie-quieta)'}">${x[1]}</button>`).join('')}</div>`)
    + H.secao('Aviso com desfazer', 'ações reversíveis', `<div class="acoes" style="margin-top:0">${H.alt('Apagar uma foto', { cheio: 1, desfazer: 'Foto na lixeira por 30 dias.' })}</div>`)
    + H.secao('Vazio', '', H.vazio('Uma pesagem não faz linha.', 'Com duas aparece a diferença; com uma semana, a média.'))
    + H.secao('Dado demais', 'nomes longos quebram em duas linhas, nunca cortam o número', `<div class="lista">${H.lin({ t: 'Elevação pélvica unilateral na máquina com apoio', a: '3 × 8–12 · glúteo', val: '82,5', un: 'kg' })}${H.lin({ t: 'Pesagens', a: '412 desde julho', val: '412' })}</div>`)
    + H.secao('Deitado', '', `<div class="vazio"><h3>Gire o telefone</h3><p>O app é feito para ficar em pé. O que você estava fazendo continua aqui.</p></div>`) });
