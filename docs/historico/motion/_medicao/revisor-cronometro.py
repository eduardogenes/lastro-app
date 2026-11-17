"""Onde está o cronômetro em cada quadro de uma troca (fluxo 17, peça 6).

Na troca de camada, o que anda são as fotos da View Transition: o DOM não diz
onde o cronômetro está na tela. Aqui se lê nos quadros do screencast, que o
`revisor-gravar.mjs` guarda com QUADROS=1: a barra azul do descanso (`#tfill`,
uma linha fina de ~3 px) procurada nas colunas x 90–200, na faixa de baixo da
tela (y 740–896, CSS px). Fica a altura média das linhas azuis, por quadro, no
tempo do passo (o mesmo zero das tiras: `linhaDoTempo`).

    $PYTHON docs/motion/_medicao/revisor-cronometro.py <medidas-<rodada>.json> <pasta _quadros/<fluxo>-<rodada>>

Escreve, ao lado das medidas, `cronometro-<rodada>.json`: por passo, a trilha
[t, y] de −50 a +600 ms, o y de antes e do fim, o maior passo entre dois quadros
seguidos, quantas alturas diferentes houve e em quantos quadros a barra mudou de
altura.
"""
import json
import os
import sys

import numpy as np
from PIL import Image


def altura(arq):
    im = np.asarray(Image.open(arq).convert('RGB').resize((414, 896)), dtype=np.int16)
    faixa = im[740:896, 90:200]
    r, g, b = faixa[..., 0], faixa[..., 1], faixa[..., 2]
    azul = (b > 150) & (r < 130) & (g < 130) & (b - r > 70)
    linhas = np.where(azul.sum(axis=1) > 40)[0]
    if len(linhas) == 0 or len(linhas) > 8:   # nada, ou algo grande (um botão), não a linha
        return None
    return round(740 + float(linhas.mean()), 1)


def main(arq_man, pasta):
    man = json.load(open(arq_man))
    out = {'fluxo': man['fluxo'], 'rotulo': man['rotulo'], 'passos': []}
    for i, ps in enumerate(man['passos']):
        d = os.path.join(pasta, '%02d-%s' % (i + 1, ps['id']))
        lt = ps.get('linhaDoTempo') or []
        if not os.path.isdir(d) or not lt:
            continue
        trilha = []
        for j, x in enumerate(lt):
            arq = os.path.join(d, '%03d.jpg' % j)
            if os.path.exists(arq) and -50 <= x[0] <= 600:
                trilha.append([x[0], altura(arq)])
        ys = [y for _, y in trilha if y is not None]
        passos = [abs(trilha[k][1] - trilha[k - 1][1]) for k in range(1, len(trilha))
                  if trilha[k][1] is not None and trilha[k - 1][1] is not None]
        out['passos'].append({
            'id': ps['id'], 'trilha': trilha,
            'yAntes': next((y for t, y in trilha if y is not None), None),
            'yFim': next((y for t, y in reversed(trilha) if y is not None), None),
            'maiorPassoPorQuadro': round(max(passos), 1) if passos else None,
            'alturasDiferentes': len(set(round(y) for y in ys)),
            'quadrosQueMudamDeAltura': sum(1 for p in passos if p >= 1),
        })
    saida = os.path.join(os.path.dirname(arq_man), 'cronometro-%s.json' % man['rotulo'])
    json.dump(out, open(saida, 'w'), indent=1)
    for p in out['passos']:
        print(man['rotulo'], p['id'], p['yAntes'], '→', p['yFim'], 'maior passo', p['maiorPassoPorQuadro'],
              'alturas', p['alturasDiferentes'], 'quadros que mudam', p['quadrosQueMudamDeAltura'])
    print('gravado em', saida)


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
