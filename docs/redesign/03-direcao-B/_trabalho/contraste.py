"""Contraste da paleta final (base.css), nos dois temas. Texto >= 4.5:1; borda de controle >= 3:1."""
def lum(h):
    h=h.lstrip('#'); r,g,b=[int(h[i:i+2],16)/255 for i in (0,2,4)]
    f=lambda c: c/12.92 if c<=0.03928 else ((c+0.055)/1.055)**2.4
    return 0.2126*f(r)+0.7152*f(g)+0.0722*f(b)
def cr(a,b):
    la,lb=sorted([lum(a),lum(b)],reverse=True); return (la+0.05)/(lb+0.05)
TEMAS={
 'claro':dict(fundo='#E6E1D7',papel='#F3EFE7',folha='#FBF9F4',grafite='#22201C',prescrito='#625C53',borda='#857E72',tinta='#1D4ED0',
              tinta_fundo='#E4EAFB',sobre_tinta='#FFFFFF',alerta='#8A4B00',alerta_fundo='#FBEBD3',erro='#A8231B',erro_fundo='#FBE3E0',teclado='#E4DED3'),
 'escuro':dict(fundo='#0B0A08',papel='#12110E',folha='#1C1A16',grafite='#EFEAE1',prescrito='#A69F93',borda='#7A7366',tinta='#8FB0FF',
              tinta_fundo='#1B2645',sobre_tinta='#0E0D0B',alerta='#F2B45A',alerta_fundo='#33260F',erro='#FF8F86',erro_fundo='#3A1715',teclado='#24221D'),
}
TEXTO=[(fg,bg) for fg in ('grafite','prescrito','tinta') for bg in ('fundo','papel','folha','tinta_fundo')]+\
      [('grafite','teclado'),('tinta','teclado'),('sobre_tinta','tinta'),('alerta','alerta_fundo'),('grafite','alerta_fundo'),
       ('erro','erro_fundo'),('grafite','erro_fundo'),('erro','papel'),('erro','folha')]
BORDA=[('borda','papel'),('borda','folha'),('tinta','papel'),('tinta','folha')]
falhas=0
for nome,p in TEMAS.items():
    print(nome)
    for (fg,bg),minimo in [(x,4.5) for x in TEXTO]+[(x,3.0) for x in BORDA]:
        v=cr(p[fg],p[bg]); ok=v>=minimo; falhas+= not ok
        print(f"  {fg:12} sobre {bg:13} {v:5.2f}  {'ok' if ok else 'FALHA'} (mín. {minimo})")
print('falhas:',falhas)
