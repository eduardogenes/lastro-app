// O programa do treinador e o catálogo que vem do código. Dado puro: nada aqui
// lê o estado, o que torna este módulo importável direto por teste e pelos
// geradores de docs — que antes precisavam subir um jsdom só para alcançar
// `PROGRAMA` dentro do escopo do script.

import type { Exercicio, IdEx, Treino, TipoCarga } from './tipos';

/** Um exercício como o treinador o prescreveu. */
export interface ExercicioPrescrito extends Exercicio {
  /** séries */
  s: number;
  /** faixa de repetições */
  r: string;
  /** descanso em segundos */
  d: number;
  /** repetições na reserva alvo, como '1–2'. É prescrição: o MESMO exercício
   *  pode pedir reservas diferentes em dias diferentes. */
  rir?: string;
}

/** Substituto indicado pelo treinador. `w` é o que muda ao trocar. */
export interface Substituto { n: string; w: string; }

/** Uma regra da aba de execução. */
export interface Regra { k: string; t: string; warn: 0 | 1; p: string[]; }

/** Níveis de prioridade muscular, do mais para o menos prioritário. */
export type Nivel = 'maxima' | 'secundaria' | 'normal' | 'indireto';

/** Como um tipo de carregamento se apresenta na tela. */
export interface Carga {
  /** rótulo da unidade no campo */
  rot: string;
  nome: string;
  ajuda: string;
  /** 1 quando o app mostra também o total (dois lados / duas mãos) */
  dobra?: 1;
  cada?: string;
  total?: string;
  obs?: string;
}

// Cinco treinos, não seis. O sexto dia disponível não vira automaticamente
// mais um treino: a quinta-feira entre C e D é descanso com cardio, e é
// deliberada — é ela que permite chegar em D, o treino de especialização, com
// desempenho para gastar onde o retorno estético é maior.
//
// A ordem carrega a prioridade: peito superior e deltoide lateral aparecem nos
// primeiros exercícios de A e D, os dois melhores momentos da semana.
export const ROT_BASE: string[] = ['A','B','C','D','E'];

// Descanso em segundos, pelas categorias do treinador: grande composto 3 min,
// máquina multiarticular 2,5 min, o intervalo de 2 min que a prescrição nova
// usa bastante, isolador 1:45 e curto 1:30. O critério real não é o
// cronômetro: a próxima série começa quando dá para fazer outra de alta
// qualidade.
export const D_COMPOSTO = 180, D_MAQUINA = 150, D_MEDIO = 120, D_ISOLADOR = 105, D_CURTO = 90;

// O programa do treinador, congelado. Não é o que abre na tela: é a semente do
// seu programa (S.prog), o alvo de comparação do volume e o que o botão de
// restaurar devolve. Editar aqui é mudar a prescrição, não a sua execução.
export const PROGRAMA: Record<string, Treino<ExercicioPrescrito>> = {
  A: { name:'Peito superior + dorsais + lateral + tríceps', tag:'os três alvos com você inteiro', ex:[
    {n:'Chest press inclinado convergente', car:'pino', g:'peito superior', s:3, r:'6–10', c:1, d:D_COMPOSTO, rir:'1–2', cue:'Primeiro exercício da semana, no melhor momento de desempenho que existe. Banco a 20 ou 30° se a máquina permitir: mais que isso vira desenvolvimento de ombro.'},
    {n:'Pulldown convergente', car:'pino', g:'dorsal', s:3, r:'6–10', c:1, d:D_MAQUINA, rir:'1–2', cue:'Pegada neutra, a que permitir maior amplitude confortável. Largura de dorsal se constrói aqui.'},
    {n:'Crucifixo inclinado no cabo', car:'pino', g:'peito superior', s:2, r:'10–15', c:0, d:D_MEDIO, rir:'1', cue:'Amplitude grande e confortável. Não sacrifique a posição do ombro para tentar alongar mais.'},
    {n:'Pulldown unilateral', car:'pino', g:'dorsal', s:2, r:'8–12', c:1, d:D_MEDIO, rir:'1', cue:'Cotovelo descendo em direção ao quadril, sem transformar em rotação de tronco.'},
    {n:'Elevação lateral na máquina', car:'pino', g:'delt lateral', s:4, r:'10–15', c:0, d:D_ISOLADOR, rir:'1', cue:'Sem impulso de perna ou tronco. Não precisa ultrapassar muito a linha do ombro. A última série pode ir a 0 ou 1 na reserva.'},
    {n:'Extensão de tríceps acima da cabeça no cabo', car:'pino', g:'tríceps', s:2, r:'8–12', c:0, d:D_MEDIO, rir:'1', cue:'Cabeça longa alongada. Se o cotovelo reclamar, reduza a amplitude final.'},
    {n:'Pushdown', car:'pino', g:'tríceps', s:2, r:'10–15', c:0, d:D_ISOLADOR, rir:'0–1', cue:'Tríceps não é prioridade: já recebe bastante dos presses. Duas séries bem feitas bastam.'},
  ]},
  B: { name:'Quadríceps + panturrilha + abdômen', tag:'ponto forte com volume eficiente', ex:[
    {n:'Pendulum squat', car:'lado', g:'quadríceps', s:3, r:'6–10', c:1, d:D_COMPOSTO, rir:'1–2', cue:'Quadríceps é seu ponto forte: o volume caiu de propósito, a intenção não. Hack squat serve igual.'},
    {n:'Cadeira flexora sentada', car:'pino', g:'posterior', s:2, r:'8–12', c:0, d:D_MEDIO, rir:'1', cue:'Entra aqui em dose baixa para o posterior receber estímulo duas vezes na semana.'},
    {n:'Leg press', car:'lado', g:'quadríceps', s:2, r:'10–15', c:1, d:D_MAQUINA, rir:'1–2', cue:'Amplitude completa sem soltar a lombar do banco.'},
    {n:'Cadeira extensora', car:'pino', g:'quadríceps', s:2, r:'10–15', c:0, d:D_ISOLADOR, rir:'0–1', cue:'A última série pode ir bem perto da falha.'},
    {n:'Adutora', car:'pino', g:'adutores', s:2, r:'10–15', c:0, d:D_ISOLADOR, rir:'1', cue:'Manutenção e progressão. Adutores contribuem para uma coxa completa.'},
    {n:'Panturrilha em pé', car:'pino', g:'panturrilha', s:4, r:'6–10', c:0, d:D_MEDIO, rir:'1', cue:'Na máquina, joelho estendido. Execução rígida: descida completa, pequena pausa alongado, subida completa. Nada de virar 10 repetições em 20 meios movimentos de tornozelo.'},
    {n:'Crunch no cabo ou máquina', car:'pino', g:'abdômen', s:3, r:'8–15', c:0, d:D_ISOLADOR, rir:'1', cue:'Com carga progressiva. Abdômen é treinado como qualquer outro músculo.'},
  ]},
  C: { name:'Costas + posterior de ombro + lateral + bíceps', tag:'largura e espessura separadas', ex:[
    {n:'Remada para dorsal com apoio de peito', car:'lado', g:'dorsal', s:3, r:'6–10', c:1, d:D_MAQUINA, rir:'1–2', cue:'Cotovelo mais junto do tronco, trajetória em direção ao quadril. Esta é a remada de DORSAL.'},
    {n:'High row com apoio de peito', car:'lado', g:'costas espessura', s:3, r:'8–12', c:1, d:D_MAQUINA, rir:'1–2', cue:'Cotovelo relativamente mais aberto, puxando para a região superior e média das costas. Função diferente da anterior — não são duas máquinas fazendo a mesma coisa.'},
    {n:'Pullover em máquina ou cabo', car:'pino', g:'dorsal', s:2, r:'10–15', c:0, d:D_MEDIO, rir:'1', cue:'Estímulo na dorsal sem adicionar fadiga de bíceps.'},
    {n:'Reverse pec deck', car:'pino', g:'delt posterior', s:3, r:'12–20', c:0, d:D_ISOLADOR, rir:'0–1', cue:'Posterior está proporcional: progressão normal, com o tronco apoiado.'},
    {n:'Elevação lateral unilateral no cabo', car:'pino', g:'delt lateral', s:4, r:'12–20', c:0, d:D_CURTO, rir:'0–1', cue:'Tensão previsível e ajuste fino, um lado por vez. Sem balanço.'},
    {n:'Rosca Scott na máquina', car:'pino', g:'bíceps', s:2, r:'8–12', c:0, d:D_ISOLADOR, rir:'1', cue:'Sem balanço de tronco.'},
    {n:'Rosca martelo', car:'halter', g:'bíceps', s:2, r:'10–15', c:0, d:D_ISOLADOR, rir:'1', cue:'Braquial e braquiorradial, que dão espessura ao braço de lado.'},
  ]},
  D: { name:'Especialização de upper', tag:'o treino mais importante da semana', ex:[
    {n:'Supino inclinado no Smith', car:'lado', g:'peito superior', s:3, r:'6–10', c:1, d:D_COMPOSTO, rir:'1–2', cue:'Peito superior volta a ser o exercício número 1. Alta estabilidade e ótima capacidade de progressão: é aqui que a carga sobe ao longo dos meses.'},
    {n:'Remada convergente com apoio de peito', car:'lado', g:'costas espessura', s:3, r:'8–12', c:1, d:D_MAQUINA, rir:'1–2', cue:'Tronco apoiado tira a lombar da conta.'},
    {n:'Chest press horizontal convergente', car:'pino', g:'peito', s:2, r:'8–12', c:1, d:D_MAQUINA, rir:'1', cue:'Preserva o peito médio sem tirar o foco da região clavicular.'},
    {n:'Crossover de baixo para cima', car:'pino', g:'peito superior', s:2, r:'10–15', c:0, d:D_ISOLADOR, rir:'1', cue:'Segundo estímulo clavicular do dia, estável e pouco fatigante. Direcione à porção clavicular, sem virar elevação frontal.'},
    {n:'Elevação lateral na máquina', car:'pino', g:'delt lateral', s:4, r:'10–20', c:0, d:D_ISOLADOR, rir:'0–1', cue:'Segunda exposição semanal pesada de lateral. Pode chegar perto da falha mantendo o movimento lateral.'},
    {n:'Rosca Bayesian no cabo', car:'pino', g:'bíceps', s:2, r:'10–15', c:0, d:D_ISOLADOR, rir:'1', cue:'Braço atrás do corpo, alongando a cabeça longa.'},
    {n:'Extensão de tríceps acima da cabeça no cabo', car:'pino', g:'tríceps', s:2, r:'10–15', c:0, d:D_ISOLADOR, rir:'1', cue:'Fecha o tríceps em 6 séries diretas na semana, somado ao A.'},
  ]},
  E: { name:'Posteriores + glúteos + panturrilha + abdômen', tag:'equilíbrio com a coxa anterior', ex:[
    {n:'Cadeira flexora sentada', car:'pino', g:'posterior', s:3, r:'8–12', c:0, d:D_MEDIO, rir:'1', cue:'Primeiro de propósito: o isquiotibial começa a repetição mais alongado aqui do que em muitas flexoras deitadas.'},
    {n:'Terra romeno no Smith', car:'lado', g:'posterior', s:3, r:'6–10', c:1, d:D_COMPOSTO, rir:'1–2', cue:'Smith porque, para o seu objetivo, estabilidade é vantagem e não defeito. Quadril para trás, coluna neutra, amplitude até onde a mecânica se mantém.'},
    {n:'Mesa flexora deitada', car:'pino', g:'posterior', s:2, r:'10–15', c:0, d:D_ISOLADOR, rir:'0–1', cue:'Excêntrica de 3 s. Fecha o posterior em 10 séries na semana.'},
    {n:'Elevação pélvica na máquina', car:'lado', g:'glúteo', s:3, r:'8–12', c:1, d:D_MAQUINA, rir:'1', cue:'Pausa no topo com o queixo para dentro.'},
    {n:'Panturrilha sentada', car:'lado', g:'panturrilha', s:4, r:'10–15', c:0, d:D_ISOLADOR, rir:'1', cue:'Joelho flexionado, para o sóleo. Pause no alongamento. Nada de quicar.'},
    {n:'Panturrilha no leg press', car:'lado', g:'panturrilha', s:2, r:'10–15', c:0, d:D_ISOLADOR, rir:'0–1', cue:'Joelho estendido. Com o treino B, fecha 10 séries de panturrilha na semana.'},
    {n:'Ab wheel', car:'corpo', g:'abdômen', s:3, r:'6–12', c:0, d:D_ISOLADOR, rir:'1', cue:'De joelhos e com amplitude parcial. Só aumente quando estiver fácil.'},
  ]},
};

export const RULES: Regra[] = [
  {k:'regra 1', t:'O RIR alvo está escrito em cada exercício', warn:0, p:[
    'Nos compostos — pendulum, presses, terra romeno, remadas pesadas — <b>1 a 2 na reserva</b>. Não é para falhar nesses toda sessão.',
    'Nos isoladores, <b>0 a 1 nas últimas séries</b> é aceitável: lateral, extensora, flexora, pec deck, roscas, pushdown, panturrilha.',
    'Falha é ferramenta, não definição de série eficiente. Treinar PERTO dela é o que se quer; transformar toda série em falha absoluta cobra caro na recuperação.',
    'Registre o <b>RIR da última série</b> de cada exercício. É o que diz se você está mesmo produzindo mais trabalho de qualidade com o tempo — "55 kg × 10" sozinho não diz.']},
  {k:'regra 2', t:'Dupla progressão: primeiro repetição, depois carga', warn:0, p:[
    'Numa faixa de 6 a 10, você sobe as repetições mantendo a carga até bater o topo em todas as séries: 55 kg em 9/8/7, depois 10/9/8, depois 10/10/10.',
    'Aí sim aumenta a carga, <b>no menor incremento prático da máquina</b>, e recomeça mais perto da parte baixa da faixa — algo como 8/7/6. <b>O app avisa quando todas as séries batem o topo.</b>',
    'Não aumente peso porque conseguiu uma repetição feia no limite. A progressão precisa acontecer mantendo <b>amplitude, técnica, alvo muscular e o RIR planejado</b>.']},
  {k:'regra 3', t:'Excêntrica controlada em tudo', warn:0, p:[
    'Seu músculo fica forte mais rápido do que o tendão consegue se adaptar. Tendão responde a <b>tensão ao longo do tempo</b>, não a peso jogado.',
    'Descer devagar é o principal escudo contra lesão no seu contexto, e ainda aumenta o estímulo de crescimento.']},
  {k:'regra 4', t:'Descanso pelo desempenho, não pelo cronômetro', warn:0, p:[
    'Cada exercício já traz o descanso prescrito: <b>3 min</b> nos grandes compostos, 2,5 min nas máquinas multiarticulares, 2 min nos intermediários, 1:30 a 1:45 nos isoladores.',
    'O critério real é outro: a próxima série começa quando você consegue de novo fazer uma série de <b>alta qualidade</b>. O cronômetro do app é lembrete, não ordem.']},
  {k:'regra 5', t:'Não troque exercício toda semana', warn:0, p:[
    'Mantenha os principais por <b>6 a 8 semanas</b>, desde que não provoquem dor articular, você consiga sentir e progredir no músculo alvo, a máquina siga disponível e a técnica esteja melhorando.',
    'Seu corpo não precisa ser confundido. O que se quer é acumular meses de dados comparáveis.']},
  {k:'volume', t:'Não acrescente séries agora', warn:0, p:[
    'O programa caiu de 125 para <b>93 séries por semana</b>, de propósito. A redução saiu de onde o retorno era baixo — costas, posterior de ombro, quadríceps, braços —, não uniformemente.',
    'Sua primeira tarefa é <b>extrair progresso deste volume</b>. Só considere acrescentar quando, depois de várias exposições: recuperação boa, sem dor articular, desempenho não caindo, execução sólida <b>e</b> uma prioridade estagnada apesar de esforço e progressão adequados.',
    'Nesse caso são <b>1 a 2 séries no músculo específico</b> — não 10 séries espalhadas pelo programa.']},
  {k:'fadiga', t:'Quando reduzir em vez de insistir', warn:0, p:[
    'Sinais que aparecem juntos: queda de repetições ou carga por 2 a 3 sessões, o mesmo exercício ficando progressivamente pior, musculatura dolorida por mais de 72 h, queda clara de disposição, cotovelo, ombro ou joelho reclamando, dificuldade de manter o RIR habitual.',
    'Aí a hipótese certa é <b>fadiga acumulada</b>, não falta de estímulo. Investigue antes de presumir que precisa de mais.']},
  {k:'atenção', t:'Dor de tendão não se treina por cima', warn:1, p:[
    'Dor muscular difusa no dia seguinte é normal. <b>Dor pontual em cotovelo, ombro da frente ou joelho abaixo da patela é outra coisa.</b>',
    'Apareceu: tire aquele exercício por 2 semanas e substitua por outro ângulo. Nunca empurre porque "está fraquinha".']},
  {k:'aquecimento', t:'Aproximação, não 20 min de aquecimento genérico', warn:0, p:[
    'Antes do primeiro exercício pesado: <b>3 a 4 séries de aproximação</b> — carga bem leve × 8 a 10, depois 50 a 60% da carga de trabalho × 5, depois 70 a 80% × 2 a 4. Sem chegar perto da falha.',
    'No segundo exercício grande, <b>1 a 2 aproximações</b> bastam. Isoladores no fim do treino normalmente não precisam de nenhuma.',
    'Séries de aproximação <b>não entram no volume</b> — o app não as conta e você não as registra.']},
  {k:'deload', t:'Deload por evidência, não por calendário', warn:0, p:[
    'Não existe "semana 6 é deload obrigatório". <b>Se você continua progredindo, continue treinando.</b>',
    'Quando houver evidência clara de fadiga acumulada — os sinais da regra de fadiga —, faça <b>5 a 7 dias</b> com 50 a 60% das séries habituais, as mesmas técnicas, <b>3 a 4 na reserva</b> e sem falha. Depois volte.',
    'Cortar volume e manter a intensidade é o que permite o tecido conjuntivo se recuperar sem perder a adaptação.']},
  {k:'bike', t:'2x por semana, leve a moderado', warn:0, p:[
    'Colocação: <b>segunda, depois do treino A, 20 a 25 min</b>; <b>quinta, no dia de recuperação, 25 a 30 min</b>.',
    'Intensidade: respirando mais forte, mas ainda conseguindo conversar. <b>Sem transformar em HIIT.</b>',
    'Cardio moderado nessa dose não atrapalha hipertrofia. Evite antes de B ou E, e nunca antes do treino — a bike é condicionamento e saúde, não outro treino de perna.']},
  {k:'prioridades', t:'Onde a recuperação está sendo gasta', warn:0, p:[
    'Prioridade 1: <b>peitoral superior</b> e <b>deltoide lateral</b>. Prioridade 2: <b>dorsais em largura</b> e <b>panturrilhas</b>. Eles recebem os melhores momentos da semana, não as sobras.',
    'Por isso não há desenvolvimento militar (deltoide anterior já recebe bastante dos presses) nem encolhimento direto (trapézio não é limitação visual, e remadas e RDL já dão estímulo). Quadríceps, seu ponto forte, cedeu volume — não foi abandonado.',
    'Prioridade não é cargo vitalício: quando uma dessas regiões deixar de ser deficiência, a programação muda.']},
  {k:'sucesso', t:'O que conta como dar certo nos próximos meses', warn:0, p:[
    'Não é só o peso na balança. São quatro coisas ao mesmo tempo: <b>peso subindo bem devagar</b>, <b>cintura estável</b>, <b>progressão clara em peito superior, lateral, dorsal e panturrilha</b>, e a mudança aparecendo relaxado, não só em pose.',
    'O alvo visual: mais preenchimento clavicular, maior distância visual de ombro a ombro, o V aparecendo mesmo relaxado, e a panturrilha acompanhando a coxa.']},
];

// Substitutos do mesmo padrão de movimento, para quando a máquina está ocupada.
// Não são equivalentes: mantêm o alvo e a função, com a mecânica mais próxima
// disponível numa academia grande. O 'w' diz o que muda ao trocar — sem isso a
// substituição vira sorteio.
export const ALT: Record<string, Substituto[]> = {
  // A
  'Chest press inclinado convergente': [
    {n:'Supino inclinado no Smith', w:'Indicado pelo treinador. Mesmo ângulo, trajetória travada.'},
    {n:'Máquina de supino inclinado', w:'Indicada pelo treinador, se for plate-loaded. Convergência menor, resto igual.'},
    {n:'Supino inclinado com halteres', w:'Mais amplitude, mais exigência de estabilidade.'}],
  'Crossover de baixo para cima': [
    {n:'Crucifixo inclinado no cabo', w:'Indicado pelo treinador. Mesma região, menos vetor ascendente.'},
    {n:'Crossover na polia baixa', w:'Praticamente o mesmo movimento.'},
    {n:'Peck deck com banco inclinado', w:'Trajetória guiada, alongamento menor.'}],
  'Elevação lateral na máquina': [
    {n:'Elevação lateral unilateral no cabo', w:'Indicada pelo treinador. Um lado por vez, tensão previsível.'},
    {n:'Elevação lateral no cabo', w:'Tensão constante, carga menor.'},
    {n:'Elevação lateral com halteres', w:'Perde tensão embaixo, ganha no topo.'}],
  'Elevação lateral unilateral no cabo': [
    {n:'Elevação lateral na máquina', w:'Indicada pelo treinador. Mais carga, menos ajuste fino.'},
    {n:'Elevação lateral com halteres', w:'Dois lados de uma vez, mais rápido.'},
    {n:'Elevação lateral deitado no banco inclinado', w:'Pico de tensão mais cedo na amplitude.'}],
  'Extensão de tríceps acima da cabeça no cabo': [
    {n:'Extensão acima da cabeça ou máquina de tríceps', w:'Indicada pelo treinador. Trajetória guiada, mesmo alongamento da cabeça longa.'},
    {n:'Tríceps francês com halter', w:'Um braço por vez, corrige assimetria.'},
    {n:'Tríceps testa com barra W', w:'Mesma cabeça longa, mais cobrança no cotovelo.'}],
  'Pushdown': [
    {n:'Tríceps corda na polia', w:'Mesma coisa com rotação no fim.'},
    {n:'Tríceps barra reta na polia', w:'Pega fixa, dá para carregar mais.'},
    {n:'Mergulho na máquina assistida', w:'Entra peito e ombro junto.'}],
  'Crunch no cabo ou máquina': [
    {n:'Máquina de abdominal', w:'Indicada pelo treinador. Trajetória guiada, mais fácil de carregar.'},
    {n:'Abdominal na polia alta ajoelhado', w:'Mesmo padrão, é a versão no cabo.'},
    {n:'Crunch com anilha no colo', w:'Sem equipamento, carga limitada.'}],
  // B
  'Pulldown convergente': [
    {n:'Puxada neutra no cabo', w:'Indicada pelo treinador. Mesma pegada, tensão do cabo em vez da placa.'},
    {n:'Puxada neutra na máquina', w:'Sem convergência, resto igual.'},
    {n:'Barra fixa assistida pegada neutra', w:'Peso do corpo, escápula mais livre.'}],
  'Pulldown unilateral': [
    {n:'Puxada neutra unilateral', w:'Indicada pelo treinador: é a máquina unilateral de dorsal.'},
    {n:'Puxada unilateral na polia alta', w:'Tensão constante, carga menor.'},
    {n:'Remada unilateral na polia alta ajoelhado', w:'Ângulo mais horizontal.'}],
  'Remada para dorsal com apoio de peito': [
    {n:'Remada unilateral apoiada', w:'Indicada pelo treinador. Um lado por vez, com o tronco apoiado.'},
    {n:'Remada baixa na polia com triângulo', w:'Mesmo ângulo de cotovelo, cabo em vez de placa.'},
    {n:'Remada sentada pegada neutra fechada', w:'Sem apoio: lombar entra na conta.'}],
  'Pullover em máquina ou cabo': [
    {n:'Straight-arm pulldown', w:'Indicado pelo treinador. Braço mais estendido, mesma função.'},
    {n:'Pullover na polia alta', w:'É a versão no cabo do mesmo movimento.'},
    {n:'Pullover com halter no banco', w:'Mais alongamento, resistência só no meio.'}],
  'Reverse pec deck': [
    {n:'Crucifixo inverso no cabo', w:'Amplitude maior, carga menor.'},
    {n:'Crucifixo inverso com halteres no banco inclinado', w:'Sem tensão no fim da amplitude.'},
    {n:'Face pull na polia alta', w:'Mais rotação externa junto.'}],
  'Crucifixo inverso no cabo': [
    {n:'Reverse pec deck', w:'Mais carga, tronco apoiado.'},
    {n:'Crucifixo inverso com halteres', w:'Perde tensão na parte baixa.'},
    {n:'Face pull na polia alta', w:'Mais rotação externa junto.'}],
  'Rosca Scott na máquina': [
    {n:'Rosca Scott no cabo', w:'Indicada pelo treinador. Mesma posição, tensão constante.'},
    {n:'Rosca Scott com barra W', w:'Mesma posição, pulso mais confortável.'},
    {n:'Rosca concentrada', w:'Um braço por vez, mais lenta.'}],
  'Rosca no cabo': [
    {n:'Rosca direta na barra W', w:'Mais carga, tensão irregular.'},
    {n:'Rosca Bayesian no cabo', w:'Braço atrás do corpo, mais alongamento.'},
    {n:'Rosca alternada com halteres', w:'Um lado por vez, com supinação.'}],
  // C
  'Pendulum squat': [
    {n:'Agachamento hack', w:'Mesma ideia, curva de resistência diferente.'},
    {n:'Belt squat', w:'Tira a carga da coluna.'},
    {n:'Leg press vertical', w:'Mais quadril, menos joelho.'}],
  'Leg press': [
    {n:'Agachamento hack', w:'Indicado pelo treinador — como o pendulum, ajustando o volume para não somar duas vezes o mesmo estímulo.'},
    {n:'Leg press 45°', w:'É a mesma máquina em outro ângulo.'},
    {n:'Leg press horizontal', w:'Amplitude menor, lombar mais protegida.'}],
  'Cadeira extensora': [
    {n:'Extensora unilateral', w:'Um lado por vez, corrige diferença.'},
    {n:'Sissy squat na máquina', w:'Alonga o reto femoral, mais duro no joelho.'},
    {n:'Leg press com pé baixo', w:'Composto: cansa mais para o mesmo alvo.'}],
  'Adutora': [
    {n:'Adutora em pé na polia', w:'Um lado por vez, amplitude maior.'},
    {n:'Agachamento sumô no Smith', w:'Composto, entra quadríceps e glúteo.'},
    {n:'Leg press com pé afastado', w:'Adutor como coadjuvante, não como alvo.'}],
  'Panturrilha em pé': [
    {n:'Panturrilha no Smith', w:'Indicada pelo treinador. Precisa de degrau, amplitude igual.'},
    {n:'Panturrilha no hack', w:'Indicada pelo treinador. Ombro apoiado, fácil de carregar.'},
    {n:'Panturrilha na máquina em pé', w:'É a mesma coisa em outro equipamento.'}],
  'Panturrilha sentada': [
    {n:'Panturrilha sentada na máquina', w:'Indicada pelo treinador: a máquina específica de sóleo.'},
    {n:'Panturrilha sentada no Smith', w:'Indicada pelo treinador. Barra sobre o joelho, amplitude igual.'},
    {n:'Panturrilha no leg press com joelho flexionado', w:'Menos sóleo isolado.'}],
  'Tibial anterior': [
    {n:'Tibial na máquina', w:'Mesmo alvo, carga mais fácil de ajustar.'},
    {n:'Tibial com anilha sentado', w:'Sem equipamento, carga limitada.'},
    {n:'Flexão de tornozelo na polia baixa', w:'Tensão constante.'}],
  // E
  'Remada convergente com apoio de peito': [
    {n:'Remada cavalinho', w:'Sem apoio: lombar e quadril entram.'},
    {n:'Remada na máquina com apoio de peito', w:'Sem convergência, resto igual.'},
    {n:'Remada curvada com barra', w:'Muito mais custo sistêmico.'}],
  'Remada horizontal na máquina': [
    {n:'Remada sentada na polia', w:'Cabo em vez de placa, mesma trajetória.'},
    {n:'Remada baixa pegada pronada', w:'Cotovelo mais aberto, mais upper back.'},
    {n:'Remada na máquina pegada larga', w:'Desloca para a parte alta das costas.'}],
  'High row com apoio de peito': [
    {n:'Remada alta na máquina', w:'Indicada pelo treinador: a máquina de upper back row. Mesmo ângulo sem o apoio de peito.'},
    {n:'Remada na polia alta sentado', w:'Tensão constante, carga menor.'},
    {n:'Remada cavalinho pegada larga', w:'Sem apoio, lombar entra.'}],
  'Encolhimento na máquina': [
    {n:'Encolhimento com halteres', w:'Pega mais exigente, mesma função.'},
    {n:'Encolhimento no Smith', w:'Trajetória fixa, dá para carregar mais.'},
    {n:'Encolhimento na polia baixa', w:'Tensão constante no topo.'}],
  'Straight-arm pulldown': [
    {n:'Pullover na polia alta', w:'Praticamente o mesmo movimento.'},
    {n:'Pullover em máquina', w:'Trajetória guiada, mais estável.'},
    {n:'Pullover com halter no banco', w:'Mais alongamento, resistência só no meio.'}],
  'Supino inclinado no Smith': [
    {n:'Chest press inclinado convergente', w:'Indicado pelo treinador. É o mesmo alvo do A, em máquina.'},
    {n:'Supino inclinado com halteres', w:'Mais amplitude, mais estabilização.'},
    {n:'Supino inclinado com barra', w:'Menos amplitude embaixo, mais carga.'}],
  'Crucifixo inclinado no cabo': [
    {n:'Pec deck', w:'Indicado pelo treinador, com a trajetória ajustada para o ombro ficar confortável.'},
    {n:'Crossover de baixo para cima', w:'Mesmo alvo com vetor ascendente.'},
    {n:'Crucifixo inclinado com halteres', w:'Perde tensão no topo.'}],
  'Chest press horizontal convergente': [
    {n:'Supino reto na máquina', w:'Sem convergência, resto igual.'},
    {n:'Supino reto com halteres', w:'Mais amplitude, mais custo de ombro.'},
    {n:'Supino no Smith', w:'Trajetória travada, mais carga.'}],
  'Pec deck': [
    {n:'Crossover na polia média', w:'Amplitude maior, carga menor.'},
    {n:'Crucifixo com halteres', w:'Sem tensão no topo.'},
    {n:'Peck deck unilateral', w:'Um lado por vez, corrige diferença.'}],
  // D
  'Elevação lateral no cabo': [
    {n:'Elevação lateral na máquina', w:'Mais carga, menos ajuste fino.'},
    {n:'Elevação lateral com halteres', w:'Perde tensão embaixo.'},
    {n:'Elevação lateral no Smith unilateral', w:'Trajetória fixa, um lado por vez.'}],
  'Remada para deltoide posterior com apoio de peito': [
    {n:'Face pull na polia alta', w:'Mesmo alvo, mais rotação externa.'},
    {n:'Remada alta com corda', w:'Cotovelo mais alto, entra trapézio.'},
    {n:'Remada aberta na máquina', w:'Sem apoio de peito.'}],
  'Reverse fly no cabo': [
    {n:'Reverse pec deck', w:'Mais carga, tronco apoiado.'},
    {n:'Crucifixo inverso com halteres', w:'Perde tensão no fim da amplitude.'},
    {n:'Face pull na polia alta', w:'Mais rotação externa junto.'}],
  'Rosca Bayesian no cabo': [
    {n:'Rosca no cabo', w:'Indicada pelo treinador, com o braço atrás do corpo para manter o alongamento.'},
    {n:'Rosca inclinada com halteres', w:'Mesmo alongamento sem tensão constante.'},
    {n:'Rosca Scott na máquina', w:'Encurta em vez de alongar a cabeça longa.'}],
  'Rosca martelo': [
    {n:'Rosca martelo na corda', w:'Tensão constante, pulso mais livre.'},
    {n:'Rosca inversa na barra W', w:'Mais braquiorradial, menos carga.'},
    {n:'Rosca martelo cruzada', w:'Um braço por vez, cruzando o corpo.'}],
  'Extensão unilateral de tríceps no cabo': [
    {n:'Pushdown unilateral', w:'Mesma coisa com pegada diferente.'},
    {n:'Tríceps coice com halter', w:'Pico no encurtamento, carga baixa.'},
    {n:'Extensão unilateral acima da cabeça', w:'Alonga a cabeça longa.'}],
  'Extensão acima da cabeça ou máquina de tríceps': [
    {n:'Tríceps testa com barra W', w:'Mais carga, mais cobrança no cotovelo.'},
    {n:'Máquina de tríceps sentado', w:'Trajetória guiada, mais segura.'},
    {n:'Tríceps francês com halter', w:'Um braço por vez.'}],
  'Elevação de pernas ou reverse crunch': [
    {n:'Elevação de pernas suspenso', w:'Mais difícil, exige pegada firme.'},
    {n:'Reverse crunch no banco declinado', w:'Amplitude menor, mais controle.'},
    {n:'Elevação de pernas no banco', w:'Versão mais fácil do mesmo padrão.'}],
  // F
  'Cadeira flexora sentada': [
    {n:'Cadeira flexora sentada de outro modelo', w:'Indicada pelo treinador: outra máquina SENTADA. É a posição de quadril que dá o alongamento — trocar por deitada perde justamente isso.'},
    {n:'Mesa flexora deitada', w:'Quadril estendido: menos alongamento no posterior.'},
    {n:'Flexora unilateral em pé', w:'Um lado por vez, corrige diferença.'}],
  'Terra romeno no Smith': [
    {n:'Terra romeno com barra', w:'Indicado pelo treinador. Mais custo de lombar e de pegada.'},
    {n:'Terra romeno com halteres', w:'Indicado pelo treinador. Mais estabilização, menos carga.'},
    {n:'Good morning no Smith', w:'Mais lombar, menos posterior.'}],
  'Mesa flexora deitada': [
    {n:'Cadeira flexora sentada', w:'Quadril fletido: mais alongamento.'},
    {n:'Flexora unilateral deitada', w:'Um lado por vez.'},
    {n:'Flexora nórdica assistida', w:'Excêntrica pesada, difícil de progredir.'}],
  'Elevação pélvica na máquina': [
    {n:'Hip thrust no Smith', w:'Indicado pelo treinador. Trajetória fixa, fácil de carregar.'},
    {n:'Elevação pélvica com barra', w:'Mesma coisa, montagem mais chata.'},
    {n:'Coice na máquina', w:'Um lado por vez, carga bem menor.'}],
  'Abdutora': [
    {n:'Abdutora em pé na polia', w:'Um lado por vez, amplitude maior.'},
    {n:'Abdução deitado com caneleira', w:'Carga limitada.'},
    {n:'Passada lateral com elástico', w:'Resistência crescente, difícil de medir.'}],
  'Panturrilha no leg press': [
    {n:'Panturrilha em pé na máquina', w:'Joelho estendido: mais gastrocnêmio.'},
    {n:'Panturrilha no Smith', w:'Precisa de degrau, amplitude igual.'},
    {n:'Panturrilha unilateral com halter', w:'Metade da carga, um pé por vez.'}],
  'Ab wheel': [
    {n:'Elevação de pernas ou reverse crunch', w:'Indicado pelo treinador, na versão carregada.'},
    {n:'Rollout na barra', w:'Mesmo padrão com barra carregada.'},
    {n:'Prancha com peso', w:'Isométrico: sem amplitude, mais fácil de dosar.'}],
};

// ---------- o que saiu do programa ----------
// Exercícios que o treinador prescreveu até a revisão de agosto de 2026 e que
// não estão mais em nenhum dia. Eles NÃO podem simplesmente sumir: cada um tem
// meses de histórico, e um id sem entrada no catálogo vira exercício fantasma —
// a tela mostra o slug cru no lugar do nome.
//
// Entram como `sub:1`, não `arq:1`, e a diferença é deliberada: arquivado some
// das listas de troca e de adição, e vários destes continuam sendo o substituto
// indicado para um exercício do programa novo. Ficam nomeados, com o grupo
// certo, e disponíveis para quando a máquina do dia estiver ocupada.
export const LEGADO: Record<string, { car: TipoCarga; g: string; c: 0 | 1; cue: string }> = {
  'Remada horizontal na máquina': {car:'pino', g:'costas espessura', c:1, cue:'Escolha o equipamento onde dá para deixar a escápula protrair e depois retrair confortável.'},
  'Encolhimento na máquina': {car:'pino', g:'trapézio', c:0, cue:'Saiu do programa: trapézio não é limitação visual, e remadas e terra romeno já dão estímulo.'},
  'Remada para deltoide posterior com apoio de peito': {car:'lado', g:'delt posterior', c:1, cue:'Cotovelo afastado do tronco, puxando para trás.'},
  'Reverse fly no cabo': {car:'pino', g:'delt posterior', c:0, cue:'Amplitude maior, um lado por vez se preferir.'},
  'Extensão unilateral de tríceps no cabo': {car:'pino', g:'tríceps', c:0, cue:'Corrige diferença entre os lados.'},
  'Abdutora': {car:'pino', g:'glúteo médio', c:0, cue:'Glúteo médio. Saiu do programa na redução de volume.'},
  'Tibial anterior': {car:'pino', g:'tibial', c:0, cue:'Não é obrigatório para estética; saiu quando o volume foi cortado.'},
  'Pec deck': {car:'pino', g:'peito', c:0, cue:'Trajetória guiada; dá para chegar perto da falha. Hoje é o substituto do crucifixo inclinado.'},
  'Straight-arm pulldown': {car:'pino', g:'dorsal', c:0, cue:'Braço mais estendido. Hoje é o substituto indicado do pullover.'},
  'Elevação lateral no cabo': {car:'pino', g:'delt lateral', c:0, cue:'Tensão constante na parte de baixo, onde o halter perde.'},
  'Crucifixo inverso no cabo': {car:'pino', g:'delt posterior', c:0, cue:'Amplitude maior, carga menor que o reverse pec deck.'},
  'Rosca no cabo': {car:'pino', g:'bíceps', c:0, cue:'Tensão constante ao longo da amplitude.'},
  'Extensão acima da cabeça ou máquina de tríceps': {car:'pino', g:'tríceps', c:0, cue:'Hoje é o substituto indicado da extensão acima da cabeça no cabo.'},
  'Elevação de pernas ou reverse crunch': {car:'corpo', g:'abdômen', c:0, cue:'Suba com o quadril, não com o balanço. Carregado, é o substituto do ab wheel.'},
};

// ---------- catálogo de exercícios ----------
// O histórico é indexado pelo EXERCÍCIO, não pela posição dele no treino.
// Antes a chave era dia+posição (A0, B3): inserir um exercício no meio
// deslocava o histórico de todos os seguintes. Com id estável, reordenar,
// inserir e remover são operações inofensivas, e um substituto deixa de ser
// chave de segunda classe — tem histórico próprio como qualquer outro.
export function slugEx(n: string): IdEx {
  return String(n).toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

// Catálogo que vem do código: os exercícios do programa, os que saíram dele
// mas têm histórico, e todos os substitutos da tabela ALT — que assim viram
// exercícios de verdade.
//
// A ordem importa: o LEGADO entra ANTES do ALT para que um exercício egresso do
// programa carregue o grupo muscular que o treinador atribuía a ele, em vez de
// herdar o de quem ele passou a substituir. Pec deck é peito, mesmo entrando
// hoje como alternativa de um exercício de peito superior.
export const EX_BASE: Record<IdEx, Exercicio> = (function () {
  const c: Record<IdEx, Exercicio> = {};
  ROT_BASE.forEach(function (d) {
    PROGRAMA[d].ex.forEach(function (ex) {
      c[slugEx(ex.n)] = { n:ex.n, car:ex.car, g:ex.g, c:ex.c, cue:ex.cue, u:ex.u };
    });
  });
  Object.keys(LEGADO).forEach(function (nome) {
    const k = slugEx(nome), l = LEGADO[nome];
    if (!c[k]) c[k] = { n:nome, car:l.car, g:l.g, c:l.c, cue:l.cue, sub:1 };
  });
  Object.keys(ALT).forEach(function (nome) {
    const base = c[slugEx(nome)] || {};
    ALT[nome].forEach(function (a) {
      const k = slugEx(a.n);
      // herda grupo e tipo de carga de quem ele substitui: é o palpite certo
      // na maioria das vezes, e ele corrige o tipo dentro do app.
      if (!c[k]) c[k] = { n:a.n, car:base.car || 'pino', g:base.g || '', c:base.c || 0, cue:a.w, sub:1 };
    });
  });
  return c;
})();

// A hierarquia da revisão de agosto de 2026: peito superior e delt lateral são
// prioridade 1; dorsal em largura e panturrilha, prioridade 2. Quadríceps saiu
// da fila — é ponto forte, e cedeu volume para quem precisa crescer.
export const PRIORIDADES: Record<Nivel, { rot: string; mus: string[] }> = {
  maxima:      { rot:'prioridade máxima', mus:['peito superior','delt lateral'] },
  secundaria:  { rot:'prioridade secundária', mus:['dorsal','panturrilha','posterior','abdômen'] },
  normal:      { rot:'', mus:['costas espessura','delt posterior','bíceps','tríceps','peito','quadríceps','glúteo','glúteo médio','adutores','trapézio','tibial'] },
  indireto:    { rot:'estímulo indireto basta', mus:['delt anterior'] }
};

export const NIVEIS: Nivel[] = ['maxima','secundaria','normal','indireto'];

export function nivelDe(g: string): Nivel {
  for (let i = 0; i < NIVEIS.length; i++) if (PRIORIDADES[NIVEIS[i]].mus.indexOf(g) >= 0) return NIVEIS[i];
  return 'normal';
}

// mantido para ordenação e para o formulário de treino avulso
export const PRIO = PRIORIDADES.maxima.mus.concat(PRIORIDADES.secundaria.mus);

// ---------- tipo de carregamento ----------
// A ambiguidade "esse peso é de um lado ou dos dois?" é propriedade do
// equipamento, não da série. Declara-se uma vez por exercício.
// O app NUNCA converte: guarda o que foi digitado. Converter seria mentira —
// barra olímpica tem 20 kg, a W tem 10, e articulada tem alavanca própria.
export const CARGAS: Record<TipoCarga, Carga> = {
  pino:    { rot:'kg',      nome:'placa',
             ajuda:'O número é a carga selecionada, e pronto.' },
  lado:    { rot:'kg/lado', nome:'anilha por lado', dobra:1, cada:'de cada lado', total:'em anilhas', obs:', fora a barra',
             ajuda:'Só um lado, sem contar a barra. O app mostra o total em anilhas.' },
  halter:  { rot:'kg/lado', nome:'halter em cada mão', dobra:1, cada:'em cada mão', total:'nas duas mãos', obs:'',
             ajuda:'Um halter por mão. O app mostra o total das duas.' },
  halter1: { rot:'kg',      nome:'um halter só',
             ajuda:'Um halter só, segurado com uma ou duas mãos. O número é o peso dele.' },
  corpo:   { rot:'+kg',     nome:'peso do corpo',
             ajuda:'Só o que você acrescentou. Pode ficar vazio.' },
  assist:  { rot:'ajuda',   nome:'assistida',
             ajuda:'O contrapeso que ajuda. Menos ajuda é mais força.' }
};

export const DORES: { k: string; t: string }[] = [
  {k:'cotovelo', t:'cotovelo'},
  {k:'ombro',    t:'ombro anterior'},
  {k:'patelar',  t:'patelar'}
];

export const MODAIS: string[] = ['bike', 'esteira inclinada', 'elíptico', 'remo'];
// ---------- o programa dele ----------
// S.prog nasce como cópia do programa do treinador e vai divergindo conforme
// ele decide. Cada posição é um slot: o exercício (id) mais como está
// prescrito hoje (séries, faixa, descanso). 'desde' é quando aquele exercício
// entrou naquela posição — é o que sustenta a regra de 6 a 8 semanas.
export function semeiaProg(): Record<string, Treino> {
  const p: Record<string, Treino> = {};
  ROT_BASE.forEach(function (d) {
    p[d] = { name: PROGRAMA[d].name, tag: PROGRAMA[d].tag,
      ex: PROGRAMA[d].ex.map(function (ex) {
        return { id: slugEx(ex.n), s: ex.s, r: ex.r, d: ex.d, rir: ex.rir, desde: 0 };
      }) };
  });
  return p;
}

/**
 * Catálogo efetivo: o que vem do código mais o que ele cadastrou e o que a
 * migração arquivou. Remontado sempre que o catálogo dele muda.
 */
export function montaCatalogo(exDoUsuario: Record<IdEx, Partial<Exercicio>>): Record<IdEx, Exercicio> {
  const cat: Record<IdEx, Exercicio> = {};
  Object.keys(EX_BASE).forEach(function (k) { cat[k] = EX_BASE[k]; });
  Object.keys(exDoUsuario || {}).forEach(function (k) {
    cat[k] = Object.assign({}, EX_BASE[k] || {}, exDoUsuario[k]) as Exercicio;
  });
  return cat;
}

/**
 * Um id sem entrada no catálogo não pode derrubar a tela: vira exercício
 * fantasma, com o próprio id como nome, e o histórico continua visível.
 */
export function exercicioFantasma(x: IdEx): Exercicio {
  return { n: x, car: 'pino', g: '', c: 0, cue: '', sumido: 1 };
}
