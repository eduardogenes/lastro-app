// A régua de repetições, a parte pura.
//
// O que estes casos seguram não é "a função devolve uma lista": é a MEDIÇÃO B da
// frente 2 §1.5, escrita como aritmética. Ela reprova a régua com "mediana acima
// de 1 toque, ou qualquer série que custe mais de 3", e a paginação foi escolhida
// para passar nesse número — então o número tem de ficar preso aqui, ou a
// escolha vira preferência na primeira vez que alguém mexer no passo.
//
// A medição de verdade é de aparelho e de dedo, e ninguém a fez. Isto não a
// substitui: isto garante que o LIMITE SUPERIOR do alcance é 3, e a medição de
// aparelho é que diz quantos toques são engolidos e quantos erram o alvo.

import { test } from 'vitest';
import assert from 'node:assert';
import {
  regua, pagina, anda, escolhiveis, faixaDoTexto, SLOTS, TETO_DE_VALORES
} from '../../src/dominio/regua.js';
import type { Faixa } from '../../src/dominio/regua.js';

test('a régua abre mais para cima do que para baixo', () => {
  // `ref−4` até `ref+5`: subir repetição é o caso comum, descer é exceção. Dez
  // valores, que é o tamanho de 15 das 20 séries do Treino A (§1.1).
  const r = regua(10, null);
  assert.deepStrictEqual(r.valores, [6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
  assert.strictEqual(r.valores.length, 10);
});

test('a faixa do treinador alarga a régua, e quem cede ao teto é a cortesia', () => {
  // O caso MEDIDO da §1.1: elevação lateral unilateral no cabo, faixa 12–20,
  // última 16. A fórmula do protótipo quer 11 a 22 — doze valores —, e o teto
  // do alcance é onze. Então um valor sai, e é o 22: a faixa do treinador fica
  // INTEIRA, que era a reclamação medida ("a faixa prescrita é cortada nas duas
  // pontas"), e o que cai é a cortesia de dois acima dela.
  const r = regua(16, [12, 20] as Faixa);
  assert.strictEqual(r.valores[0], 11);
  assert.strictEqual(r.valores[r.valores.length - 1], 21);
  assert.strictEqual(r.valores.length, 11);
  for (let v = 12; v <= 20; v++) {
    assert.ok(r.valores.includes(v), 'a faixa inteira está na régua: falta o ' + v);
  }
});

test('o teto nunca é estourado, em nenhuma combinação', () => {
  for (let ref = 1; ref <= 40; ref++) {
    for (const f of [null, [8, 12], [10, 15], [12, 20], [6, 8], [15, 25], [10, 30]] as Array<Faixa | null>) {
      const r = regua(ref, f);
      assert.ok(r.valores.length <= TETO_DE_VALORES,
        'régua de ' + r.valores.length + ' valores (ref ' + ref + ', faixa ' + JSON.stringify(f) + ')');
      assert.ok(r.valores[0]! >= 1, 'zero repetição não é valor');
    }
  }
});

test('com a faixa longe, a régua cede para o lado da faixa', () => {
  // Última 1 repetição, faixa 15–25: a fórmula pediria 27 valores. A régua não
  // os carrega, então ela sobe a partir da referência — para o lado de onde ele
  // tem de chegar — e o resto passa pela porta "outro valor".
  const acima = regua(1, [15, 25] as Faixa);
  assert.strictEqual(acima.valores[0], 1, 'a referência continua na régua');
  assert.strictEqual(acima.valores[acima.valores.length - 1], 11, 'e ela anda para cima');

  // E o espelho: última 30, faixa 5–8.
  const abaixo = regua(30, [5, 8] as Faixa);
  assert.strictEqual(abaixo.valores[abaixo.valores.length - 1], 31);
  assert.strictEqual(abaixo.valores[0], 21, 'desce na direção da faixa');
});

test('com a faixa larga demais, a régua centra na referência', () => {
  // Faixa 10–30 não cabe em onze valores. O que vale é o valor que ele vai
  // registrar quase sempre, que é perto da última vez.
  const r = regua(20, [10, 30] as Faixa);
  assert.strictEqual(r.valores.length, TETO_DE_VALORES);
  assert.strictEqual(r.valores[0], 15);
  assert.strictEqual(r.valores[r.valores.length - 1], 25);
});

test('a régua não desce abaixo de uma repetição', () => {
  const r = regua(3, [2, 5] as Faixa);
  assert.strictEqual(r.valores[0], 1, 'zero repetição não é um valor registrável');
});

test('a janela mostra seis slots, e dois andam quando há para onde', () => {
  const r = regua(16, [12, 20] as Faixa);     // 12 valores, 11..22
  const p = pagina(r, 16);
  assert.strictEqual(p.length, SLOTS);
  assert.strictEqual(p[0]!.tipo, 'anda', 'há valores menores escondidos');
  assert.strictEqual(p[SLOTS - 1]!.tipo, 'anda', 'e maiores também');
  assert.deepStrictEqual(escolhiveis(p), [14, 15, 16, 17],
    'quatro escolhíveis, com a referência entre elas');
});

test('o slot de andar diz qual trecho ele revela', () => {
  const r = regua(16, [12, 20] as Faixa);
  const p = pagina(r, 16);
  const esq = p[0] as { tipo: 'anda'; de: number; ate: number };
  const dir = p[SLOTS - 1] as { tipo: 'anda'; de: number; ate: number };
  assert.deepStrictEqual([esq.de, esq.ate], [11, 12], 'andar para a esquerda revela 11 e 12');
  assert.deepStrictEqual([dir.de, dir.ate], [19, 21], 'e para a direita, 19 a 21');
});

test('na ponta da régua o slot volta a ser valor', () => {
  // Não existe passo a dar onde a régua acaba, e um alvo de andar que não anda é
  // o falso sucesso que a doutrina do app proíbe.
  const r = regua(16, [12, 20] as Faixa);
  const p = pagina(r, 11);
  assert.strictEqual(p[0]!.tipo, 'valor', 'o 11 é o primeiro valor da régua');
  assert.ok(escolhiveis(p).includes(11), 'e ele é escolhível');
});

test('a régua que cabe inteira na janela não tem para onde andar', () => {
  const r = regua(5, null);              // 1..10, dez valores
  const p = pagina(r, 5, 12);            // janela maior que a régua
  assert.strictEqual(p.length, 10);
  assert.ok(p.every(s => s.tipo === 'valor'), 'nenhum slot de andar');
});

test('a página é função do foco: reconstruir não move a janela', () => {
  // É o R4 inteiro, e é a causa 3 da §1.2 morrendo por construção. No protótipo
  // o relógio de parede chamava `render()` a cada virada de minuto, o
  // `innerHTML` destruía a faixa e `centrarStrip()` a recentrava — o arrasto
  // dele tinha validade de no máximo um minuto.
  const r = regua(16, [12, 20] as Faixa);
  const foco = anda(r, 16, 1);
  assert.deepStrictEqual(pagina(r, foco), pagina(r, foco),
    'mesma entrada, mesma página: não há posição guardada para se perder');
  assert.notDeepStrictEqual(pagina(r, foco), pagina(r, 16),
    'e andar muda a página de verdade');
});

test('andar é uma JANELA e não um valor', () => {
  const r = regua(16, [12, 20] as Faixa);
  assert.strictEqual(anda(r, 16, 1), 20, 'quatro valores de uma vez');
  assert.strictEqual(anda(r, 16, -1), 12);
  assert.strictEqual(anda(r, 21, 1), 21, 'na ponta ele para, não dá a volta');
  assert.strictEqual(anda(r, 11, -1), 11);
});

// ---------- a medição B, como aritmética ----------

/** Quantos toques, da régua aberta, até REGISTRAR cada valor. */
function custoDeCadaValor(ref: number, faixa: Faixa | null): Map<number, number> {
  const r = regua(ref, faixa);
  const custo = new Map<number, number>();
  // Busca em largura sobre o FOCO: cada toque num slot de andar é um passo, e
  // registrar é o toque final.
  const visto = new Set<number>([ref]);
  let fila: Array<{ foco: number; toques: number }> = [{ foco: ref, toques: 0 }];
  while (fila.length) {
    const prox: Array<{ foco: number; toques: number }> = [];
    for (const { foco, toques } of fila) {
      const p = pagina(r, foco);
      for (const v of escolhiveis(p)) {
        const antes = custo.get(v);
        if (antes == null || antes > toques + 1) custo.set(v, toques + 1);
      }
      for (const s of p) {
        if (s.tipo !== 'anda') continue;
        const novo = anda(r, foco, s.dir);
        if (visto.has(novo)) continue;
        visto.add(novo);
        prox.push({ foco: novo, toques: toques + 1 });
      }
    }
    fila = prox;
  }
  return custo;
}

test('nenhum valor da régua custa mais de três toques', () => {
  // O número que reprova a medição B: "qualquer série que custe mais de 3".
  // Varro todas as réguas que a fórmula sabe produzir no domínio dele —
  // referência de 1 a 30, faixas do estreito ao largo, e sem faixa.
  const faixas: Array<Faixa | null> = [null, [8, 12], [10, 15], [12, 20], [6, 8], [15, 25]];
  let pior = 0;
  let onde = '';
  let maiorRegua = 0;
  for (let ref = 1; ref <= 30; ref++) {
    for (const f of faixas) {
      const r = regua(ref, f);
      maiorRegua = Math.max(maiorRegua, r.valores.length);
      const custo = custoDeCadaValor(ref, f);
      for (const v of r.valores) {
        const c = custo.get(v);
        assert.ok(c != null, 'o valor ' + v + ' não é alcançável de jeito nenhum' +
          ' (ref ' + ref + ', faixa ' + JSON.stringify(f) + ')');
        if (c > pior) { pior = c; onde = 'ref ' + ref + ', faixa ' + JSON.stringify(f) + ', valor ' + v; }
      }
    }
  }
  assert.ok(pior <= 3, 'o pior alcance é ' + pior + ' toques (' + onde + '), e a medição B ' +
    'reprova acima de 3');
  assert.strictEqual(maiorRegua, TETO_DE_VALORES,
    'a varredura tem de chegar ao teto, ou ela não testa o pior caso; chegou a ' + maiorRegua);
});

test('a referência custa um toque, que é a tese da direção', () => {
  // "Um toque é a tese da direção" (§1.5). Se a última vez não estiver a um
  // toque, a mediana da medição B sobe de 1 e a régua reprova.
  const faixas: Array<Faixa | null> = [null, [8, 12], [10, 15], [12, 20], [6, 8], [15, 25]];
  for (let ref = 1; ref <= 30; ref++) {
    for (const f of faixas) {
      const custo = custoDeCadaValor(ref, f);
      assert.strictEqual(custo.get(ref), 1,
        'a referência ' + ref + ' (faixa ' + JSON.stringify(f) + ') custa ' + custo.get(ref));
    }
  }
});

test('os vizinhos da referência também custam um toque', () => {
  // Depois de subir carga o treinador manda "recomeçar perto da base" (F95), e o
  // caso que a §1.1 mediu é justo este: última 14, faixa 10–15, e o 10 ficava
  // fora da tela à esquerda. Agora ele custa dois, e os vizinhos imediatos um.
  const custo = custoDeCadaValor(14, [10, 15] as Faixa);
  assert.strictEqual(custo.get(13), 1);
  assert.strictEqual(custo.get(15), 1);
  assert.ok(custo.get(10)! <= 2, 'o 10 custa ' + custo.get(10));
});

// ---------- a faixa, lida do texto do programa ----------

test('a faixa prescrita é lida com meia-risca, que é o que o programa usa', () => {
  // O programa real escreve `'6–10'` com meia-risca (conferi `programa.ts`), e
  // quem digita à mão escreve hífen. Ler só o hífen deixaria a régua sem faixa
  // nos 48 exercícios do programa — e sem reprovar, porque régua sem faixa
  // funciona: ela só fica estreita demais, em silêncio.
  assert.deepStrictEqual(faixaDoTexto('6–10'), [6, 10]);
  assert.deepStrictEqual(faixaDoTexto('8-12'), [8, 12]);
  assert.deepStrictEqual(faixaDoTexto('12 – 20'), [12, 20]);
  assert.deepStrictEqual(faixaDoTexto('10'), [10, 10], 'número sozinho é faixa de um valor');
  assert.deepStrictEqual(faixaDoTexto('15—25'), [15, 25], 'travessão também');
});

test('sem faixa é ausência, e não faixa de zero', () => {
  // Exercício medido por tempo ou metro tem `r: ''`, e aí a régua é a vizinhança
  // da referência e nada mais.
  assert.strictEqual(faixaDoTexto(''), null);
  assert.strictEqual(faixaDoTexto(null), null);
  assert.strictEqual(faixaDoTexto(undefined), null);
  assert.strictEqual(faixaDoTexto('livre'), null);
  assert.strictEqual(faixaDoTexto('0'), null, 'zero repetição não prescreve nada');
});

test('a faixa fora de ordem é lida na ordem certa', () => {
  assert.deepStrictEqual(faixaDoTexto('12–8'), [8, 12],
    'quem digita invertido não merece régua vazia');
});
