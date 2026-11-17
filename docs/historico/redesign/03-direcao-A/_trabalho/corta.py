import sys
from PIL import Image
src,pref,step=sys.argv[1],sys.argv[2],int(sys.argv[3])
im=Image.open(src); w,h=im.size
for i in range(0,h,step):
    im.crop((0,i,w,min(h,i+step))).save(f'{pref}-{i//step}.png')
print(im.size)
