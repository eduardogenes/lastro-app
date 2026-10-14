# -*- coding: utf-8 -*-
# monta os HTML da terceira entrega a partir de um .txt de estados (mesmo formato da segunda)
import sys, os, re
D=os.path.dirname(os.path.abspath(__file__))
BASE=re.sub(r'letter-spacing:\.0[2-6]em;?','',open(os.path.join(D,'base.css'),encoding='utf-8').read().replace('text-transform:uppercase',''))+open(os.path.join(D,'d3.css'),encoding='utf-8').read()
SPR=open(os.path.join(D,'sprite3.svg'),encoding='utf-8').read()

def sb(hora,sinal):
    if sinal=='sem':
        ic='<span style="font-size:13px;font-weight:700">sem rede</span>'
    else:
        ic=('<svg width="18" height="12"><use href="#sig%s"/></svg>'%('' if sinal=='fraco' else '-c'))
    return ('<div class="sb"><span class="num">%s</span><span class="notch"></span>'
            '<span class="ic">%s<svg width="27" height="12"><use href="#bat"/></svg></span></div>'%(hora,ic))

TABS=[('agora','Agora','t-agora'),('dias','Dias','t-dias'),('corpo','Corpo','t-corpo'),('semana','Semana','t-sem'),('presc','Prescrição','t-presc')]
def tabs(ativo):
    o=''.join('<button class="tab%s"%s><svg><use href="#%s"/></svg>%s</button>'%(' on' if k==ativo else '',' aria-current="page"' if k==ativo else '',ic,nm) for k,nm,ic in TABS)
    return '<div class="tabwrap"><nav class="tabbar five" aria-label="Lugares">%s</nav></div>'%o
def macros(t):
    t=re.sub(r'\{\{tabs ([a-z]+)\}\}', lambda m: tabs(m.group(1)), t)
    t=t.replace('{{hi}}','<div class="hi"><i></i></div>')
    t=re.sub(r'\{\{inc ([a-z0-9-]+)\}\}', lambda m: open(os.path.join(D,'inc',m.group(1)+'.html'),encoding='utf-8').read(), t)
    return t

def build(src,out):
    meta={'leads':[],'css':'','titulo':'','h1':'','eyebrow':'Direção D · terceira entrega','html':''}
    states=[]; cur=None; mode=None
    for raw in open(src,encoding='utf-8').read().split('\n'):
        if mode=='css':
            if raw.strip()=='@fim': mode=None
            else: meta['css']+=raw+'\n'
            continue
        if mode=='html':
            if raw.strip()=='@fim': mode=None
            else: meta['html']+=raw+'\n'
            continue
        if raw.startswith('==='):
            p=[x.strip() for x in raw[3:].split('|')]
            cur={'n':p[0],'cls':p[1],'tit':p[2],'cap':'','sb':('6:58','fraco'),'mk':[]}
            states.append(cur); continue
        if cur is None:
            if raw.startswith('@css'): mode='css'; continue
            if raw.startswith('@html'): mode='html'; continue
            if raw.startswith('@titulo '): meta['titulo']=raw[8:].strip(); continue
            if raw.startswith('@h1 '): meta['h1']=raw[4:].strip(); continue
            if raw.startswith('@eyebrow '): meta['eyebrow']=raw[9:].strip(); continue
            if raw.startswith('@lead '): meta['leads'].append(raw[6:].strip()); continue
            continue
        if raw.startswith('cap: '): cur['cap']+=raw[5:].strip()+' '; continue
        if raw.startswith('@sb '):
            a=raw[4:].split('|'); cur['sb']=(a[0].strip(), a[1].strip() if len(a)>1 else 'fraco'); continue
        cur['mk'].append(raw)
    body=[]
    for s in states:
        mk=macros('\n'.join(s['mk']).strip())
        bar=sb(*s['sb'])
        pair=[]
        for tema,lbl in (('','Claro'),(' dark','Escuro')):
            pair.append('<div><p class="tl">%s</p><div class="wrap"><div class="phone%s">%s\n%s\n</div></div></div>'%(lbl,tema,bar,mk))
        cls='state'+(' '+s['cls'] if s['cls'] else '')
        sid='e'+re.sub(r'[^0-9a-z]','',s['n'].lower())
        body.append('<figure class="%s" id="%s">\n<figcaption><h2><span class="n">%s</span>%s</h2><p class="cap">%s</p></figcaption>\n<div class="pair">%s</div>\n</figure>'%(cls,sid,s['n'],s['tit'],s['cap'].strip(),''.join(pair)))
    leads='\n  '.join('<p class="lead">%s</p>'%l for l in meta['leads'])
    doc=f"""<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{meta['titulo']}</title>
<style>
{BASE}
{meta['css']}</style>
</head>
<body>

{SPR}

<header class="doc">
  <p class="eyebrow">{meta['eyebrow']}</p>
  <h1>{meta['h1']}</h1>
  {leads}
  {meta['html']}
  <p class="lead" style="font-size:14px">Cada estado aparece duas vezes, <b>claro</b> e <b>escuro</b>: o tema segue o aparelho, com troca manual. Viewport de iPhone 11 Pro Max, 414 × 896 pt. Nada aqui usa rede.</p>
</header>

<main class="states">

{chr(10).join(body)}

</main>

<script>
(function(){{
  function fit(){{
    document.querySelectorAll('.wrap').forEach(function(w){{
      var p=w.querySelector('.phone'); if(!p) return;
      var W=414,H=896, s=Math.min(1,w.clientWidth/W);
      p.style.transform='scale('+s+')'; w.style.height=(H*s)+'px';
    }});
  }}
  window.addEventListener('resize',fit); fit();
  document.querySelectorAll('.strip[data-start]').forEach(function(st){{
    var n=st.getAttribute('data-start'), t=null;
    st.querySelectorAll('.rep').forEach(function(r){{ if(!t && r.getAttribute('data-n')===n) t=r; }});
    if(t) st.scrollLeft=t.offsetLeft-st.offsetLeft-(st.clientWidth/2-t.offsetWidth/2);
  }});
}})();
</script>
</body>
</html>
"""
    open(out,'w',encoding='utf-8').write(doc)
    print(out, len(doc), len(states),'estados')

if __name__=='__main__':
    build(sys.argv[1],sys.argv[2])
