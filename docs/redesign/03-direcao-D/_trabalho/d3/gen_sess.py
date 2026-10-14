# -*- coding: utf-8 -*-
import os
D=os.path.dirname(os.path.abspath(__file__))
EX=[("Chest press inclinado convergente","3 × 6–10 · RIR 1–2",55,[(10,2),(9,1),(8,1)]),
    ("Pulldown convergente","3 × 6–10 · RIR 1–2",75,[(9,2),(8,1),(8,None)]),
    ("Crucifixo inclinado no cabo","2 × 10–15 · RIR 1",12,[(13,1),(12,None)]),
    ("Pulldown unilateral","2 × 8–12 · RIR 1",45,[(10,1),(10,1)]),
    ("Elevação lateral na máquina","3 × 10–15 · RIR 1",25,[(14,1),(13,1),(12,None)]),
    ("Elevação lateral unilateral no cabo","3 × 12–20 · RIR 0–1",7,[(16,1),(15,0),(14,0)]),
    ("Extensão de tríceps acima da cabeça no cabo","2 × 8–12 · RIR 1",20,[(11,1),(10,None)]),
    ("Pushdown","2 × 10–15 · RIR 0–1",30,None)]
def sv(kg,r,rir,on=False):
    return '<button class="sv%s">%s × %d%s</button>'%(' on' if on else '',kg,r,'<small>RIR %d</small>'%rir if rir is not None else '<small>&nbsp;</small>')
def build(mode):
    o=['<ul class="exs">']
    for i,(n,p,kg,ss) in enumerate(EX):
        o.append('<li><div class="exr"><span class="nm">%s<small>%s</small></span><span class="ss">'%(n,p))
        if ss is None:
            o.append('<button class="sv nf">não feito</button><button class="sv nf">não feito</button>')
        else:
            for j,(r,rir) in enumerate(ss):
                on=(mode!='ver' and i==1 and j==2)
                rr=r
                if on and mode=='ok': rr=9
                o.append(sv(kg,rr,rir,on))
        o.append('</span></div>')
        if mode!='ver' and i==1:
            o.append('<div class="edit"><div class="eh"><span style="flex:1"><b>Série 3</b> · guardada às 6h44</span><button class="load" style="min-height:44px;font-size:19px">75<span>kg</span></button></div>')
            o.append('<p class="range">repetições · faixa 6–10</p><div class="strip" data-start="8">')
            for r in range(5,13):
                c='rep'
                inner=str(r)
                if mode=='ok':
                    if r==9: c+=' hit'; inner+='<small style="color:inherit">agora</small>'
                    if r==8: c+=' was'; inner+='<small>era</small>'
                else:
                    if r==8: c+=' hit'; inner+='<small style="color:inherit">guardada</small>'
                    if r==9: c+=' was'; inner+='<small>tocado</small>'
                if 6<=r<=10: c+=' in'
                o.append('<button class="%s" data-n="%d">%s</button>'%(c,r,inner))
            o.append('</div>')
            if mode=='ok':
                o.append('<div class="ok"><svg><use href="#s-full"/></svg><span>Gravado às 21h16: <b>75 × 9</b>. A série continua às 6h44, e o descanso de depois não muda.</span></div>')
            else:
                o.append('<div class="err inl"><div class="wh"><svg width="20" height="20"><use href="#warn"/></svg><div><b>O 9 não foi gravado</b><p>O armazenamento deste aparelho está cheio. A série continua <b style="display:inline;font-size:inherit;margin:0">75 × 8</b>, que é o que está guardado.</p></div></div><div class="btns2"><button>Tentar de novo</button><button>Baixar a cópia de segurança</button></div></div>')
            o.append('<div style="display:flex;justify-content:space-between;margin-top:2px"><button class="lk">RIR: nenhum · marcar</button><button class="lk dn">Apagar esta série</button></div></div>')
        o.append('</li>')
    o.append('</ul>')
    return ''.join(o)
for m,f in (('ver','sess-a'),('ok','sess-a-ok'),('err','sess-a-err')):
    open(os.path.join(D,'inc',f+'.html'),'w',encoding='utf-8').write(build(m))
print('ok')
