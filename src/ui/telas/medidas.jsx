// REGISTRAR MEDIDAS — fita e dobras num formulário só (docs/corpo/02, §2.4).
//
// Decisões do dono (06/11/2026):
// - na ordem do corpo, de cima para baixo: peito, braço, cintura, quadril,
//   coxa, panturrilha; depois as dobras;
// - cada campo diz o ponto numa linha curta, e "como medir" abre a instrução
//   ali mesmo, sem trocar de tela (é ali também que se troca o ponto);
// - campo vazio não grava;
// - a medida anterior NÃO aparece enquanto se digita: ela puxa o número de
//   quem mede;
// - depois de salvar, o que mudou demais pede "confira esta medida";
// - dobras só em milímetros, nunca em percentual de gordura.
// Uma data e uma hora para todas, editáveis.

import { TelaCheia } from '../instrumento/telacheia.jsx';
import { Procedencia, Secao } from '../instrumento/primitivos.jsx';

function Campo({ f, ctx }) {
  return (
    <div class={'me-campo' + (f.foco ? ' foco' : '')} data-k={f.k}>
      <div class="me-cab">
        <span class="me-nome">{f.n}</span>
        <button class="me-como" data-a={'como-' + f.k} aria-expanded={f.comoAberto ? 'true' : 'false'}
                onClick={() => ctx.alternaComo(f.k)}>
          {f.comoAberto ? 'fechar' : 'como medir'}
        </button>
      </div>
      <p class="ins-body-xs ins-t3 me-ponto">{f.ponto}</p>
      {f.comoAberto && (
        <div class="me-instr">
          <p class="ins-body-sm ins-t1">{f.como}</p>
          <label class="me-onde">
            <span class="ins-label-sm">ponto onde você mediu</span>
            <input class="ins-input" type="text" id={'onde-' + f.k} value={f.ondeRascunho}
                   placeholder={f.ponto} onInput={e => ctx.setOnde(f.k, e.currentTarget.value)} />
          </label>
        </div>
      )}
      <div class="me-leituras">
        {f.leituras.map((v, i) => (
          <label key={i} class="me-leitura">
            <input class="ins-input" type="text" inputMode="decimal" id={'med-' + f.k + '-' + i}
                   aria-label={f.n + (f.leituras.length > 1 ? ', leitura ' + (i + 1) : '') + ' em ' + f.u}
                   value={v} autoFocus={f.foco && i === 0}
                   onInput={e => ctx.setLeitura(f.k, i, e.currentTarget.value)} />
            <span class="me-u">{f.u}</span>
          </label>
        ))}
        {!f.dobra && f.leituras.length === 1 && (
          <button class="me-mais" data-a={'segunda-' + f.k} onClick={() => ctx.segundaLeitura(f.k)}>+ 2ª leitura</button>
        )}
      </div>
      {f.pedeTerceira && <p class="ins-body-xs me-aviso">As duas diferem mais de 0,5 cm: meça uma terceira.</p>}
      {f.invalida && <p class="ins-body-xs me-aviso">Número inválido.</p>}
      {f.grava && f.leituras.filter(Boolean).length > 1 && <p class="ins-body-xs ins-t3">grava {f.grava}</p>}
    </div>
  );
}

export function Medidas({ ctx }) {
  const m = ctx.medidasForm();
  if (!m) return null;
  return (
    <TelaCheia olho="fita e adipômetro" titulo="Registrar medidas" aoVoltar={ctx.fechaMedidas} corpo="hwrap me">
      {m.salvo && (
        <section class="me-salvo" role="status" data-a="medidas-salvas">
          <b class="ins-body ins-t1">{m.salvo.txt}</b>
          {m.salvo.conferir.length > 0 && (
            <div class="me-conferir">
              {m.salvo.conferir.map(c => (
                <p key={c.k} class="ins-body-sm"><b>Confira esta medida:</b> {c.n}, {c.txt}.</p>
              ))}
              <p class="ins-body-xs ins-t3">Se mediu errado, preencha de novo e salve: a medida do mesmo dia é substituída.</p>
            </div>
          )}
          <button class="ins-btn-secondary" data-a="medidas-fim" onClick={ctx.fechaMedidas}>Voltar para Corpo</button>
        </section>
      )}

      <div class="co-quando">
        <label class="co-quando-c">
          <span class="ins-label-sm">dia</span>
          <input class="ins-input" type="date" id="medidas-dia" value={m.data} max={m.max}
                 onInput={e => ctx.setQuandoDasMedidas('data', e.currentTarget.value)} />
        </label>
        <label class="co-quando-c">
          <span class="ins-label-sm">hora</span>
          <input class="ins-input" type="time" id="medidas-hora" value={m.hora}
                 onInput={e => ctx.setQuandoDasMedidas('hora', e.currentTarget.value)} />
        </label>
      </div>
      <p class="ins-body-xs ins-t3">Preencha o que mediu. Campo vazio não é salvo.</p>

      <Secao rotulo="Fita" nota="cm · lado direito">
        <Procedencia>{m.regraDaFita}</Procedencia>
        {m.fita.map(f => <Campo key={f.k} f={f} ctx={ctx} />)}
      </Secao>

      <Secao rotulo="Dobras com adipômetro" nota="mm · lado direito">
        {m.dobrasAbertas
          ? <>
              <Procedencia>{m.regraDaDobra}</Procedencia>
              {m.dobras.map(f => <Campo key={f.k} f={f} ctx={ctx} />)}
              <button class="me-mais" data-a="dobras-fecha" onClick={ctx.mostraDobras}>Não medi as dobras</button>
            </>
          : <button class="ins-btn-secondary" data-a="dobras-abre" onClick={ctx.mostraDobras}>Medir as dobras também</button>}
      </Secao>

      <div class="me-barra">
        <button class="ins-btn-primary" data-a="medidas-salva" disabled={!m.n} onClick={ctx.salvaMedidas}>{m.salvar}</button>
      </div>
    </TelaCheia>
  );
}
