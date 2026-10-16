#!/usr/bin/env python3
"""Tiras de quadros e medidas quadro a quadro do Revisor (docs/motion/07-revisao-base.md).

Chamado por revisor-comum.mjs depois de cada fluxo; também roda à mão:

    python3 docs/motion/_medicao/revisor-tiras.py tiras <medidas-ROTULO.json>
    python3 docs/motion/_medicao/revisor-tiras.py par <tira-antes.png> <tira-depois.png> <saida.png> "antes · a22b09d" "depois · <commit>"
    python3 docs/motion/_medicao/revisor-tiras.py faixa <tira.png> antes +50 0 60

`tiras` lê o manifesto que o .mjs escreveu (cada passo com os quadros da
janela, já com o tempo relativo ao instante zero do passo) e, para cada passo:

  * monta a TIRA: antes do dedo · dedo pousado · +50 · +100 · +150 · +250 · +400 ·
    +800 ms depois do instante zero (o `click`, que é quando o app age; nos passos
    sem dedo, o Voltar ou o instante esperado). Em cada instante entra o último
    quadro entregue até ali — a captura só manda quadro quando algo muda. Embaixo
    de cada quadro, o tempo real dele;
  * mede, quadro a quadro, a fração da tela que mudou em relação ao quadro
    anterior (pixel que mudou mais de 24 níveis de cinza, em meia resolução):
      - primeiraMudancaMs: o primeiro quadro depois do zero que muda mais que o
        limiar (o "toque nunca espera", visto na tela);
      - mudancaNoPousarMs: se algo mudou ENQUANTO o dedo estava pousado (o
        "afundar" do depois);
      - quadrosQueMudam / ultimaMudancaMs: quantos quadros carregam a mudança e
        até quando (1 quadro = a tela troca de uma vez, o "salto");
      - transitorios: quadros que aparecem e somem (o quadro i difere dos dois
        vizinhos, e os vizinhos são iguais entre si) — o "pisca";
      - mudancaTotal: quanto da tela é diferente entre o antes e o fim.
      - quadrosComQualquerMudanca / ultimaQualquerMudancaMs / mudancasFinas: a
        mesma conta em resolução cheia, a 4 níveis de cinza, a partir de 6
        pixels, sem os pixels que já mudavam sozinhos antes do dedo — pega o que
        é pequeno (o indicador de aba andando, um dígito, o :active de hoje) e
        diz a caixa do que mudou, em CSS px;
      - mudancaNoPousarMs: a mesma medida fina com o dedo ainda pousado;
      - maiorIntervaloNoMovimentoMs: o maior intervalo entre quadros entregues
        do primeiro ao último quadro que muda (60 fps = 16,7 ms);
      - lacunasDaCaptura: buracos de mais de 100 ms entre quadros enquanto havia
        animação viva na tela (a captura deveria mandar ~1 quadro a cada 16 ms).
        O quadro da tira que cai numa lacuna sai marcado em vermelho: ele é o
        último que a captura entregou, não o que a tela mostrava;
      - capturaAtrasadaMs: quanto o primeiro quadro que muda veio depois do que o
        motor diz ter apresentado (Event Timing), quando passa de 50 ms.
O limiar é 0,3 % da tela ou três vezes o ruído medido antes do dedo (o pulso do
ponto ao vivo e o relógio da sessão mudam sozinhos), o que for maior. "Depois do
zero" começa em −folga, a variação da latência medida na calibração (Chromium
~5 ms, WebKit ~20 ms): um quadro nessa faixa pode ser a resposta ao toque.
"""
import json
import os
import shutil
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFont

INSTANTES = [('antes', None), ('dedo', 0), ('+50', 50), ('+100', 100), ('+150', 150),
             ('+250', 250), ('+400', 400), ('+800', 800)]
LARG = 276  # largura de cada quadro na tira (2/3 de 414)
FONTE = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
FONTE_N = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'


def fonte(tam, negrito=False):
    try:
        return ImageFont.truetype(FONTE_N if negrito else FONTE, tam)
    except OSError:
        return ImageFont.load_default()


def cinza(arq, larg=207):
    im = Image.open(arq).convert('L')
    if im.width != larg:
        im = im.resize((larg, int(larg * im.height / im.width)), Image.BILINEAR)
    return np.asarray(im, dtype=np.int16)


def frac(a, b):
    if a.shape != b.shape:
        return 1.0
    return float((np.abs(a - b) > 24).mean())


def escolhe(quadros, t):
    """O último quadro entregue até o instante t (ms)."""
    melhor = None
    for i, q in enumerate(quadros):
        if q['t'] <= t:
            melhor = i
    return melhor


def tiras(arq_man):
    man = json.load(open(arq_man))
    # A folga em volta do zero: a latência da captura varia (WebKit 24–44 ms,
    # Chromium 3–6 ms); o desconto pela mediana deixa um erro do tamanho dessa
    # variação. Um quadro a menos de `folga` antes do zero pode ser a resposta.
    lat = (man.get('calibracao') or {}).get('latencias') or [0]
    folga = max(5, max(lat) - min(lat))
    man['folgaDoZeroMs'] = folga
    for ps in man['passos']:
        qs = ps.get('quadros')
        if not qs:
            continue
        g = [cinza(q['arq']) for q in qs]
        gf = [cinza(q['arq'], 414) for q in qs]  # resolução cheia de CSS px, para o que é pequeno
        ts = [q['t'] for q in qs]
        d = [None] + [frac(g[i - 1], g[i]) for i in range(1, len(g))]
        pousa = ps.get('pousaRel')
        ini = pousa if pousa is not None else 0
        # ruído: mudanças entre quadros antes do dedo
        ruido = [d[i] for i in range(1, len(g)) if ts[i] < ini - folga]
        ruido_med = float(np.median(ruido)) if ruido else 0.0
        lim = max(0.003, 3 * ruido_med)
        muda = [(ts[i], d[i]) for i in range(1, len(g)) if d[i] is not None and d[i] > lim]
        depois = [x for x in muda if -folga < x[0] <= 800]
        # A medida FINA: resolução cheia, 4 níveis de cinza por pixel (o :active
        # de hoje muda uns 6), sem os pixels que já mudavam sozinhos antes do
        # dedo (o pulso, a barra do descanso), dilatados 3 px; conta a partir de
        # 6 pixels. Cada mudança fina leva a caixa do que mudou, em CSS px.
        mascara = np.zeros(gf[0].shape, dtype=bool)
        for i in range(1, len(gf)):
            if ts[i] < ini - folga and gf[i].shape == gf[i - 1].shape:
                mascara |= np.abs(gf[i] - gf[i - 1]) > 4
        if mascara.any():
            m2 = mascara.copy()
            for dy in range(-3, 4):
                for dx in range(-3, 4):
                    m2 |= np.roll(np.roll(mascara, dy, 0), dx, 1)
            mascara = m2

        def fino_de(a, b):
            if a.shape != b.shape:
                return a.size, [0, 0, 414, 896]
            m = (np.abs(a - b) > 4) & ~mascara
            n = int(m.sum())
            if not n:
                return 0, None
            ys, xs = np.nonzero(m)
            return n, [int(xs.min()), int(ys.min()), int(xs.max() - xs.min() + 1), int(ys.max() - ys.min() + 1)]
        df = [None] + [fino_de(gf[i - 1], gf[i]) for i in range(1, len(gf))]
        lim_px = 6
        fino = [(ts[i], df[i][0], df[i][1]) for i in range(1, len(gf)) if df[i][0] >= lim_px and -folga < ts[i] <= 800]
        fino_pousar = [(ts[i], df[i][0], df[i][1]) for i in range(1, len(gf))
                       if df[i][0] >= lim_px and ini < ts[i] <= -folga] if pousa is not None else []
        # Lacunas da captura: com animação viva na tela (o pulso, a barra do
        # descanso), a captura manda um quadro a cada ~16 ms. Um buraco de mais
        # de 100 ms ali é da captura, não da tela (conferido contra o Event
        # Timing do Chromium em 07-revisao-base.md §3).
        # (só conta se havia animação viva antes do dedo E no fim: se ela nasce
        # com a resposta, o silêncio antes dela é legítimo). Ainda assim é um
        # indício; o que decide é `capturaAtrasadaMs` abaixo, contra o Event Timing.
        vivas = (ps.get('antes') or {}).get('animsVivas', 0) and (ps.get('depois') or {}).get('animsVivas', 0)
        lacunas = []
        if vivas:
            for i in range(1, len(ts)):
                if ts[i] - ts[i - 1] > 100 and ts[i] > ini - 50 and ts[i - 1] < 800:
                    lacunas.append([ts[i - 1], ts[i]])
        ps['_lacunas'] = lacunas
        trans = []
        for i in range(1, len(g) - 1):
            if ts[i] <= ini or ts[i] > 800:
                continue
            if d[i] > lim and d[i + 1] > lim and frac(g[i - 1], g[i + 1]) < lim / 2:
                trans.append({'t': ts[i], 'duracaoMs': round(ts[i + 1] - ts[i], 1), 'fracao': round(d[i], 4)})
        et = (ps.get('toque') or {}).get('eventTimingClickMs')
        i_antes = escolhe(qs, ini - folga)
        i_fim = escolhe(qs, 800)
        total = frac(g[i_antes], g[i_fim]) if i_antes is not None and i_fim is not None else None
        # O ritmo da captura DURANTE o movimento: o maior intervalo entre quadros
        # entregues, do primeiro ao último quadro que muda (60 fps = 16,7 ms).
        mov = None
        if len(fino) >= 2:
            dentro = [t for t in ts if fino[0][0] <= t <= fino[-1][0]]
            mov = max(dentro[k] - dentro[k - 1] for k in range(1, len(dentro))) if len(dentro) >= 2 else None
        # O quadro final (+800 ms), inteiro, para comparar o fim entre rodadas
        # (com e sem movimento reduzido; antes e depois).
        if i_fim is not None:
            fim = ps['tira'][:-4] + '-fim.jpg'
            shutil.copyfile(qs[i_fim]['arq'], fim)
            ps['quadroFinal'] = os.path.basename(fim)
        ps['medidasDosQuadros'] = {
            'limiar': round(lim, 4), 'ruidoAntesDoDedo': round(ruido_med, 4),
            'quadrosNaJanela': len(qs), 'pixelsMascarados': int(mascara.sum()),
            # algo mudou com o dedo ainda pousado (o "afundar"), pela medida fina
            'mudancaNoPousarMs': fino_pousar[0][0] if fino_pousar else None,
            'mudancaNoPousarCaixa': fino_pousar[0][2] if fino_pousar else None,
            'primeiraMudancaMs': depois[0][0] if depois else None,
            'ultimaMudancaMs': depois[-1][0] if depois else None,
            'quadrosQueMudam': len(depois),
            'mudancas': [[t, round(f, 4)] for t, f in depois],
            'quadrosComQualquerMudanca': len(fino),
            'ultimaQualquerMudancaMs': fino[-1][0] if fino else None,
            'mudancasFinas': [[t, n, cx] for t, n, cx in fino],
            'lacunasDaCaptura': lacunas,
            'maiorIntervaloNoMovimentoMs': round(mov, 1) if mov is not None else None,
            # o primeiro quadro na tela veio mais de 50 ms depois do que o motor
            # diz ter apresentado (Event Timing do click): atraso da captura
            'capturaAtrasadaMs': (round(depois[0][0] - et, 1) if depois and et is not None and depois[0][0] - et > 50 else None),
            'transitorios': trans,
            'mudancaTotal': round(total, 4) if total is not None else None,
        }
        monta_tira(ps, qs, ts, pousa, man, folga)
        for q in qs:
            q.pop('arq', None)
        ps['linhaDoTempo'] = [[ts[i], round(d[i], 4) if d[i] is not None else None,
                               df[i][0] if df[i] is not None else None] for i in range(len(g))]
        ps.pop('quadros', None)
        ps.pop('_lacunas', None)
    json.dump(man, open(arq_man, 'w'), ensure_ascii=False, indent=1)


def monta_tira(ps, qs, ts, pousa, man, folga=5):
    ini = pousa if pousa is not None else 0
    cols = []
    for nome, t in INSTANTES:
        if nome == 'antes':
            i = escolhe(qs, ini - folga)
        elif nome == 'dedo':
            if pousa is None:
                continue
            i = escolhe(qs, -folga)
        else:
            i = escolhe(qs, t)
        cols.append((nome, i))
    im0 = Image.open(qs[0]['arq'])
    esc = LARG / im0.width
    alt = int(im0.height * esc)
    topo, base, gap = 74, 30, 6
    W = len(cols) * LARG + (len(cols) - 1) * gap + 2 * gap
    H = topo + alt + base
    tela = Image.new('RGB', (W, H), (247, 245, 240))
    dr = ImageDraw.Draw(tela)
    titulo = '%s · %s · %s' % (man['fluxo'], ps['id'], man['rotulo'])
    dr.text((gap, 6), titulo, fill=(20, 20, 20), font=fonte(17, True))
    dr.text((gap, 30), (ps.get('titulo') or '')[:150], fill=(70, 70, 70), font=fonte(14))
    for k, (nome, i) in enumerate(cols):
        x = gap + k * (LARG + gap)
        rot = {'antes': 'antes do dedo', 'dedo': 'dedo pousado'}.get(nome, nome + ' ms')
        dr.text((x + 4, 52), rot, fill=(20, 20, 20), font=fonte(15, True))
        if i is None:
            dr.rectangle([x, topo, x + LARG - 1, topo + alt - 1], outline=(180, 180, 180))
            continue
        q = Image.open(qs[i]['arq']).convert('RGB').resize((LARG, alt), Image.LANCZOS)
        if nome == 'dedo' and ps.get('dedo'):
            dq = ImageDraw.Draw(q)
            cx, cy = ps['dedo'][0] * LARG / 414, ps['dedo'][1] * LARG / 414
            r = 15
            dq.ellipse([cx - r - 2, cy - r - 2, cx + r + 2, cy + r + 2], outline=(255, 255, 255), width=2)
            dq.ellipse([cx - r, cy - r, cx + r, cy + r], outline=(214, 0, 140), width=3)
        tela.paste(q, (x, topo))
        dr.rectangle([x - 1, topo - 1, x + LARG, topo + alt], outline=(200, 200, 200))
        # o quadro escolhido abre uma lacuna da captura? (o próximo veio > 100 ms depois)
        na_lacuna = nome != 'antes' and i + 1 < len(ts) and [ts[i], ts[i + 1]] in ps.get('_lacunas', [])
        if na_lacuna:
            dr.text((x + 4, topo + alt + 6), 'quadro de %+.0f ms · LACUNA DA CAPTURA' % ts[i], fill=(200, 30, 30), font=fonte(13, True))
        else:
            dr.text((x + 4, topo + alt + 6), 'quadro de %+.0f ms' % ts[i], fill=(90, 90, 90), font=fonte(13))
    tela.save(ps['tira'], optimize=True)


def par(a, b, saida, rot_a, rot_b):
    ia, ib = Image.open(a).convert('RGB'), Image.open(b).convert('RGB')
    W = max(ia.width, ib.width)
    faixa = 34
    tela = Image.new('RGB', (W, ia.height + ib.height + 2 * faixa), (255, 255, 255))
    dr = ImageDraw.Draw(tela)
    dr.rectangle([0, 0, W, faixa], fill=(30, 30, 30))
    dr.text((10, 7), rot_a, fill=(255, 255, 255), font=fonte(18, True))
    tela.paste(ia, (0, faixa))
    y = faixa + ia.height
    dr.rectangle([0, y, W, y + faixa], fill=(36, 96, 74))
    dr.text((10, y + 7), rot_b, fill=(255, 255, 255), font=fonte(18, True))
    tela.paste(ib, (0, y + faixa))
    tela.save(saida, optimize=True)


def faixa(tira, col_a, col_b, x0, x1):
    """Fração da faixa vertical [x0, x1] (CSS px de 414) que difere entre duas
    colunas da tira ('antes', 'dedo', '+50' … '+800'), a 24 níveis de cinza.
    É a conferência "a de baixo parada" da decisão 4 do dono: aos +50 ms de uma
    tela cheia que chega pela direita, a faixa da esquerda ainda é a página de
    baixo, intacta (comparada com 'antes'); numa que sai, a faixa da esquerda já
    é a página de baixo no lugar final (comparada com '+800')."""
    im = Image.open(tira).convert('L')
    gap, topo = 6, 74
    n = round((im.width - gap) / (LARG + gap))
    nomes = [nm for nm, _ in INSTANTES if not (n == len(INSTANTES) - 1 and nm == 'dedo')]
    alt = int(896 * LARG / 414)
    esc = LARG / 414

    def corte(nome):
        k = nomes.index(nome)
        x = gap + k * (LARG + gap)
        return np.asarray(im.crop((x + int(x0 * esc), topo, x + int(x1 * esc), topo + alt)), dtype=np.int16)
    a, b = corte(col_a), corte(col_b)
    return float((np.abs(a - b) > 24).mean())


if __name__ == '__main__':
    if sys.argv[1] == 'tiras':
        tiras(sys.argv[2])
    elif sys.argv[1] == 'par':
        par(*sys.argv[2:7])
    elif sys.argv[1] == 'faixa':
        print(faixa(sys.argv[2], sys.argv[3], sys.argv[4], float(sys.argv[5]), float(sys.argv[6])))
    else:
        print(__doc__)
