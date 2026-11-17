# -*- coding: utf-8 -*-
import sys, os, re, html
D=os.path.dirname(os.path.abspath(__file__))
BASE=open(os.path.join(D,'base.css'),encoding='utf-8').read()
SPR=open(os.path.join(D,'sprite2.svg'),encoding='utf-8').read()
SIG={'cheio':'1','fraco':'.28','sem':'0'}

def sb(hora,sinal):
    if sinal=='sem':
        ic='<span style="font-size:13px;font-weight:700">sem rede</span>'
    else:
        op = '' if sinal=='cheio' else ' data-f="1"'
        ic=('<svg width="18" height="12"><use href="#sig%s"/></svg>'%('' if sinal=='fraco' else '-c'))
    return ('<div class="sb"><span class="num">%s</span><span class="notch"></span>'
            '<span class="ic">%s<svg width="27" height="12"><use href="#bat"/></svg></span></div>'%(hora,ic))


TABS=[('agora','Agora','t-agora'),('dias','Dias','t-dias'),('corpo','Corpo','t-corpo'),('semana','Semana','t-sem'),('presc','Prescrição','t-presc')]
def tabs(ativo):
    o=''.join('<button class="tab%s"><svg><use href="#%s"/></svg>%s</button>'%(' on' if k==ativo else '',ic,nm) for k,nm,ic in TABS)
    return '<div class="tabwrap"><div class="tabbar five">%s</div></div>'%o
def macros(t):
    t=re.sub(r'\{\{tabs ([a-z]+)\}\}', lambda m: tabs(m.group(1)), t)
    t=t.replace('{{hi}}','<div class="hi"><i></i></div>')
    return t

def build(src,out):
    meta={'leads':[],'css':'','titulo':'','h1':'','eyebrow':'Direção D · O previsto já está escrito','idx':''}
    states=[]; cur=None; mode=None
    for raw in open(src,encoding='utf-8').read().split('\n'):
        if mode=='css':
            if raw.strip()=='@fim': mode=None
            else: meta['css']+=raw+'\n'
            continue
        if raw.startswith('==='):
            p=[x.strip() for x in raw[3:].split('|')]
            cur={'n':p[0],'cls':p[1],'tit':p[2],'cap':'','sb':('6:58','fraco'),'mk':[]}
            states.append(cur); continue
        if raw.startswith('@css'): mode='css'; continue
        if raw.startswith('@titulo '): meta['titulo']=raw[8:].strip(); continue
        if raw.startswith('@h1 '): meta['h1']=raw[4:].strip(); continue
        if raw.startswith('@eyebrow '): meta['eyebrow']=raw[9:].strip(); continue
        if raw.startswith('@idx '): meta['idx']=raw[5:].strip(); continue
        if raw.startswith('@lead '): meta['leads'].append(raw[6:].strip()); continue
        if cur is None: continue
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
        body.append('<figure class="%s">\n<figcaption><h2><span class="n">%s</span>%s</h2><p class="cap">%s</p></figcaption>\n<div class="pair">%s</div>\n</figure>'%(cls,s['n'],s['tit'],s['cap'].strip(),''.join(pair)))
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
  <p class="lead" style="font-size:14px">Cada estado aparece duas vezes: <b>claro</b> e <b>escuro</b>. O tema segue o aparelho, com troca manual; as fotos do corpo não mudam de tema, porque foto não inverte. Viewport de iPhone 11 Pro Max, 414 × 896 pt.</p>
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
  /* cortina: arrastar para trocar entre a foto antiga e a nova */
  document.querySelectorAll('.cort[data-drag]').forEach(function(c){{
    function set(x){{
      var r=c.getBoundingClientRect(), p=Math.max(6,Math.min(94,(x-r.left)/r.width*100));
      c.querySelector('.lay.nova').style.clipPath='inset(0 0 0 '+p+'%)';
      c.querySelector('.hd').style.left=p+'%';
    }}
    var on=false;
    c.addEventListener('pointerdown',function(e){{on=true;set(e.clientX);c.setPointerCapture(e.pointerId);}});
    c.addEventListener('pointermove',function(e){{if(on)set(e.clientX);}});
    c.addEventListener('pointerup',function(){{on=false;}});
    c.addEventListener('pointercancel',function(){{on=false;}});
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
