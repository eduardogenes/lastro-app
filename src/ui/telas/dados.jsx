// DADOS — o motor de regra, e onde o treino ALIMENTA a comida.
//
// A mudança que a fusão trouxe está aqui: `performance` era um interruptor que
// ele ligava na mão dizendo "estou ficando mais forte". Agora o app calcula
// isso das cargas que ele já registrou, mostra a conta, e o interruptor vira
// override — porque o cálculo não sabe que ele voltou de duas semanas doente.

import {
  Cabecalho, GradeMetricas, Procedencia, Secao, Sparkline, Stepper, Vazio, Veredito
} from '../instrumento/primitivos.jsx';
import { fmtDec, fmtSig2 } from '../../dominio/formato';

export function Dados({ ctx }) {
  const d = ctx.dados();

  return (
    <>
      <Cabecalho olho="acompanhamento" titulo="Dados" />

      <Secao primeira rotulo="peso" nota={d.peso.nota}>
        <div class="dd-registro">
          <Stepper valor={d.peso.valor} passo={0.1} min={30} max={200}
                   fmt={v => fmtDec(v) + ' kg'} onMuda={ctx.setPesoRascunho} />
          <button class="ins-btn-primary" onClick={ctx.registraPeso}>registrar hoje</button>
        </div>
        <div class="dd-spark"><Sparkline valores={d.peso.serie} /></div>
        <GradeMetricas colunas={2} celulas={[
          { k: 'm', rotulo: 'média da semana', valor: d.peso.media },
          { k: 'r', rotulo: 'ritmo', valor: d.peso.ritmo, cor: d.peso.ritmoCor }
        ]} />
      </Secao>

      <Secao rotulo="veredito">
        <Veredito
          rotulo="a regra do plano"
          veredito={d.veredito.t}
          cor={d.veredito.cor}
          explicacao={d.veredito.p}
          acao={d.veredito.podeAplicar && (
            <button class="ins-btn-primary" onClick={ctx.aplicaAjuste}>
              {d.veredito.acaoTxt}
            </button>
          )}
          estado={d.veredito.estado}
        />
      </Secao>

      <Secao rotulo="força estimada" nota="e1rm · epley">
        {d.forca.serie.some(x => x != null)
          ? <div class="dd-spark"><Sparkline valores={d.forca.serie} /></div>
          : <Vazio>Ainda não há carga registrada suficiente para estimar.</Vazio>}
        <GradeMetricas colunas={2} celulas={[
          { k: 'a', rotulo: '2 semanas', valor: d.forca.agora },
          { k: 'd', rotulo: 'variação', valor: d.forca.delta, cor: d.forca.cor }
        ]} />
        <Procedencia>{d.forca.txt}</Procedencia>
        <div class="dd-override">
          <span class="ins-body-sm ins-t3">
            O app decide isso sozinho. Assuma na mão só quando ele estiver cego —
            volta de pausa, troca de exercício, semana de deload.
          </span>
          <div class="ins-chips">
            {d.forca.opcoes.map(o => (
              <button key={o.k} class={'ins-chip' + (o.on ? ' on' : '')}
                      onClick={() => ctx.setPerfManual(o.v)}>{o.t}</button>
            ))}
          </div>
        </div>
      </Secao>

      <Secao rotulo="cintura" nota={d.cintura.nota}>
        <div class="dd-registro">
          <Stepper valor={d.cintura.valor} passo={0.5} min={40} max={200}
                   fmt={v => fmtDec(v) + ' cm'} onMuda={ctx.setCinturaRascunho} />
          <button class="ins-btn-secondary" onClick={ctx.registraCintura}>registrar</button>
        </div>
        {d.cintura.mes && <Procedencia>{d.cintura.mes}</Procedencia>}
      </Secao>

      <Secao rotulo="séries por músculo" nota="direta · na semana">
        {d.musculos.length === 0
          ? <Vazio>Nenhuma série registrada nesta semana ainda.</Vazio>
          : <div class="ins-lista">
              {d.musculos.map(m => (
                <div key={m.g} class="ins-linha">
                  <span class="ins-linha-n">
                    <span class="ins-linha-t">{m.g}</span>
                    <span class="ins-linha-s">{m.nota}</span>
                  </span>
                  <span class={'ins-linha-v' + (m.cor ? ' ' + m.cor : '')}>{m.valor}</span>
                </div>
              ))}
            </div>}
        <Procedencia>
          série direta, não estímulo total: tríceps também trabalha nos supinos e
          bíceps nas puxadas.
        </Procedencia>
      </Secao>

      <Secao rotulo="o mês">
        <GradeMetricas colunas={3} celulas={d.mes} />
      </Secao>
    </>
  );
}
