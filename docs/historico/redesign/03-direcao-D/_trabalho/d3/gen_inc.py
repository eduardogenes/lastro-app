# -*- coding: utf-8 -*-
import datetime as dt, os
D=os.path.dirname(os.path.abspath(__file__))
WD=['domingo','segunda','terça','quarta','quinta','sexta','sábado']
MES=['','janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro']
def wdn(d): return WD[(d.weekday()+1)%7]

def cell(d,spec,hoje,sel=None):
    lab=[]
    if d>hoje:
        return '<span class="dc fut%s"><span class="dn">%d</span></span>'%(' cmp' if spec=='cmp' else '',d.day)
    cls='dc'
    if d==hoje: cls+=' hoje'
    if sel and d==sel: cls+=' sel'
    inner='<span class="dn">%d</span>'%d.day
    s=spec or {}
    if 'tr' in s:
        two=' two' if ' ' in s['tr'] else ''
        inner+='<span class="tr%s">%s</span>'%(two,s['tr'])
        lab.append(s.get('lab','treino '+s['tr']))
    if 'tw' in s:
        c=' dsc' if s['tw']=='desc.' else ''
        inner+='<span class="tw%s">%s</span>'%(c,s['tw'])
        lab.append({'aula':'aula de HYROX','desc.':'descanso marcado'}.get(s['tw'],s['tw']))
    if 'stk' in s:
        inner+='<span class="stk"><span class="tr">%s</span><span class="tw">%s</span></span>'%tuple(s['stk'])
        lab.append(s.get('lab',''))
    hz=s.get('hz',0)
    if hz==1: inner+='<svg class="hz"><use href="#hz"/></svg>'; lab.append('cardio')
    if hz>1: inner+='<span class="hz2"><svg><use href="#hz"/></svg>%d</span>'%hz; lab.append('%d cardios'%hz)
    fd=s.get('fd')
    if fd=='m': inner+='<i class="fd m"></i>'; lab.append('comida com marca')
    if fd=='s': inner+='<i class="fd s"></i>'; lab.append('comida sem marca')
    if d==hoje: lab.append('hoje: abre o Agora')
    if not lab: lab.append('nada registrado')
    aria='%s, %d de %s: %s'%(wdn(d),d.day,MES[d.month],', '.join(x for x in lab if x))
    return '<button class="%s" aria-label="%s">%s</button>'%(cls,aria,inner)

def cal(y,m,data,hoje,sel=None):
    first=dt.date(y,m,1)
    start=first-dt.timedelta(days=(first.weekday()+1)%7)
    out=['<div class="wds"><span>dom</span><span>seg</span><span>ter</span><span>qua</span><span>qui</span><span>sex</span><span>sáb</span></div>','<div class="cal">']
    d=start
    while True:
        week=[d+dt.timedelta(days=i) for i in range(7)]
        if week[0].month!=m and week[0]>first: break
        allfut=all(x>hoje for x in week if x.month==m)
        for x in week:
            if x.month!=m: out.append('<span class="dc x%s"></span>'%(' cmp' if allfut else ''))
            else: out.append(cell(x,'cmp' if allfut else data.get(x.day),hoje,sel))
        d=week[-1]+dt.timedelta(days=1)
        if d.month!=m: break
    out.append('</div>')
    return '\n'.join(out)

OUT={}
hoje=dt.date(2026,10,13)
OCT={1:{'tr':'D','hz':1,'fd':'m'},2:{'tr':'E','fd':'s'},3:{'tw':'aula','fd':'s'},4:{'hz':1,'fd':'s'},
     5:{'tw':'desc.','fd':'m'},6:{'tr':'A','hz':2,'fd':'m'},7:{'tr':'B','fd':'s'},
     8:{'stk':('C','+fora'),'lab':'treino C e treino fora da prescrição','fd':'s'},
     9:{'tr':'E D','lab':'treino E e treino D','fd':'s'},10:{'tw':'aula','fd':'s'},11:{'fd':'m'},12:{'fd':'s'},13:{'tr':'B'}}
OUT['cal-out']=cal(2026,10,OCT,hoje)
AGO={1:{'fd':'s'},2:{'fd':'s'},3:{'fd':'s'},4:{'fd':'s'},5:{'fd':'s'}}
OUT['cal-ago']=cal(2026,8,AGO,dt.date(2026,8,6))

# média móvel (calendário ilustrativo, ver direcao-3)
T=set(dt.date(2026,9,x) for x in [3,4,5,7,8,10,11,14,15,16,18,19,21,22,24,25,28,29,30])|set(dt.date(2026,10,x) for x in [1,2,3,6,7,8,9,10])
vals=[]
for k in range(1,13):
    day=dt.date(2026,10,k); vals.append(sum(1 for i in range(28) if day-dt.timedelta(days=i) in T)/4)
W,H=210,44; lo,hi=3.0,6.5
def Y(v): return H-(v-lo)/(hi-lo)*H
pts=' '.join('%.1f,%.1f'%(i*(W/11),Y(v)) for i,v in enumerate(vals))
y6=Y(6)
sp=('<svg viewBox="0 0 %d %d" role="img" aria-label="média móvel de 4 semanas, de 4,5 a 5,0 dias por semana em outubro; a prescrição conta 6">'%(W,H)+
    '<line x1="0" y1="%.1f" x2="%d" y2="%.1f" stroke="var(--ink-3)" stroke-width="1.4" stroke-dasharray="4 4"/>'%(y6,W,y6)+
    '<text x="%d" y="%.1f" font-size="11" fill="var(--ink-2)" text-anchor="end">6 na prescrição</text>'%(W,y6-4)+
    '<polyline points="%s" fill="none" stroke="var(--ink)" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/>'%pts+
    '<circle cx="%.1f" cy="%.1f" r="3.6" fill="var(--ink)"/>'%(W,Y(vals[-1]))+
    '<text x="0" y="%d" font-size="11" fill="var(--ink-2)">01/10</text><text x="%d" y="%d" font-size="11" fill="var(--ink-2)" text-anchor="end">12/10</text>'%(H+13,W,H+13)+
    '</svg>')
OUT['spark']=sp
print([round(v,2) for v in vals])

# eixo do horário de início
ses=[(6,15,'qui 01/10'),(6,8,'sex 02/10'),(6,20,'ter 06/10'),(18,15,'qua 07/10'),(6,5,'qui 08/10'),(6,12,'sex 09/10'),(6,14,'sex 09/10')]
mins=[a*60+b for a,b,_ in ses]; mean=sum(mins)/len(mins)
AW=380; a0,a1=300,1260
def X(mm): return 6+(mm-a0)/(a1-a0)*(AW-12)
ax=['<svg viewBox="0 0 %d 40" role="img" aria-label="sete inícios: seis entre 6h05 e 6h20, um às 18h15; média 7h56">'%AW,
    '<line x1="6" y1="18" x2="%d" y2="18" stroke="var(--line-2)" stroke-width="1.5"/>'%(AW-6)]
for h in (6,9,12,15,18,21):
    x=X(h*60); ax.append('<line x1="%.1f" y1="15" x2="%.1f" y2="21" stroke="var(--line-2)" stroke-width="1.5"/><text x="%.1f" y="36" font-size="11" fill="var(--ink-2)" text-anchor="middle">%dh</text>'%(x,x,x,h))
for mm in mins:
    ax.append('<circle cx="%.1f" cy="18" r="4.6" fill="var(--ink)" fill-opacity=".55"/>'%X(mm))
xm=X(mean)
ax.append('<path d="M%.1f 8 l-5 -7 h10 z" fill="var(--accent)"/>'%xm)
ax.append('<text x="%.1f" y="8" font-size="11" fill="var(--accent-ink)" font-weight="700">média 7h56</text>'%(xm+8))
ax.append('</svg>')
OUT['eixo']=''.join(ax)
print('media',int(mean)//60,round(mean%60,1))
for k,v in OUT.items():
    open(os.path.join(D,'inc',k+'.html'),'w',encoding='utf-8').write(v)
print(sorted(OUT))
