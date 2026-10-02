window.addEventListener('load',function(){
  var log=[], r=document.querySelector('[data-proto]');
  function q(s){return r.querySelector(s);} function clica(el,n){ if(!el){log.push('FALTA '+n);return;} el.click(); }
  try{
    log.push('agora card='+(q('.agora-card h4 span')||{}).textContent+' n14='+q('[data-n14]').textContent+' kcal='+q('[data-kcal]').textContent);
    clica(q('.agora-card [data-p="1"]'),'comi tudo');
    log.push('apos lanche: card='+(q('.agora-card')?'sim':'não')+' kcal='+q('[data-kcal]').textContent+' marcadas='+r.querySelectorAll('.ref-linha.marcada').length);
    clica(q('[data-acao="marca"][data-id="almoco"][data-p="0.5"]'),'almoco metade'); log.push('kcal='+q('[data-kcal]').textContent);
    clica(q('[data-acao="agua"][data-d="1"]'),'agua'); clica(q('[data-acao="agua"][data-d="1"]'),'agua2'); log.push('agua='+q('.agua .passo b').textContent);
    clica(q('[data-acao="comofoi"][data-v="naosabe"]'),'naosabe'); log.push('n14 naosabe='+q('[data-n14]').textContent);
    clica(q('[data-acao="comofoi"][data-v="sabe"]'),'sabe'); log.push('n14 sabe='+q('[data-n14]').textContent);
    clica(q('[data-acao="desmarca"][data-id="cafe"]'),'desmarca'); log.push('marcadas='+r.querySelectorAll('.ref-linha.marcada').length);
  }catch(e){ log.push('ERRO '+e.message); }
  var p=document.createElement('pre'); p.id='resultado'; p.textContent=log.join('\n'); document.body.appendChild(p);
});
