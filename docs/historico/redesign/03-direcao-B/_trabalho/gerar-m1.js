/* Gera ../momento-1.html: estados fixos pré-desenhados pelo mesmo código do protótipo. */
const fs=require('fs'), vm=require('vm'), path=require('path');
const T=__dirname;
const ler=f=>fs.readFileSync(path.join(T,f),'utf8');
const RENDER=ler('m1-render.js'), PROTO=ler('m1-proto.js');
vm.runInThisContext(RENDER);
const CSS=ler('base.css')+'\n'+ler('m1.css')+`
.deitada .acabou .linha-op + .linha-op{display:none}
.deitada .rot-reps{display:none}
.deitada .rep{height:56px}
.deitada .entrada{margin-top:8px;padding-top:0}
.deitada .entrada .acoes{margin-top:6px}
.deitada .sessao{padding-bottom:2px}
`;

const SPRITE=`<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">
<symbol id="i-check" viewBox="0 0 24 24"><path d="M4.5 12.5l5 5L19.5 7"/></symbol>
<symbol id="i-baixo" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></symbol>
<symbol id="i-dir" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></symbol>
<symbol id="i-esq" viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6"/></symbol>
<symbol id="i-aviso" viewBox="0 0 24 24"><path d="M12 3.5L22 20.5H2z"/><path d="M12 10v4.5M12 17.6v.1"/></symbol>
<symbol id="i-erro" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9.5"/><path d="M8.5 8.5l7 7M15.5 8.5l-7 7"/></symbol>
<symbol id="i-camera" viewBox="0 0 24 24"><path d="M3 8h4l2-3h6l2 3h4v11H3z"/><circle cx="12" cy="13" r="3.5"/></symbol>
<symbol id="i-relogio" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></symbol>
<symbol id="i-mesa" viewBox="0 0 24 24"><path d="M3 9h18M5 9v11M19 9v11M3 9l3-5h12l3 5"/></symbol>
</svg>`;

/* ---------- estados ---------- */
const S0=()=>{ const s=treinoA(); s.agora=seg(6,55); return s; };
const S2=()=>{ const s=S0(); s.hoje[3][1]=[35,10,null]; s.last={e:3,s:1,t:seg(6,55,0)}; s.cur={e:4,s:0}; s.agora=seg(6,55,4); return s; };
const S3=()=>{ const s=S2(); s.agora=seg(6,57,48); return s; };
const S4=()=>{ const s=S2(); s.extras[3]=1; s.cur={e:3,s:2}; s.agora=seg(6,55,9); return s; };
const S5=()=>{ const s=S0(); s.hoje[3]=[]; s.last={e:2,s:1,t:seg(6,45,30)}; s.cur={e:3,s:0}; s.agora=seg(6,47,10); return s; };
const S6=()=>{ const s=S5(); s.troca[3]='Puxada neutra unilateral'; s.agora=seg(6,48,20); return s; };

const base=(st)=>statusBar(st);
const fimTela='<div class="sis-base" aria-hidden="true"><i></i></div>';

const folhaTroca=`<div class="veu"></div><div class="folha-baixo" role="dialog" aria-label="Trocar exercício" style="max-height:80%">
<div class="alca"></div>
<h3 style="margin:0 0 2px;font-size:20px">Trocar Pulldown unilateral</h3>
<p style="margin:0 0 8px;font-size:14px;color:var(--prescrito)">Só hoje. O histórico vai para o exercício que você fizer (F151). Substituto não é equivalente: mantém alvo e função com a mecânica mais próxima (F106).</p>
<ul class="troca-lista">
<li><button><span class="t">Fazer o 5 agora e voltar a este</span><span class="s">Elevação lateral na máquina · nada muda no programa</span><span class="seta">${ic('i-dir')}</span></button></li>
<li><button><span class="t">Puxada neutra unilateral<i class="selo-tr">treinador</i></span><span class="frase">“Mesmo ângulo, trajetória travada.”</span><span class="s">nunca feito aqui · sem foto da máquina</span><span class="seta">${ic('i-dir')}</span></button></li>
<li><button><span class="t">Puxada unilateral na polia alta</span><span class="frase">“Perde tensão embaixo, ganha no topo.”</span><span class="s">feito 1 vez, em 12/8 · com foto da máquina</span><span class="seta">${ic('i-dir')}</span></button></li>
<li><button><span class="t">Remada unilateral na polia alta ajoelhado</span><span class="frase">“Sem apoio: lombar entra na conta.”</span><span class="s">nunca feito aqui</span><span class="seta">${ic('i-dir')}</span></button></li>
</ul>
<button class="link" style="align-self:center">Cancelar</button>${fimTela}</div>`;

function telaCarregando(){
  const st={agora:seg(6,55,1)};
  const reps=Array.from({length:7},()=>'<div class="esqueleto" style="height:64px;border-radius:16px"></div>').join('');
  return base(st)+`<div class="conteudo carregando" aria-busy="true">
  <header class="sessao"><span class="sessao-nome">Treino A</span><span class="pilula" style="opacity:.5">Peso</span>
  <p class="sessao-meta">reabrindo · lendo o registro deste aparelho · não precisa de sinal</p></header>
  <div class="esqueleto" style="height:46px;border-radius:12px;margin:2px 0 10px"></div>
  <div class="esqueleto bloco-esq" style="height:190px"></div>
  <div class="esqueleto" style="height:150px;border-radius:18px;margin-top:10px"></div>
  <div style="margin-top:auto;padding-bottom:6px">
    <div class="esqueleto" style="height:54px;border-radius:14px"></div>
    <div class="reps" style="margin-top:34px">${reps}</div>
    <p role="status" style="font-size:14px;text-align:center;margin:18px 0 4px">Volta exatamente na série 10. Se a leitura passar de 4 segundos, o motivo aparece (estado 8).</p>
  </div></div>`+fimTela;
}
function telaNaoAbriu(){
  const st={agora:seg(6,55,5)};
  return base(st)+`<div class="conteudo">
  <header class="sessao"><span class="sessao-nome">Não abriu</span></header>
  <div class="aviso erro" role="alert">${ic('i-erro')}<div>
    <p><strong>Não consegui ler o registro deste aparelho.</strong></p>
    <p>Nada foi apagado. Costuma ser uma destas duas coisas:</p>
    <p>• o app foi aberto pelo Safari em navegação privada, e não pelo ícone da Tela de Início — aí o Safari não deixa guardar nada (F55);</p>
    <p>• o endereço mudou: os dados ficam no endereço antigo, e o ícone antigo continua levando a eles (F56).</p>
    <div class="acoes-aviso"><button class="botao-tinta">Tentar de novo</button><button class="botao-sec">Detalhes técnicos</button></div>
  </div></div>
  <div class="aviso neutro" style="margin-top:12px">${ic('i-relogio')}<div><p>A leitura parou às 6:55:05, depois de 4 segundos. Nenhuma tela de “carregando” fica girando para sempre (F273).</p></div></div>
  </div>`+fimTela;
}

function telaManha(){
  const st={agora:seg(6,2)};
  const B=[['Agachamento no Smith','2 × 6–10','40 kg por lado · 80 total'],['Cadeira flexora sentada','4 × 8–12','45 kg no pino'],['Terra romeno no Smith','3 × 6–10','30 kg por lado · 60 total'],['Leg press','2 × 10–15','60 kg por lado · 120 total'],['Cadeira extensora','1 × 10–15','50 kg no pino'],['Elevação pélvica na máquina','3 × 8–12','40 kg por lado · 80 total'],['Adutora','2 × 10–15','55 kg no pino'],['Panturrilha em pé','3 × 6–10','80 kg no pino'],['Panturrilha sentada','2 × 10–15','20 kg por lado · 40 total']];
  const li=B.map((x,i)=>`<li><span class="n">${i+1}</span><span class="x">${x[0]}</span><span class="e">${x[1]}</span><span class="u">última: ${x[2]}</span></li>`).join('');
  return base(st)+`<div class="conteudo manha">
  <div style="display:flex;justify-content:space-between;align-items:center;padding-top:2px"><span class="rot" style="font-size:15px">Terça, 29 de setembro</span><button class="mesa-btn">${ic('i-mesa')}Mesa <span class="cont">2</span></button></div>
  <div class="aviso neutro" style="margin-top:8px">${ic('i-relogio')}<div>
    <p><strong>Ontem, o Treino A ficou aberto.</strong> Fechou sozinho na última série, às 7:31: 1h09, duração aproximada.</p>
    <p style="display:flex;gap:6px;flex-wrap:wrap;align-items:center"><span class="estado-ex feito">1–6 feitos</span> · <span class="estado-ex nao">7 e 8 não feitos</span> <button class="link" style="min-height:32px">corrigir o fim</button></p>
  </div></div>
  <h3>Treino B</h3>
  <p class="sub">Pernas completas + panturrilhas · 9 exercícios · 22 séries</p>
  <div style="display:flex;gap:8px"><button class="botao-tinta" style="flex:1">Começar agora</button><button class="pilula">Peso <b>anotar</b></button></div>
  <p style="font-size:13px;margin:6px 2px 0">Começar agora conta o aquecimento. Ou só registre a primeira série: a sessão começa nela (F152).</p>
  <ul class="lista-ex">${li}</ul>
  </div>`+fimTela;
}

function telaPaisagem(){
  const s=S0();
  return `<div class="paisagem-escala"><div class="tela deitada" aria-label="Instrumento em paisagem">
  <div class="lado-sis" aria-hidden="true"><span class="entalhe-v"></span></div>
  <div class="col">${cabecalho(s)}${trilho(s)}${cartao(s)}</div>
  <div class="col">${painel(s)}${entrada(s)}</div>
  <div class="lado-sis" aria-hidden="true"></div><span class="base-h" aria-hidden="true"></span>
  </div></div>`;
}

function telaRecortes(){
  return `<div class="recortes">
  <div><h4>Trilho: os quatro estados de um exercício (F153)</h4><div class="caixa leg-trilho">
    <div><span class="seg feito"><span>1</span><span class="pts"><i class="f"></i><i class="f"></i><i class="f"></i></span></span>feito</div>
    <div><span class="seg parcial"><span>4</span><span class="pts"><i class="f"></i><i></i></span></span>parcial</div>
    <div><span class="seg pulado"><span>7</span><span class="pts"><i class="x"></i><i class="x"></i></span></span>pulado — decisão declarada (F154)</div>
    <div><span class="seg nao"><span>8</span><span class="pts"><i></i><i></i></span></span>não feito — deduzido, não gravado</div>
  </div></div>
  <div><h4>Topo da faixa na última vez (F168, F95)</h4><div class="caixa">
    <div class="entrada-topo"><p class="entrada-titulo">Série 1 de 3</p><p class="entrada-ref">última: 25 × 15 · 15 · 15</p></div>
    <div class="carga" style="border-color:var(--tinta);border-width:2px"><span class="rot">Carga</span><b class="valor">25</b><span class="unid">kg no pino<br>igual à última</span><button class="botao-sec">mudar</button></div>
    <p style="font-size:14px;margin:8px 2px 0"><b>Topo da faixa nas 3 séries.</b> Pela dupla progressão do treinador, é hora de subir no menor incremento da máquina e recomeçar perto da base — se a técnica e o RIR planejado se mantiveram. A carga não muda sozinha: o app não sabe o incremento desta máquina.</p>
  </div></div>
  <div><h4>Dor no mesmo exercício nas duas últimas sessões (F172, F102)</h4>
    <div class="aviso alerta">${ic('i-aviso')}<div><p><strong>Cotovelo marcado nas 2 últimas sessões</strong> de Extensão de tríceps acima da cabeça no cabo.</p><p>Regra do treinador: tirar por 2 semanas e trocar o ângulo; nunca empurrar por cima.</p>
    <div class="acoes-aviso"><button class="botao-sec">Ver substitutos</button><button class="botao-sec">Fazer hoje mesmo assim</button></div></div></div></div>
  <div><h4>Deload (F173, F104)</h4><div class="caixa"><header class="sessao" style="padding:0"><span class="sessao-nome">Treino C <span class="delta" style="font-size:13px">deload</span></span>
    <p class="sessao-meta">metade das séries, mesmas cargas, RIR 3–4, sem falha · <b>4</b> de 10 séries</p></header></div></div>
  <div><h4>Volta de pausa (F168)</h4><div class="caixa"><div class="entrada-topo" style="margin:0"><p class="entrada-titulo">Série 1 de 2</p><p class="entrada-ref">última: 15/9, há 15 dias</p></div>
    <p style="font-size:14px;margin:6px 2px 0">Mais de 14 dias sem este exercício: sem indicação de subir carga.</p></div></div>
  <div><h4>Peso da manhã, anotado entre séries (02-uso, K6)</h4><div class="caixa" style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
    <span class="pilula">Peso <b style="color:var(--tinta)">73,8</b>${ic('i-check','p')}</span><span class="pilula">Água <b>3</b><span class="mais">+1</span></span>
    <p style="font-size:14px;margin:0;flex-basis:100%">7 de 11 pesagens do mês entraram no registro entre 6h28 e 7h52, na janela do treino. O peso fica a um toque do instrumento, com o teclado próprio.</p></div></div>
  <div><h4>Rede</h4><div class="caixa"><p style="font-size:14px;margin:0">Nenhum indicador de rede no treino. Gravar não depende dela (F72) e “sem rede” é o normal do subsolo (F25, F248). A sincronia aparece só na mesa, onde dá para agir sobre ela.</p></div></div>
  </div>`;
}

function telaMesa(){
  const st={agora:seg(20,40)};
  return base(st)+`<div class="conteudo mesa">
  <button class="link" style="padding-left:0">${ic('i-esq')} Dia</button>
  <h3>Mesa</h3>
  <p class="sub">Sentado, com tempo. O que ficou para decidir.</p>
  <div class="decisao"><p class="q">Treino A · seg 28/9</p><h4>Série a mais em Pulldown unilateral: 3 em vez de 2</h4>
    <p>Se virar programa, dorsal passa de 10 para 11 séries por semana, contra 10 do treinador (F179). Ele pede extrair progresso das 90 antes de somar séries (F99).</p>
    <div class="bts"><button class="a">Só naquele dia</button><button class="b">Mudar o programa</button></div></div>
  <div class="decisao"><p class="q">Treino E · qui 24/9</p><h4>Supino inclinado com halteres no lugar de Supino inclinado no Smith</h4>
    <p>Smith ocupado. Trocar no programa recomeça a conta de 6 a 8 semanas daquela posição (F98, F162).</p>
    <div class="bts"><button class="a">Só naquele dia</button><button class="b">Trocar no programa</button></div></div>
  <div class="decisao"><p class="q">Treino A · seg 28/9</p><h4>A sessão fechou sem você às 7:31</h4>
    <p>Duração aproximada de 1h09, até a última série (F152). Se você saiu em outra hora, corrija.</p>
    <div class="bts"><button class="a">Está certo</button><button class="b">Corrigir o fim</button></div></div>
  <div class="secoes-mesa">
    <button>Semanas<span>peso, comida, força, séries</span></button>
    <button>Fotos e medidas<span>comparar, avaliar</span></button>
    <button>Programa<span>o seu × o do treinador</span></button>
    <button>Comida<span>plano, alimentos, compras</span></button>
    <button>Aula de HYROX<span>pesos usados, lousas</span></button>
    <button>Aparelho<span>sincronizado 20:38 · cópias</span></button>
  </div>
  </div>`+fimTela;
}

/* ---------- molduras ---------- */
function estado(id,rot,titulo,texto,fatos,tela,cls){
  return `<section class="estado${cls?' '+cls:''}" id="${id}" aria-labelledby="${id}-t">
<div class="legenda"><p class="rot">${rot}</p><h2 id="${id}-t">${titulo}</h2>${texto.map(p=>`<p>${p}</p>`).join('')}${fatos?`<p class="fatos">${fatos}</p>`:''}</div>
${tela}
</section>`;
}
const tela=(html,attrs)=>`<div class="tela"${attrs||''}>${html}</div>`;

const E=[];
E.push(estado('e1','Estado 1 · o caso · tocável','6:55. A série 9 acabou há 1:24; a 10 está pronta para um toque.',
 ['Ao desbloquear, a tela já está na próxima série, com a carga da última vez (35 kg) e as repetições da última vez marcadas (9). Saiu uma a mais: toque no 10. É o único toque obrigatório — a série grava no toque, sem botão de salvar (F171, F95).',
  'Em cima, a série que acabou (a 9) aceita RIR e dor, os dois opcionais. Embaixo, ao alcance do polegar, a próxima.'],
 'Toque para experimentar: repetições, RIR, dor, “mudar” (teclado do app), “+ série”, “Trocar”, o trilho, Peso, Água e o nome do treino. Cargas são exemplo; nomes, faixas, RIR alvo e descansos são os do Treino A (F84). O chest press repete o exemplo do treinador: 9/8/7 na última, 10/9/8 hoje (F95).',
 tela(instrumento(S0()),' data-proto aria-label="Protótipo tocável do instrumento de série"')));
E.push(estado('e2','Estado 2 · depois do toque','Gravou. O recibo diz o que ficou guardado, e a próxima série já está sob o polegar.',
 ['Pulldown unilateral fechou 2 de 2, com “+1 rep” marcado contra a última vez. O próximo é a Elevação lateral na máquina: 25 kg e 13 repetições na última. O relógio do descanso começa no instante da gravação.',
  'Se ele quiser uma terceira série, o botão tracejado está ali mesmo, sem menu (P12).'],
 'O recibo vem do que foi lido de volta do aparelho: um toque que não gravou nunca parece gravado (F296, F294).',
 tela(instrumento(S2()))));
E.push(estado('e3','Estado 3 · variação do caso','Voltou de um aplicativo de conversa: o descanso foi contado pelo relógio.',
 ['Com outro app na frente, este fica suspenso (F57). Ao voltar, a conta é feita pela hora de parede: 2:48 desde a série. Passou do lembrete e nada pisca nem fica vermelho — o tempo prescrito é lembrete, não ordem; o critério do treinador é voltar quando der para outra série boa (F97, F29).',
  'O RIR da série que acabou continua oferecido, sem cobrar.'],
 'Nenhum alarme: com o aparelho bloqueado o app não roda, o Safari não vibra, e som só toca depois de um toque (F57, F58). Um aviso que falha calado seria pior que nenhum.',
 tela(instrumento(S3(),{notaRelogio:'pelo relógio:'}))));
E.push(estado('e4','Estado 4 · variação do caso','Uma série além das prescritas, por ali mesmo.',
 ['O “+ 3ª série” do estado 2 abriu uma terceira linha na tabela, marcada como extra. A guia é a série 2 de hoje, porque não existe série 3 na última vez (F170).',
  'Ela fica só neste dia. Se vai virar programa, quem pergunta é a mesa, depois, sentado (F159).'],
 'O dono pediu: “deveria ser mais fácil, direto… por ali já” (P12).',
 tela(instrumento(S4()))));
E.push(estado('e5','Estado 5 · máquina ocupada','A primeira saída é fazer outro antes; a segunda, o substituto.',
 ['Máquina ocupada é comum numa academia grande (F26), e muitas vezes ela libera em dois minutos: por isso a primeira opção é ir ao próximo e voltar pelo trilho, sem mexer em nada.',
  'Depois vêm os substitutos do treinador, com o indicado por ele marcado, a frase do que muda e se ele já fez aquilo — quase nunca fez (F106, F107, F109).'],
 'As três frases são exemplos reais do treinador (F108); qual frase pertence a qual substituto, este desenho não sabe. Datas e cargas são exemplo.',
 tela(instrumento(S5(),{overlay:folhaTroca}))));
E.push(estado('e6','Estado 6 · vazio','Primeira vez no substituto: sem referência, e o teclado é do app.',
 ['Não existe última vez para Puxada neutra unilateral: a carga começa vazia e as repetições só destravam depois dela. A série de hoje vira a referência da próxima.',
  'O teclado numérico é desenhado pelo app: tem vírgula decimal (32,5), não provoca zoom, ocupa uma área fixa e não empurra nada (F63, F61, F65, F66). Sem foto desta máquina, o cartão convida a fotografar a etiqueta e o pino (F224, F110).'],
 null,
 tela(instrumento(S6(),{fotoVazia:true,overlay:'<div class="veu"></div>'+teclado('Carga · Puxada neutra unilateral','32,5','Primeira vez: sem referência. Tipo de carga: no pino — corrigível em “Mais” (F140).')}))));
E.push(estado('e7','Estado 7 · carregando','Reabrindo às 6:55: o iOS tinha fechado o app enquanto ele estava bloqueado.',
 ['Tudo vem do aparelho; abrir não depende de sinal (F72). O esqueleto tem o desenho exato do instrumento, para nada pular de lugar quando os dados chegam.'],
 'Orçamento declarado de abertura no subsolo (F73).',
 tela(telaCarregando())));
E.push(estado('e8','Estado 8 · erro ao abrir','Não abriu: o erro diz o que pode ser e o que fazer.',
 ['Nada foi apagado. As causas que o app consegue reconhecer estão escritas em português, não em código; para quem mantém o código (F5), os detalhes ficam a um toque.'],
 null, tela(telaNaoAbriu())));
E.push(estado('e9','Estado 9 · erro ao gravar','Não gravou: a série fica na tela, marcada como não gravada.',
 ['Navegação privada recusa guardar (F55); armazenamento cheio também (F53). Em vez de recibo, a célula da série fica vermelha com “não gravou”, o 10 pede “de novo”, e o aviso diz o caminho.',
  'É a lição dos 48 dias em que escolher um alimento não fazia nada e ninguém viu (F296).'],
 null,
 tela(instrumento(S0(),{falhou:[35,10],semCabecalho:true,banner:`<div class="aviso erro" role="alert" style="margin:2px 0 8px">${ic('i-erro')}<div><p><strong>Não gravou.</strong> Navegação privada: o Safari recusa guardar, e 35 × 10 está só na tela. Abra pelo ícone da Tela de Início e toque de novo.</p></div></div>`}))));
E.push(estado('e10','Estado 10 · o caso ruim','Na manhã seguinte: a sessão de ontem ficou aberta, e ninguém cobra.',
 ['Fechar a sessão falha em 42% a 59% das vezes (P1). Esta direção não depende disso: a sessão aberta fecha sozinha na última série, com duração aproximada (F152), e o app mostra um recibo com “corrigir” — não uma pergunta.',
  'Os exercícios 7 e 8, cortados pela hora (P2), aparecem como não feitos, sem culpa. As duas decisões do dia esperam na mesa (estado 13).'],
 'Hoje é o Treino B porque a sequência anda pela ordem, não pelo dia (F81). Carga em máquina de anilha aparece “por lado”, com o total ao lado (F140, F141). Cargas são exemplo.',
 tela(telaManha())));
E.push(estado('e11','Estado 11 · telefone deitado','No banco, em paisagem: a tela gira e continua gravando.',
 ['O iOS não deixa o app travar a orientação (F60). Em paisagem, o essencial continua a um toque: repetições, RIR e o relógio. Dor e troca ficam em “Mais”.'],
 null, telaPaisagem(), 'largo'));
E.push(estado('e12','Estado 12 · outros estados do instrumento','O que mais o instrumento precisa mostrar, recortado.',
 ['Os estados de exercício, a indicação de subir carga, a dor repetida, o deload, a volta de pausa, o peso anotado entre séries e o que acontece com a rede.'],
 null, `<div class="tela recorte">${telaRecortes()}</div>`));
E.push(estado('e13','Estado 13 · para onde vão as decisões','Depois, sentado: a mesa recebe o que o treino deixou.',
 ['Tudo que é decisão sobre o programa sai da academia e espera aqui, com os números que cada decisão pede (F159, F179, F98, F162). A mesa é o mesmo app, aberto sentado — no telefone ou no notebook (F50).'],
 'É a recusa desta direção em ação: nada disso foi perguntado em pé.',
 tela(telaMesa())));

const INDICE=['o caso','depois do toque','voltou de outro app','série extra','máquina ocupada','vazio','carregando','erro ao abrir','erro ao gravar','manhã seguinte','paisagem','outros estados','mesa'];

const html=`<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Visto · Momento 1</title>
<meta name="description" content="Direção B (Visto), momento 1: entre duas séries, na academia, com o relógio contra.">
<style>
${CSS}
</style>
</head>
<body>
${SPRITE}
<header class="capa">
<p class="sobre">Direção B · Visto</p>
<h1>Momento 1 — entre duas séries, na academia, com o relógio contra</h1>
<p>O caso do 02-uso: a décima série de uma sessão começada às 6:22. São 6:55, o descanso prescrito é de 2 minutos, o celular está bloqueado na mão com música, o sinal é fraco, e a série saiu com a mesma carga da última vez e uma repetição a mais.</p>
<p><b>A tese:</b> registrar é dar visto na prescrição. O que saiu como previsto custa um toque; só o desvio custa digitação; e nada que exija decidir é perguntado a quem está em pé.</p>
<div class="chave">
<span><i class="amostra" style="background:var(--tinta)"></i>tinta azul: o que você fez hoje</span>
<span><i class="amostra" style="background:var(--prescrito)"></i>grafite: o previsto — a prescrição e a última vez</span>
<span><i class="amostra" style="border:2px dashed var(--borda)"></i>tracejado: fora da faixa, extra, ou à espera</span>
</div>
<div class="tema" role="group" aria-label="Tema"><button data-v="auto">Do sistema</button><button data-v="claro">Claro</button><button data-v="escuro">Escuro</button></div>
<ul class="indice">${INDICE.map((t,i)=>`<li><a href="#e${i+1}">${i+1} · ${t}</a></li>`).join('')}</ul>
</header>
<main class="estados">
${E.join('\n')}
</main>
<p id="anuncio" class="sr" aria-live="polite"></p>
<script>
${RENDER}
${PROTO}
(function(){var h=document.documentElement,bs=document.querySelectorAll('.tema button');
function set(v){ if(v==='auto') h.removeAttribute('data-tema'); else h.setAttribute('data-tema',v); bs.forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.v===v));}); try{localStorage.setItem('visto-tema',v);}catch(e){} }
var v=h.getAttribute('data-tema')||'auto'; try{v=localStorage.getItem('visto-tema')||v;}catch(e){} set(v);
bs.forEach(function(b){b.addEventListener('click',function(){set(b.dataset.v);});});})();
(function(){function escala(){document.querySelectorAll('.paisagem-escala').forEach(function(w){var t=w.firstElementChild,s=Math.min(1,w.clientWidth/896);t.style.transform='scale('+s+')';w.style.height=(414*s)+'px';});}
addEventListener('resize',escala);escala();})();
</script>
</body>
</html>
`;
fs.writeFileSync(path.join(T,'..','momento-1.html'),html);
console.log('momento-1.html',html.length,'bytes');
