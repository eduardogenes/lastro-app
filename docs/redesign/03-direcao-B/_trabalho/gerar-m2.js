/* Gera ../momento-2.html: estados fixos pré-desenhados pelo mesmo código do protótipo. */
const fs=require('fs'), vm=require('vm'), path=require('path');
const T=__dirname;
const ler=f=>fs.readFileSync(path.join(T,f),'utf8');
const RENDER=ler('m2-render.js'), PROTO=ler('m2-proto.js');
vm.runInThisContext(RENDER);
const CSS=ler('base.css')+'\n'+ler('m2.css')+`
.lembra{font-size:14px;margin:0 2px 8px;color:var(--grafite)}
.recortes{padding:16px;display:flex;flex-direction:column;gap:14px}
.recortes h4{margin:0 0 6px;font-size:13px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;color:var(--prescrito)}
.recortes .caixa{background:var(--papel);border-radius:16px;padding:10px;border:1px solid var(--linha)}
.recortes .caixa p{font-size:14px;margin:6px 2px 0}
.mesa-t h3{font-size:26px;margin:4px 0 0;letter-spacing:-.01em}
.mesa-t .sub{margin:2px 0 10px;color:var(--prescrito);font-size:15px}
.saida{background:var(--folha);border:2px solid var(--grafite);border-radius:18px;padding:12px 14px;margin-top:10px}
.saida .q{font-size:12px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;color:var(--prescrito);margin:0}
.saida h4{font-size:22px;margin:2px 0 6px}
.saida p{font-size:14px;margin:0 0 6px}
.saida .bt-off{margin-top:6px;width:100%;min-height:48px;border-radius:14px;border:1.5px dashed var(--borda);font-weight:700;font-size:15px;color:var(--prescrito);text-align:center}
`;

const SPRITE=`<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">
<symbol id="i-check" viewBox="0 0 24 24"><path d="M4.5 12.5l5 5L19.5 7"/></symbol>
<symbol id="i-esq" viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6"/></symbol>
<symbol id="i-dir" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></symbol>
<symbol id="i-aviso" viewBox="0 0 24 24"><path d="M12 3.5L22 20.5H2z"/><path d="M12 10v4.5M12 17.6v.1"/></symbol>
<symbol id="i-erro" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9.5"/><path d="M8.5 8.5l7 7M15.5 8.5l-7 7"/></symbol>
<symbol id="i-relogio" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></symbol>
<symbol id="i-mesa" viewBox="0 0 24 24"><path d="M3 9h18M5 9v11M19 9v11M3 9l3-5h12l3 5"/></symbol>
</svg>`;
const fimTela='<div class="sis-base" aria-hidden="true"><i></i></div>';

/* ---------- estados ---------- */
const H1=()=>diaHoje();
const H2=()=>{ const s=diaHoje(); s.marcas.lanche={p:1,t:'15:32'}; s.agora=seg(15,32,10); return s; };
function ontem(comoFoi){
  const s=diaHoje();
  Object.assign(s,{titulo:'Ontem',voltar:'Hoje',data:'quinta, 1 de outubro',tipo:'dia de treino',agora:seg(13,41),hojeReal:false,curto:'ontem',
    pilulas:[['Peso','73,8',true],['Treino D','6:18',true]],
    marcas:{pre:{p:1,t:'13:41',d:'2/10'},intra:{p:1,t:'13:41',d:'2/10'},cafe:{p:1,t:'8:41'},almoco:{p:0.5,t:'13:41',d:'2/10'},lanche:{p:1,t:'15:32'}},
    agua:null,comoFoi:comoFoi,q:{ini:[19,9],hoje:13,alvo:12,k:[]}});
  s.ref.forEach(r=>{ if(r.id==='jantar') r.obs='sem visto: comeu fora do plano — ver “como foi o dia”'; });
  return s;
}
const H5=()=>{ const s=diaHoje(); s.agora=seg(7,50); s.marcas={}; s.pilulas=[['Peso','73,8',true],['Treino D','6:18',true],['Cardio','anotar',false]]; return s; };
function noite(){
  const pre=clone(PRE); pre.h=seg(17,45); pre.antes='5:45'; pre.itens='pão Artesano 35 g · doce de leite 20 g · canela 1 g · sem o café depois das 16h (F192)';
  const intra=clone(INTRA); intra.h=seg(18,15); intra.antes='6:15';
  const jan=clone(JANTAR); jan.h=seg(19,45); jan.antes='19:30'; jan.tag='pós-treino';
  return {titulo:'Hoje',data:'quarta, 7 de outubro',tipo:'treino às 18:15',agora:seg(17,20),hojeReal:true,
    pilulas:[['Peso','73,9',true],['Treino C','18:15',false]],
    ref:[clone(CAFE),clone(ALMOCO),clone(LANCHE),pre,intra,jan],total:3007,
    marcas:{cafe:{p:1,t:'8:20'},almoco:{p:1,t:'12:58'},lanche:{p:1,t:'16:05'}},agua:7,comoFoi:null,
    q:{ini:[24,9],hoje:13,alvo:13,k:[7,8,9,10,11,12]},mesa:0};
}

/* ---------- telas próprias ---------- */
function telaSemPlano(){
  const st={agora:seg(8,5)};
  return statusBar(st)+`<div class="conteudo">
  <div class="dia-cab"><div><h3>Hoje</h3><p>quinta, 1 de outubro</p></div><button class="mesa-btn">${ic('i-mesa')}Mesa</button></div>
  <div class="aviso neutro" style="margin-top:8px;flex-direction:column;gap:6px">
    <p style="font-size:19px;font-weight:800">Este aparelho não tem plano alimentar.</p>
    <p>Sem plano, não há o que marcar. O plano vem do seu nutricionista, de fora do app (F2).</p>
    <div class="acoes-aviso" style="flex-direction:column;align-items:stretch">
      <button class="botao-tinta">Restaurar uma cópia de segurança</button>
      <button class="botao-sec">Entrar na conta e trazer do outro aparelho</button>
    </div>
    <p style="font-size:14px;margin-top:6px">Abriu por um endereço novo? Os dados ficam no endereço antigo, e o ícone antigo continua levando a eles (F56).</p>
  </div>
  ${blocoAgua({agua:null})}
  <p class="totais">A água não depende do plano: dá para contar mesmo assim.</p>
  </div>`+fimTela;
}
function telaCarregando(){
  const st={agora:seg(15,32,1)};
  const l=Array.from({length:6},()=>'<div class="esqueleto" style="height:46px;border-radius:10px;margin:6px 0"></div>').join('');
  return statusBar(st)+`<div class="conteudo" aria-busy="true">
  <div class="dia-cab"><div><h3>Hoje</h3><p>quinta, 1 de outubro</p></div><span class="mesa-btn" style="opacity:.5">${ic('i-mesa')}Mesa</span></div>
  <div class="esqueleto" style="height:44px;border-radius:12px;margin:6px 0 8px"></div>
  <div class="esqueleto" style="height:62px;border-radius:16px;margin-bottom:10px"></div>
  <div class="esqueleto" style="height:190px;border-radius:20px;margin-bottom:10px"></div>
  ${l}
  <p role="status" style="font-size:14px;text-align:center;margin:14px 0 0">Lendo o plano e as marcas deste aparelho. Não precisa de sinal. Se passar de 4 segundos, aparece o motivo.</p>
  </div>`+fimTela;
}
function telaPorEmDia(){
  const st={agora:seg(21,14)};
  const dias=[
    ['qui','1/10','hoje · Treino D','k','3 vistos · conhecido',null],
    ['qua','30/9','dia de treino','u','sem visto',['Dia como no plano','Abrir']],
    ['ter','29/9','dia de treino','k','✓ dia como no plano · marcado hoje 21:12, 2 dias depois',['Desfazer','Abrir']],
    ['seg','28/9','dia de treino','u','sem visto',['Dia como no plano','Abrir']],
    ['dom','27/9','descanso','u','sem visto · mais de 3 dias: abra e marque o que lembrar',['Abrir']],
    ['sáb','26/9','dia de treino','u','sem visto',['Abrir']],
    ['sex','25/9','dia de treino','u','sem visto',['Abrir']],
    ['qui','24/9','dia de treino','u','sem visto',['Abrir']],
  ];
  const li=dias.map(d=>`<li><span class="dd">${d[0]}<small>${d[1]}</small></span><div><span class="est${d[3]==='k'?' k':''}">${d[4]}</span><br><span class="tipo">${d[2]}</span></div>${d[5]?`<div class="bts">${d[5].map((b,i)=>`<button class="${i===0&&b.startsWith('Dia')?'t':''}">${b}</button>`).join('')}</div>`:''}</li>`).join('');
  return statusBar(st)+`<div class="conteudo">
  <div class="dia-cab"><div><button class="voltar">${ic('i-esq')}Hoje</button><h3>Pôr em dia</h3><p>os últimos 14 dias de comida</p></div></div>
  ${faixa14({q:{ini:[18,9],hoje:13,alvo:-1,k:[11,13]},marcas:{},comoFoi:null})}
  <p class="lembra">Marcando todo dia daqui em diante, a regra do nutricionista volta a ter adesão por volta de <b>10/10</b>. Dia que você não lembra pode ficar desconhecido: a regra só não o usa (F198). Inventar é pior que deixar em branco.</p>
  <ul class="dias-lista">${li}</ul>
  <p class="totais">… e mais 6 dias, até sex 18/9, todos sem visto.</p>
  </div>${fimTela}<div class="dobra" aria-hidden="true"></div>`;
}
function telaRecortes(){
  const descanso={hojeReal:false,marcas:{cafe:{p:1,t:'9:10'}},ref:[clone(CAFE),clone(ALMOCO),clone(LANCHE),clone(JANTAR)]};
  const alta=clone(INTRA); alta.itens='água 600 ml · maltodextrina 25 g'; alta.kcal=95; alta.sub='água 600 ml · maltodextrina 25 g · 95 kcal';
  const metade={hojeReal:false,marcas:{lanche:{p:0.5,t:'16:12'}},ref:[clone(LANCHE)]};
  return `<div class="recortes">
  <div><h4>Dia de descanso (F186, F183)</h4><div class="caixa">
    <div class="titulo-lista" style="margin-top:0"><span class="rot">Domingo, 4/10 · descanso</span><span>4 refeições · 2.844 kcal</span></div>
    <ul class="refeicoes">${descanso.ref.map(r=>linha(descanso,r,null)).join('')}</ul>
    <p>Sem pré e sem treino: só existem em dia de treino. O tipo do dia vem da sessão registrada; sem ela, do padrão da semana, que é palpite (F187).</p></div></div>
  <div><h4>Dia de alta demanda (F181, F186)</h4><div class="caixa">
    <ul class="refeicoes">${linha({hojeReal:false,marcas:{}},alta,null)}</ul>
    <p>A maltodextrina só entra quando o dia é marcado como de alta demanda: 3.102 kcal no dia.</p></div></div>
  <div><h4>Só metade (F195, F199)</h4><div class="caixa"><ul class="refeicoes">${metade.ref.map(r=>linha(metade,r,null)).join('')}</ul>
    <p>Metade conta metade na adesão. A porção vale só para aquele dia; o plano não muda (F196).</p></div></div>
  <div><h4>Água contada</h4><div class="caixa" style="padding:0;border:0;background:none">${blocoAgua({agua:6})}</div></div>
  <div><h4>Ceia</h4><div class="caixa"><p style="margin-top:0">O plano não tem ceia (F182). Quando ele come uma, o desenho não inventa uma linha: o dia vira “saí do plano, sei o que comi”. Se a ceia deve virar dado, é pergunta ao dono.</p></div></div>
  </div>`;
}
function telaRegra(){
  const st={agora:seg(21,30)};
  const barras=Array.from({length:14},(_,i)=>`<i style="height:10px;border-radius:3px;background:${i===13?'var(--tinta)':'var(--linha)'}"></i>`).join('');
  return statusBar(st)+`<div class="conteudo mesa-t">
  <button class="voltar" style="margin-top:2px">${ic('i-esq')}Mesa</button>
  <h3>Peso e comida</h3>
  <p class="sub">A regra do nutricionista, com os números que a produziram (F215).</p>
  <ul class="semanas">
    <li><span>13 a 19/9</span><span class="num">73,45 kg</span><span class="peq">2 pesagens</span></li>
    <li><span>20 a 26/9</span><span class="num">73,50 kg</span><span class="peq">+0,05 /sem</span></li>
    <li><span>27/9 a 3/10</span><span class="num">73,55 kg</span><span class="peq">+0,05 /sem</span></li>
  </ul>
  <ul class="semanas" style="margin-top:8px">
    <li><span>Força</span><span class="num">+0,4%</span><span class="peq">ruído: não subindo</span></li>
    <li style="grid-template-columns:1fr auto"><span>Adesão: dias com consumo conhecido</span><span class="num">1 de 14</span><span style="grid-column:1/-1" class="barras-ades">${barras}</span></li>
  </ul>
  <section class="saida" aria-label="Saída da regra">
    <p class="q">A regra diz</p>
    <h4>Não mexer e registrar mais.</h4>
    <p>Ganho abaixo de 0,10 kg por semana nas duas últimas semanas e força parada: com adesão registrada, a saída seria <b>+150 kcal</b>. Falta adesão: 1 dia conhecido de 14; a regra pede 11 (F212, F213).</p>
    <p>Marcando todo dia, ela decide por volta de 11/10.</p>
    <button class="bt-off" disabled>Aplicar +150 kcal — só com adesão</button>
  </section>
  </div>`+fimTela;
}

/* ---------- molduras ---------- */
function estado(id,rot,titulo,texto,fatos,tela,cls){
  return `<section class="estado${cls?' '+cls:''}" id="${id}" aria-labelledby="${id}-t">
<div class="legenda"><p class="rot">${rot}</p><h2 id="${id}-t">${titulo}</h2>${texto.map(p=>`<p>${p}</p>`).join('')}${fatos?`<p class="fatos">${fatos}</p>`:''}</div>
${tela}
</section>`;
}
const tela=(html,attrs)=>`<div class="tela alta"${attrs||''}>${html}</div>`;
const telaFixa=(html)=>`<div class="tela">${html}</div>`;
const nota=(cls,icone,html)=>`<div class="aviso ${cls}" style="margin:2px 0 8px">${ic(icone)}<div>${html}</div></div>`;

const E=[];
E.push(estado('e1','Estado 1 · o caso, primeira parte · tocável','15:32, no trabalho. O lanche está em cima, pronto para um toque.',
 ['Abrir o app fora do treino cai no dia de hoje, e a refeição mais perto do relógio sobe para um cartão próprio, com o que o plano manda e a nota do nutricionista (F181, F182). Comeu tudo: um toque em “Comi tudo”. Não há tela de busca, não há quantidade a digitar.',
  'Embaixo, o dia inteiro na ordem do relógio. O que passou sem visto fica com o mesmo par de botões: dá para marcar agora o almoço esquecido, com outro toque.'],
 'Toque para experimentar: “Comi tudo”, “Só metade”, os ½ e “tudo” das linhas, “desfazer”, a água e “como foi o dia”. A faixa dos 14 dias muda quando o dia passa a ser conhecido. Plano, quantidades, horários e notas são os do nutricionista (F181–F183).',
 tela(dia(H1()),' data-proto aria-label="Protótipo tocável da folha do dia"')));
E.push(estado('e2','Estado 2 · depois do toque','Visto dado. A linha guarda a hora, e o desfazer fica ali mesmo.',
 ['O lanche virou uma linha com “tudo” e 15:32 — a hora do toque, que é o que o produto guarda (F197). A conta pelo plano sobe para 1.448 kcal, e embaixo aparece o que ainda falta hoje: o jantar das 19:30. É o “conferir o que falta comer” da vida real (F30, F40).',
  'Nada pergunta “tem certeza?”: desfazer está na própria linha, sem prazo.'],
 null,
 tela(dia(H2(),{antesLista:'<p class="lembra">Pré-treino, treino e almoço passaram sem visto. Dá para marcar agora ou amanhã; o visto guarda a hora em que foi dado.</p>'}))));
E.push(estado('e3','Estado 3 · o caso, segunda parte · o caso ruim','No dia seguinte, 13:41: o dia de ontem, de memória.',
 ['É a forma em que a comida chega hoje ao registro: dias depois, de memória (P1). Por isso ontem é a mesma folha de hoje, a um toque da faixa dos 14 dias, com os mesmos botões.',
  'O almoço foi pela metade: ½. O jantar saiu do plano, e ele sabe o que comeu: o jantar fica sem visto e o dia leva “Saí do plano, sei o que comi” — é assim que o produto guarda isso (F195). A água ficou sem conta, e aparece como “não contada”, não como zero.'],
 'Os vistos dados hoje dizem “marcado 2/10 13:41”; os do dia mesmo, só a hora. O dia é conhecido e conta para a regra (F200).',
 tela(dia(ontem('sabe'),{banner:nota('neutro','i-relogio','<p><b>Marcando de memória</b>, sexta 2/10 às 13:41. Cada visto guarda a hora em que foi dado (F197).</p>'),
   resultado:'<div class="aviso neutro resultado">'+ic('i-check')+'<div><p><b>Quinta 1/10 conta para a regra:</b> consumo conhecido. O almoço pela metade conta metade (F199); o jantar fora do plano não entra na conta do plano.</p></div></div>'}))));
E.push(estado('e4','Estado 4 · variação do caso ruim','Se ele não sabe quanto comeu, o dia fica desconhecido — e a tela diz isso.',
 ['Mesmo dia, com “Saí do plano, não sei quanto”. Os cinco vistos continuam guardados, mas o dia sai da conta da regra, e a faixa dos 14 dias volta a mostrar “?” para quinta.',
  'Escrito por extenso, porque já houve o contrário: esse dia contava como registro e destravava corte de comida (F292).'],
 null,
 tela(dia(ontem('naosabe'),{banner:nota('neutro','i-relogio','<p><b>Marcando de memória</b>, sexta 2/10 às 13:41.</p>'),
   resultado:'<div class="aviso alerta resultado">'+ic('i-aviso')+'<div><p><b>Quinta 1/10 fica desconhecido para a regra</b>, mesmo com 5 vistos: se não se sabe quanto comeu, não se sabe o dia (F200).</p></div></div>'}))));
E.push(estado('e5','Estado 5 · vazio','7:50, nada marcado: o vazio é o plano esperando, não uma tela em branco.',
 ['Um dia sem visto é desconhecido, não zero (F198), e a tela fala assim. O cartão de agora já é o café da manhã das 8:00, marcado como pós-treino porque o treino foi de manhã (F191).'],
 null,
 tela(dia(H5(),{banner:nota('neutro','i-relogio','<p><b>Hoje ainda sem visto.</b> Sem nenhum, o dia fica desconhecido — um buraco nos 14 dias.</p>')}))));
E.push(estado('e6','Estado 6 · vazio de verdade','Sem plano neste aparelho: o que fazer, e por que pode ter acontecido.',
 ['Aparelho novo sem plano já foi um defeito real (F271). Aqui o vazio explica de onde o plano vem e oferece os dois caminhos que existem: restaurar a cópia de segurança ou trazer da conta (F249, F10). A água continua contável.'],
 null, telaFixa(telaSemPlano())));
E.push(estado('e7','Estado 7 · carregando','Abrindo: o desenho do dia, antes dos dados.',
 ['Tudo vem do aparelho. O esqueleto tem a forma exata da folha, para nada pular de lugar; se a leitura passar de 4 segundos, o motivo aparece, como no estado 8 do momento 1 (F273).'],
 null, telaFixa(telaCarregando())));
E.push(estado('e8','Estado 8 · erro ao gravar','Não gravou: o botão volta a esperar, e ninguém vê um visto que não existe.',
 ['Com o armazenamento cheio (F53), o toque em “Comi tudo” não vira visto: o cartão fica vermelho, diz o motivo e pede outro toque. O aviso no alto aponta o que ocupa espaço.',
  'Por 48 dias, escolher um alimento não fez nada, sem erro nenhum, e ninguém notou (F296). Esta direção trata isso como regra: todo visto mostrado foi lido de volta do aparelho.'],
 null,
 tela(dia(H1(),{falhou:true,banner:nota('erro','i-erro','<p><b>O aparelho está sem espaço para o registro.</b> O café das 8:41 está guardado; o lanche, não.</p><div class="acoes-aviso"><button class="botao-sec">Ver o que ocupa espaço</button></div>')}))));
E.push(estado('e9','Estado 9 · treino à noite','Dia com treino às 18:15: os horários andaram com a sessão.',
 ['A regra do nutricionista move o pré, o treino e a refeição que cair dentro da sessão; nada é criado, apagado ou fundido (F189, F190). A folha mostra o horário novo e, riscado, o de antes. O jantar vira o pós-treino (F191). O pré perde o café depois das 16h (F192).'],
 'Data hipotética, uma semana depois do caso, já com 7 dias conhecidos na faixa.',
 tela(dia(noite(),{banner:nota('neutro','i-relogio','<p>Treino hoje às 18:15: o pré, o treino e o jantar andaram juntos, como manda o nutricionista.</p>')}))));
E.push(estado('e10','Estado 10 · pôr em dia','Os 14 dias: onde estão os buracos, e o atalho para os dias recentes.',
 ['Pôr em dia é a segunda situação mais frequente medida (02-uso, U11). A faixa dos 14 dias abre esta lista. Para os três últimos dias existe “Dia como no plano”: um toque marca todas as refeições como inteiras e o dia como “segui o plano”, com a data em que foi dado — “2 dias depois”.',
  'Dias mais antigos só abrem para marcar o que ele lembrar: a memória de uma semana atrás não aguenta um “dia inteiro” honesto.'],
 'O limite de 3 dias para o atalho é escolha deste desenho; está nas perguntas ao dono.',
 tela(telaPorEmDia())));
E.push(estado('e11','Estado 11 · outros estados da folha','O que mais a folha do dia precisa mostrar, recortado.',
 ['Dia de descanso, dia de alta demanda, refeição pela metade, água contada e a ceia, que o plano não tem.'],
 null, `<div class="tela recorte">${telaRecortes()}</div>`));
E.push(estado('e12','Estado 12 · para que serve o visto','Na mesa, sentado: a regra do nutricionista, e o que falta para ela decidir.',
 ['O passo de ±150 kcal nunca foi aplicado e a avaliação nunca rodou com adesão (P1). A tela mostra por quê, com os números da regra: o que ela diria, e o que falta — dias conhecidos. É aqui que cada visto do dia vira motivo.'],
 'Pesos de exemplo dentro da faixa real (F13); a forma da saída é a da regra consolidada (F212, F215).',
 telaFixa(telaRegra())));

const INDICE=['o caso','depois do toque','ontem, de memória','não sei quanto','vazio','sem plano','carregando','erro ao gravar','treino à noite','pôr em dia','outros estados','a regra'];

const html=`<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Visto · Momento 2</title>
<meta name="description" content="Direção B (Visto), momento 2: depois de comer, no meio do dia.">
<style>
${CSS}
</style>
</head>
<body>
${SPRITE}
<header class="capa">
<p class="sobre">Direção B · Visto</p>
<h1>Momento 2 — depois de comer, no meio do dia</h1>
<p>O caso do 02-uso: o lanche de por volta de 15h30, no trabalho, comido inteiro; e, no dia seguinte, o dia anterior reconstituído de memória — o almoço pela metade, o jantar fora do plano sabendo o que comeu, e a água sem conta.</p>
<p>Medido: um dia com refeição marcada em 22, e as marcações daquele dia foram feitas 1 e 4 dias depois (P1). A dificuldade aqui não é o corpo nem a pressa: é o registro não acontecer. Por isso a mesma folha serve para hoje e para os dias que ficaram para trás.</p>
<p><b>A tese:</b> registrar é dar visto na prescrição. O que saiu como previsto custa um toque; só o desvio custa digitação; e nada que exija decidir é perguntado a quem está em pé.</p>
<div class="chave">
<span><i class="amostra" style="background:var(--tinta)"></i>tinta azul: o que você marcou</span>
<span><i class="amostra" style="background:var(--prescrito)"></i>grafite: o que o plano manda</span>
<span><i class="amostra" style="border:2px dashed var(--borda)"></i>linha tracejada: onde a tela do telefone acaba</span>
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
</script>
</body>
</html>
`;
fs.writeFileSync(path.join(T,'..','momento-2.html'),html);
console.log('momento-2.html',html.length,'bytes');
