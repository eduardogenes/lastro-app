# Monta momento-2.html: a folha de estilo comum vem do momento-1.html.
import re, pathlib
base = pathlib.Path(__file__).resolve().parent.parent
m1 = (base/'momento-1.html').read_text(encoding='utf-8')
css = re.search(r'<style>\n(.*?)</style>', m1, re.S).group(1)
corpo = (base/'_trabalho'/'m2-corpo.html').read_text(encoding='utf-8')
assert corpo.count('/*CSS-COMUM*/') == 1
(base/'momento-2.html').write_text(corpo.replace('/*CSS-COMUM*/\n', css), encoding='utf-8')
print('momento-2.html', len((base/'momento-2.html').read_bytes()), 'bytes')
