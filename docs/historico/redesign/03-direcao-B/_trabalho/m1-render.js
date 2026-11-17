/* Visto · Momento 1 — o mesmo código desenha os estados fixos e o protótipo tocável. */
function fmt(n){ return String(n).replace('.', ','); }
function mmss(s){ s=Math.max(0,Math.round(s)); return Math.floor(s/60)+':'+String(s%60).padStart(2,'0'); }
function hhmm(s){ s=Math.round(s); var h=Math.floor(s/3600), m=Math.floor((s%3600)/60); return h+':'+String(m).padStart(2,'0'); }
function seg(h,m,s){ return h*3600+m*60+(s||0); }
function ic(id,cl){ return '<svg class="ic'+(cl?' '+cl:'')+'" aria-hidden="true"><use href="#'+id+'"/></svg>'; }

function treinoA(){
  return {
    letra:'A', titulo:'Peito superior + dorsais + lateral + tríceps', ultData:'seg 21/9',
    inicio:seg(6,22), agora:seg(6,55),
    ex:[
      {n:'Chest press inclinado convergente', m:'peito superior', s:3, r:[6,10], rir:[1,2], d:180, carga:'no pino', ult:[[55,9],[55,8],[55,7]],
        subs:[['Supino inclinado no Smith',1],['Máquina de supino inclinado',1],['Supino inclinado com halteres',0]]},
      {n:'Pulldown convergente', m:'dorsal', s:3, r:[6,10], rir:[1,2], d:150, carga:'no pino', ult:[[60,10],[60,9],[60,8]],
        subs:[['Puxada neutra no cabo',1],['Puxada neutra na máquina',0],['Barra fixa assistida pegada neutra',0]]},
      {n:'Crucifixo inclinado no cabo', m:'peito superior', s:2, r:[10,15], rir:[1], d:120, carga:'no pino', ult:[[15,14],[15,12]],
        subs:[['Pec deck',1],['Crossover de baixo para cima',0],['Crucifixo inclinado com halteres',0]]},
      {n:'Pulldown unilateral', m:'dorsal', s:2, r:[8,12], rir:[1], d:120, carga:'no pino', ult:[[35,10],[35,9]],
        subs:[['Puxada neutra unilateral',1],['Puxada unilateral na polia alta',0],['Remada unilateral na polia alta ajoelhado',0]]},
      {n:'Elevação lateral na máquina', m:'deltoide lateral', s:3, r:[10,15], rir:[1], d:105, carga:'no pino', ult:[[25,13],[25,12],[25,11]],
        subs:[['Elevação lateral unilateral no cabo',1],['Elevação lateral no cabo',0],['Elevação lateral com halteres',0]]},
      {n:'Elevação lateral unilateral no cabo', m:'deltoide lateral', s:3, r:[12,20], rir:[0,1], d:90, carga:'no pino', ult:[[7.5,16],[7.5,15],[7.5,14]],
        subs:[['Elevação lateral na máquina',1],['Elevação lateral com halteres',0],['Elevação lateral deitado no banco inclinado',0]]},
      {n:'Extensão de tríceps acima da cabeça no cabo', m:'tríceps', s:2, r:[8,12], rir:[1], d:120, carga:'no pino', ult:[[22.5,11],[22.5,10]],
        subs:[['Extensão acima da cabeça ou máquina de tríceps',1],['Tríceps francês com halter',0],['Tríceps testa com barra W',0]]},
      {n:'Pushdown', m:'tríceps', s:2, r:[10,15], rir:[0,1], d:105, carga:'no pino', ult:[[30,14],[30,13]],
        subs:[['Tríceps corda na polia',0],['Tríceps barra reta na polia',0],['Mergulho na máquina assistida',0]]}
    ],
    /* hoje: [carga, reps, rir] — o chest press repete o exemplo do treinador: 55 kg em 9/8/7, depois 10/9/8 (F95) */
    hoje:[[[55,10,2],[55,9,1],[55,8,1]],[[60,10,2],[60,9,1],[60,9,1]],[[15,15,1],[15,12,1]],[[35,11,1]],[],[],[],[]],
    last:{e:3,s:0,t:seg(6,53,36)},
    cur:{e:3,s:1},
    extras:{}, pulados:[], troca:{}, dor:{}, peso:null, agua:1, carga:null
  };
}
function clone(o){ return JSON.parse(JSON.stringify(o)); }
function nSer(st,i){ return st.ex[i].s + (st.extras[i]||0); }
function nomeEx(st,i){ return st.troca[i] || st.ex[i].n; }
function feitas(st){ var c=0; st.hoje.forEach(function(h){ h.forEach(function(v){ if(v) c++; }); }); return c; }
function totalSer(st){ var c=0; for(var i=0;i<st.ex.length;i++){ if(st.pulados.indexOf(i)<0) c+=nSer(st,i); } return c; }
function rirTxt(r){ return r.length>1 ? r[0]+'–'+r[1] : String(r[0]); }
function refDe(st,i,k){ if(st.troca[i]) return null; return st.ex[i].ult[k]||null; }

function proxima(st){
  /* a próxima série não feita, na ordem; respeita pulados */
  for(var i=0;i<st.ex.length;i++){
    if(st.pulados.indexOf(i)>=0) continue;
    var h=st.hoje[i]; for(var k=0;k<nSer(st,i);k++){ if(!h[k]) return {e:i,s:k}; }
  }
  return null;
}

function statusBar(st){
  return '<div class="sis-topo" aria-hidden="true"><span class="tab">'+hhmm(st.agora)+'</span><span class="entalhe"></span>'+
    '<span class="ics"><span class="sinal"><i></i><i></i><i></i><i></i></span><span class="bat"></span></span></div>';
}

function cabecalho(st){
  var f=feitas(st), t=totalSer(st), dec=st.agora-st.inicio;
  var ritmo = f>0 ? '<span>no ritmo de hoje, <b>~'+hhmm(st.agora + dec/f*(t-f))+'</b></span>' : '<span>começa na primeira série</span>';
  return '<header class="sessao">'+
    '<button class="sessao-nome" data-acao="treino" aria-label="Treino '+st.letra+', trocar de treino">Treino '+st.letra+' '+ic('i-baixo')+'</button>'+
    '<div class="sessao-dir">'+
      '<button class="pilula" data-acao="peso">'+(st.peso? 'Peso <b>'+fmt(st.peso)+'</b>' : 'Peso <b>anotar</b>')+'</button>'+
      '<button class="pilula" data-acao="agua" aria-label="Água: '+st.agua+' copos de 14. Somar um copo.">Água <b>'+st.agua+'</b><span class="mais">+1</span></button>'+
    '</div>'+
    '<p class="sessao-meta"><b>'+f+'</b> de '+t+' séries · '+Math.round(dec/60)+' min · '+ritmo+'</p>'+
  '</header>';
}

function trilho(st){
  var h='<nav class="trilho" aria-label="Exercícios do treino '+st.letra+'">';
  st.ex.forEach(function(e,i){
    var n=nSer(st,i), feitos=st.hoje[i].filter(Boolean).length, pul=st.pulados.indexOf(i)>=0;
    var est = pul?'pulado' : feitos>=n?'feito' : feitos>0?'parcial':'nao';
    var rotulo = {pulado:'pulado',feito:'feito',parcial:feitos+' de '+n+' séries',nao:'ainda não'}[est];
    var atual = st.cur && st.cur.e===i;
    var pts=''; for(var k=0;k<n;k++){ pts+='<i class="'+(pul?'x':st.hoje[i][k]?'f':'')+'"></i>'; }
    h+='<button class="seg '+est+(atual?' atual':'')+'" data-acao="ir" data-e="'+i+'" aria-label="'+(i+1)+'. '+nomeEx(st,i)+': '+rotulo+(atual?', em curso':'')+'"'+(atual?' aria-current="step"':'')+'><span>'+(i+1)+'</span><span class="pts">'+pts+'</span></button>';
  });
  return h+'</nav>';
}

function cartao(st,o){
  o=o||{};
  var i=st.cur.e, e=st.ex[i], n=nSer(st,i);
  var linhas='';
  for(var k=0;k<n;k++){
    var ref=refDe(st,i,k), v=st.hoje[i][k], agora=(k===st.cur.s);
    var cel;
    if(o.falhou && agora){ cel='<td class="falhou">'+fmt(o.falhou[0])+' × '+o.falhou[1]+'<small>não gravou</small></td>'; }
    else if(v){
      var d=(ref && v[0]===ref[0] && v[1]>ref[1]) ? '<span class="delta">+'+(v[1]-ref[1])+'</span>' : '';
      cel='<td class="hoje">'+fmt(v[0])+' × '+v[1]+ic('i-check','p')+d+'</td>';
    }
    else if(agora){ cel='<td class="hoje"><span class="agora">agora</span></td>'; }
    else cel='<td class="ref">—</td>';
    linhas+='<tr class="'+(agora?'agora':'')+'"><th scope="row">'+(k+1)+(k>=e.s?'<small>extra</small>':'')+'</th><td class="ref">'+(ref? fmt(ref[0])+' × '+ref[1] : '—')+'</td>'+cel+'</tr>';
  }
  return '<article class="exercicio" aria-label="Exercício em curso">'+
    '<h3><span class="pos">'+(i+1)+'</span><span class="nm">'+nomeEx(st,i)+'</span><button class="orient" data-acao="mais" aria-label="Orientação do treinador">i</button></h3>'+
    (st.troca[i]? '<p class="troca">no lugar de '+e.n+' · só hoje</p>':'')+
    '<p class="presc">'+e.m+' · '+e.s+' × '+e.r[0]+'–'+e.r[1]+' · RIR '+rirTxt(e.rir)+' · descanso '+mmss(e.d)+'</p>'+
    (o.fotoVazia? '<div class="foto-vazia">'+ic('i-camera')+'<span>Sem foto desta máquina. <b>Fotografar</b> a etiqueta e o pino ajuda na próxima vez (F224).</span></div>' : '')+
    '<table class="series"><thead><tr><th scope="col"><span class="sr">Série</span></th><th scope="col">última · '+(st.troca[i]?'nunca feito':st.ultData)+'</th><th scope="col">hoje</th></tr></thead><tbody>'+linhas+'</tbody></table>'+
  '</article>';
}

function painel(st,o){
  o=o||{};
  if(!st.last) return '';
  var L=st.last, e=st.ex[L.e], v=st.hoje[L.e][L.s];
  if(!v) return '';
  var dec=st.agora-L.t, alvo=st.ex[L.e].d, pct=Math.min(1,dec/alvo), passou=dec-alvo;
  var ref=refDe(st,L.e,L.s);
  var d=(ref && v[0]===ref[0] && v[1]>ref[1]) ? ' <span class="delta">+'+(v[1]-ref[1])+' rep</span>' : '';
  var completo = st.hoje[L.e].filter(Boolean).length>=nSer(st,L.e) && !(st.cur && st.cur.e===L.e);
  var rir=''; for(var r=0;r<=4;r++){ var a=e.rir.indexOf(r)>=0;
    rir+='<button data-acao="rir" data-r="'+r+'" aria-pressed="'+(v[2]===r)+'" class="'+(a?'alvo':'')+'" aria-label="RIR '+r+(a?', alvo do treinador':'')+'">'+r+(a?'<small>alvo</small>':'')+'</button>'; }
  var pontos=['Cotovelo','Ombro da frente','Abaixo da patela'], dores=st.dor[L.e]||[];
  var dor=pontos.map(function(p){ return '<button data-acao="dor" data-p="'+p+'" aria-pressed="'+(dores.indexOf(p)>=0)+'">'+p+'</button>'; }).join('');
  return '<section class="acabou" aria-label="A série que acabou">'+
    '<div class="acabou-topo"><p class="recibo">'+ic('i-check')+'<b>'+fmt(v[0])+' × '+v[1]+'</b><span class="rc-g">gravada '+hhmm(L.t)+'</span>'+d+'<span class="rc-n">· s'+(L.s+1)+' '+nomeEx(st,L.e)+'</span></p></div>'+
    '<div class="relogio"><span>'+(o.notaRelogio||'desde ela')+'</span><b class="tab" data-relogio>'+mmss(dec)+'</b><span data-lembrete>lembrete '+mmss(alvo)+(passou>0? ' · passou '+mmss(passou):'')+'</span><button class="link" data-acao="corrigir">corrigir</button></div>'+
    '<div class="barra" aria-hidden="true"><i data-barra style="width:'+(pct*100).toFixed(1)+'%"></i></div>'+
    '<div class="linha-op"><span class="rot">RIR<br><span>opcional</span></span><div class="rir" role="group" aria-label="RIR desta série, opcional">'+rir+'</div></div>'+
    '<div class="linha-op"><span class="rot">Dor<br><span>ponto</span></span><div class="dor" role="group" aria-label="Ponto doendo neste exercício">'+dor+'</div></div>'+
    (completo? '<button class="extra" data-acao="extra" data-e="'+L.e+'">+ '+(nSer(st,L.e)+1)+'ª série de '+nomeCurto(nomeEx(st,L.e))+' <span>além da prescrição</span></button>':'')+
  '</section>';
}
function nomeCurto(n){ return n.length>26 ? n.slice(0,24).replace(/\s+\S*$/,'')+'…' : n; }

function entrada(st,o){
  o=o||{};
  var i=st.cur.e, k=st.cur.s, e=st.ex[i];
  var ref=refDe(st,i,k), extra=k>=e.s;
  var anterior = k>0 ? st.hoje[i][k-1] : null;
  var guia = ref || anterior;
  /* carga: a de hoje na série anterior, senão a da última sessão (F170, F171) */
  var carga = st.carga!=null ? st.carga : (anterior? anterior[0] : ref? ref[0] : null);
  var centro = guia ? guia[1] : Math.round((e.r[0]+e.r[1])/2);
  var ini = Math.max(1, centro-2), reps=[];
  for(var r=ini;r<ini+6;r++) reps.push(r);
  var chips = reps.map(function(r){
    var fora = r<e.r[0]||r>e.r[1], ult = ref && r===ref[1], ant = !ref && anterior && r===anterior[1];
    var cls='rep'+(fora?' fora':'')+(ult||ant?' ultima':'')+(o.tocado===r?' tocado':'')+(o.falhou && o.falhou[1]===r?' falhou':'');
    var sm = ult? '<small>última</small>' : ant? '<small>s'+k+' hoje</small>' : (o.falhou && o.falhou[1]===r)? '<small>de novo</small>' : '';
    return '<button class="'+cls+'" data-acao="rep" data-r="'+r+'" aria-label="'+r+' repetições'+(ult?' (igual à última)':'')+(fora?' (fora da faixa '+e.r[0]+'–'+e.r[1]+')':'')+': gravar a série '+(k+1)+'">'+r+sm+'</button>';
  }).join('') + '<button class="rep outro" data-acao="outro" aria-label="Outro número de repetições">…</button>';
  /* um só rótulo sob as repetições que caem na faixa prescrita */
  var a=reps.findIndex(function(r){return r>=e.r[0]&&r<=e.r[1];}), b=-1; reps.forEach(function(r,ix){ if(r>=e.r[0]&&r<=e.r[1]) b=ix; });
  var faixaHtml = a>=0 ? '<div class="faixa-rep" aria-hidden="true"><span style="grid-column:'+(a+1)+'/'+(b+2)+'">faixa '+e.r[0]+'–'+e.r[1]+'</span></div>' : '<div class="faixa-rep"></div>';
  var igual = ref && carga===ref[0];
  var refTxt = ref ? 'última: '+fmt(ref[0])+' × '+ref[1] : extra && anterior ? 'série '+k+' hoje: '+fmt(anterior[0])+' × '+anterior[1] : 'sem referência';
  return '<section class="entrada" aria-label="Próxima série">'+
    '<div class="entrada-topo"><p class="entrada-titulo">Série '+(k+1)+' de '+e.s+(extra?' <span class="delta">extra</span>':'')+'</p><p class="entrada-ref">'+refTxt+'</p></div>'+
    (extra? '<p class="entrada-nota"><span>Fica só neste dia. Virar programa é decisão da mesa.</span><button class="link" data-acao="desiste">desistir</button></p>':'')+
    (o.notaEntrada? '<p class="entrada-nota"><span>'+o.notaEntrada+'</span></p>':'')+
    '<div class="carga"><span class="rot">Carga</span><b class="valor'+(carga==null?' vazio':'')+'">'+(carga==null?'—':fmt(carga))+'</b><span class="unid">kg '+e.carga+(igual?'<br>igual à última':carga==null?'<br>anote antes da série':'')+'</span><button class="botao-sec" data-acao="carga">'+(carga==null?'anotar':'mudar')+'</button></div>'+
    '<div class="reps'+(carga==null?' desabilitado':'')+'">'+chips+'</div>'+faixaHtml+
    '<div class="acoes"><button data-acao="extra-aqui">+ série</button><button data-acao="trocar">Trocar</button><button data-acao="pular">Pular</button><button data-acao="mais">Mais</button></div>'+
  '</section>';
}

function instrumento(st,o){
  o=o||{};
  return statusBar(st)+
    '<div class="conteudo">'+
      (o.banner||'')+
      (o.semCabecalho?'':cabecalho(st))+trilho(st)+cartao(st,o)+painel(st,o)+entrada(st,o)+
    '</div>'+
    '<div class="sis-base" aria-hidden="true"><i></i></div>'+
    (o.overlay||'');
}

function teclado(rotulo,valor,nota){
  var t=['1','2','3','4','5','6','7','8','9',',','0','⌫'];
  return '<div class="teclado" role="dialog" aria-label="'+rotulo+'">'+
    '<div class="visor"><span class="rot">'+rotulo+'</span><b data-visor>'+valor+'</b><span class="cursor" aria-hidden="true"></span><span class="rot">'+(/Repeti/.test(rotulo)?'reps':'kg')+'</span></div>'+
    '<div class="teclas">'+t.map(function(x){ return '<button data-tecla="'+x+'" aria-label="'+(x==='⌫'?'apagar':x===','?'vírgula':x)+'">'+x+'</button>'; }).join('')+'</div>'+
    '<div class="linha-ok"><button class="cancela" data-tecla="cancela">Cancelar</button><button class="ok" data-tecla="ok">Pronto</button></div>'+
    (nota? '<p class="nota-tec">'+nota+'</p>':'')+
    '<div class="sis-base" aria-hidden="true"><i></i></div>'+
  '</div>';
}
