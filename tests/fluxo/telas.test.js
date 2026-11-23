// Regressão das telas e das regras inegociáveis do projeto.
import { test } from 'vitest';
import assert from 'node:assert';
import { app, agoraEstavel, HTML, FONTE, DIA, inicioDaSemana } from './harness.js';

/**
 * O endereço da nuvem — a origem do projeto e os caminhos que carregam DADO.
 *
 * O recorte é estreito de propósito. Antes bastava ser `.supabase.co` para
 * passar, o que deixaria entrar uma imagem servida do Storage: asset, buscado
 * na rede para a tela funcionar, exatamente o que a regra proíbe. O teste
 * ficaria verde numa regra quebrada, que é pior do que falhar.
 *
 * Foto que ELE tira é dado, e mora no Cache Storage sob URL de mesma origem —
 * não passa por aqui.
 */
const nuvemDeDados = u =>
  !/^https:\/\/[a-z0-9]+\.supabase\.co$/.test(u) &&
  !/\.supabase\.co\/(rest|auth)\//.test(u);

test('um artefato só, sem dependência de runtime', async () => {
  // O app ganhou sincronização, e com ela um endereço de DADO — o projeto do
  // Supabase. A propriedade que este teste guarda não era "nenhuma URL": era
  // que o artefato não BUSCA CÓDIGO nem asset na rede para funcionar. Isso
  // continua valendo, e é o que as duas asserções abaixo cobram.
  const urls = (HTML.match(/https?:\/\/[^"']+/g) || [])
    .filter(function (u) { return !/fonts\.(googleapis|gstatic)/.test(u); })
    // Namespaces XML (SVG, MathML, XHTML) são identificadores, não endereços:
    // o Preact usa createElementNS e o navegador nunca busca nada neles.
    .filter(function (u) { return !/^https?:\/\/www\.w3\.org\//.test(u); })
    .filter(nuvemDeDados);
  assert.deepStrictEqual(urls, [], 'nenhum endereço além da fonte e da nuvem');
  assert.ok(!/<script[^>]*\ssrc=/.test(HTML), 'nenhum script buscado à parte');
  assert.ok(!/<link[^>]*rel=["']?stylesheet[^>]*supabase/.test(HTML), 'nem folha de estilo');
});

test('a nuvem não é pré-condição para o app abrir', async () => {
  // Sem sessão e sem rede, tudo tem que funcionar: é a regra que separa
  // "sincroniza" de "depende de servidor".
  const a = await app();
  assert.strictEqual(a.v('nuvem.sessao'), null, 'abre sem login nenhum');
  a.v('toggle', 0);
  a.preencher(0, 0, 60, 8);
  assert.strictEqual(a.log('A', 0).length, 1, 'e registra série do mesmo jeito');
  assert.strictEqual(a.dado('sync').sujo, false, 'sem sessão, nem marca sujeira');
  a.fechar();
});

test('nenhum handler inline sobrou no fonte', async () => {
  // Este teste começou ao contrário: cobrava que todo nome citado num
  // `onclick=` estivesse republicado em `window`, porque o app virou módulo ES
  // e atributo só enxerga o escopo global. A ponte que ele guardava tinha 91
  // nomes e obrigava o build a rodar sem minify e sem tree-shaking — o
  // minificador renomeia binding de módulo, e o shaking apaga função que só é
  // alcançada por string.
  //
  // Com a última tela virando componente a ponte morreu, e o teste inverteu:
  // agora ele cobra a AUSÊNCIA. Um `onclick=` novo no fonte não seria um botão
  // morto — seria a dívida voltando, e junto com ela o build sem minify.
  const re = /\son(?:click|input|change|blur|focus|submit|keydown)=(["'])/g;
  const achados = [];
  let m;
  while ((m = re.exec(FONTE + HTML))) {
    achados.push((FONTE + HTML).slice(m.index, m.index + 60).replace(/\s+/g, ' '));
  }
  assert.deepStrictEqual(achados, [], 'handler inline de volta no fonte');
});

test('as leituras do mês contam DIAS com treino; tempo e volume saíram (são de Semana)', async () => {
  // A D: "três leituras do mês, e só estas". A unidade é o dia — dois treinos
  // no mesmo dia contam um —, e com menos de quatro semanas desde o primeiro
  // treino a conta vem sem média.
  const agora = agoraEstavel();
  const done = [];
  for (let k = 1; k <= 3; k++) done.push({ day: 'A', t: agora - k * DIA, sid: agora - k * DIA, dur: 50 * 60000 });
  done.push({ day: 'B', t: agora - DIA + 3600000, sid: agora - DIA + 3600000, dur: 40 * 60000 });
  const a = await app({ agora: agora, estado: { logs: {}, done: done } });
  a.aba('dias');
  const m = a.vJ('ctx.mes');
  assert.ok(/^3 dias com treino em 3\./.test(m.treino.conta), 'quatro sessões em três dias são três dias: ' + m.treino.conta);
  assert.strictEqual(m.treino.valor, null, 'sem média antes de quatro semanas');
  assert.strictEqual(a.$('.ins-grade-c'), null, 'sem o quadro de dias, tempo e volume');
  a.fechar();
});

test('acompanhamento não avança para o futuro', async () => {
  const a = await app();
  a.aba('dias');
  a.v('mudaMes', 1);
  assert.strictEqual(a.vista().mes, 0);
  a.v('mudaMes', -1);
  assert.strictEqual(a.vista().mes, -1);
  a.fechar();
});

test('média semanal, não sequência de dias', async () => {
  const a = await app();
  a.aba('semana');
  const txt = a.doc.getElementById('app').textContent.toLowerCase();
  // A guarda é contra a sequência de DIAS DE TREINO — o placar que pune o
  // domingo. A regra do nutricionista tem outra sequência, de SEMANAS de
  // pesagem, e o vazio dela diz isso com todas as letras ("buraco: quebra a
  // sequência", §6.4 da frente 3): é a condição da regra, não um placar.
  assert.ok(!/sequ[eê]ncia de (dias|treinos?)|dias em sequ[eê]ncia|streak|dias seguidos/.test(txt),
    'sequência puniria a quebra: quem treina 5 a 6 vezes quebra todo domingo');
  assert.ok(!/sequ[eê]ncia/.test(txt.replace(/quebra a sequ[eê]ncia|não formam sequ[eê]ncia/g, '')),
    'e a palavra só aparece onde fala das semanas da regra');
  a.fechar();
});

test('substituição oferece alternativas para todos os exercícios', async () => {
  const a = await app();
  const ALT = a.dado('ALT');
  const semAlt = a.vJ('rot').reduce(function (acc, d) {
    a.vJ('treino', d).ex.forEach(function (ex) {
      if (ex.g && (!ALT[ex.n] || ALT[ex.n].length < 2)) acc.push(d + ' ' + ex.n);
    });
    return acc;
  }, []);
  assert.deepStrictEqual(semAlt, []);
  a.fechar();
});

test('um asset servido do Storage não passa despercebido', () => {
  // O recorte da regra acima só vale se ele REJEITAR o que deve rejeitar.
  const passa = u => !nuvemDeDados(u);

  assert.ok(passa('https://x.supabase.co'), 'a origem do projeto passa');
  assert.ok(passa('https://x.supabase.co/rest/v1/estado'), 'o endpoint de dado passa');
  assert.ok(passa('https://x.supabase.co/auth/v1/token'), 'o de login também');
  assert.ok(!passa('https://x.supabase.co/storage/v1/object/public/ex/pulldown.avif'),
    'um asset do Storage tem que falhar: é asset buscado na rede, não dado');
  assert.ok(!passa('https://cdn.jsdelivr.net/qualquer.js'), 'e qualquer CDN também');
});

// ===========================================================================
// As sete tabelas de ação, e as quatro leituras da shell
// ===========================================================================
//
// `acoesEx`, `acoesDia`, `acoesRapido`, `acoesAulas`, `acoesAdd`,
// `acoesPrograma` e `acoesProg` são as tabelas por onde CADA tela entrega o
// que ela sabe fazer. Nenhuma tinha caso próprio, e são o inventário mais
// fácil de encolher numa reescrita: a tela nova liga oito dos vinte e dois
// botões do cartão de exercício, ninguém conta, e as capacidades que sobraram
// não têm nada vermelho a mostrar.
//
// Cobrem o modelo, não a fiação: o caso afirma que a CAPACIDADE está no
// contrato, e explicitamente NÃO que a tela nova a ligou num botão.
//
// Duas coisas que o código ensinou aqui, e valem registro:
//
//  1. **`a.v` não alcança as tabelas.** `chama` parte o nome no PRIMEIRO
//     ponto, então `'ctx.acoesDia.subir'` procura a chave literal
//     `"acoesDia.subir"` em `CTX` e estoura. Entram por `a.m.ctx.acoes…`, que é
//     a porta por acesso direto — por nome e sem `eval` —, e o §4 do
//     09-superficie.md já a documenta com a ressalva de realm.
//  2. **`acoesEx.inp`/`obsIn` recebem elemento do DOM.** São as cascas do §2,
//     e os pares por valor delas (`anotaSerie`, `anotaObservacao`) já estão em
//     `verbos`. (`acoesRapido.inp` era a terceira, e saiu com o campo.) O caso confere que
//     o NOME está na tabela, não que ele seja verbo.

/** O inventário completo, por tabela — a lista é o que o caso protege. */
const TABELAS_DE_ACAO = {
  acoesEx: ['toggle', 'inp', 'startTimer', 'proximoDoBiset', 'setAlt', 'toggleSwap',
            'abrirSubstituicao', 'pularEx', 'openHist', 'toggleAq', 'abrirCarga', 'setCarga',
            'abrirMedida', 'setUnidade', 'setQ', 'abrirNota', 'obsIn', 'toggleDor', 'abreRir',
            'abreFoto', 'poeRir', 'usaAnterior',
            // Máquina ocupada, a saída mais barata (§7.3 da frente 3).
            'fazAntesOProximo',
            // A dor repetida para a régua até ele escolher (§7.4).
            'aceitaDor',
            // A régua da frente 2: o campo de repetição virou botão, e são
            // estes os quatro toques possíveis nela.
            'abreRegua', 'andaRegua', 'poeRep', 'abreOutroValor',
            // O teclado próprio, que a porta "outro valor" abre.
            'tecla', 'fechaTeclado', 'abreTecladoDeCarga',
            // "+ série" na linha do exercício (a D, momento 1, estado 4).
            'maisUmaSerie', 'preNoDescanso', 'copoNoDescanso', 'pesoNoDescanso'],
  acoesDia: ['subir', 'descer', 'menos', 'mais', 'trocar', 'remover', 'escolheTroca',
             'fechaTroca', 'desfaz', 'pronto'],
  // `inp` saiu por decisão escrita: a lista rápida não tem mais campo — carga
  // e medida abrem o teclado próprio —, e o par por valor dela,
  // `anotaSerieRapida`, continua em `verbos`. As três que entraram são as do
  // teclado, e duas delas são as MESMAS de `acoesEx`.
  acoesRapido: ['abre', 'abreTeclado', 'tecla', 'fechaTeclado'],
  acoesAulas: ['abre', 'repete', 'aplica', 'salva', 'apaga', 'cola', 'importa'],
  acoesAdd: ['abre', 'fecha', 'busca', 'adiciona', 'abreNovo', 'cria'],
  acoesPrograma: ['volta', 'abreDia', 'modo', 'moveDia', 'criaTreino', 'restauraDia',
                  'restauraTudo'],
  acoesProg: ['subir', 'descer', 'menos', 'mais', 'trocar', 'remover', 'escolheTroca',
              'fechaTroca', 'reps', 'descanso']
};

test('acoesDia e acoesProg mexem em programas diferentes — o do dia e o oficial', async () => {
  // As duas tabelas têm oito nomes iguais, e é a diferença entre elas que é a
  // regra central do app: mexer no treino de HOJE não mexe no programa oficial.
  // Um redesenho que ligasse a tabela errada num botão passaria por toda a
  // suíte de hoje sem um vermelho.
  const a = await app();
  const idSaindo = a.k('A', 0);
  const nomeOficial = a.v('nomeEx', idSaindo);

  a.v('modoEdicao');
  a.m.ctx.acoesDia.remover(0);
  await a.esperar();

  assert.strictEqual(a.v('nomeEx', idSaindo), nomeOficial,
    'remover pela tabela do DIA não toca no catálogo: o exercício continua tendo nome');
  assert.ok(a.S().prog.A.ex.some(function (x) { return x.id === idSaindo; }),
    'nem no programa oficial: o exercício continua prescrito lá');
  assert.deepStrictEqual(a.vJ('modsDoDia', 'A'), [{ k: 'rm', slot: idSaindo }],
    'o que ela cria é uma MUDANÇA do dia, que a decisão do fim promove ou não');
  assert.ok(!a.vJ('treino', 'A').ex.some(function (x) { return x.id === idSaindo; }),
    'e o treino de HOJE, que é o projetado, já não o tem');
  a.fechar();
});

// ---------------------------------------------------------------------------
// As quatro leituras da shell
// ---------------------------------------------------------------------------

test('ctx.emTelaCheia diz quando um destino tomou a tela toda', async () => {
  // Quem pergunta é a shell, para esconder a tabbar: errar aqui é a barra de
  // abas aparecendo em cima da câmera, ou desaparecendo na tela de treino.
  const a = await app({ aba: 'agora' });
  assert.strictEqual(a.v('ctx.emTelaCheia'), false, 'um LUGAR não é tela cheia');

  a.v('ctx.abrePrograma');
  assert.strictEqual(a.v('ctx.emTelaCheia'), true, 'o programa é');
  a.v('ctx.fechaFolha');
  a.v('ctx.vaiPara', 'agora');
  assert.strictEqual(a.v('ctx.emTelaCheia'), false, 'e sair devolve a shell');

  // E o MODO é tela cheia, o que mudou de propósito: a aba de treino virou
  // modo, e é esse o ponto — a sessão é o estado em que o resto sai da frente.
  a.aba('treino');
  assert.strictEqual(a.v('ctx.emTelaCheia'), true, 'a sessão é tela cheia agora');
  a.v('ctx.fechaModoDeSessao');
  assert.strictEqual(a.v('ctx.emTelaCheia'), false, 'e fechar o modo devolve a shell');

  a.v('openHist', 0);
  assert.strictEqual(a.v('ctx.emTelaCheia'), true, 'o histórico de um exercício também é');
  a.fechar();
});

test('ctx.sessaoAberta devolve null sem sessão, e a duração enquanto há uma', async () => {
  const a = await app();
  assert.strictEqual(a.vJ('ctx.sessaoAberta'), null, 'sem sessão não há o que mostrar');

  a.v('toggle', 0);
  a.preencher(0, 0, 60, 8);
  await a.esperar();

  const s = a.vJ('ctx.sessaoAberta');
  assert.ok(s, 'a primeira série completa abre a sessão');
  assert.match(s.duracao, /^\d+ min$|^\d+:\d\d$/,
    'e a leitura traz a duração já formatada, nunca o instante cru: ' + s.duracao);
  assert.strictEqual(s.pausada, false, 'correndo');

  await a.v('pausarSessao');
  await a.esperar();
  assert.strictEqual(a.vJ('ctx.sessaoAberta').pausada, true, 'pausar aparece aqui');
  await a.v('retomarSessao');
  await a.esperar();
  assert.strictEqual(a.vJ('ctx.sessaoAberta').pausada, false, 'e retomar também');
  a.fechar();
});

test('ctx.ehLinhaDeTreino separa a linha de treino das de comida na timeline', async () => {
  // A timeline de HOJE mistura comida e treino em ordem de relógio. Esta é a
  // pergunta que decide qual cromo cada linha recebe — e ela é sobre o `id` da
  // linha, não sobre a letra do dia.
  const a = await app({ aba: 'agora' });
  assert.strictEqual(a.v('ctx.ehLinhaDeTreino', { id: 'treino' }), true);
  assert.strictEqual(a.v('ctx.ehLinhaDeTreino', { id: 'almoco' }), false);
  assert.strictEqual(a.v('ctx.ehLinhaDeTreino', { id: 'pre' }), false,
    'o pré-treino é refeição, e é o que mais se confunde com treino');
  a.fechar();
});

// ---------------------------------------------------------------------------
// `ctx.vaiParaDia` e `ctx.abreSessaoDoDia` — as duas portas da tira da semana
// ---------------------------------------------------------------------------
//
// Terceiro degrau do critério desta passada (quanto custa uma quebra em
// silêncio). As duas são os `onClick` da tira da semana em TREINO
// (`src/ui/telas/treino.jsx`), e `abreSessaoDoDia` é também o do calendário do
// mês em DADOS. Quebradas em silêncio, o histórico do dia fica inalcançável
// pelo toque — e a de duas sessões no mesmo dia já ficou inalcançável uma vez,
// por este mesmo caminho. Nenhuma das duas tinha menção em `tests/fluxo/`: a
// rede chegava nelas pelo clique no `.cal-d`, que o redesenho reescreve.
//
// O QUE ESTE GRUPO NÃO COBRE: que a tira ou o calendário tenham célula ligada
// nelas. Chamar o verbo prova que a capacidade existe no MODELO.

test('ctx.vaiParaDia troca o dia do treino e larga o que estava aberto nele', async () => {
  const a = await app();
  a.v('toggle', 0);
  assert.strictEqual(a.vista().open, 0, 'pré-condição: um exercício aberto');
  const antes = a.vista().day;

  a.v('ctx.vaiParaDia', 'E');
  await a.esperar();

  assert.strictEqual(a.vista().day, 'E', 'o dia é outro');
  assert.notStrictEqual(antes, 'E', 'e era outro antes — senão o caso não media nada');
  assert.strictEqual(a.vista().open, null,
    'e o cartão aberto fechou: ele era de um exercício do dia que saiu da tela');
  assert.strictEqual(a.vista().hist, null, 'o histórico aberto também');
  assert.strictEqual(a.vista().nota, null, 'e a anotação aberta');
  a.fechar();
});

test('ctx.abreSessaoDoDia despacha pelos dois tipos que o dia aberto dá', async () => {
  // O dia aberto é quem produz o `abre` agora (a faixa da semana saiu, e com
  // ela o `k: 'dia'`: o mês já leva ao dia). O caso pega o objeto do próprio
  // dia, pelo botão, em vez de escrevê-lo à mão.
  const agora = agoraEstavel();
  const d = new Date(agora - DIA); d.setHours(8, 0, 0, 0);
  const tB = d.getTime();
  const a = await app({ agora: agora, estado: {
    plano: 6, logs: {}, done: [{ day: 'B', t: tB, sid: tB, dur: 40 * 60000, fim: 'manual' }]
  }, aba: 'dias' });
  a.v('ctx.abreDia', tB);
  await a.esperar();

  // (1) `k: 'sessao'` — abre aquela sessão
  a.clicar('[data-a="dia-sessao"]');
  await a.esperar(60);
  assert.strictEqual(a.vista().sessao.day, 'B', 'abriu a sessão daquele instante, e só ela');

  // (2) A folha conserva a sessão que está por baixo.
  a.v('ctx.abreSessaoDoDia', { k: 'lancar', t: tB });
  await a.esperar(60);
  assert.ok(a.$('[role="dialog"][aria-label="Registrar um treino"]'));
  a.v('ctx.fechaFolha');
  assert.equal(a.vista().sessao.t, tB);
  a.fechar();
});

test('botão que mostra só um símbolo tem nome acessível', () => {
  // Já havia guarda para isto, e ela cobria UM cartão (`serie.test.js` :: todo
  // controle do cartão de exercício tem nome acessível). O app inteiro não
  // tinha: um `···` ou um `×` novo em qualquer outra tela nasceria sem nome, e
  // quem usa leitor de tela ouviria "botão" — sem nada que diga o que ele faz.
  //
  // Hoje os que existem têm `aria-label`. Este caso é o que mantém isso verdade
  // quando nascer o próximo.
  //
  // REESCRITO, e o motivo é que a versão anterior ENVELHECEU em silêncio. Ela
  // enumerava os símbolos conhecidos — `· • × ✕ ✓ + − …` — e eu acrescentei dois
  // que não estavam na lista: o `⚙` dos Ajustes e o `‹` da saída do modo. Os
  // dois têm rótulo, mas a guarda não saberia se não tivessem: uma lista de
  // símbolos é um inventário, e inventário é o que fica velho.
  //
  // A pergunta certa é a inversa e não envelhece: o conteúdo visível tem alguma
  // LETRA OU DÍGITO? Se não tem, não há nome a tirar dele, e o botão precisa de
  // `aria-label` qualquer que seja o símbolo — inclusive um que ninguém ainda
  // inventou.
  //
  // LIMITE DECLARADO: isto é leitura de FONTE. Um botão cujo corpo é uma
  // expressão (`{x.t}`) tem letras no código e passa por "tem texto", mesmo que
  // o valor em tempo de execução seja um símbolo. Casos de DOM cobrem os que
  // importam um a um; este cobre a classe.
  const TEM_PALAVRA = /[\p{L}\p{N}]/u;
  const sem = [];
  const re = /<button\b([^>]*)>([\s\S]{0,60}?)<\/button>/g;
  let m;
  while ((m = re.exec(FONTE))) {
    const [, attrs, corpo] = m;
    if (TEM_PALAVRA.test(corpo)) continue;           // tem texto: o texto é o nome
    if (!corpo.trim()) continue;                     // vazio: não é botão de símbolo
    if (/aria-label|aria-labelledby/.test(attrs)) continue;
    sem.push((corpo.trim() || '(vazio)') + '  ←  ' + attrs.trim().slice(0, 50));
  }
  assert.deepStrictEqual(sem, [],
    'botão cujo conteúdo visível é só símbolo e que não tem nome acessível: ' +
    'quem usa leitor de tela ouve "botão" e nada mais');
});

// ---------------------------------------------------------------------------
// O DELOAD mudou de lugar, e o freio virou a palavra
// ---------------------------------------------------------------------------
//
// Decisão 6 do dono: o interruptor sai de Ajustes e vai para o menu `···` da
// sessão. O argumento que caiu era bom e fica escrito, porque é o que ninguém
// pode esquecer ao implementar — "um interruptor que corta metade das séries não
// deve estar a um toque no meio de uma sessão. O app existe em parte para frear,
// e o caminho de menor esforço tem que ser o conservador".
//
// O LUGAR era o freio. Ele decidiu mover sabendo disso — foi perguntado duas
// vezes na mesma noite e manteve, depois de o cartão ser corrigido. Então o
// freio passa do lugar para a PALAVRA, e é isso que estes casos cobram.

test('o menu ··· da sessão diz o corte em NÚMERO antes do toque', async () => {
  const a = await app();
  assert.ok(a.vista().modoSessao, 'pré-condição: dentro do modo');
  // as opções da sessão moram dentro da lista do treino, o ícone do topo do
  // modo (design system, "f-lista-treino": "Opções" e "Encerrar o treino")
  const mais = a.$('[data-a="lista-treino"]');
  assert.ok(mais, 'a lista está no topo do modo');
  assert.ok(mais.getAttribute('aria-label'), 'com nome acessível: um ícone não é nome');
  mais.click();
  await a.esperar(60);
  a.clicar('[data-a="lista-opcoes"]');
  await a.esperar(60);

  const item = a.$('[data-a="deload"]');
  assert.ok(item, 'o deload é o item do menu');
  const txt = item.textContent;
  assert.ok(/Deload hoje/.test(txt), txt);
  // Os números são do DADO e não de exemplo: o prescrito do dia e a conta do
  // deload, calculados na hora de abrir.
  assert.match(txt, /corta \d+ séries para \d+, nas mesmas cargas/,
    'diz o corte em número, antes do toque: ' + txt);

  // E NUNCA um interruptor com o nome sozinho — é a linha "nunca" da tabela da
  // frente 3. Sem o número, o freio não existe em lugar nenhum.
  assert.ok(!/[Aa]tivar deload/.test(txt), 'não é "ativar deload": ' + txt);
  a.fechar();
});

test('os números do corte são os do dia, conferidos à mão', async () => {
  // Conferência independente: soma o prescrito do dia sem passar pela leitura
  // que está sob teste. Se a conta do deload mudar, o caso diz.
  const a = await app();
  const ex = a.vJ('treino', a.vista().day).ex;
  const cheio = ex.reduce(function (n, x) { return n + x.s; }, 0);
  const cortado = ex.reduce(function (n, x) { return n + Math.ceil(x.s / 2); }, 0);
  assert.ok(cheio > cortado, 'pré-condição: o deload corta mesmo (' + cheio + ' → ' + cortado + ')');

  const m = a.vJ('ctx.menuDaSessao');
  assert.strictEqual(m.deload.detalhe,
    'corta ' + cheio + ' séries para ' + cortado + ', nas mesmas cargas');
  a.fechar();
});

test('com o deload ligado, a palavra diz o que o toque DEVOLVE', async () => {
  // A segunda metade, e é a que impede o susto: desligar no meio devolve as
  // séries, e o que já foi registrado fica. A frase tem de dizer quanto volta.
  const a = await app({ estado: { logs: {}, done: [], deload: true } });
  const ex = a.vJ('treino', a.vista().day).ex;
  const devolve = ex.reduce(function (n, x) { return n + x.s - Math.ceil(x.s / 2); }, 0);

  const m = a.vJ('ctx.menuDaSessao');
  assert.strictEqual(m.deload.ligado, true);
  assert.strictEqual(m.deload.rotulo, 'Sair do deload');
  assert.match(m.deload.detalhe,
    new RegExp('devolve ' + devolve + ' séries ao Treino ' + a.vista().day + ' de hoje'),
    m.deload.detalhe);
  a.fechar();
});

test('tocar no item liga o deload e fecha o menu', async () => {
  const a = await app();
  assert.strictEqual(a.S().deload, false, 'pré-condição: desligado');

  a.clicar('[data-a="lista-treino"]');
  await a.esperar(60);
  a.clicar('[data-a="lista-opcoes"]');
  await a.esperar(60);
  a.clicar('[data-a="deload"]');
  await a.esperar(60);

  assert.strictEqual(a.S().deload, true, 'ligou');
  assert.strictEqual(a.$('.ins-folha'), null, 'e o menu fechou: fim de tarefa');
  a.fechar();
});

test('o ciclo conta VOLTAS DA ROTAÇÃO, não semanas', async () => {
  // Conferência independente: a conta é `sessões / tamanho da rotação`, e o
  // tamanho é o da rotação DELE. Contar em semanas daria o número errado toda
  // vez que ele treinasse mais ou menos que a rotação pede.
  const seis = [];
  for (let k = 0; k < 6; k++) {
    const t = Date.now() - (6 - k) * DIA;
    seis.push({ day: 'ABCDE'[k] || 'HX', t: t, sid: t, dur: 60 * 60000 });
  }
  const a = await app({ aba: 'semana', estado: { logs: {}, done: seis } });
  await a.esperar();

  const c = a.vJ('ctx.cicloDoBloco');
  assert.strictEqual(c.sessoes, 6);
  assert.strictEqual(c.treinos, 6, 'a rotação base tem seis: A, B, C, D, E e HX');
  assert.strictEqual(c.ciclo, '2', 'uma volta inteira fechada: ele está no segundo ciclo');
  a.fechar();
});

test('nenhuma aba mostra resto de código como texto', async () => {
  // Um `)}` sobrou no Agora depois de um comentário JSX, e o build o aceitou
  // como texto: ele aparecia na tela, entre a água e o cardio. O `tsc` acusava
  // ("tipos"), mas a suíte não. Este caso lê o texto de cada aba.
  const a = await app({});
  for (const aba of ['agora', 'dias', 'corpo', 'semana', 'prescricao']) {
    a.aba(aba);
    await a.esperar();
    const t = a.texto('#app');
    assert.ok(!/\)\}|\{\/\*|\*\/\}|=>/.test(t), aba + ': ' + (t.match(/.{0,30}(\)\}|\{\/\*|\*\/\}|=>).{0,30}/) || [''])[0]);
  }
  a.fechar();
});

test('"Fazer outro treino hoje" no ··· troca o treino mostrado e fecha', async () => {
  const a = await app();
  const outro = a.vJ('ctx.menuDaSessao').troca.dias.filter(function (x) { return !x.on; })[0].k;
  a.clicar('[data-a="lista-treino"]');
  await a.esperar(60);
  a.clicar('[data-a="lista-opcoes"]');
  await a.esperar(60);
  a.clicar('[data-a="menu-treino-' + outro + '"]');
  await a.esperar(60);
  assert.strictEqual(a.vista().day, outro);
  assert.strictEqual(a.$('.ins-folha'), null, 'e o menu fechou');
  assert.ok(a.vista().modoSessao, 'sem sair do modo');
  a.fechar();
});

test('"Editar o treino de hoje" no ··· entra na edição, e some de lá', async () => {
  const a = await app();
  a.clicar('[data-a="lista-treino"]');
  await a.esperar(60);
  a.clicar('[data-a="lista-opcoes"]');
  await a.esperar(60);
  a.clicar('[data-a="menu-editar"]');
  await a.esperar(60);
  assert.strictEqual(a.vista().editProg, true);
  assert.strictEqual(a.$('.ins-folha'), null, 'e o menu fechou');
  assert.strictEqual(a.vJ('ctx.menuDaSessao').editar, null, 'já editando, o item não se oferece de novo');
  a.fechar();
});

