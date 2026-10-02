def lum(h):
    h=h.lstrip('#'); r,g,b=[int(h[i:i+2],16)/255 for i in (0,2,4)]
    f=lambda c: c/12.92 if c<=0.03928 else ((c+0.055)/1.055)**2.4
    return 0.2126*f(r)+0.7152*f(g)+0.0722*f(b)
def cr(a,b):
    la,lb=sorted([lum(a),lum(b)],reverse=True); return (la+0.05)/(lb+0.05)
T={'claro':dict(papel='#F4F1EA',folha='#FCFBF7',texto='#1A1C21',texto2='#4B4F58',grafite='#565A62',borda='#7C8088',tinta='#1E3A8A',tintatexto='#1E3A8A',tintafundo='#E2E8F7',botao='#1E3A8A',botaotexto='#FFFFFF',marca='#F4D35E',marcatexto='#2E2600',alerta='#A1361A',alertafundo='#FBE7DF'),
   'escuro':dict(papel='#111317',folha='#1A1D23',texto='#EEEFF1',texto2='#B4B8C0',grafite='#A9AEB7',borda='#767B85',tinta='#3D5BD6',tintatexto='#AFC1FF',tintafundo='#1C2645',botao='#3D5BD6',botaotexto='#FFFFFF',marca='#E2BE3C',marcatexto='#231C00',alerta='#FF9F84',alertafundo='#38190F')}
pares=[('grafite','folha',4.5,'texto a lápis'),('grafite','papel',4.5,'texto a lápis'),('texto2','papel',4.5,'texto secundário'),('tintatexto','tintafundo',4.5,'texto a tinta'),('tintatexto','papel',4.5,'link/botão contorno'),('botaotexto','botao',4.5,'botão cheio'),('alerta','alertafundo',4.5,'erro'),('marcatexto','marca',4.5,'marca agora'),('borda','papel',3,'borda tracejada'),('borda','folha',3,'borda tracejada'),('tinta','papel',3,'quadrado a tinta')]
for t,c in T.items():
    for a,b,m,d in pares:
        r=cr(c[a],c[b]); print(f'{t:6} {d:20} {a}/{b}: {r:5.2f} {"ok" if r>=m else "FALHA"} (mín {m})')
