/* protótipo tocável do estado 1 — só roda no navegador */
(function(){
  var raiz=document.querySelector('[data-proto]');
  if(!raiz) return;
  var vivo=document.getElementById('anuncio');
  var base=Date.now(), st0=treinoA(), st=clone(st0), modal=null, buf='', erroTec='', subAlvo=null;
  function agoraMock(){ return st0.agora+(Date.now()-base)/1000; }
  function anunciar(t){ if(vivo){ vivo.textContent=''; setTimeout(function(){ vivo.textContent=t; },30); } }

  function folhaTroca(){
    var i=st.cur.e, e=st.ex[i];
    var li='<li><button data-acao="depois"><span class="t">Fazer outro antes e voltar a este</span><span class="s">a máquina pode liberar; nada muda no programa</span><span class="seta">›</span></button></li>';
    e.subs.forEach(function(s){
      li+='<li><button data-acao="sub" data-nome="'+s[0]+'"><span class="t">'+s[0]+(s[1]?'<i class="selo-tr">treinador</i>':'')+'</span><span class="s">nunca feito aqui · sem foto da máquina</span><span class="seta">›</span></button></li>';
    });
    return '<div class="veu" data-acao="fechar"></div><div class="folha-baixo" role="dialog" aria-label="Trocar exercício" style="max-height:78%">'+
      '<div class="alca"></div><h3 style="margin:0 0 2px;font-size:20px">Trocar '+e.n+'</h3>'+
      '<p style="margin:0 0 8px;font-size:14px;color:var(--prescrito)">Só hoje. O histórico vai para o exercício que você fizer (F151).</p>'+
      '<ul class="troca-lista">'+li+'</ul><button class="link" data-acao="fechar" style="align-self:center">Cancelar</button><div class="sis-base"><i></i></div></div>';
  }
  function folhaLista(titulo,itens){
    return '<div class="veu" data-acao="fechar"></div><div class="folha-baixo" role="dialog" aria-label="'+titulo+'">'+
      '<div class="alca"></div><h3 style="margin:0 0 6px;font-size:20px">'+titulo+'</h3><ul class="troca-lista">'+
      itens.map(function(x){ return '<li><button data-acao="'+(x[2]||'fechar')+'"'+(x[3]?' data-l="'+x[3]+'"':'')+'><span class="t">'+x[0]+'</span><span class="s">'+x[1]+'</span><span class="seta">›</span></button></li>'; }).join('')+
      '</ul><button class="link" data-acao="fechar" style="align-self:center">Fechar</button><div class="sis-base"><i></i></div></div>';
  }
  function render(){
    st.agora=agoraMock();
    if(!st.cur){
      raiz.innerHTML=statusBar(st)+'<div class="conteudo">'+cabecalho(st)+trilho({ex:st.ex,hoje:st.hoje,extras:st.extras,pulados:st.pulados,troca:st.troca,letra:st.letra,cur:null})+
        '<div class="aviso neutro" style="margin-top:8px">'+ic('i-check')+'<div><p><strong>Tudo registrado.</strong> Pode sair: a sessão fecha sozinha na última série se você não tocar em nada.</p><p>As mudanças do dia esperam na mesa; ninguém pergunta nada agora.</p></div></div>'+
        '<div style="margin-top:auto;display:grid;gap:8px;padding-bottom:8px"><button class="botao-tinta" data-acao="reinicia">Terminar a sessão</button><button class="botao-sec" data-acao="reinicia">Recomeçar o protótipo</button></div></div><div class="sis-base"><i></i></div>';
      return;
    }
    var o={};
    var rot={carga:'Carga · '+nomeCurto(nomeEx(st,st.cur.e)),peso:'Peso de hoje',reps:'Repetições'}[modal];
    if(rot) o.overlay='<div class="veu" data-tecla="cancela"></div>'+teclado(rot,buf, erroTec || (modal==='peso'?'Uma casa decimal. A data é hoje; outra data, na mesa.':modal==='reps'?'Número inteiro.':'Teclado do próprio app: vírgula no lugar, sem zoom, não empurra a tela.'));
    if(modal==='trocar') o.overlay=folhaTroca();
    if(modal==='mais') o.overlay=folhaLista('Mais sobre este exercício',[['Orientação do treinador','na voz dele (F93)'],['Pegada ou posição do pé','onde existe (F113)'],['Observação','texto livre do registro'],['Fiz aproximação','não conta como série (F103)'],['Foto da máquina','para achar o aparelho certo (F224)']]);
    if(modal==='treino') o.overlay=folhaLista('Treino '+st.letra,[['Terminar a sessão agora','sem perguntas; o resto vai para a mesa','fim'],['Estou no treino errado','trocar para B, C, D ou E; as séries feitas ficam com os exercícios delas'],['Apagar esta sessão','pede confirmação']]);
    raiz.innerHTML=instrumento(st,o);
    if(modal==='trocar'||modal==='mais'||modal==='treino'){ var f=raiz.querySelector('.folha-baixo button'); if(f) f.focus(); }
  }
  function abrir(m){ modal=m; erroTec=''; buf = m==='carga' ? '' : ''; render(); }
  function fechar(){ modal=null; buf=''; erroTec=''; render(); }
  function cargaGuia(){ var i=st.cur.e,k=st.cur.s, ant=k>0?st.hoje[i][k-1]:null, ref=refDe(st,i,k); return st.carga!=null?st.carga:(ant?ant[0]:ref?ref[0]:null); }
  function gravar(r){
    var i=st.cur.e,k=st.cur.s, c=cargaGuia();
    if(c==null){ abrir('carga'); return; }
    st.hoje[i][k]=[c,r,null]; st.last={e:i,s:k,t:agoraMock()}; st.carga=null;
    var prox=null; for(var j=k+1;j<nSer(st,i);j++){ if(!st.hoje[i][j]){ prox={e:i,s:j}; break; } }
    st.cur=prox||proxima(st);
    anunciar('Gravada: série '+(k+1)+' de '+nomeEx(st,i)+', '+fmt(c)+' quilos, '+r+' repetições.');
    render();
    var b=raiz.querySelector('.recibo'); if(b){ b.animate && b.animate([{opacity:0,transform:'translateY(6px)'},{opacity:1,transform:'none'}],{duration:180,easing:'ease-out'}); }
  }
  function tecla(t){
    if(t==='cancela'){ fechar(); return; }
    if(t==='ok'){
      var v=parseFloat(buf.replace(',','.'));
      if(modal==='carga'){ if(!(v>=0&&v<=500)||/,\d{3}/.test(buf)){ erroTec='Carga fora do esperado (0 a 500, até duas casas).'; render(); return; } st.carga=v; modal=null; anunciar('Carga: '+fmt(v)+' quilos'); render(); return; }
      if(modal==='peso'){ if(!(v>=30&&v<=250)||/,\d{2}/.test(buf)){ erroTec='Peso fora do esperado (uma casa decimal).'; render(); return; } st.peso=v; modal=null; anunciar('Peso de hoje gravado: '+fmt(v)+' quilos'); render(); return; }
      if(modal==='reps'){ v=parseInt(buf,10); if(!(v>=1&&v<=200)){ erroTec='Repetições: número inteiro de 1 a 200.'; render(); return; } modal=null; gravar(v); return; }
    }
    if(t==='⌫'){ buf=buf.slice(0,-1); }
    else if(t===','){ if(modal==='reps') return; if(buf.indexOf(',')<0) buf=(buf||'0')+','; }
    else if(buf.length<6){ buf+=t; }
    erroTec=''; var vis=raiz.querySelector('[data-visor]'); if(vis) vis.textContent=buf; var n=raiz.querySelector('.nota-tec'); if(n && n.dataset.e) n.textContent='';
  }
  raiz.addEventListener('click',function(ev){
    var b=ev.target.closest('[data-acao],[data-tecla]'); if(!b||!raiz.contains(b)) return;
    var t=b.getAttribute('data-tecla'); if(t){ tecla(t); return; }
    var a=b.getAttribute('data-acao'), i=st.cur?st.cur.e:null;
    switch(a){
      case 'rep': b.classList.add('tocado'); gravar(+b.getAttribute('data-r')); return;
      case 'outro': abrir('reps'); return;
      case 'carga': abrir('carga'); return;
      case 'peso': abrir('peso'); return;
      case 'agua': st.agua=Math.min(14,st.agua+1); anunciar('Água: '+st.agua+' copos de 14'); break;
      case 'rir': var L=st.last, v=st.hoje[L.e][L.s], r=+b.getAttribute('data-r'); v[2]=(v[2]===r?null:r); anunciar(v[2]==null?'RIR apagado':'RIR '+r+' na série '+(L.s+1)); break;
      case 'dor': var p=b.getAttribute('data-p'), d=st.dor[st.last.e]||(st.dor[st.last.e]=[]), ix=d.indexOf(p); if(ix>=0) d.splice(ix,1); else d.push(p); anunciar((ix>=0?'Desmarcado: ':'Marcado: ')+p); break;
      case 'corrigir': var L2=st.last; st.hoje[L2.e][L2.s]=null; st.cur={e:L2.e,s:L2.s}; st.last=null;
        for(var e=0;e<st.hoje.length;e++){ for(var k=0;k<st.hoje[e].length;k++){ } } anunciar('Série apagada; toque de novo para gravar.'); break;
      case 'extra': var e2=+b.getAttribute('data-e'); st.extras[e2]=(st.extras[e2]||0)+1; st.cur={e:e2,s:nSer(st,e2)-1}; anunciar('Série extra aberta'); break;
      case 'extra-aqui': st.extras[i]=(st.extras[i]||0)+1; anunciar('Mais uma série hoje neste exercício'); break;
      case 'desiste': st.extras[i]=Math.max(0,(st.extras[i]||0)-1); st.hoje[i]=st.hoje[i].slice(0,nSer(st,i)); st.cur=proxima(st); break;
      case 'pular': st.pulados.push(i); st.cur=proxima(st); anunciar('Exercício pulado'); break;
      case 'ir': var e3=+b.getAttribute('data-e'); if(st.pulados.indexOf(e3)>=0) st.pulados.splice(st.pulados.indexOf(e3),1);
        for(var k3=0;k3<nSer(st,e3);k3++){ if(!st.hoje[e3][k3]){ st.cur={e:e3,s:k3}; break; } } break;
      case 'trocar': abrir('trocar'); return;
      case 'mais': abrir('mais'); return;
      case 'treino': abrir('treino'); return;
      case 'fim': modal=null; st.cur=null; break;
      case 'depois': modal=null; var at=st.cur.e; for(var j=1;j<st.ex.length;j++){ var c=(at+j)%st.ex.length; if(st.pulados.indexOf(c)<0 && st.hoje[c].filter(Boolean).length<nSer(st,c)){ for(var k4=0;k4<nSer(st,c);k4++){ if(!st.hoje[c][k4]){ st.cur={e:c,s:k4}; break; } } break; } } anunciar('Fazendo outro antes; volte pelo trilho'); break;
      case 'sub': st.troca[i]=b.getAttribute('data-nome'); st.carga=null; modal=null; anunciar('Hoje: '+st.troca[i]+'. Sem referência; anote a carga.'); break;
      case 'fechar': modal=null; break;
      case 'reinicia': st=clone(st0); base=Date.now(); modal=null; break;
    }
    render();
  });
  function tick(){
    if(!st.cur||modal) return;
    st.agora=agoraMock();
    var r=raiz.querySelector('[data-relogio]'), br=raiz.querySelector('[data-barra]'), lb=raiz.querySelector('[data-lembrete]'), hs=raiz.querySelector('.sis-topo .tab');
    if(st.last){ var dec=st.agora-st.last.t, alvo=st.ex[st.last.e].d;
      if(r) r.textContent=mmss(dec); if(br) br.style.width=(Math.min(1,dec/alvo)*100).toFixed(1)+'%';
      if(lb) lb.textContent='lembrete '+mmss(alvo)+(dec>alvo?' · passou '+mmss(dec-alvo):''); }
    if(hs) hs.textContent=hhmm(st.agora);
  }
  setInterval(tick,1000);
  document.addEventListener('visibilitychange',tick);
  render();
})();
