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

// A sequência é o que importa, e ela não mudou: o grande treino de torso vem
// ANTES do dia de ombros e braços, porque puxar e empurrar pesado no dia
// seguinte a um treino de deltoide e bíceps é puxar com o músculo já queimado.
//
// Até a versão 4 do formato isso era expresso invertendo a rotação —
// A B C E D F, com E fora de ordem. Lia mal: parecia erro toda vez que alguém
// abria a tela. As letras foram trocadas de lugar para a rotação ficar
// alfabética; os treinos, esses, continuam na mesma ordem de sempre.
export const ROT_BASE: string[] = ['A','B','C','D','E','F'];

// Descanso em segundos, pelas categorias do treinador: grande composto 3 min,
// máquina multiarticular 2,5 min, isolador e demais 1,5 min. O critério real
// não é o cronômetro: a próxima série começa quando dá para fazer outra de
// alta qualidade.
export const D_COMPOSTO = 180, D_MAQUINA = 150, D_ISOLADOR = 105, D_CURTO = 90;

// O programa do treinador, congelado. Não é o que abre na tela: é a semente do
// seu programa (S.prog), o alvo de comparação do volume e o que o botão de
// restaurar devolve. Editar aqui é mudar a prescrição, não a sua execução.
export const PROGRAMA: Record<string, Treino<ExercicioPrescrito>> = {
  A: { name:'Peito superior + lateral + tríceps', tag:'clavicular e ombro', ex:[
    {n:'Chest press inclinado convergente', car:'pino', g:'peito superior', s:3, r:'6–10', c:1, d:D_COMPOSTO, cue:'Sua principal pressão para peito superior. Máquina estável para o esforço muscular ser o limitante, não o equilíbrio. 1 a 2 repetições na reserva.'},
    {n:'Crossover de baixo para cima', car:'pino', g:'peito superior', s:2, r:'10–15', c:0, d:D_ISOLADOR, cue:'Direcione de verdade à porção clavicular, sem transformar o movimento em elevação frontal.'},
    {n:'Elevação lateral na máquina', car:'pino', g:'delt lateral', s:3, r:'8–15', c:0, d:D_CURTO, cue:'Aqui cabe progressão relativamente pesada, desde que o movimento continue lateral e controlado.'},
    {n:'Elevação lateral unilateral no cabo', car:'pino', g:'delt lateral', s:3, r:'12–20', c:0, d:D_CURTO, cue:'Complemento com tensão previsível e ajuste fino. Um lado por vez.'},
    {n:'Extensão de tríceps acima da cabeça no cabo', car:'pino', g:'tríceps', s:3, r:'8–15', c:0, d:D_ISOLADOR, cue:'Cabeça longa alongada. Se o cotovelo reclamar, reduza a amplitude final.'},
    {n:'Pushdown', car:'pino', g:'tríceps', s:2, r:'10–15', c:0, d:D_ISOLADOR, cue:'Tríceps não é prioridade: já está bom e ainda trabalha nos presses.'},
    {n:'Crunch no cabo ou máquina', car:'pino', g:'abdômen', s:3, r:'8–15', c:0, d:D_CURTO, cue:'Com carga progressiva. Abdômen é treinado como qualquer outro músculo.'},
  ]},
  B: { name:'Dorsais + posterior de ombro + bíceps', tag:'um dos dois treinos mais importantes', ex:[
    {n:'Pulldown convergente', car:'pino', g:'dorsal', s:3, r:'6–10', c:1, d:D_MAQUINA, cue:'Pegada neutra ou semipronada, a que permitir maior amplitude confortável.'},
    {n:'Pulldown unilateral', car:'pino', g:'dorsal', s:3, r:'8–12', c:1, d:D_MAQUINA, cue:'Bastante controle escapular, com o cotovelo viajando em direção ao quadril.'},
    {n:'Remada para dorsal com apoio de peito', car:'lado', g:'dorsal', s:2, r:'8–12', c:1, d:D_MAQUINA, cue:'Cotovelo mais próximo do tronco, para não virar remada de upper back.'},
    {n:'Pullover em máquina ou cabo', car:'pino', g:'dorsal', s:2, r:'10–15', c:0, d:D_ISOLADOR, cue:'Estímulo na dorsal sem adicionar fadiga de bíceps.'},
    {n:'Reverse pec deck', car:'pino', g:'delt posterior', s:3, r:'10–20', c:0, d:D_ISOLADOR, cue:'Deltoide posterior com o tronco apoiado.'},
    {n:'Crucifixo inverso no cabo', car:'pino', g:'delt posterior', s:2, r:'12–20', c:0, d:D_ISOLADOR, cue:'Amplitude maior, um lado por vez se preferir.'},
    {n:'Rosca Scott na máquina', car:'pino', g:'bíceps', s:3, r:'8–12', c:0, d:D_ISOLADOR, cue:'Sem balanço de tronco.'},
    {n:'Rosca no cabo', car:'pino', g:'bíceps', s:2, r:'10–15', c:0, d:D_ISOLADOR, cue:'Tensão constante ao longo da amplitude.'},
  ]},
  C: { name:'Quadríceps + adutores + panturrilha', tag:'qualidade e progressão, não volume', ex:[
    {n:'Pendulum squat', car:'lado', g:'quadríceps', s:3, r:'6–10', c:1, d:D_COMPOSTO, cue:'Preferido ao agachamento livre nesta fase. Hack squat bom serve igual. 1 a 2 na reserva.'},
    {n:'Leg press', car:'lado', g:'quadríceps', s:3, r:'8–15', c:1, d:D_MAQUINA, cue:'Amplitude completa sem soltar a lombar do banco.'},
    {n:'Cadeira extensora', car:'pino', g:'quadríceps', s:3, r:'10–15', c:0, d:D_ISOLADOR, cue:'A última série pode ir bem perto da falha.'},
    {n:'Adutora', car:'pino', g:'adutores', s:3, r:'10–15', c:0, d:D_ISOLADOR, cue:'Adutores contribuem muito para uma coxa completa.'},
    {n:'Panturrilha em pé', car:'pino', g:'panturrilha', s:3, r:'6–12', c:0, d:D_CURTO, cue:'Joelho estendido, para o gastrocnêmio.'},
    {n:'Panturrilha sentada', car:'lado', g:'panturrilha', s:2, r:'10–15', c:0, d:D_CURTO, cue:'Pause no alongamento. Nada de quicar.'},
    {n:'Tibial anterior', car:'pino', g:'tibial', s:2, r:'12–20', c:0, d:D_CURTO, cue:'Não é obrigatório para estética, entra por completude do programa.'},
  ]},
  D: { name:'Espessura de costas + peito', tag:'o grande treino de torso', ex:[
    {n:'Remada convergente com apoio de peito', car:'lado', g:'costas espessura', s:3, r:'6–10', c:1, d:D_MAQUINA, cue:'Tronco apoiado tira a lombar da conta.'},
    {n:'Remada horizontal na máquina', car:'pino', g:'costas espessura', s:3, r:'8–12', c:1, d:D_MAQUINA, cue:'Escolha o equipamento onde dá para deixar a escápula protrair e depois retrair confortável.'},
    {n:'High row com apoio de peito', car:'lado', g:'costas espessura', s:2, r:'8–12', c:1, d:D_MAQUINA, cue:'Aqui os cotovelos podem ficar um pouco mais afastados.'},
    {n:'Encolhimento na máquina', car:'pino', g:'trapézio', s:2, r:'8–15', c:0, d:D_ISOLADOR, cue:'Trapézio não é prioridade, mas também não fica ignorado.'},
    {n:'Straight-arm pulldown', car:'pino', g:'dorsal', s:2, r:'10–15', c:0, d:D_ISOLADOR, cue:'Leva a dorsal a 12 séries na semana sem criar outro treino de largura.'},
    {n:'Supino inclinado no Smith', car:'lado', g:'peito superior', s:3, r:'6–10', c:1, d:D_COMPOSTO, cue:'Com as cinco séries do A, chega a 10 séries direcionadas ao peito superior.'},
    {n:'Crucifixo inclinado no cabo', car:'pino', g:'peito superior', s:2, r:'10–15', c:0, d:D_ISOLADOR, cue:'Pausa de 1 s no alongado, com o peito aberto.'},
    {n:'Chest press horizontal convergente', car:'pino', g:'peito', s:3, r:'8–12', c:1, d:D_MAQUINA, cue:'Preserva e desenvolve o peito médio sem tirar o foco da região clavicular.'},
    {n:'Pec deck', car:'pino', g:'peito', s:2, r:'10–15', c:0, d:D_ISOLADOR, cue:'Trajetória guiada; dá para chegar perto da falha.'},
  ]},
  E: { name:'Deltoides + braços + abdômen', tag:'lateral antes dos braços, de propósito', ex:[
    {n:'Elevação lateral na máquina', car:'pino', g:'delt lateral', s:4, r:'8–15', c:0, d:D_CURTO, cue:'Somadas às seis do A, dão 13 séries diretas de lateral por semana. É onde você tem que estar.'},
    {n:'Elevação lateral no cabo', car:'pino', g:'delt lateral', s:3, r:'12–20', c:0, d:D_CURTO, cue:'Tensão constante na parte de baixo, onde o halter perde.'},
    {n:'Remada para deltoide posterior com apoio de peito', car:'lado', g:'delt posterior', s:2, r:'8–15', c:1, d:D_ISOLADOR, cue:'Cotovelo afastado do tronco, puxando para trás.'},
    {n:'Reverse fly no cabo', car:'pino', g:'delt posterior', s:2, r:'12–20', c:0, d:D_ISOLADOR, cue:'Somado ao B, o posterior recebe 9 séries diretas.'},
    {n:'Rosca Bayesian no cabo', car:'pino', g:'bíceps', s:2, r:'8–15', c:0, d:D_ISOLADOR, cue:'Braço atrás do corpo, alongando a cabeça longa.'},
    {n:'Rosca martelo', car:'halter', g:'bíceps', s:2, r:'8–15', c:0, d:D_ISOLADOR, cue:'Braquial e braquiorradial, que dão espessura ao braço de lado.'},
    {n:'Extensão unilateral de tríceps no cabo', car:'pino', g:'tríceps', s:2, r:'8–15', c:0, d:D_ISOLADOR, cue:'Corrige diferença entre os lados.'},
    {n:'Extensão acima da cabeça ou máquina de tríceps', car:'pino', g:'tríceps', s:2, r:'10–15', c:0, d:D_ISOLADOR, cue:'Fecha o tríceps em 9 séries diretas na semana.'},
    {n:'Elevação de pernas ou reverse crunch', car:'corpo', g:'abdômen', s:3, r:'8–15', c:0, d:D_CURTO, cue:'Suba com o quadril, não com o balanço. Desça em 3 s, sem deixar a lombar arquear.'},
  ]},
  F: { name:'Posteriores + glúteos + panturrilha', tag:'equilíbrio com a coxa anterior', ex:[
    {n:'Cadeira flexora sentada', car:'pino', g:'posterior', s:4, r:'8–12', c:0, d:D_ISOLADOR, cue:'Primeiro movimento de propósito: ataca o posterior enquanto está fresco.'},
    {n:'Terra romeno no Smith', car:'lado', g:'posterior', s:3, r:'6–10', c:1, d:D_COMPOSTO, cue:'Smith em vez de barra livre para não virar teste de equilíbrio. Amplitude até onde a mecânica de quadril e coluna se mantém.'},
    {n:'Mesa flexora deitada', car:'pino', g:'posterior', s:3, r:'10–15', c:0, d:D_ISOLADOR, cue:'Excêntrica de 3 s. Fecha o posterior em 10 séries.'},
    {n:'Elevação pélvica na máquina', car:'lado', g:'glúteo', s:3, r:'8–12', c:1, d:D_MAQUINA, cue:'Pausa no topo com o queixo para dentro.'},
    {n:'Abdutora', car:'pino', g:'glúteo médio', s:2, r:'12–20', c:0, d:D_ISOLADOR, cue:'Para o glúteo médio não desaparecer do programa.'},
    {n:'Panturrilha sentada', car:'lado', g:'panturrilha', s:3, r:'8–15', c:0, d:D_CURTO, cue:'Joelho flexionado, para o sóleo.'},
    {n:'Panturrilha no leg press', car:'lado', g:'panturrilha', s:2, r:'10–15', c:0, d:D_CURTO, cue:'Com o treino C, fecha 10 séries de panturrilha na semana.'},
    {n:'Ab wheel', car:'corpo', g:'abdômen', s:3, r:'6–12', c:0, d:D_CURTO, cue:'De joelhos e com amplitude parcial. Só aumente quando estiver fácil.'},
  ]},
};

export const RULES: Regra[] = [
  {k:'regra 1', t:'Deixe 1 a 2 repetições na reserva na maior parte do tempo', warn:0, p:[
    'Nos compostos — pendulum, presses, terra romeno, remadas pesadas — <b>1 a 2 na reserva</b>. Não é para falhar nesses toda sessão.',
    'Nas máquinas e isoladores, a maioria também com 1 a 2 na reserva. A <b>última série</b> de alguns pode ir a 0 ou 1, quando a técnica continuar boa.',
    'Levar tudo à falha não é necessário para crescer, e cobra caro na recuperação de um programa de seis sessões.']},
  {k:'regra 2', t:'Dupla progressão: primeiro repetição, depois carga', warn:0, p:[
    'Numa faixa de 6 a 10, você sobe as repetições mantendo a carga até bater o topo em todas as séries: 90 kg em 9/8/7, depois 10/9/8, depois 10/10/10.',
    'Aí sim aumenta a carga e recomeça mais perto da parte baixa da faixa. <b>O app avisa quando todas as séries batem o topo.</b>',
    'Isso permite saber objetivamente se você está progredindo, em vez de julgar por dor muscular ou pump.']},
  {k:'regra 3', t:'Excêntrica controlada em tudo', warn:0, p:[
    'Seu músculo fica forte mais rápido do que o tendão consegue se adaptar. Tendão responde a <b>tensão ao longo do tempo</b>, não a peso jogado.',
    'Descer devagar é o principal escudo contra lesão no seu contexto, e ainda aumenta o estímulo de crescimento.']},
  {k:'regra 4', t:'Descanso pelo desempenho, não pelo cronômetro', warn:0, p:[
    'Referência: <b>grandes compostos 2,5 a 4 min</b>, máquinas multiarticulares 2 a 3 min, isoladores 1,5 a 2 min, lateral, abdômen e panturrilha 1 a 2 min.',
    'O critério real é outro: a próxima série começa quando você consegue de novo fazer uma série de <b>alta qualidade</b>. O cronômetro do app é lembrete, não ordem.']},
  {k:'regra 5', t:'Não troque exercício toda semana', warn:0, p:[
    'Mantenha os principais por <b>6 a 8 semanas</b>, desde que não provoquem dor articular, você consiga sentir e progredir no músculo alvo, a máquina siga disponível e a técnica esteja melhorando.',
    'Seu corpo não precisa ser confundido. O que se quer é acumular meses de dados comparáveis.']},
  {k:'calibração', t:'As duas primeiras rotações são para calibrar', warn:0, p:[
    'Você acabou de mudar de treino. <b>Não acrescente séries só porque um dia pareceu fácil.</b>',
    'Se terminar essas rotações recuperando bem, aumentando repetições, sem dor articular, sem queda de rendimento e sem grupo permanecendo dolorido até o próximo estímulo: não mexa em nada.',
    'Se houver fadiga excessiva, o corte começa por <b>1 a 2 séries de braços, deltoide posterior ou espessura</b> — nunca por lateral, dorsal ou peito superior.']},
  {k:'atenção', t:'Dor de tendão não se treina por cima', warn:1, p:[
    'Dor muscular difusa no dia seguinte é normal. <b>Dor pontual em cotovelo, ombro da frente ou joelho abaixo da patela é outra coisa.</b>',
    'Apareceu: tire aquele exercício por 2 semanas e substitua por outro ângulo. Nunca empurre porque "está fraquinha".']},
  {k:'aquecimento', t:'5 minutos que valem o treino inteiro', warn:0, p:[
    '5 min de bike leve mais 2 a 3 séries de aproximação subindo carga no primeiro exercício do dia.',
    'Treinando às 6h15 você entra frio de verdade. Aquecer não é opcional aqui.']},
  {k:'deload', t:'A cada 48 sessões, uma semana leve', warn:0, p:[
    'Mantenha as mesmas cargas e faça <b>metade das séries</b> por uma semana.',
    'O deload existe para o tecido conjuntivo se recuperar — por isso corta volume e não intensidade. O app avisa quando chegar a hora.']},
  {k:'bike', t:'25 a 40 min, 2 a 3x por semana', warn:0, p:[
    'Colocação: <b>depois do A, 25 a 30 min</b>; <b>no dia de descanso, 30 a 40 min</b>; <b>depois do F, 20 a 30 min</b>, esta terceira opcional conforme a recuperação.',
    'Intensidade RPE 4 a 6 de 10: respiração claramente acelerada, mas ainda dá para conversar.',
    'Evite antes de C ou F, e nunca antes do treino. Musculação é o motor da mudança corporal; a bike é condicionamento e saúde, não outro treino de perna.']},
  {k:'sucesso', t:'O que conta como dar certo em 2 a 3 meses', warn:0, p:[
    'Não é simplesmente sair de 73 para 77 kg. São quatro coisas ao mesmo tempo: <b>peso subindo bem devagar</b>, <b>cintura estável</b>, <b>progressão clara em dorsal, lateral, peito superior e posteriores</b>, e <b>fotos com mais V-taper</b>.',
    'O alvo visual: ombros mais largos, dorsais mais abertas, clavicular mais cheia, costas mais densas, abdômen mais espesso, panturrilha acompanhando a coxa, pernas mantidas fortes e cintura preservada.']},
];

// Substitutos do mesmo padrão de movimento, para quando a máquina está ocupada.
// Não são equivalentes: mantêm o alvo e a função, com a mecânica mais próxima
// disponível numa academia grande. O 'w' diz o que muda ao trocar — sem isso a
// substituição vira sorteio.
export const ALT: Record<string, Substituto[]> = {
  // A
  'Chest press inclinado convergente': [
    {n:'Supino inclinado no Smith', w:'Mesmo ângulo, trajetória travada.'},
    {n:'Supino inclinado com halteres', w:'Mais amplitude, mais exigência de estabilidade.'},
    {n:'Máquina de supino inclinado', w:'Convergência menor, resto igual.'}],
  'Crossover de baixo para cima': [
    {n:'Crucifixo inclinado no cabo', w:'Mesma região, menos vetor ascendente.'},
    {n:'Crossover na polia baixa', w:'Praticamente o mesmo movimento.'},
    {n:'Peck deck com banco inclinado', w:'Trajetória guiada, alongamento menor.'}],
  'Elevação lateral na máquina': [
    {n:'Elevação lateral no cabo', w:'Tensão constante, carga menor.'},
    {n:'Elevação lateral com halteres', w:'Perde tensão embaixo, ganha no topo.'},
    {n:'Elevação lateral no Smith unilateral', w:'Um lado por vez, trajetória fixa.'}],
  'Elevação lateral unilateral no cabo': [
    {n:'Elevação lateral com halteres', w:'Dois lados de uma vez, mais rápido.'},
    {n:'Elevação lateral na máquina', w:'Mais carga, menos ajuste fino.'},
    {n:'Elevação lateral deitado no banco inclinado', w:'Pico de tensão mais cedo na amplitude.'}],
  'Extensão de tríceps acima da cabeça no cabo': [
    {n:'Tríceps testa com barra W', w:'Mesma cabeça longa, mais cobrança no cotovelo.'},
    {n:'Tríceps francês com halter', w:'Um braço por vez, corrige assimetria.'},
    {n:'Máquina de tríceps sentado', w:'Menos alongamento, mais segurança.'}],
  'Pushdown': [
    {n:'Tríceps corda na polia', w:'Mesma coisa com rotação no fim.'},
    {n:'Tríceps barra reta na polia', w:'Pega fixa, dá para carregar mais.'},
    {n:'Mergulho na máquina assistida', w:'Entra peito e ombro junto.'}],
  'Crunch no cabo ou máquina': [
    {n:'Abdominal na polia alta ajoelhado', w:'Mesmo padrão, é a versão no cabo.'},
    {n:'Máquina de abdominal', w:'Trajetória guiada, mais fácil de carregar.'},
    {n:'Crunch com anilha no colo', w:'Sem equipamento, carga limitada.'}],
  // B
  'Pulldown convergente': [
    {n:'Puxada neutra na máquina', w:'Sem convergência, resto igual.'},
    {n:'Puxada aberta pronada', w:'Mais largura, menos amplitude embaixo.'},
    {n:'Barra fixa assistida pegada neutra', w:'Peso do corpo, escápula mais livre.'}],
  'Pulldown unilateral': [
    {n:'Puxada neutra unilateral', w:'Praticamente o mesmo movimento.'},
    {n:'Puxada unilateral na polia alta', w:'Tensão constante, carga menor.'},
    {n:'Remada unilateral na polia alta ajoelhado', w:'Ângulo mais horizontal.'}],
  'Remada para dorsal com apoio de peito': [
    {n:'Remada sentada pegada neutra fechada', w:'Sem apoio: lombar entra na conta.'},
    {n:'Remada baixa na polia com triângulo', w:'Mesmo ângulo de cotovelo, cabo em vez de placa.'},
    {n:'Remada na máquina pegada neutra', w:'Trajetória fixa, mais carga.'}],
  'Pullover em máquina ou cabo': [
    {n:'Pullover na polia alta', w:'É a versão no cabo do mesmo movimento.'},
    {n:'Straight-arm pulldown', w:'Braço mais estendido, mesma função.'},
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
    {n:'Rosca Scott com barra W', w:'Mesma posição, pulso mais confortável.'},
    {n:'Rosca concentrada', w:'Um braço por vez, mais lenta.'},
    {n:'Rosca no banco inclinado', w:'Alonga a cabeça longa em vez de encurtar.'}],
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
    {n:'Leg press 45°', w:'É a mesma máquina em outro ângulo.'},
    {n:'Leg press horizontal', w:'Amplitude menor, lombar mais protegida.'},
    {n:'Agachamento hack', w:'Mais quadríceps, mais exigente de mobilidade.'}],
  'Cadeira extensora': [
    {n:'Extensora unilateral', w:'Um lado por vez, corrige diferença.'},
    {n:'Sissy squat na máquina', w:'Alonga o reto femoral, mais duro no joelho.'},
    {n:'Leg press com pé baixo', w:'Composto: cansa mais para o mesmo alvo.'}],
  'Adutora': [
    {n:'Adutora em pé na polia', w:'Um lado por vez, amplitude maior.'},
    {n:'Agachamento sumô no Smith', w:'Composto, entra quadríceps e glúteo.'},
    {n:'Leg press com pé afastado', w:'Adutor como coadjuvante, não como alvo.'}],
  'Panturrilha em pé': [
    {n:'Panturrilha na máquina em pé', w:'É a mesma coisa em outro equipamento.'},
    {n:'Panturrilha no Smith', w:'Precisa de degrau, amplitude igual.'},
    {n:'Panturrilha unilateral com halter', w:'Metade da carga, um pé por vez.'}],
  'Panturrilha sentada': [
    {n:'Panturrilha sentada na máquina', w:'Mesmo movimento, outro equipamento.'},
    {n:'Panturrilha no leg press com joelho flexionado', w:'Menos sóleo isolado.'},
    {n:'Panturrilha sentada com anilha no joelho', w:'Carga limitada.'}],
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
    {n:'Remada alta na máquina', w:'Mesmo ângulo sem o apoio de peito.'},
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
    {n:'Chest press inclinado convergente', w:'É o mesmo alvo do A, em máquina.'},
    {n:'Supino inclinado com halteres', w:'Mais amplitude, mais estabilização.'},
    {n:'Supino inclinado com barra', w:'Menos amplitude embaixo, mais carga.'}],
  'Crucifixo inclinado no cabo': [
    {n:'Crossover de baixo para cima', w:'Mesmo alvo com vetor ascendente.'},
    {n:'Crucifixo inclinado com halteres', w:'Perde tensão no topo.'},
    {n:'Peck deck com banco inclinado', w:'Trajetória guiada, alongamento menor.'}],
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
    {n:'Rosca inclinada com halteres', w:'Mesmo alongamento sem tensão constante.'},
    {n:'Rosca no cabo', w:'Braço ao lado do corpo, menos alongamento.'},
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
    {n:'Mesa flexora deitada', w:'Quadril estendido: menos alongamento no posterior.'},
    {n:'Flexora unilateral em pé', w:'Um lado por vez, corrige diferença.'},
    {n:'Flexora na polia baixa', w:'Tensão constante, carga menor.'}],
  'Terra romeno no Smith': [
    {n:'Terra romeno com halteres', w:'Mais estabilização, menos carga.'},
    {n:'Terra romeno com barra', w:'Mais custo de lombar e de pegada.'},
    {n:'Good morning no Smith', w:'Mais lombar, menos posterior.'}],
  'Mesa flexora deitada': [
    {n:'Cadeira flexora sentada', w:'Quadril fletido: mais alongamento.'},
    {n:'Flexora unilateral deitada', w:'Um lado por vez.'},
    {n:'Flexora nórdica assistida', w:'Excêntrica pesada, difícil de progredir.'}],
  'Elevação pélvica na máquina': [
    {n:'Elevação pélvica com barra', w:'Mesma coisa, montagem mais chata.'},
    {n:'Hip thrust no Smith', w:'Trajetória fixa, fácil de carregar.'},
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
    {n:'Prancha com peso', w:'Isométrico: sem amplitude, mais fácil de dosar.'},
    {n:'Rollout na barra', w:'Mesmo padrão com barra carregada.'},
    {n:'Abdominal na polia alta ajoelhado', w:'Flexão de tronco em vez de antiextensão.'}],
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

// Catálogo que vem do código: os exercícios do programa mais todos os
// substitutos da tabela ALT, que assim viram exercícios de verdade.
export const EX_BASE: Record<IdEx, Exercicio> = (function () {
  const c: Record<IdEx, Exercicio> = {};
  ROT_BASE.forEach(function (d) {
    PROGRAMA[d].ex.forEach(function (ex) {
      c[slugEx(ex.n)] = { n:ex.n, car:ex.car, g:ex.g, c:ex.c, cue:ex.cue, u:ex.u };
    });
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

export const PRIORIDADES: Record<Nivel, { rot: string; mus: string[] }> = {
  maxima:      { rot:'prioridade máxima', mus:['delt lateral','dorsal','peito superior'] },
  secundaria:  { rot:'prioridade secundária', mus:['costas espessura','delt posterior','posterior','panturrilha','abdômen'] },
  normal:      { rot:'', mus:['quadríceps','bíceps','tríceps','peito','glúteo','glúteo médio','adutores','trapézio','tibial'] },
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
        return { id: slugEx(ex.n), s: ex.s, r: ex.r, d: ex.d, desde: 0 };
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
