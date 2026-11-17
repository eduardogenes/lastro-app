"""O material da página de antes e depois (07 §5), da rodada final.

Para cada par da tabela de §5 (PARES, abaixo): o vídeo lado a lado em velocidade
real e o 4× mais lento, recodificados para a página (H.264, sem som, `faststart`,
que o Safari do iPhone toca em laço), e a tira dupla (JPG quando o PNG passa de
~500 kB). E o `manifesto.json`: no topo, o quadro dos princípios (final e antes,
por princípio e por motor), o que reprovou e o que não se mediu; depois, uma
entrada por par, com o que o dono decidiu, os arquivos, o veredito e o número
que decidiu. As frases vão para o dono: português claro; os números técnicos
ficam em campos à parte.

    python3 docs/motion/_medicao/revisor-pagina.py \
      docs/motion/_medicao/shots/revisor/comparacao-final \
      docs/motion/_medicao/shots/revisor/antes-contra-protocolo/protocolo.json \
      docs/motion/_medicao/shots/revisor/pagina
"""
import collections
import glob
import json
import os
import shutil
import subprocess
import sys

from PIL import Image

PRINCIPIOS = {
    '1': ('a tela responde ao toque sem esperar', 'toque nunca espera'),
    '2': ('o movimento é do tipo que o celular faz sem esforço', 'só transform e opacity'),
    '3': ('nada pisca', 'nada pisca no Blink'),
    '4': ('o movimento corre liso no motor do iPhone', '60 fps no WebKit'),
    '5': ('com "Reduzir movimento", nada desliza', 'movimento reduzido'),
    '6': ('quem usa leitor de tela não perde o lugar', 'foco não se perde'),
    '7': ('nada depende só do movimento', 'nada só pelo movimento'),
    '8': ('o movimento é o que você decidiu', 'sem enfeite (decisões do dono)'),
    '9': ('a página volta para onde estava', 'a rolagem volta exata'),
    '10': ('o botão escurece sob o dedo', 'o toque se vê'),
}

# (peça, fluxo, passo, rodadas, o que o dono decidiu, o que o par mostra, o número
# que decide [campo de `numeros` e como dizer], o que fica a conferir)
PARES = [
    ('5', '01-modo-cartao', 'entra', ['chromium', 'webkit'],
     'O treino em andamento chega da direita em 350 ms, por cima da tela de baixo, que fica parada.',
     'Tocar o cartão do treino: antes, a tela trocava de uma vez; agora o treino entra deslizando da direita.',
     ('andaMs', 'a tela começa a andar'), 'No iPhone, o tempo até a tela começar a andar ainda precisa ser visto no aparelho.'),
    ('5', '01-modo-cartao', 'sai', ['chromium', 'webkit'],
     'Ao sair, o treino volta para a direita, do mesmo jeito.',
     'Tocar a seta: a tela do treino sai pela direita e o Agora reaparece parado embaixo.',
     ('andaMs', 'a tela começa a andar'), ''),
    ('5', '16-meio-modo', 'entra-e-sai', ['chromium', 'webkit'],
     'Um toque no meio de um movimento nunca se perde.',
     'Tocar o cartão e, logo depois, a seta de sair, com o treino ainda chegando: o toque vale e o treino fecha.',
     ('telaMs', 'a tela muda'), ''),
    ('5', '02-modo-faixa', 'sai', ['chromium', 'webkit', 'chromium-reduz'],
     'Nada salta: ao voltar, a página está exatamente onde você a deixou.',
     'Entrar no treino pela faixa, no fim do Corpo, e voltar: antes a página voltava 900 px acima; agora volta ao mesmo ponto.',
     ('rolagem', 'a rolagem ao voltar'), ''),
    ('2, 3', '03b-primeira-serie-fria', 'grava-1', ['webkit', 'chromium'],
     'A série gravada pousa na célula em 160 ms, e o cronômetro do descanso sobe da borda de baixo em 350 ms.',
     'A primeira série do dia: antes a tela ficava parada um tempo com o botão apertado; agora o número pousa e o cronômetro sobe e encosta no fundo.',
     ('telaMs', 'a tela muda'), 'A primeira série a frio no WebKit desta máquina ainda demora para desenhar; isso fica para o aparelho.'),
    ('2', '03-serie-regua', 'grava-1', ['chromium'],
     'Depois de gravar, o dedo não cai em cima de outro controle.',
     'Gravar a série pela régua: antes, sob o dedo ficava a carga da mesma série; agora não.',
     ('telaMs', 'a tela muda'), ''),
    ('5', '04-programa', 'abre', ['chromium'],
     'As telas cheias chegam da direita em 350 ms, com a de baixo parada.',
     'Abrir o Programa: a tela cheia entra da direita.',
     ('andaMs', 'a tela começa a andar'), ''),
    ('5', '04-programa', 'empilha', ['chromium'],
     'Uma tela cheia sobre outra faz o mesmo caminho.',
     'Abrir o Histórico de dentro do Programa: ele entra da direita por cima.',
     ('andaMs', 'a tela começa a andar'), ''),
    ('5', '04-programa', 'volta-1', ['chromium'],
     'Voltar é o caminho inverso.',
     'Tocar "‹ Voltar": o Histórico sai pela direita.',
     ('andaMs', 'a tela começa a andar'), ''),
    ('5', '08-voltar-sistema', 'voltar-1', ['chromium', 'webkit'],
     'O gesto de voltar do sistema faz o mesmo caminho de volta.',
     'O voltar do sistema com uma tela cheia aberta: ela sai pela direita, como pelo botão.',
     ('andaMs', 'a tela começa a andar'), ''),
    ('4', '06-folhas', 'abre', ['chromium', 'webkit'],
     'A folha sobe com um pequeno quique em 640 ms (passa um pouco do lugar e volta); o fundo escurece em 350 ms.',
     'Abrir a folha da refeição: antes ela aparecia de uma vez; agora sobe e assenta.',
     ('telaMs', 'a tela muda'), 'Se o quique se sente como chegada ou como atraso, só no aparelho.'),
    ('4', '06-folhas', 'empilha', ['chromium', 'webkit'],
     'Uma segunda folha sobe sobre a primeira, do mesmo jeito.',
     'Abrir "editar refeição" com a folha aberta.',
     ('telaMs', 'a tela muda'), ''),
    ('4, 5', '06-folhas', 'fecha-x', ['chromium', 'webkit'],
     'Fechar uma folha a faz descer em 350 ms, sem quique.',
     'Tocar o × da folha de cima: ela desce, e a de baixo fica.',
     ('andaMs', 'a tela começa a andar'), ''),
    ('4', '13-pare', 'abre', ['chromium', 'webkit'],
     'O painel de apagar chega como a folha, com o mesmo quique.',
     'Tocar "Encerrar" sem nenhuma série: o painel sobe.',
     ('telaMs', 'a tela muda'), ''),
    ('4, 5', '13-pare', 'deixa', ['chromium', 'webkit'],
     'E desce em 350 ms ao sair; o foco volta ao "Encerrar".',
     'Tocar "Deixar como está": o painel desce.',
     ('andaMs', 'a tela começa a andar'), ''),
    ('4', '15b-meio-folha-veu', 'abre-e-fecha-veu', ['chromium', 'webkit'],
     'Um toque no meio de um movimento nunca se perde.',
     'Abrir a folha e, logo depois, tocar o fundo escuro no alto da tela: a folha fecha, mesmo ainda subindo.',
     ('telaMs', 'a tela muda'), ''),
    ('6', '07-abas', 'agora-corpo', ['chromium', 'webkit'],
     'Trocar de aba desliza a página inteira em 350 ms, como um carrossel; o traço da aba anda junto.',
     'Do Agora para o Corpo (para a direita): a página velha sai pela esquerda e a nova entra; a barra de abas fica parada.',
     ('andaMs', 'a tela começa a andar'), ''),
    ('6', '07-abas', 'semana-agora', ['chromium', 'webkit'],
     'No sentido contrário, o carrossel anda para o outro lado.',
     'Da Semana para o Agora (para a esquerda).',
     ('andaMs', 'a tela começa a andar'), ''),
    ('6', '14-meio-abas', 'corpo-e-semana', ['chromium'],
     'Um toque no meio de um movimento nunca se perde.',
     'Tocar Corpo e, logo depois, Semana, com o carrossel andando: acaba na Semana.',
     ('telaMs', 'a tela muda'), ''),
    ('6', '17-cronometro-troca', 'abre-ajustes', ['chromium', 'webkit'],
     'O cronômetro, o aviso e a barra não andam de lado com as páginas.',
     'Com o descanso contando, abrir os Ajustes: o cronômetro desce 52 px junto com a tela que chega, em vez de pular de uma vez.',
     ('andaMs', 'a tela começa a andar'), ''),
    ('1, 8', '09-copo', 'mais-1', ['webkit', 'chromium-mouse'],
     'O botão escurece sob o dedo, sem movimento; o copo novo enche de baixo para cima em 160 ms.',
     'Tocar "+1 copo": antes nada mudava com o dedo pousado; agora o botão escurece e a bolinha enche.',
     ('telaMs', 'a tela muda'), 'O escurecer com o dedo no iPhone de verdade depende de um detalhe do Safari que só o aparelho mostra.'),
    ('7', '10-toast', 'chega', ['chromium'],
     'O aviso curto sobe 8 px e acende em 160 ms.',
     'Começar o treino: o aviso "Treino … iniciado" sobe e acende no fundo da tela.',
     ('telaMs', 'a tela muda'), ''),
    ('7', '10-toast', 'troca', ['chromium'],
     'Um texto novo refaz a entrada do aviso.',
     'Tocar "Pausar" com o aviso na tela: o aviso novo entra de novo.',
     ('telaMs', 'a tela muda'), ''),
    ('7', '10-toast', 'some', ['chromium'],
     'O aviso fica o tempo de ler o texto (de 3,6 a 8 s) e sai só apagando.',
     'Ninguém toca: o aviso apaga no lugar.',
     ('quadrosQueMudam', 'quadros com mudança'), ''),
    ('8', '11-refeicao-linha', 'comi-tudo', ['chromium', 'webkit'],
     '"Comi tudo" não empurra a linha para fora do dedo; a forma da refeição pousa em 160 ms.',
     'Marcar o almoço pela linha aberta, com a página no topo: a linha fica no lugar e a forma pousa. Para isso a página rola 157 px de uma vez, e o resumo do dia, que nasce em cima, fica com a parte de cima cortada.',
     ('telaMs', 'a tela muda'), 'O resumo do dia fica cortado em cima depois de "Comi tudo" com a página no topo: o coordenador aceitou, e você vê aqui.'),
    ('8', '12-teclado', 'abre', ['chromium'],
     'A régua e o teclado continuam sem movimento nenhum.',
     'Abrir o teclado pela célula de carga: abre seco, igual ao antes.',
     ('telaMs', 'a tela muda'), ''),
    ('0', '01-modo-cartao', 'entra', ['chromium-reduz', 'webkit-reduz'],
     'Com "Reduzir movimento" ligado no celular, nada desliza: o que chega só esmaece em 120 ms, e sai de uma vez.',
     'O treino com "Reduzir movimento": só esmaece.',
     ('telaMs', 'a tela muda'), ''),
    ('0', '06-folhas', 'abre', ['chromium-reduz', 'webkit-reduz'],
     'Com "Reduzir movimento", a folha só esmaece, sem subir nem quicar.',
     'A folha da refeição com "Reduzir movimento".',
     ('telaMs', 'a tela muda'), ''),
    ('0', '07-abas', 'agora-corpo', ['chromium-reduz', 'webkit-reduz'],
     'Com "Reduzir movimento", a aba nova só esmaece e a velha sai de uma vez.',
     'Trocar de aba com "Reduzir movimento".',
     ('telaMs', 'a tela muda'), ''),
    ('0', '13-pare', 'abre', ['chromium-reduz', 'webkit-reduz'],
     'Com "Reduzir movimento", o painel de apagar só esmaece.',
     'O painel de apagar com "Reduzir movimento".',
     ('telaMs', 'a tela muda'), ''),
]

NAO_MEDIDO = [
    'O iPhone de verdade: o motor que move as telas no iPhone 11 Pro Max (Core Animation) não roda aqui. Os tempos do WebKit nesta máquina, sem placa de vídeo, são mais lentos que no aparelho.',
    'O botão escurecer com o dedo no Safari do iPhone depende de um detalhe (um ouvinte de toque) que só o aparelho confirma.',
    'O gesto de voltar arrastando da borda no iPhone, que o próprio Safari anima.',
    'A altura da tela com a barra do Safari aparecendo e sumindo.',
    'Se o quique de 640 ms da folha se sente como chegada ou como atraso.',
]


def motor(rodada):
    return 'webkit' if rodada.startswith('webkit') else 'chromium'


def quadro(protocolo):
    q = collections.defaultdict(lambda: collections.Counter())
    for e in protocolo['resultado']:
        for v in e.get('vereditos', []):
            p = v['principio'].split(' ')[0]
            q[(p, motor(e['rodada']))][v['veredito']] += 1
    out = []
    for p in PRINCIPIOS:
        for m in ('chromium', 'webkit'):
            c = q.get((p, m))
            if c:
                out.append({'principio': p, 'oQueQuerDizer': PRINCIPIOS[p][0], 'nome': PRINCIPIOS[p][1], 'motor': m,
                            'passam': c.get('passa', 0), 'reprovam': c.get('REPROVA', 0), 'aConferir': c.get('a conferir', 0)})
    return out


def veredito(vs):
    rep = [v for v in vs if v['veredito'] == 'REPROVA']
    conf = [v for v in vs if v['veredito'] == 'a conferir']
    nomes = lambda l: sorted(set(PRINCIPIOS[v['principio'].split(' ')[0]][0] for v in l))
    if rep:
        return 'não passou', 'Não passou em: ' + '; '.join(nomes(rep)) + '.'
    if conf:
        return 'passou, com ressalva', 'Passou; fica a olhar: ' + '; '.join(nomes(conf)) + '.'
    return 'passou', 'Passou em tudo o que se mede aqui.'


def mp4(origem, destino):
    subprocess.run(['/usr/bin/ffmpeg', '-v', 'error', '-y', '-i', origem, '-an', '-c:v', 'libx264', '-profile:v', 'high', '-level', '4.0',
                    '-pix_fmt', 'yuv420p', '-crf', '27', '-preset', 'slow', '-movflags', '+faststart', destino], check=True)


def tira(origem, destino_sem_ext):
    if os.path.getsize(origem) <= 500_000:
        shutil.copyfile(origem, destino_sem_ext + '.png')
        return destino_sem_ext + '.png'
    Image.open(origem).convert('RGB').save(destino_sem_ext + '.jpg', quality=82, optimize=True)
    return destino_sem_ext + '.jpg'


def main(comp, base, saida):
    prot = json.load(open(os.path.join(comp, 'protocolo.json')))
    protA = json.load(open(base))
    os.makedirs(saida, exist_ok=True)
    por = {(e['fluxo'], e['passo'], e['rodada']): e for e in prot['resultado']}
    pares = []
    for peca, fluxo, passo, rodadas, decidiu, mostra, (campo, dizer), conferir in PARES:
        for rod in rodadas:
            e = por.get((fluxo, passo, rod))
            achados = sorted(glob.glob(os.path.join(comp, fluxo, f'*-{passo}-{rod}.mp4')))
            if not e or not achados:
                pares.append({'peca': peca, 'fluxo': fluxo, 'passo': passo, 'rodada': rod, 'erro': 'sem par na comparação final'})
                continue
            base_nome = os.path.basename(achados[0])[:-4]
            pasta = os.path.join(saida, fluxo); os.makedirs(pasta, exist_ok=True)
            v1, v4 = os.path.join(pasta, base_nome + '.mp4'), os.path.join(pasta, base_nome + '-lento.mp4')
            mp4(os.path.join(comp, fluxo, base_nome + '.mp4'), v1)
            mp4(os.path.join(comp, fluxo, base_nome + '-lento.mp4'), v4)
            t = tira(os.path.join(comp, fluxo, base_nome + '-par.png'), os.path.join(pasta, base_nome + '-par'))
            ver, frase = veredito(e['vereditos'])
            n = e.get('numeros', {})
            if campo == 'rolagem':
                m = [v['motivo'] for v in e['vereditos'] if v['principio'].startswith('9')]
                numero = {'oQue': dizer, 'texto': m[0] if m else None}
            else:
                a_d = n.get(campo) or [None, None]
                numero = {'oQue': dizer, 'campo': campo, 'antes': a_d[0], 'depois': a_d[1]}
            pares.append({
                'peca': peca, 'fluxo': fluxo, 'passo': passo, 'motor': motor(rod), 'rodada': rod,
                'oQueODonoDecidiu': decidiu, 'oQueSeVe': mostra,
                'arquivos': {'video': os.path.relpath(v1, saida), 'videoLento4x': os.path.relpath(v4, saida), 'tira': os.path.relpath(t, saida)},
                'veredito': ver, 'vereditoEmPalavras': frase, 'numeroQueDecidiu': numero,
                'aConferir': conferir,
                'tecnico': {'numeros': n, 'vereditos': e['vereditos']},
            })
    reprovou = []
    for e in prot['resultado']:
        for v in e.get('vereditos', []):
            if v['veredito'] == 'REPROVA':
                reprovou.append({'fluxo': e['fluxo'], 'passo': e['passo'], 'rodada': e['rodada'],
                                 'emPalavras': PRINCIPIOS[v['principio'].split(' ')[0]][0], 'principio': v['principio'], 'motivo': v['motivo']})
    tam = sum(os.path.getsize(os.path.join(d, f)) for d, _, fs in os.walk(saida) for f in fs if f != 'manifesto.json')
    man = {
        'titulo': 'Lastro · o movimento, antes e depois',
        'antes': 'a22b09d (o app sem os movimentos novos)', 'depois': prot.get('depois'),
        'quando': prot.get('quando'),
        'comoLer': 'Cada par mostra o antes à esquerda e o depois à direita, alinhados no instante do toque, em velocidade real e 4× mais lento; a tira mostra os mesmos instantes, do antes do dedo a 0,8 s depois. "chromium" é o motor do Chrome; "webkit" é o motor do Safari, aqui num computador sem placa de vídeo.',
        'quadroDosPrincipios': {'final': quadro(prot), 'antes': quadro(protA)},
        'oQueReprovou': reprovou,
        'oQueNaoSeMediu': NAO_MEDIDO,
        'pares': pares,
        'tamanhoDaPastaMB': round(tam / 1e6, 1),
    }
    json.dump(man, open(os.path.join(saida, 'manifesto.json'), 'w'), ensure_ascii=False, indent=1)
    print('pares', len(pares), 'sem par', sum(1 for p in pares if 'erro' in p), 'MB', man['tamanhoDaPastaMB'], 'reprovações', len(reprovou))


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2], sys.argv[3])
