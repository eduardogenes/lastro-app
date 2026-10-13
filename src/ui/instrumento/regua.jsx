// A RÉGUA DE REPETIÇÕES, a parte de tela.
//
// O desenho é o da Direção D e a decisão é do dono (a 8 das quinze): registrar
// repetição é tocar num número, não digitar. O domínio está em
// `src/dominio/regua.ts`, com o alcance provado; aqui é só o desenho e o toque.
//
// ---- Onde ela abre, e por que não é a zona fixa do protótipo ----
//
// No protótipo a régua mora numa faixa fixa embaixo (`.ctl`), sempre visível,
// servindo "a série atual". A tabela do app deixa preencher QUALQUER série em
// qualquer ordem — não existe "a série atual" —, então a régua abre embaixo da
// LINHA tocada e fecha na escolha. O precedente é a escala de RIR, que o app já
// faz assim e com a razão escrita: *"Aparece embaixo da própria série, com tudo
// à vista — o segundo toque grava e fecha. Não é lista suspensa: suspensa
// esconde as opções até abrir, e custa o mesmo número de toques."*
//
// E é por isso que o `--ins-regua-h` que a frente 4 reservou não nasce aqui:
// aquele token existe para reservar altura de uma faixa FIXA, e esta não é fixa.
//
// ---- Os três toques possíveis, e nenhum deles é um arrasto ----
//
// 1. **Num número** — registra e fecha. É o caso de 48 vezes por semana.
// 2. **Numa seta** — anda a janela inteira (o domínio explica por que não é de
//    um valor por vez). A seta NÃO mostra número: botão que mostra `12` e não
//    registra 12 é a definição do erro de alvo, que a medição A reprova com
//    tolerância zero.
// 3. **Em "outro valor"** — a porta para o que está fora da régua (§6.1). Hoje
//    ela revela o campo, com o teclado numérico do sistema; quando o teclado
//    próprio existir, é ele que atende aqui. **Desvio declarado**, não
//    esquecimento.
//
// `touch-action: pan-y` na faixa (R1) continua declarado no CSS, mesmo sem
// contêiner rolável: é de graça e é o que impede que uma mudança futura de
// layout devolva o arrasto sem ninguém notar.

/**
 * A faixa de valores.
 *
 * `slots` vem de `pagina()` — o componente não calcula nada, e é isso que faz a
 * posição ser derivada do foco (R4) em vez de estado de tela.
 */
export function Regua({ slots, valor, marca, rotulo, corrige, aoEscolher, aoAndar, aoOutro }) {
  return (
    <div class="regua">
      {/* CORRIGIR, e não registrar de novo (§8 da frente 3). Só aparece quando a
          série já está guardada: o que está no disco, e a invariante que o
          toque não quebra — o descanso sai do dado (`serieJaRegistrada`), e o
          caso "corrigir depois de reabrir o app não inicia descanso" é o que
          libera esta frase. */}
      {corrige && (
        <div class="regua-corrige">
          <p class="ins-body-sm regua-corrige-t">{corrige}</p>
          <p class="ins-body-xs ins-t3">O descanso continua de onde estava.</p>
        </div>
      )}
      <div class="regua-faixa" role="group" aria-label={corrige ? 'Repetições · um toque corrige' : rotulo}>
        {slots.map(s => s.tipo === 'anda' ? (
          <button
            key={'anda' + s.dir}
            class="regua-anda"
            data-a={s.dir < 0 ? 'regua-menos' : 'regua-mais'}
            aria-label={s.de === s.ate
              ? `mostrar ${s.de}`
              : `mostrar de ${s.de} a ${s.ate}`}
            onClick={() => aoAndar(s.dir)}
          >{s.dir < 0 ? '‹' : '›'}</button>
        ) : (
          <button
            key={s.v}
            class={'regua-v' + (s.naFaixa ? ' na-faixa' : '') +
                   (s.v === valor ? ' on' : '')}
            data-a={'regua-' + s.v}
            aria-label={`${s.v} repetições`}
            aria-pressed={s.v === valor ? 'true' : 'false'}
            onClick={() => aoEscolher(s.v)}
          >
            {s.v}
            {/* A referência é a ÚLTIMA VEZ, e dizê-la dentro do botão é o que
                torna a régua uma régua em vez de um teclado: ele vê onde
                estava antes de escolher onde está.
                O valor GUARDADO diz "agora", e vence: quando ele é igual ao da
                última vez, a pintura é a de `.on`, e a palavra tem de dizer o
                que a pintura diz (§8.3). O "igual à última" vai para a frase
                depois do toque, onde cabe. */}
            {s.v === valor
              ? <small class="regua-marca">agora</small>
              : s.referencia && marca && <small class="regua-marca">{marca}</small>}
          </button>
        ))}
      </div>
      <button class="regua-outro" data-a="regua-outro" onClick={aoOutro}>
        outro valor
      </button>
    </div>
  );
}
