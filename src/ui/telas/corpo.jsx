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
import { fmtDec, fmtSig } from '../../dominio/formato';
import { useState } from 'preact/hooks';
import { Teclado } from '../instrumento/teclado.jsx';

/** Uma medida corporal: stepper, botão e a curva das últimas 14 semanas. */
function Medida({ rotulo, nota, valor, passo, unidade, serie, celulas, medidas, aoApagar, onMuda, onRegistrar, acao, dia, onAbrirDia, onDia, children, primeira, teclado, aoAbrirTeclado, aoFecharTeclado, aoTeclar, chave, onde, ondeRascunho, onOnde }) {
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

      {/* A PORTA PARA O TECLADO PRÓPRIO. §6.1 manda próprio aqui, "com a régua
          de 100 g na frente" — o stepper é a régua, e esta é a outra metade da
          frase: "a régua resolve o caso comum e o próprio resolve o resto".
          O resto tem tamanho medido: a primeira pesagem parte de 75 kg, então
          quem pesa 73,6 chegava lá com catorze toques no menos. */}
      {teclado
        ? <Teclado
            texto={teclado.texto} decimal={teclado.decimal} unidade={teclado.unidade}
            rotulo={'digitar ' + rotulo + ' em ' + teclado.unidade}
            aoTeclar={aoTeclar} aoFechar={aoFecharTeclado}
          />
        : <button class="dd-tclbtn" data-a={'tcl-abre-' + (chave || rotulo)} onClick={aoAbrirTeclado}>
            digitar o número
          </button>}

      {/* COMO EU MEDI — só nas medidas com fita (`onOnde` presente). A fita erra
          de posicionamento mais do que a balança varia de água (F43), e repetir
          o ponto vale mais que o número. Na primeira vez é um campo; depois é
          lembrete, com a porta para mudar. Texto do teclado do sistema (§6.1:
          "do sistema para o texto"), e só vai para o histórico junto com a
          medida — escrever aqui não grava nada sozinho. */}
      {onOnde && <ComoMedi chave={chave} onde={onde} rascunho={ondeRascunho} onOnde={onOnde} />}

      {/* A data fica atrás de um link porque registrar no dia é o caso de todo
          dia; retroativo é exceção. O seletor é o nativo do aparelho: a medida
          esquecida pode ser de semanas atrás, e ele alcança qualquer data sem
          o app ter que desenhar um calendário. */}
      {dia && (dia.aberto
        ? <div class="dd-dia">
            <input
              class="ins-input dd-data" type="date" id={'ddia-' + (chave || rotulo)}
              value={dia.iso} max={dia.max}
              onInput={e => onDia(e.currentTarget.value)}
            />
            <p class="ins-body-sm ins-t3 dd-dia-nota">{dia.jaTem}</p>
            {/* A regra do seletor, dita antes do toque: o `max` do campo
                recusa sem dizer nada, e a recusa calada é beco (§7.8). */}
            <p class="ins-body-sm ins-t3 dd-dia-nota">Nunca uma data futura: o dia ainda não aconteceu.</p>
          </div>
        : <button class="dd-diabtn" onClick={onAbrirDia}>
            {/* "Peso de outro dia", e não "outro dia": o botão diz do que é o
                dia que ele troca (§7.8). */}
            {dia.hoje ? rotulo.charAt(0).toUpperCase() + rotulo.slice(1) + ' de outro dia'
                      : 'registrando em ' + dia.txt + ' · trocar'}
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

/** O lembrete de onde a fita passou, ou o campo para dizer isso. */
function ComoMedi({ chave, onde, rascunho, onOnde }) {
  const [mudando, setMudando] = useState(false);
  if (onde && !mudando) {
    return (
      <div class="co-onde">
        <p class="ins-body-sm co-onde-l">como você mediu: {onde}</p>
        <button class="co-ondebtn" data-a={'onde-muda-' + chave} onClick={() => setMudando(true)}>
          mudar como eu medi
        </button>
      </div>
    );
  }
  return (
    <label class="co-onde">
      <span class="ins-label-sm">como eu medi</span>
      <input
        class="ins-input" type="text" id={'onde-' + chave}
        placeholder={onde || 'onde você passou a fita'}
        value={rascunho}
        onInput={e => onOnde(e.currentTarget.value)}
      />
      <span class="ins-body-sm ins-t3">
        Guarde na primeira vez onde você passou a fita. Repetir o ponto vale mais
        que o número em si.
      </span>
    </label>
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
        rotulo="peso da manhã" chave="peso" nota={c.peso.nota} primeira
        valor={c.peso.valor} passo={0.1} unidade="kg" serie={c.peso.serie}
        onMuda={ctx.setPeso} onRegistrar={ctx.registraPeso} acao={c.peso.acao}
        dia={c.peso.dia} onAbrirDia={() => ctx.abreDiaCorpo('peso')}
        onDia={t => ctx.setDiaCorpo('peso', t)}
        medidas={c.peso.medidas} aoApagar={t => ctx.apagaMedida('peso', t)}
        teclado={ctx.tecladoDoCorpo('peso')}
        aoAbrirTeclado={() => ctx.abreTecladoDeCorpo('peso')}
        aoFecharTeclado={ctx.fechaTeclado}
        aoTeclar={t => ctx.tecla(t)}
        celulas={[
          { k: 'm', rotulo: 'média da semana', valor: c.peso.media },
          { k: 'r', rotulo: 'ritmo por semana', valor: c.peso.ritmo, cor: c.peso.ritmoCor }
        ]}
      >
        {/* "Peso da manhã", e não "peso": com a bioimpedância há dois pesos no
            mesmo dia, e "de hoje" deixou de separar (§10.2). A procedência é a
            descrição dele do próprio ato (P6). */}
        <Procedencia>
          da balança de casa, em semi-jejum, antes do treino · a média da semana
          é o número que conta · {c.peso.alvo}
        </Procedencia>
      </Medida>

      <Medida
        rotulo="cintura" nota="1× por semana, em jejum"
        valor={c.cintura.valor} passo={0.5} unidade="cm" serie={c.cintura.serie}
        onMuda={ctx.setCintura} onRegistrar={ctx.registraCintura} acao={c.cintura.acao}
        dia={c.cintura.dia} onAbrirDia={() => ctx.abreDiaCorpo('cintura')}
        onDia={t => ctx.setDiaCorpo('cintura', t)}
        medidas={c.cintura.medidas} aoApagar={t => ctx.apagaMedida('cintura', t)}
        chave="cintura" onde={c.cintura.onde} ondeRascunho={c.cintura.ondeRascunho}
        onOnde={t => ctx.setOnde('cintura', t)}
        teclado={ctx.tecladoDoCorpo('cintura')}
        aoAbrirTeclado={() => ctx.abreTecladoDeCorpo('cintura')}
        aoFecharTeclado={ctx.fechaTeclado}
        aoTeclar={t => ctx.tecla(t)}
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

      {/* AS MEDIDAS COM FITA além da cintura — a decisão 2a do dono (01/10):
          as medidas novas entram como dado do produto. Os pontos e quais vêm
          ligados são da Direção D, tirados da resposta dele na P6. São LEITURA:
          nenhuma entra em regra. */}
      {c.fita.filter(f => f.ligada).map(f => (
        <Medida
          key={f.k} chave={f.k}
          rotulo={f.n} nota={f.atual === '–' ? 'nenhuma medida ainda' : null}
          valor={f.valor} passo={0.5} unidade={f.u} serie={f.serie}
          onMuda={v => ctx.setMedida(f.k, v)} onRegistrar={() => ctx.registraMedida(f.k)}
          acao={f.acao}
          dia={f.dia} onAbrirDia={() => ctx.abreDiaCorpo(f.k)}
          onDia={t => ctx.setDiaCorpo(f.k, t)}
          medidas={f.medidas} aoApagar={t => ctx.apagaMedida(f.k, t)}
          onde={f.onde} ondeRascunho={f.ondeRascunho} onOnde={t => ctx.setOnde(f.k, t)}
          teclado={ctx.tecladoDoCorpo(f.k)}
          aoAbrirTeclado={() => ctx.abreTecladoDeCorpo(f.k)}
          aoFecharTeclado={ctx.fechaTeclado}
          aoTeclar={t => ctx.tecla(t)}
          celulas={[
            { k: 'a', rotulo: 'última medida', valor: f.atual },
            { k: 'd', rotulo: 'desde a primeira · ' + f.u, valor: f.desde }
          ]}
        />
      ))}
      {c.fita.some(f => !f.ligada) && (
        <Secao rotulo="outras medidas com fita" nota="ligue as que você tira sozinho">
          {c.fita.filter(f => !f.ligada).map(f => (
            <div class="crow" key={f.k}>
              <span class="crow-m">{f.n}</span>
              <span class="crow-n">sem medida</span>
              <button class="co-liga" data-a={'liga-' + f.k} onClick={() => ctx.ligaMedida(f.k)}>ligar</button>
            </div>
          ))}
          <Procedencia>
            ligar uma medida não cria cobrança: elas não têm frequência prescrita
            e não entram em regra nenhuma
          </Procedencia>
        </Secao>
      )}

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
      <Secao rotulo="bioimpedância" nota={bio.nota}>
        <p class="ins-body-sm ins-t2 co-bio-i">{bio.instrucao}</p>
        <div class="co-bio">
          {bio.campos.map(c => (
            <label key={c.k} class="co-bio-c">
              <span class="ins-label-sm">{c.rotulo}</span>
              <input
                class="ins-input"
                id={'bio-' + c.k}
                type="text"
                inputMode="decimal"
                aria-label={c.rotulo}
                /* O valor do mês passado fica NO LUGAR até ele mexer: é a
                   premissa da instrução ("toque só no que mudou"), e um
                   placeholder não grava nada — ela mentiria. */
                value={c.k in rascunho ? rascunho[c.k] : c.antes}
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
              {/* "era 17,4 · −0,6", e só "era 3,1" quando não mudou: escrever
                  "sem mudança" seria afirmar uma medida de zero (§10.1). */}
              {c.valor != null && (
                <span class="ins-body-xs ins-t3 co-bio-era">
                  era {c.antes}{(function () {
                    const v = parseFloat(String(c.k in rascunho ? rascunho[c.k] : c.antes).replace(',', '.'));
                    const d = isNaN(v) ? 0 : Math.round((v - c.valor) * 10) / 10;
                    return d ? ' · ' + fmtSig(d) : '';
                  })()}
                </span>
              )}
            </label>
          ))}
        </div>
        <p class="ins-body-xs ins-t3 co-bio-ob">
          Quatro números são obrigatórios. A água corporal total pode ficar vazia — e
          vazia não é zero.
        </p>

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
        {/* "Guardar os cinco", e não "Salvar": aqui o lote É o dado — os cinco
            saíram do mesmo visor, no mesmo minuto —, e o rótulo diz quantos e o
            quê (§10.3). A leitura enviada é a da tela: o que está no lugar mais
            o que ele mudou. */}
        <button class="ins-btn-primary" data-a="registra-bio" onClick={async () => {
          const d = dia || bio.maxISO;
          const leitura = {};
          bio.campos.forEach(c => { leitura[c.k] = c.k in rascunho ? rascunho[c.k] : c.antes; });
          const r = await ctx.registraBio(leitura, d === bio.maxISO ? Date.now() : Date.parse(d + 'T12:00:00'));
          if (r && r.ok) setRascunho({});
        }}>Guardar os cinco</button>
        <p class="ins-body-xs ins-t3 co-bio-nada">
          Nada está registrado até você tocar em Guardar os cinco.
        </p>

        {/* Dois pesos do mesmo dia, com números diferentes, se leem como erro —
            e o reflexo é apagar um. A frase diz o que cada um FAZ (§10.2), e a
            diferença deixa de ser problema. */}
        <Procedencia>
          O peso da manhã é o que a regra do nutricionista lê. O peso da balança
          de bioimpedância fica com os outros quatro números dela, e não entra na
          média da semana.
        </Procedencia>
      </Secao>

      <Fotos f={ctx.protocoloFotos()} ctx={ctx} />
    </>
  );
}
