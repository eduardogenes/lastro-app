// O DIA, A SESSÃO PASSADA E O TREINO QUE NÃO FOI ANOTADO, no visual novo
// (prerrequisito da Fase 5). Protótipo: docs/redesign-3/prototipos/resto.html
// ("treino-dia", a folha do dia em Dias), na linguagem dos lotes já feitos:
// blocos, linhas que abrem, fichas que gravam no toque.
//
// Os dados e as portas são os de sempre, e nenhum caminho de gravação é novo:
// `ctx.diaAberto`, `ctx.detalheDaSessao`, `ctx.retroativo`, `ctx.poeODiaEmDia`.
// A única diferença de comportamento está na série passada: no visual novo ela
// abre numa folha com as duas réguas (as mesmas da série de hoje) e grava no
// "Guardar", pela mesma porta (`gravaNaPassada`, `lancaSerieDaPassada`).

import { useState } from 'preact/hooks';
import { ic } from '../icones.jsx';
import { Acoes, Apoio, Botao, Caixa, Cabecalho, Fichas, Folha, Linha, Par, Quadros, Respostas, Saida, Secao, Selo, Vazio } from '../base.jsx';
import { Regua } from '../regua.jsx';
import { CamposDoCardio } from '../cardio.jsx';
import { outraCoisa } from './hoje.jsx';

const virgula = n => String(Math.round(n * 100) / 100).replace('.', ',');
const meioDia = data => new Date(data + 'T12:00:00').getTime();
/** "6h02" ou "6:02" → "06h02" (a voz pede a hora com dois dígitos). */
const hh = x => String(x || '').replace(/^(\d)[h:]/, '0$1h').replace(':', 'h');

/** Cada marca da comida, em palavra e num selo (a marca não pode ser só forma). */
const SELO = { tudo: ['ok', null], metade: ['metade', 'quieto'], fora: ['fora', 'atencao'], nsei: ['não sabe', 'quieto'], nao: ['não comeu', 'quieto'], sem: ['sem marca', 'quieto'] };

/**
 * O DIA ABERTO (ds-telas.js, "dia-aberto"): tudo o que aconteceu num dia, para
 * conferir e corrigir. O treino (que abre a sessão), o cardio, o peso, a comida
 * refeição por refeição, e "Pôr o dia em dia" para o que faltou. Quando algo
 * destoa, o app aponta e não corrige: dois cardios iguais ficam lado a lado, o
 * segundo dizendo "igual ao das 7h35".
 */
export function DiaAbertoV3({ ctx }) {
  const d = ctx.diaAberto();
  if (!d) return null;
  const t = meioDia(d.data);
  const poe = () => ctx.abreFolha({ k: 'poeODiaGeral', data: d.data });
  return (
    <>
      <Cabecalho titulo={d.titulo} nota={d.procedencia} aoVoltar={ctx.fechaDia} />
      {d.vazio ? (
        <Secao>
          <Vazio titulo="Nenhum treino, nenhum descanso">
            <p>Este dia ficou em branco. Ele fica fora das contas até você dizer o que foi.{d.palpite ? ' ' + d.palpite : ''}</p>
            <Acoes><Botao data-a="dia-poe" onClick={poe}>Pôr o dia em dia</Botao></Acoes>
          </Vazio>
        </Secao>
      ) : (
        <Secao titulo="Treino">
          <div>
            {d.registros.map(r => r.k === 'sessao'
              ? <Linha key={'s' + (r.sid ?? r.t)} marca={r.letra === 'fora' ? '•' : r.letra === 'aula' ? ic.halter : r.letra} marcaTom="f"
                       titulo={r.titulo} apoio={r.detalhe} data-a="dia-sessao"
                       aoTocar={() => ctx.abreSessaoDoDia({ k: 'sessao', t: r.t, sid: r.sid })} />
              : (
                <div key={'c' + r.t} class={'v3-dia-cardio' + (r.igual ? ' igual' : '')}>
                  <Linha marca={ic.coracao} titulo={r.titulo} apoio={r.detalhe} data-a="dia-cardio" aria-expanded={r.aberto ? 'true' : 'false'}
                         aoTocar={() => ctx.abreCardioDoDia(r.t)} />
                  {r.aberto && (
                    <div class="v3-dia-ed">
                      <CamposDoCardio campos={r.campos} prefixo="dia-cardio-" aoTocar={(campo, k) => ctx.corrigeCardio(r.t, campo, k)} />
                      <Saida data-a="dia-apaga-cardio" onClick={() => ctx.apagaCardio(r.t)}>Apagar este cardio</Saida>
                    </div>
                  )}
                </div>
              ))}
            {d.falta && <Linha titulo="Falta" apoio={d.falta.motivo || 'Sem motivo dito'} />}
            {d.descanso && (
              <div>
                <Linha marca="—" titulo="Descanso" apoio={d.descansoDetalhe} />
                <Saida data-a="dia-tira-descanso" onClick={() => ctx.alternaDescansoDoDia(t)}>Tirar a marca de descanso</Saida>
              </div>
            )}
          </div>
        </Secao>
      )}
      {d.cardioNovo && (
        <Secao titulo="Cardio neste dia">
          <div class="v3-dia-ed">
            <CamposDoCardio campos={d.cardioNovo} prefixo="dia-cardio-novo-" aoTocar={(campo, k) => ctx.cardioNoDiaSet(campo, k)} />
            <Acoes><Botao data-a="dia-cardio-grava" onClick={() => ctx.gravaCardioNoDia()}>Guardar</Botao></Acoes>
            <Apoio>Entra sem hora: o dia é este, a hora não foi anotada.</Apoio>
            {d.cardioNovo.falhou && <Caixa tom="atencao" titulo="Não guardei." nota={d.cardioNovo.falhou} />}
            <Saida data-a="dia-cardio-novo" onClick={ctx.abreCardioNoDia}>Fechar o cardio</Saida>
          </div>
        </Secao>
      )}
      {d.peso && (
        <Secao titulo="Corpo">
          <Linha titulo="Peso" apoio={'às ' + d.peso.hora} valor={d.peso.valor} unidade="kg" data-a="dia-peso"
                 aoTocar={() => ctx.abreFolha({ k: 'corrigeMarca', marca: 'peso', t: d.peso.t, data: d.peso.data + ' às ' + d.peso.hora, u: 'kg', valor: d.peso.v })} />
        </Secao>
      )}
      {d.comida && ctx.moduloLigado('comida') && (
        <Secao titulo="A comida do dia" nota={d.comida.resumo}>
          <div>
            {d.comida.momentos.map(x => {
              const sl = SELO[x.marca] || [x.marca, 'quieto'];
              return <Linha key={x.id} titulo={x.nome} apoio={x.hora + (x.marca === 'fora' && x.tam ? ' · ' + outraCoisa(x.tam) : '')}
                            valor={<Selo tom={sl[1]}>{x.marca === 'tudo' && ic.ok}{sl[0]}</Selo>} />;
            })}
          </div>
          <Apoio>Água: {d.comida.agua}. {d.comida.regra}</Apoio>
          <Saida data-a="dia-poe-em-dia" onClick={() => ctx.abrePoeODia(d.data)}>Corrigir refeição por refeição</Saida>
          {d.comida.plano && <Apoio>{d.comida.plano}</Apoio>}
        </Secao>
      )}
      {!d.vazio && (
        <Secao>
          <Acoes class="v3-acoes-0"><Botao tipo="contorno" cheio data-a="dia-poe" onClick={poe}>Pôr o dia em dia</Botao></Acoes>
        </Secao>
      )}
      <div class="v3-fim-curto" />
    </>
  );
}

/**
 * PÔR O DIA EM DIA (ds-telas.js, "f-poe-dia"): para o dia que ficou em branco,
 * o que foi, de uma vez. Treinei (registra o treino daquele dia), foi descanso,
 * fiz cardio, e a comida numa resposta. O que entra fica marcado como
 * registrado depois.
 */
export function FolhaPoeODiaGeralV3({ ctx, f }) {
  const d = ctx.diaAberto();
  if (!d) return null;
  const resposta = ctx.respostaDoDia(f.data);
  const fecha = fn => () => { ctx.fechaFolha(); fn(); };
  return (
    <Folha titulo="Pôr o dia em dia" sub={d.titulo.charAt(0).toUpperCase() + d.titulo.slice(1) + '. O que entrar aqui fica marcado como registrado depois.'}
           aoFechar={() => ctx.fechaFolha()}>
      <div class="v3-opcoes">
        {d.podeCardio && (
          <Linha marca={ic.coracao} titulo="Fiz cardio" apoio="bike, esteira, outro" data-a="poe-cardio"
                 aoTocar={fecha(() => { if (!d.cardioNovo) ctx.abreCardioNoDia(); })} />
        )}
      </div>
      {ctx.moduloLigado('comida') && (
        <>
          <div class="v3-sec-h v3-folha-h"><h3>A comida</h3></div>
          <Saida data-a="poe-refeicoes" onClick={fecha(() => ctx.abrePoeODia(f.data))}>Corrigir refeição por refeição</Saida>
          <Respostas sobreFundo rotulo="A comida deste dia foi como o plano?" valor={resposta}
                     opcoes={[{ k: 'sim', t: 'Foi, sim' }, { k: 'quase', t: 'Quase' }, { k: 'naosei', t: 'Não lembro' }]}
                     aoResponder={k => ctx.respondeODia(f.data, k)} />
        </>
      )}
    </Folha>
  );
}

/**
 * A SESSÃO PASSADA (ds-telas.js, "sessao-passada"): o começo, o fim e a duração
 * em quadros (tocar corrige), cada série na ordem, em fichas: feita em tinta,
 * registrada depois em areia, não feita só com o contorno, na posição dela (não
 * é falha). Tocar numa abre a série para corrigir.
 */
export function SessaoPassadaV3({ ctx }) {
  const d = ctx.detalheDaSessao();
  if (!d) return null;
  if (d.livre) {
    return (
      <>
        <Cabecalho titulo={d.titulo} nota={d.meta} aoVoltar={ctx.fechaSessao} />
        <Secao>
          <Quadros colunas={3} itens={d.stats.map(s => ({ k: s.k, valor: s.valor, rotulo: s.rotulo }))} />
          {d.grupos.length > 0 && <Apoio>Trabalhou: {d.grupos.join(', ')}.</Apoio>}
          <Apoio>Fora do plano. Conta como dia treinado no calendário e na média da semana, mas não tem carga nem série e não move a sequência.</Apoio>
          <Acoes><Botao tipo="contorno" cheio data-a="sessao-apaga" onClick={() => ctx.editaSessao(d.t)}>{ic.lixo} Apagar este registro</Botao></Acoes>
        </Secao>
        <div class="v3-fim-curto" />
      </>
    );
  }
  const data = (d.cab.meta.split(' · ').filter(x => /\d\d\/\d\d/.test(x))[0]) || d.cab.meta;
  const corrige = d.corrigivel ? () => ctx.abreCorrecaoDoTempo(d.t) : null;
  return (
    <>
      <Cabecalho titulo={d.cab.titulo} nota={data} aoVoltar={ctx.fechaSessao} />
      <Secao>
        <Quadros colunas={3} itens={[
          { k: 'ini', a: 'sessao-ini', valor: hh(d.comeco.hora), rotulo: 'começo', aoTocar: corrige },
          { k: 'fim', valor: d.fim ? (d.fim.aprox ? '~' : '') + hh(d.fim.hora) : '—', rotulo: d.fim && d.fim.aprox ? 'fim, aproximado' : 'fim', aoTocar: corrige },
          { k: 'dur', valor: d.duracaoTxt || '—', rotulo: 'duração' }]} />
        {d.comeco.nota && <Apoio>{d.comeco.nota}</Apoio>}
        {d.corrigindoTempo && (
          <div class="v3-dia-ed">
            <label class="v3-rotulo" for="scomeco">Começo</label>
            <input id="scomeco" class="v3-campo" type="text" inputmode="numeric" placeholder="06:15" value={d.comecoTxt}
                   data-a="sessao-comeco" onInput={e => ctx.comecoNoCampo(d.t, e.currentTarget)} />
            <p class="v3-rotulo">Duração</p>
            <Fichas rotulo="Duração" opcoes={d.duracoes} prefixo="sessao-dur-" aoTocar={k => ctx.corrigeDuracao(d.t, k)} />
            <Apoio>Hoje está {d.duracaoTxt}. O fim anda junto com o começo. Corrigir torna o tempo declarado, e o "aproximado" some.</Apoio>
            <Saida data-a="sessao-corrige-tempo" onClick={() => ctx.abreCorrecaoDoTempo(d.t)}>Fechar a correção do tempo</Saida>
          </div>
        )}
      </Secao>

      <Secao titulo="As séries" nota={d.exercicios.length ? 'toque numa para corrigir' : null}>
        {d.exercicios.length === 0
          ? <Vazio titulo="Nenhuma série registrada"><p>Só a presença.</p></Vazio>
          : (
            <div>
              {d.exercicios.map(x => (
                <div key={x.idEx + (x.chave || '')} class="v3-ss-ex">
                  <div class="v3-ss-n"><b>{x.nome}</b><span>{x.presc}</span></div>
                  <div class="v3-feitas v3-ss-series">
                    {x.series.map(sr => sr.nao
                      ? (sr.lanca
                          ? <button key={sr.k} class="nf" data-a={'serie-' + x.idEx + '-' + sr.k}
                                    aria-label={'série ' + (sr.k + 1) + ': não feita. Tocar lança, se você fez.'}
                                    onClick={() => ctx.abreSeriePassadaV3(x.idEx, x.chave, sr.k)}>não feita</button>
                          : <span key={sr.k} class="nf">não feita</span>)
                      : (
                        <button key={sr.k} class={(sr.dp ? 'dp' : 'f') + ' v3-n'} disabled={!sr.editavel} data-a={'serie-' + x.idEx + '-' + sr.k}
                                aria-label={'série ' + (sr.k + 1) + ': ' + sr.texto + (sr.rir ? ', ' + sr.rir : '') + (sr.dp ? ', registrada depois' : '') + (sr.editavel ? '. Tocar corrige.' : '')}
                                onClick={() => ctx.abreSeriePassadaV3(x.idEx, x.chave, sr.k)}>
                          {!sr.dp && ic.ok}{sr.texto}
                        </button>
                      ))}
                  </div>
                  {x.nota && <p class="v3-ss-nota">{x.nota}</p>}
                </div>
              ))}
              <div class="v3-legm" role="group" aria-label="Legenda das séries">
                <span><i class="t" />feita</span><span><i class="q" />registrada depois</span><span><i class="nf" />não feita</span>
              </div>
            </div>
          )}
        {d.notas.length > 0 && <Apoio>{d.notas.join(' ')}</Apoio>}
      </Secao>

      {d.lousa && (
        <Secao titulo="A lousa da aula" nota={d.lousa.quando}>
          {d.lousa.url
            ? <img class="v3-ex-foto" src={d.lousa.url} alt="Foto da lousa desta aula" />
            : <Apoio>A foto da lousa não está neste aparelho.</Apoio>}
        </Secao>
      )}
      {d.mods && (
        <Secao titulo={d.mods.length === 1 ? 'A mudança do dia' : 'As ' + d.mods.length + ' mudanças do dia'}>
          <Apoio>{d.mods.join(' · ')}</Apoio>
        </Secao>
      )}
      <Secao>
        <Acoes class="v3-acoes-0"><Botao tipo="contorno" cheio data-a="sessao-apaga" onClick={() => ctx.editaSessao(d.t)}>{ic.lixo} Apagar esta sessão</Botao></Acoes>
      </Secao>
      <div class="v3-fim-curto" />
    </>
  );
}

/**
 * A SÉRIE PASSADA (ds-telas.js, "f-serie-passada"): o mesmo par e a mesma
 * régua da série de hoje, o "sobraram quantas?" e apagar. Grava no "Guardar";
 * a série que não foi feita nasce no "Lançar". Se o aparelho recusar, o número
 * fica na folha e a caixa diz o que houve.
 */
export function FolhaSeriePassada({ ctx }) {
  const s = ctx.seriePassadaV3();
  const [carga, setCarga] = useState(s ? s.carga : 0);
  const [reps, setReps] = useState(s ? s.reps : 0);
  const [rir, setRir] = useState(s ? s.rir : null);
  const [qual, setQual] = useState('reps');
  if (!s) return null;
  return (
    <Folha titulo={s.titulo} sub={s.sub} aoFechar={ctx.fechaSeriePassadaV3}>
      {s.semCarga
        ? <Par escolhido="reps" aoEscolher={() => {}} itens={[{ k: 'reps', rotulo: 'repetições', valor: reps }]} />
        : <Par escolhido={qual} aoEscolher={setQual} itens={[{ k: 'carga', rotulo: s.un, valor: virgula(carga) }, { k: 'reps', rotulo: 'repetições', valor: reps }]} />}
      {!s.semCarga && qual === 'carga'
        ? <Regua key="carga" min={0} max={Math.max(60, Math.ceil(carga * 2 / 10) * 10)} passo={s.passo} cada={s.passo >= 2.5 ? 10 : 5}
                 largura={16} valor={carga} aoMudar={setCarga} rotulo={'carga em ' + s.un} passos={false} />
        : <Regua key="reps" min={1} max={Math.max(30, reps + 15)} passo={1} cada={5} largura={30} valor={reps} aoMudar={setReps} rotulo="repetições" passos={false} />}
      {s.faixa && <Apoio>{s.faixa}</Apoio>}
      <p class="v3-apoio">Sobraram quantas? <span class="v3-legenda">(RIR: repetições que sobraram)</span></p>
      <Respostas sobreFundo rotulo="Repetições que sobraram" valor={rir == null ? 'nenhum' : rir}
                 opcoes={s.rirs.map(v => ({ k: v, t: String(v) })).concat([{ k: 'nenhum', t: 'não sei' }])}
                 aoResponder={k => setRir(k === 'nenhum' ? null : k)} />
      {s.falhou && <Caixa tom="atencao" titulo="Não guardei." nota={s.falhou + ' Os números continuam aqui.'} />}
      <Acoes><Botao data-a="passada-guarda" onClick={() => ctx.guardaSeriePassadaV3(s.semCarga ? null : carga, reps, rir)}>
        {s.falhou ? 'Tentar de novo' : s.novo ? 'Lançar a série' : <>{ic.ok} Guardar</>}
      </Botao></Acoes>
      {!s.novo && <Saida data-a="passada-apaga" onClick={ctx.apagaSerieDaPassadaV3}>Apagar esta série</Saida>}
    </Folha>
  );
}

/**
 * REGISTRAR UM TREINO PASSADO ("já treinei e não anotei"): uma pergunta só,
 * que treino foi, e um toque grava a presença. Depois, opcionais: a hora
 * (nenhuma é inventada) e as séries, ou, fora da prescrição, os grupos, a
 * duração e um nome. Cada toque corrige o registro que já existe.
 */
export function RegistrarPassadoV3({ ctx }) {
  const d = ctx.retroativo();
  if (!d) return null;
  return (
    <>
      <Cabecalho titulo={d.titulo} nota={d.procedencia} aoVoltar={ctx.fechaAdicionar} />
      <div class="v3-pad">
        {!d.gravado ? (
          <>
            <h2 class="v3-pergunta-t">{d.pergunta}</h2>
            {d.previsto && <>
              <p class="v3-rotulo">O próximo da sequência naquele dia</p>
              <Linha marca={d.previsto.letra === 'aula' ? ic.halter : d.previsto.letra} titulo={d.previsto.titulo} apoio={d.previsto.detalhe}
                    data-a="lanca-previsto" aoTocar={() => ctx.lancaTreino(d.previsto.k)} />
            </>}
            {d.outros.length > 0 && (
              <>
                <p class="v3-rotulo">Outro da sequência</p>
                <Fichas rotulo="Outro da sequência" opcoes={d.outros} prefixo="lanca-" aoTocar={k => ctx.lancaTreino(k)} />
              </>
            )}
            <Linha titulo="Fora da prescrição" apoio="presença, grupos e duração · não mexe na sequência"
                   data-a="lanca-livre" aoTocar={() => ctx.lancaTreino('livre')} />
            <Apoio>Um toque grava a presença. A hora e as séries vêm depois, se você quiser.</Apoio>
          </>
        ) : (
          <>
            <div class="v3-gravado" role="status"><b>{d.titulo2}</b><span>{d.gravadoEm}</span></div>
            {d.livre ? (
              <>
                <p class="v3-rotulo">O que trabalhou</p>
                <Fichas multipla rotulo="O que trabalhou" opcoes={d.grupos} prefixo="lanca-grupo-" aoTocar={k => ctx.grupoDoLancamento(k)} />
                <p class="v3-rotulo">Quanto tempo</p>
                <Fichas rotulo="Quanto tempo" opcoes={d.duracoes} prefixo="lanca-dur-" aoTocar={k => ctx.duracaoDoLancamento(k)} />
                {d.durAberta && (
                  <input class="v3-campo" type="text" inputmode="numeric" value={d.durMin} placeholder="minutos" aria-label="duração em minutos"
                         data-a="lanca-min" onChange={e => ctx.duracaoDoLancamento(e.currentTarget.value)} />
                )}
                <label class="v3-rotulo" for="lanca-nome">Um nome, se quiser</label>
                <input id="lanca-nome" class="v3-campo" type="text" value={d.nome} placeholder="futevôlei, academia do hotel…"
                       onInput={e => ctx.nomeDoLancamento(e.currentTarget)} onChange={() => ctx.guardaLancamento()} />
                <Apoio>{d.nota}</Apoio>
              </>
            ) : (
              <>
                <p class="v3-rotulo">A hora de início</p>
                <Fichas rotulo="A hora de início" prefixo="lanca-"
                        opcoes={[{ k: 'sem-hora', t: 'Sem hora', on: !d.horaAberta }, { k: 'por-hora', t: 'Pôr a hora', on: d.horaAberta }]}
                        aoTocar={k => k === 'sem-hora' ? ctx.semHoraNoLancamento() : ctx.abreHoraDoLancamento()} />
                {d.horaAberta && (
                  <input id="ahora" class="v3-campo" type="text" inputmode="numeric" value={d.hora} placeholder="06:15" aria-label="hora de início"
                         onInput={e => ctx.horaDoLancamento(e.currentTarget)} />
                )}
                <Apoio>{d.notaHora}</Apoio>
                <p class="v3-rotulo">As séries</p>
                <Linha titulo="Detalhar exercícios e séries" apoio={d.detalhar} data-a="lanca-detalhar" aoTocar={ctx.detalhaLancamento} />
                <Apoio>Só a presença também vale: o treino conta como dia com treino do mesmo jeito, e a sequência anda igual.</Apoio>
                <Apoio>{d.sequencia}</Apoio>
              </>
            )}
            <Acoes><Botao data-a="lanca-pronto" onClick={ctx.fechaAdicionar}>Pronto</Botao></Acoes>
          </>
        )}
      </div>
      <div class="v3-fim-curto" />
    </>
  );
}

const MARCAS = [{ k: 'tudo', t: 'Tudo' }, { k: 'metade', t: 'Metade' }, { k: 'fora', t: 'Fora' }, { k: 'nsei', t: 'Não sei' }, { k: 'nao', t: 'Não comi' }];
const PORCAO = { 0.5: '½', 0.75: '¾', 1: 'cheia', 1.25: '1¼', 1.5: '1½' };
/**
 * A marca que vai com a porção escolhida: dizer a porção é dizer que comeu.
 * "Metade" e a linha ainda sem marca (`vazia`, que `marcaNoDiaPassado` pula)
 * viram "tudo" naquela porção; "fora", "não sei" e "não comi" ficam.
 */
const marcaDaPorcao = m => (!m || m === 'vazia' || m === 'metade') ? 'tudo' : m;

/**
 * PÔR O DIA EM DIA: a comida de um dia passado, uma linha por refeição. O
 * primeiro toque grava o dia inteiro como está sugerido, e cada toque seguinte
 * corrige uma linha; por isso a frase de baixo diz tudo o que ficou gravado.
 * Não há "cancelar" (fechar sem tocar não grava nada) nem "limpar o dia".
 */
export function FolhaPoeODiaV3({ ctx, f }) {
  const [porcao, setPorcao] = useState(null);
  const d = ctx.poeODiaEmDia(f.data);
  if (!d) return null;
  return (
    <Folha titulo="O que você comeu" sub={'Pôr em dia · ' + f.data.split('-').reverse().join('/')} aoFechar={() => ctx.fechaFolha()}>
      {!d.fechado && <Apoio>Nada aqui está registrado até você tocar. O que vem marcado vem pelo horário do plano, não porque o app sabe.</Apoio>}
      <div class="v3-pd">
        {d.linhas.map(l => (
          <div key={l.id} class={'v3-pd-l' + (l.sugerida ? ' sug' : '')}>
            <div class="v3-pd-h"><b>{l.nome}</b><span class="v3-n">{l.hora}</span></div>
            {l.procedencia && <small>{l.procedencia}</small>}
            <small>{l.resumo}</small>
            <Fichas rotulo={'O que comeu: ' + l.nome} prefixo={'marca-' + l.id + '-'}
                    opcoes={MARCAS.map(m => ({ k: m.k, t: m.t, on: !l.sugerida && l.marca === m.k, palpite: !!l.sugerida && l.marca === m.k }))}
                    aoTocar={k => { setPorcao(null); ctx.marcaNoDiaPassado(f.data, l.id, k, null); }} />
            <Saida data-a={'porcao-' + l.id} aria-expanded={porcao === l.id ? 'true' : 'false'}
                   onClick={() => setPorcao(porcao === l.id ? null : l.id)}>porção · {PORCAO[l.escala] || l.escala}</Saida>
            {porcao === l.id && (
              <Fichas rotulo={'Porção: ' + l.nome} prefixo={'porcao-' + l.id + '-'}
                      opcoes={d.porcoes.map(p => ({ k: p, t: PORCAO[p] || String(p), on: l.escala === p }))}
                      aoTocar={p => { setPorcao(null); ctx.marcaNoDiaPassado(f.data, l.id, marcaDaPorcao(l.marca), p); }} />
            )}
          </div>
        ))}
      </div>
      <p class="v3-frase" role="status" aria-live="polite">{d.frase}</p>
      <Apoio>{d.plano}</Apoio>
      <Apoio>Corrigir aqui não apaga nada: marca nova vence a antiga, e o resto fica.</Apoio>
      <Acoes><Botao data-a="poe-pronto" onClick={() => ctx.fechaFolha()}>Pronto</Botao></Acoes>
    </Folha>
  );
}
