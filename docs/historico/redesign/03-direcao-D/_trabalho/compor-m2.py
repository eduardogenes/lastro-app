import re,io
base='/home/infraestrutura-imts/workspace/personal/lastro-app/docs/redesign/03-direcao-D/'
m1=open(base+'momento-1.html',encoding='utf-8').read()
tpl=open(base+'_trabalho/m2-modelo.html',encoding='utf-8').read()
css=re.search(r'<style>\n(.*?)</style>',m1,re.S).group(1)
sprite=re.search(r'(<svg width="0" height="0".*?</svg>)',m1,re.S).group(1)
tpl=tpl.replace('<span class="st">128 kcal</span>','<span class="st">163 kcal</span>')
out=tpl.replace('/*__CSS_COMUM__*/',css.rstrip()).replace('<!--__SPRITE__-->',sprite)
assert '__CSS_COMUM__' not in out and '__SPRITE__' not in out
open(base+'momento-2.html','w',encoding='utf-8').write(out)
print(len(out))
