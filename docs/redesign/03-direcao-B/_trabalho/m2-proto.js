/* protótipo tocável do estado 1 do momento 2 — só roda no navegador */
(function(){
  var raiz=document.querySelector('[data-proto]');
  if(!raiz) return;
  var vivo=document.getElementById('anuncio');
  var base=Date.now(), st0=diaHoje(), st=clone(st0);
  function agoraMock(){ return st0.agora+(Date.now()-base)/1000; }
  function anunciar(t){ if(vivo){ vivo.textContent=''; setTimeout(function(){ vivo.textContent=t; },30); } }
  function render(){ st.agora=agoraMock(); raiz.innerHTML=dia(st); }
  function nomeDe(id){ var n=''; st.ref.forEach(function(r){ if(r.id===id) n=r.n; }); return n; }
  raiz.addEventListener('click',function(ev){
    var b=ev.target.closest('[data-acao]'); if(!b||!raiz.contains(b)) return;
    var a=b.getAttribute('data-acao'), id=b.getAttribute('data-id');
    switch(a){
      case 'marca': var p=+b.getAttribute('data-p');
        st.marcas[id]={p:p,t:hhmm(agoraMock())};
        anunciar('Visto: '+nomeDe(id)+', '+(p===1?'tudo':'metade')+', às '+st.marcas[id].t+'.');
        render();
        var li=raiz.querySelectorAll('.ref-linha.marcada'); li.forEach(function(x){ if(x.querySelector('[data-id="'+id+'"]') && x.animate) x.animate([{background:'var(--tinta-fundo)'},{background:'transparent'}],{duration:700,easing:'ease-out'}); });
        return;
      case 'desmarca': delete st.marcas[id]; anunciar('Desfeito: '+nomeDe(id)+'.'); break;
      case 'agua': var d=+b.getAttribute('data-d'); st.agua = st.agua==null ? (d>0?1:null) : Math.max(0,Math.min(20,st.agua+d)); anunciar('Água: '+(st.agua==null?'não contada':st.agua+' copos')); break;
      case 'comofoi': var v=b.getAttribute('data-v'); st.comoFoi = st.comoFoi===v ? null : v;
        anunciar(st.comoFoi==='naosabe' ? 'Marcado: saí do plano e não sei quanto. Este dia fica desconhecido para a regra.' : 'Como foi o dia: '+b.textContent); break;
      default: return;
    }
    render();
  });
  setInterval(function(){ var hs=raiz.querySelector('.sis-topo .tab'); if(hs) hs.textContent=hhmm(agoraMock()); },5000);
  render();
})();
