# corta a captura em pedaços legíveis: acha as figuras pela posição via um mapa simples de altura
import sys
from PIL import Image
im=Image.open(sys.argv[1]); W,H=im.size
pref=sys.argv[2]; step=int(sys.argv[3]) if len(sys.argv)>3 else 1100
y=0;i=0
while y<H:
    c=im.crop((0,y,W,min(H,y+step))); c.save('%s-%02d.png'%(pref,i)); y+=step; i+=1
print(i,'pedaços',W,H)
