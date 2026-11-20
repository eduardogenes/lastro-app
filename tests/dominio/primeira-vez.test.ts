import { expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { estadoInicial } from '../../src/dominio/primeira-vez';
import { funde } from '../../src/dominio/sincronia';
import { proximoTreino, rotacao } from '../../src/dominio/dia';
import { ROT_BASE, montaCatalogo } from '../../src/dominio/programa';
import { ALIMENTOS_BASE } from '../../src/dominio/nutricao/alimentos';
import { poses, ordemPadrao } from '../../src/dominio/protocolo';
import { MARCAS_DO_CORPO } from '../../src/dominio/corpo';
import { ligado } from '../../src/dominio/modulos';
import { montaArquivos } from '../../ferramentas/espelho/monta';
import type { Estado } from '../../src/dominio/tipos';

function nosDoisSentidos(a: Estado, b: Estado) {
  const agora = Math.max(a.mtime, b.mtime) + 1;
  return [funde(a, b, agora).estado, funde(b, a, agora).estado];
}

function contaEAparelhoComAgua() {
  const conta: Estado = JSON.parse(readFileSync(new URL('./fixtures/estado-plano-11.json', import.meta.url), 'utf8'));
  conta.plano = 12;
  conta.carimbos = { prog: conta.mtime - 1 };
  conta.carimbosEm = conta.mtime;
  const novo = estadoInicial();
  novo.primeiraVez = 4;
  novo.mtime = novo.carimbosEm = conta.mtime + 5000;
  novo.dia = { data: '2026-11-19', done: {}, agua: 1, aguaM: novo.mtime, escala: {} };
  novo.carimbos = { dia: novo.mtime };
  return nosDoisSentidos(novo, conta).map(estado => ({ estado, conta }));
}

it('um copo mais recente preserva os documentos sem carimbo da conta nos dois sentidos (M3)', () => {
  for (const { estado, conta } of contaEAparelhoComAgua()) {
    expect(estado.comida).toEqual(conta.comida);
    expect(estado.cadencia).toEqual(conta.cadencia);
    expect(estado.prog).toEqual(conta.prog);
    expect(estado.dia?.agua).toBe(1);
  }
});

it('a conta anterior aos três passos perde o marcador do outro aparelho nos dois sentidos (M5)', () => {
  for (const { estado } of contaEAparelhoComAgua()) expect(estado).not.toHaveProperty('primeiraVez');
});

it('abrir o Hoje no mesmo dia cede o carimbo e o turno à edição real (M7)', () => {
  const lido = estadoInicial(), editado = estadoInicial();
  lido.dia = { data: '2026-11-19', done: {}, agua: 0, escala: {} };
  editado.dia = { ...lido.dia, turno: 'noite' };
  lido.carimbos = { dia: 900 }; lido.mtime = lido.carimbosEm = 900;
  editado.carimbos = { dia: 100 }; editado.mtime = editado.carimbosEm = 100;
  for (const s of nosDoisSentidos(lido, editado)) {
    expect(s.carimbos?.dia).toBe(100);
    expect(s.dia?.turno).toBe('noite');
  }
});

it('entre duas primeiras vezes concluídas a escolha confirmada vence pular depois (M9)', () => {
  const marcou = estadoInicial(), pulou = estadoInicial();
  marcou.primeiraVez = pulou.primeiraVez = 4;
  marcou.modulos = { ...marcou.modulos, agua: 1 };
  marcou.mtime = 100; pulou.mtime = 900;
  for (const s of nosDoisSentidos(marcou, pulou)) expect(s.modulos).toEqual(marcou.modulos);
});

it('a última refeição desmarcada fica desmarcada nas duas ordens da fusão do dia aberto', () => {
  const marcado = estadoInicial();
  const data = '2026-11-19';
  marcado.dia = { data, done: { almoco: 1000 }, agua: 0, escala: { almoco: 0.5 }, como: { almoco: 'fora' }, tam: { almoco: 'mais' } };
  marcado.carimbos = { dia: 1000 }; marcado.mtime = marcado.carimbosEm = 1000;
  const desmarcado = structuredClone(marcado);
  desmarcado.dia = { data, done: {}, agua: 0, escala: {} };
  desmarcado.apagados = { ['comida:' + data + ':almoco']: 2000 };
  desmarcado.carimbos = { dia: 2000 }; desmarcado.mtime = desmarcado.carimbosEm = 2000;
  for (const s of nosDoisSentidos(desmarcado, marcado)) {
    expect(s.dia?.done).toEqual({});
    expect(s.dia?.escala).toEqual({});
    expect(s.dia?.como).toBeUndefined();
    expect(s.dia?.tam).toBeUndefined();
  }
});

it('entre datas diferentes o carimbo do dia novo vazio vale nos dois sentidos', () => {
  const ontem = estadoInicial(), hoje = estadoInicial();
  ontem.dia = { data: '2026-11-18', done: { jantar: 80 }, agua: 0, escala: {} };
  hoje.dia = { data: '2026-11-19', done: {}, agua: 0, escala: {} };
  ontem.carimbos = { dia: 100 }; ontem.mtime = ontem.carimbosEm = 100;
  hoje.carimbos = { dia: 200 }; hoje.mtime = hoje.carimbosEm = 200;
  for (const s of nosDoisSentidos(ontem, hoje)) {
    expect(s.dia?.data).toBe(hoje.dia.data);
    expect(s.carimbos?.dia).toBe(200);
  }
});

it('o estado inicial tem os catálogos disponíveis, sem prescrição, agenda, módulos ou registros', () => {
  const s = estadoInicial();
  expect(s.primeiraVez).toBe(1);
  expect([s.prog, s.rot, s.progTreinador, s.comida.plano]).toEqual([{}, [], null, []]);
  expect(rotacao(s, ROT_BASE)).toEqual([]);
  expect(proximoTreino(s, ROT_BASE)).toBeNull();
  expect(s.cadencia).toEqual(Array(7).fill('descanso'));
  expect([s.done, s.logs, s.comidaHist, s.protocolo]).toEqual([[], {}, [], { poses: null, sessoes: [] }]);
  expect(poses(s.protocolo.poses).map(p => p.id)).toEqual(ordemPadrao());
  expect(Object.keys(s.body).sort()).toEqual([...MARCAS_DO_CORPO].sort());
  expect(Object.values(s.body).every(m => m.length === 0)).toBe(true);
  expect((['peso', 'agua', 'cardio', 'fotos', 'comida'] as const).map(k => ligado(s.modulos, k))).toEqual(Array(5).fill(false));
  expect(montaCatalogo(s.ex)['leg-press'].n).toBe('Leg press');
  expect(ALIMENTOS_BASE.arroz.n).toMatch(/arroz/i);
});

it.each([9, 10, 11, 12])('o aparelho vazio mais recente cede os documentos ao plano %i nos dois sentidos', versao => {
  const s = estadoInicial();
  const conta: Estado = JSON.parse(readFileSync(new URL('./fixtures/estado-plano-' + Math.min(versao, 11) + '.json', import.meta.url), 'utf8'));
  conta.plano = versao;
  const aberto = structuredClone(conta.dia!);
  s.dia = { data: aberto.data, agua: 0, done: {}, escala: {} };
  s.mtime = conta.mtime + 10000;
  s.primeiraVez = 4;
  s.carimbos = { dia: s.mtime }; s.carimbosEm = s.mtime;
  s.body.peso.push({ t: s.mtime, v: 72.1 });
  for (const [a, b] of [[s, conta], [conta, s]]) {
    const r = funde(a, b).estado;
    expect(r.primeiraVez).toBeUndefined();
    expect(r.plano).toBe(versao);
    for (const k of ['prog', 'rot', 'comida', 'cadencia', 'protocolo', 'dia'] as const) expect(r[k]).toEqual(conta[k]);
    expect(r.modulos ?? null).toEqual(conta.modulos ?? null);
    expect(r.body.peso).toHaveLength(conta.body.peso.length + 1);
  }
});

it('uma refeição retirada de propósito conserva seu carimbo na fusão de perfis pessoais', () => {
  const antes = estadoInicial(), depois = estadoInicial();
  antes.comida.plano = [{ id: 'minha', n: 'Minha refeição', t: '12:00', quando: 'sempre', itens: [] }];
  antes.carimbos = { comida: 10 }; antes.mtime = antes.carimbosEm = 10;
  depois.carimbos = { comida: 20 }; depois.mtime = depois.carimbosEm = 20;
  for (const [a, b] of [[depois, antes], [antes, depois]]) expect(funde(a, b).estado.comida.plano).toEqual([]);
});

it('o espelho de quem começa vazio mostra as ausências e mantém as tabelas dos catálogos', () => {
  const arquivos = montaArquivos(estadoInicial(), { agora: 1 });
  expect(arquivos['treino/programa.md']).toContain('Nenhum treino no programa');
  expect(arquivos['treino/programa-do-treinador.md']).toContain('Nenhuma prescrição de treino');
  expect(arquivos['nutricao/plano.md']).toContain('Nenhuma refeição no plano');
  expect(arquivos['nutricao/alimentos.csv']).toMatch(/arroz/i);
});

it('o perfil pessoal com pesagens mantém suas escolhas ao receber uma abertura vazia mais recente', () => {
  const usado = estadoInicial(), vazio = estadoInicial();
  usado.primeiraVez = vazio.primeiraVez = 4;
  usado.body.peso.push({ t: 10, v: 81 });
  usado.modulos = { ...usado.modulos, peso: 1 };
  vazio.modulos = { ...vazio.modulos, agua: 1 };
  vazio.mtime = 1000;
  for (const [a,b] of [[vazio, usado], [usado, vazio]]) {
    const r = funde(a,b).estado;
    expect(r.modulos).toEqual(usado.modulos);
    expect(r.body.peso).toEqual(usado.body.peso);
  }
});

function pessoal(t: number, extra: Partial<Estado>, carimbos: Record<string, number>): Estado {
  const s = estadoInicial() as Estado;
  Object.assign(s, extra, { primeiraVez: 4, carimbos, mtime: t, carimbosEm: t });
  return s;
}
const refeicao = (id: string, n: string) => ({ id, n, t: '12:00', quando: 'sempre', itens: [] });
const paoX = { n: 'Pão X', kcal: 280, p: 9, c: 52, g: 3, porcao: 100, meu: 1 };

it('na primeira fusão, uma conta com alimento ou oculto mas sem refeição não apaga o plano do aparelho', () => {
  const plano = [refeicao('cafe', 'Café'), refeicao('almoco', 'Almoço')];
  for (const daConta of [
    { plano: [], alimentos: { 'pao-x': paoX }, ocultos: {} },
    { plano: [], alimentos: {}, ocultos: { aveia: 1 } },
  ]) {
    const conta = pessoal(100, { comida: daConta } as Partial<Estado>, { comida: 100 });
    const celular = pessoal(200, { comida: { plano, alimentos: {}, ocultos: {} } } as Partial<Estado>, { comida: 200 });
    const r = funde(celular, conta, 1000, true).estado;
    expect(r.comida.plano.map(x => x.n)).toEqual(['Café', 'Almoço']);
    for (const id of Object.keys(daConta.alimentos)) expect(r.comida.alimentos[id]).toEqual(paoX);
  }
});

it('na primeira fusão, a semana toda em descanso da conta, mesmo carimbada, não vence os dias de treino do aparelho', () => {
  const conta = pessoal(100, {}, { cadencia: 100 });
  const cadencia = ['treino', 'descanso', 'treino', 'descanso', 'treino', 'descanso', 'descanso'];
  const celular = pessoal(200, { cadencia } as Partial<Estado>, { cadencia: 200 });
  expect(funde(celular, conta, 1000, true).estado.cadencia).toEqual(cadencia);
});

it('o alimento acrescentado na primeira fusão não faz o plano velho da conta vencer a edição mais nova de outro aparelho', () => {
  const conta = pessoal(1000, { comida: { plano: [refeicao('almoco', 'Almoço (conta)')], alimentos: {}, ocultos: {} } } as Partial<Estado>, { comida: 1000 });
  const novo = pessoal(1500, { comida: { plano: [refeicao('almoco', 'do aparelho novo')], alimentos: { 'pao-x': paoX }, ocultos: {} } } as Partial<Estado>, { comida: 1500 });
  const nuvem = funde(novo, conta, 3000, true).estado;
  expect(nuvem.comida.plano.map(x => x.n)).toEqual(['Almoço (conta)']);
  expect(nuvem.comida.alimentos['pao-x']).toEqual(paoX);
  // Outro aparelho com o mesmo plano recebe o alimento.
  const igual = pessoal(1000, { comida: structuredClone(conta.comida) } as Partial<Estado>, { comida: 1000 });
  expect(funde(igual, structuredClone(nuvem), 3100).estado.comida.alimentos['pao-x']).toEqual(paoX);
  // Outro aparelho que editou depois e ainda não subiu mantém a edição.
  const editado = pessoal(2000, { comida: { plano: [refeicao('almoco', 'Almoço editado'), refeicao('jantar', 'Jantar')], alimentos: {}, ocultos: {} } } as Partial<Estado>, { comida: 2000 });
  expect(funde(editado, structuredClone(nuvem), 3100).estado.comida.plano.map(x => x.n)).toEqual(['Almoço editado', 'Jantar']);
});

it('a vitória do aparelho na primeira fusão sobrevive à fusão seguinte com o aparelho que criou a conta', () => {
  const T_N = 1000, T_D = 2000, AGORA = 3000;
  const plano = [refeicao('cafe', 'Café'), refeicao('almoco', 'Almoço')];
  const cadencia = ['treino', 'descanso', 'treino', 'descanso', 'treino', 'descanso', 'descanso'];
  const celular = () => {
    const s = pessoal(T_N, { comida: { plano: structuredClone(plano), alimentos: {}, ocultos: {} }, cadencia } as Partial<Estado>,
      { comida: T_N, cadencia: T_N, prog: T_N, rot: T_N, progTreinador: T_N });
    s.prog = { B: { n: 'Treino B', ex: [] } } as unknown as Estado['prog']; s.rot = ['B'];
    return s;
  };
  // O tablet mexeu e desfez: o documento ficou vazio, mas com carimbo mais novo.
  const tablets: [string, Partial<Estado>, Record<string, number>][] = [
    ['cadastrou um alimento', { comida: { plano: [], alimentos: { 'pao-x': paoX }, ocultos: {} } } as Partial<Estado>, { comida: T_D }],
    ['criou e apagou uma refeição', { comida: { plano: [], alimentos: {}, ocultos: {} } } as Partial<Estado>, { comida: T_D }],
    ['marcou e desmarcou um dia', {}, { cadencia: T_D }],
    ['esvaziou o programa', {}, { prog: T_D, rot: T_D }],
  ];
  for (const [nome, extra, carimbos] of tablets) {
    const tablet = pessoal(T_D, extra, carimbos);
    const primeira = funde(celular(), structuredClone(tablet), AGORA, true).estado;
    const noTablet = funde(structuredClone(tablet), structuredClone(primeira), AGORA + 10).estado;
    const deVolta = funde(structuredClone(primeira), structuredClone(noTablet), AGORA + 20).estado;
    for (const s of [primeira, noTablet, deVolta]) {
      expect(s.comida.plano.map(x => x.n), nome).toEqual(['Café', 'Almoço']);
      expect(s.cadencia, nome).toEqual(cadencia);
      expect(s.rot, nome).toEqual(['B']);
      expect(Object.keys(s.prog), nome).toEqual(['B']);
    }
  }
});
