// src/infra/supabase.ts
var URL_BASE = "https://wetwqqrrgormwyktewlm.supabase.co";
var ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndldHdxcXJyZ29ybXd5a3Rld2xtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1OTQzMDIsImV4cCI6MjEwMzE3MDMwMn0.5Tdn3OW4khACuUvOdbcSWyK_UC3v8pm46mwB3MliAj0";
var BUCKET_APARELHOS = "aparelhos";
var BUCKET_CORPO = "corpo";

// src/mcp/jwt.ts
function b64urlBytes(s) {
  const b = s.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b.length % 4 ? "=".repeat(4 - b.length % 4) : "";
  const bin = atob(b + pad);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
function b64urlJson(s) {
  try {
    const v = JSON.parse(new TextDecoder().decode(b64urlBytes(s)));
    return v && typeof v === "object" && !Array.isArray(v) ? v : null;
  } catch {
    return null;
  }
}
async function confereToken(token, o) {
  const partes = token.split(".");
  if (partes.length !== 3) return null;
  const cab2 = b64urlJson(partes[0]);
  const corpo = b64urlJson(partes[1]);
  if (!cab2 || !corpo || cab2.alg !== "ES256" || typeof cab2.kid !== "string") return null;
  let chaves2;
  try {
    chaves2 = await o.chaves();
  } catch {
    return null;
  }
  const jwk = chaves2.find((k) => k.kid === cab2.kid && k.kty === "EC" && k.crv === "P-256");
  if (!jwk || !jwk.x || !jwk.y) return null;
  try {
    const chave = await crypto.subtle.importKey(
      "jwk",
      { kty: "EC", crv: "P-256", x: jwk.x, y: jwk.y, ext: true },
      { name: "ECDSA", namedCurve: "P-256" },
      false,
      ["verify"]
    );
    const ok2 = await crypto.subtle.verify(
      { name: "ECDSA", hash: "SHA-256" },
      chave,
      b64urlBytes(partes[2]),
      new TextEncoder().encode(partes[0] + "." + partes[1])
    );
    if (!ok2) return null;
  } catch {
    return null;
  }
  const agora = o.agora ?? Math.floor(Date.now() / 1e3);
  const aud = corpo.aud;
  const audOk = aud === o.audiencia || Array.isArray(aud) && aud.indexOf(o.audiencia) >= 0;
  if (corpo.iss !== o.emissor || !audOk) return null;
  if (typeof corpo.exp !== "number" || corpo.exp <= agora) return null;
  if (typeof corpo.nbf === "number" && corpo.nbf > agora + 60) return null;
  if (typeof corpo.sub !== "string" || !corpo.sub) return null;
  return corpo;
}
function chavesDoProjeto(url, ttlMs = 10 * 60 * 1e3, busca = fetch) {
  let cache = null;
  return async function() {
    if (cache && Date.now() - cache.em < ttlMs) return cache.k;
    const r = await busca(url, { headers: { accept: "application/json" } });
    if (!r.ok) throw new Error("jwks " + r.status);
    const j = await r.json();
    cache = { em: Date.now(), k: Array.isArray(j.keys) ? j.keys : [] };
    return cache.k;
  };
}

// src/dominio/programa.ts
var ROT_BASE = ["A", "B", "C", "D", "E", "HX"];
var D_COMPOSTO = 180;
var D_MAQUINA = 150;
var D_MEDIO = 120;
var D_ISOLADOR = 105;
var D_CURTO = 90;
var PROGRAMA = {
  A: { name: "Peito superior + dorsais + lateral + tr\xEDceps", tag: "os tr\xEAs alvos com voc\xEA inteiro", ex: [
    { n: "Chest press inclinado convergente", car: "pino", g: "peito superior", s: 3, r: "6\u201310", c: 1, d: D_COMPOSTO, rir: "1\u20132", cue: "Primeiro exerc\xEDcio da semana, no melhor momento de desempenho que existe. Banco a 20 ou 30\xB0 se a m\xE1quina permitir: mais que isso vira desenvolvimento de ombro." },
    { n: "Pulldown convergente", car: "pino", g: "dorsal", s: 3, r: "6\u201310", c: 1, d: D_MAQUINA, rir: "1\u20132", cue: "Pegada neutra, a que permitir maior amplitude confort\xE1vel. Largura de dorsal se constr\xF3i aqui." },
    { n: "Crucifixo inclinado no cabo", car: "pino", g: "peito superior", s: 2, r: "10\u201315", c: 0, d: D_MEDIO, rir: "1", cue: "Amplitude grande e confort\xE1vel. N\xE3o sacrifique a posi\xE7\xE3o do ombro para tentar alongar mais." },
    { n: "Pulldown unilateral", car: "pino", g: "dorsal", s: 2, r: "8\u201312", c: 1, d: D_MEDIO, rir: "1", cue: "Cotovelo descendo em dire\xE7\xE3o ao quadril, sem transformar em rota\xE7\xE3o de tronco." },
    { n: "Eleva\xE7\xE3o lateral na m\xE1quina", car: "pino", g: "delt lateral", s: 3, r: "10\u201315", c: 0, d: D_ISOLADOR, rir: "1", cue: "Sem impulso de perna ou tronco. N\xE3o precisa ultrapassar muito a linha do ombro." },
    { n: "Eleva\xE7\xE3o lateral unilateral no cabo", car: "pino", g: "delt lateral", s: 3, r: "12\u201320", c: 0, d: D_CURTO, rir: "0\u20131", cue: "Tens\xE3o previs\xEDvel e ajuste fino, um lado por vez. A \xFAltima s\xE9rie pode ir a 0 na reserva." },
    { n: "Extens\xE3o de tr\xEDceps acima da cabe\xE7a no cabo", car: "pino", g: "tr\xEDceps", s: 2, r: "8\u201312", c: 0, d: D_MEDIO, rir: "1", cue: "Cabe\xE7a longa alongada. Se o cotovelo reclamar, reduza a amplitude final." },
    { n: "Pushdown", car: "pino", g: "tr\xEDceps", s: 2, r: "10\u201315", c: 0, d: D_ISOLADOR, rir: "0\u20131", cue: "Tr\xEDceps n\xE3o \xE9 prioridade: j\xE1 recebe bastante dos presses. Duas s\xE9ries bem feitas bastam." }
  ] },
  B: { name: "Pernas completas + panturrilhas", tag: "a perna inteira num dia s\xF3", ex: [
    { n: "Agachamento no Smith", car: "lado", g: "quadr\xEDceps", s: 2, r: "6\u201310", c: 1, d: D_COMPOSTO, rir: "1\u20132", cue: "Amplitude m\xE1xima confort\xE1vel e repet\xEDvel, com a posi\xE7\xE3o dos p\xE9s est\xE1vel entre as sess\xF5es. N\xE3o tente transform\xE1-lo em agachamento para gl\xFAteo: aqui se quer um padr\xE3o est\xE1vel e progress\xEDvel, com bom est\xEDmulo de quadr\xEDceps sem gastar volume nele." },
    { n: "Cadeira flexora sentada", car: "pino", g: "posterior", s: 4, r: "8\u201312", c: 0, d: D_MEDIO, rir: "1", cue: "Antes do terra: o isquiotibial come\xE7a a repeti\xE7\xE3o mais alongado aqui do que em qualquer flexora deitada." },
    { n: "Terra romeno no Smith", car: "lado", g: "posterior", s: 3, r: "6\u201310", c: 1, d: D_COMPOSTO, rir: "1\u20132", cue: "Smith porque, para o seu objetivo, estabilidade \xE9 vantagem e n\xE3o defeito. Quadril para tr\xE1s, coluna neutra." },
    { n: "Leg press", car: "lado", g: "quadr\xEDceps", s: 2, r: "10\u201315", c: 1, d: D_MAQUINA, rir: "1\u20132", cue: "Amplitude completa sem soltar a lombar do banco." },
    { n: "Cadeira extensora", car: "pino", g: "quadr\xEDceps", s: 1, r: "10\u201315", c: 0, d: D_MEDIO, rir: "0\u20131", cue: "A \xFAltima s\xE9rie pode ir bem perto da falha." },
    { n: "Eleva\xE7\xE3o p\xE9lvica na m\xE1quina", car: "lado", g: "gl\xFAteo", s: 3, r: "8\u201312", c: 1, d: D_MAQUINA, rir: "1", cue: "Pausa no topo com o queixo para dentro." },
    { n: "Adutora", car: "pino", g: "adutores", s: 2, r: "10\u201315", c: 0, d: D_ISOLADOR, rir: "1", cue: "Manuten\xE7\xE3o e progress\xE3o. Adutores contribuem para uma coxa completa." },
    { n: "Panturrilha em p\xE9", car: "pino", g: "panturrilha", s: 3, r: "6\u201310", c: 0, d: D_MEDIO, rir: "1", cue: "Joelho estendido, para o gastrocn\xEAmio. Execu\xE7\xE3o r\xEDgida: descida completa, pausa alongado, subida completa. Nada de virar 10 repeti\xE7\xF5es em 20 meios movimentos de tornozelo." },
    { n: "Panturrilha sentada", car: "lado", g: "panturrilha", s: 2, r: "10\u201315", c: 0, d: D_ISOLADOR, rir: "1", cue: "Joelho flexionado, para o s\xF3leo. Pause no alongamento. Nada de quicar." }
  ] },
  C: { name: "Costas + deltoides + b\xEDceps", tag: "aqui entra o deltoide anterior", ex: [
    { n: "Remada para dorsal com apoio de peito", car: "lado", g: "dorsal", s: 3, r: "6\u201310", c: 1, d: D_MAQUINA, rir: "1\u20132", cue: "Cotovelo mais junto do tronco, trajet\xF3ria em dire\xE7\xE3o ao quadril. Esta \xE9 a remada de DORSAL." },
    { n: "High row com apoio de peito", car: "lado", g: "costas espessura", s: 3, r: "8\u201312", c: 1, d: D_MAQUINA, rir: "1\u20132", cue: "Cotovelo relativamente mais aberto, puxando para a regi\xE3o superior e m\xE9dia das costas. Fun\xE7\xE3o diferente da anterior \u2014 n\xE3o s\xE3o duas m\xE1quinas fazendo a mesma coisa." },
    { n: "Pullover em m\xE1quina ou cabo", car: "pino", g: "dorsal", s: 2, r: "10\u201315", c: 0, d: D_MEDIO, rir: "1", cue: "Est\xEDmulo na dorsal sem adicionar fadiga de b\xEDceps." },
    { n: "Reverse pec deck", car: "pino", g: "delt posterior", s: 3, r: "12\u201320", c: 0, d: D_ISOLADOR, rir: "0\u20131", cue: "Posterior est\xE1 proporcional: progress\xE3o normal, com o tronco apoiado." },
    { n: "Eleva\xE7\xE3o frontal unilateral no cabo", car: "pino", g: "delt anterior", s: 2, r: "10\u201315", c: 0, d: D_CURTO, rir: "1", cue: "As duas \xFAnicas s\xE9ries diretas de deltoide anterior da semana. S\xE3o poucas de prop\xF3sito: os presses inclinados e o horizontal j\xE1 entregam bastante. Suba at\xE9 a linha dos olhos, sem balan\xE7o de tronco." },
    { n: "Rosca Scott na m\xE1quina", car: "pino", g: "b\xEDceps", s: 2, r: "8\u201312", c: 0, d: D_ISOLADOR, rir: "1", cue: "Sem balan\xE7o de tronco." },
    { n: "Rosca martelo", car: "halter", g: "b\xEDceps", s: 2, r: "10\u201315", c: 0, d: D_ISOLADOR, rir: "1", cue: "Braquial e braquiorradial, que d\xE3o espessura ao bra\xE7o de lado." }
  ] },
  D: { name: "Especializa\xE7\xE3o: lateral + panturrilha + abd\xF4men", tag: "treino de verdade, fadiga sist\xEAmica baixa", ex: [
    { n: "Eleva\xE7\xE3o lateral na m\xE1quina", car: "pino", g: "delt lateral", s: 3, r: "10\u201315", c: 0, d: D_ISOLADOR, rir: "1", cue: "Segunda exposi\xE7\xE3o semanal de lateral, com tr\xEAs dias de recupera\xE7\xE3o desde a segunda. Aqui cabe progress\xE3o pesada." },
    { n: "Eleva\xE7\xE3o lateral unilateral no cabo", car: "pino", g: "delt lateral", s: 3, r: "12\u201320", c: 0, d: D_CURTO, rir: "0\u20131", cue: "Fecha as 12 s\xE9ries semanais de lateral. Pode chegar perto da falha mantendo o movimento lateral." },
    { n: "Panturrilha sentada", car: "lado", g: "panturrilha", s: 3, r: "8\u201315", c: 0, d: D_ISOLADOR, rir: "1", cue: "S\xF3leo em dose maior hoje: na ter\xE7a foram 2, aqui s\xE3o 3. As duas posi\xE7\xF5es recebem trabalho na semana." },
    { n: "Panturrilha em p\xE9", car: "pino", g: "panturrilha", s: 2, r: "8\u201312", c: 0, d: D_ISOLADOR, rir: "1", cue: "Gastrocn\xEAmio, dose menor hoje. Panturrilha \xE9 progredida e registrada como peito ou b\xEDceps, n\xE3o como finaliza\xE7\xE3o." },
    { n: "Crunch no cabo ou m\xE1quina", car: "pino", g: "abd\xF4men", s: 3, r: "8\u201315", c: 0, d: D_ISOLADOR, rir: "1", cue: "Flex\xE3o de tronco com carga progressiva. Abd\xF4men \xE9 treinado como qualquer outro m\xFAsculo." },
    { n: "Eleva\xE7\xE3o de pernas ou reverse crunch", car: "corpo", g: "abd\xF4men", s: 3, r: "10\u201315", c: 0, d: D_CURTO, rir: "1", cue: "Complementa com o movimento p\xE9lvico. Suba com o quadril, n\xE3o com o balan\xE7o. Chegou nas 15 f\xE1ceis dentro do RIR, aumenta a dificuldade." }
  ] },
  E: { name: "Peito superior + costas + bra\xE7os", tag: "compacto: amanh\xE3 tem HYROX", ex: [
    { n: "Supino inclinado no Smith", car: "lado", g: "peito superior", s: 3, r: "6\u201310", c: 1, d: D_COMPOSTO, rir: "1\u20132", cue: "Segunda exposi\xE7\xE3o pesada de peito superior. Alta estabilidade e \xF3tima capacidade de progress\xE3o: \xE9 aqui que a carga sobe ao longo dos meses." },
    { n: "Remada convergente com apoio de peito", car: "lado", g: "costas espessura", s: 3, r: "8\u201312", c: 1, d: D_MAQUINA, rir: "1\u20132", cue: "Tronco apoiado tira a lombar da conta." },
    { n: "Chest press horizontal convergente", car: "pino", g: "peito", s: 2, r: "8\u201312", c: 1, d: D_MAQUINA, rir: "1", cue: "Preserva o peito m\xE9dio sem tirar o foco da regi\xE3o clavicular." },
    { n: "Crossover de baixo para cima", car: "pino", g: "peito superior", s: 2, r: "10\u201315", c: 0, d: D_ISOLADOR, rir: "1", cue: "Fecha as 10 s\xE9ries semanais de clavicular, est\xE1vel e pouco fatigante. Sem virar eleva\xE7\xE3o frontal." },
    { n: "Rosca Bayesian no cabo", car: "pino", g: "b\xEDceps", s: 2, r: "10\u201315", c: 0, d: D_ISOLADOR, rir: "1", cue: "Bra\xE7o atr\xE1s do corpo, alongando a cabe\xE7a longa." },
    { n: "Extens\xE3o de tr\xEDceps acima da cabe\xE7a no cabo", car: "pino", g: "tr\xEDceps", s: 2, r: "10\u201315", c: 0, d: D_ISOLADOR, rir: "1", cue: "\xDAltima coisa da semana de muscula\xE7\xE3o. N\xE3o precisa ser heroico: amanh\xE3 tem HYROX." }
  ] },
  // O HYROX é sessão de verdade, não cardio complementar — e é por isso que
  // ocupa a rotação. Mas as estações NÃO são séries de hipertrofia: corrida,
  // sled e wall balls são estímulo de outra natureza, e transformá-los em
  // "séries de quadríceps" faria o painel de volume mentir. Por isso todas
  // entram com grupo muscular VAZIO — o que as mantém fora do alvo por
  // músculo, exatamente como uma série registrada sem grupo conhecido.
  //
  // Todas são medidas por TEMPO, que é como o HYROX pontua: a distância e as
  // repetições são fixas, o que melhora é o relógio. O app já sabe disso —
  // exercício por tempo não recebe selo de subir carga, e o histórico vira
  // tempo total em vez de volume.
  // O sábado é ABERTO: quem programa é o box, e ele nunca sabe de véspera.
  // Nasce sem exercício, e o que entra nele é o próprio dia, não uma emenda à
  // prescrição. As nove estações da prova continuam no catálogo, em
  // SIMULACAO_HYROX, alcançáveis pela busca como qualquer outro exercício.
  HX: { name: "HYROX", tag: "o que o box programar", aberto: 1, ex: [] }
};
var ALT = {
  // A
  "Chest press inclinado convergente": [
    { n: "Supino inclinado no Smith", w: "Indicado pelo treinador. Mesmo \xE2ngulo, trajet\xF3ria travada." },
    { n: "M\xE1quina de supino inclinado", w: "Indicada pelo treinador, se for plate-loaded. Converg\xEAncia menor, resto igual." },
    { n: "Supino inclinado com halteres", w: "Mais amplitude, mais exig\xEAncia de estabilidade." }
  ],
  "Crossover de baixo para cima": [
    { n: "Crucifixo inclinado no cabo", w: "Indicado pelo treinador. Mesma regi\xE3o, menos vetor ascendente." },
    { n: "Crossover na polia baixa", w: "Praticamente o mesmo movimento." },
    { n: "Peck deck com banco inclinado", w: "Trajet\xF3ria guiada, alongamento menor." }
  ],
  "Eleva\xE7\xE3o lateral na m\xE1quina": [
    { n: "Eleva\xE7\xE3o lateral unilateral no cabo", w: "Indicada pelo treinador. Um lado por vez, tens\xE3o previs\xEDvel." },
    { n: "Eleva\xE7\xE3o lateral no cabo", w: "Tens\xE3o constante, carga menor." },
    { n: "Eleva\xE7\xE3o lateral com halteres", w: "Perde tens\xE3o embaixo, ganha no topo." }
  ],
  "Eleva\xE7\xE3o lateral unilateral no cabo": [
    { n: "Eleva\xE7\xE3o lateral na m\xE1quina", w: "Indicada pelo treinador. Mais carga, menos ajuste fino." },
    { n: "Eleva\xE7\xE3o lateral com halteres", w: "Dois lados de uma vez, mais r\xE1pido." },
    { n: "Eleva\xE7\xE3o lateral deitado no banco inclinado", w: "Pico de tens\xE3o mais cedo na amplitude." }
  ],
  "Extens\xE3o de tr\xEDceps acima da cabe\xE7a no cabo": [
    { n: "Extens\xE3o acima da cabe\xE7a ou m\xE1quina de tr\xEDceps", w: "Indicada pelo treinador. Trajet\xF3ria guiada, mesmo alongamento da cabe\xE7a longa." },
    { n: "Tr\xEDceps franc\xEAs com halter", w: "Um bra\xE7o por vez, corrige assimetria." },
    { n: "Tr\xEDceps testa com barra W", w: "Mesma cabe\xE7a longa, mais cobran\xE7a no cotovelo." }
  ],
  "Pushdown": [
    { n: "Tr\xEDceps corda na polia", w: "Mesma coisa com rota\xE7\xE3o no fim." },
    { n: "Tr\xEDceps barra reta na polia", w: "Pega fixa, d\xE1 para carregar mais." },
    { n: "Mergulho na m\xE1quina assistida", w: "Entra peito e ombro junto." }
  ],
  "Crunch no cabo ou m\xE1quina": [
    { n: "M\xE1quina de abdominal", w: "Indicada pelo treinador. Trajet\xF3ria guiada, mais f\xE1cil de carregar." },
    { n: "Abdominal na polia alta ajoelhado", w: "Mesmo padr\xE3o, \xE9 a vers\xE3o no cabo." },
    { n: "Crunch com anilha no colo", w: "Sem equipamento, carga limitada." }
  ],
  // B
  "Pulldown convergente": [
    { n: "Puxada neutra no cabo", w: "Indicada pelo treinador. Mesma pegada, tens\xE3o do cabo em vez da placa." },
    { n: "Puxada neutra na m\xE1quina", w: "Sem converg\xEAncia, resto igual." },
    { n: "Barra fixa assistida pegada neutra", w: "Peso do corpo, esc\xE1pula mais livre." }
  ],
  "Pulldown unilateral": [
    { n: "Puxada neutra unilateral", w: "Indicada pelo treinador: \xE9 a m\xE1quina unilateral de dorsal." },
    { n: "Puxada unilateral na polia alta", w: "Tens\xE3o constante, carga menor." },
    { n: "Remada unilateral na polia alta ajoelhado", w: "\xC2ngulo mais horizontal." }
  ],
  "Remada para dorsal com apoio de peito": [
    { n: "Remada unilateral apoiada", w: "Indicada pelo treinador. Um lado por vez, com o tronco apoiado." },
    { n: "Remada baixa na polia com tri\xE2ngulo", w: "Mesmo \xE2ngulo de cotovelo, cabo em vez de placa." },
    { n: "Remada sentada pegada neutra fechada", w: "Sem apoio: lombar entra na conta." }
  ],
  "Pullover em m\xE1quina ou cabo": [
    { n: "Straight-arm pulldown", w: "Indicado pelo treinador. Bra\xE7o mais estendido, mesma fun\xE7\xE3o." },
    { n: "Pullover na polia alta", w: "\xC9 a vers\xE3o no cabo do mesmo movimento." },
    { n: "Pullover com halter no banco", w: "Mais alongamento, resist\xEAncia s\xF3 no meio." }
  ],
  "Reverse pec deck": [
    { n: "Crucifixo inverso no cabo", w: "Amplitude maior, carga menor." },
    { n: "Crucifixo inverso com halteres no banco inclinado", w: "Sem tens\xE3o no fim da amplitude." },
    { n: "Face pull na polia alta", w: "Mais rota\xE7\xE3o externa junto." }
  ],
  "Crucifixo inverso no cabo": [
    { n: "Reverse pec deck", w: "Mais carga, tronco apoiado." },
    { n: "Crucifixo inverso com halteres", w: "Perde tens\xE3o na parte baixa." },
    { n: "Face pull na polia alta", w: "Mais rota\xE7\xE3o externa junto." }
  ],
  "Eleva\xE7\xE3o frontal unilateral no cabo": [
    { n: "Eleva\xE7\xE3o frontal na m\xE1quina", w: "Indicada pelo treinador. Trajet\xF3ria guiada, d\xE1 para carregar mais." },
    { n: "Eleva\xE7\xE3o frontal bilateral no cabo", w: "Indicada pelo treinador. Os dois lados de uma vez, mais r\xE1pido." },
    { n: "Eleva\xE7\xE3o frontal com halteres", w: "Perde tens\xE3o embaixo, ganha simplicidade." }
  ],
  "Rosca Scott na m\xE1quina": [
    { n: "Rosca Scott no cabo", w: "Indicada pelo treinador. Mesma posi\xE7\xE3o, tens\xE3o constante." },
    { n: "Rosca Scott com barra W", w: "Mesma posi\xE7\xE3o, pulso mais confort\xE1vel." },
    { n: "Rosca concentrada", w: "Um bra\xE7o por vez, mais lenta." }
  ],
  "Rosca no cabo": [
    { n: "Rosca direta na barra W", w: "Mais carga, tens\xE3o irregular." },
    { n: "Rosca Bayesian no cabo", w: "Bra\xE7o atr\xE1s do corpo, mais alongamento." },
    { n: "Rosca alternada com halteres", w: "Um lado por vez, com supina\xE7\xE3o." }
  ],
  // C
  "Agachamento no Smith": [
    { n: "Agachamento hack", w: "Considerado pelo treinador para a mesma fun\xE7\xE3o. Curva de resist\xEAncia diferente." },
    { n: "Belt squat", w: "Considerado pelo treinador para a mesma fun\xE7\xE3o. Tira a carga da coluna." }
  ],
  "Pendulum squat": [
    { n: "Agachamento hack", w: "Mesma ideia, curva de resist\xEAncia diferente." },
    { n: "Belt squat", w: "Tira a carga da coluna." },
    { n: "Leg press vertical", w: "Mais quadril, menos joelho." }
  ],
  "Leg press": [
    { n: "Agachamento hack", w: "Indicado pelo treinador \u2014 como o pendulum, ajustando o volume para n\xE3o somar duas vezes o mesmo est\xEDmulo." },
    { n: "Leg press 45\xB0", w: "\xC9 a mesma m\xE1quina em outro \xE2ngulo." },
    { n: "Leg press horizontal", w: "Amplitude menor, lombar mais protegida." }
  ],
  "Cadeira extensora": [
    { n: "Extensora unilateral", w: "Um lado por vez, corrige diferen\xE7a." },
    { n: "Sissy squat na m\xE1quina", w: "Alonga o reto femoral, mais duro no joelho." },
    { n: "Leg press com p\xE9 baixo", w: "Composto: cansa mais para o mesmo alvo." }
  ],
  "Adutora": [
    { n: "Adutora em p\xE9 na polia", w: "Um lado por vez, amplitude maior." },
    { n: "Agachamento sum\xF4 no Smith", w: "Composto, entra quadr\xEDceps e gl\xFAteo." },
    { n: "Leg press com p\xE9 afastado", w: "Adutor como coadjuvante, n\xE3o como alvo." }
  ],
  "Panturrilha em p\xE9": [
    { n: "Panturrilha no Smith", w: "Indicada pelo treinador. Precisa de degrau, amplitude igual." },
    { n: "Panturrilha no hack", w: "Indicada pelo treinador. Ombro apoiado, f\xE1cil de carregar." },
    { n: "Panturrilha na m\xE1quina em p\xE9", w: "\xC9 a mesma coisa em outro equipamento." }
  ],
  "Panturrilha sentada": [
    { n: "Panturrilha sentada na m\xE1quina", w: "Indicada pelo treinador: a m\xE1quina espec\xEDfica de s\xF3leo." },
    { n: "Panturrilha sentada no Smith", w: "Indicada pelo treinador. Barra sobre o joelho, amplitude igual." },
    { n: "Panturrilha no leg press com joelho flexionado", w: "Menos s\xF3leo isolado." }
  ],
  "Tibial anterior": [
    { n: "Tibial na m\xE1quina", w: "Mesmo alvo, carga mais f\xE1cil de ajustar." },
    { n: "Tibial com anilha sentado", w: "Sem equipamento, carga limitada." },
    { n: "Flex\xE3o de tornozelo na polia baixa", w: "Tens\xE3o constante." }
  ],
  // E
  "Remada convergente com apoio de peito": [
    { n: "Remada cavalinho", w: "Sem apoio: lombar e quadril entram." },
    { n: "Remada na m\xE1quina com apoio de peito", w: "Sem converg\xEAncia, resto igual." },
    { n: "Remada curvada com barra", w: "Muito mais custo sist\xEAmico." }
  ],
  "Remada horizontal na m\xE1quina": [
    { n: "Remada sentada na polia", w: "Cabo em vez de placa, mesma trajet\xF3ria." },
    { n: "Remada baixa pegada pronada", w: "Cotovelo mais aberto, mais upper back." },
    { n: "Remada na m\xE1quina pegada larga", w: "Desloca para a parte alta das costas." }
  ],
  "High row com apoio de peito": [
    { n: "Remada alta na m\xE1quina", w: "Indicada pelo treinador: a m\xE1quina de upper back row. Mesmo \xE2ngulo sem o apoio de peito." },
    { n: "Remada na polia alta sentado", w: "Tens\xE3o constante, carga menor." },
    { n: "Remada cavalinho pegada larga", w: "Sem apoio, lombar entra." }
  ],
  "Encolhimento na m\xE1quina": [
    { n: "Encolhimento com halteres", w: "Pega mais exigente, mesma fun\xE7\xE3o." },
    { n: "Encolhimento no Smith", w: "Trajet\xF3ria fixa, d\xE1 para carregar mais." },
    { n: "Encolhimento na polia baixa", w: "Tens\xE3o constante no topo." }
  ],
  "Straight-arm pulldown": [
    { n: "Pullover na polia alta", w: "Praticamente o mesmo movimento." },
    { n: "Pullover em m\xE1quina", w: "Trajet\xF3ria guiada, mais est\xE1vel." },
    { n: "Pullover com halter no banco", w: "Mais alongamento, resist\xEAncia s\xF3 no meio." }
  ],
  "Supino inclinado no Smith": [
    { n: "Chest press inclinado convergente", w: "Indicado pelo treinador. \xC9 o mesmo alvo do A, em m\xE1quina." },
    { n: "Supino inclinado com halteres", w: "Mais amplitude, mais estabiliza\xE7\xE3o." },
    { n: "Supino inclinado com barra", w: "Menos amplitude embaixo, mais carga." }
  ],
  "Crucifixo inclinado no cabo": [
    { n: "Pec deck", w: "Indicado pelo treinador, com a trajet\xF3ria ajustada para o ombro ficar confort\xE1vel." },
    { n: "Crossover de baixo para cima", w: "Mesmo alvo com vetor ascendente." },
    { n: "Crucifixo inclinado com halteres", w: "Perde tens\xE3o no topo." }
  ],
  "Chest press horizontal convergente": [
    { n: "Supino reto na m\xE1quina", w: "Sem converg\xEAncia, resto igual." },
    { n: "Supino reto com halteres", w: "Mais amplitude, mais custo de ombro." },
    { n: "Supino no Smith", w: "Trajet\xF3ria travada, mais carga." }
  ],
  "Pec deck": [
    { n: "Crossover na polia m\xE9dia", w: "Amplitude maior, carga menor." },
    { n: "Crucifixo com halteres", w: "Sem tens\xE3o no topo." },
    { n: "Peck deck unilateral", w: "Um lado por vez, corrige diferen\xE7a." }
  ],
  // D
  "Eleva\xE7\xE3o lateral no cabo": [
    { n: "Eleva\xE7\xE3o lateral na m\xE1quina", w: "Mais carga, menos ajuste fino." },
    { n: "Eleva\xE7\xE3o lateral com halteres", w: "Perde tens\xE3o embaixo." },
    { n: "Eleva\xE7\xE3o lateral no Smith unilateral", w: "Trajet\xF3ria fixa, um lado por vez." }
  ],
  "Remada para deltoide posterior com apoio de peito": [
    { n: "Face pull na polia alta", w: "Mesmo alvo, mais rota\xE7\xE3o externa." },
    { n: "Remada alta com corda", w: "Cotovelo mais alto, entra trap\xE9zio." },
    { n: "Remada aberta na m\xE1quina", w: "Sem apoio de peito." }
  ],
  "Reverse fly no cabo": [
    { n: "Reverse pec deck", w: "Mais carga, tronco apoiado." },
    { n: "Crucifixo inverso com halteres", w: "Perde tens\xE3o no fim da amplitude." },
    { n: "Face pull na polia alta", w: "Mais rota\xE7\xE3o externa junto." }
  ],
  "Rosca Bayesian no cabo": [
    { n: "Rosca no cabo", w: "Indicada pelo treinador, com o bra\xE7o atr\xE1s do corpo para manter o alongamento." },
    { n: "Rosca inclinada com halteres", w: "Mesmo alongamento sem tens\xE3o constante." },
    { n: "Rosca Scott na m\xE1quina", w: "Encurta em vez de alongar a cabe\xE7a longa." }
  ],
  "Rosca martelo": [
    { n: "Rosca martelo na corda", w: "Tens\xE3o constante, pulso mais livre." },
    { n: "Rosca inversa na barra W", w: "Mais braquiorradial, menos carga." },
    { n: "Rosca martelo cruzada", w: "Um bra\xE7o por vez, cruzando o corpo." }
  ],
  "Extens\xE3o unilateral de tr\xEDceps no cabo": [
    { n: "Pushdown unilateral", w: "Mesma coisa com pegada diferente." },
    { n: "Tr\xEDceps coice com halter", w: "Pico no encurtamento, carga baixa." },
    { n: "Extens\xE3o unilateral acima da cabe\xE7a", w: "Alonga a cabe\xE7a longa." }
  ],
  "Extens\xE3o acima da cabe\xE7a ou m\xE1quina de tr\xEDceps": [
    { n: "Tr\xEDceps testa com barra W", w: "Mais carga, mais cobran\xE7a no cotovelo." },
    { n: "M\xE1quina de tr\xEDceps sentado", w: "Trajet\xF3ria guiada, mais segura." },
    { n: "Tr\xEDceps franc\xEAs com halter", w: "Um bra\xE7o por vez." }
  ],
  "Eleva\xE7\xE3o de pernas ou reverse crunch": [
    { n: "Eleva\xE7\xE3o de pernas suspenso", w: "Mais dif\xEDcil, exige pegada firme." },
    { n: "Reverse crunch no banco declinado", w: "Amplitude menor, mais controle." },
    { n: "Eleva\xE7\xE3o de pernas no banco", w: "Vers\xE3o mais f\xE1cil do mesmo padr\xE3o." }
  ],
  // F
  "Cadeira flexora sentada": [
    { n: "Cadeira flexora sentada de outro modelo", w: "Indicada pelo treinador: outra m\xE1quina SENTADA. \xC9 a posi\xE7\xE3o de quadril que d\xE1 o alongamento \u2014 trocar por deitada perde justamente isso." },
    { n: "Mesa flexora deitada", w: "Quadril estendido: menos alongamento no posterior." },
    { n: "Flexora unilateral em p\xE9", w: "Um lado por vez, corrige diferen\xE7a." }
  ],
  "Terra romeno no Smith": [
    { n: "Terra romeno com barra", w: "Indicado pelo treinador. Mais custo de lombar e de pegada." },
    { n: "Terra romeno com halteres", w: "Indicado pelo treinador. Mais estabiliza\xE7\xE3o, menos carga." },
    { n: "Good morning no Smith", w: "Mais lombar, menos posterior." }
  ],
  "Mesa flexora deitada": [
    { n: "Cadeira flexora sentada", w: "Quadril fletido: mais alongamento." },
    { n: "Flexora unilateral deitada", w: "Um lado por vez." },
    { n: "Flexora n\xF3rdica assistida", w: "Exc\xEAntrica pesada, dif\xEDcil de progredir." }
  ],
  "Eleva\xE7\xE3o p\xE9lvica na m\xE1quina": [
    { n: "Hip thrust no Smith", w: "Indicado pelo treinador. Trajet\xF3ria fixa, f\xE1cil de carregar." },
    { n: "Eleva\xE7\xE3o p\xE9lvica com barra", w: "Mesma coisa, montagem mais chata." },
    { n: "Coice na m\xE1quina", w: "Um lado por vez, carga bem menor." }
  ],
  "Abdutora": [
    { n: "Abdutora em p\xE9 na polia", w: "Um lado por vez, amplitude maior." },
    { n: "Abdu\xE7\xE3o deitado com caneleira", w: "Carga limitada." },
    { n: "Passada lateral com el\xE1stico", w: "Resist\xEAncia crescente, dif\xEDcil de medir." }
  ],
  "Panturrilha no leg press": [
    { n: "Panturrilha em p\xE9 na m\xE1quina", w: "Joelho estendido: mais gastrocn\xEAmio." },
    { n: "Panturrilha no Smith", w: "Precisa de degrau, amplitude igual." },
    { n: "Panturrilha unilateral com halter", w: "Metade da carga, um p\xE9 por vez." }
  ],
  "Ab wheel": [
    { n: "Eleva\xE7\xE3o de pernas ou reverse crunch", w: "Indicado pelo treinador, na vers\xE3o carregada." },
    { n: "Rollout na barra", w: "Mesmo padr\xE3o com barra carregada." },
    { n: "Prancha com peso", w: "Isom\xE9trico: sem amplitude, mais f\xE1cil de dosar." }
  ]
};
var LEGADO = {
  "Pendulum squat": { car: "lado", g: "quadr\xEDceps", c: 1, cue: "Saiu do programa na revis\xE3o que deu \xEAnfase a posteriores e gl\xFAteo. O agachamento no Smith ocupou o lugar, com duas s\xE9ries em vez de tr\xEAs." },
  "Remada horizontal na m\xE1quina": { car: "pino", g: "costas espessura", c: 1, cue: "Escolha o equipamento onde d\xE1 para deixar a esc\xE1pula protrair e depois retrair confort\xE1vel." },
  "Encolhimento na m\xE1quina": { car: "pino", g: "trap\xE9zio", c: 0, cue: "Saiu do programa: trap\xE9zio n\xE3o \xE9 limita\xE7\xE3o visual, e remadas e terra romeno j\xE1 d\xE3o est\xEDmulo." },
  "Remada para deltoide posterior com apoio de peito": { car: "lado", g: "delt posterior", c: 1, cue: "Cotovelo afastado do tronco, puxando para tr\xE1s." },
  "Reverse fly no cabo": { car: "pino", g: "delt posterior", c: 0, cue: "Amplitude maior, um lado por vez se preferir." },
  "Extens\xE3o unilateral de tr\xEDceps no cabo": { car: "pino", g: "tr\xEDceps", c: 0, cue: "Corrige diferen\xE7a entre os lados." },
  "Abdutora": { car: "pino", g: "gl\xFAteo m\xE9dio", c: 0, cue: "Gl\xFAteo m\xE9dio. Saiu do programa na redu\xE7\xE3o de volume." },
  "Tibial anterior": { car: "pino", g: "tibial", c: 0, cue: "N\xE3o \xE9 obrigat\xF3rio para est\xE9tica; saiu quando o volume foi cortado." },
  "Pec deck": { car: "pino", g: "peito", c: 0, cue: "Trajet\xF3ria guiada; d\xE1 para chegar perto da falha. Hoje \xE9 o substituto do crucifixo inclinado." },
  "Straight-arm pulldown": { car: "pino", g: "dorsal", c: 0, cue: "Bra\xE7o mais estendido. Hoje \xE9 o substituto indicado do pullover." },
  "Eleva\xE7\xE3o lateral no cabo": { car: "pino", g: "delt lateral", c: 0, cue: "Tens\xE3o constante na parte de baixo, onde o halter perde." },
  "Crucifixo inverso no cabo": { car: "pino", g: "delt posterior", c: 0, cue: "Amplitude maior, carga menor que o reverse pec deck." },
  "Rosca no cabo": { car: "pino", g: "b\xEDceps", c: 0, cue: "Tens\xE3o constante ao longo da amplitude." },
  "Extens\xE3o acima da cabe\xE7a ou m\xE1quina de tr\xEDceps": { car: "pino", g: "tr\xEDceps", c: 0, cue: "Hoje \xE9 o substituto indicado da extens\xE3o acima da cabe\xE7a no cabo." },
  // saíram na revisão de dezembro, quando a perna virou um dia só e o abdômen
  // migrou para a quinta
  "Mesa flexora deitada": { car: "pino", g: "posterior", c: 0, cue: "Exc\xEAntrica de 3 s. Quadril estendido: menos alongamento que a flexora sentada, que \xE9 a que ficou." },
  "Panturrilha no leg press": { car: "lado", g: "panturrilha", c: 0, cue: "Joelho estendido. Saiu quando a panturrilha passou a ser treinada em dois dias." },
  "Ab wheel": { car: "corpo", g: "abd\xF4men", c: 0, cue: "De joelhos e com amplitude parcial. Saiu quando o abd\xF4men concentrou na quinta." }
};
function slugEx(n) {
  return String(n).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
var PEGADA_POR_NOME = {
  // --- peito e ombro: o controle é não passar da linha do tronco ---
  "Chest press inclinado convergente": { t: "neutra nos pegadores verticais, pronada nos horizontais" },
  "Chest press horizontal convergente": { t: "neutra nos pegadores verticais, pronada nos horizontais" },
  "M\xE1quina de supino inclinado": { t: "neutra nos pegadores verticais, pronada nos horizontais" },
  "Supino reto na m\xE1quina": { t: "neutra nos pegadores verticais, pronada nos horizontais" },
  "Crucifixo inclinado no cabo": { t: "neutra, cotovelo semi-fletido e fixo" },
  "Crucifixo com halteres": { t: "neutra, cotovelo semi-fletido e fixo" },
  "Crucifixo inclinado com halteres": { t: "neutra, cotovelo semi-fletido e fixo" },
  "Crossover de baixo para cima": { t: "neutra, cotovelo semi-fletido e fixo" },
  "Crossover na polia baixa": { t: "neutra, cotovelo semi-fletido e fixo" },
  "Crossover na polia m\xE9dia": { t: "neutra, cotovelo semi-fletido e fixo" },
  "Supino inclinado com barra": { t: "pronada, pouco al\xE9m da largura dos ombros" },
  "Supino inclinado com halteres": { t: "pronada, ou semi-neutra a 45\xB0" },
  "Supino reto com halteres": { t: "pronada, ou semi-neutra a 45\xB0" },
  // --- o segundo mecanismo de ombro: não fechar o espaço subacromial ---
  "Eleva\xE7\xE3o lateral na m\xE1quina": { t: "empurre com o cotovelo, n\xE3o com a m\xE3o" },
  "Eleva\xE7\xE3o lateral unilateral no cabo": { t: "punho neutro; pare na altura do ombro" },
  "Eleva\xE7\xE3o lateral com halteres": { t: "punho neutro; pare na altura do ombro" },
  "Eleva\xE7\xE3o lateral no cabo": { t: "punho neutro; pare na altura do ombro" },
  "Eleva\xE7\xE3o frontal unilateral no cabo": { t: "punho neutro; pare na altura do ombro" },
  "Eleva\xE7\xE3o frontal com halteres": { t: "punho neutro; pare na altura do ombro" },
  "Eleva\xE7\xE3o frontal bilateral no cabo": { t: "punho neutro; pare na altura do ombro" },
  // O item de maior risco de ombro da lista, e só uma das duas revisões o viu.
  "Remada alta com corda": { t: "pare o cotovelo abaixo da altura do ombro" },
  "Remada alta na m\xE1quina": { t: "pare o cotovelo abaixo da altura do ombro" },
  // --- costas: largura muda carga e conforto, não o alvo (Andersen 2014) ---
  "Pulldown unilateral": { t: "neutra ou supinada; ombro desce antes do cotovelo" },
  "Puxada unilateral na polia alta": { t: "neutra ou supinada; ombro desce antes do cotovelo" },
  "Remada para dorsal com apoio de peito": { t: "neutra e fechada, cotovelo rente ao corpo" },
  "Remada convergente com apoio de peito": { t: "neutra e fechada, cotovelo rente ao corpo" },
  "Remada na m\xE1quina com apoio de peito": { t: "neutra e fechada, cotovelo rente ao corpo" },
  "High row com apoio de peito": { t: "cotovelo alto, na linha dos ombros" },
  "Reverse pec deck": { t: "pronada, cotovelo na altura do ombro" },
  "Face pull na polia alta": { t: "corda na altura do rosto, cotovelo alto" },
  // --- braço: onde a escolha de acessório poupa punho e cotovelo ---
  "Pushdown": { t: "corda em neutra se o punho incomodar" },
  "Pushdown unilateral": { t: "supinada ou neutra na manopla" },
  "Tr\xEDceps corda na polia": { t: "neutra; abra as pontas no fim" },
  // --- perna: aqui a decisão é do PÉ, e é ela que cruza com o tendão patelar ---
  "Agachamento no Smith": { t: "largura dos ombros, e a mesma posi\xE7\xE3o entre as sess\xF5es", pe: 1 },
  "Pendulum squat": { t: "largura dos ombros, no meio da plataforma", pe: 1 },
  "Leg press": { t: "largura dos ombros, no meio da plataforma", pe: 1 },
  "Leg press 45\xB0": { t: "largura dos ombros, no meio da plataforma", pe: 1 },
  "Leg press horizontal": { t: "largura dos ombros, no meio da plataforma", pe: 1 },
  "Agachamento hack": { t: "largura dos ombros, no meio da plataforma", pe: 1 },
  "Cadeira extensora": { t: "alinhe o joelho ao eixo da m\xE1quina", pe: 1 },
  "Extensora unilateral": { t: "alinhe o joelho ao eixo da m\xE1quina", pe: 1 },
  "Cadeira flexora sentada": { t: "alinhe o joelho ao eixo; coxa presa", pe: 1 },
  "Mesa flexora deitada": { t: "alinhe o joelho ao eixo da m\xE1quina", pe: 1 },
  "Eleva\xE7\xE3o p\xE9lvica na m\xE1quina": { t: "apoio na dobra do quadril, n\xE3o na barriga", pe: 1 },
  "Eleva\xE7\xE3o p\xE9lvica com barra": { t: "apoio na dobra do quadril, n\xE3o na barriga", pe: 1 },
  "Hip thrust no Smith": { t: "apoio na dobra do quadril, n\xE3o na barriga", pe: 1 },
  "Panturrilha em p\xE9": { t: "antep\xE9 na borda, p\xE9s paralelos", pe: 1 },
  "Panturrilha sentada": { t: "antep\xE9 na borda, p\xE9s paralelos", pe: 1 },
  // --- HYROX ---
  "Ski erg": { t: "pegue alto nas al\xE7as, punho neutro" },
  // A técnica do sled pull não cabe numa linha, mas ESTA metade cabe e é
  // proibição, não resumo: enrolar a corda no braço é o erro que machuca.
  "Sled pull": { t: "m\xE3o sobre m\xE3o; nunca enrole a corda no bra\xE7o" },
  "Farmers carry": { t: "al\xE7a no meio da m\xE3o, ombro encaixado" },
  "Lunges com sandbag": { t: "no ombro, ou abra\xE7ado no peito" },
  "Wall balls": { t: "m\xE3os sob a bola, cotovelo por dentro" }
};
var SIMULACAO_HYROX = [
  { n: "Corrida", car: "corpo", g: "", s: 8, r: "", c: 1, d: D_CURTO, u: "m", q: 1e3, cue: "Os 8 km da prova, um a cada esta\xE7\xE3o. Registre o tempo de cada quil\xF4metro em segundos: 4:12 s\xE3o 252." },
  { n: "Ski erg", car: "corpo", g: "", s: 1, r: "", c: 0, d: D_CURTO, u: "m", q: 1e3, cue: "Puxada com o tronco, n\xE3o s\xF3 com o bra\xE7o. Tempo em segundos." },
  { n: "Sled push", car: "lado", g: "", s: 1, r: "", c: 1, d: D_CURTO, u: "m", q: 50, cue: "Carga por lado no campo de carga, tempo em segundos. Passos curtos e cont\xEDnuos: parar custa mais do que ir devagar." },
  { n: "Sled pull", car: "lado", g: "", s: 1, r: "", c: 1, d: D_CURTO, u: "m", q: 50, cue: "Puxada com o quadril para tr\xE1s, n\xE3o s\xF3 com o bra\xE7o." },
  { n: "Burpee broad jump", car: "corpo", g: "", s: 1, r: "", c: 1, d: D_CURTO, u: "m", q: 80, cue: "A esta\xE7\xE3o que mais custa em f\xF4lego. Salto curto e cad\xEAncia constante." },
  { n: "Remo erg\xF4metro", car: "corpo", g: "", s: 1, r: "", c: 0, d: D_CURTO, u: "m", q: 1e3, cue: "Perna, tronco, bra\xE7o \u2014 nessa ordem. Tempo em segundos." },
  { n: "Farmers carry", car: "halter", g: "", s: 1, r: "", c: 0, d: D_CURTO, u: "m", q: 200, cue: "Um peso em cada m\xE3o. Esc\xE1pula encaixada, sem deixar o ombro subir." },
  { n: "Lunges com sandbag", car: "halter1", g: "", s: 1, r: "", c: 1, d: D_CURTO, u: "m", q: 100, cue: "Joelho tocando o ch\xE3o a cada passo, como a prova exige. O peso \xE9 o do saco." },
  { n: "Wall balls", car: "halter1", g: "", s: 1, r: "", c: 1, d: D_CURTO, u: "rep", q: 100, cue: "A \xFAltima esta\xE7\xE3o, com a perna j\xE1 destru\xEDda. O peso \xE9 o da bola; o tempo \xE9 o que conta." }
];
var MOVIMENTOS_DE_BOX = [
  // ergômetros — em caloria, que é como a lousa costuma passar quando não é
  // distância. O mesmo aparelho em metros já existe nas estações.
  { n: "Assault bike", car: "corpo", g: "", s: 1, r: "", c: 0, d: D_CURTO, u: "cal", q: 15, cue: "Bra\xE7o e perna juntos. A caloria sobe com a pot\xEAncia, e o ritmo dela n\xE3o converte para metro." },
  { n: "Bike erg", car: "corpo", g: "", s: 1, r: "", c: 0, d: D_CURTO, u: "cal", q: 15, cue: "Cad\xEAncia constante vale mais que arrancada." },
  // repetição com carga — a carga é escolha dele e fica fixa por meses
  { n: "Kettlebell swing", car: "halter1", g: "", s: 1, r: "", c: 1, d: D_CURTO, u: "rep", q: 20, cue: "Quadril, n\xE3o ombro: o bra\xE7o s\xF3 acompanha o que o quadril lan\xE7ou." },
  { n: "Thruster", car: "halter", g: "", s: 1, r: "", c: 1, d: D_CURTO, u: "rep", q: 15, cue: "Agachamento e desenvolvimento no mesmo movimento, sem pausa no meio." },
  { n: "Devil press", car: "halter", g: "", s: 1, r: "", c: 1, d: D_CURTO, u: "rep", q: 10, cue: "Burpee com halteres e desenvolvimento no fim. Cara." },
  { n: "Clean and jerk", car: "barra", g: "", s: 1, r: "", c: 1, d: D_CURTO, u: "rep", q: 10, cue: "Barra rente ao corpo na puxada e no encaixe: ela sobe reta, n\xE3o em arco. Encaixe com o cotovelo alto antes de empurrar para cima." },
  { n: "Push press", car: "barra", g: "", s: 1, r: "", c: 1, d: D_CURTO, u: "rep", q: 12, cue: "O impulso vem de um meio agachamento curto e r\xE1pido, com o calcanhar no ch\xE3o. A barra sai junto com a extens\xE3o do joelho, sem pausa entre os dois." },
  { n: "Snatch com halter", car: "halter1", g: "", s: 1, r: "", c: 1, d: D_CURTO, u: "rep", q: 20, cue: "Alterna o bra\xE7o. O halter sobe pela linha do corpo, n\xE3o em arco." },
  // repetição sem carga — forçar um campo de peso aqui seria ruído
  { n: "Burpee", car: "corpo", g: "", s: 1, r: "", c: 1, d: D_CURTO, u: "rep", q: 20, cue: "Peito no ch\xE3o, salto no fim. Cad\xEAncia constante custa menos que arrancar e parar." },
  { n: "Box jump", car: "corpo", g: "", s: 1, r: "", c: 1, d: D_CURTO, u: "rep", q: 20, cue: "Descer com controle poupa mais tend\xE3o do que subir com for\xE7a." },
  { n: "Double under", car: "corpo", g: "", s: 1, r: "", c: 0, d: D_CURTO, u: "rep", q: 50, cue: "Punho, n\xE3o bra\xE7o. Corda de velocidade." },
  { n: "Pula-corda", car: "corpo", g: "", s: 1, r: "", c: 0, d: D_CURTO, u: "rep", q: 100, cue: "Salto baixo, na ponta do p\xE9. O giro vem do punho, com o cotovelo junto ao corpo." },
  { n: "Air squat", car: "corpo", g: "", s: 1, r: "", c: 1, d: D_CURTO, u: "rep", q: 30, cue: "Peso no p\xE9 inteiro e joelho na dire\xE7\xE3o da ponta do p\xE9. Desce at\xE9 o quadril passar do joelho sem arredondar a lombar." },
  { n: "Sit-up", car: "corpo", g: "", s: 1, r: "", c: 0, d: D_CURTO, u: "rep", q: 25, cue: "Sobe enrolando o tronco, sem puxar o pesco\xE7o com a m\xE3o. Desce com controle at\xE9 as costas tocarem o ch\xE3o." },
  { n: "Mountain climber", car: "corpo", g: "", s: 1, r: "", c: 0, d: D_CURTO, u: "rep", q: 40, cue: "Quadril na linha do ombro, sem empinar. O joelho vem at\xE9 o peito em ritmo constante." },
  // distância sem carga
  { n: "Lunge", car: "corpo", g: "", s: 1, r: "", c: 1, d: D_CURTO, u: "m", q: 50, cue: "A vers\xE3o sem saco. Joelho tocando o ch\xE3o a cada passo." },
  // tempo — a janela é fixa e o que melhora é quanto sai dela
  { n: "Prancha", car: "corpo", g: "", s: 1, r: "", c: 0, d: D_CURTO, u: "seg", q: 60, cue: "Sem carga: aqui o que se compara \xE9 o tempo, e mais \xE9 melhor." }
];
var EX_BASE = (function() {
  const c = {};
  ROT_BASE.forEach(function(d) {
    PROGRAMA[d].ex.forEach(function(ex) {
      c[slugEx(ex.n)] = { n: ex.n, car: ex.car, g: ex.g, c: ex.c, cue: ex.cue, u: ex.u, q: ex.q };
    });
  });
  SIMULACAO_HYROX.concat(MOVIMENTOS_DE_BOX).forEach(function(ex) {
    c[slugEx(ex.n)] = { n: ex.n, car: ex.car, g: ex.g, c: ex.c, cue: ex.cue, u: ex.u, q: ex.q };
  });
  Object.keys(LEGADO).forEach(function(nome) {
    const k = slugEx(nome), l = LEGADO[nome];
    if (!c[k]) c[k] = { n: nome, car: l.car, g: l.g, c: l.c, cue: l.cue, sub: 1 };
  });
  Object.keys(ALT).forEach(function(nome) {
    const base2 = c[slugEx(nome)] || {};
    ALT[nome].forEach(function(a) {
      const k = slugEx(a.n);
      if (!c[k]) c[k] = { n: a.n, car: base2.car || "pino", g: base2.g || "", c: base2.c || 0, cue: a.w, sub: 1 };
    });
  });
  Object.keys(PEGADA_POR_NOME).forEach(function(nome) {
    const k = slugEx(nome), p = PEGADA_POR_NOME[nome];
    if (!c[k]) return;
    c[k].peg = p.t;
    if (p.pe) c[k].pegPe = 1;
  });
  return c;
})();
var PRIORIDADES = {
  maxima: { rot: "prioridade m\xE1xima", mus: ["peito superior", "delt lateral"] },
  secundaria: { rot: "prioridade secund\xE1ria", mus: ["dorsal", "panturrilha", "posterior", "gl\xFAteo"] },
  direcionada: { rot: "progress\xE3o direcionada", mus: ["delt anterior"] },
  normal: { rot: "", mus: ["peito", "gl\xFAteo m\xE9dio", "adutores", "b\xEDceps", "tr\xEDceps", "abd\xF4men", "costas espessura", "delt posterior"] },
  forte: { rot: "ponto forte", mus: ["quadr\xEDceps"] },
  indireto: { rot: "est\xEDmulo indireto basta", mus: ["trap\xE9zio", "tibial"] }
};
var PRIO = PRIORIDADES.maxima.mus.concat(PRIORIDADES.secundaria.mus);
var CARGAS = {
  pino: {
    rot: "kg",
    nome: "placa",
    ajuda: "O n\xFAmero \xE9 a carga selecionada, e pronto."
  },
  lado: {
    rot: "kg/lado",
    nome: "anilha por lado",
    dobra: 1,
    cada: "de cada lado",
    total: "em anilhas",
    obs: ", fora a barra",
    ajuda: "S\xF3 um lado, sem contar a barra. O app mostra o total em anilhas."
  },
  // A barra livre é o carregamento mais padrão que existe e não tinha tipo: o
  // `lado` diz "fora a barra" e soma anilha × 2, o que erra 20 kg em toda série
  // de supino, agachamento ou terra. Ela é separada do `lado` porque máquina de
  // anilha, Smith e sled não têm barra a somar — o número deles é anilha e ponto.
  barra: {
    rot: "kg/lado",
    nome: "barra livre",
    dobra: 1,
    cada: "de cada lado",
    total: "na barra",
    obs: "",
    barra: 20,
    ajuda: "Anilha de cada lado. O app soma as duas e a barra ol\xEDmpica de 20 kg."
  },
  halter: {
    rot: "kg/lado",
    nome: "halter em cada m\xE3o",
    dobra: 1,
    cada: "em cada m\xE3o",
    total: "nas duas m\xE3os",
    obs: "",
    ajuda: "Um halter por m\xE3o. O app mostra o total das duas."
  },
  // Não se chama mais "um halter só": o tipo sempre serviu a qualquer implemento
  // único, e três exercícios do HYROX já o usavam para coisas que não são
  // halter — wall balls é uma bola, lunges com sandbag é um saco. O que estava
  // errado era o nome, não o comportamento.
  halter1: {
    rot: "kg",
    nome: "um peso s\xF3",
    ajuda: "Um implemento s\xF3: halter, kettlebell, sandbag, bola, anilha. O n\xFAmero \xE9 o peso dele."
  },
  corpo: {
    rot: "+kg",
    nome: "peso do corpo",
    ajuda: "S\xF3 o que voc\xEA acrescentou. Pode ficar vazio."
  },
  assist: {
    rot: "ajuda",
    nome: "assistida",
    ajuda: "O contrapeso que ajuda. Menos ajuda \xE9 mais for\xE7a."
  }
};
var DORES = [
  { k: "cotovelo", t: "cotovelo" },
  { k: "ombro", t: "ombro anterior" },
  { k: "patelar", t: "patelar" },
  // a lesão lombar do dono (o coach a tratou em fases, 23/11): a dor registrada
  // na série chega ao treinador pelo espelho e pelo MCP
  { k: "lombar", t: "lombar" }
];
function semeiaProg() {
  const p = {};
  ROT_BASE.forEach(function(d) {
    p[d] = {
      name: PROGRAMA[d].name,
      tag: PROGRAMA[d].tag,
      aberto: PROGRAMA[d].aberto,
      ex: PROGRAMA[d].ex.map(function(ex) {
        return {
          id: slugEx(ex.n),
          s: ex.s,
          r: ex.r,
          d: ex.d,
          rir: ex.rir,
          u: ex.u,
          q: ex.q,
          desde: 0
        };
      })
    };
  });
  return p;
}
function montaCatalogo(exDoUsuario, base2 = EX_BASE) {
  const cat = {};
  Object.keys(base2).forEach(function(k) {
    cat[k] = base2[k];
  });
  Object.keys(exDoUsuario || {}).forEach(function(k) {
    const proprio = Object.assign({}, exDoUsuario[k]);
    delete proprio.m;
    const fundo = base2[k] || exercicioFantasma(k);
    const x = Object.assign({}, fundo, proprio);
    if (!base2[k] && proprio.n) delete x.sumido;
    cat[k] = x;
  });
  return cat;
}
function exercicioFantasma(x) {
  return { n: x, car: "pino", g: "", c: 0, cue: "", sumido: 1 };
}

// src/dominio/formato.ts
var DIAS_CURTOS = ["dom", "seg", "ter", "qua", "qui", "sex", "s\xE1b"];
var DIAS_LONGOS = ["domingo", "segunda", "ter\xE7a", "quarta", "quinta", "sexta", "s\xE1bado"];
var MESES = ["janeiro", "fevereiro", "mar\xE7o", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
var PERIODOS = [
  { k: "manha", de: 5, ate: 12, rot: "\u2600\uFE0F", nome: "manh\xE3" },
  { k: "tarde", de: 12, ate: 18, rot: "\u{1F324}\uFE0F", nome: "tarde" },
  { k: "noite", de: 18, ate: 5, rot: "\u{1F319}", nome: "noite" }
];
function periodoDe(t) {
  const h = new Date(t).getHours();
  if (h >= 5 && h < 12) return PERIODOS[0];
  if (h >= 12 && h < 18) return PERIODOS[1];
  return PERIODOS[2];
}
function fmtHora(t) {
  const d = new Date(t);
  return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
}
function fmtDur(ms) {
  if (ms == null) return "\u2013";
  const m = Math.round(ms / 6e4);
  if (m < 60) return m + " min";
  return Math.floor(m / 60) + "h" + String(m % 60).padStart(2, "0");
}
function weekStart(ts) {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d.getTime();
}
function fmtDesc(sec) {
  if (sec % 60 === 0) return sec / 60 + "min";
  return sec >= 60 ? Math.floor(sec / 60) + ":" + ("0" + sec % 60).slice(-2) : sec + "s";
}

// src/dominio/protocolo.ts
var MUDANCAS_DA_SESSAO = ["luz", "roupa", "lugar"];
function mudancasDaSessao(x) {
  if (!Array.isArray(x)) return [];
  return MUDANCAS_DA_SESSAO.filter(function(m) {
    return x.indexOf(m) >= 0;
  });
}
var NOME_DA_MUDANCA = { luz: "outra luz", roupa: "outra roupa", lugar: "outro lugar" };
function ressalvaDaSessao(ses) {
  const muda = mudancasDaSessao(ses && ses.muda);
  const fora = ses ? Object.keys(ses.fotos).filter(function(id) {
    const f = ses.fotos[id];
    return !!(f && f.cap && Array.isArray(f.cap.fora) && f.cap.fora.length);
  }) : [];
  return { muda, fora, noPadrao: !muda.length && !fora.length };
}
function textoDaMudanca(muda) {
  return muda.map(function(m) {
    return NOME_DA_MUDANCA[m];
  }).join(", ");
}
function seloDaSessao(r) {
  if (r.noPadrao) return "no padr\xE3o";
  if (r.muda.length) return textoDaMudanca(r.muda);
  return r.fora.length === 1 ? "uma fora do padr\xE3o" : r.fora.length + " fora do padr\xE3o";
}
var CADENCIA_DIAS = 14;
var PROTOCOLO = [
  {
    id: "frente-relaxado",
    n: "Frente relaxado",
    bloco: "refer\xEAncia",
    giro: 0,
    bracos: "um palmo do corpo",
    como: [
      "Bra\xE7os soltos, afastados um palmo do corpo, palmas para o corpo.",
      "Olhe para a frente. N\xE3o contraia nada \u2014 nem abd\xF4men, nem ombro.",
      "Solte o ar normalmente e segure, sem for\xE7ar, at\xE9 o disparo."
    ],
    voz: "Bra\xE7os soltos, um palmo do corpo. Solte o ar e segure.",
    confira: "p\xE9s no T \xB7 bra\xE7os um palmo do corpo",
    revela: "cintura, simetria de ombro, distribui\xE7\xE3o de gordura",
    erro: "colar os bra\xE7os no corpo, que esconde o contorno da cintura"
  },
  {
    id: "frente-bracos-afastados",
    n: "Frente bra\xE7os afastados",
    bloco: "refer\xEAncia",
    giro: 0,
    bracos: "afastados, em A",
    como: [
      "Mesmo lugar e mesmo enquadramento da frente relaxada.",
      'Bra\xE7os estendidos e afastados do corpo cerca de um palmo, como um "A", m\xE3os abertas.',
      "Corpo relaxado, barriga solta, respira\xE7\xE3o normal. O bra\xE7o n\xE3o encosta no tronco."
    ],
    voz: "Bra\xE7os esticados e afastados do corpo, como um A. M\xE3os abertas. Barriga solta.",
    confira: "bra\xE7o sem encostar no tronco \xB7 m\xE3os abertas",
    revela: "contorno da cintura e do quadril de frente, sem o bra\xE7o encostado",
    erro: "deixar o bra\xE7o encostar no tronco, que apaga o contorno da cintura"
  },
  {
    id: "frente-duplo-biceps",
    n: "Frente duplo b\xEDceps",
    bloco: "m\xFAsculo",
    giro: 0,
    bracos: "cotovelos na altura do ombro",
    como: [
      "Suba os bra\xE7os at\xE9 os cotovelos ficarem na altura do ombro, punhos fechados.",
      "Abra as costas e mantenha a cintura contra\xEDda para dentro.",
      "Suba devagar: movimento brusco muda o enquadramento."
    ],
    voz: "Cotovelos na altura do ombro. Contraia.",
    confira: "cotovelos na altura do ombro \xB7 p\xE9s no T",
    revela: "bra\xE7o, ombro, largura do dorsal, peito",
    erro: "cotovelo alto demais, que some com o trap\xE9zio"
  },
  {
    id: "frente-abdomen-coxa",
    n: "Abd\xF4men e coxa",
    bloco: "m\xFAsculo",
    giro: 0,
    bracos: "m\xE3os atr\xE1s da cabe\xE7a",
    como: [
      "M\xE3os atr\xE1s da cabe\xE7a, dedos entrela\xE7ados, cotovelos abertos.",
      "Perna esquerda meio p\xE9 \xE0 frente \u2014 sempre a esquerda \u2014, joelho travado, coxa contra\xEDda.",
      "Olhe para a frente, na altura dos olhos, queixo paralelo ao ch\xE3o.",
      "Solte todo o ar e contraia o abd\xF4men com o pulm\xE3o vazio."
    ],
    voz: "M\xE3os atr\xE1s da cabe\xE7a. Perna esquerda meio p\xE9 \xE0 frente. Olhe para a frente. Solte todo o ar e contraia.",
    confira: "queixo reto, olhar para a frente \xB7 perna esquerda meio p\xE9 \xE0 frente",
    revela: "defini\xE7\xE3o abdominal e serr\xE1til \u2014 o mais sens\xEDvel a gordura",
    erro: "baixar a cabe\xE7a para olhar o abd\xF4men, que encurta a dobra dele"
  },
  {
    id: "perfil-direito",
    n: "Perfil direito",
    bloco: "refer\xEAncia",
    giro: 90,
    bracos: "estendidos \xE0 frente",
    como: [
      "Gire 90\xB0 para a sua esquerda sobre a marca: o lado direito fica para a c\xE2mera. Os p\xE9s continuam no T.",
      "Estenda os dois bra\xE7os \xE0 frente, na altura do ombro \u2014 eles saem da frente da cintura.",
      "Olhe para a frente. Postura natural, sem empinar nem encolher a barriga."
    ],
    voz: "Bra\xE7os esticados \xE0 frente, na altura do ombro. Olhe para a frente.",
    confira: "um bra\xE7o esconde o outro \xB7 m\xE3os dentro da tela",
    revela: "espessura da cintura de perfil \u2014 onde a mudan\xE7a aparece primeiro",
    erro: "girar 60\xB0 em vez de 90\xB0 e achar que emagreceu"
  },
  {
    id: "perfil-direito-postura",
    n: "Perfil direito natural",
    bloco: "postura",
    giro: 90,
    bracos: "soltos ao lado",
    como: [
      "Mesma posi\xE7\xE3o, mas com os bra\xE7os ca\xEDdos naturalmente ao lado.",
      "Marque passo tr\xEAs vezes sem sair do T, e pare \u2014 assim voc\xEA cai na sua postura real.",
      "Olhe para um ponto fixo \xE0 frente, na altura dos olhos."
    ],
    voz: "Bra\xE7os soltos. Marque passo tr\xEAs vezes, sem sair do lugar. Olhe para a frente.",
    confira: "p\xE9s na marca \xB7 olhar para a frente, sem posar",
    revela: "alinhamento de orelha, ombro, quadril e tornozelo",
    erro: "corrigir a postura na hora e perder o dado"
  },
  {
    id: "perfil-maos-na-nuca",
    n: "Perfil m\xE3os na nuca",
    bloco: "refer\xEAncia",
    giro: 90,
    bracos: "m\xE3os na nuca",
    como: [
      "Mesmo lugar e mesma marca de p\xE9s do perfil direito, de lado para a c\xE2mera.",
      "Dedos entrela\xE7ados atr\xE1s da cabe\xE7a, s\xF3 apoiados, sem empurrar a cabe\xE7a.",
      "Cotovelos abertos para os lados, na linha das orelhas, sem apontar para a frente.",
      "Barriga relaxada, respira\xE7\xE3o normal. O tronco n\xE3o se inclina para tr\xE1s."
    ],
    voz: "Dedos atr\xE1s da cabe\xE7a, sem empurrar. Cotovelos abertos para os lados. Barriga solta.",
    confira: "cotovelos na linha das orelhas \xB7 tronco sem inclinar para tr\xE1s",
    revela: "flanco, lombar baixa, barriga e culote de perfil, sem o bra\xE7o na frente",
    erro: "cotovelos apontando para a frente, que voltam a esconder a barriga"
  },
  {
    id: "costas-relaxado",
    n: "Costas relaxado",
    bloco: "refer\xEAncia",
    giro: 180,
    bracos: "um palmo do corpo",
    como: [
      "Gire mais 90\xB0 para a esquerda. Bra\xE7os soltos, afastados um palmo do corpo, palmas para o corpo.",
      "Cabe\xE7a neutra, olhando para a frente \u2014 n\xE3o para baixo.",
      "Ombros onde eles caem sozinhos."
    ],
    voz: "Bra\xE7os soltos, um palmo do corpo. Cabe\xE7a reta.",
    confira: "bra\xE7os um palmo do corpo \xB7 cabe\xE7a reta",
    revela: "simetria das esc\xE1pulas, lombar, contorno do gl\xFAteo",
    erro: "olhar por cima do ombro e torcer o tronco"
  },
  {
    id: "costas-duplo-biceps",
    n: "Costas duplo b\xEDceps",
    bloco: "m\xFAsculo",
    giro: 180,
    bracos: "cotovelos abertos",
    como: [
      "Mesma subida de bra\xE7o do duplo b\xEDceps de frente, agora de costas: cotovelos na altura do ombro.",
      "Afaste as esc\xE1pulas como se puxasse os cotovelos para tr\xE1s e para fora.",
      "P\xE9s juntos no T, os dois apoiados no ch\xE3o."
    ],
    voz: "Cotovelos na altura do ombro. P\xE9s juntos. Abra as costas.",
    confira: "cotovelos na altura do ombro \xB7 p\xE9s juntos no T",
    revela: "espessura do dorsal, trap\xE9zio e erector",
    erro: "cotovelos em alturas diferentes"
  },
  {
    id: "costas-maos-na-cintura",
    n: "Costas m\xE3os na cintura",
    bloco: "m\xFAsculo",
    giro: 180,
    bracos: "polegares na cintura",
    como: [
      "M\xE3os s\xF3 apoiadas na cintura, com os polegares logo acima do osso do quadril.",
      "Sem beliscar a pele: o contorno da cintura fica \xE0 mostra.",
      "Empurre os cotovelos para a frente e para fora, abrindo a largura."
    ],
    voz: "M\xE3os s\xF3 apoiadas na cintura, polegares logo acima do osso do quadril. Sem beliscar a pele.",
    confira: "m\xE3os s\xF3 apoiadas, sem beliscar \xB7 cintura \xE0 mostra",
    revela: "a rela\xE7\xE3o ombro/cintura, que muda mesmo com o peso parado",
    erro: "subir as m\xE3os para as costelas e falsear a largura"
  },
  {
    id: "perfil-esquerdo",
    n: "Perfil esquerdo",
    bloco: "refer\xEAncia",
    giro: 270,
    bracos: "estendidos \xE0 frente",
    como: [
      "Complete o giro, mais 90\xB0 para a esquerda. Lado esquerdo para a c\xE2mera, mesma execu\xE7\xE3o do perfil direito.",
      "Os dois perfis existem porque o corpo \xE9 assim\xE9trico.",
      "Confira que os p\xE9s voltaram para o T antes do disparo."
    ],
    voz: "Bra\xE7os esticados \xE0 frente, na altura do ombro. Olhe para a frente.",
    confira: "um bra\xE7o esconde o outro \xB7 m\xE3os dentro da tela",
    revela: "a assimetria entre os lados, invis\xEDvel na foto de frente",
    erro: "pular esta foto por parecer repetida \u2014 ela \xE9 a que fecha o par"
  }
];
var DESDE_11_POSES = "2026-11-06";
var POSES_ATE_05_11 = [
  "frente-relaxado",
  "frente-duplo-biceps",
  "frente-abdomen-coxa",
  "perfil-direito",
  "perfil-direito-postura",
  "costas-relaxado",
  "costas-duplo-biceps",
  "costas-maos-na-cintura",
  "perfil-esquerdo"
];
var POR_ID = {};
PROTOCOLO.forEach(function(p) {
  POR_ID[p.id] = p;
});
function poses(ordem) {
  if (!Array.isArray(ordem) || !ordem.length) return PROTOCOLO.slice();
  const r = [];
  ordem.forEach(function(id) {
    const p = POR_ID[id];
    if (p) r.push(p);
  });
  return r.length ? r : PROTOCOLO.slice();
}
function posesDaData(d, ordem) {
  const lista2 = poses(ordem);
  if (!d || String(d) >= DESDE_11_POSES) return lista2;
  return lista2.filter(function(p) {
    return POSES_ATE_05_11.indexOf(p.id) >= 0;
  });
}
function dataLocal(t) {
  const d = new Date(t);
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}
function instanteDaData(d) {
  const p = String(d).split("-");
  return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]), 12, 0, 0, 0).getTime();
}
function mediaDaSemana(marcas, d) {
  const semana = weekStart(instanteDaData(d));
  const nela = (Array.isArray(marcas) ? marcas : []).filter(function(x) {
    return weekStart(x.t) === semana;
  });
  if (!nela.length) return null;
  return nela.reduce(function(a, x) {
    return a + x.v;
  }, 0) / nela.length;
}

// src/dominio/frequencia.ts
var chaveDeFalta = (data) => "falta:" + data;
var chaveDeDescanso = (data) => "descanso:" + data;
function dataValida(d) {
  return /^\d{4}-\d{2}-\d{2}$/.test(d) && dataLocal(instanteDaData(d)) === d;
}
function apaga(mortos, chave, em) {
  mortos[chave] = Math.max(mortos[chave] || 0, em);
}
function conteudo(f) {
  return JSON.stringify(f, (_, v) => v && typeof v === "object" && !Array.isArray(v) ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, v[k]])) : v);
}
function prefereFalta(f, outra) {
  if (f.m !== outra.m) return f.m > outra.m;
  const motivo = f.motivo || "", anterior = outra.motivo || "";
  if (motivo !== anterior) return motivo > anterior;
  const a = conteudo(f), b = conteudo(outra);
  return a.length !== b.length ? a.length > b.length : a > b;
}
function uneFrequencia(a, b, mortos) {
  const descanso = {}, falta = {};
  for (const lado of [a, b]) {
    for (const [d, em] of Object.entries(lado.descanso || {})) {
      if (Number.isFinite(em) && em > (mortos[chaveDeDescanso(d)] || 0) && em > (descanso[d] || 0)) descanso[d] = em;
    }
    for (const [d, f] of Object.entries(lado.falta || {})) {
      if (!dataValida(d) || !Number.isFinite(f?.m) || f.m <= (mortos[chaveDeFalta(d)] || 0)) continue;
      const outra = falta[d];
      if (!outra || prefereFalta(f, outra)) falta[d] = JSON.parse(JSON.stringify(f));
    }
  }
  for (const [d, f] of Object.entries(falta)) {
    if (!descanso[d]) continue;
    if (descanso[d] >= f.m) {
      apaga(mortos, chaveDeFalta(d), descanso[d]);
      delete falta[d];
    } else {
      apaga(mortos, chaveDeDescanso(d), f.m);
      delete descanso[d];
    }
  }
  return { descanso, falta };
}

// src/dominio/catalogo-semente.ts
var NOVOS_DA_V22 = [
  { n: "Puxada alta pegada neutra", g: "dorsal", car: "pino", c: 1, alt: ["Neutral grip lat pulldown"], equiv: ["puxada-neutra-no-cabo", "puxada-neutra-na-maquina"] },
  { n: "Puxada alta pegada aberta", g: "dorsal", car: "pino", c: 1, alt: ["Wide grip lat pulldown", "Puxada aberta"], equiv: ["pulldown-convergente"] },
  { n: "Alongamento do flexor do quadril ajoelhado", g: "mobilidade", car: "corpo", u: "seg", uni: 1, alt: ["Half-kneeling hip flexor stretch"] },
  { n: "Mobilidade de quadril 90/90", g: "mobilidade", car: "corpo", uni: 1, mov: "mobilidade", alt: ["90/90 hip mobility"] },
  { n: "Stiff com halteres", g: "posterior", car: "halter", c: 1, alt: ["Dumbbell stiff-leg deadlift"], equiv: ["terra-romeno-com-halteres"] },
  { n: "Afundo reverso com halteres", g: "gl\xFAteo", car: "halter", c: 1, uni: 1, mov: "agachamento", mus: [["gl\xFAteo", 1], ["quadr\xEDceps", 0.5]], alt: ["Dumbbell reverse lunge"] },
  { n: "Pallof press", g: "core", car: "pino", uni: 1, alt: ["Pallof"] },
  { n: "Agachamento goblet", g: "quadr\xEDceps", car: "halter1", c: 1, alt: ["Goblet squat"] },
  { n: "Agachamento b\xFAlgaro com halteres", g: "quadr\xEDceps", car: "halter", c: 1, uni: 1, alt: ["Bulgarian split squat"] },
  { n: "Dead bug", g: "core", car: "corpo" },
  { n: "Tr\xEDceps acima da cabe\xE7a na polia sentado", g: "tr\xEDceps", car: "pino", alt: ["Seated overhead cable triceps extension"], equiv: ["extensao-de-triceps-acima-da-cabeca-no-cabo"] },
  { n: "Eleva\xE7\xE3o lateral na polia inclinado para fora", g: "deltoide lateral", car: "pino", uni: 1, alt: ["Lean-away cable lateral raise"], equiv: ["elevacao-lateral-unilateral-no-cabo"] }
];
var NOVOS_DO_SISTEMA = [
  { n: "Barra fixa", g: "dorsal", car: "corpo", c: 1, mov: "puxada", eq: "corpo", mus: [["dorsal", 1], ["b\xEDceps", 0.5]], alt: ["Pull-up", "Barra fixa pronada", "Barra fixa livre"], equiv: ["barra-fixa-assistida-pegada-neutra", "pulldown-convergente", "puxada-alta-pegada-neutra"] },
  // 25/11/2026, com a mídia (Fase D): três do v3.0 que o catálogo não tinha
  { n: "Prancha lateral", g: "abd\xF4men", car: "corpo", mov: "core", eq: "corpo", uni: 1, mus: [["abd\xF4men", 1]], alt: ["Side plank"], equiv: ["prancha", "pallof-press", "dead-bug"] },
  { n: "Encolhimento Kelso apoiado", g: "trap\xE9zio", car: "halter", mov: "encolhimento", eq: "halteres", mus: [["trap\xE9zio", 1], ["costas espessura", 0.5]], alt: ["Kelso shrug", "Encolhimento Kelso"], equiv: ["encolhimento-com-halteres", "encolhimento-na-maquina", "encolhimento-no-smith"] },
  { n: "Remada cavalinho apoiada pegada aberta", g: "costas espessura", car: "lado", c: 1, mov: "remada", eq: "maquina-anilha", mus: [["costas espessura", 1], ["delt posterior", 0.5], ["b\xEDceps", 0.25]], alt: ["Chest supported T-bar row wide grip", "Remada T apoiada pegada aberta"], equiv: ["remada-convergente-com-apoio-de-peito", "high-row-com-apoio-de-peito", "remada-na-maquina-com-apoio-de-peito"] }
];
var ALT_NOMES = {
  "panturrilha-sentada": ["Panturrilha sentado", "Seated calf raise"],
  "panturrilha-em-pe": ["Standing calf raise"],
  "abdutora": ["Abdu\xE7\xE3o de quadril na m\xE1quina", "Cadeira abdutora", "Hip abduction machine"],
  "adutora": ["Cadeira adutora", "Adu\xE7\xE3o de quadril na m\xE1quina", "Hip adduction machine"],
  "rosca-bayesian-no-cabo": ["Rosca bayesiana na polia", "Rosca bayesiana no cabo", "Bayesian curl"],
  "reverse-pec-deck": ["Crucifixo inverso no peck deck", "Peck deck inverso", "Crucifixo inverso na m\xE1quina"],
  "elevacao-pelvica-na-maquina": ["Hip thrust na m\xE1quina", "Machine hip thrust"],
  "elevacao-pelvica-com-barra": ["Hip thrust com barra", "Barbell hip thrust"],
  "cadeira-flexora-sentada": ["Mesa flexora sentada", "Flexora sentada", "Seated leg curl"],
  "mesa-flexora-deitada": ["Flexora deitada", "Lying leg curl"],
  "cadeira-extensora": ["Extensora", "Leg extension"],
  "pushdown": ["Tricep pushdown"],
  "triceps-barra-reta-na-polia": ["Tr\xEDceps na polia com barra reta", "Straight bar pushdown"],
  "triceps-corda-na-polia": ["Tr\xEDceps corda", "Rope pushdown"],
  "pec-deck": ["Peck deck", "Voador", "Pec fly machine"],
  "remada-cavalinho": ["T-bar row"],
  "terra-romeno-com-barra": ["Romanian deadlift", "RDL"],
  "straight-arm-pulldown": ["Pulldown com bra\xE7os estendidos"],
  "face-pull-na-polia-alta": ["Face pull"],
  "encolhimento-com-halteres": ["Dumbbell shrug"],
  "elevacao-lateral-com-halteres": ["Dumbbell lateral raise"],
  "elevacao-lateral-unilateral-no-cabo": ["Eleva\xE7\xE3o lateral unilateral na polia", "Single-arm cable lateral raise"],
  "pullover-na-polia-alta": ["Pullover na polia", "Cable pullover"],
  "crucifixo-inverso-no-cabo": ["Crucifixo inverso na polia", "Cable reverse fly"],
  "crossover-de-baixo-para-cima": ["Crucifixo na polia baixa para alta", "Low to high cable fly"],
  "leg-press-45": ["Leg press 45 graus"],
  // 25/11/2026 (Fase D): os nomes do v3.0 que são o mesmo exercício do catálogo
  "rosca-martelo": ["Rosca martelo com halteres", "Hammer curl"],
  "pullover-em-maquina": ["Pullover na m\xE1quina", "Machine pullover"],
  "elevacao-lateral-no-cabo": ["Eleva\xE7\xE3o lateral na polia bilateral", "Eleva\xE7\xE3o lateral bilateral na polia"],
  "chest-press-horizontal-convergente": ["Supino convergente", "Supino reto convergente"],
  "remada-na-maquina-com-apoio-de-peito": ["Remada apoiada no peito"]
};

// src/dominio/catalogo-curadoria.ts
var CURADORIA = {
  "abdominal-na-polia-alta-ajoelhado": { equiv: ["crunch-no-cabo-ou-maquina", "maquina-de-abdominal", "crunch-com-anilha-no-colo"] },
  "abducao-deitado-com-caneleira": { equiv: ["abdutora", "abdutora-em-pe-na-polia", "passada-lateral-com-elastico"] },
  "abdutora-em-pe-na-polia": { equiv: ["abdutora", "abducao-deitado-com-caneleira", "passada-lateral-com-elastico"] },
  "adutora-em-pe-na-polia": { equiv: ["adutora", "agachamento-sumo-no-smith", "leg-press-com-pe-afastado"] },
  "afundo-reverso-com-halteres": { alt: ["Dumbbell reverse lunge", "Passada reversa com halteres", "Afundo para tr\xE1s com halteres"], cue: "Passo para tr\xE1s longo, com o tronco levemente \xE0 frente. Sobe empurrando o calcanhar da perna da frente.", equiv: ["agachamento-bulgaro-com-halteres", "lunge", "lunges-com-sandbag"], conferido: 1 },
  "agachamento-bulgaro-com-halteres": { alt: ["Bulgarian split squat", "Dumbbell Bulgarian split squat", "B\xFAlgaro com halteres", "Afundo b\xFAlgaro com halteres"], cue: "P\xE9 da frente longe o bastante para descer sem o calcanhar sair do ch\xE3o. A perna de tr\xE1s s\xF3 apoia: quem trabalha \xE9 a da frente.", equiv: ["afundo-reverso-com-halteres", "lunge", "agachamento-goblet"], conferido: 1 },
  "agachamento-goblet": { alt: ["Goblet squat", "Agachamento ta\xE7a", "Dumbbell goblet squat"], cue: "Halter colado no peito e cotovelo por dentro dos joelhos no fundo. Tronco alto, sem o calcanhar sair do ch\xE3o.", equiv: ["agachamento-no-smith", "agachamento-hack", "leg-press"], conferido: 1 },
  "agachamento-hack": { equiv: ["pendulum-squat", "agachamento-no-smith", "belt-squat"] },
  "agachamento-sumo-no-smith": { mus: [["adutores", 1], ["gl\xFAteo", 0.5], ["quadr\xEDceps", 0.5]], alt: ["Sumo squat no Smith", "Smith machine sumo squat"], equiv: ["leg-press-com-pe-afastado", "adutora", "adutora-em-pe-na-polia"], conferido: 1 },
  "air-squat": { cue: "Peso no p\xE9 inteiro e joelho na dire\xE7\xE3o da ponta do p\xE9. Desce at\xE9 o quadril passar do joelho sem arredondar a lombar.", equiv: ["agachamento-goblet", "wall-balls", "lunge"] },
  "alongamento-do-flexor-do-quadril-ajoelhado": { alt: ["Half-kneeling hip flexor stretch", "Kneeling hip flexor stretch", "Alongamento do psoas ajoelhado"], cue: "Contraia o gl\xFAteo da perna de tr\xE1s e encaixe a pelve antes de levar o quadril \xE0 frente. Se a lombar arquear, ela rouba o alongamento.", conferido: 1 },
  "assault-bike": { equiv: ["bike-erg", "remo-ergometro", "ski-erg"] },
  "barra-fixa-assistida-pegada-neutra": { equiv: ["puxada-alta-pegada-neutra", "puxada-neutra-na-maquina", "pulldown-convergente"] },
  "belt-squat": { equiv: ["agachamento-hack", "pendulum-squat", "leg-press"] },
  "bike-erg": { equiv: ["assault-bike", "remo-ergometro", "corrida"] },
  "box-jump": { equiv: ["burpee-broad-jump", "air-squat"] },
  "burpee": { equiv: ["burpee-broad-jump", "mountain-climber", "devil-press"] },
  "burpee-broad-jump": { equiv: ["burpee", "box-jump", "devil-press"] },
  "cadeira-flexora-sentada-de-outro-modelo": { equiv: ["cadeira-flexora-sentada", "flexora-unilateral-em-pe", "mesa-flexora-deitada"] },
  "clean-and-jerk": { cue: "Barra rente ao corpo na puxada e no encaixe: ela sobe reta, n\xE3o em arco. Encaixe com o cotovelo alto antes de empurrar para cima.", equiv: ["push-press", "snatch-com-halter", "thruster"] },
  "coice-na-maquina": { equiv: ["elevacao-pelvica-na-maquina", "hip-thrust-no-smith", "elevacao-pelvica-com-barra"] },
  "corrida": { equiv: ["remo-ergometro", "assault-bike", "bike-erg"] },
  "crossover-na-polia-baixa": { equiv: ["crossover-de-baixo-para-cima", "crucifixo-inclinado-no-cabo", "peck-deck-com-banco-inclinado"] },
  "crossover-na-polia-media": { equiv: ["pec-deck", "crucifixo-com-halteres", "peck-deck-unilateral"] },
  "crucifixo-com-halteres": { equiv: ["crossover-na-polia-media", "pec-deck", "peck-deck-unilateral"] },
  "crucifixo-inclinado-com-halteres": { equiv: ["crucifixo-inclinado-no-cabo", "peck-deck-com-banco-inclinado", "crossover-de-baixo-para-cima"] },
  "crucifixo-inverso-com-halteres": { equiv: ["crucifixo-inverso-com-halteres-no-banco-inclinado", "reverse-fly-no-cabo", "reverse-pec-deck"] },
  "crucifixo-inverso-com-halteres-no-banco-inclinado": { equiv: ["crucifixo-inverso-com-halteres", "reverse-pec-deck", "crucifixo-inverso-no-cabo"] },
  "crunch-com-anilha-no-colo": { equiv: ["crunch-no-cabo-ou-maquina", "maquina-de-abdominal", "sit-up"] },
  "dead-bug": { alt: ["Inseto morto"], cue: "Lombar colada no ch\xE3o do come\xE7o ao fim. Se ela descolar, encurte a amplitude de bra\xE7o e perna.", equiv: ["pallof-press", "prancha", "ab-wheel"], conferido: 1 },
  "devil-press": { equiv: ["burpee", "snatch-com-halter", "thruster"] },
  "double-under": { equiv: ["pula-corda", "mountain-climber"] },
  "elevacao-de-pernas-no-banco": { equiv: ["elevacao-de-pernas-ou-reverse-crunch", "reverse-crunch-no-banco-declinado", "elevacao-de-pernas-suspenso"] },
  "elevacao-de-pernas-suspenso": { equiv: ["elevacao-de-pernas-ou-reverse-crunch", "elevacao-de-pernas-no-banco", "reverse-crunch-no-banco-declinado"] },
  "elevacao-frontal-bilateral-no-cabo": { equiv: ["elevacao-frontal-unilateral-no-cabo", "elevacao-frontal-na-maquina", "elevacao-frontal-com-halteres"] },
  "elevacao-frontal-com-halteres": { equiv: ["elevacao-frontal-bilateral-no-cabo", "elevacao-frontal-unilateral-no-cabo", "elevacao-frontal-na-maquina"] },
  "elevacao-frontal-na-maquina": { equiv: ["elevacao-frontal-unilateral-no-cabo", "elevacao-frontal-bilateral-no-cabo", "elevacao-frontal-com-halteres"] },
  "elevacao-lateral-com-halteres": { equiv: ["elevacao-lateral-no-cabo", "elevacao-lateral-na-maquina", "elevacao-lateral-unilateral-no-cabo"] },
  "elevacao-lateral-deitado-no-banco-inclinado": { equiv: ["elevacao-lateral-na-polia-inclinado-para-fora", "elevacao-lateral-unilateral-no-cabo", "elevacao-lateral-com-halteres"] },
  "elevacao-lateral-na-polia-inclinado-para-fora": { alt: ["Lean-away cable lateral raise", "Lean-away lateral raise", "Eleva\xE7\xE3o lateral inclinada na polia"], cue: "Corpo inclinado e firme no apoio, sem balan\xE7ar para subir. O cotovelo lidera at\xE9 a altura do ombro.", conferido: 1 },
  "elevacao-lateral-no-smith-unilateral": { equiv: ["elevacao-lateral-na-maquina", "elevacao-lateral-unilateral-no-cabo", "elevacao-lateral-com-halteres"] },
  "elevacao-pelvica-com-barra": { equiv: ["hip-thrust-no-smith", "elevacao-pelvica-na-maquina", "coice-na-maquina"] },
  "encolhimento-com-halteres": { equiv: ["encolhimento-na-maquina", "encolhimento-no-smith", "encolhimento-na-polia-baixa"] },
  "encolhimento-na-polia-baixa": { equiv: ["encolhimento-na-maquina", "encolhimento-com-halteres", "encolhimento-no-smith"] },
  "encolhimento-no-smith": { equiv: ["encolhimento-na-maquina", "encolhimento-com-halteres", "encolhimento-na-polia-baixa"] },
  "extensao-unilateral-acima-da-cabeca": { equiv: ["triceps-frances-com-halter", "extensao-de-triceps-acima-da-cabeca-no-cabo", "triceps-acima-da-cabeca-na-polia-sentado"] },
  "extensora-unilateral": { equiv: ["cadeira-extensora", "sissy-squat-na-maquina", "leg-press-com-pe-baixo"] },
  "face-pull-na-polia-alta": { mus: [["delt posterior", 1], ["costas espessura", 0.25]], alt: ["Face pull", "Face pull na polia"], equiv: ["remada-alta-com-corda", "remada-para-deltoide-posterior-com-apoio-de-peito", "reverse-fly-no-cabo"], conferido: 1 },
  "farmers-carry": { equiv: ["sled-pull", "lunges-com-sandbag"] },
  "flexao-de-tornozelo-na-polia-baixa": { equiv: ["tibial-anterior", "tibial-na-maquina", "tibial-com-anilha-sentado"] },
  "flexora-nordica-assistida": { equiv: ["mesa-flexora-deitada", "cadeira-flexora-sentada", "flexora-unilateral-deitada"] },
  "flexora-unilateral-deitada": { equiv: ["mesa-flexora-deitada", "flexora-unilateral-em-pe", "cadeira-flexora-sentada"] },
  "flexora-unilateral-em-pe": { equiv: ["cadeira-flexora-sentada", "mesa-flexora-deitada", "flexora-unilateral-deitada"] },
  "good-morning-no-smith": { equiv: ["terra-romeno-no-smith", "terra-romeno-com-barra", "stiff-com-halteres"] },
  "hip-thrust-no-smith": { equiv: ["elevacao-pelvica-na-maquina", "elevacao-pelvica-com-barra", "coice-na-maquina"] },
  "kettlebell-swing": { equiv: ["snatch-com-halter", "stiff-com-halteres"] },
  "leg-press-45": { equiv: ["leg-press", "leg-press-horizontal", "leg-press-vertical"] },
  "leg-press-com-pe-afastado": { equiv: ["agachamento-sumo-no-smith", "adutora", "adutora-em-pe-na-polia"] },
  "leg-press-com-pe-baixo": { equiv: ["leg-press", "agachamento-hack", "pendulum-squat"] },
  "leg-press-horizontal": { equiv: ["leg-press", "leg-press-45", "leg-press-vertical"] },
  "leg-press-vertical": { equiv: ["leg-press-45", "leg-press", "leg-press-horizontal"] },
  "lunge": { equiv: ["lunges-com-sandbag", "afundo-reverso-com-halteres", "agachamento-bulgaro-com-halteres"] },
  "lunges-com-sandbag": { equiv: ["lunge", "afundo-reverso-com-halteres", "agachamento-bulgaro-com-halteres"] },
  "maquina-de-abdominal": { equiv: ["crunch-no-cabo-ou-maquina", "abdominal-na-polia-alta-ajoelhado", "crunch-com-anilha-no-colo"] },
  "maquina-de-supino-inclinado": { equiv: ["chest-press-inclinado-convergente", "supino-inclinado-no-smith", "supino-inclinado-com-halteres"] },
  "maquina-de-triceps-sentado": { equiv: ["extensao-acima-da-cabeca-ou-maquina-de-triceps", "pushdown", "triceps-testa-com-barra-w"] },
  "mergulho-na-maquina-assistida": { mus: [["tr\xEDceps", 1], ["peito", 0.5], ["delt anterior", 0.5]], alt: ["Paralelas assistidas", "Assisted dip", "Assisted dip machine"], equiv: ["maquina-de-triceps-sentado", "pushdown", "triceps-barra-reta-na-polia"], conferido: 1 },
  "mobilidade-de-quadril-90-90": { alt: ["90/90 hip mobility", "90/90 hip stretch", "Hip 90/90"], cue: "Tronco alto: a rota\xE7\xE3o vem do quadril, n\xE3o da coluna. Troque de lado sem apoiar as m\xE3os quando conseguir.", conferido: 1 },
  "mountain-climber": { cue: "Quadril na linha do ombro, sem empinar. O joelho vem at\xE9 o peito em ritmo constante.", equiv: ["burpee", "pula-corda", "prancha"] },
  "pallof-press": { alt: ["Pallof", "Cable Pallof press", "Pallof press na polia", "Antirrota\xE7\xE3o na polia"], cue: "O bra\xE7o estende e volta sem o tronco girar para o lado do cabo. Quadril e costelas travados: o trabalho \xE9 resistir.", equiv: ["dead-bug", "prancha", "prancha-com-peso"], conferido: 1 },
  "panturrilha-em-pe-na-maquina": { equiv: ["panturrilha-em-pe", "panturrilha-na-maquina-em-pe", "panturrilha-no-leg-press"] },
  "panturrilha-na-maquina-em-pe": { equiv: ["panturrilha-em-pe", "panturrilha-em-pe-na-maquina", "panturrilha-no-smith"] },
  "panturrilha-no-hack": { equiv: ["panturrilha-em-pe", "panturrilha-no-smith", "panturrilha-no-leg-press"] },
  "panturrilha-no-leg-press-com-joelho-flexionado": { equiv: ["panturrilha-sentada", "panturrilha-sentada-na-maquina", "panturrilha-sentada-no-smith"] },
  "panturrilha-no-smith": { equiv: ["panturrilha-em-pe", "panturrilha-na-maquina-em-pe", "panturrilha-no-hack"] },
  "panturrilha-sentada-na-maquina": { equiv: ["panturrilha-sentada", "panturrilha-sentada-no-smith", "panturrilha-no-leg-press-com-joelho-flexionado"] },
  "panturrilha-sentada-no-smith": { equiv: ["panturrilha-sentada", "panturrilha-sentada-na-maquina", "panturrilha-no-leg-press-com-joelho-flexionado"] },
  "panturrilha-unilateral-com-halter": { equiv: ["panturrilha-em-pe", "panturrilha-no-smith", "panturrilha-no-leg-press"] },
  "passada-lateral-com-elastico": { equiv: ["abdutora", "abdutora-em-pe-na-polia", "abducao-deitado-com-caneleira"] },
  "peck-deck-com-banco-inclinado": { equiv: ["crucifixo-inclinado-no-cabo", "crossover-de-baixo-para-cima", "crucifixo-inclinado-com-halteres"] },
  "peck-deck-unilateral": { equiv: ["pec-deck", "crossover-na-polia-media", "crucifixo-com-halteres"] },
  "prancha": { equiv: ["prancha-com-peso", "dead-bug", "ab-wheel"] },
  "prancha-com-peso": { equiv: ["prancha", "ab-wheel", "pallof-press"] },
  "pula-corda": { cue: "Salto baixo, na ponta do p\xE9. O giro vem do punho, com o cotovelo junto ao corpo.", equiv: ["double-under", "mountain-climber", "burpee"] },
  "pullover-com-halter-no-banco": { mus: [["dorsal", 1], ["peito", 0.25]], alt: ["Dumbbell pullover", "Pullover com halter"], equiv: ["pullover-em-maquina", "pullover-em-maquina-ou-cabo", "pullover-na-polia-alta"], conferido: 1 },
  "pullover-em-maquina": { equiv: ["pullover-em-maquina-ou-cabo", "pullover-na-polia-alta", "straight-arm-pulldown"] },
  "pullover-na-polia-alta": { equiv: ["straight-arm-pulldown", "pullover-em-maquina-ou-cabo", "pullover-em-maquina"] },
  "push-press": { cue: "O impulso vem de um meio agachamento curto e r\xE1pido, com o calcanhar no ch\xE3o. A barra sai junto com a extens\xE3o do joelho, sem pausa entre os dois.", equiv: ["thruster", "clean-and-jerk", "devil-press"] },
  "pushdown-unilateral": { equiv: ["extensao-unilateral-de-triceps-no-cabo", "triceps-corda-na-polia", "pushdown"] },
  "puxada-alta-pegada-aberta": { alt: ["Wide grip lat pulldown", "Puxada aberta", "Wide grip pulldown", "Puxada frontal aberta", "Puxada frontal pegada aberta"], cue: "Barra at\xE9 o peito alto com o cotovelo apontando para baixo. Inclina\xE7\xE3o pequena e fixa, sem balan\xE7o.", conferido: 1 },
  "puxada-alta-pegada-neutra": { alt: ["Neutral grip lat pulldown", "Neutral grip pulldown", "Puxada frontal pegada neutra"], cue: "Peito alto e cotovelo descendo junto ao corpo. Sem jogar o tronco para tr\xE1s para completar a repeti\xE7\xE3o.", conferido: 1 },
  "puxada-neutra-na-maquina": { equiv: ["puxada-alta-pegada-neutra", "pulldown-convergente", "puxada-neutra-no-cabo"] },
  "puxada-neutra-no-cabo": { equiv: ["puxada-alta-pegada-neutra", "puxada-neutra-na-maquina", "pulldown-convergente"] },
  "puxada-neutra-unilateral": { equiv: ["pulldown-unilateral", "puxada-unilateral-na-polia-alta", "remada-unilateral-na-polia-alta-ajoelhado"] },
  "puxada-unilateral-na-polia-alta": { equiv: ["pulldown-unilateral", "puxada-neutra-unilateral", "remada-unilateral-na-polia-alta-ajoelhado"] },
  "remada-aberta-na-maquina": { mus: [["delt posterior", 1], ["costas espessura", 0.5], ["b\xEDceps", 0.25]], equiv: ["remada-para-deltoide-posterior-com-apoio-de-peito", "remada-alta-com-corda", "face-pull-na-polia-alta"], conferido: 1 },
  "remada-alta-com-corda": { mus: [["delt posterior", 1], ["trap\xE9zio", 0.5], ["costas espessura", 0.25]], equiv: ["face-pull-na-polia-alta", "remada-para-deltoide-posterior-com-apoio-de-peito", "remada-aberta-na-maquina"], conferido: 1 },
  "remada-alta-na-maquina": { equiv: ["high-row-com-apoio-de-peito", "remada-na-polia-alta-sentado", "remada-cavalinho-pegada-larga"] },
  "remada-baixa-na-polia-com-triangulo": { equiv: ["remada-sentada-pegada-neutra-fechada", "remada-para-dorsal-com-apoio-de-peito", "remada-unilateral-apoiada"] },
  "remada-baixa-pegada-pronada": { equiv: ["remada-na-maquina-pegada-larga", "remada-horizontal-na-maquina", "remada-sentada-na-polia"] },
  "remada-cavalinho": { equiv: ["remada-convergente-com-apoio-de-peito", "remada-na-maquina-com-apoio-de-peito", "remada-curvada-com-barra"] },
  "remada-cavalinho-pegada-larga": { equiv: ["high-row-com-apoio-de-peito", "remada-na-maquina-pegada-larga", "remada-alta-na-maquina"] },
  "remada-curvada-com-barra": { equiv: ["remada-cavalinho", "remada-convergente-com-apoio-de-peito", "remada-sentada-na-polia"] },
  "remada-na-maquina-com-apoio-de-peito": { equiv: ["remada-convergente-com-apoio-de-peito", "remada-horizontal-na-maquina", "remada-cavalinho"] },
  "remada-na-maquina-pegada-larga": { equiv: ["remada-baixa-pegada-pronada", "high-row-com-apoio-de-peito", "remada-horizontal-na-maquina"] },
  "remada-na-polia-alta-sentado": { equiv: ["high-row-com-apoio-de-peito", "remada-alta-na-maquina", "remada-cavalinho-pegada-larga"] },
  "remada-para-deltoide-posterior-com-apoio-de-peito": { mus: [["delt posterior", 1], ["costas espessura", 0.5], ["b\xEDceps", 0.25]], alt: ["Chest supported rear delt row", "Rear delt row"], conferido: 1 },
  "remada-sentada-na-polia": { equiv: ["remada-horizontal-na-maquina", "remada-baixa-pegada-pronada", "remada-na-maquina-com-apoio-de-peito"] },
  "remada-sentada-pegada-neutra-fechada": { equiv: ["remada-baixa-na-polia-com-triangulo", "remada-para-dorsal-com-apoio-de-peito", "remada-unilateral-apoiada"] },
  "remada-unilateral-apoiada": { equiv: ["remada-para-dorsal-com-apoio-de-peito", "remada-baixa-na-polia-com-triangulo", "remada-sentada-pegada-neutra-fechada"] },
  "remada-unilateral-na-polia-alta-ajoelhado": { equiv: ["puxada-unilateral-na-polia-alta", "pulldown-unilateral", "remada-unilateral-apoiada"] },
  "remo-ergometro": { equiv: ["ski-erg", "assault-bike", "bike-erg"] },
  "reverse-crunch-no-banco-declinado": { equiv: ["elevacao-de-pernas-ou-reverse-crunch", "elevacao-de-pernas-no-banco", "elevacao-de-pernas-suspenso"] },
  "rollout-na-barra": { equiv: ["ab-wheel", "prancha-com-peso", "dead-bug"] },
  "rosca-alternada-com-halteres": { equiv: ["rosca-direta-na-barra-w", "rosca-no-cabo", "rosca-inclinada-com-halteres"] },
  "rosca-concentrada": { equiv: ["rosca-scott-na-maquina", "rosca-scott-no-cabo", "rosca-alternada-com-halteres"] },
  "rosca-direta-na-barra-w": { equiv: ["rosca-no-cabo", "rosca-alternada-com-halteres", "rosca-scott-com-barra-w"] },
  "rosca-inclinada-com-halteres": { equiv: ["rosca-bayesian-no-cabo", "rosca-alternada-com-halteres", "rosca-no-cabo"] },
  "rosca-inversa-na-barra-w": { equiv: ["rosca-martelo", "rosca-martelo-na-corda", "rosca-martelo-cruzada"] },
  "rosca-martelo-cruzada": { equiv: ["rosca-martelo", "rosca-martelo-na-corda", "rosca-inversa-na-barra-w"] },
  "rosca-martelo-na-corda": { equiv: ["rosca-martelo", "rosca-martelo-cruzada", "rosca-inversa-na-barra-w"] },
  "rosca-scott-com-barra-w": { equiv: ["rosca-scott-na-maquina", "rosca-scott-no-cabo", "rosca-direta-na-barra-w"] },
  "rosca-scott-no-cabo": { equiv: ["rosca-scott-na-maquina", "rosca-scott-com-barra-w", "rosca-concentrada"] },
  "sissy-squat-na-maquina": { equiv: ["cadeira-extensora", "extensora-unilateral", "leg-press-com-pe-baixo"] },
  "sit-up": { cue: "Sobe enrolando o tronco, sem puxar o pesco\xE7o com a m\xE3o. Desce com controle at\xE9 as costas tocarem o ch\xE3o.", equiv: ["crunch-com-anilha-no-colo", "maquina-de-abdominal", "crunch-no-cabo-ou-maquina"] },
  "ski-erg": { equiv: ["remo-ergometro", "assault-bike", "bike-erg"] },
  "sled-pull": { equiv: ["sled-push", "remo-ergometro", "ski-erg"] },
  "sled-push": { equiv: ["sled-pull", "lunges-com-sandbag", "assault-bike"] },
  "snatch-com-halter": { equiv: ["kettlebell-swing", "devil-press", "clean-and-jerk"] },
  "stiff-com-halteres": { alt: ["Dumbbell stiff-leg deadlift", "Stiff com halter", "Dumbbell stiff-legged deadlift"], cue: "Joelho quase estendido e fixo, halteres descendo rente \xE0 coxa. Desce s\xF3 at\xE9 onde a coluna fica neutra.", conferido: 1 },
  "supino-inclinado-com-barra": { equiv: ["supino-inclinado-no-smith", "supino-inclinado-com-halteres", "maquina-de-supino-inclinado"] },
  "supino-inclinado-com-halteres": { equiv: ["supino-inclinado-com-barra", "supino-inclinado-no-smith", "chest-press-inclinado-convergente"] },
  "supino-no-smith": { equiv: ["supino-reto-na-maquina", "chest-press-horizontal-convergente", "supino-reto-com-halteres"] },
  "supino-reto-com-halteres": { equiv: ["supino-reto-na-maquina", "supino-no-smith", "chest-press-horizontal-convergente"] },
  "supino-reto-na-maquina": { equiv: ["chest-press-horizontal-convergente", "supino-no-smith", "supino-reto-com-halteres"] },
  "terra-romeno-com-barra": { equiv: ["terra-romeno-no-smith", "terra-romeno-com-halteres", "stiff-com-halteres"] },
  "terra-romeno-com-halteres": { equiv: ["stiff-com-halteres", "terra-romeno-no-smith", "terra-romeno-com-barra"] },
  "thruster": { equiv: ["wall-balls", "push-press", "devil-press"] },
  "tibial-com-anilha-sentado": { equiv: ["tibial-anterior", "tibial-na-maquina", "flexao-de-tornozelo-na-polia-baixa"] },
  "tibial-na-maquina": { equiv: ["tibial-anterior", "flexao-de-tornozelo-na-polia-baixa", "tibial-com-anilha-sentado"] },
  "triceps-acima-da-cabeca-na-polia-sentado": { alt: ["Seated overhead cable triceps extension", "Tr\xEDceps franc\xEAs na polia sentado", "Extens\xE3o de tr\xEDceps acima da cabe\xE7a na polia sentado"], cue: "Cotovelo apontado para a frente e parado; s\xF3 o antebra\xE7o se move. Desce at\xE9 alongar bem atr\xE1s da cabe\xE7a.", conferido: 1 },
  "triceps-barra-reta-na-polia": { equiv: ["pushdown", "triceps-corda-na-polia", "maquina-de-triceps-sentado"] },
  "triceps-coice-com-halter": { equiv: ["extensao-unilateral-de-triceps-no-cabo", "pushdown-unilateral", "triceps-corda-na-polia"] },
  "triceps-corda-na-polia": { equiv: ["pushdown", "triceps-barra-reta-na-polia", "pushdown-unilateral"] },
  "triceps-frances-com-halter": { equiv: ["extensao-unilateral-acima-da-cabeca", "extensao-de-triceps-acima-da-cabeca-no-cabo", "triceps-testa-com-barra-w"] },
  "triceps-testa-com-barra-w": { equiv: ["triceps-frances-com-halter", "extensao-de-triceps-acima-da-cabeca-no-cabo", "extensao-acima-da-cabeca-ou-maquina-de-triceps"] },
  "wall-balls": { equiv: ["thruster", "agachamento-goblet", "air-squat"] }
};

// src/dominio/catalogo-midia.ts
var MIDIA = {
  "supino-inclinado-no-smith": { video: { yt: "WP1VLAt8hbM", inicio: 82, fim: 113, canal: "Leandro Twin", idioma: "pt" } },
  "barra-fixa": { video: { yt: "thg6cGXSlvY", inicio: 19, fim: 81, canal: "Leandro Twin", idioma: "pt" } },
  "remada-na-maquina-com-apoio-de-peito": { video: { yt: "QyvIEdEHzHc", inicio: 70, fim: 97, canal: "Leandro Twin", idioma: "pt" } },
  "chest-press-horizontal-convergente": { video: { yt: "bKSvckCwvh4", inicio: 32, fim: 86, canal: "La\xE9rcio Refundini - Aulas", idioma: "pt" } },
  "elevacao-lateral-na-maquina": { video: { yt: "IwWvZ0rlNXs", inicio: 122, fim: 165, canal: "Leandro Twin", idioma: "pt" } },
  "reverse-pec-deck": { video: { yt: "wjlX-5DTjBQ", inicio: 14, fim: 52, canal: "La\xE9rcio Refundini - Aulas", idioma: "pt" } },
  "alongamento-do-flexor-do-quadril-ajoelhado": { video: { yt: "gqoPYLUgP48", inicio: 5, fim: 58, canal: "[P]rehab", idioma: "en" } },
  "mobilidade-de-quadril-90-90": { video: { yt: "fmc0mIj6Ewc", inicio: 17, fim: 75, canal: "Ricardo Fisiologista", idioma: "pt" } },
  "cadeira-flexora-sentada": { video: { yt: "ra3Sf4-RFr8", inicio: 86, fim: 131, canal: "La\xE9rcio Refundini - Aulas", idioma: "pt" } },
  "belt-squat": { video: { yt: "04YYmk7R2G0", inicio: 160, fim: 245, canal: "Prof. Dr. Jo\xE3o Moura", idioma: "pt" } },
  "elevacao-pelvica-na-maquina": { video: { yt: "CQebwTfJjas", inicio: 115, fim: 225, canal: "Tay Training", idioma: "pt" } },
  "cadeira-extensora": { video: { yt: "el3oHblB5DM", inicio: 48, fim: 86, canal: "Leandro Twin", idioma: "pt" } },
  "adutora": { video: { yt: "Wf602gn_9zU", inicio: 52, fim: 72, canal: "Leandro Twin", idioma: "pt" } },
  "panturrilha-no-leg-press": { video: { yt: "wCXvfH_-BLg", inicio: 9, fim: 31, canal: "Leandro Twin", idioma: "pt" } },
  "pallof-press": { video: { yt: "Wez6pSiwfJg", inicio: 4, fim: 28, canal: "CT Powerfit", idioma: "pt" } },
  "prancha-lateral": { video: { yt: "2NjO5KrlVEM", inicio: 7, fim: 48, canal: "Rodrigo Zago Treinador", idioma: "pt" } },
  "elevacao-lateral-com-halteres": { video: { yt: "ORparUDksUk", inicio: 24, fim: 75, canal: "Guilherme Stellbrink I FisioPrev", idioma: "pt" } },
  "crossover-de-baixo-para-cima": { video: { yt: "SVVydit3uSw", inicio: 78, fim: 165, canal: "Thiago Gallina | Treinador", idioma: "pt" } },
  "pullover-em-maquina": { video: { yt: "oxpAl14EYyc", inicio: 0, fim: 16, canal: "Renaissance Periodization", idioma: "en" } },
  "triceps-acima-da-cabeca-na-polia-sentado": { video: { yt: "g7b_qYPJoOw", inicio: 70, fim: 120, canal: "ATLASTHETICS", idioma: "en" } },
  "rosca-inclinada-com-halteres": { video: { yt: "Cv0zCtntyto", inicio: 20, fim: 58, canal: "Miqueias Alves Personal", idioma: "pt" } },
  "triceps-testa-com-barra-w": { video: { yt: "zznCYBVZOVA", inicio: 28, fim: 68, canal: "Leandro Twin", idioma: "pt" } },
  "rosca-scott-na-maquina": { video: { yt: "7vHwxXHBPMo", inicio: 56, fim: 94, canal: "Personal Maur\xEDcio Moraes", idioma: "pt" } },
  "agachamento-bulgaro-com-halteres": { video: { yt: "IGf9fR4Y7Iw", inicio: 78, fim: 108, canal: "Leandro Twin", idioma: "pt" } },
  "mesa-flexora-deitada": { video: { yt: "2-ULaRrQa7c", inicio: 58, fim: 108, canal: "Leandro Twin", idioma: "pt" } },
  "abdutora": { video: { yt: "e2gmqTG1OgQ", inicio: 25, fim: 50, canal: "Leandro Twin", idioma: "pt" } },
  "panturrilha-sentada": { video: { yt: "jMWs_p-W9gY", inicio: 20, fim: 62, canal: "Leandro Twin", idioma: "pt" } },
  "dead-bug": { video: { yt: "0loS0bRNqfs", inicio: 33, fim: 77, canal: "Treinadora Sarah Castro", idioma: "pt" } },
  "supino-inclinado-com-halteres": { video: { yt: "D3WuIh8spwg", inicio: 310, fim: 415, canal: "Fabricio Pacholok", idioma: "pt" } },
  "puxada-alta-pegada-neutra": { video: { yt: "uAnrJBnxrZ0", inicio: 9, fim: 35, canal: "Treino Mestre", idioma: "pt" } },
  "remada-cavalinho-apoiada-pegada-aberta": { video: { yt: "_1YANc2e3qw", inicio: 34, fim: 105, canal: "Lukas Rodrigues Treinador", idioma: "pt" } },
  "elevacao-lateral-no-cabo": { video: { yt: "NBkMIWWkIKQ", inicio: 135, fim: 192, canal: "Physique Development", idioma: "en" } },
  "encolhimento-kelso-apoiado": { video: { yt: "Qq1xT2Vs_SY", inicio: 3, fim: 29, canal: "All Strength Training", idioma: "en" } },
  "rosca-martelo": { video: { yt: "OnNmaG_tZM4", inicio: 10, fim: 74, canal: "La\xE9rcio Refundini - Aulas", idioma: "pt" } }
};
var BASE_ANIM = "https://wetwqqrrgormwyktewlm.supabase.co/storage/v1/object/public/midia/anim/";
var CREDITO_REPDB = "Exercise data by RepDB (repdb.co)";
var COM_ANIM_REPDB = [
  "supino-inclinado-no-smith",
  "barra-fixa",
  "remada-na-maquina-com-apoio-de-peito",
  "chest-press-horizontal-convergente",
  "elevacao-lateral-na-maquina",
  "reverse-pec-deck",
  "alongamento-do-flexor-do-quadril-ajoelhado",
  "mobilidade-de-quadril-90-90",
  "cadeira-flexora-sentada",
  "elevacao-pelvica-na-maquina",
  "cadeira-extensora",
  "adutora",
  "pallof-press",
  "prancha-lateral",
  "elevacao-lateral-com-halteres",
  "triceps-acima-da-cabeca-na-polia-sentado",
  "rosca-inclinada-com-halteres",
  "triceps-testa-com-barra-w",
  "rosca-scott-na-maquina",
  "agachamento-bulgaro-com-halteres",
  "mesa-flexora-deitada",
  "abdutora",
  "panturrilha-sentada",
  "dead-bug",
  "supino-inclinado-com-halteres",
  "puxada-alta-pegada-neutra",
  "elevacao-lateral-no-cabo",
  "encolhimento-kelso-apoiado",
  "rosca-martelo"
];
COM_ANIM_REPDB.forEach(function(id) {
  const m = MIDIA[id] || (MIDIA[id] = {});
  m.anim = {
    inicio: BASE_ANIM + id + "-inicio.webp",
    pico: BASE_ANIM + id + "-pico.webp",
    fonte: "RepDB",
    licenca: "RepDB Free Tier License v1.0",
    credito: CREDITO_REPDB
  };
});

// src/dominio/catalogo.ts
function sem(n) {
  return " " + String(n).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, " ").trim() + " ";
}
var REGRAS_DE_MOVIMENTO = [
  ["mobilidade", [" alongamento ", " mobilidade "]],
  ["core", [" prancha ", " dead bug ", " pallof ", " ab wheel ", " rollout ", " crunch ", " abdominal ", " sit up ", " elevacao de pernas ", " reverse crunch "]],
  ["crucifixo-inverso", [" crucifixo inverso ", " reverse ", " face pull ", " deltoide posterior ", " remada alta com corda ", " remada aberta "]],
  ["elevacao-lateral", [" elevacao lateral "]],
  ["elevacao-frontal", [" elevacao frontal "]],
  ["encolhimento", [" encolhimento "]],
  ["supino-inclinado", [" supino inclinado ", " chest press inclinado ", " maquina de supino inclinado "]],
  ["supino", [" supino ", " chest press "]],
  ["crucifixo", [" crucifixo ", " crossover ", " pec deck ", " peck deck "]],
  ["pullover", [" pullover ", " straight arm "]],
  ["puxada", [" puxada ", " pulldown ", " barra fixa "]],
  ["remada", [" remada ", " high row "]],
  ["rosca", [" rosca "]],
  ["triceps", [" triceps ", " pushdown ", " mergulho ", " extensao unilateral acima ", " extensao acima da cabeca "]],
  ["extensao-de-joelho", [" extensora "]],
  ["flexao-de-joelho", [" flexora "]],
  ["dobradica", [" terra romeno ", " stiff ", " good morning "]],
  ["ponte", [" elevacao pelvica ", " hip thrust ", " coice na maquina "]],
  ["abducao", [" abdutora ", " abducao ", " passada lateral "]],
  ["aducao", [" adutora ", " aducao ", " agachamento sumo "]],
  ["panturrilha", [" panturrilha "]],
  ["tibial", [" tibial ", " flexao de tornozelo "]],
  ["agachamento", [" agachamento ", " squat ", " leg press ", " hack ", " afundo ", " bulgaro ", " lunge "]]
];
var SECUNDARIOS = {
  "supino-inclinado": [["tr\xEDceps", 0.5], ["delt anterior", 0.5]],
  "supino": [["tr\xEDceps", 0.5], ["delt anterior", 0.5]],
  "puxada": [["b\xEDceps", 0.5]],
  "remada": [["b\xEDceps", 0.5], ["delt posterior", 0.5]],
  "agachamento": [["gl\xFAteo", 0.5]],
  "dobradica": [["gl\xFAteo", 0.5]],
  "ponte": [["posterior", 0.25]]
};
var GRUPO_DO_TEXTO = {
  "deltoide lateral": "delt lateral",
  "deltoide posterior": "delt posterior",
  "deltoide anterior": "delt anterior",
  "costas": "costas espessura",
  "core": "abd\xF4men",
  "peito inferior": "peito",
  "mobilidade": ""
};
function grupoCanonico(g) {
  const k = String(g || "").trim().toLowerCase();
  return k in GRUPO_DO_TEXTO ? GRUPO_DO_TEXTO[k] : k;
}
function movimentoDe(n, u) {
  const s = sem(n);
  for (const [mov, palavras] of REGRAS_DE_MOVIMENTO) {
    if (palavras.some(function(p) {
      return s.indexOf(p) >= 0;
    })) return mov;
  }
  return u ? "condicionamento" : null;
}
function equipamentoDe(n, car, u) {
  const s = sem(n);
  const tem = function(...p) {
    return p.some(function(x) {
      return s.indexOf(" " + x + " ") >= 0;
    });
  };
  if (tem("smith")) return "smith";
  if (tem("barra fixa")) return "maquina-pino";
  if (tem("polia", "cabo", "crossover", "corda", "face pull", "straight arm pulldown", "pushdown", "pallof")) return "polia";
  if (tem("halter", "halteres", "goblet")) return "halteres";
  if (tem("kettlebell", "sandbag", "wall balls")) return "implemento";
  if (tem("barra", "barra w")) return "barra";
  if (tem("bike", "remo", "ski", "esteira", "corrida", "erg")) return "ergometro";
  if (tem("sled")) return "sled";
  if (car === "corpo") return "corpo";
  if (car === "assist") return "maquina-pino";
  if (car === "halter") return "halteres";
  if (car === "halter1") return "implemento";
  if (car === "barra") return "barra";
  if (car === "lado") return "maquina-anilha";
  return u ? "corpo" : "maquina-pino";
}
function unilateralDe(n) {
  const s = sem(n);
  return [" unilateral ", " alternada ", " concentrada ", " serrote ", " bulgaro ", " afundo ", " lunge "].some(function(p) {
    return s.indexOf(p) >= 0;
  });
}
function musculosDe(g, mov) {
  if (!g) return { mus: [], cur: !mov };
  const mus = [[g, 1]];
  (SECUNDARIOS[mov || ""] || []).forEach(function(m) {
    if (m[0] !== g) mus.push([m[0], m[1]]);
  });
  return { mus, cur: !mov };
}
function doCodigo(id, e) {
  const mov = movimentoDe(e.n, e.u);
  const m = musculosDe(e.g, mov);
  const x = {
    id,
    n: e.n,
    alt: [],
    mov: mov || "outro",
    eq: equipamentoDe(e.n, e.car, e.u),
    g: e.g,
    mus: m.mus,
    car: e.car,
    c: e.c,
    equiv: []
  };
  if (e.cue !== void 0) x.cue = e.cue;
  if (e.u) x.u = e.u;
  if (e.q != null) x.q = e.q;
  if (unilateralDe(e.n)) x.uni = 1;
  if (e.peg) x.peg = e.peg;
  if (e.pegPe) x.pegPe = 1;
  if (e.sub) x.sub = 1;
  if (m.cur || !mov) x.cur = 1;
  return x;
}
function doTexto(x) {
  const id = slugEx(x.n);
  const mov = x.mov || movimentoDe(x.n, x.u);
  const g = x.u === "seg" ? "" : grupoCanonico(x.g);
  const m = musculosDe(g, mov);
  const e = {
    id,
    n: x.n,
    alt: (x.alt || []).slice(),
    mov: mov || "outro",
    eq: x.eq || equipamentoDe(x.n, x.car, x.u),
    g,
    mus: x.mus || m.mus,
    car: x.car,
    c: x.c ? 1 : 0,
    equiv: (x.equiv || []).slice(),
    cue: ""
  };
  if (x.uni || unilateralDe(x.n)) e.uni = 1;
  e.cur = 1;
  return e;
}
var SEMENTE = (function() {
  const ex = {};
  Object.keys(EX_BASE).forEach(function(id) {
    ex[id] = doCodigo(id, EX_BASE[id]);
  });
  Object.keys(ALT).forEach(function(nome) {
    const de = ex[slugEx(nome)];
    if (!de) return;
    ALT[nome].forEach(function(a) {
      const para = slugEx(a.n);
      if (para !== de.id && ex[para] && de.equiv.indexOf(para) < 0) de.equiv.push(para);
    });
  });
  NOVOS_DA_V22.concat(NOVOS_DO_SISTEMA).forEach(function(x) {
    const e = doTexto(x);
    if (ex[e.id]) throw new Error("semente: " + e.id + " j\xE1 existe no c\xF3digo");
    ex[e.id] = e;
  });
  Object.keys(ALT_NOMES).forEach(function(id) {
    if (!ex[id]) throw new Error("semente: nome alternativo para id inexistente " + id);
    ALT_NOMES[id].forEach(function(n) {
      if (ex[id].alt.indexOf(n) < 0) ex[id].alt.push(n);
    });
  });
  Object.keys(CURADORIA).forEach(function(id) {
    const e = ex[id], c = CURADORIA[id];
    if (!e) throw new Error("semente: curadoria para id inexistente " + id);
    if (c.mus) e.mus = c.mus.map(function(m) {
      return [m[0], m[1]];
    });
    if (c.alt) c.alt.forEach(function(n) {
      if (e.alt.indexOf(n) < 0) e.alt.push(n);
    });
    if (c.cue != null && !e.cue) e.cue = c.cue;
    if (c.equiv && !e.equiv.length) {
      c.equiv.forEach(function(q) {
        if (!ex[q]) throw new Error("semente: equivalente inexistente " + q + " em " + id);
        if (q !== id && e.equiv.indexOf(q) < 0) e.equiv.push(q);
      });
    }
    if (c.conferido) delete e.cur;
  });
  Object.keys(MIDIA).forEach(function(id) {
    if (!ex[id]) throw new Error("semente: m\xEDdia para id inexistente " + id);
    const m = limpaMidia(MIDIA[id]);
    if (m) ex[id].midia = m;
  });
  return { v: 0, ex, redir: {} };
})();
function paraExercicio(e) {
  const x = { n: e.n, car: e.car, g: e.g, c: e.c };
  if (e.cue !== void 0) x.cue = e.cue;
  if (e.u) x.u = e.u;
  if (e.q != null) x.q = e.q;
  if (e.peg) x.peg = e.peg;
  if (e.pegPe) x.pegPe = 1;
  if (e.sub) x.sub = 1;
  return x;
}
function exerciciosDoSistema(c) {
  const out = {};
  Object.keys(c.ex).forEach(function(id) {
    out[id] = paraExercicio(c.ex[id]);
  });
  Object.keys(c.redir || {}).forEach(function(de) {
    const para = resolveId(de, c.redir);
    if (para !== de && c.ex[para]) out[de] = paraExercicio(c.ex[para]);
  });
  return out;
}
function resolveId(id, redir) {
  let x = id;
  const visto = {};
  while (redir[x] && !visto[x]) {
    visto[x] = 1;
    x = redir[x];
  }
  return visto[x] ? id : x;
}
function num(x) {
  return typeof x === "number" && isFinite(x) ? x : void 0;
}
function txt(x) {
  return typeof x === "string" ? x : "";
}
function urlBoa(x) {
  return typeof x === "string" && /^https:\/\/[^\s]+$/.test(x);
}
function limpaMidia(bruto) {
  if (!bruto || typeof bruto !== "object") return null;
  const b = bruto;
  const out = {};
  const v = b.video;
  if (v && typeof v === "object" && typeof v.yt === "string" && /^[A-Za-z0-9_-]{11}$/.test(v.yt)) {
    const ini = num(v.inicio) || 0, fim = num(v.fim);
    if (ini >= 0 && (fim == null || fim > ini)) {
      out.video = { yt: v.yt, inicio: ini, fim: fim == null ? 0 : fim, canal: txt(v.canal), idioma: txt(v.idioma) };
    }
  }
  const a = b.anim;
  if (a && typeof a === "object" && urlBoa(a.inicio) && urlBoa(a.pico)) {
    out.anim = { inicio: a.inicio, pico: a.pico, fonte: txt(a.fonte), licenca: txt(a.licenca), credito: txt(a.credito) };
  }
  return out.video || out.anim ? out : null;
}

// src/dominio/corpo.ts
var MEDIDAS_DO_CORPO = [
  { k: "peso", n: "peso", u: "kg", bio: false, obrigatorio: true, fita: false, partida: 75 },
  {
    k: "cintura",
    n: "cintura",
    u: "cm",
    bio: false,
    obrigatorio: true,
    fita: "ligada",
    partida: 85,
    onde: "umbigo",
    como: "Fita na altura do umbigo, paralela ao ch\xE3o. Barriga relaxada; medir no fim de uma expira\xE7\xE3o normal."
  },
  { k: "bioPeso", n: "peso na bioimped\xE2ncia", u: "kg", bio: true, obrigatorio: true, fita: false },
  { k: "bioMusculo", n: "massa muscular esquel\xE9tica", u: "kg", bio: true, obrigatorio: true, fita: false },
  { k: "bioGordura", n: "massa de gordura", u: "kg", bio: true, obrigatorio: true, fita: false },
  { k: "bioGorduraPct", n: "percentual de gordura", u: "%", bio: true, obrigatorio: true, fita: false },
  { k: "bioAgua", n: "\xE1gua corporal total", u: "L", bio: true, obrigatorio: false, fita: false },
  // As medidas com fita além da cintura. Entram SEM migração, pelo contrato de
  // `normalizaEstado()`: campo novo e vazio recebe padrão no boot e na
  // importação, e a fusão e a cópia de segurança já enumeram esta tabela.
  {
    k: "braco",
    n: "bra\xE7o direito",
    u: "cm",
    bio: false,
    obrigatorio: true,
    fita: "ligada",
    partida: 35,
    onde: "meio do bra\xE7o, relaxado",
    como: "Bra\xE7o solto ao lado do corpo. Fita no meio entre a ponta do ombro e o cotovelo. Sem contrair."
  },
  {
    k: "coxa",
    n: "coxa direita",
    u: "cm",
    bio: false,
    obrigatorio: true,
    fita: "desligada",
    partida: 56,
    onde: "um palmo acima do joelho",
    como: "Em p\xE9, peso igual nas duas pernas, coxa relaxada. Fita um palmo acima da borda de cima da patela."
  },
  {
    k: "panturrilha",
    n: "panturrilha direita",
    u: "cm",
    bio: false,
    obrigatorio: true,
    fita: "desligada",
    partida: 37,
    onde: "parte mais grossa",
    como: "Em p\xE9, peso igual nas duas pernas. Fita na parte mais grossa da panturrilha, sem contrair."
  },
  {
    k: "peito",
    n: "peito",
    u: "cm",
    bio: false,
    obrigatorio: true,
    fita: "desligada",
    partida: 100,
    onde: "linha dos mamilos",
    como: "Fita na linha dos mamilos, passando sob as axilas e paralela ao ch\xE3o. Bra\xE7os soltos; medir no fim de uma expira\xE7\xE3o normal."
  },
  {
    k: "quadril",
    n: "quadril",
    u: "cm",
    bio: false,
    obrigatorio: true,
    fita: "desligada",
    partida: 96,
    onde: "parte mais larga do quadril",
    como: "De lado no espelho, achar a parte mais larga (gl\xFAteo e culote). Fita paralela ao ch\xE3o, p\xE9s juntos."
  },
  // As dobras com adipômetro (06/11/2026): sempre do lado direito, em mm, e
  // nunca convertidas para percentual de gordura. Quem mede é sempre a mesma
  // pessoa. Entram sem migração, como as fitas: a tabela é a fonte da fusão,
  // da cópia de segurança e do padrão do boot.
  {
    k: "dobraAbdominal",
    n: "dobra abdominal",
    u: "mm",
    bio: false,
    obrigatorio: true,
    fita: false,
    dobra: true,
    onde: "dois dedos ao lado do umbigo, dobra vertical",
    como: "Dois dedos \xE0 direita do umbigo. Dobra vertical."
  },
  {
    k: "dobraSuprailiaca",
    n: "dobra suprail\xEDaca",
    u: "mm",
    bio: false,
    obrigatorio: true,
    fita: false,
    dobra: true,
    onde: "logo acima do osso do quadril, dobra diagonal",
    como: "Logo acima do osso do quadril, do lado direito. Dobra diagonal, acompanhando a linha do osso."
  },
  {
    k: "dobraCoxa",
    n: "dobra da coxa",
    u: "mm",
    bio: false,
    obrigatorio: true,
    fita: false,
    dobra: true,
    onde: "meio da coxa na frente, dobra vertical",
    como: "Coxa direita, na frente, no meio entre a virilha e o joelho. Dobra vertical."
  }
];
var MEDIDAS_DE_DOBRA = MEDIDAS_DO_CORPO.filter(function(m) {
  return !!m.dobra;
});
var MARCAS_DO_CORPO = MEDIDAS_DO_CORPO.map(function(m) {
  return m.k;
});
var MARCAS_DA_BIO = MEDIDAS_DO_CORPO.filter(function(m) {
  return m.bio;
}).map(function(m) {
  return m.k;
});
var MEDIDAS_DE_FITA = MEDIDAS_DO_CORPO.filter(function(m) {
  return m.fita !== false;
});

// src/dominio/programas.ts
var SEMANA = 7 * 864e5;
function programasDe(S) {
  const P = S && S.programas;
  if (!P || typeof P !== "object" || !P.lista || typeof P.lista !== "object") return null;
  if (!P.ativo || !P.lista[P.ativo]) return null;
  return P;
}
function diasAbertos(prog) {
  return Object.keys(prog || {}).filter((d) => !!prog[d]?.aberto);
}
function treinosDe(prog, rot) {
  const p = prog || {};
  const abertos = new Set(diasAbertos(p));
  const ordem = (rot && rot.length ? rot : Object.keys(p)).filter((d) => p[d] && !abertos.has(d));
  Object.keys(p).forEach((d) => {
    if (!abertos.has(d) && ordem.indexOf(d) < 0) ordem.push(d);
  });
  return ordem;
}
function conteudoDe(S, id) {
  const P = programasDe(S);
  if (!P || !P.lista[id]) return null;
  if (id === P.ativo) return { prog: S.prog || {}, rot: S.rot || Object.keys(S.prog || {}), progTreinador: S.progTreinador || null };
  const x = P.lista[id];
  return { prog: x.prog || {}, rot: x.rot || Object.keys(x.prog || {}), progTreinador: x.progTreinador || null };
}
function letrasDe(S, id) {
  const c = conteudoDe(S, id);
  return new Set(c ? Object.keys(c.prog) : []);
}
function vigenteEm(P, t) {
  return Object.values(P.lista).filter((x) => (x.periodos || []).some(([a, b]) => t >= a && (b == null || t < b))).map((x) => x.id);
}
function programaEm(S, t) {
  const P = programasDe(S);
  if (!P) return null;
  const ids = vigenteEm(P, t);
  return ids.indexOf(P.ativo) >= 0 ? P.ativo : ids[0] || P.ativo;
}
function programaDaSessao(S, s) {
  const P = programasDe(S);
  if (!P) return null;
  if (s.prog && P.lista[s.prog]) return s.prog;
  const noTempo = programaEm(S, s.t);
  if (!s.day || s.livre || letrasDe(S, noTempo).has(s.day)) return noTempo;
  if (letrasDe(S, P.ativo).has(s.day)) return P.ativo;
  const outros = Object.values(P.lista).filter((x) => letrasDe(S, x.id).has(s.day)).sort((a, b) => ultimoFim(b) - ultimoFim(a));
  return outros.length ? outros[0].id : noTempo;
}
function ultimoFim(x) {
  const p = x.periodos || [];
  if (!p.length) return x.criado || 0;
  const u = p[p.length - 1];
  return u[1] == null ? Infinity : u[1];
}
var SEPARA_ATE = Date.UTC(2026, 10, 28, 3);
function periodoDe2(S, id, agora) {
  const P = programasDe(S);
  const x = P && P.lista[id];
  if (!x) return null;
  const sess = (S.done || []).filter((s) => s && !s.livre && programaDaSessao(S, s) === id).map((s) => s.t);
  const per = x.periodos || [];
  let de = per.length ? per[0][0] : x.criado;
  if (!de && sess.length) de = Math.min.apply(null, sess);
  const fim = per.length ? per[per.length - 1][1] : null;
  return { de: de || x.criado || 0, ate: fim == null ? agora : fim };
}

// src/dominio/dia.ts
var CADENCIA_PADRAO = ["descanso", "treino", "treino", "treino", "treino", "treino", "treino"];
function cadenciaPrevista(cadencia, t) {
  const c = cadencia && cadencia.length === 7 ? cadencia : CADENCIA_PADRAO;
  return c[new Date(t).getDay()];
}

// src/dominio/nutricao/alimentos.ts
var CRU = [
  ["arroz", "Arroz branco cozido", "mercearia", "g", 128, 2.5, 28, 0.2, 0.36],
  ["macarrao", "Macarr\xE3o cozido", "mercearia", "g", 158, 5.8, 30, 1.3, 0.42],
  ["cuscuz", "Cuscuz cozido", "mercearia", "g", 113, 2.2, 24.5, 0.3, 0.3625],
  ["feijao", "Feij\xE3o cozido", "mercearia", "g", 76, 4.8, 13.6, 0.5, 0.43],
  ["aveia", "Aveia", "mercearia", "g", 394, 13.9, 66.6, 8.5, 0],
  ["cereal", "Cereal de milho simples", "mercearia", "g", 375, 7, 84, 1, 0],
  // Por que esta linha tem comentário: o alvo calórico é CALCULADO do plano,
  // então um valor errado aqui contamina o alvo do dia, e por ele o ledger do
  // ajuste calórico — que audita decisões de corte contra a ingestão da época.
  // Nasceu com quatro números de segunda mão, marcada como pendente, e a marca
  // valeu: os quatro estavam errados.
  //
  // CONFERIDO em 06/10 contra o rótulo, por pedido do dono, em duas fontes que
  // concordam: Open Food Facts (EAN 7891000098950) e a tabela do produto no
  // varejo. Por 100 g: 373 kcal, 13 g de proteína, 70 g de carboidrato, 2,33 g
  // de gordura, 9,67 g de fibra (a fibra não entra aqui porque o catálogo não a
  // guarda).
  //
  // Os valores anteriores vinham da memória de um agente e estavam errados nos
  // quatro números — proteína 9,5 contra 13, gordura 4,5 contra 2,3. Era por
  // isso que ficaram marcados como pendentes.
  ["neston", "Neston 3 Cereais", "mercearia", "g", 373, 13, 70, 2.3, 0],
  ["atum", "Atum drenado", "mercearia", "g", 116, 26, 0, 1, 0],
  ["pasta", "Pasta de amendoim", "mercearia", "g", 588, 25, 20, 50, 0],
  ["azeite", "Azeite de oliva", "mercearia", "g", 884, 0, 0, 100, 0],
  ["mel", "Mel", "mercearia", "g", 309, 0.3, 82, 0, 0],
  ["geleia", "Geleia light", "mercearia", "g", 150, 0.3, 36, 0, 0],
  ["docedeleite", "Doce de leite", "mercearia", "g", 315, 6.9, 55, 7.4, 0],
  ["frango", "Frango cozido", "acougue", "g", 165, 31, 0, 3.6, 1.3125],
  ["suino", "Fil\xE9/lombo su\xEDno magro cozido", "acougue", "g", 190, 32, 0, 6.4, 1.34],
  ["tilapia", "Til\xE1pia/merluza cozida", "acougue", "g", 128, 26, 0, 2.7, 1.25],
  ["leite", "Leite integral", "laticinios", "ml", 61, 3.2, 4.7, 3.3, 0],
  ["iogurte", "Iogurte natural integral", "laticinios", "g", 61, 3.5, 4.7, 3.3, 0],
  ["requeijao", "Requeij\xE3o light", "laticinios", "g", 175, 5, 5, 14, 0],
  ["leitepo", "Leite em p\xF3 integral", "laticinios", "g", 496, 26, 38, 26, 0],
  ["ovo", "Ovo cozido", "laticinios", "g", 143, 13, 1, 9.5, 0],
  ["pao", "P\xE3o Artesano", "padaria", "g", 280, 8.5, 50, 4, 0],
  ["banana", "Banana", "hortifruti", "g", 90, 1.3, 23, 0.1, 0],
  ["uva", "Uva", "hortifruti", "g", 69, 0.7, 18, 0.2, 0],
  ["maca", "Ma\xE7\xE3", "hortifruti", "g", 52, 0.3, 14, 0.2, 0],
  ["laranja", "Laranja", "hortifruti", "g", 47, 0.9, 12, 0.1, 0],
  ["kiwi", "Kiwi", "hortifruti", "g", 61, 1.1, 15, 0.5, 0],
  ["macaxeira", "Macaxeira cozida", "hortifruti", "g", 125, 0.6, 30, 0.3, 0],
  ["batata", "Batata cozida", "hortifruti", "g", 86, 1.8, 20, 0.1, 0],
  ["legumes", "Legumes / verduras", "hortifruti", "g", 35, 2, 6, 0.3, 0],
  ["whey", "Whey DUX concentrado", "suplementos", "g", 407, 66.7, 20, 5, 0],
  ["malto", "Maltodextrina / dextrose", "suplementos", "g", 380, 0, 95, 0, 0],
  ["creatina", "Creatina monohidratada", "suplementos", "g", 0, 0, 0, 0, 0],
  ["cafe", "Caf\xE9 preto sem a\xE7\xFAcar", "livre", "ml", 1, 0, 0, 0, 0],
  // Livre como o café: na quantidade de uma pitada não move a conta, e existir
  // na lista é o que faz a refeição na tela ser a refeição de verdade.
  ["canela", "Canela em p\xF3", "livre", "g", 0, 0, 0, 0, 0],
  ["agua", "\xC1gua", "livre", "ml", 0, 0, 0, 0, 0],
  ["cocazero", "Coca Zero", "livre", "ml", 0, 0, 0, 0, 0]
];
var ALIMENTOS_BASE = {};
CRU.forEach(function([id, n, cat, u, kcal, p, c, g, cru]) {
  ALIMENTOS_BASE[id] = { id, n, cat, u, kcal, p, c, g, cru };
});
var PLANO_BASE = [
  { id: "pre", t: "05:45", n: "Pr\xE9-treino", tag: "R\xC1PIDO E FUNCIONAL", quando: "treino", nota: "Carboidrato r\xE1pido antes de um treino ap\xF3s o jejum noturno. Volume baixo, digest\xE3o r\xE1pida. Uma fatia de p\xE3o, doce de leite e canela.", itens: [{ f: "pao", q: 35 }, { f: "docedeleite", q: 20 }, { f: "canela", q: 1 }, { f: "cafe", q: 200, caf: 1 }] },
  { id: "treino", t: "06:15", n: "Treino", tag: "INTRA-TREINO", quando: "treino", nota: "Muscula\xE7\xE3o 6h15\u20137h30. Nos dias de alta demanda entram 25 g de carboidrato na \xE1gua.", itens: [{ f: "agua", q: 600 }, { f: "malto", q: 25, alta: true }] },
  { id: "pos", t: "08:00", n: "Caf\xE9 da manh\xE3", tag: "REFEI\xC7\xC3O FORTE", quando: "sempre", nota: "Quatro fontes de energia e prote\xEDna sem depender de fog\xE3o no trabalho.", itens: [{ f: "cuscuz", q: 200 }, { f: "frango", q: 70 }, { f: "requeijao", q: 30 }, { f: "leite", q: 250 }, { f: "uva", q: 120 }] },
  { id: "almoco", t: "12:30", n: "Almo\xE7o", tag: "PRATO PRINCIPAL", quando: "sempre", nota: "O kiwi entra diariamente junto de feij\xE3o, aveia e vegetais para elevar fibra e ajudar a regularidade intestinal.", itens: [{ f: "arroz", q: 250, arroz: true }, { f: "feijao", q: 50 }, { f: "frango", q: 80 }, { f: "legumes", q: 100 }, { f: "azeite", q: 15 }, { f: "kiwi", q: 100 }] },
  { id: "lanche", t: "16:00", n: "Lanche da tarde", tag: "GRANDE REFEI\xC7\xC3O", quando: "sempre", nota: "Bata leite + banana + aveia + pasta + leite em p\xF3 + whey. P\xE3o e geleia ficam separados.", itens: [{ f: "leite", q: 250 }, { f: "banana", q: 120 }, { f: "aveia", q: 40 }, { f: "pasta", q: 10 }, { f: "leitepo", q: 10 }, { f: "whey", q: 30 }, { f: "pao", q: 50 }, { f: "geleia", q: 20 }] },
  { id: "jantar", t: "19:30", n: "Jantar", tag: "PRATO PRINCIPAL", quando: "sempre", nota: "Quatro refei\xE7\xF5es proteicas completas j\xE1 fecham prote\xEDna e energia at\xE9 aqui. A ceia entrou depois e \xE9 acr\xE9scimo, n\xE3o substitui\xE7\xE3o: nada aqui foi reduzido para ela caber.", itens: [{ f: "arroz", q: 250, arroz: true }, { f: "feijao", q: 50 }, { f: "suino", q: 80 }, { f: "legumes", q: 100 }, { f: "azeite", q: 15 }] },
  // A ceia. Entrou no plano 11, e a mesma refeição vai ao aparelho dele pela
  // migração 10 → 11 (`src/dominio/migracoes.ts`), que carrega uma CÓPIA
  // CONGELADA dela: migração lê o dado da época, nunca o código de hoje. As
  // duas cópias não se referenciam de propósito, e um teste de domínio cobra
  // que elas descrevam a MESMA ceia — se esta linha mudar, aquele teste fica
  // vermelho e a mudança precisa de uma migração nova, não de um ajuste lá.
  //
  // `t` é SUPOSTO, não prescrito: ele disse o que come, não a que horas. 21:30
  // põe a ceia depois do jantar das 19:30 e antes do sono de quem levanta para
  // um pré-treino às 05:45. O horário só decide a posição da linha na timeline,
  // que `refeicoesDeHoje` ordena por relógio.
  { id: "ceia", t: "21:30", n: "Ceia", tag: "ANTES DE DORMIR", quando: "sempre", nota: "Copo de leite com duas colheres de Neston. O copo de 250 ml \xE9 a por\xE7\xE3o de leite que o resto deste plano j\xE1 usa; as duas colheres saem da por\xE7\xE3o do r\xF3tulo, que declara 30 g em CINCO colheres de sopa \u2014 6 g por colher.", itens: [{ f: "leite", q: 250 }, { f: "neston", q: 12 }] }
];

// src/dominio/nutricao/calculo.ts
var VAZIO = { kcal: 0, p: 0, c: 0, g: 0 };
function somaTotais(a, b) {
  return { kcal: a.kcal + b.kcal, p: a.p + b.p, c: a.c + b.c, g: a.g + b.g };
}
function totalDoItem(item, catalogo, escala = 1) {
  const a = catalogo[item.f];
  if (!a) return VAZIO;
  const f = item.q * escala / 100;
  return { kcal: a.kcal * f, p: a.p * f, c: a.c * f, g: a.g * f };
}
function itemEntra(item, alta) {
  return !item.alta || alta;
}
function refeicaoEntra(r, treino, alta) {
  if (r.quando === "sempre") return true;
  if (r.quando === "treino") return treino;
  return alta;
}
function totalDaRefeicao(r, catalogo, alta, escala = 1) {
  return r.itens.filter((i) => itemEntra(i, alta)).reduce((acc, i) => somaTotais(acc, totalDoItem(i, catalogo, escala)), VAZIO);
}
function totalDoDia(plano, catalogo, treino, alta, escala = {}) {
  return plano.filter((r) => refeicaoEntra(r, treino, alta)).reduce((acc, r) => somaTotais(acc, totalDaRefeicao(r, catalogo, alta, escala[r.id] ?? 1)), VAZIO);
}
function totalRegistrado(plano, catalogo, dia, treino, alta) {
  return plano.filter((r) => refeicaoEntra(r, treino, alta) && dia.done[r.id] && !(dia.como && dia.como[r.id] === "nao")).reduce((acc, r) => somaTotais(acc, totalDaRefeicao(r, catalogo, alta, dia.escala[r.id] ?? 1)), VAZIO);
}
var CORTE_CAFEINA = 16 * 60;
function ajusteNoItem(i) {
  const v = i.ajq;
  return typeof v === "number" && isFinite(v) ? v : 0;
}
function quantidadePrescrita(i) {
  return Math.max(0, Math.round(i.q) - ajusteNoItem(i));
}

// src/dominio/sincronia.ts
var TREINO = ["prog", "progTreinador", "rot"];
var PRESCRICAO = /* @__PURE__ */ new Set([...TREINO, "programas", "comida", "cadencia"]);

// src/dominio/migracoes.ts
var ARQUIVO = "antigo~";

// src/infra/nivel.ts
var NIVEL_FRENTE = 1;
var NIVEL_LADO = 2;
var FOLGA_DO_NIVEL = 0.3;
var TREMOR = 4;
var APOIADO = 0.1;
var GRAU = 180 / Math.PI;
function noNivel(n, antes) {
  if (!n) return false;
  const f = antes ? FOLGA_DO_NIVEL : 0;
  return n.lado <= NIVEL_LADO + f && n.frente <= NIVEL_FRENTE + f;
}

// src/infra/corpo.ts
function extDoOriginal(v, ext) {
  return "orig." + v + "." + (ext || "jpeg");
}

// ferramentas/espelho/monta.ts
function lista(x) {
  return Array.isArray(x) ? x : [];
}
function obj(x) {
  return x && typeof x === "object" && !Array.isArray(x) ? x : {};
}
function numero(x) {
  return typeof x === "number" && isFinite(x) ? x : null;
}
var DATA_ISO = /^\d{4}-\d{2}-\d{2}$/;
function segmento(s) {
  const r = String(s).replace(/[^A-Za-z0-9._-]+/g, "-").replace(/^[.-]+/, "");
  return r || "sem-nome";
}
function dois(n) {
  return String(n).padStart(2, "0");
}
function dataBR(t) {
  const d = new Date(t);
  return dois(d.getDate()) + "/" + dois(d.getMonth() + 1) + "/" + d.getFullYear();
}
function dataComDia(t) {
  return DIAS_CURTOS[new Date(t).getDay()] + ", " + dataBR(t);
}
function momento(t) {
  return DIAS_LONGOS[new Date(t).getDay()] + ", " + dataBR(t) + " \xE0s " + fmtHora(t);
}
function dataIsoBR(d) {
  return dataComDia(instanteDaData(d));
}
function br(n, casas = 1) {
  const f = Math.pow(10, casas);
  return String(Math.round(n * f) / f).replace(".", ",");
}
function milhar(n) {
  return Math.round(n).toLocaleString("pt-BR");
}
function relogio(seg) {
  const s = Math.round(seg);
  const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), r = s % 60;
  return h ? h + ":" + dois(m) + ":" + dois(r) : m + ":" + dois(r);
}
function cel(x) {
  return String(x == null ? "" : x).replace(/\r?\n+/g, " ").replace(/\|/g, "\\|").trim();
}
function csv(cabecalho, linhas) {
  const campo = function(x) {
    if (x == null) return "";
    const s = typeof x === "number" ? String(Math.round(x * 1e3) / 1e3) : String(x);
    return /[",\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  return [cabecalho].concat(linhas).map(function(l) {
    return l.map(campo).join(",");
  }).join("\n") + "\n";
}
function totaisTexto(t) {
  return milhar(t.kcal) + " kcal \xB7 P " + Math.round(t.p) + " g \xB7 C " + Math.round(t.c) + " g \xB7 G " + Math.round(t.g) + " g";
}
function cabeca(titulo, linhas = []) {
  return [
    "# " + titulo,
    "",
    ...linhas,
    ...linhas.length ? [""] : [],
    "_Arquivo gerado a partir do app. N\xE3o edite: a pr\xF3xima atualiza\xE7\xE3o sobrescreve. Ver `LEIA-ME.md` na raiz da pasta._",
    ""
  ];
}
function base(S) {
  const cat = montaCatalogo(obj(S.ex), exerciciosDoSistema(SEMENTE));
  const progS = obj(S.prog);
  const prog = S.primeiraVez || Object.keys(progS).length ? progS : semeiaProg();
  const rot = S.primeiraVez || lista(S.rot).length ? lista(S.rot) : ROT_BASE.filter(function(d) {
    return prog[d];
  });
  const pt = S.progTreinador && typeof S.progTreinador === "object" && S.progTreinador.dias ? S.progTreinador : null;
  const treinador = pt ? { rot: lista(pt.rot), dias: obj(pt.dias), data: pt.data || null, colado: true } : { rot: S.primeiraVez ? [] : ROT_BASE.slice(), dias: S.primeiraVez ? {} : semeiaProg(), data: null, colado: false };
  const comida = obj(S.comida);
  const proprios = obj(comida.alimentos);
  const alimentos = {};
  Object.keys(ALIMENTOS_BASE).forEach(function(k) {
    alimentos[k] = ALIMENTOS_BASE[k];
  });
  Object.keys(proprios).forEach(function(k) {
    alimentos[k] = Object.assign({ id: k }, ALIMENTOS_BASE[k] || {}, proprios[k]);
  });
  const plano = S.primeiraVez || lista(comida.plano).length ? lista(comida.plano) : PLANO_BASE;
  const sessoes = lista(S.done).filter(function(m) {
    return m && numero(m.t) != null;
  }).slice().sort(function(a, b) {
    return a.t - b.t;
  });
  const porSid = /* @__PURE__ */ new Map();
  const logs = obj(S.logs);
  Object.keys(logs).forEach(function(key) {
    lista(logs[key]).forEach(function(l) {
      if (!l || numero(l.t) == null) return;
      const sid = numero(l.sid) != null ? l.sid : l.t;
      if (!porSid.has(sid)) porSid.set(sid, []);
      porSid.get(sid).push({ key, l });
    });
  });
  return { S, cat, rot, prog, treinador, alimentos, plano, sessoes, porSid };
}
function exDe(b, id) {
  if (b.cat[id]) return b.cat[id];
  if (id.indexOf(ARQUIVO) === 0) return Object.assign(exercicioFantasma(id), { n: id.slice(ARQUIVO.length) });
  return exercicioFantasma(id);
}
function nomeEx(b, id) {
  return exDe(b, id).n || id;
}
function tipoCarga(b, id) {
  const k = obj(b.S.carga)[id] || exDe(b, id).car;
  return CARGAS[k] ? k : "pino";
}
function treinoDaMarca(b, day, m) {
  const S = b.S;
  if (m && programasDe(S)) {
    const id = programaDaSessao(S, m);
    const c = id ? conteudoDe(S, id) : null;
    if (c && c.prog[day]) return c.prog[day];
  }
  return b.prog[day] || b.treinador.dias[day] || null;
}
function nomeDoTreino(b, day, m) {
  const t = treinoDaMarca(b, day, m);
  return t && t.name ? t.name : "";
}
function dor(k) {
  const d = DORES.filter(function(x) {
    return x.k === k;
  })[0];
  return d ? d.t : k;
}
function temHora(m) {
  if (m.livre) return m.hora === 1;
  return !m.retro || m.hora === 1;
}
function fotosDoEstado(S) {
  const r = [];
  lista(obj(S.protocolo).sessoes).forEach(function(s) {
    if (!s || !DATA_ISO.test(String(s.d))) return;
    const fotos = obj(s.fotos);
    Object.keys(fotos).forEach(function(pose) {
      const f = fotos[pose];
      if (!f || numero(f.v) == null || !f.ext) return;
      const arquivo = segmento(pose) + "." + segmento(f.ext);
      r.push({ caminho: "corpo/fotos/" + s.d + "/" + arquivo, bucket: BUCKET_CORPO, partes: [s.d, pose + "." + f.ext], v: f.v });
      if (f.orig && f.orig.ext) {
        r.push({
          caminho: "corpo/fotos/" + s.d + "/" + segmento(pose) + ".original." + segmento(f.orig.ext),
          bucket: BUCKET_CORPO,
          partes: [s.d, pose + "." + extDoOriginal(f.v, f.orig.ext)],
          v: f.v
        });
      }
    });
  });
  const aparelhos = obj(S.fotos);
  Object.keys(aparelhos).forEach(function(id) {
    const f = aparelhos[id];
    if (!f || numero(f.v) == null || !f.ext) return;
    r.push({ caminho: "treino/aparelhos/" + segmento(id) + "." + segmento(f.ext), bucket: BUCKET_APARELHOS, partes: [id + "." + f.ext], v: f.v });
  });
  return r;
}
function situacaoDaFoto(caminho, ctx) {
  if (ctx.presentes && ctx.presentes.has(caminho)) return null;
  if (ctx.faltando && ctx.faltando.has(caminho)) return "ainda n\xE3o subiu para a nuvem";
  if (ctx.falhou && ctx.falhou.has(caminho)) return "n\xE3o deu para baixar nesta atualiza\xE7\xE3o";
  if (ctx.semDownload) return "n\xE3o baixada (a c\xF3pia em arquivo n\xE3o leva fotos)";
  return ctx.presentes ? "n\xE3o baixada" : null;
}
function alvoDoSlot(s, ex) {
  const u = s.u || ex.u;
  const q = s.q != null ? s.q : ex.q;
  const lado = s.lado ? " por " + s.lado : "";
  if (!u) return (s.r || "") + lado;
  const ROT = { m: "m", cal: "cal", rep: "reps", seg: "s" };
  return (q != null ? br(q) + " " : "") + ROT[u] + lado;
}
function tabelaDoTreino(b, t, comDesde) {
  if (t.aberto && !lista(t.ex).length) return ["Decidido no dia (aula de box): sem exerc\xEDcios prescritos.", ""];
  const L = [
    "| # | Exerc\xEDcio | S\xE9ries | Repeti\xE7\xF5es / alvo | RIR | Descanso | Grupo |" + (comDesde ? " Na posi\xE7\xE3o desde |" : ""),
    "|---|---|---|---|---|---|---|" + (comDesde ? "---|" : "")
  ];
  lista(t.ex).forEach(function(s, i) {
    const ex = exDe(b, s.id);
    let nome = ex.n;
    if (s.orig && s.orig !== s.id) nome += " (no lugar de " + nomeEx(b, s.orig) + ")";
    if (s.bi) nome += " \u2014 bi-set com o pr\xF3ximo";
    const cols = [i + 1, cel(nome), s.s, cel(alvoDoSlot(s, ex)), cel(s.rir || ""), s.d ? fmtDesc(s.d) : "", cel(ex.g || "")];
    if (comDesde) cols.push(!s.desde ? "do treinador" : dataBR(s.desde));
    L.push("| " + cols.join(" | ") + " |");
  });
  if (t.aberto) L.push("", "Dia aberto: o que entra nele se decide no dia.");
  return L.concat([""]);
}
function programaAtual(b, ctx) {
  const S = b.S;
  const cad = lista(S.cadencia).length === 7 ? lista(S.cadencia) : CADENCIA_PADRAO;
  const L = cabeca("Programa de treino atual", !b.rot.length ? ["Nenhum treino no programa."] : S.primeiraVez && !b.treinador.colado ? ["O programa montado no app."] : [
    "O programa que o app executa hoje. Come\xE7ou como c\xF3pia do programa do treinador",
    "(`programa-do-treinador.md`) e muda conforme as decis\xF5es registradas em `mudancas.md`."
  ]);
  const P = programasDe(S);
  if (P) L.push("- **Programa:** " + P.lista[P.ativo].nome + " (os outros, guardados, em `programas.md`)");
  if (b.rot.length) L.push("- **Rota\xE7\xE3o:** " + b.rot.join(" \u2192 ") + " (avan\xE7a conforme os treinos s\xE3o registrados, n\xE3o pelo dia da semana)");
  L.push("- **Semana t\xEDpica:** " + cad.map(function(c, i) {
    return DIAS_CURTOS[i] + " " + c;
  }).join(" \xB7 "));
  L.push("- **Deload:** " + (S.deload ? "ligado agora" : "desligado"));
  L.push('- **Na posi\xE7\xE3o desde:** quando o exerc\xEDcio entrou naquela posi\xE7\xE3o; "do treinador" = est\xE1 l\xE1 desde a prescri\xE7\xE3o original.');
  L.push("");
  b.rot.forEach(function(d) {
    const t = b.prog[d];
    if (!t) return;
    L.push("## " + d + " \u2014 " + (t.name || "") + (t.tag ? " (" + t.tag + ")" : ""), "");
    L.push(...tabelaDoTreino(b, t, true));
  });
  return L.join("\n");
}
function programas(b, ctx) {
  const S = b.S;
  const P = programasDe(S);
  if (!P) return null;
  const L = cabeca("Programas", [
    "Cada programa de treino que a pessoa teve. Um \xE9 o ativo (o de `programa.md`); os outros ficam guardados, e nada se apaga.",
    "Uma sess\xE3o pertence ao programa em que foi feita: a mesma letra em dois programas \xE9 treino diferente."
  ]);
  const ordem = Object.values(P.lista).sort(function(x, y) {
    const peso = (p) => p.estado === "ativo" ? 0 : p.estado === "proximo" || p.estado === "rascunho" ? 1 : 2;
    return peso(x) - peso(y) || (y.m || 0) - (x.m || 0);
  });
  ordem.forEach(function(p) {
    const c = conteudoDe(S, p.id);
    if (!c) return;
    const per = periodoDe2(S, p.id, ctx.agora);
    const letras = treinosDe(c.prog, c.rot);
    const sess = lista(S.done).filter(function(x) {
      return x && !x.livre && x.day && programaDaSessao(S, x) === p.id;
    }).length;
    const estado = { ativo: "ativo", guardado: "guardado", proximo: "pr\xF3ximo" + (p.comeca ? ", come\xE7a em " + p.comeca : ""), rascunho: "rascunho" }[p.estado];
    L.push("## " + p.nome + " (" + estado + ")", "");
    L.push("- **Origem:** " + (p.origem === "treinador" ? "do treinador" : "da pessoa"));
    if (per && (p.estado === "ativo" || p.estado === "guardado")) L.push("- **Per\xEDodo:** " + (per.de ? dataBR(per.de) : "desde o come\xE7o") + " a " + (p.estado === "ativo" ? "hoje" : dataBR(per.ate)));
    L.push("- **Treinos:** " + (letras.length ? letras.map(function(d) {
      return d + " (" + (c.prog[d].name || "") + ")";
    }).join(", ") : "nenhum"));
    if (p.estado !== "proximo" && p.estado !== "rascunho") L.push("- **Sess\xF5es feitas nele:** " + sess);
    if (p.objetivo) L.push("- **Objetivo:** " + cel(p.objetivo));
    L.push("");
    if (p.id !== P.ativo) letras.forEach(function(d) {
      const t = c.prog[d];
      if (!t) return;
      L.push("### " + d + " \u2014 " + (t.name || "") + (t.tag ? " (" + t.tag + ")" : ""), "");
      L.push(...tabelaDoTreino(b, t, false));
    });
  });
  const ab = diasAbertos(S.prog);
  if (ab.length) L.push("## Fora de programa", "", ab.map(function(d) {
    return d + " (" + (S.prog[d].name || "") + ")";
  }).join(", ") + ": valem com qualquer programa.", "");
  return L.join("\n");
}
function programaDoTreinador(b, ctx) {
  const t = b.treinador;
  if (!Object.keys(t.dias).length) return cabeca("Programa do treinador", ["Nenhuma prescri\xE7\xE3o de treino recebida."]).join("\n");
  const L = cabeca("Programa do treinador", [
    t.colado ? "A \xFAltima revis\xE3o que o treinador mandou e foi colada no app" + (t.data ? ", datada de " + (DATA_ISO.test(t.data) ? dataIsoBR(t.data) : t.data) : "") + "." : "O programa original, como o treinador prescreveu (\xE9 o que vem no c\xF3digo do app; nenhuma revis\xE3o foi colada depois).",
    "\xC9 a refer\xEAncia: o programa atual (`programa.md`) pode ter divergido dele por decis\xF5es do dia a dia."
  ]);
  const rot = t.rot.length ? t.rot : Object.keys(t.dias);
  rot.forEach(function(d) {
    const dia = t.dias[d];
    if (!dia) return;
    L.push("## " + d + " \u2014 " + (dia.name || "") + (dia.tag ? " (" + dia.tag + ")" : ""), "");
    L.push(...tabelaDoTreino(b, dia, false));
  });
  return L.join("\n");
}
function mudancas(b, ctx) {
  const L = cabeca("Mudan\xE7as no programa");
  const pend = lista(b.S.promoPendente).slice().sort(function(a, b2) {
    return a.t - b2.t;
  });
  L.push("## Esperando decis\xE3o", "");
  if (!pend.length) L.push("Nada esperando.", "");
  else {
    L.push("Mudan\xE7as feitas num treino que ainda n\xE3o viraram permanentes nem foram descartadas.", "");
    pend.forEach(function(p) {
      L.push("- **" + dataComDia(p.t) + " \u2014 treino " + p.day + (nomeDoTreino(b, p.day) ? " (" + nomeDoTreino(b, p.day) + ")" : "") + "**");
      lista(p.resumoMods).forEach(function(m) {
        L.push("  - " + cel(m));
      });
    });
    L.push("");
  }
  const log = lista(b.S.progLog).slice().sort(function(a, b2) {
    return b2.t - a.t;
  });
  L.push("## Decis\xF5es registradas", "");
  if (!log.length) L.push("Nenhuma ainda.", "");
  else {
    L.push("A mais recente primeiro.", "");
    log.forEach(function(e) {
      L.push("- **" + dataComDia(e.t) + " \u2014 treino " + e.day + ":** " + cel(e.txt) + (e.motivo ? " _Motivo: " + cel(e.motivo) + "_" : ""));
    });
    L.push("");
  }
  return L.join("\n");
}
function serieTexto(s, u, q) {
  const carga = s[0], res = s[1], rir = s[2];
  const r = typeof rir === "number" ? " (RIR " + rir + ")" : "";
  const kg = carga > 0 ? br(carga, 2) + " kg" : "";
  if (!u) return br(carga, 2) + " \xD7 " + res + r;
  if (u === "m" || u === "cal") return (kg ? kg + " \xB7 " : "") + (q ? br(q) + " " + u + " " : "") + "em " + relogio(res) + r;
  if (u === "rep") return (kg ? kg + " \xD7 " : "") + res + " reps" + r;
  return (kg ? kg + " \xB7 " : "") + res + " s" + r;
}
function registrosEmOrdem(b, day, regs, m) {
  const pos = lista((treinoDaMarca(b, day, m) || { ex: [] }).ex).map(function(s) {
    return s.id;
  });
  return regs.slice().sort(function(x, y) {
    const px = pos.indexOf(x.l.sl || x.key), py = pos.indexOf(y.l.sl || y.key);
    return (px < 0 ? 999 : px) - (py < 0 ? 999 : py);
  });
}
function sessoesMontadas(b) {
  const usados = /* @__PURE__ */ new Set();
  const r = b.sessoes.map(function(m) {
    usados.add(m.sid);
    return { m, orfa: false, regs: registrosEmOrdem(b, m.day, b.porSid.get(m.sid) || [], m) };
  });
  b.porSid.forEach(function(regs, sid) {
    if (usados.has(sid)) return;
    const t = Math.min(...regs.map(function(x) {
      return x.l.t;
    }));
    r.push({ m: { day: "", t, sid, dur: 0 }, orfa: true, regs });
  });
  return r.sort(function(a, c) {
    return a.m.t - c.m.t;
  });
}
function linhasDaSessao(b, x) {
  const m = x.m, S = b.S;
  const titulo = m.livre ? m.nome || "Sess\xE3o avulsa" : m.day ? m.day + (nomeDoTreino(b, m.day, m) ? " \xB7 " + nomeDoTreino(b, m.day, m) : "") : "Sem treino identificado";
  const L = ["## " + dataComDia(m.t) + " \u2014 " + titulo, ""];
  const fatos = [];
  if (temHora(m)) fatos.push("come\xE7ou \xE0s " + fmtHora(m.t));
  else if (m.hora === "turno") fatos.push("de " + periodoDe(m.t).nome + " (sem hora exata)");
  if (m.dur > 0) fatos.push(fmtDur(m.dur) + " de treino");
  if (S.sessao && S.sessao.sid === m.sid) fatos.push("em andamento");
  if (m.dl) fatos.push("deload");
  if (m.retro) fatos.push("lan\xE7ada depois");
  if (m.livre) fatos.push("fora do plano");
  if (m.fim === "auto") fatos.push("encerrada sozinha pelo app");
  if (x.orfa) fatos.push("registros sem a marca da sess\xE3o");
  if (fatos.length) L.push(fatos.join(" \xB7 "), "");
  if (lista(m.grupos).length) L.push("- Grupos: " + lista(m.grupos).join(", "));
  const pulados = lista(m.pulados).map(function(i) {
    const s = lista((treinoDaMarca(b, m.day, m) || { ex: [] }).ex)[i];
    return s ? nomeEx(b, s.id) : "posi\xE7\xE3o " + (i + 1);
  });
  if (pulados.length) L.push("- Pulou: " + pulados.join(", "));
  if (lista(m.dorMesmoAssim).length) {
    L.push("- Fez mesmo com dor repetida: " + lista(m.dorMesmoAssim).map(function(id) {
      return nomeEx(b, id);
    }).join(", "));
  }
  if (lista(m.mods).length) L.push("- Mudan\xE7as do dia: " + lista(m.mods).map(cel).join("; "));
  if (m.lousa) L.push("- Tem foto da lousa da aula (fica s\xF3 no aparelho, n\xE3o est\xE1 nesta pasta)");
  if (m.obs) L.push("- Nota da sess\xE3o:", "", ...String(m.obs).split(/\r?\n/).map(function(l) {
    return "  > " + l;
  }));
  if (L[L.length - 1] !== "") L.push("");
  if (!x.regs.length) L.push("_Nenhuma s\xE9rie registrada._");
  x.regs.forEach(function(rg) {
    const l = rg.l;
    const ex = exDe(b, rg.key);
    const feitas = lista(l.sets).filter(Boolean);
    const unidade = l.u ? "" : " (" + CARGAS[tipoCarga(b, rg.key)].rot + ")";
    let nome = "**" + ex.n + "**" + unidade;
    if (l.sl && l.sl !== rg.key) nome += " no lugar de " + nomeEx(b, l.sl);
    L.push("- " + nome + " \u2014 " + (feitas.length ? feitas.map(function(s) {
      return serieTexto(s, l.u, l.q);
    }).join(" \xB7 ") : "sem s\xE9rie completa"));
    if (l.rir && !feitas.some(function(s) {
      return typeof s[2] === "number";
    })) L.push("  - RIR da \xFAltima s\xE9rie: " + l.rir);
    if (l.aq) L.push("  - feito com aproxima\xE7\xE3o");
    if (l.dp) L.push("  - registrado depois do treino, com n\xFAmeros declarados");
    if (lista(l.dor).length) L.push("  - dor: " + lista(l.dor).map(dor).join(", "));
    if (l.obs) L.push("  - nota: " + cel(l.obs));
  });
  L.push("");
  return L;
}
function nomeDoMes(am) {
  const p = am.split("-");
  return MESES[Number(p[1]) - 1] + " de " + p[0];
}
function historicoPorMes(b) {
  const meses = /* @__PURE__ */ new Map();
  const mes = function(am) {
    if (!meses.has(am)) meses.set(am, { sessoes: [], cardio: [], descanso: [], faltas: [] });
    return meses.get(am);
  };
  sessoesMontadas(b).forEach(function(x) {
    mes(dataLocal(x.m.t).slice(0, 7)).sessoes.push(x);
  });
  lista(b.S.cardio).forEach(function(c) {
    if (c && numero(c.t) != null) mes(dataLocal(c.t).slice(0, 7)).cardio.push(c);
  });
  const comTreino = new Set(b.sessoes.map((s) => dataLocal(s.t)));
  const { descanso, falta } = uneFrequencia(b.S, {}, { ...b.S.apagados });
  Object.keys(descanso).forEach(function(d) {
    if (!comTreino.has(d) && DATA_ISO.test(d)) mes(d.slice(0, 7)).descanso.push(d);
  });
  for (const d of Object.keys(falta).sort()) {
    if (comTreino.has(d)) continue;
    const f = falta[d];
    const motivo = f.motivo && cel(String(f.motivo).replace(/[\\`*_[\]<>&~]/g, "\\$&"));
    mes(d.slice(0, 7)).faltas.push("- " + dataIsoBR(d) + (motivo ? " \xB7 " + motivo : ""));
  }
  const r = {};
  Array.from(meses.keys()).sort().forEach(function(am) {
    const M = meses.get(am);
    const L = cabeca("Treinos \u2014 " + nomeDoMes(am));
    const series = M.sessoes.reduce(function(a, x) {
      return a + x.regs.reduce(function(s, rg) {
        return s + lista(rg.l.sets).filter(Boolean).length;
      }, 0);
    }, 0);
    L.push(M.sessoes.length + (M.sessoes.length === 1 ? " sess\xE3o" : " sess\xF5es") + " \xB7 " + series + " s\xE9ries \xB7 " + M.cardio.length + " de cardio \xB7 " + M.descanso.length + (M.descanso.length === 1 ? " dia marcado" : " dias marcados") + " como descanso \xB7 " + qtd(M.faltas.length, "falta", "faltas"), "");
    M.sessoes.forEach(function(x) {
      L.push(...linhasDaSessao(b, x));
    });
    if (M.cardio.length) {
      L.push("## Cardio", "", "| Dia | Hora | Modalidade | Minutos | Intensidade |", "|---|---|---|---|---|");
      M.cardio.sort(function(a, c) {
        return a.t - c.t;
      }).forEach(function(c) {
        L.push("| " + [dataComDia(c.t), c.semHora ? "" : fmtHora(c.t), cel(c.m), c.min, cel(c.i)].join(" | ") + " |");
      });
      L.push("");
    }
    if (M.descanso.length) {
      L.push("## Descanso", "", "Dias marcados como descanso: " + M.descanso.sort().map(dataIsoBR).join(" \xB7 ") + ".", "");
    }
    if (M.faltas.length) L.push("## Faltas", "", ...M.faltas, "");
    r["treino/historico/" + am + ".md"] = L.join("\n");
  });
  return r;
}
function seriesCsv(b) {
  const linhas = [];
  sessoesMontadas(b).forEach(function(x) {
    const m = x.m;
    x.regs.forEach(function(rg) {
      const l = rg.l, ex = exDe(b, rg.key);
      lista(l.sets).forEach(function(s, i) {
        if (!s) return;
        linhas.push([
          dataLocal(m.t),
          temHora(m) ? fmtHora(m.t) : "",
          m.sid,
          m.day || "",
          m.livre ? m.nome || "avulsa" : nomeDoTreino(b, m.day, m),
          rg.key,
          ex.n,
          ex.g || "",
          i + 1,
          s[0],
          l.u ? "kg" : CARGAS[tipoCarga(b, rg.key)].rot,
          s[1],
          l.u === "m" || l.u === "cal" || l.u === "seg" ? "segundos" : "reps",
          l.u ? l.q != null ? l.q : "" : "",
          l.u || "",
          typeof s[2] === "number" ? s[2] : "",
          m.dl || l.dl ? 1 : 0,
          l.obs || "",
          l.dp ? 1 : 0
        ]);
      });
    });
  });
  return csv([
    "data",
    "hora",
    "sessao",
    "treino",
    "nome_do_treino",
    "exercicio_id",
    "exercicio",
    "grupo",
    "serie",
    "carga",
    "carga_unidade",
    "resultado",
    "resultado_unidade",
    "alvo",
    "alvo_unidade",
    "rir",
    "deload",
    "nota",
    "registrado_depois"
  ], linhas);
}
function cardioCsv(b) {
  const c = lista(b.S.cardio).filter(function(x) {
    return x && numero(x.t) != null;
  }).sort(function(a, x) {
    return a.t - x.t;
  });
  return csv(
    ["data", "hora", "modalidade", "minutos", "intensidade"],
    c.map(function(x) {
      return [dataLocal(x.t), x.semHora ? "" : fmtHora(x.t), x.m, x.min, x.i];
    })
  );
}
function exercicios(b, ctx) {
  const noPrograma = /* @__PURE__ */ new Set();
  b.rot.forEach(function(d) {
    lista((b.prog[d] || { ex: [] }).ex).forEach(function(s) {
      noPrograma.add(s.id);
    });
  });
  const doTreinador = /* @__PURE__ */ new Set();
  Object.keys(b.treinador.dias).forEach(function(d) {
    lista(b.treinador.dias[d].ex).forEach(function(s) {
      doTreinador.add(s.id);
    });
  });
  const logs = obj(b.S.logs);
  const fotos = obj(b.S.fotos);
  const todos = /* @__PURE__ */ new Set([...noPrograma, ...doTreinador, ...Object.keys(logs), ...Object.keys(fotos)]);
  const apelidos = {};
  const ap = obj(b.S.apelidos);
  Object.keys(ap).forEach(function(k) {
    const a = ap[k];
    if (!a || typeof a.id !== "string") return;
    (apelidos[a.id] = apelidos[a.id] || []).push(typeof a.n === "string" && a.n ? a.n : k);
    todos.add(a.id);
  });
  const linha = function(id) {
    const ex = exDe(b, id);
    const h = lista(logs[id]);
    const ultima = h.reduce(function(a, l) {
      return l && l.t > a ? l.t : a;
    }, 0);
    const f = fotos[id];
    const arquivo = f && f.ext ? "aparelhos/" + segmento(id) + "." + segmento(f.ext) : null;
    const sit = arquivo ? situacaoDaFoto("treino/" + arquivo, ctx) : null;
    const foto = !arquivo ? "" : sit ? cel(sit) : "[foto](" + arquivo + ")";
    const medida = ex.u ? { m: "dist\xE2ncia", cal: "calorias", rep: "repeti\xE7\xF5es", seg: "tempo" }[ex.u] : "carga \xD7 reps";
    const outros = (apelidos[id] || []).sort(function(a, c) {
      return a.localeCompare(c, "pt-BR");
    });
    return "| " + [
      cel(ex.n),
      "`" + id + "`",
      cel(ex.g || ""),
      cel(CARGAS[tipoCarga(b, id)].nome),
      medida,
      h.length ? h.length + (ultima ? " (\xFAltima " + dataBR(ultima) + ")" : "") : "\u2014",
      foto,
      outros.length ? cel(outros.map(function(n) {
        return "\u201C" + n + "\u201D";
      }).join(", ")) : ""
    ].join(" | ") + " |";
  };
  const ordem = function(ids) {
    return ids.sort(function(a, c) {
      return nomeEx(b, a).localeCompare(nomeEx(b, c), "pt-BR");
    });
  };
  const cab2 = ["| Exerc\xEDcio | id | Grupo | Carregamento | Mede | Sess\xF5es registradas | Aparelho | Tamb\xE9m chamado de |", "|---|---|---|---|---|---|---|---|"];
  const L = cabeca("Exerc\xEDcios", [
    "Os exerc\xEDcios do programa e todos os que t\xEAm hist\xF3rico. O `id` \xE9 a chave usada em `series.csv`.",
    'Carregamento diz como a carga \xE9 digitada: "anilha por lado" e "barra livre" s\xE3o o peso de UM lado; "halter em cada m\xE3o" \xE9 o de UMA m\xE3o. O app nunca converte.',
    '"Tamb\xE9m chamado de" s\xE3o os apelidos: o nome que o treinador escreveu numa revis\xE3o e que a pessoa disse ser este exerc\xEDcio. O app l\xEA esse nome como este id.'
  ]);
  L.push("## No programa atual", "", ...cab2, ...ordem([...noPrograma]).map(linha), "");
  const fora = ordem([...todos].filter(function(id) {
    return !noPrograma.has(id);
  }));
  if (fora.length) L.push("## Fora do programa atual", "", "Do programa do treinador, de sess\xF5es antigas ou trocados no caminho.", "", ...cab2, ...fora.map(linha), "");
  return L.join("\n");
}
function aulas(b, ctx) {
  const a = lista(b.S.aulas);
  if (!a.length) return null;
  const L = cabeca("Modelos de aula de box", ["Prescri\xE7\xF5es salvas para reaproveitar. Guardam o que foi pedido, nunca o resultado."]);
  a.slice().sort(function(x, y) {
    return String(x.nome).localeCompare(String(y.nome), "pt-BR");
  }).forEach(function(m) {
    L.push("## " + cel(m.nome), "");
    lista(m.mov).forEach(function(v) {
      const alvo = v.u ? (v.q != null ? br(v.q) + " " : "") + { m: "m", cal: "cal", rep: "reps", seg: "s" }[v.u] : v.r || "";
      L.push("- " + nomeEx(b, v.id) + " \u2014 " + v.s + " \xD7 " + alvo + (v.d ? " \xB7 descanso " + fmtDesc(v.d) : ""));
    });
    if (m.quadro) L.push("", "```", m.quadro, "```");
    L.push("");
  });
  return L.join("\n");
}
var QUANDO = { sempre: "todo dia", treino: "s\xF3 em dia de treino", alta: "s\xF3 em dia de alta demanda" };
function planoAlimentar(b, ctx) {
  const S = b.S;
  const comida = obj(S.comida);
  const ajuste = numero(S.ajuste) || 0;
  if (!b.plano.length) return cabeca("Plano alimentar", ["Nenhuma refei\xE7\xE3o no plano."]).join("\n");
  const L = cabeca("Plano alimentar", [
    "O plano que o app usa hoje. Quantidades por por\xE7\xE3o; macros calculados pela tabela de alimentos (`alimentos.csv`)."
  ]);
  if (numero(comida.v)) L.push("- **Plano ou tabela alterados por \xFAltimo em:** " + dataBR(comida.v));
  L.push("- **Ajuste cal\xF3rico em vigor:** " + (ajuste ? (ajuste > 0 ? "+" : "\u2212") + Math.abs(ajuste) + (Math.abs(ajuste) === 1 ? " passo" : " passos") + " (cada passo \u2248 150 kcal, aplicado nos itens de arroz; ver `ajustes.md`)" : "nenhum"));
  L.push("");
  L.push("## Total do dia", "", "| Dia | Total |", "|---|---|");
  L.push("| Treino | " + totaisTexto(totalDoDia(b.plano, b.alimentos, true, false)) + " |");
  L.push("| Descanso | " + totaisTexto(totalDoDia(b.plano, b.alimentos, false, false)) + " |");
  if (b.plano.some(function(r) {
    return r.quando === "alta" || lista(r.itens).some(function(i) {
      return i.alta;
    });
  })) {
    L.push("| Treino de alta demanda | " + totaisTexto(totalDoDia(b.plano, b.alimentos, true, true)) + " |");
  }
  L.push("");
  b.plano.slice().sort(function(a, c) {
    return String(a.t).localeCompare(String(c.t));
  }).forEach(function(r) {
    L.push("## " + r.t + " \xB7 " + r.n + " \u2014 " + (QUANDO[r.quando] || r.quando), "");
    if (r.nota) L.push("_" + cel(r.nota) + "_", "");
    lista(r.itens).forEach(function(i) {
      const a = b.alimentos[i.f];
      const nome = a ? a.n : i.f;
      const u = a ? a.u : "g";
      let q = br(i.q) + " " + u;
      const aj = ajusteNoItem(i);
      if (aj) q += " (" + quantidadePrescrita(i) + " " + u + " prescritos " + (aj > 0 ? "+ " : "\u2212 ") + Math.abs(aj) + " " + u + " do ajuste)";
      const marcas = [];
      if (i.alta) marcas.push("s\xF3 em dia de alta demanda");
      if (i.caf) marcas.push("cafe\xEDna");
      L.push("- " + nome + " \u2014 " + q + (marcas.length ? " \xB7 " + marcas.join(" \xB7 ") : ""));
    });
    L.push("", "Total: " + totaisTexto(totalDaRefeicao(r, b.alimentos, false)), "");
  });
  return L.join("\n");
}
function alimentosCsv(b) {
  const comida = obj(b.S.comida);
  const proprios = obj(comida.alimentos), ocultos = obj(comida.ocultos);
  const usados = /* @__PURE__ */ new Set();
  b.plano.forEach(function(r) {
    lista(r.itens).forEach(function(i) {
      usados.add(i.f);
    });
  });
  const ids = Object.keys(b.alimentos).sort(function(a, c) {
    return String(b.alimentos[a].n).localeCompare(String(b.alimentos[c].n), "pt-BR");
  });
  return csv(
    ["id", "nome", "categoria", "unidade", "kcal_por_100", "proteina_por_100", "carbo_por_100", "gordura_por_100", "no_plano", "cadastrado_por_voce", "oculto"],
    ids.map(function(k) {
      const a = b.alimentos[k];
      return [k, a.n, a.cat, a.u, a.kcal, a.p, a.c, a.g, usados.has(k) ? 1 : 0, a.meu || proprios[k] && !ALIMENTOS_BASE[k] ? 1 : 0, ocultos[k] ? 1 : 0];
    })
  );
}
var COMO = { fora: "fora do plano", nao: "n\xE3o comeu", nsei: "n\xE3o sabe o que comeu" };
var TAMANHO = {
  parecido: "tamanho parecido com o do plano",
  mais: "bem mais que o plano",
  menos: "bem menos que o plano",
  nsei: "tamanho: n\xE3o sabe"
};
function tipoDoDia(b, d, informado) {
  if (b.sessoes.some(function(m) {
    return dataLocal(m.t) === d && !m.livre;
  })) return ["treino", "sess\xE3o registrada"];
  if (informado === "treino" || informado === "descanso") return [informado, "informado no dia"];
  const cad = lista(b.S.cadencia);
  return [cadenciaPrevista(cad.length === 7 ? cad : CADENCIA_PADRAO, instanteDaData(d)), "semana t\xEDpica"];
}
function diasCsv(b) {
  const S = b.S;
  const nomes = {};
  b.plano.forEach(function(r) {
    nomes[r.id] = r.n;
  });
  const refeicoes = function(h) {
    const done = obj(h.done);
    return Object.keys(done).sort(function(a, c) {
      return (done[a] || 0) - (done[c] || 0);
    }).map(function(id) {
      const notas = [];
      const como = obj(h.como)[id];
      if (como && COMO[como]) notas.push(COMO[como]);
      const tam = obj(h.tam)[id];
      if (como === "fora" && tam && TAMANHO[tam]) notas.push(TAMANHO[tam]);
      const e = obj(h.escala)[id];
      if (typeof e === "number" && e !== 1 && como !== "nao") notas.push("por\xE7\xE3o " + Math.round(e * 100) + "%");
      const hora = !h.pordia && numero(done[id]) && done[id] > 1 ? " " + fmtHora(done[id]) : "";
      return (nomes[id] || id) + hora + (notas.length ? " (" + notas.join(", ") + ")" : "");
    }).join(" | ");
  };
  const linhas = [];
  const hist = lista(S.comidaHist).filter(function(h) {
    return h && DATA_ISO.test(h.d);
  });
  const datas = new Set(hist.map(function(h) {
    return h.d;
  }));
  hist.slice().sort(function(a, c) {
    return a.d.localeCompare(c.d);
  }).forEach(function(h) {
    const [tipo, origem] = tipoDoDia(b, h.d, h.cadencia);
    const t = h.tot || { kcal: 0, p: 0, c: 0, g: 0 };
    linhas.push([
      h.d,
      DIAS_CURTOS[new Date(instanteDaData(h.d)).getDay()],
      "fechado",
      tipo,
      origem,
      h.alta ? 1 : 0,
      h.turno || "manha",
      h.aderencia || "plano",
      refeicoes(h),
      h.aguaNaoContada ? "" : h.agua,
      Math.round(t.kcal),
      Math.round(t.p),
      Math.round(t.c),
      Math.round(t.g),
      numero(h.aj) || 0,
      h.pordia ? 1 : 0
    ]);
  });
  const dia = S.dia;
  if (dia && DATA_ISO.test(String(dia.data)) && !datas.has(dia.data)) {
    const [tipo, origem] = tipoDoDia(b, dia.data, dia.cadencia);
    const t = totalRegistrado(b.plano, b.alimentos, Object.assign({ done: {}, escala: {} }, dia), tipo === "treino", !!dia.alta);
    linhas.push([
      dia.data,
      DIAS_CURTOS[new Date(instanteDaData(dia.data)).getDay()],
      "em andamento",
      tipo,
      origem,
      dia.alta ? 1 : 0,
      dia.turno || "manha",
      dia.aderencia || "plano",
      refeicoes(dia),
      dia.aguaNaoContada ? "" : dia.agua,
      Math.round(t.kcal),
      Math.round(t.p),
      Math.round(t.c),
      Math.round(t.g),
      numero(S.ajuste) || 0,
      dia.pordia ? 1 : 0
    ]);
  }
  return csv([
    "data",
    "dia_da_semana",
    "situacao",
    "tipo_de_dia",
    "tipo_de_dia_veio_de",
    "alta_demanda",
    "turno_do_treino",
    "como_foi_o_dia",
    "refeicoes_marcadas",
    "agua_copos",
    "kcal",
    "proteina_g",
    "carbo_g",
    "gordura_g",
    "passos_de_ajuste",
    "respondido_pelo_dia"
  ], linhas);
}
function ajustes(b, ctx) {
  const S = b.S;
  const aj = numero(S.ajuste) || 0;
  const L = cabeca("Ajustes cal\xF3ricos", [
    "Cada passo \xE9 \xB1150 kcal, aplicado nos itens de arroz do plano, e se acumula: depois de um ajuste, a nova ingest\xE3o vira a linha de base.",
    "Cada linha guarda o veredito que motivou o passo, com o texto inteiro."
  ]);
  L.push("**Em vigor agora:** " + (aj ? (aj > 0 ? "+" : "\u2212") + Math.abs(aj) + (Math.abs(aj) === 1 ? " passo" : " passos") : "nenhum passo") + ".", "");
  const h = lista(S.ajusteHist).slice().sort(function(a, c) {
    return a.t - c.t;
  });
  if (!h.length) {
    L.push("Nenhum ajuste aconteceu ainda.", "");
    return L.join("\n");
  }
  h.forEach(function(p) {
    L.push("## " + dataComDia(p.t) + " \u2014 " + (p.k === "mais" ? "mais comida" : "menos comida") + " (" + p.de + " \u2192 " + p.para + ")", "");
    if (numero(p.kde) != null && numero(p.kpara) != null) L.push("- Dia de treino: " + milhar(p.kde) + " \u2192 " + milhar(p.kpara) + " kcal");
    L.push("- Dias com registro de comida nos 14 anteriores: " + p.reg);
    if (p.desfeito) L.push("- **Desfeito em " + dataBR(p.desfeito) + "**");
    L.push("", "> " + cel(p.p), "");
  });
  return L.join("\n");
}
function medidasCsv(b) {
  const body = obj(b.S.body);
  const conhecidas = MEDIDAS_DO_CORPO.map(function(m) {
    return m.k;
  });
  const chaves2 = conhecidas.concat(Object.keys(body).filter(function(k) {
    return conhecidas.indexOf(k) < 0;
  }));
  const linhas = [];
  chaves2.forEach(function(k, ordem) {
    const m = MEDIDAS_DO_CORPO.filter(function(x) {
      return x.k === k;
    })[0];
    lista(body[k]).forEach(function(x) {
      if (!x || numero(x.t) == null || numero(x.v) == null) return;
      linhas.push({ t: x.t, ordem, l: [dataLocal(x.t), x.semHora ? "" : fmtHora(x.t), k, m ? m.n : k, x.v, m ? m.u : "", m && m.bio ? "bioimped\xE2ncia" : m && m.dobra ? "adip\xF4metro" : m && m.fita ? "fita" : "balan\xE7a", x.onde || "", numero(x.n) != null ? x.n : ""] });
    });
  });
  linhas.sort(function(a, c) {
    return a.t - c.t || a.ordem - c.ordem;
  });
  return csv(["data", "hora", "medida", "nome", "valor", "unidade", "aparelho", "onde_mediu", "leituras"], linhas.map(function(x) {
    return x.l;
  }));
}
function ajusteDaFoto(f) {
  const e = f.enq;
  if (!e && f.sug) return "alinhamento sugerido pelo app, ainda n\xE3o aceito";
  if (!e || Math.abs(e.r || 0) < 0.05 && Math.abs((e.z || 1) - 1) < 5e-3 && Math.abs((e.cx ?? 0.5) - 0.5) < 5e-3 && Math.abs((e.cy ?? 0.5) - 0.5) < 5e-3) return "";
  const p = [];
  if (Math.abs(e.r || 0) >= 0.05) p.push("giro " + br(e.r, 1) + "\xB0");
  if (Math.abs((e.z || 1) - 1) >= 5e-3) p.push("zoom " + br(e.z, 2) + "\xD7");
  if (Math.abs((e.cx ?? 0.5) - 0.5) >= 5e-3 || Math.abs((e.cy ?? 0.5) - 0.5) >= 5e-3) p.push("recorte deslocado");
  if (e.auto === 1) p.push("alinhado pelo app");
  return p.join(", ");
}
var CAMERA = { app: "do app", sistema: "do sistema" };
function cameraDaFoto(f) {
  const c = f.cap;
  if (!c) return "";
  const p = [CAMERA[c.via] || ""];
  if (c.lente) p.push(c.lente);
  if (numero(c.mm)) p.push(c.mm + " mm");
  if (typeof c.zoom === "number" && isFinite(c.zoom)) p.push("zoom " + br(c.zoom, 2) + "\xD7");
  if (c.origem) p.push(c.origem === "foto" ? "foto do sensor" : "quadro do v\xEDdeo");
  if (c.modo) p.push(MODO[c.modo] || "");
  if (c.mov && numero(c.mov.seg) != null) p.push(c.mov.seg < APOIADO ? "apoiado" : "na m\xE3o");
  if (c.mov && numero(c.mov.toque) != null && c.mov.toque > TREMOR) p.push("pode ter tremido (" + br(c.mov.toque, 1) + "\xB0/s)");
  if (c.det && typeof c.det.ativa === "boolean") {
    p.push(c.det.ativa ? "altura e dist\xE2ncia medidas pelo app" + (numero(c.det.qps) ? " (" + Math.round(c.det.qps) + " quadros/s)" : "") : "altura e dist\xE2ncia conferidas a olho");
  }
  return p.filter(Boolean).join(" \xB7 ");
}
var MODO = { alguem: "algu\xE9m tirou", sozinho: "sozinho" };
function nivelDaFoto(f) {
  const n = f.cap && f.cap.nivel;
  if (!n || numero(n.lado) == null || numero(n.frente) == null) return "";
  const txt2 = "de lado " + br(n.lado, 1) + "\xB0 \xB7 frente " + br(n.frente, 1) + "\xB0";
  return noNivel(n) ? txt2 : txt2 + " (fora do n\xEDvel)";
}
function padraoDaFoto(f) {
  const NOME = { nivel: "n\xEDvel", altura: "altura", distancia: "dist\xE2ncia", tremida: "pode ter tremido" };
  const fora = lista(f.cap && f.cap.fora).map(function(x) {
    return NOME[x] || x;
  });
  return fora.length ? "fora do padr\xE3o: " + fora.join(", ") : "";
}
function fotosDoCorpo(b, ctx) {
  const S = b.S;
  const proto = obj(S.protocolo);
  const ordem = poses(lista(proto.poses));
  const sessoes = lista(proto.sessoes).filter(function(s) {
    return s && DATA_ISO.test(String(s.d));
  }).slice().sort(function(a, c) {
    return a.d.localeCompare(c.d);
  });
  const L = cabeca("Fotos do corpo", [
    "Uma sess\xE3o de fotos a cada " + CADENCIA_DIAS + " dias, sempre as mesmas poses, no mesmo lugar marcado no ch\xE3o.",
    'Os arquivos s\xE3o as fotos originais. Quando a coluna "Ajuste no app" tem algo, o app mostra a foto girada ou recortada, mas o arquivo n\xE3o muda.',
    "A hora de cada foto importa: luz e hora do dia mudam o que a foto mostra.",
    "Desde " + dataBR(instanteDaData(DESDE_11_POSES)) + ", o protocolo tem " + PROTOCOLO.length + ' poses: entraram "Frente bra\xE7os afastados" e "Perfil m\xE3os na nuca", e "Costas m\xE3os na cintura" passou a ser com as m\xE3os s\xF3 apoiadas, sem beliscar a pele (at\xE9 29/10/2026 ela virou uma pin\xE7a da dobra lombar). Cada sess\xE3o lista s\xF3 as poses do protocolo da data dela: as de antes contam sobre 9.',
    'A coluna "C\xE2mera" diz se a foto saiu da c\xE2mera do app (um quadro do v\xEDdeo, com menos processamento) ou da c\xE2mera do sistema; vazia nas fotos de antes de 03/11/2026. Desde 04/11/2026 ela traz tamb\xE9m a lente: o nome que o aparelho d\xE1 a ela, a focal equivalente em 35 mm (26 mm \xE9 a 1\xD7, 52 mm a 2\xD7) e o zoom, quando o aparelho informa.',
    'Desde 04/11/2026, a c\xE2mera do app tira a foto de verdade do sensor ("foto do sensor" na coluna "C\xE2mera"); quando ela falha, fica um quadro do v\xEDdeo ("quadro do v\xEDdeo"). A foto do sensor tem tamb\xE9m o ORIGINAL, na resolu\xE7\xE3o cheia e sem recompress\xE3o, ao lado da c\xF3pia de 1440 px: `<pose>.original.jpeg`. Ele pode trazer a orienta\xE7\xE3o na etiqueta EXIF em vez de nos pixels. S\xF3 existe quando o celular tinha a conta da nuvem.',
    'A coluna "C\xE2mera" diz tamb\xE9m quem disparou ("algu\xE9m tirou" ou "sozinho"), se o celular estava apoiado ou na m\xE3o (pelo girosc\xF3pio, no segundo antes do toque) e quando a foto pode ter tremido (giro acima de ' + TREMOR + "\xB0/s no toque). S\xF3 na c\xE2mera do app, desde 04/11/2026.",
    'A coluna "N\xEDvel" \xE9 a inclina\xE7\xE3o do celular no disparo, medida pelo sensor (s\xF3 na c\xE2mera do app, desde 04/11/2026): de lado, no plano da tela, e para a frente ou para tr\xE1s. S\xF3 o tamanho, sem o sentido. Est\xE1 no n\xEDvel at\xE9 ' + NIVEL_LADO + "\xB0 de lado e " + NIVEL_FRENTE + '\xB0 para a frente. Foto fora disso s\xF3 \xE9 guardada quando quem fotografa v\xEA o aviso e escolhe registrar assim, e a coluna diz "(fora do n\xEDvel)".'
  ]);
  L.push("## O protocolo", "", "| Pose | Bloco | Giro | O que mostra |", "|---|---|---|---|");
  ordem.forEach(function(p) {
    L.push("| " + [cel(p.n), p.bloco, p.giro + "\xB0", cel(p.revela)].join(" | ") + " |");
  });
  L.push("");
  const lixo = lista(S.lixeira).filter(function(x) {
    return x && DATA_ISO.test(String(x.d));
  });
  if (lixo.length) L.push("Na lixeira do app: " + lixo.length + (lixo.length === 1 ? " foto apagada ou substitu\xEDda" : " fotos apagadas ou substitu\xEDdas") + ". Elas n\xE3o est\xE3o nesta pasta, e saem de vez 30 dias depois de apagadas.", "");
  if (!sessoes.length) L.push("Nenhuma sess\xE3o de fotos ainda.", "");
  sessoes.forEach(function(s) {
    const fotos = obj(s.fotos);
    const daData = posesDaData(s.d, lista(proto.poses));
    const ids = daData.map(function(p) {
      return p.id;
    });
    Object.keys(fotos).forEach(function(id) {
      if (ids.indexOf(id) < 0) ids.push(id);
    });
    const feitas = ids.filter(function(id) {
      return fotos[id];
    });
    L.push("## " + dataIsoBR(s.d) + " \u2014 " + feitas.length + " de " + daData.length + " poses", "");
    if (s.obs) L.push("Nota: " + cel(s.obs), "");
    const MUDA = { luz: "a luz", roupa: "a roupa", lugar: "o lugar" };
    const muda = lista(s.muda).map(function(x) {
      return MUDA[x] || x;
    });
    if (muda.length) L.push("Mudou em rela\xE7\xE3o \xE0 sess\xE3o anterior: " + muda.join(", ") + ". Leve isso em conta ao comparar.", "");
    L.push("| Pose | Hora | C\xE2mera | N\xEDvel | Padr\xE3o | Arquivo | Ajuste no app |", "|---|---|---|---|---|---|---|");
    ids.forEach(function(id) {
      const p = PROTOCOLO.filter(function(x) {
        return x.id === id;
      })[0];
      const f = fotos[id];
      if (!f) {
        L.push("| " + cel(p ? p.n : id) + " | \u2014 | | | | n\xE3o tirada | |");
        return;
      }
      const caminho = "fotos/" + s.d + "/" + segmento(id) + "." + segmento(f.ext);
      const sit = situacaoDaFoto("corpo/" + caminho, ctx);
      L.push("| " + [
        cel(p ? p.n : id),
        numero(f.v) ? fmtHora(f.v) : "",
        cel(cameraDaFoto(f)),
        nivelDaFoto(f),
        padraoDaFoto(f),
        sit ? cel(sit) : "[" + segmento(id) + "." + segmento(f.ext) + "](" + caminho + ")",
        ajusteDaFoto(f)
      ].join(" | ") + " |");
    });
    L.push("");
  });
  const g = lista(S.gordura).filter(function(x) {
    return x && DATA_ISO.test(String(x.d));
  }).slice().sort(function(a, c) {
    return a.d.localeCompare(c.d);
  });
  L.push("## Gordura visual", "", 'A pergunta do nutricionista no fechamento: "comparando com 2 semanas atr\xE1s, a gordura visual aumentou claramente?"', "");
  if (!g.length) L.push("Nenhuma resposta ainda.", "");
  else {
    L.push("| Sess\xE3o | Comparada com | Aumentou claramente? | Respondido em |", "|---|---|---|---|");
    const V = { sim: "sim", nao: "n\xE3o", incerto: "incerto" };
    g.forEach(function(x) {
      L.push("| " + [dataIsoBR(x.d), DATA_ISO.test(String(x.de)) ? dataIsoBR(x.de) : "", V[x.v] || x.v, numero(x.t) ? dataBR(x.t) : ""].join(" | ") + " |");
    });
    L.push("");
  }
  return L.join("\n");
}
function paraAvaliar(b, ctx) {
  const S = b.S;
  const pedidos = lista(S.paraAvaliar).filter(function(p) {
    return p && DATA_ISO.test(String(p.de)) && DATA_ISO.test(String(p.ate));
  }).slice().sort(function(a, c) {
    return (c.t || 0) - (a.t || 0);
  });
  if (!pedidos.length) return null;
  const proto = obj(S.protocolo);
  const sessoes = lista(proto.sessoes);
  const body = obj(S.body);
  const L = cabeca("Pedidos de avalia\xE7\xE3o das fotos", [
    "O que ele mandou os agentes olharem, pela compara\xE7\xE3o de fotos do app. O mais recente primeiro.",
    "Cada pedido \xE9 um par de sess\xF5es: a mesma pose (ou as " + PROTOCOLO.length + ") em duas datas. O peso e a cintura s\xE3o a m\xE9dia da semana de cada sess\xE3o.",
    "A ressalva diz o que mudou entre uma sess\xE3o e a anterior (luz, roupa, lugar) e as fotos que sa\xEDram fora do padr\xE3o: elas valem, mas a compara\xE7\xE3o deve levar isso em conta. O detalhe de cada foto est\xE1 em fotos.md."
  ]);
  pedidos.forEach(function(p) {
    const dias = Math.round((instanteDaData(p.ate) - instanteDaData(p.de)) / 864e5);
    const pose = p.pose === "todas" ? null : PROTOCOLO.filter(function(x) {
      return x.id === p.pose;
    })[0];
    L.push("## " + dataIsoBR(p.de) + " \u2192 " + dataIsoBR(p.ate) + " \xB7 " + (pose ? pose.n : "as " + PROTOCOLO.length + " poses"), "");
    L.push("Mandado em " + (numero(p.t) ? momento(p.t) : "\u2014") + ". " + qtd(dias, "dia", "dias") + " entre as duas.", "");
    L.push("| Sess\xE3o | Peso (semana) | Cintura (semana) | Ressalva | Arquivos |", "|---|---|---|---|---|");
    [p.de, p.ate].forEach(function(d) {
      const s = sessoes.filter(function(x) {
        return x && x.d === d;
      })[0];
      const peso = mediaDaSemana(body.peso, d), cint = mediaDaSemana(body.cintura, d);
      const fotos = s ? obj(s.fotos) : {};
      const ids = pose ? [pose.id] : Object.keys(fotos);
      const arquivos = ids.filter(function(id) {
        return fotos[id];
      }).map(function(id) {
        const caminho = "fotos/" + d + "/" + segmento(id) + "." + segmento(fotos[id].ext);
        const sit = situacaoDaFoto("corpo/" + caminho, ctx);
        return sit ? segmento(id) + " (" + sit + ")" : "[" + segmento(id) + "](" + caminho + ")";
      });
      L.push("| " + [
        dataIsoBR(d),
        peso == null ? "sem medida" : br(peso, 1) + " kg",
        cint == null ? "sem medida" : br(cint, 1) + " cm",
        s ? seloDaSessao(ressalvaDaSessao(s)) : "sess\xE3o n\xE3o existe mais",
        arquivos.length ? arquivos.join(", ") : "sem foto"
      ].join(" | ") + " |");
    });
    L.push("");
  });
  return L.join("\n");
}
function qtd(n, um, varios) {
  return n + " " + (n === 1 ? um : varios);
}
function resumo(b) {
  const S = b.S, L = [];
  const sess = b.sessoes;
  if (sess.length) {
    const u = sess[sess.length - 1];
    L.push("- **Treino:** " + qtd(sess.length, "sess\xE3o registrada", "sess\xF5es registradas") + ", de " + dataBR(sess[0].t) + " a " + dataBR(u.t) + ". \xDAltima: " + dataComDia(u.t) + ", " + (u.livre ? u.nome || "avulsa" : u.day + (nomeDoTreino(b, u.day, u) ? " (" + nomeDoTreino(b, u.day, u) + ")" : "")) + ".");
  } else L.push("- **Treino:** nenhuma sess\xE3o registrada.");
  const hist = lista(S.comidaHist).filter(function(h) {
    return h && DATA_ISO.test(h.d);
  }).map(function(h) {
    return h.d;
  }).sort();
  L.push("- **Comida:** " + (hist.length ? hist.length + " dias fechados, de " + dataIsoBR(hist[0]) + " a " + dataIsoBR(hist[hist.length - 1]) + "." : "nenhum dia fechado ainda.") + " Ajuste em vigor: " + (numero(S.ajuste) ? (S.ajuste > 0 ? "+" : "\u2212") + qtd(Math.abs(S.ajuste), "passo", "passos") + "." : "nenhum."));
  const body = obj(S.body);
  const ultimas = ["peso", "cintura", "bioGorduraPct"].map(function(k) {
    const m = MEDIDAS_DO_CORPO.filter(function(x2) {
      return x2.k === k;
    })[0];
    const l = lista(body[k]).filter(function(x2) {
      return x2 && numero(x2.t) != null && numero(x2.v) != null;
    }).sort(function(a, c) {
      return a.t - c.t;
    });
    const x = l[l.length - 1];
    return x && m ? m.n + " " + br(x.v, 2) + " " + m.u + " em " + dataBR(x.t) : null;
  }).filter(Boolean);
  L.push("- **Corpo:** " + (ultimas.length ? "\xFAltima medida de " + ultimas.join("; ") + "." : "nenhuma medida ainda."));
  const fs = lista(obj(S.protocolo).sessoes).filter(function(s) {
    return s && DATA_ISO.test(String(s.d));
  }).map(function(s) {
    return s.d;
  }).sort();
  L.push("- **Fotos do corpo:** " + (fs.length ? qtd(fs.length, "sess\xE3o", "sess\xF5es") + ", a \xFAltima em " + dataIsoBR(fs[fs.length - 1]) + "." : "nenhuma sess\xE3o ainda."));
  return L;
}
var MAPA = [
  ["treino/programa.md", "O programa que o app executa hoje: rota\xE7\xE3o, exerc\xEDcios, s\xE9ries, repeti\xE7\xF5es, RIR e descanso."],
  ["treino/programa-do-treinador.md", "O programa como o treinador prescreveu. O atual pode ter divergido dele."],
  ["treino/programas.md", 'Todos os programas: o ativo, os de "Pr\xF3ximo" e os guardados, com per\xEDodo, treinos e sess\xF5es feitas em cada um.'],
  ["treino/mudancas.md", "Decis\xF5es registradas sobre o programa, e as mudan\xE7as que esperam decis\xE3o."],
  ["treino/historico/AAAA-MM.md", "Um arquivo por m\xEAs: cada sess\xE3o, exerc\xEDcio por exerc\xEDcio, s\xE9rie por s\xE9rie, com notas, dor, cardio, descanso e faltas."],
  ["treino/series.csv", "Todas as s\xE9ries numa tabela s\xF3, para calcular tend\xEAncia, volume e carga."],
  ["treino/cardio.csv", "As sess\xF5es de cardio."],
  ["treino/exercicios.md", "Cada exerc\xEDcio: grupo muscular, como a carga \xE9 digitada, quantas sess\xF5es, foto do aparelho."],
  ["treino/aulas-de-box.md", "Os modelos de aula de box salvos (s\xF3 existe se houver algum)."],
  ["treino/aparelhos/", "Fotos dos aparelhos da academia, pelo id do exerc\xEDcio."],
  ["nutricao/plano.md", "O plano alimentar: refei\xE7\xF5es, hor\xE1rios, itens, quantidades e totais."],
  ["nutricao/dias.csv", "Um dia por linha: refei\xE7\xF5es marcadas e a hora de cada uma, \xE1gua, como foi o dia, totais."],
  ["nutricao/ajustes.md", "Cada ajuste cal\xF3rico que aconteceu, com o veredito que o motivou."],
  ["nutricao/alimentos.csv", "A tabela de alimentos: macros por 100 g ou 100 ml."],
  ["corpo/medidas.csv", "Peso, bioimped\xE2ncia, medidas com fita e dobras com adip\xF4metro, uma medida por linha."],
  ["corpo/fotos.md", "O protocolo de fotos (11 poses desde 06/11/2026; antes, 9), cada sess\xE3o com a hora de cada foto, e as respostas sobre gordura visual."],
  ["corpo/fotos/AAAA-MM-DD/", "As fotos de cada sess\xE3o, uma por pose."],
  ["corpo/para-avaliar.md", "Os pares de fotos que ele mandou os agentes olharem, com peso, cintura e ressalva de cada sess\xE3o (s\xF3 existe se houver algum)."],
  ["bruto/estado.json", "O estado inteiro do app, sem tratamento. Para o que n\xE3o coube nos arquivos acima."]
];
function leiaMe(b, ctx, existentes) {
  const L = ["# Lastro \u2014 seus dados", ""];
  L.push("C\xF3pia de leitura dos dados do app Lastro, organizada por assunto para ser lida por pessoas e por agentes (treinador, nutricionista).", "");
  L.push("- **Atualizada em:** " + momento(ctx.agora));
  if (ctx.gravadoEm) L.push("- **Dados gravados na nuvem pela \xFAltima vez em:** " + momento(ctx.gravadoEm) + " (o que foi registrado no celular depois disso s\xF3 aparece ap\xF3s sincronizar l\xE1 e atualizar aqui)");
  if (ctx.origem) L.push("- **Veio de:** " + ctx.origem);
  if (ctx.conta) L.push("- **Conta:** " + ctx.conta);
  if (numero(b.S.plano)) L.push("- **Vers\xE3o do formato dos dados:** " + b.S.plano);
  L.push("", "> Esta pasta \xE9 gerada. N\xE3o edite nada aqui dentro: a pr\xF3xima atualiza\xE7\xE3o sobrescreve. Para guardar anota\xE7\xF5es suas, use outra pasta.", "");
  L.push("## Resumo", "", ...resumo(b), "");
  L.push("## O que tem aqui", "", "| Caminho | O que responde |", "|---|---|");
  MAPA.forEach(function(x) {
    const corte = x[0].indexOf("AAAA");
    const prefixo = corte >= 0 ? x[0].slice(0, corte) : x[0].slice(-1) === "/" ? x[0] : null;
    const presente = prefixo ? Array.from(existentes).some(function(c) {
      return c.indexOf(prefixo) === 0;
    }) : existentes.has(x[0]);
    if (presente) L.push("| `" + x[0] + "` | " + x[1] + " |");
  });
  L.push("");
  L.push("## Como ler", "");
  L.push("- **Datas e horas** est\xE3o no fuso deste computador. Nos CSV, datas no formato AAAA-MM-DD.");
  L.push("- **CSV:** v\xEDrgula separa os campos, ponto separa os decimais, UTF-8. A primeira linha \xE9 o cabe\xE7alho.");
  L.push("- **S\xE9rie de muscula\xE7\xE3o:** `carga \xD7 repeti\xE7\xF5es (RIR n)`. RIR \xE9 quantas repeti\xE7\xF5es sobraram antes da falha. S\xE9ries antigas podem n\xE3o ter RIR.");
  L.push('- **Carga:** \xE9 o n\xFAmero digitado, sem convers\xE3o. "kg/lado" \xE9 o peso de UM lado (sem a barra); em halteres, o de UMA m\xE3o; "+kg" \xE9 o que foi somado ao peso do corpo; "ajuda" \xE9 o contrapeso da m\xE1quina assistida (menos \xE9 mais for\xE7a). Ver `treino/exercicios.md`.');
  L.push("- **Movimentos medidos por dist\xE2ncia ou caloria** (remo, corrida, sled): o resultado \xE9 o TEMPO, e menos \xE9 melhor. Por repeti\xE7\xE3o ou tempo (wall ball, prancha): o resultado \xE9 QUANTO saiu, e mais \xE9 melhor.");
  L.push("- **Hora do treino** s\xF3 aparece quando \xE9 confi\xE1vel (o hist\xF3rico pode dizer s\xF3 o turno e a coluna de hora fica vazia).");
  L.push('- **Totais de comida** de dias fechados foram congelados no fechamento, contra o plano daquela data: mudar o plano depois n\xE3o reescreve o passado. Refei\xE7\xE3o marcada "fora do plano" ou "n\xE3o sabe" entra com os n\xFAmeros do plano; "n\xE3o comeu" n\xE3o entra.');
  L.push('- **O tamanho da refei\xE7\xE3o fora do plano.** Desde novembro de 2026, quem marca "comi outra coisa" diz o tamanho comparado ao da refei\xE7\xE3o do plano, sem pesar: parecido, bem mais, bem menos ou n\xE3o sabe. Aparece entre par\xEAnteses em `refeicoes_marcadas`. \xC9 o que a pessoa disse, n\xE3o uma medida, e n\xE3o muda os totais: eles continuam com os n\xFAmeros do plano. Marca sem tamanho \xE9 de antes, ou veio do "p\xF4r o dia em dia", que n\xE3o pergunta.');
  L.push('- **Registro por exce\xE7\xE3o.** Desde novembro de 2026 o app deixa responder o dia inteiro de uma vez ("a comida foi como o plano?": sim, quase, n\xE3o lembro). Esses dias t\xEAm `respondido_pelo_dia` = 1 em `dias.csv`: as refei\xE7\xF5es aparecem sem hora, porque a hora da marca \xE9 a da resposta. "Quase" \xE9 `como_foi_o_dia` = fora; "n\xE3o lembro" \xE9 perdido, e o dia n\xE3o conta para a regra.');
  L.push('- **A revis\xE3o do treinador entra mudan\xE7a por mudan\xE7a** (desde novembro de 2026). `programa-do-treinador.md` \xE9 a revis\xE3o inteira, como ele mandou; a pessoa escolhe quais mudan\xE7as entram no programa dela (`programa.md`). O que ela deixou de fora aparece em `mudancas.md`, na linha da revis\xE3o, depois de "Ficou de fora:". As mudan\xE7as que ela j\xE1 tinha feito e a revis\xE3o n\xE3o tocou continuam no programa dela.');
  L.push("- **S\xE9ries registradas depois** (`registrado_depois` = 1 em `series.csv`): a pessoa treinou, n\xE3o anotou na hora e marcou depois, repetindo a \xFAltima sess\xE3o, seguindo a prescri\xE7\xE3o ou ajustando os n\xFAmeros. Contam como as outras.");
  L.push('- **Fotos fora do padr\xE3o** (coluna "Padr\xE3o" em `fotos.md`): a pessoa tirou mesmo sem acertar o que est\xE1 escrito ali. A linha "Mudou em rela\xE7\xE3o \xE0 sess\xE3o anterior" diz se a luz, a roupa ou o lugar mudaram.');
  L.push("- **\xC1gua** em copos; vazio quando ele marcou que n\xE3o contou (\xE9 diferente de zero).");
  L.push("- **Medidas com fita** (`medidas.csv`): quando a medida \xE9 de um lado s\xF3, \xE9 sempre o direito. `onde_mediu` \xE9 o ponto onde a fita passou; o app preenche com o ponto padr\xE3o de cada medida, e a pessoa pode trocar.");
  L.push("- **Dobras** (`dobraAbdominal`, `dobraSuprailiaca`, `dobraCoxa`): adip\xF4metro, lado direito, em mm. O valor \xE9 a leitura do meio de tr\xEAs. Nunca convertidas para percentual de gordura.");
  L.push("- **`leituras`** em `medidas.csv`: quantas passadas da fita deram o valor (a m\xE9dia delas). 1 quer dizer que a segunda leitura foi pedida e n\xE3o foi feita: a medida \xE9 menos confi\xE1vel. Vazio nas medidas de antes de novembro de 2026.");
  L.push("- **Hora vazia** em `medidas.csv` quer dizer que a hora n\xE3o foi informada (leitura lan\xE7ada depois, s\xF3 com a data).");
  L.push("- **Peso** (`peso`) \xE9 a pesagem da manh\xE3 na balan\xE7a comum; `bioPeso` \xE9 o da balan\xE7a de bioimped\xE2ncia. S\xE3o aparelhos e hor\xE1rios diferentes, e nenhum corrige o outro.");
  L.push("");
  L.push("## O que n\xE3o est\xE1 aqui", "");
  L.push("- A foto da lousa das aulas de box: fica s\xF3 no aparelho onde foi tirada.");
  L.push("- O que foi registrado num aparelho que ainda n\xE3o sincronizou.");
  if (ctx.semDownload) L.push("- **As fotos:** esta pasta foi gerada a partir de um arquivo de c\xF3pia, que n\xE3o leva fotos. Atualize pela conta para baix\xE1-las.");
  L.push("");
  return L.join("\n");
}
function montaArquivos(estado, ctx) {
  const S = obj(estado);
  const b = base(S);
  const corpo = {
    "treino/programa.md": programaAtual(b, ctx),
    "treino/programa-do-treinador.md": programaDoTreinador(b, ctx),
    "treino/mudancas.md": mudancas(b, ctx),
    ...historicoPorMes(b),
    "treino/series.csv": seriesCsv(b),
    "treino/cardio.csv": cardioCsv(b),
    "treino/exercicios.md": exercicios(b, ctx)
  };
  const a = aulas(b, ctx);
  if (a) corpo["treino/aulas-de-box.md"] = a;
  const pr = programas(b, ctx);
  if (pr) corpo["treino/programas.md"] = pr;
  Object.assign(corpo, {
    "nutricao/plano.md": planoAlimentar(b, ctx),
    "nutricao/dias.csv": diasCsv(b),
    "nutricao/ajustes.md": ajustes(b, ctx),
    "nutricao/alimentos.csv": alimentosCsv(b),
    "corpo/medidas.csv": medidasCsv(b),
    "corpo/fotos.md": fotosDoCorpo(b, ctx),
    "bruto/estado.json": JSON.stringify(S, null, 2) + "\n"
  });
  const pa = paraAvaliar(b, ctx);
  if (pa) corpo["corpo/para-avaliar.md"] = pa;
  const existentes = new Set(Object.keys(corpo).concat(fotosDoEstado(S).map(function(f) {
    return f.caminho;
  })));
  const r = { "LEIA-ME.md": leiaMe(b, ctx, existentes) };
  return Object.assign(r, corpo);
}

// src/mcp/ferramentas.ts
var TETO = 24e3;
function corta(t, dica) {
  if (t.length <= TETO) return t;
  const linhas = t.split("\n");
  const out = [];
  let n = 0;
  for (const l of linhas) {
    if (n + l.length + 1 > TETO) break;
    out.push(l);
    n += l.length + 1;
  }
  return out.join("\n") + "\n\n[cortado: " + (linhas.length - out.length) + " linhas a mais. " + dica + "]";
}
function texto(v) {
  return typeof v === "string" ? v.trim() : "";
}
function inteiro(v, padrao, max) {
  const n = typeof v === "number" ? Math.floor(v) : padrao;
  return Math.max(1, Math.min(max, isFinite(n) ? n : padrao));
}
function semAcento(s) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}
function filtraCsv(csv2, args, campoTexto, padrao) {
  const linhas = csv2.trim().split("\n");
  const cab2 = linhas.shift() || "";
  const busca = semAcento(texto(args[campoTexto]));
  const desde = texto(args.desde);
  const limite = inteiro(args.limite, padrao, 2e3);
  let corpo = linhas;
  if (busca) corpo = corpo.filter((l) => semAcento(l).indexOf(busca) >= 0);
  if (/^\d{4}-\d{2}-\d{2}$/.test(desde)) corpo = corpo.filter((l) => l.slice(0, 10) >= desde);
  const total = corpo.length;
  corpo = corpo.slice(-limite);
  const nota = total > corpo.length ? "\n[mostrando as " + corpo.length + " mais recentes de " + total + '; use "desde" ou "limite"]' : "";
  return [cab2].concat(corpo).join("\n") + nota;
}
var SEM_ENTRADA = { type: "object", properties: {}, additionalProperties: false };
var DESDE = { type: "string", description: "data inicial, AAAA-MM-DD" };
var LIMITE = { type: "integer", minimum: 1, maximum: 2e3, description: "quantas linhas, as mais recentes" };
var FERRAMENTAS = {
  resumo: {
    nome: "resumo",
    titulo: "Resumo do Lastro",
    descricao: "O panorama da pessoa: o que existe no app, os n\xFAmeros principais e o que est\xE1 pendente de avalia\xE7\xE3o. Comece por aqui.",
    entrada: SEM_ENTRADA,
    roda: (a) => corta([a["LEIA-ME.md"], a["corpo/para-avaliar.md"]].filter(Boolean).join("\n\n"), "pe\xE7a uma ferramenta espec\xEDfica")
  },
  programa: {
    nome: "programa",
    titulo: "Programa de treino",
    descricao: "O programa ativo (treinos, exerc\xEDcios, s\xE9ries, repeti\xE7\xF5es, RIR, descanso) e a lista dos programas guardados. Com treinador=true, inclui o programa como o treinador prescreveu.",
    entrada: { type: "object", properties: { treinador: { type: "boolean", description: "incluir o programa do treinador" } }, additionalProperties: false },
    roda: (a, args) => corta([a["treino/programa.md"], a["treino/programas.md"], args.treinador === true ? a["treino/programa-do-treinador.md"] : ""].filter(Boolean).join("\n\n"), "pe\xE7a sem treinador=true")
  },
  mudancas: {
    nome: "mudancas",
    titulo: "Mudan\xE7as no programa",
    descricao: "As decis\xF5es registradas no programa: revis\xF5es do treinador e ajustes da pessoa, com data.",
    entrada: SEM_ENTRADA,
    roda: (a) => corta(a["treino/mudancas.md"] || "", "\xE9 o hist\xF3rico inteiro")
  },
  historico: {
    nome: "historico",
    titulo: "Hist\xF3rico de treinos do m\xEAs",
    descricao: 'As sess\xF5es de um m\xEAs: treino feito, s\xE9ries com carga e repeti\xE7\xF5es, dores, descanso, falta e cardio. Sem "mes", o m\xEAs mais recente.',
    entrada: { type: "object", properties: { mes: { type: "string", description: "AAAA-MM" } }, additionalProperties: false },
    roda: (a, args) => {
      const meses = Object.keys(a).map((k) => (k.match(/^treino\/historico\/(\d{4}-\d{2})\.md$/) || [])[1]).filter(Boolean).sort();
      if (!meses.length) return "Nenhuma sess\xE3o registrada ainda.";
      const pedido = texto(args.mes);
      const mes = meses.indexOf(pedido) >= 0 ? pedido : meses[meses.length - 1];
      const aviso = pedido && pedido !== mes ? "N\xE3o h\xE1 registro em " + pedido + ". " : "";
      return corta(aviso + "Meses com registro: " + meses.join(", ") + ".\n\n" + a["treino/historico/" + mes + ".md"], 'o m\xEAs tem mais; pe\xE7a "series" filtrando por exerc\xEDcio');
    }
  },
  series: {
    nome: "series",
    titulo: "S\xE9ries registradas",
    descricao: "Tabela das s\xE9ries (data, treino, exerc\xEDcio, carga, repeti\xE7\xF5es, RIR), uma por linha. Filtre por exerc\xEDcio e data.",
    entrada: { type: "object", properties: { exercicio: { type: "string", description: "trecho do nome" }, desde: DESDE, limite: LIMITE }, additionalProperties: false },
    roda: (a, args) => corta(filtraCsv(a["treino/series.csv"] || "", args, "exercicio", 300), 'use "desde" ou "limite"')
  },
  exercicios: {
    nome: "exercicios",
    titulo: "Exerc\xEDcios e cargas",
    descricao: "Cada exerc\xEDcio do programa com a \xFAltima carga, a melhor marca e o tipo de carga (por lado, total, halteres).",
    entrada: SEM_ENTRADA,
    roda: (a) => corta(a["treino/exercicios.md"] || "", "\xE9 a lista inteira")
  },
  cardio: {
    nome: "cardio",
    titulo: "Cardio",
    descricao: "Os registros de cardio (data, aparelho, minutos, intensidade).",
    entrada: { type: "object", properties: { desde: DESDE, limite: LIMITE }, additionalProperties: false },
    roda: (a, args) => corta(filtraCsv(a["treino/cardio.csv"] || "", args, "_", 200), 'use "desde"')
  },
  plano_alimentar: {
    nome: "plano_alimentar",
    titulo: "Plano alimentar",
    descricao: "O plano alimentar do app (refei\xE7\xF5es, por\xE7\xF5es, regras) e os ajustes registrados.",
    entrada: SEM_ENTRADA,
    roda: (a) => corta([a["nutricao/plano.md"], a["nutricao/ajustes.md"]].filter(Boolean).join("\n\n"), "\xE9 o plano inteiro")
  },
  dias_de_comida: {
    nome: "dias_de_comida",
    titulo: "Dias de comida",
    descricao: "Um dia por linha: o que foi marcado de cada refei\xE7\xE3o, \xE1gua, escala e o tipo do dia.",
    entrada: { type: "object", properties: { desde: DESDE, limite: LIMITE }, additionalProperties: false },
    roda: (a, args) => corta(filtraCsv(a["nutricao/dias.csv"] || "", args, "_", 60), 'use "desde"')
  },
  alimentos: {
    nome: "alimentos",
    titulo: "Alimentos do plano",
    descricao: "A tabela dos alimentos do plano, com por\xE7\xE3o e macros.",
    entrada: SEM_ENTRADA,
    roda: (a) => corta(a["nutricao/alimentos.csv"] || "", "\xE9 a tabela inteira")
  },
  corpo: {
    nome: "corpo",
    titulo: "Peso, medidas e fotos",
    descricao: "Peso e medidas ao longo do tempo e a lista das fotos de acompanhamento (refer\xEAncias, n\xE3o as imagens).",
    entrada: SEM_ENTRADA,
    roda: (a) => corta([a["corpo/medidas.csv"], a["corpo/fotos.md"]].filter(Boolean).join("\n\n"), "pe\xE7a de novo mais tarde")
  },
  catalogo: {
    nome: "catalogo",
    titulo: "Cat\xE1logo de exerc\xEDcios",
    descricao: "Busca no cat\xE1logo do sistema por nome (inclui nomes alternativos) ou m\xFAsculo. Devolve o id est\xE1vel de cada exerc\xEDcio.",
    entrada: { type: "object", properties: { busca: { type: "string", description: "trecho do nome" }, musculo: { type: "string" }, limite: { type: "integer", minimum: 1, maximum: 100 } }, additionalProperties: false },
    roda: (_a, args) => {
      const b = semAcento(texto(args.busca)), m = semAcento(texto(args.musculo));
      const limite = inteiro(args.limite, 30, 100);
      const achados = Object.values(SEMENTE.ex).filter((e) => (!b || semAcento([e.n].concat(e.alt).join(" | ")).indexOf(b) >= 0) && (!m || e.mus.some((x) => semAcento(x[0]).indexOf(m) >= 0)));
      if (!achados.length) return "Nada no cat\xE1logo com isso.";
      return achados.slice(0, limite).map((e) => "- " + e.id + " \xB7 " + e.n + (e.alt.length ? " (tamb\xE9m: " + e.alt.join(", ") + ")" : "") + " \xB7 m\xFAsculos: " + (e.mus.map((x) => x[0] + " " + x[1]).join(", ") || "\u2014") + " \xB7 carga: " + e.car + " \xB7 equipamento: " + e.eq).join("\n") + (achados.length > limite ? "\n[mais " + (achados.length - limite) + "; refine a busca]" : "");
    }
  }
};
var PAPEIS = {
  treinador: {
    id: "treinador",
    nome: "Treinador",
    descricao: "L\xEA o treino: programa, hist\xF3rico e s\xE9ries, cargas, cardio, dores, peso, medidas e fotos. S\xF3 l\xEA.",
    ferramentas: ["programa", "mudancas", "historico", "series", "exercicios", "cardio", "corpo", "catalogo"]
  },
  nutricionista: {
    id: "nutricionista",
    nome: "Nutricionista",
    descricao: "L\xEA a comida: plano alimentar, dias marcados, alimentos, peso, medidas e fotos. S\xF3 l\xEA.",
    ferramentas: ["plano_alimentar", "dias_de_comida", "alimentos", "corpo"]
  },
  assistente: {
    id: "assistente",
    nome: "Assistente",
    descricao: "V\xEA o todo em resumo: o panorama, o programa, o plano alimentar e o corpo. S\xF3 l\xEA.",
    ferramentas: ["resumo", "programa", "mudancas", "plano_alimentar", "corpo"]
  }
};
function ehPapel(x) {
  return x === "treinador" || x === "nutricionista" || x === "assistente";
}
function arquivosDoEstado(estado, agora) {
  return montaArquivos(estado, { agora, origem: "nuvem" });
}

// src/mcp/servidor.ts
var VERSOES = ["2026-07-28", "2025-11-25", "2025-06-18", "2025-03-26"];
var VERSAO_PADRAO = "2025-06-18";
var VERSAO_DO_SERVIDOR = "1.0.0";
function resumoDoPedido(args) {
  const partes = Object.keys(args).filter((k) => args[k] != null && args[k] !== "").map((k) => k + ": " + String(args[k]).slice(0, 40));
  return partes.join(", ").slice(0, 200);
}
var CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type, Accept, MCP-Protocol-Version, Mcp-Session-Id",
  "Access-Control-Expose-Headers": "WWW-Authenticate, MCP-Protocol-Version"
};
function json(corpo, status = 200, extra = {}) {
  return new Response(JSON.stringify(corpo), { status, headers: { "Content-Type": "application/json; charset=utf-8", ...CORS, ...extra } });
}
function metadadoDaPorta(d) {
  return {
    resource: d.urlDaPorta,
    authorization_servers: [d.servidorDeAutorizacao],
    bearer_methods_supported: ["header"],
    scopes_supported: ["email"],
    resource_name: "Lastro \xB7 " + PAPEIS[d.papel].nome
  };
}
function naoAutorizado(d, motivo) {
  return json({ error: "invalid_token", error_description: motivo }, 401, {
    "WWW-Authenticate": 'Bearer resource_metadata="' + d.urlDoMetadado + '", error="invalid_token"'
  });
}
function erro(id, code, message) {
  return { jsonrpc: "2.0", id: id ?? null, error: { code, message } };
}
function ok(id, result) {
  return { jsonrpc: "2.0", id, result };
}
function listaDeFerramentas(papel) {
  return PAPEIS[papel].ferramentas.map((n) => {
    const f = FERRAMENTAS[n];
    return {
      name: f.nome,
      title: f.titulo,
      description: f.descricao,
      inputSchema: f.entrada,
      annotations: { title: f.titulo, readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
    };
  });
}
async function responde(p, d, token, versao, quem) {
  const temId = p.id !== void 0 && p.id !== null;
  if (typeof p.method !== "string") return temId ? erro(p.id, -32600, "pedido inv\xE1lido") : null;
  if (!temId) return null;
  switch (p.method) {
    case "initialize": {
      const pedida = typeof p.params?.protocolVersion === "string" ? p.params.protocolVersion : "";
      return ok(p.id, {
        protocolVersion: VERSOES.indexOf(pedida) >= 0 ? pedida : VERSAO_PADRAO,
        capabilities: { tools: { listChanged: false } },
        serverInfo: { name: "lastro-" + d.papel, title: "Lastro \xB7 " + PAPEIS[d.papel].nome, version: VERSAO_DO_SERVIDOR },
        instructions: PAPEIS[d.papel].descricao + " Comece pela primeira ferramenta da lista. Os n\xFAmeros s\xE3o do app da pessoa; n\xE3o invente o que n\xE3o estiver l\xE1."
      });
    }
    case "ping":
      return ok(p.id, {});
    case "tools/list":
      return ok(p.id, { tools: listaDeFerramentas(d.papel) });
    case "tools/call": {
      const nome = typeof p.params?.name === "string" ? p.params.name : "";
      if (PAPEIS[d.papel].ferramentas.indexOf(nome) < 0) return erro(p.id, -32602, "ferramenta desconhecida nesta porta: " + nome);
      const args = p.params?.arguments && typeof p.params.arguments === "object" ? p.params.arguments : {};
      let ligado = true;
      if (d.papelLigado) {
        try {
          ligado = await d.papelLigado(token, d.papel);
        } catch {
          ligado = true;
        }
      }
      if (!ligado) return ok(p.id, { content: [{ type: "text", text: "A pessoa desligou o acesso do " + PAPEIS[d.papel].nome.toLowerCase() + " em Ajustes \u203A Agentes, no app. Pe\xE7a para ela ligar de novo se precisar ler." }], isError: true });
      let estado;
      try {
        estado = await d.lerEstado(token);
      } catch (e) {
        return ok(p.id, { content: [{ type: "text", text: "N\xE3o deu para ler o Lastro agora (" + String(e?.message || e) + "). Tente de novo em instantes." }], isError: true });
      }
      if (estado == null) return ok(p.id, { content: [{ type: "text", text: "Esta conta ainda n\xE3o tem nada salvo no Lastro." }], isError: false });
      const arq = arquivosDoEstado(estado, (d.agora || Date.now)());
      const texto2 = FERRAMENTAS[nome].roda(arq, args);
      if (d.registra) {
        const cliente = typeof quem.client_id === "string" ? quem.client_id : null;
        try {
          await d.registra(token, { papel: d.papel, ferramenta: nome, resumo: resumoDoPedido(args), cliente });
        } catch {
        }
      }
      return ok(p.id, { content: [{ type: "text", text: texto2 }], isError: false });
    }
    default:
      void versao;
      return erro(p.id, -32601, "m\xE9todo n\xE3o suportado: " + p.method);
  }
}
async function atende(req, d) {
  const url = new URL(req.url);
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
  if (req.method === "GET" && url.searchParams.has("metadado")) return json(metadadoDaPorta(d), 200, { "Cache-Control": "public, max-age=300" });
  if (req.method !== "POST") return json({ error: "use POST" }, 405, { Allow: "POST, OPTIONS" });
  const m = /^Bearer\s+(.+)$/i.exec(req.headers.get("authorization") || "");
  if (!m) return naoAutorizado(d, "falta o token");
  const token = m[1].trim();
  const quem = await d.confere(token);
  if (!quem) return naoAutorizado(d, "token inv\xE1lido ou vencido");
  const versao = req.headers.get("mcp-protocol-version") || "";
  if (versao && VERSOES.indexOf(versao) < 0) return json(erro(null, -32600, "vers\xE3o do protocolo n\xE3o suportada: " + versao), 400);
  let corpo;
  try {
    corpo = await req.json();
  } catch {
    return json(erro(null, -32700, "JSON inv\xE1lido"), 400);
  }
  const extra = versao ? { "MCP-Protocol-Version": versao } : {};
  if (Array.isArray(corpo)) {
    const rs = (await Promise.all(corpo.map((p) => responde(p, d, token, versao, quem)))).filter((r2) => r2 != null);
    return rs.length ? json(rs, 200, extra) : new Response(null, { status: 202, headers: CORS });
  }
  const r = await responde(corpo, d, token, versao, quem);
  return r == null ? new Response(null, { status: 202, headers: CORS }) : json(r, 200, extra);
}

// src/mcp/porta.ts
var EMISSOR = URL_BASE + "/auth/v1";
var chaves = chavesDoProjeto(EMISSOR + "/.well-known/jwks.json");
async function lerEstado(token) {
  const r = await fetch(URL_BASE + "/rest/v1/estado?select=data&limit=1", {
    headers: { apikey: ANON, Authorization: "Bearer " + token, Accept: "application/json" }
  });
  if (!r.ok) throw new Error("banco respondeu " + r.status);
  const linhas = await r.json();
  return Array.isArray(linhas) && linhas[0] ? linhas[0].data ?? null : null;
}
var cab = (token, extra = {}) => ({ apikey: ANON, Authorization: "Bearer " + token, ...extra });
async function papelLigado(token, papel) {
  const r = await fetch(URL_BASE + "/rest/v1/agentes?select=ligado&papel=eq." + encodeURIComponent(papel) + "&limit=1", { headers: cab(token, { Accept: "application/json" }) });
  if (!r.ok) return true;
  const linhas = await r.json();
  return !(Array.isArray(linhas) && linhas[0] && linhas[0].ligado === false);
}
async function registra(token, a) {
  await fetch(URL_BASE + "/rest/v1/acessos", {
    method: "POST",
    headers: cab(token, { "Content-Type": "application/json", Prefer: "return=minimal" }),
    body: JSON.stringify(a)
  });
}
async function porta(req) {
  const url = new URL(req.url);
  const papel = url.pathname.replace(/\/+$/, "").split("/").pop() || "";
  if (!ehPapel(papel)) return new Response(JSON.stringify({ error: "porta desconhecida" }), { status: 404, headers: { "Content-Type": "application/json" } });
  const urlDaPorta = url.origin + "/api/mcp/" + papel;
  return atende(req, {
    papel,
    urlDaPorta,
    urlDoMetadado: url.origin + "/.well-known/oauth-protected-resource/api/mcp/" + papel,
    servidorDeAutorizacao: EMISSOR,
    confere: (t) => confereToken(t, { chaves, emissor: EMISSOR, audiencia: "authenticated" }),
    lerEstado,
    papelLigado,
    registra
  });
}
var GET = porta;
var POST = porta;
var OPTIONS = porta;
var DELETE = porta;
export {
  DELETE,
  GET,
  OPTIONS,
  POST
};
