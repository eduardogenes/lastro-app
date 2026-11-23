/* O documento da página viva: índice, fundamentos, componentes (a galeria),
   fluxos (o mapa) e auditoria. O roteamento é pelo endereço: #fundamentos,
   #componentes, #fluxos, #auditoria, #t-<tela>[--<estado>]. */

const ABAS = [['indice', 'Início'], ['fundamentos', 'Fundamentos'], ['componentes', 'Componentes'], ['telas', 'Telas'], ['fluxos', 'Fluxos'], ['auditoria', 'Auditoria']];
const barra = a => `<nav class="barra" aria-label="Seções do design system"><div class="doc">${ABAS.map(x => `<a href="#${x[0] === 'telas' ? 't-hoje' : x[0]}" ${x[0] === a ? 'aria-current="page"' : ''}>${x[1]}</a>`).join('')}</div></nav>`;
const am = (rot, nota, pal, spec, o = {}) => `<div class="amostra" ${o.larga ? 'style="grid-column:1/-1"' : ''}><p class="rot">${rot}<span>${nota || ''}</span></p><div class="pal ${o.cor ? 'cor' : ''} ${o.alto ? 'alto' : ''}" ${o.cor ? `style="--cor:var(--${o.cor})"` : ''}>${pal}</div>${spec ? `<div class="spec">${spec}</div>` : ''}</div>`;

/* ---------------- início ---------------- */
function pagIndice() {
  const n = ORDEM.length, ne = ORDEM.reduce((a, i) => a + (TELAS[i].es ? TELAS[i].es.length : 1), 0);
  return barra('indice') + `<main class="doc"><h1 class="capa">O design system do Lastro</h1>
    <p class="lead">A direção 3, inteira: os fundamentos, os componentes com todos os estados, as ${n} telas do app (${ne} estados, com dado de verdade) ligadas como no app, e o mapa de onde se chega a cada uma. A base são os protótipos do Fable; o que eles não desenhavam está desenhado aqui no mesmo idioma.</p>
    <div class="cartoes">
      <a class="cor" href="#t-hoje"><b>Abrir o app</b><span>Começa no Hoje. Toque em tudo: a doca, o "+", as folhas, o Voltar.</span></a>
      <a href="#fundamentos"><b>Fundamentos</b><span>Cor e contraste medido, letra, espaço, forma, ícones, movimento, toque.</span></a>
      <a href="#componentes"><b>Componentes</b><span>24 peças, cada uma com os estados: repouso, toque, foco, travado, carregando, erro.</span></a>
      <a href="#t-serie"><b>Fluidez</b><span>Toque em "Feito" e em "Começar já": o botão não sai do lugar, só o miolo troca. Entre num destino e volte; abra o treino e recolha.</span></a>
      <a href="#fluxos"><b>Fluxos</b><span>De onde se chega a cada tela, para onde leva, e o que o Voltar desfaz.</span></a>
      <a href="#auditoria"><b>Auditoria</b><span>O que o app construído faz diferente, tela por tela, com a correção.</span></a>
    </div>
    <h2 class="sec">As telas, por lugar</h2>
    ${GRUPOS.map(g => { const l = ORDEM.filter(i => TELAS[i].g === g[0]); return `<h3 class="sub">${g[1]}</h3><div class="cartoes" style="grid-template-columns:repeat(auto-fill,minmax(200px,1fr))">${l.map(i => `<a href="#t-${i}" style="min-height:0;padding:14px"><b style="font-size:16px">${TELAS[i].n}</b><span>${CAMADA[TELAS[i].c]}${TELAS[i].es ? ' · ' + TELAS[i].es.length + ' estados' : ''}</span></a>`).join('')}</div>`; }).join('')}
    <h2 class="sec">As decisões do dono que este desenho carrega</h2>
    <p class="tx"><b>Primeira vez em três passos</b>: a pessoa começa vazia e traz o treino e o plano dela. <b>Revisão do treinador mudança por mudança</b>: pede regra nova no app. <b>"Comi outra coisa" guarda o tamanho</b>: é dado novo, com migração. As três estão desenhadas e entram na auditoria como trabalho de implementação. Tema claro sempre.</p>
    <p class="tx" style="margin-top:28px">Os arquivos estão em <b>docs/design-system/</b>: os documentos em Markdown, os tokens em <b>tokens.css</b> e esta página em <b>lastro.html</b>.</p></main>`;
}

/* ---------------- fundamentos ---------------- */
function pagFundamentos() {
  const C = [['fundo', '#F6F3EC', 'o papel: fundo de toda tela'], ['superficie', '#FFFDF8', 'controle sobre papel ou cor'], ['superficie-quieta', '#EBE6DA', 'bloco secundário, trilho, vazio'], ['divisoria', '#DFDACE', 'só divisória entre linhas'], ['contorno', '#858073', 'contorno de controle (3,6:1)'], ['texto', '#0F0F0D', 'texto, botão principal'], ['texto-2', '#56554E', 'apoio'], ['texto-legenda', '#62615A', 'nota e legenda, 12–13 px'], ['assunto-treino', '#D2F23A', 'treino, agora, selecionado'], ['assunto-refeicao', '#FF9A4D', 'refeição; também atenção'], ['assunto-corpo', '#D3C6FF', 'corpo, pergunta, aula'], ['assunto-semana', '#BBDDFB', 'semana, água, dobras'], ['assunto-feito', '#BEEBD2', 'feito, guardado, livre']];
  const L = h => { const c = [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255).map(x => x <= .03928 ? x / 12.92 : ((x + .055) / 1.055) ** 2.4); return .2126 * c[0] + .7152 * c[1] + .0722 * c[2]; };
  const r = (a, b) => { const x = L(a), y = L(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
  const fundos = C.filter(c => !['divisoria', 'contorno', 'texto', 'texto-2', 'texto-legenda'].includes(c[0]));
  const tx = [['texto', '#0F0F0D', 4.5], ['texto-2', '#56554E', 4.5], ['texto-legenda', '#62615A', 4.5], ['contorno', '#858073', 3]];
  const escala = [['contagem', '120 / 0,85 · 800', '1:50', 'var(--t-contagem)'], ['gigante', '96 / 0,84 · 800', '77,6', 'var(--t-gigante)'], ['gigante-m', '76 · 800', '47,5', 'var(--t-gigante-m)'], ['valor', '66 · 800', '60 × 9', 'var(--t-valor)'], ['gigante-p', '64 · 800', '86,0', 'var(--t-gigante-p)'], ['heroi', '50 / 0,92 · 800', 'Treino B', 'var(--t-heroi)'], ['heroi-m', '36 / 0,98 · 800', 'Café da manhã', 'var(--t-heroi-m)'], ['lugar', '34 · 800', 'Dias', 'var(--t-lugar)'], ['folha, ação', '30 · 800', 'Mudar hoje', 'var(--t-folha)'], ['destino', '28 · 800', 'Comparar', 'var(--t-destino)'], ['quadro', '22 · 800', '+3,3 kg', 'var(--t-quadro)'], ['botão', '18 · 700', 'Começar', 'var(--t-botao)'], ['seção, nome', '17 · 700', 'Séries da semana', 'var(--t-secao)'], ['campo', '16 · 500', 'voce@exemplo.com', 'var(--t-campo)'], ['texto', '15 / 1,38 · 500', 'Pernas completas e panturrilhas.', 'var(--t-texto)'], ['apoio', '14 / 1,4 · 500', 'O app volta para o primeiro que falta.', 'var(--t-apoio)'], ['rótulo', '13 · 600', 'últimos 7 dias', 'var(--t-rotulo)'], ['legenda (piso)', '12 · 600', 'sessão de fotos', 'var(--t-legenda)']];
  return barra('fundamentos') + `<main class="doc"><h1 class="capa">Fundamentos</h1><p class="lead">Os valores de <b>tokens.css</b>, com o papel de cada um. A explicação inteira está em <b>01-fundamentos.md</b>.</p>
    <h2 class="sec">Cor</h2><p class="tx">Tema claro sempre. A cor do bloco diz <b>de que assunto</b> é o momento, nunca se foi bom. Não existe vermelho: atenção é tangerina com contorno de tinta e uma frase.</p>
    <div class="cores">${C.map(c => `<div class="cor-c"><div class="am" style="background:${c[1]};color:${L(c[1]) < .2 ? '#F6F3EC' : '#0F0F0D'}">Aa</div><div class="ds"><b>--${c[0]}</b>${c[1]} · ${c[2]}</div></div>`).join('')}</div>
    <h3 class="sub">Os pares medidos</h3><p class="tx">Razão de contraste do texto sobre cada fundo. Hachurado é o que reprova (texto pede 4,5; contorno de controle pede 3). A regra que sai daqui: <b>sobre cor de assunto, o texto é tinta, sempre</b>; o cinza de legenda só sobre papel, superfície e areia.</p>
    <div class="tab"><table><tr><th></th>${fundos.map(f => `<th>${f[0].replace('assunto-', '').replace('superficie-quieta', 'quieta')}</th>`).join('')}</tr>${tx.map(t => `<tr><th>${t[0]}</th>${fundos.map(f => { const v = r(t[1], f[1]); return `<td class="${v >= t[2] ? 'ok' : 'no'}">${vir(v.toFixed(1))}</td>`; }).join('')}</tr>`).join('')}</table></div>
    <p class="tx">O cinza de legenda do protótipo (#77766D) dava 4,1 no papel e 3,6 no lima. Escureceu para #62615A. O contorno de controle era o fio bege (1,3); nasceu <b>--contorno</b>.</p>
    <h2 class="sec">Tipografia</h2><p class="tx"><b>Bricolage Grotesque</b> (700, 800) para títulos, números e botões; <b>Instrument Sans</b> (500 a 700) para texto. Todo número em algarismo tabular.</p>
    <div class="escala" style="margin-top:12px">${escala.map(e => `<div><span class="nm"><b>${e[0]}</b>${e[1]}</span><span class="ex n" style="font:${e[3]};letter-spacing:-.03em">${e[2]}</span></div>`).join('')}</div>
    <h2 class="sec">Espaço e forma</h2><div class="espacos">${[[4, '--e-1'], [8, '--e-3 · entre botões'], [10, '--e-4 · seção → conteúdo'], [14, '--e-6 · ícone → texto'], [16, '--e-7 · apoio → botões'], [18, '--entre-secoes'], [20, '--margem lateral']].map(x => `<div><i style="width:${x[0] * 3}px"></i><span class="n">${x[0]} px</span> ${x[1]}</div>`).join('')}</div>
    <div class="raios">${[['999', 'pílula'], ['36', 'folha'], ['34', 'bloco'], ['26', 'cartão'], ['22', 'caixa'], ['18', 'quadro'], ['10', 'miniatura']].map(x => `<div style="border-radius:${Math.min(+x[0], 45)}px">${x[0]}<br>${x[1]}</div>`).join('')}</div>
    <p class="tx">Três espessuras: 1,5 (divisória, contorno quieto), 2 (contorno de botão, campo, aviso), 2,5 (o escolhido, o foco). Sombra só no que flutua: doca, "+", a ação que gruda.</p>
    <h2 class="sec">Ícones</h2><p class="tx">Phosphor regular, em grade de 256. Cada desenho usa a cor do texto.</p>
    <div class="icones">${nomesDosIcones.map(k => `<div>${ic[k]}${k}</div>`).join('')}</div>
    <h2 class="sec">Movimento</h2><p class="tx"><b>O que se repete fica parado; o que muda se mostra mudando.</b> O que entra desacelera (<b>--mola</b>), o que sai acelera (<b>--mola-sai</b>), de 100 a 380 ms. Cada troca tem o seu movimento, e as âncoras (o botão principal, o topo, a doca) não saem do lugar. A tabela completa e as fontes estão em <b>07-fluidez-e-estabilidade.md</b>.</p>
    <div class="tab"><table><tr><th>Troca</th><th>Movimento</th><th>Entra</th><th>Sai</th></tr>${[['trocar de lugar', 'fade through, sem deslizar', '180 ms', '100 ms'], ['entrar num destino', 'eixo horizontal, 24 px', '260 ms', '100 ms'], ['voltar', 'o mesmo, ao contrário', '220 ms', '100 ms'], ['abrir tela de ação', 'sobe de baixo', '380 ms', '—'], ['recolher tela de ação', 'desce', '—', '260 ms'], ['passo da mesma tarefa', 'âncoras paradas, miolo em crossfade', '180 ms', '120 ms'], ['estado da mesma tela', 'as partes se acomodam', '220 ms', '—'], ['folha', 'sobe; desce mais rápido', '340 ms', '240 ms'], ['aviso, faixa', 'desliza 10 px sobre o conteúdo', '200 ms', '160 ms'], ['toque', 'encolhe 3%', '100 ms', '100 ms']].map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</table></div>
    <div class="mov"><button onclick="this.closest('main').querySelector('.mov-palco .f').classList.toggle('on')">Subir e descer a folha (340 ms)</button><button onclick="const m=this.closest('main').querySelector('.mov-palco');m.style.transition='background var(--d-cor) var(--mola)';m.style.background=m.style.background.includes('refeicao')?'var(--assunto-treino)':'var(--assunto-refeicao)'">Trocar a cor do bloco (450 ms)</button></div>
    <div class="mov-palco"><div class="f">Folha</div></div>
    <h2 class="sec">Toque</h2><p class="tx">Piso de 44 × 44 em tudo, inclusive a saída sublinhada. 48 nas fichas de resposta, 58 no botão principal, 68 no "Feito" e no "Guardar" da medição, 84 no disparo da câmera.</p>
    <div style="display:flex;gap:24px;flex-wrap:wrap;align-items:flex-start"><div class="polegar" role="img" aria-label="A área do polegar num iPhone de 414 por 896"><div style="top:0;height:120px;background:var(--superficie-quieta)">difícil<br>recolher, lista, voltar</div><div style="top:120px;height:160px;background:var(--assunto-semana)">com esforço<br>conteúdo, consulta</div><div style="top:280px;height:168px;background:var(--assunto-treino)">fácil<br>Feito, Guardar, doca, "+"</div></div>
      <p class="tx" style="flex:1;min-width:220px">Com uma mão, o polegar alcança fácil a faixa de baixo. Por isso, na tela de ação, tudo o que se aperta mora embaixo. No Hoje, o botão do bloco está no topo: ao rolar ele gruda, e o "+" da doca sugere a mesma ação primeiro.</p></div>
  </main>`;
}

/* ---------------- componentes ---------------- */
function pagComponentes() {
  const lin0 = H.lin({ t: 'Cintura', a: '+1,5 cm desde 01/10', val: '86,0', un: 'cm' });
  return barra('componentes') + `<main class="doc"><h1 class="capa">Componentes</h1><p class="lead">Cada um com os estados. A especificação completa (anatomia, conteúdo, acessibilidade, o que não fazer) está em <b>02-componentes.md</b>. Os de dentro de tela estão em tamanho real.</p>
  <h2 class="sec">Bloco do momento</h2><div class="gal">
    ${am('Treino', 'cor do assunto', H.momento({ cor: 'assunto-treino', anima: false, linha0: `<span>segunda, 16 nov · 06h05 · treino</span>${ic.ajuste}`, quando: 'daqui a 10 min', vivo: 1, titulo: 'Treino B', apoio: 'Pernas completas e panturrilhas. 22 séries, perto de uma hora.', acoes: H.vai('Começar ' + ic.seta), saidas: H.saida('Hoje não vou treinar') }), 'Um principal, no máximo um de contorno, uma saída discreta. Título até 12 letras em 50.')}
    ${am('Refeição', 'título médio', H.momento({ cor: 'assunto-refeicao', anima: false, linha0: '<span>segunda, 16 nov · 12h40</span>', quando: 'era às 12h30', titulo: 'Café da manhã', apoio: 'Cuscuz, frango, requeijão e mais 2.', acoes: H.vai(ic.ok + ' Comi') + H.alt('Ver'), saidas: H.saida('Não foi assim') }), 'Mais de 12 letras: o título cai para 36.')}
    ${am('Pergunta da noite', '', H.momento({ cor: 'assunto-corpo', anima: false, linha0: '<span>21h00</span>', quando: '2 refeições ficaram sem resposta', titulo: 'A comida de hoje foi como o plano?', acoes: H.vai('Foi, sim') + H.alt('Quase'), saidas: H.saida('Não sei dizer') }))}
    ${am('Livre (faixa fina)', 'sem botão', H.momento({ cor: 'assunto-feito', fino: 1, anima: false, linha0: '<span>15h00</span>', quando: 'tudo em dia', titulo: 'Livre até as 16h00', apoio: 'O próximo é o lanche da tarde.' }))}
  </div>
  <h2 class="sec">Botões</h2><div class="gal">
    ${am('Principal', 'repouso · foco · travado · carregando', `<div style="display:grid;gap:10px">${H.vai('Começar ' + ic.seta)}${H.vai('Começar', { style: 'outline:2.5px solid var(--foco);outline-offset:3px' })}${H.vai(ic.cadeado + ' Guardar', { off: 1 })}${H.vai('Guardando…', { off: 1 })}</div>`, 'Travado: contorno <b>tracejado</b> de tinta, texto em tinta. Nunca cinza translúcido (ficava a 3,4:1 no lima). Carregando: a palavra muda, nada gira.')}
    ${am('Sobre cor', 'principal + contorno', `<div class="acoes" style="margin:0">${H.vai(ic.ok + ' Comi')}${H.alt('Ver')}</div><div class="acoes">${H.vai('Guardar', { off: 1 })}</div>`, 'Sobre qualquer cor, o principal é tinta com texto papel.', { cor: 'assunto-treino' })}
    ${am('Grande, da tela de ação', '68 px', H.vai(ic.ok + ' Feito', { g: 1 }), 'No treino e na medição.', { cor: 'assunto-treino' })}
    ${am('Saída discreta', '44 de área', `<div class="saidas" style="margin:0">${H.saida('Pulei esta')}${H.saida('Tirar mesmo assim')}${H.saida('Guardar só esta')}</div>`, 'Texto sublinhado, sempre embaixo do principal. A área de toque é de 44, maior que o texto.')}
    ${am('Pequeno e de ícone', '44', `<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">${H.peq('Subir', { f: 1 })}${H.peq('Manter', { c: 1 })}${H.peq('Tentar de novo')}<button class="ico" aria-label="Voltar">${ic.volta}</button><button class="ico" aria-label="Lixeira">${ic.lixo}</button></div>`)}
    ${am('Disparo da câmera', 'pronto · travado', `<div style="display:flex;gap:28px;justify-content:center;padding:10px"><button class="botao" aria-label="Tirar a foto">${ic.cam}</button><button class="botao" aria-disabled="true" aria-label="Travado">${ic.cadeado}</button></div>`)}
  </div>
  <h2 class="sec">Régua</h2><div class="gal">
    ${am('Peso', 'passo 0,1 · grande a cada 1', `<div class="gigante n"><span id="g-r1">77,6</span><small>kg</small></div>${regua({ mn: 60, mx: 100, st: .1, v: 77.6, cada: 1, px: 12, nome: 'Peso', un: 'kg', dec: 1, alvo: '#g-r1' })}<p class="ref">da última vez: 77,4 kg</p>`, 'Arraste, ou use os passos − e + (para quem não arrasta) e as setas do teclado. É um <b>slider</b> com o valor falado.', { cor: 'assunto-corpo' })}
    ${am('Repetição', 'passo 1 · grande a cada 5', `<div class="par" style="margin-top:0"><button data-par aria-pressed="false"><span class="rt">kg por lado</span><span class="gr n">60</span></button><span class="x">×</span><button data-par aria-pressed="true"><span class="rt">repetições</span><span class="gr n" id="g-r2">9</span></button></div>${regua({ mn: 1, mx: 30, st: 1, v: 9, cada: 5, px: 30, nome: 'Repetições', un: 'rep', alvo: '#g-r2', passos: false })}`, 'O par escolhe o que a régua muda; o escolhido fica em superfície com contorno de 2,5.', { cor: 'assunto-treino' })}
  </div>
  <h2 class="sec">Fichas, seletor, selo e segmentos</h2><div class="gal">
    ${am('Ficha de resposta', '48 · rádio', H.resp(['Foi, sim', 'Quase', 'Não lembro'], 'Foi, sim', { fundo: 1 }) + H.pergunta('Ontem ficou em branco. Foi como o plano?', 'Sem resposta, fica fora da conta.', ['Foi, sim', 'Quase', 'Não lembro']), 'Sobre o fundo, leva contorno; dentro da pergunta (areia), não precisa.')}
    ${am('Seletor em pílula', '44', H.seg(['Lado a lado', 'Cortina', 'Sobrepor'], 'Cortina') + '<div style="height:10px"></div>' + H.seg(['Dia de treino', 'Dia de descanso'], 'Dia de treino'))}
    ${am('Ficha de filtro', 'rola na horizontal', H.fichas(D.POSES.slice(0, 5).map(p => p.n), 1).replace('class="fita-f"', 'class="fita-f" style="margin:0 -14px"'))}
    ${am('Selo', '28 · sempre com palavra', `<div style="display:flex;gap:6px;flex-wrap:wrap">${H.selo('no padrão', '', ic.ok)}${H.selo('outra luz', 'a')}${H.selo('abaixo do alvo', 'q')}${H.selo('pronto para subir', 'l')}${H.selo('uma leitura só', 'a')}</div>`)}
    ${am('Segmentos', 'feito · em curso · a fazer', `<div style="display:grid;gap:14px">${H.segs(22, 8, 8)}${H.segs(11, 5, 5, [4, 7, 10])}<div class="segs g">${'ffffnfvf      '.split('').map(c => `<i class="${c.trim()}"></i>`).join('')}</div></div>`, 'Em curso é tinta a 45%, em todos (a câmera usava tangerina, que quer dizer atenção). Em "responder os dias", o traço engrossa e "não lembro" é tracejado.')}
  </div>
  <h2 class="sec">Listas e seções</h2><div class="gal">
    ${am('Linha de lista', '60 · a marca diz o que faz', `<div class="lista">${lin0}${H.lin({ t: 'Mais 6 medidas', a: 'coxa, peito, quadril · desligadas', off: 1, marca: 'mais' })}${H.lin({ t: 'Cadeira flexora sentada', a: '12 · 12 · 12 · 12 na última', sp: mini([40, 42.5, 42.5, 45, 45]), val: '45', un: 'kg' })}${H.lin({ o: 'A', oc: 'f', t: 'Treino A', a: '06h02 às 07h00 · 20 séries' })}</div>`, 'Seta abre; "+" liga ou cria; chave liga ali; nada é só leitura. Sem caixa em volta.')}
    ${am('Seção', 'título + nota', `<h2 class="h">Séries da semana <small>dia 2 de 7</small></h2><p class="txt">A nota diz o recorte, não repete o título.</p>`)}
    ${am('Quadros', '2 a 4 colunas', H.quadros([{ v: '+3,3', u: 'kg', l: 'peso', sp: mini(D.SEM) }, { v: '12,5', u: '%', l: 'gordura · +1,5', sp: mini([11, 12.5]) }]) + '<div style="height:6px"></div>' + H.quadros([{ v: '06h02', l: 'começo' }, { v: '07h00', l: 'fim' }, { v: '58 min', l: 'duração' }], 3))}
    ${am('Escolha grande', 'rádio', `<div role="radiogroup">${H.esc('', ic.dois, 'A pessoa de sempre', 'Ela já conhece. Vai direto para a câmera.', 1)}${H.esc('', ic.tripe, 'Eu, sozinho', 'Celular apoiado, contagem e voz.', 0)}</div>`, 'Contorno de 1,5 em <b>--contorno</b>; o escolhido fica lima com contorno de 2,5.')}
    ${am('Chave', 'desligada · ligada', `<div class="lista">${H.chave('Água', 'contar copos', 0)}${H.chave('Peso', 'a pesagem da manhã', 1)}</div>`, 'Desligada: trilho de superfície com contorno, bolinha de contorno. A linha inteira é o alvo.')}
  </div>
  <h2 class="sec">Avisos e estados</h2><div class="gal">
    ${am('Faixa: não guardei', 'fica até resolver', `<div class="faixa">${ic.atencao}<span>1 série não foi guardada</span><button>Ver</button></div>`)}
    ${am('Faixa: sem rede', 'some em 4 s', `<div class="faixa rede">${ic.semrede}<span>Sem rede. Tudo fica guardado neste aparelho.</span></div>`)}
    ${am('Aviso com desfazer', '6 s', `<div class="desfazer" style="position:static;animation:none"><span>Foto na lixeira por 30 dias.</span><button>Desfazer</button></div>`, 'Para o reversível com efeito longe da tela. Um de cada vez.')}
    ${am('Aviso dentro da tela', 'atenção · sugestão · certo', H.caixa('a', 'Faz 14 minutos desde a última série. Fez outras nesse tempo?', '', H.peq('Pôr em dia', { f: 1 }) + H.peq('Não, só parei')) + H.caixa('', 'Subir para 47,5 kg?', 'Na última vez você fez 12 em todas as séries com 45.', H.peq('Manter', { c: 1 }) + H.peq('Subir', { f: 1 })) + `<div class="aviso-c ok" style="margin-top:12px;margin-bottom:0">${ic.ok}<span>Tudo certo. Agora não saia do lugar.</span></div>`)}
    ${am('Vazio', 'diz o que falta e a ação', H.vazio('Uma pesagem não faz linha.', 'Com duas aparece a diferença; com uma semana, a média. Não precisa pesar todo dia.'), 'Sem ilustração, sem mascote, sem consolo.')}
    ${am('Confirmação', 'só o que não tem volta', `<h2 class="ft" style="font:var(--t-folha)">Apagar as 2 de vez?</h2><p class="txt">Elas saem do aparelho e da cópia na conta, e não voltam.</p><div class="acoes">${H.vai('Manter na lixeira')}${H.alt('Apagar de vez')}</div>`, 'O seguro é o principal; o destrutivo, o contorno com o verbo. Voltar responde o seguro.')}
  </div>
  <h2 class="sec">Campos</h2><div class="gal">
    ${am('Campo', 'repouso · erro', H.campo('E-mail', 'email', '') + H.campo('Senha', 'password', '••••', { erro: 'E-mail ou senha não conferem. Confira os dois e tente de novo.' }), 'Rótulo sempre visível acima; letra de 16 (o Safari dá zoom abaixo disso). Erro: contorno de 2,5 e uma frase.')}
    ${am('Busca e texto livre', '', `<label class="busca">${ic.lupa}<input value="agach" aria-label="Buscar"><button class="ico" aria-label="Limpar">${ic.x}</button></label><form class="diga" onsubmit="return false"><input placeholder="almocei e tomei 2 copos" aria-label="Texto livre"><button aria-label="Guardar">${ic.seta}</button></form><p class="eco">${ic.ok}<span>Guardado: almoço como o plano, 2 copos.</span></p>`)}
    ${am('Data e hora', 'régua de dias, régua de horas', `<div class="dias-f" role="radiogroup" style="margin:0 -14px">${[['qui', 12], ['sex', 13], ['sáb', 14], ['dom', 15], ['seg', 16]].map((d, i) => `<button role="radio" data-radio aria-checked="${i === 4}">${d[0]}<b>${d[1]}</b></button>`).join('')}</div>`, 'Não é calendário. Os últimos 14 dias numa fita, hoje no fim; a hora numa régua de 5 em 5 minutos. O campo nativo de data só em "outra data…".')}
  </div>
  <h2 class="sec">Gráfico, foto e comparação</h2><div class="gal">
    ${am('Gráfico de linha', 'sem grade, sem eixo Y', linha(D.SEMPTS, { pontos: D.PESAGENS, banda: [0, 74.3], h: 120, bolas: true, rotulos: ['20/09', '16/11'], rotulo: 'Peso de 74,3 para 77,6 kg' }), 'O último ponto é a bola da cor do assunto. Nome acessível diz a conclusão; os valores estão na tabela embaixo, na tela.')}
    ${am('Foto e miniaturas', '3:4', `<div style="display:grid;grid-template-columns:1fr 2fr;gap:10px">${foto(D.POSES[0], 10)}<div class="grade" style="--col:3">${D.POSES.slice(1, 7).map((p, i) => foto(p, 10, i === 3)).join('')}</div></div>`, 'O ponto de atenção marca a foto fora do padrão.')}
    ${am('Cortina', 'pega de 44', `<div class="cortina" id="cortina-g">${foto(D.POSES[0], 10)}<div class="cima">${foto(D.POSES[0], 0)}</div><div class="pega"></div><span class="et n" style="left:10px">06/07</span><span class="et n" style="right:10px">12/11</span></div>`)}
    ${am('Luzes da câmera', 'ajuste · depois', `<div class="luzes" style="margin:0">${['Nível', 'Altura', 'Distância'].map((n, i) => `<button class="${i ? '' : 'ok'}">${i ? ic.alt : ic.ok}<span>${n}<small>${i ? 'acertar' : 'certo'}</small></span></button>`).join('')}</div><div class="luzes mini">${['Nível', 'Altura', 'Distância'].map(n => `<button class="ok">${ic.ok}<span>${n}</span></button>`).join('')}</div>`)}
  </div>
  <h2 class="sec">Moldura</h2><div class="gal">
    ${am('Doca e "+"', 'aberta · encolhida', `<div class="doca" style="position:static;pointer-events:auto"><nav class="nav">${LUGARES.map((l, i) => `<button ${i === 0 ? 'aria-current="page"' : ''} aria-label="${l[1]}">${ic[l[0]]}<span>${l[1]}</span></button>`).join('')}</nav><button class="mais" aria-label="Registrar">${ic.mais}</button></div><div class="doca mini" style="position:static;pointer-events:auto;margin-top:12px"><nav class="nav"><button aria-current="page" aria-label="Hoje">${ic.hoje}<span>Hoje</span></button></nav><button class="mais" aria-label="Registrar">${ic.mais}</button></div>`, 'Some em destino, em tela de ação e com campo em foco.')}
    ${am('Tira do treino aberto', 'nos lugares', `<button class="tira" style="position:static"><i></i><span>Treino B · 8 de 22</span>${ic.seta}</button>`, 'Aparece em todos os lugares com sessão aberta. Era a lacuna da Fase 5.')}
    ${am('Linha do dia e ritmo', '', `<div class="ld">${['ok', 'agora', '', 'falta', ''].map((c, i) => `<button class="${c}"><span class="p">${c === 'ok' ? ic.ok : i === 1 ? ic.halter : ic.prato}</span><span class="n">${['05h45', '06h15', '08h00', '12h30', '16h00'][i]}</span></button>`).join('')}</div><div class="ritmo" style="margin-top:16px">${[['cheia', 'B'], ['cheia', 'C'], ['meia', ''], ['vazia', ''], ['hoje', '']].map((b, i) => `<button><span class="bola ${b[0]}">${b[1]}</span>${'STQQS'[i]}</button>`).join('')}</div>`)}
  </div></main>`;
}

/* ---------------- fluxos ---------------- */
function pagFluxos() {
  const pai = {};
  ORDEM.forEach(i => (TELAS[i].vai || []).forEach(v => { const b = v.split('--')[0]; if (!pai[b] && b !== i && TELAS[b] && TELAS[b].c !== 'lugar') pai[b] = i; }));
  ORDEM.forEach(i => { const t = TELAS[i]; if (t.c === 'folha' && !pai[i]) pai[i] = t.base; });
  const filhos = id => ORDEM.filter(i => pai[i] === id && TELAS[i].c !== 'lugar');
  const no = (id, vis) => { if (vis.has(id)) return ''; vis.add(id); const t = TELAS[id], f = filhos(id);
    return `<div class="no"><a href="#t-${id}"><i class="${t.c}">${CAMADA[t.c]}</i>${t.n}</a>${f.length ? `<div class="filhos">${f.map(x => no(x, vis)).join('')}</div>` : ''}</div>`; };
  const vis = new Set();
  const raizes = [['hoje', 'assunto-treino'], ['dias', 'assunto-corpo'], ['corpo', 'assunto-corpo'], ['semana', 'assunto-semana'], ['plano', 'assunto-refeicao']];
  const ramos = raizes.map(r => `<div class="ramo" style="--cor:var(--${r[1]})"><h3>${TELAS[r[0]].n}</h3>${filhos(r[0]).map(x => no(x, vis)).join('')}</div>`).join('');
  const soltas = ORDEM.filter(i => !vis.has(i) && TELAS[i].c !== 'lugar');
  return barra('fluxos') + `<main class="doc"><h1 class="capa">Fluxos</h1><p class="lead">De onde se chega a cada tela. Cada lugar da doca é uma raiz; embaixo, o que se abre dele, na ordem em que se abre. O Voltar desfaz exatamente uma camada: fecha a folha, ou volta ao nível de cima. Toque num item para abrir a tela no aparelho.</p>
    <div class="legm" style="margin-top:14px"><span><i style="background:var(--superficie-quieta)"></i>destino: tela cheia com voltar</span><span><i style="background:var(--assunto-treino)"></i>tela de ação: uma tarefa só</span><span><i style="background:var(--assunto-semana)"></i>folha: sobe de baixo</span></div>
    <div class="mapa">${ramos}<div class="ramo" style="--cor:var(--superficie-quieta)"><h3>De mais de um lugar</h3>${soltas.map(x => no(x, vis)).join('')}</div></div>
    <h2 class="sec">O que o Voltar desfaz</h2><div class="tab"><table><tr><th>Aberto</th><th>Voltar, Esc, véu e o Voltar do sistema</th></tr>
      <tr><td>folha</td><td>fecha a folha; a tela de baixo não mexe</td></tr><tr><td>confirmação</td><td>responde o caminho seguro</td></tr><tr><td>destino</td><td>volta à tela de onde veio, na posição de leitura em que estava</td></tr>
      <tr><td>tela de ação</td><td>recolhe; o treino continua aberto e a tira aparece nos lugares; o que foi confirmado já está guardado</td></tr><tr><td>lugar</td><td>sai do app (é a raiz)</td></tr></table></div>
    <p class="tx">Nunca: Voltar para ir ao Hoje, trocar de lugar ou descartar um treino. Trocar de lugar vai ao topo da tela.</p></main>`;
}

/* ---------------- auditoria (preenchida na etapa 5) ---------------- */
let AUD = window.AUDITORIA || null;
function pagAuditoria() {
  if (!AUD) return barra('auditoria') + `<main class="doc"><h1 class="capa">Auditoria</h1><p class="lead">Na etapa 5.</p></main>`;
  function etapa(x) {
    if (x.pendente) return ` <span class="tp">para a ${x.f}</span>`;
    return x.f ? ` <span class="tp" style="background:var(--assunto-feito)">feito, ${x.f}</span>` : '';
  }
  const tot = AUD.reduce((a, g) => a + g.a.length, 0), dado = AUD.reduce((a, g) => a + g.a.filter(x => x.t === 'dado').length, 0);
  return barra('auditoria') + `<main class="doc"><h1 class="capa">Auditoria da implementação</h1><p class="lead">O que o app construído (src/ui/v3, src/v3) faz diferente deste design system, tela por tela, com a correção. ${tot} achados; ${dado} mexem em dado ou regra e precisam de migração ou teste de domínio. É o que a próxima fase implementa. A versão escrita está em <b>05-auditoria.md</b>.</p>
    <div class="aud">${AUD.map(g => `<details><summary><span>${g.g}</span><small>${g.a.length} ${g.a.length === 1 ? 'achado' : 'achados'}</small>${ic.dir}</summary>${g.a.map(x => `<div class="ach"><b><span class="tp ${x.t === 'dado' ? 'dado' : ''}">${x.t}</span>${x.o}${etapa(x)}</b><div class="hj">Hoje: ${x.h}</div><div class="co">Correção: ${x.c}</div>${x.l ? `<div class="hj" style="font-size:12px;margin-top:2px">${x.l}</div>` : ''}</div>`).join('')}</details>`).join('')}</div></main>`;
}

/* ---------------- interações extras ---------------- */
window.armaExtras = function (raiz) {
  raiz.querySelectorAll('.cortina').forEach(co => { const mv = ev => { const r = co.getBoundingClientRect(); co.style.setProperty('--x', Math.max(4, Math.min(96, (ev.clientX - r.left) / r.width * 100)) + '%'); };
    co.addEventListener('pointerdown', ev => { co.setPointerCapture(ev.pointerId); mv(ev); }); co.addEventListener('pointermove', ev => { if (ev.buttons || ev.pointerType === 'touch') mv(ev); }); });
  const sb = raiz.querySelector('#sb'); if (sb) sb.addEventListener('input', () => { raiz.querySelector('#sb-c').style.opacity = sb.value / 100; });
  const nt = raiz.querySelector('#nt'); if (nt) { const mostra = i => { raiz.querySelector('#nt-f').innerHTML = foto(D.POSES[0], i); raiz.querySelector('#nt-d').textContent = D.SES[i][0]; raiz.querySelector('#nt-i').textContent = i + 1; raiz.querySelector('#nt-p').textContent = f1(D.SES[i][1]); nt.value = i; };
    nt.addEventListener('input', () => mostra(+nt.value)); const pl = raiz.querySelector('.nt-play'); if (pl) pl.addEventListener('click', () => { let i = 0; mostra(0); const t = setInterval(() => { i++; if (i > 10 || !document.body.contains(nt)) { clearInterval(t); return; } mostra(i); }, 420); }); }
  const mc = raiz.querySelector('#md-cur'); if (mc) mc.addEventListener('input', () => { const d = +mc.value; raiz.querySelector('#md-g').innerHTML = linha(D.SEMPTS, { pontos: D.PESAGENS, marcas: [0, 11, 25, 39, 53], cur: d, curY: D.pesoEm(Math.min(d, 55)), h: 130, x0: 0, x1: 56, rotulo: 'Peso com o cursor em ' + dataDe(d) }); raiz.querySelector('#md-d').textContent = dataDe(d); mc.setAttribute('aria-valuetext', dataDe(d)); });
  const ar = raiz.querySelector('#aj-r'), az = raiz.querySelector('#aj-z'); if (ar) { const ap = () => { const r = +ar.value, z = Math.max(+az.value, 1 + Math.abs(r) * .035); az.value = z; raiz.querySelector('#aj-f').style.transform = `rotate(${r}deg) scale(${z})`; raiz.querySelector('#aj-rv').textContent = vir(r.toFixed(1)) + '°'; raiz.querySelector('#aj-zv').textContent = vir(z.toFixed(2)) + '×'; }; ar.addEventListener('input', ap); az.addEventListener('input', ap); }
};

/* ---------------- roteamento ---------------- */
function rota() {
  const h = (location.hash || '#indice').slice(1);
  if (h.startsWith('t-')) {
    const [id, e] = h.slice(2).split('--');
    if (!TELAS[id]) { location.hash = '#indice'; return; }
    const a = P.pilha.length ? atual() : null;
    if (!a || a.id !== id || (e && a.e !== e)) { abreTela(id, e); desenhaAparelho(true); }
    return;
  }
  P.pilha = []; P.folha = null;
  const pag = { indice: pagIndice, fundamentos: pagFundamentos, componentes: pagComponentes, fluxos: pagFluxos, auditoria: pagAuditoria }[h] || pagIndice;
  $('#raiz').innerHTML = pag(); window.scrollTo(0, 0); armaReguas($('#raiz')); window.armaExtras($('#raiz'));
}
document.addEventListener('click', ev => {
  if ($('#fone')) return;
  const b = ev.target.closest('[data-radio],[data-chave],[data-par],[data-passo]'); if (!b) return;
  if (b.dataset.radio != null) { const g = b.closest('[role=radiogroup]') || b.parentElement; g.querySelectorAll('[data-radio]').forEach(x => x.setAttribute('aria-checked', x === b)); }
  if (b.dataset.chave != null) b.setAttribute('aria-checked', b.getAttribute('aria-checked') !== 'true');
  if (b.dataset.par != null) b.closest('.par').querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b));
  if (b.dataset.passo) { const r = document.getElementById(b.dataset.r); r.scrollLeft += +b.dataset.passo * +r.dataset.px; }
});
window.addEventListener('hashchange', rota);
rota();
