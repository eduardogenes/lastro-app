/* Visto · Momento 2 — a folha do dia. O mesmo código desenha os estados fixos e o protótipo tocável. */
function fmt(n){ return String(n).replace('.', ','); }
function milhar(n){ n=Math.round(n); return n>=1000 ? Math.floor(n/1000)+'.'+String(n%1000).padStart(3,'0') : String(n); }
function hhmm(s){ s=Math.round(s); var h=Math.floor(s/3600), m=Math.floor((s%3600)/60); return h+':'+String(m).padStart(2,'0'); }
function hhmm0(s){ var t=hhmm(s); return t.length<5?'0'+t:t; }
function seg(h,m,s){ return h*3600+m*60+(s||0); }
function ic(id,cl){ return '<svg class="ic'+(cl?' '+cl:'')+'" aria-hidden="true"><use href="#'+id+'"/></svg>'; }
function clone(o){ return JSON.parse(JSON.stringify(o)); }

/* plano do nutricionista (F181), quantidades do alimento pronto */
var PRE={id:'pre',h:seg(5,45),n:'Pré-treino',itens:'pão Artesano 35 g · doce de leite 20 g · canela 1 g · café 200 ml',kcal:163};
var INTRA={id:'intra',h:seg(6,15),n:'Treino',itens:'água 600 ml',kcal:0};
var CAFE={id:'cafe',h:seg(8,0),n:'Café da manhã',itens:'cuscuz 200 g · frango 70 g · requeijão light 30 g · leite integral 250 ml · uva 120 g',kcal:629};
var ALMOCO={id:'almoco',h:seg(12,30),n:'Almoço',itens:'arroz 250 g · feijão 50 g · frango 80 g · legumes/verduras 100 g · azeite 15 g · kiwi 100 g',kcal:719};
var LANCHE={id:'lanche',h:seg(16,0),n:'Lanche da tarde',itens:'leite 250 ml · banana 120 g · aveia 40 g · pasta de amendoim 10 g · leite em pó 10 g · whey 30 g · pão 50 g · geleia light 20 g',nota:'Bata leite + banana + aveia + pasta + leite em pó + whey. Pão e geleia ficam separados.',kcal:819};
var JANTAR={id:'jantar',h:seg(19,30),n:'Jantar',itens:'arroz 250 g · feijão 50 g · lombo suíno 80 g · legumes/verduras 100 g · azeite 15 g',kcal:678};
function planoManha(){ var c=clone(CAFE); c.tag='pós-treino'; return [clone(PRE),clone(INTRA),c,clone(ALMOCO),clone(LANCHE),clone(JANTAR)]; }

function quatorze(ini, conhecidos, hojeIx){
  /* 14 dias; ini = [dia, mês] do primeiro; conhecidos = índices com consumo conhecido */
  var d=[], dt=new Date(2026, ini[1]-1, ini[0]);
  var sem=['d','s','t','q','q','s','s'];
  for(var i=0;i<14;i++){ var x=new Date(dt.getTime()+i*864e5); d.push({n:x.getDate(), w:sem[x.getDay()], k:conhecidos.indexOf(i)>=0, h:i===hojeIx}); }
  return d;
}

function diaHoje(){
  return {
    titulo:'Hoje', data:'quinta, 1 de outubro', tipo:'dia de treino', agora:seg(15,32), hojeReal:true,
    pilulas:[['Peso','73,8',true],['Treino D','6:18',true],['Cardio','anotar',false]],
    ref:planoManha(), total:3007, marcas:{cafe:{p:1,t:'8:41'}}, agua:null, comoFoi:null,
    q:{ini:[18,9], hoje:13, alvo:13, k:[]}, mesa:2
  };
}

function conhecido(st){
  var algum=false; for(var k in st.marcas){ if(st.marcas[k]) algum=true; }
  return algum && st.comoFoi!=='naosabe';
}
function nConhecidos(st){ var n=(st.qOutros||0); return n + (conhecido(st)?1:0); }

function statusBar(st){
  return '<div class="sis-topo" aria-hidden="true"><span class="tab">'+hhmm(st.agora)+'</span><span class="entalhe"></span>'+
    '<span class="ics"><span class="sinal" style="--x:1"><i></i><i style="opacity:1"></i><i style="opacity:1"></i><i></i></span><span class="bat"></span></span></div>';
}

function agoraDe(st){
  if(!st.hojeReal) return null;
  var melhor=null;
  st.ref.forEach(function(r){
    if(st.marcas[r.id]) return;
    var dif=r.h-st.agora;
    if(dif<=60*60 && dif>=-90*60){ if(!melhor || Math.abs(dif)<Math.abs(melhor.h-st.agora)) melhor=r; }
  });
  return melhor;
}

function cabecalho(st){
  return '<div class="dia-cab"><div>'+
      (st.voltar? '<button class="voltar" data-acao="voltar">'+ic('i-esq')+st.voltar+'</button>':'')+
      '<h3>'+st.titulo+'</h3><p>'+st.data+' · '+st.tipo+'</p></div>'+
      '<button class="mesa-btn" data-acao="mesa">'+ic('i-mesa')+'Mesa'+(st.mesa?' <span class="cont">'+st.mesa+'</span>':'')+'</button>'+
    '</div>'+
    (st.pilulas? '<div class="pilulas">'+st.pilulas.map(function(p){
      return '<button class="pilula'+(p[2]?' feita':'')+'" data-acao="pilula">'+p[0]+' <b>'+p[1]+'</b>'+(p[2]?ic('i-check','p'):'')+'</button>'; }).join('')+'</div>' : '');
}

function faixa14(st){
  var dias=quatorze(st.q.ini, st.q.k||[], st.q.hoje);
  var hojeK=conhecido(st);
  var n=0;
  var cel=dias.map(function(d,i){
    var k = d.k || (i===st.q.alvo && hojeK);
    if(k) n++;
    return '<span class="d'+(k?' k':'')+(d.h?' h':'')+'"><i>'+(k?'✓':'?')+'</i><small>'+d.n+'</small></span>';
  }).join('');
  return '<button class="quatorze" data-acao="14dias" aria-label="Últimos 14 dias: '+n+' com consumo conhecido. A regra do nutricionista pede 11. Abrir para pôr em dia.">'+
    '<span class="q-topo"><span>Consumo conhecido: <b data-n14>'+n+'</b> de 14 dias</span><span class="r">a regra pede 11 ›</span></span>'+
    '<span class="q-dias" aria-hidden="true">'+cel+'</span></button>';
}

function cartaoAgora(st,r,o){
  o=o||{};
  return '<section class="agora-card'+(o.falhou?' falhou':'')+'" aria-label="Refeição de agora">'+
    '<p class="hora">Agora · '+hhmm0(r.h)+' no plano</p>'+
    '<h4><span>'+r.n+'</span><span class="kcal">'+r.kcal+' kcal</span></h4>'+
    '<p class="itens">'+r.itens+'</p>'+
    (r.nota? '<p class="nota-nutri">“'+r.nota+'”</p>':'')+
    (o.falhou? '<p class="falha-linha">'+ic('i-erro')+'<span><b>Não gravou.</b> O aparelho recusou: o espaço do navegador está cheio (F53). Nada foi marcado.</span></p>':'')+
    '<div class="botoes"><button class="btn-contorno" data-acao="marca" data-id="'+r.id+'" data-p="0.5" aria-label="Comi só metade: '+r.n+'">Só metade</button>'+
    '<button class="botao-tinta" data-acao="marca" data-id="'+r.id+'" data-p="1" aria-label="Comi tudo: '+r.n+'">'+ic('i-check')+(o.falhou?'Tocar de novo':'Comi tudo')+'</button></div>'+
  '</section>';
}

function linha(st,r,agoraR){
  var m=st.marcas[r.id], h='<span class="h">'+hhmm0(r.h)+(r.antes?'<s>'+r.antes+'</s>':'')+'</span>';
  var nome='<span class="n">'+r.n+'</span>'+(r.tag?'<span class="tag">'+r.tag+'</span>':'');
  var kc = r.sub || (r.kcal ? r.kcal+' kcal' : r.itens);
  if(m){
    var q = m.p===1?'tudo':'metade';
    return '<li class="ref-linha marcada"><span class="h">'+hhmm0(r.h)+'</span><div class="meio">'+nome+'<span class="s">'+(m.p===1?kc:Math.round(r.kcal/2)+' de '+r.kcal+' kcal')+'</span></div>'+
      '<div class="feito"><span class="selo-visto">'+ic('i-check','p')+q+'</span><span class="quando">'+(m.d? 'marcado '+m.d+' '+m.t : m.t)+'</span><button class="link" data-acao="desmarca" data-id="'+r.id+'" aria-label="Desfazer: '+r.n+'">desfazer</button></div></li>';
  }
  if(agoraR && agoraR.id===r.id){
    return '<li class="ref-linha e-agora">'+h+'<div class="meio">'+nome+'<span class="s">'+kc+'</span></div><span class="seta-agora">↑ agora</span></li>';
  }
  var passou = st.hojeReal ? r.h < st.agora : true;
  var futuro = st.hojeReal && r.h - st.agora > 60*60;
  var sub = r.obs ? '<span class="s aviso-h">'+r.obs+'</span>' : '<span class="s">'+kc+(passou?' · sem visto':'')+'</span>';
  if(futuro) return '<li class="ref-linha">'+h+'<div class="meio">'+nome+sub+'</div><span class="mais-tarde">mais tarde</span></li>';
  return '<li class="ref-linha">'+h+'<div class="meio">'+nome+sub+'</div>'+
    '<div class="par"><button data-acao="marca" data-id="'+r.id+'" data-p="0.5" aria-label="Comi metade: '+r.n+'">½</button>'+
    '<button class="tudo" data-acao="marca" data-id="'+r.id+'" data-p="1" aria-label="Comi tudo: '+r.n+'">'+ic('i-check','p')+'tudo</button></div></li>';
}

function blocoAgua(st){
  var c=''; for(var i=0;i<14;i++) c+='<i class="'+(st.agua!=null&&i<st.agua?'c':'')+'"></i>';
  return '<section class="agua" aria-label="Água">'+
    '<div class="agua-topo"><div class="meio"><span class="n">Água</span><span class="s">'+(st.agua==null?'não contada — não é zero':st.agua+' de 14 copos de 250 ml')+'</span></div>'+
    '<div class="passo"><button data-acao="agua" data-d="-1" aria-label="Um copo a menos"'+(st.agua==null?' disabled style="opacity:.4"':'')+'>−</button><b>'+(st.agua==null?'—':st.agua)+'</b><button class="mais" data-acao="agua" data-d="1">+1 copo</button></div></div>'+
    '<div class="copos" aria-hidden="true">'+c+'</div></section>';
}

function blocoComoFoi(st){
  var ops=[['seguiu','Segui o plano'],['sabe','Saí do plano, sei o que comi'],['naosabe','Saí do plano, não sei quanto']];
  return '<section class="comofoi" aria-label="Como foi o dia"><p class="leg">Como foi o dia <span>opcional · a regra usa</span></p>'+
    '<div class="ops" role="radiogroup" aria-label="Como foi o dia">'+ops.map(function(o){
      return '<button role="radio" aria-checked="'+(st.comoFoi===o[0])+'" data-acao="comofoi" data-v="'+o[0]+'"><i></i>'+o[1]+'</button>'; }).join('')+'</div></section>';
}

function totais(st){
  var s=0, falta=[];
  st.ref.forEach(function(r){ var m=st.marcas[r.id]; if(m) s+=r.kcal*m.p; else if(st.hojeReal && r.h>st.agora) falta.push(r.n.toLowerCase()+' '+hhmm(r.h)); });
  return '<p class="totais">Pelo plano, com visto: <b data-kcal>'+milhar(s)+'</b> de '+milhar(st.total)+' kcal'+(falta.length?' · ainda hoje: '+falta.join(', '):'')+'</p>';
}

function dia(st,o){
  o=o||{};
  var ag = o.semAgora ? null : agoraDe(st);
  var lista = st.ref.map(function(r){ return linha(st,r,ag); }).join('');
  return statusBar(st)+
    '<div class="conteudo">'+
      cabecalho(st)+(o.banner||'')+(st.q?faixa14(st):'')+
      (ag? cartaoAgora(st,ag,o) : '')+
      (o.antesLista||'')+
      '<div class="titulo-lista"><span class="rot">O plano de '+(st.hojeReal?'hoje':st.curto||'ontem')+'</span><span>'+(o.subLista||'toque no que comeu')+'</span></div>'+
      '<ul class="refeicoes">'+lista+'</ul>'+
      blocoAgua(st)+blocoComoFoi(st)+(o.resultado||'')+totais(st)+
      '<div style="height:16px"></div>'+
    '</div>'+
    '<div class="sis-base" aria-hidden="true"><i></i></div>'+
    (o.semDobra?'':'<div class="dobra" aria-hidden="true"></div>')+(o.overlay||'');
}
