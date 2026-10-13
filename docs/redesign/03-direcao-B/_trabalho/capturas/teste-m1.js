window.addEventListener('load',function(){
  var log=[], r=document.querySelector('[data-proto]');
  function q(s){return r.querySelector(s);} function clica(el,nome){ if(!el){log.push('FALTA '+nome);return;} el.click(); }
  try{
    clica(q('[data-acao="rep"][data-r="10"]'),'rep10');
    log.push('recibo='+(q('.recibo')||{}).textContent);
    log.push('titulo='+(q('.exercicio .nm')||{}).textContent);
    clica(q('[data-acao="rir"][data-r="1"]'),'rir1'); log.push('rir1='+q('[data-acao="rir"][data-r="1"]').getAttribute('aria-pressed'));
    clica(q('[data-acao="dor"]'),'dor'); log.push('dor='+q('[data-acao="dor"]').getAttribute('aria-pressed'));
    clica(q('[data-acao="extra"]'),'extra'); log.push('extra='+(q('.entrada-titulo')||{}).textContent);
    clica(q('[data-acao="carga"]'),'carga'); ['3','7',',','5'].forEach(function(t){clica(q('[data-tecla="'+t+'"]'),'t'+t);}); log.push('visor='+q('[data-visor]').textContent);
    clica(q('[data-tecla="ok"]'),'ok'); log.push('carga='+q('.carga .valor').textContent);
    clica(q('[data-acao="rep"][data-r="9"]'),'rep9'); log.push('recibo2='+q('.recibo').textContent);
    clica(q('[data-acao="trocar"]'),'trocar'); log.push('folha='+(q('.folha-baixo h3')||{}).textContent);
    clica(q('[data-acao="sub"]'),'sub'); log.push('troca='+(q('.exercicio .troca')||{}).textContent+' carga='+q('.carga .valor').textContent);
    clica(q('[data-acao="peso"]'),'peso'); ['7','3',',','8'].forEach(function(t){clica(q('[data-tecla="'+t+'"]'),'p'+t);}); clica(q('[data-tecla="ok"]'),'okp'); log.push('peso='+q('[data-acao="peso"]').textContent);
    clica(q('[data-acao="agua"]'),'agua'); log.push('agua='+q('[data-acao="agua"]').textContent);
    clica(q('[data-acao="corrigir"]'),'corrigir'); log.push('apos corrigir='+(q('.entrada-titulo')||{}).textContent);
    clica(q('[data-acao="treino"]'),'treino'); clica(q('[data-acao="fim"]'),'fim'); log.push('fim='+(q('.aviso')||{}).textContent.slice(0,40));
  }catch(e){ log.push('ERRO '+e.message); }
  var p=document.createElement('pre'); p.id='resultado'; p.textContent=log.join('\n'); document.body.appendChild(p);
});
