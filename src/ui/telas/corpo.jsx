// CORPO — como está o corpo, e o que eu registro hoje.
//
// O segundo dos cinco lugares. Vinha dentro do chip "corpo" da tela de Dados,
// e a mudança de endereço traz uma SUBTRAÇÃO que é regra escrita: o veredito da
// regra do nutricionista e o botão do passo de ±150 kcal **saíram daqui** e
// foram para Semana (§1.3 da frente 1, "Não possui").
//
// A razão da subtração: Corpo responde "como está o corpo, e o que eu registro
// hoje". O veredito responde outra pergunta — "dá para mexer na comida?" —, e
// ela é da semana, não do dia. O que fica no topo de cada medida é a média da
// semana e a taxa contra o alvo, porque é o que diz se o peso de HOJE significa
// alguma coisa; a decisão que se tira disso é de outro lugar.
//
// O que Corpo não possui, e está declarado: a força, as séries por músculo e os
// padrões de comida são de Semana; nenhuma prescrição mora aqui — o calendário
// de pesagem e de fotos vem de fora.

import {
  Cabecalho, GradeMetricas, Procedencia, Secao, Sparkline, Stepper, Vazio
} from '../instrumento/primitivos.jsx';
import { fmtDec } from '../../dominio/formato';
import { useState } from 'preact/hooks';

/** Uma medida corporal: stepper, botão e a curva das últimas 14 semanas. */
function Medida({ rotulo, nota, valor, passo, unidade, serie, celulas, medidas, aoApagar, onMuda, onRegistrar, acao, dia, onAbrirDia, onDia, children, primeira }) {
  return (
    <Secao rotulo={rotulo} nota={nota} primeira={primeira}>
      <div class="dd-registro">
        <Stepper
          valor={valor} passo={passo} min={20} max={250}
          fmt={v => fmtDec(v) + ' ' + unidade}
          onMuda={onMuda}
        />
        <button class="ins-btn-secondary" onClick={onRegistrar}>{acao}</button>
      </div>

      {/* A data fica atrás de um link porque registrar no dia é o caso de todo
          dia; retroativo é exceção. O seletor é o nativo do aparelho: a medida
          esquecida pode ser de semanas atrás, e ele alcança qualquer data sem
          o app ter que desenhar um calendário. */}
      {dia && (dia.aberto
        ? <div class="dd-dia">
            <input
              class="ins-input dd-data" type="date" id={'ddia-' + rotulo}
              value={dia.iso} max={dia.max}
              onInput={e => onDia(e.currentTarget.value)}
            />
            <p class="ins-body-sm ins-t3 dd-dia-nota">{dia.jaTem}</p>
          </div>
        : <button class="dd-diabtn" onClick={onAbrirDia}>
            {dia.hoje ? 'outro dia' : 'registrando em ' + dia.txt + ' · trocar'}
          </button>)}

      {serie.some(x => x != null)
        ? <div class="dd-spark"><Sparkline valores={serie} /></div>
        : <Vazio>Nenhuma medida registrada ainda.</Vazio>}

      <GradeMetricas colunas={2} celulas={celulas} />
      {children}

      {/* As últimas medidas, com a porta de saída ao lado. É o único caminho
          para desfazer um 743 digitado no lugar de 74,3 — e sem ele o erro
          entra na média da semana e não sai mais. */}
      {medidas && medidas.length > 0 && (
        <div class="dd-medidas">
          {medidas.map(x => (
            <div class="crow" key={x.t}>
              <span class="crow-d ins-label">{x.data}</span>
              <span class="crow-m ins-data">{x.valor}</span>
              <button class="crow-x" onClick={() => aoApagar(x.t)}>remover</button>
            </div>
          ))}
        </div>
      )}
    </Secao>
  );
}

/**
 * As fotos de acompanhamento.
 *
 * Fica entre cintura e força de propósito: é a terceira série do mesmo assunto
 * — está funcionando? —, e a única que não vira número. Separá-la numa aba
 * própria a transformaria em álbum.
 *
 * Os dias desde a última sessão são INFORMAÇÃO, não cobrança. Passar de 14 põe
 * o número em âmbar e para por aí: não há sequência, não há medalha e não há
 * tela de parabéns em lugar nenhum deste produto.
 */
function Fotos({ f, ctx }) {
  return (
    <Secao rotulo="fotos" nota={f.nota}>
      <div class="dd-fotos">
        <GradeMetricas
          colunas={2}
          celulas={[
            { k: 'd', rotulo: 'dias desde a última', valor: f.dias, cor: f.diasCor },
            { k: 'c', rotulo: 'cadência', valor: f.cadencia }
          ]}
        />

        {f.tem && (
          <div class="dd-fotos-pontos" aria-label="poses da última sessão">
            {f.pontos.map(p => (
              <span key={p.id} class={'dd-fotos-p' + (p.feita ? ' feita' : '')} title={p.n} />
            ))}
          </div>
        )}

        <div class="dd-fotos-b">
          <button class="ins-btn-primary" onClick={ctx.abreProtocolo}>{f.cta}</button>
          {f.podeComparar && (
            <button class="ins-btn-secondary" onClick={ctx.abreComparar}>comparar</button>
          )}
        </div>
      </div>

      <Procedencia>
        de manhã, em jejum, junto com a pesagem · as marcas de fita no chão são
        o que faz duas sessões serem comparáveis
      </Procedencia>
      <Procedencia>
        as fotos ficam neste aparelho e no seu bucket privado · não entram no
        backup em JSON
      </Procedencia>
    </Secao>
  );
}

export function Corpo({ ctx }) {
  // Rascunho local: nada é registro até o toque em "registrar a leitura", e é a
  // mesma regra da folha de pôr o dia em dia. Fechar a tela sem tocar não grava.
  const [rascunho, setRascunho] = useState({});
  const [dia, setDia] = useState(null);
  const c = ctx.corpo();
  const bio = ctx.bioimpedancia();

  return (
    <>
      <Cabecalho olho="como está" titulo="Corpo" />

      <Medida
        rotulo="peso" nota={c.peso.nota} primeira
        valor={c.peso.valor} passo={0.1} unidade="kg" serie={c.peso.serie}
        onMuda={ctx.setPeso} onRegistrar={ctx.registraPeso} acao={c.peso.acao}
        dia={c.peso.dia} onAbrirDia={() => ctx.abreDiaCorpo('peso')}
        onDia={t => ctx.setDiaCorpo('peso', t)}
        medidas={c.peso.medidas} aoApagar={t => ctx.apagaMedida('peso', t)}
        celulas={[
          { k: 'm', rotulo: 'média da semana', valor: c.peso.media },
          { k: 'r', rotulo: 'ritmo por semana', valor: c.peso.ritmo, cor: c.peso.ritmoCor }
        ]}
      >
        <Procedencia>
          a média da semana é o número que conta · {c.peso.alvo}
        </Procedencia>
      </Medida>

      <Medida
        rotulo="cintura" nota="1× por semana, em jejum"
        valor={c.cintura.valor} passo={0.5} unidade="cm" serie={c.cintura.serie}
        onMuda={ctx.setCintura} onRegistrar={ctx.registraCintura} acao={c.cintura.acao}
        dia={c.cintura.dia} onAbrirDia={() => ctx.abreDiaCorpo('cintura')}
        onDia={t => ctx.setDiaCorpo('cintura', t)}
        medidas={c.cintura.medidas} aoApagar={t => ctx.apagaMedida('cintura', t)}
        celulas={[
          { k: 'a', rotulo: 'última medida', valor: c.cintura.atual },
          { k: 'm', rotulo: 'no mês · cm', valor: c.cintura.mesValor }
        ]}
      >
        <Procedencia>{c.cintura.mes}</Procedencia>
        <Procedencia>
          meça sempre no mesmo ponto, em jejum, sem prender a barriga. Fita
          mal posicionada erra mais do que a balança varia de água.
        </Procedencia>
      </Medida>

      {/* A BIOIMPEDÂNCIA — cinco campos, decisão do dono (5.a' P3).
          Existia no modelo desde a migração da frente 0, com verbo próprio e
          casos de teste, e NÃO TINHA TELA: era capacidade sem porta. Esta é a
          porta.

          O peso dela é registro SEPARADO da pesagem da manhã, e é a razão de
          ele aparecer aqui como um campo entre os cinco em vez de somar à
          balança de cima: são duas balanças, medidas em momentos diferentes, e
          misturá-las faria a média semanal do peso — o número que a regra
          calórica lê — pular conforme qual balança ele usou.

          As CINCO de uma vez, e não uma por uma: `registraBio` grava com um
          instante só, e é isso que as torna UMA leitura — é por ele que a fusão
          casa o mesmo dia vindo de dois aparelhos. Por isso a tela recusa a
          leitura incompleta em vez de gravar o que deu: metade de uma leitura
          não é meia leitura, é uma leitura errada. */}
      <Secao rotulo="bioimpedância"
             nota={bio.tem ? 'última leitura ' + bio.ultima : 'nenhuma leitura ainda'}>
        <div class="co-bio">
          {bio.campos.map(c => (
            <label key={c.k} class="co-bio-c">
              <span class="ins-label-sm">
                {c.n}{!c.obrigatorio && <em class="co-bio-op"> · opcional</em>}
              </span>
              <input
                class="ins-input"
                id={'bio-' + c.k}
                type="text"
                inputMode="decimal"
                placeholder={c.txt}
                aria-label={c.n + ' em ' + c.u}
                value={rascunho[c.k] || ''}
                /* Atualizador FUNCIONAL, e não `Object.assign` sobre o
                   `rascunho` do render. Os cinco campos são controlados pelo
                   mesmo objeto, e a versão por closure lia o estado do ÚLTIMO
                   render: dois campos preenchidos antes de o Preact repintar
                   e o segundo apagava o primeiro. Com `prev` cada campo soma ao
                   que já estava, qualquer que seja a ordem dos eventos. */
                onInput={e => {
                  const v = e.currentTarget.value;
                  setRascunho(prev => Object.assign({}, prev, { [c.k]: v }));
                }}
              />
            </label>
          ))}
        </div>

        {/* A data fica atrás de um campo porque registrar no dia é o caso de
            todo dia; retroativo é exceção. `max` é hoje: leitura no futuro não
            é leitura, e o verbo também recusa — a tela só evita o toque. */}
        <label class="co-bio-dia">
          <span class="ins-label-sm">em</span>
          <input class="ins-input" type="date" id="bio-dia"
                 max={bio.maxISO} value={dia || bio.maxISO}
                 aria-label="data da leitura"
                 onInput={e => setDia(e.currentTarget.value)} />
        </label>

        {/* HOJE é `Date.now()`, e não meio-dia de hoje. Eu havia escrito meio-dia
            para todos os dias, e o verbo recusou a leitura: antes do meio-dia,
            o meio-dia de hoje está no FUTURO, e leitura no futuro não é leitura.
            Para um dia PASSADO o meio-dia é a escolha certa — a hora não foi
            medida, e meio-dia não encosta em nenhuma borda de fuso. */}
        <button class="ins-btn-primary" data-a="registra-bio" onClick={() => {
          const d = dia || bio.maxISO;
          ctx.registraBio(rascunho, d === bio.maxISO ? Date.now() : Date.parse(d + 'T12:00:00'));
          setRascunho({});
        }}>registrar a leitura</button>

        <Procedencia>
          as cinco entram com o MESMO instante, e é isso que as torna uma
          leitura só · o peso daqui não entra na média da pesagem da manhã
        </Procedencia>
      </Secao>

      <Fotos f={ctx.protocoloFotos()} ctx={ctx} />
    </>
  );
}
