/* ---------- tema ---------- */
(function(){var q=new URLSearchParams(location.search).get("tema");if(q==="light"||q==="dark"){document.documentElement.setAttribute("data-theme",q);}})();
document.querySelectorAll('[data-tema]').forEach(function(b){
  b.addEventListener('click',function(){
    var t=b.getAttribute('data-tema');
    if(t==='sistema'){document.documentElement.removeAttribute('data-theme');}
    else{document.documentElement.setAttribute('data-theme',t);}
    document.querySelectorAll('[data-tema]').forEach(function(x){x.setAttribute('aria-pressed',String(x===b));});
  });
});

/* ---------- estado 1, interativo: o lanche ---------- */
(function(){
  var raiz=document.getElementById('vivo'); if(!raiz) return;
  var elFaixa=document.getElementById('vivo-faixa'), elLanche=document.getElementById('vivo-lanche'), elToast=document.getElementById('vivo-toast');
  var s={marca:null, outra:false, toast:false}, t=null;
  function faixa(){
    var n=s.marca?1:0, h='';
    for(var i=0;i<13;i++){h+='<i class="q"></i>';}
    h+='<i class="q hoje'+(s.marca?' meio':'')+'"></i>';
    elFaixa.innerHTML='<button class="faixa" type="button" aria-label="Comida conhecida em '+n+' dos últimos 14 dias. A regra do nutricionista pede 11. Abrir os 14 dias.">'
      +'<span class="faixa-l1"><span>Comida: <b>'+n+'</b> de 14 dias conhecidos</span><span>a regra pede 11 ›</span></span>'
      +'<span class="qs" aria-hidden="true">'+h+'</span></button>';
  }
  function lanche(){
    if(s.marca){
      var txt=s.marca==='tudo'?'tudo':(s.marca==='metade'?'metade':'¾');
      elLanche.innerHTML='<div class="it tinta entra"><span class="h">16h00</span><span><span class="n">Lanche da tarde ✓</span><br><span class="s">'+txt+' · marcado às 15h34</span></span><button class="acao" type="button" data-mudar="1">Mudar</button></div>';
    } else {
      var bts = s.outra
        ? '<div class="linha-bt"><button class="bt" type="button" data-p="metade">Metade</button><button class="bt" type="button" data-p="tres">¾</button><button class="bt" type="button" data-volta="1">Voltar</button></div>'
        : '<div class="linha-bt"><button class="bt cheio" type="button" data-p="tudo">Comi tudo</button><button class="bt" type="button" data-outra="1">Outra porção</button></div>';
      elLanche.innerHTML='<div class="it grande"><span class="h">agora</span><span><span class="n" style="font-size:1.05rem">Lanche da tarde · 16h00</span><br><span class="s">819 kcal · a lápis</span></span>'
        +'<div class="corpo"><p class="itens">leite 250 ml · banana 120 g · aveia 40 g · pasta de amendoim 10 g · leite em pó 10 g · whey 30 g · pão 50 g · geleia light 20 g</p>'
        +'<div class="regra" style="margin:6px 0 8px"><b>Nutricionista:</b> “Bata leite + banana + aveia + pasta + leite em pó + whey. Pão e geleia ficam separados.”</div>'
        +bts+'</div></div>';
    }
  }
  function toast(){
    elToast.innerHTML=s.toast?'<div class="toast" role="status"><span>Lanche: '+(s.marca==='tudo'?'tudo':s.marca==='metade'?'metade':'¾')+', às 15h34</span><button type="button" data-desfazer="1">Desfazer</button></div>':'';
  }
  function tudo(){faixa();lanche();toast();}
  raiz.addEventListener('click',function(ev){
    var b=ev.target.closest('button'); if(!b) return;
    if(b.dataset.p){ s.marca={tudo:'tudo',metade:'metade',tres:'tres'}[b.dataset.p]; s.outra=false; s.toast=true; tudo();
      clearTimeout(t); t=setTimeout(function(){s.toast=false;toast();},6000); return; }
    if(b.dataset.outra){ s.outra=true; lanche(); return; }
    if(b.dataset.volta){ s.outra=false; lanche(); return; }
    if(b.dataset.desfazer||b.dataset.mudar){ s.marca=null; s.toast=false; s.outra=!!b.dataset.mudar; tudo(); return; }
  });
  tudo();
})();
