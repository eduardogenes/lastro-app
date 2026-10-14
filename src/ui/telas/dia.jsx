// O DIA ABERTO, em Dias — a terceira entrega da D (`dias.html`, estados 2, 5,
// 9 e 12).
//
// Os registros vêm primeiro, cada um numa linha que abre: a sessão abre
// inteira; o cardio abre no lugar, com cada campo corrigível no toque e o
// apagar no fim. Quando algo destoa, o app
// aponta e não corrige — dois cardios iguais ficam lado a lado, o segundo em
// âmbar dizendo "igual ao das 7h35", e nada sai sem ele. A comida aparece num
// olhar: os momentos do plano, cada um com a forma do seu estado, e a folha de
// pôr o dia em dia a um toque.

import { TelaCheia } from '../instrumento/telacheia.jsx';
import { Procedencia, Secao } from '../instrumento/primitivos.jsx';

const NOME_DA_MARCA = {
  tudo: 'comi tudo', metade: 'metade', fora: 'fora do plano', nao: 'não comi',
  nsei: 'não sei', sem: 'sem marca'
};

/** A forma de cada estado da comida: forma e palavra, não só cor (a legenda da D). */
function Forma({ marca }) {
  return (
    <svg class={'df ' + marca} viewBox="0 0 20 20" aria-hidden="true">
      {marca === 'tudo' && <><circle cx="10" cy="10" r="8" class="df-cheio" /><path d="M6 10.5l3 3 5-6" class="df-tinta" /></>}
      {marca === 'metade' && <><circle cx="10" cy="10" r="8" class="df-fio" /><path d="M10 2a8 8 0 0 1 0 16z" class="df-cheio" /></>}
      {marca === 'fora' && <><circle cx="10" cy="10" r="8" class="df-fio" /><path d="M4.5 15.5l11-11" class="df-traco" /></>}
      {marca === 'nao' && <><circle cx="10" cy="10" r="8" class="df-fio" /><path d="M5.5 10h9" class="df-traco" /></>}
      {marca === 'nsei' && <><circle cx="10" cy="10" r="8" class="df-trac" /><text x="10" y="14" text-anchor="middle" class="df-q">?</text></>}
      {marca === 'sem' && <circle cx="10" cy="10" r="8" class="df-trac" />}
    </svg>
  );
}

export function Dia({ ctx }) {
  const d = ctx.diaAberto();
  if (!d) return null;
  const temTreino = d.registros.some(r => r.k === 'sessao');
  return (
    <TelaCheia olho={d.procedencia} titulo={d.titulo} aoVoltar={ctx.fechaDia} corpo="hwrap">
      {(d.registros.length > 0 || d.descanso) && (
        <div class="ins-lista dia-reg">
          {d.registros.map(r => r.k === 'sessao'
            ? (
              <button key={'s' + r.t} class="ins-linha dia-linha" data-a="dia-sessao"
                      onClick={() => ctx.abreSessaoDoDia({ k: 'sessao', t: r.t })}>
                <span class="dia-letra" aria-hidden="true">{r.letra === 'fora' ? '•' : r.letra === 'aula' ? 'aula' : r.letra}</span>
                <span class="ins-linha-n">
                  <span class="ins-linha-t">{r.titulo}</span>
                  <span class="ins-linha-s">{r.detalhe}</span>
                </span>
              </button>
            ) : (
              <div key={'c' + r.t} class={'dia-cardio' + (r.igual ? ' igual' : '')}>
                <button class="ins-linha dia-linha" data-a="dia-cardio" aria-expanded={r.aberto ? 'true' : 'false'}
                        onClick={() => ctx.abreCardioDoDia(r.t)}>
                  <span class="dia-letra" aria-hidden="true">♥</span>
                  <span class="ins-linha-n">
                    <span class="ins-linha-t">{r.titulo}</span>
                    <span class="ins-linha-s">{r.detalhe}</span>
                  </span>
                </button>
                {r.aberto && (
                  <div class="dia-cardio-ed">
                    {[['m', 'Modalidade', r.campos.modais], ['min', 'Minutos', r.campos.minutos],
                      ['i', 'Intensidade', r.campos.intensidades]].map(([campo, rotulo, ops]) => (
                      <div key={campo} class="dia-cardio-c">
                        <span class="ins-body-sm ins-t2">{rotulo}</span>
                        <div class="ins-chips">
                          {ops.map(o => (
                            <button key={o.k} class={'ins-chip' + (o.on ? ' on' : '')} aria-pressed={o.on ? 'true' : 'false'}
                                    data-a={'dia-cardio-' + campo + '-' + o.k}
                                    onClick={() => ctx.corrigeCardio(r.t, campo, o.k)}>{o.t}</button>
                          ))}
                        </div>
                      </div>
                    ))}
                    <button class="ins-btn-secondary dia-apaga" data-a="dia-apaga-cardio"
                            onClick={() => ctx.apagaCardio(r.t)}>Apagar este cardio</button>
                  </div>
                )}
              </div>
            ))}
          {d.descanso && (
            <div class="ins-linha dia-linha">
              <span class="dia-letra" aria-hidden="true">desc.</span>
              <span class="ins-linha-n">
                <span class="ins-linha-t">Descanso</span>
                <span class="ins-linha-s">{d.descansoDetalhe}</span>
              </span>
              <button class="ins-btn-secondary" data-a="dia-tira-descanso"
                      onClick={() => ctx.alternaDescansoDoDia(new Date(d.data + 'T12:00:00').getTime())}>
                Tirar a marca
              </button>
            </div>
          )}
        </div>
      )}

      {d.vazio && (
        <div class="dia-vazio">
          <p class="ins-body ins-t1">Nenhum treino, nenhum descanso</p>
          {d.palpite && <p class="ins-body-sm ins-t3">{d.palpite}</p>}
        </div>
      )}

      {/* O que se acrescenta ao dia. "Foi descanso" só onde cabe: um dia com
          treino não aceita a marca, e diz por quê (F156). */}
      <div class="dia-acoes">
        <button class="ins-btn-secondary" data-a="dia-registrar"
                onClick={() => ctx.abreSessaoDoDia({ k: 'lancar', t: new Date(d.data + 'T12:00:00').getTime() })}>
          {temTreino ? 'Outro treino' : 'Registrar treino'}
        </button>
        {d.podeDescanso && !d.descanso && (
          <button class="ins-btn-secondary" data-a="dia-descanso"
                  onClick={() => ctx.alternaDescansoDoDia(new Date(d.data + 'T12:00:00').getTime())}>Foi descanso</button>
        )}
      </div>
      {!d.podeDescanso && (
        <p class="ins-body-xs ins-t3 dia-nota">Este dia tem treino, então não aceita a marca de descanso.</p>
      )}

      {d.comida && (
        <Secao rotulo="a comida do dia" nota={d.comida.resumo}>
          <div class="dia-momentos">
            {d.comida.momentos.map(x => (
              <span key={x.id} class="dia-momento" aria-label={x.nome + ', ' + x.hora + ': ' + NOME_DA_MARCA[x.marca]}>
                <Forma marca={x.marca} />
                <span class="dia-momento-n" aria-hidden="true">{x.nome}</span>
                <span class="dia-momento-h" aria-hidden="true">{x.hora}</span>
              </span>
            ))}
          </div>
          <p class="ins-body-sm ins-t2 dia-agua">Água: {d.comida.agua}. {d.comida.regra}</p>
          <button class="ins-btn-secondary" data-a="dia-poe-em-dia" onClick={() => ctx.abrePoeODia(d.data)}>
            Pôr este dia em dia
          </button>
          {d.comida.plano && <Procedencia>{d.comida.plano}</Procedencia>}
        </Secao>
      )}
    </TelaCheia>
  );
}
