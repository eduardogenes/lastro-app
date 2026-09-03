/* ============================================================
   A BANCADA — o app de mesa, dentro do aparelho que ele espera.

   No computador o app era uma coluna de 460px flutuando no meio de
   um vazio preto, com a tab bar esticada de ponta a ponta da
   janela. Não é o app quebrado: é o app CERTO, na tela errada. Toda
   decisão do projeto — a goteira de 20px, a área segura, o sticky
   que para abaixo do relógio do sistema, o aviso de telefone
   deitado — pressupõe uma tela de 402 × 874 na mão. Numa janela de
   1900px nenhuma delas tem o que provar.

   Então a janela de mesa para de fingir que é telefone e passa a
   ser o que ela é: uma BANCADA, com o aparelho em cima.

   ---- Por que um iframe, e não um CSS de desktop ----

   Simular telefone com `transform: scale()` e uma moldura por cima
   do DOM vivo é o caminho curto, e ele mente em cinco lugares ao
   mesmo tempo:

     · `100svh` continua sendo a altura da JANELA, não da tela;
     · `@media (orientation: landscape)` lê a janela, então o aviso
       de deitado ou some ou aparece sempre;
     · `position: fixed` se ancora na janela — a tab bar escapa da
       moldura, a menos que se ponha `transform` num ancestral, o
       que traz junto uma lista de efeitos colaterais;
     · `position: sticky` troca de âncora se qualquer ancestral
       virar scroll container, que é justo o que a moldura precisa
       ser;
     · a área segura do sistema não existe, e é ela que posiciona
       metade das barras do app.

   Um iframe do MESMO documento não simula nada disso: ele tem uma
   viewport de verdade. 402 × 874 ali dentro É 402 × 874 — media
   query, svh, fixed, sticky e rolagem se resolvem sozinhos, sem uma
   linha de CSS condicional no app. O preço é um documento a mais,
   pago só no computador; o telefone nunca entra por aqui.

   Sobra uma coisa que o iframe não dá: `env(safe-area-inset-*)`
   pertence ao sistema, não à página, e num computador vem zero. Por
   isso a bancada ESCREVE os números na raiz do documento de dentro
   (`aplicaSeguranca`, abaixo), e o app segue tratando `--sa-top` e
   companhia como sempre tratou. É a única concessão, cabe em cinco
   linhas, e está dita na nota do painel: aqui a área segura é
   desenhada, não medida.

   ---- Saída ----

   `?palco=0` na URL desliga a bancada e devolve o app cru na
   janela, para quando o que se quer é a tela e não o objeto.
   ============================================================ */

/**
 * Os aparelhos. Medida em PONTOS (px de CSS), retrato, tal como o
 * Safari os reporta — não em pixels de tela, que é o número que as
 * fichas técnicas anunciam e que não serve para layout nenhum.
 *
 * `sat`/`sab` são a área segura de topo e base em PWA INSTALADO,
 * que é o único jeito como este app é usado. Numa aba comum o
 * Safari devolve outros valores, porque a barra dele já comeu a
 * faixa — simular a aba seria simular o que ninguém vê.
 *
 * `mx`/`my` são a moldura de metal em cada eixo; `rc` é o raio do
 * chassi e `raio` o do vidro. No aparelho com botão os dois queixos
 * fazem `my` valer 84, e é só isso que separa as duas famílias.
 *
 * `botoes` é a silhueta: `l` é o lado (esquerdo ou direito), `y`
 * desce do topo do chassi, `h` é o comprimento. Uma geração só de
 * propósito — misturar iPhone 8 com 16 Pro na mesma prateleira é o
 * que faz um conjunto bom parecer descuidado. O SE fica porque é a
 * tela ESTREITA que ainda existe, e é ela que quebra layout.
 */
const APARELHOS = [
  {
    id: 'se', nome: 'iPhone SE', fam: 'botao',
    w: 375, h: 667, dpr: 2, raio: 2, rc: 46, mx: 12, my: 84, sat: 20, sab: 0,
    botoes: [{ l: 'e', y: 172, h: 30 }, { l: 'e', y: 216, h: 52 },
             { l: 'e', y: 282, h: 52 }, { l: 'd', y: 224, h: 66 }]
  },
  {
    id: '16', nome: 'iPhone 16', fam: 'ilha',
    w: 393, h: 852, dpr: 3, raio: 55, rc: 66, mx: 11, my: 11, sat: 59, sab: 34,
    botoes: [{ l: 'e', y: 128, h: 30 }, { l: 'e', y: 178, h: 62 }, { l: 'e', y: 252, h: 62 },
             { l: 'd', y: 200, h: 96 }, { l: 'd', y: 332, h: 44 }]
  },
  {
    id: '16pro', nome: 'iPhone 16 Pro', fam: 'ilha',
    w: 402, h: 874, dpr: 3, raio: 62, rc: 73, mx: 11, my: 11, sat: 62, sab: 34,
    botoes: [{ l: 'e', y: 132, h: 32 }, { l: 'e', y: 184, h: 64 }, { l: 'e', y: 260, h: 64 },
             { l: 'd', y: 208, h: 100 }, { l: 'd', y: 346, h: 46 }]
  },
  {
    id: '16pm', nome: 'iPhone 16 Pro Max', fam: 'ilha',
    w: 440, h: 956, dpr: 3, raio: 62, rc: 73, mx: 11, my: 11, sat: 62, sab: 34,
    botoes: [{ l: 'e', y: 144, h: 34 }, { l: 'e', y: 200, h: 70 }, { l: 'e', y: 282, h: 70 },
             { l: 'd', y: 226, h: 110 }, { l: 'd', y: 378, h: 50 }]
  }
];

const CHAVE = 'lastro-bancada-v1';
const PADRAO = '16pro';

const busca = new URLSearchParams(location.search);

function aparelhoDe(id) {
  for (let i = 0; i < APARELHOS.length; i++) if (APARELHOS[i].id === id) return APARELHOS[i];
  return null;
}

/**
 * Escreve a área segura de um aparelho na raiz de um documento.
 *
 * Chamada de dois lugares e é de propósito que seja a mesma função:
 * o próprio app, ao abrir dentro da bancada (para que não exista um
 * quadro sequer com a medida errada), e a bancada, a cada troca de
 * aparelho ou giro — trocar por aqui evita recarregar o iframe, e
 * recarregar jogaria fora a aba em que o app estava.
 *
 * Deitado, o iPhone com Face ID some com a barra de status (topo
 * zera), recua a barra de gestos para 21 e passa a recuar os DOIS
 * lados pelo sensor, não só o lado em que ele está — é assim que o
 * conteúdo continua centrado na tela.
 */
function aplicaSeguranca(doc, a, deitado) {
  if (!doc || !doc.documentElement) return;
  const r = doc.documentElement.style;
  const lado = deitado && a.fam === 'ilha' ? a.sat : 0;
  r.setProperty('--sa-top', (deitado ? 0 : a.sat) + 'px');
  r.setProperty('--sa-bottom', (deitado ? (a.sab ? 21 : 0) : a.sab) + 'px');
  r.setProperty('--sa-left', lado + 'px');
  r.setProperty('--sa-right', lado + 'px');
}

/* ============================================================
   RAMO 1 — este documento é O APARELHO (o iframe).

   Roda ANTES do main.jsx porque ele IMPORTA este arquivo — o grafo
   de módulos é o que garante a ordem. As variáveis já estão de pé
   quando a primeira tela é montada, e não existe um quadro sequer
   com a área segura errada.
   ============================================================ */

const dentro = busca.get('palco');
const alvo = dentro && dentro !== '0' ? aparelhoDe(dentro) : null;

if (alvo) {
  aplicaSeguranca(document, alvo, busca.get('deitado') === '1');
  document.documentElement.dataset.palco = 'aparelho';
}

/* ============================================================
   RAMO 2 — este documento é A BANCADA.

   As recusas abaixo são a diferença entre "modo de mesa" e "moldura
   de iPhone aparecendo dentro do iPhone de alguém".
   ============================================================ */

function querBancada() {
  if (alvo) return false;                                   // já é o aparelho
  if (busca.get('palco') === '0') return false;             // saída explícita
  if (window.top !== window.self) return false;             // embutido em outra coisa
  if (!window.matchMedia) return false;
  // Instalado na tela de início: ali a janela É o aparelho.
  if (matchMedia('(display-mode: standalone)').matches) return false;
  if (navigator.standalone) return false;
  // Ponteiro fino é o que separa mesa de toque. Um notebook com tela
  // sensível tem os dois, e ele é mesa — por isso a pergunta é se
  // EXISTE ponteiro fino, não se falta o grosso.
  if (!matchMedia('(pointer: fine)').matches) return false;
  return innerWidth >= 760 && innerHeight >= 420;
}

const bancada = querBancada();

/**
 * O main.jsx importa isto para saber se deve montar.
 *
 * É `import`, e não uma variável em `window`, de propósito: o import é o que
 * FORÇA este arquivo a ser avaliado antes daquele. Um global dependeria da
 * ordem em que o bundler resolveu emitir dois pontos de entrada — que hoje
 * está certa e amanhã é detalhe de implementação do Rollup. E porque a ponte
 * de handlers globais já custou caro uma vez a este projeto: aqui não nasce
 * outra.
 */
export function ehBancada() { return bancada; }

if (bancada) {
  document.documentElement.dataset.palco = 'bancada';
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', montaBancada);
  } else {
    montaBancada();
  }
}

/* ---------------------------------------------------------------- */

function montaBancada() {
  const guardado = leGuardado();
  const estado = {
    aparelho: aparelhoDe(guardado.aparelho) || aparelhoDe(PADRAO),
    deitado: !!guardado.deitado,
    k: 1,
    compacta: null
  };

  const parado = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const raiz = document.createElement('div');
  raiz.className = 'pl';
  raiz.innerHTML = esqueleto();
  document.body.appendChild(raiz);

  const el = {
    cena:     raiz.querySelector('.pl-cena'),
    aparelho: raiz.querySelector('.pl-aparelho'),
    botoes:   raiz.querySelector('.pl-botoes'),
    tela:     raiz.querySelector('.pl-tela'),
    relogio:  raiz.querySelector('.pl-hora'),
    reguaX:   raiz.querySelector('.pl-regua-x'),
    reguaY:   raiz.querySelector('.pl-regua-y'),
    nome:     raiz.querySelector('.pl-nome'),
    leitura:  raiz.querySelector('.pl-leitura'),
    lista:    raiz.querySelector('.pl-lista'),
    girar:    raiz.querySelector('.pl-girar')
  };

  APARELHOS.forEach(function (a) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'pl-item';
    b.dataset.id = a.id;
    b.innerHTML =
      '<span class="pl-marca" aria-hidden="true"></span>' +
      '<span class="pl-item-n">' + a.nome + '</span>' +
      '<span class="pl-item-d">' + a.w + ' × ' + a.h + '</span>';
    b.addEventListener('click', function () { troca(a); });
    el.lista.appendChild(b);
  });

  el.girar.addEventListener('click', gira);

  // A tela só é CARREGADA uma vez. Daí em diante, trocar de aparelho
  // é mudar duas medidas e reescrever a área segura por dentro —
  // recarregar devolveria o app à aba HOJE toda vez que se girasse.
  el.tela.addEventListener('load', seguranca);
  el.tela.src = location.pathname + '?palco=' + estado.aparelho.id +
                (estado.deitado ? '&deitado=1' : '');

  // ---- teclado ----
  // Com ALT, e não com a tecla nua, por uma razão que só aparece usando: assim
  // que se clica em qualquer coisa do app, o foco passa a ser do IFRAME, e
  // tecla nua nem chega aqui — o atalho anunciado no painel simplesmente não
  // funcionaria na maior parte do tempo. Com alt ele pode ser escutado também
  // lá dentro, sem risco de sequestrar uma tecla do app.
  atalhos(document);
  el.tela.addEventListener('load', function () {
    try { atalhos(el.tela.contentDocument); } catch (e) {}
  });

  function atalhos(doc) {
    if (!doc) return;
    doc.addEventListener('keydown', function (e) {
      if (!e.altKey || e.metaKey || e.ctrlKey) return;
      const n = Number(e.key);
      if (n >= 1 && n <= APARELHOS.length) { troca(APARELHOS[n - 1]); e.preventDefault(); return; }
      if (e.key === 'r' || e.key === 'R' || e.code === 'KeyR') { gira(); e.preventDefault(); }
    });
  }

  addEventListener('resize', ajusta);

  pinta();
  relogio();
  if (!parado) el.aparelho.classList.add('pl-pousa');

  /* ------------------------------------------------------------ */

  function troca(a) {
    if (a === estado.aparelho) return;
    estado.aparelho = a;
    guarda();
    pinta();
    assenta(1);
  }

  function gira() {
    estado.deitado = !estado.deitado;
    guarda();
    pinta();
    assenta(estado.deitado ? 1 : -1);
  }

  function seguranca() {
    try { aplicaSeguranca(el.tela.contentDocument, estado.aparelho, estado.deitado); } catch (e) {}
  }

  /**
   * A virada NÃO anima largura e altura.
   *
   * Animar layout aqui significaria o iframe refluindo a 60 quadros
   * por segundo, com o app recalculando a tela inteira em cada um: o
   * que se veria é engasgo, não rotação. As medidas trocam de uma
   * vez, e o que anima é uma virada de 300ms em transform e opacity,
   * que o compositor resolve sem tocar no documento de dentro. O
   * olho lê "virou"; a máquina não paga nada por isso.
   */
  function assenta(sentido) {
    if (parado) return;
    el.aparelho.classList.remove('pl-vira');
    el.aparelho.style.setProperty('--pl-sentido', sentido);
    void el.aparelho.offsetWidth;   // reinicia a animação
    el.aparelho.classList.add('pl-vira');
  }

  /** Desenha tudo o que depende do aparelho e da orientação. */
  function pinta() {
    const a = estado.aparelho;
    const larg = estado.deitado ? a.h : a.w;
    const alt  = estado.deitado ? a.w : a.h;

    raiz.dataset.familia = a.fam;
    raiz.dataset.orientacao = estado.deitado ? 'paisagem' : 'retrato';

    const s = el.cena.style;
    s.setProperty('--pl-w', larg + 'px');
    s.setProperty('--pl-h', alt + 'px');
    s.setProperty('--pl-raio', a.raio + 'px');
    s.setProperty('--pl-rc', a.rc + 'px');
    s.setProperty('--pl-mx', (estado.deitado ? a.my : a.mx) + 'px');
    s.setProperty('--pl-my', (estado.deitado ? a.mx : a.my) + 'px');
    s.setProperty('--pl-sat', a.sat + 'px');

    silhueta(a);
    reguas(larg, alt);
    ajusta();
    seguranca();

    el.tela.title = 'O app num ' + a.nome + ' simulado, ' +
                    (estado.deitado ? 'deitado' : 'em pé');
    el.nome.textContent = a.nome;

    [].forEach.call(el.lista.children, function (b) {
      const on = b.dataset.id === a.id;
      b.classList.toggle('on', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    el.girar.setAttribute('aria-pressed', estado.deitado ? 'true' : 'false');
  }

  /**
   * Os botões físicos, que é o que faz a silhueta ser lida como
   * telefone antes de qualquer detalhe.
   *
   * O giro é anti-horário, e a conta cai fora sozinha: um ponto
   * (x, y) do retrato vai para (y, largura − x). A borda ESQUERDA
   * (x = 0) vira a de BAIXO, a DIREITA vira a de CIMA, e em ambas a
   * distância ao longo da borda continua sendo o mesmo `y` — por
   * isso não há inversão nenhuma aqui, só troca de borda.
   */
  function silhueta(a) {
    el.botoes.innerHTML = a.botoes.map(function (b) {
      const borda = estado.deitado
        ? (b.l === 'e' ? 'baixo' : 'cima')
        : (b.l === 'e' ? 'esq' : 'dir');
      return '<i class="pl-botao" data-borda="' + borda +
             '" style="--pl-b-y:' + b.y + 'px;--pl-b-h:' + b.h + 'px"></i>';
    }).join('');
  }

  /**
   * As réguas. Não são grade de blueprint: são a resposta escrita
   * para "de que tamanho é isto", que é a pergunta que a bancada
   * existe para responder. Traço a cada 50, número a cada 100 na
   * horizontal e a cada 200 na vertical, e a medida final sempre —
   * mesmo fora do passo, porque é ela que interessa.
   */
  function reguas(larg, alt) {
    el.reguaX.innerHTML = ticks(larg, 50, 100);
    // A vertical não repete o zero: a origem já está escrita na horizontal,
    // e os dois a 20px um do outro leem como gagueira, não como medida.
    el.reguaY.innerHTML = ticks(alt, 50, 200).replace('<b>0</b>', '');
  }

  function ticks(total, passo, rotulo) {
    let html = '';
    for (let n = 0; n < total; n += passo) {
      // A medida final é a que interessa, e ela SEMPRE entra. O traço do passo
      // que cai perto demais dela sai — senão 400 e 402 se sobrepõem e os dois
      // ficam ilegíveis, que é pior que faltar um.
      if (total - n < passo * 0.9) continue;
      const marcado = n % rotulo === 0;
      html += '<i class="pl-tick" data-r="' + (marcado ? '1' : '0') +
              '" style="--pl-t:' + n + 'px">' + (marcado ? '<b>' + n + '</b>' : '') + '</i>';
    }
    return html + '<i class="pl-tick" data-r="1" data-fim="1" style="--pl-t:' + total +
           'px"><b>' + total + '</b></i>';
  }

  /**
   * A escala. Nunca AMPLIA: um telefone maior do que é seria a
   * mentira mais fácil de contar aqui. Só reduz, e quando reduz o
   * painel diz de quanto — o número na tela sempre responde de onde
   * veio, inclusive este.
   */
  function ajusta() {
    const a = estado.aparelho;
    const larg = estado.deitado ? a.h : a.w;
    const alt  = estado.deitado ? a.w : a.h;
    const mx = estado.deitado ? a.my : a.mx;
    const my = estado.deitado ? a.mx : a.my;

    // Painel e réguas saem quando a janela aperta: o objeto é o que
    // importa, e a legenda é do que se abre mão primeiro.
    const compacta = innerWidth < 1040;
    if (compacta !== estado.compacta) {
      estado.compacta = compacta;
      raiz.dataset.compacta = compacta ? '1' : '0';
    }

    // 80 = goteira do palco; 260 = painel + vão; 68 = as duas réguas
    // (a da esquerda desenha, a da direita só reserva a simetria); 26 = a de cima.
    const dispW = innerWidth  - 80 - (compacta ? 0 : 260 + 68);
    const dispH = innerHeight - 80 - (compacta ? 0 : 26);

    const k = Math.min(1, dispW / (larg + 2 * mx), dispH / (alt + 2 * my));
    estado.k = Math.max(0.3, Math.round(k * 1000) / 1000);
    el.cena.style.setProperty('--pl-k', estado.k);

    leitura();
  }

  function leitura() {
    const a = estado.aparelho;
    const larg = estado.deitado ? a.h : a.w;
    const alt  = estado.deitado ? a.w : a.h;
    const um = estado.k >= 0.999;
    const lado = estado.deitado && a.fam === 'ilha' ? a.sat : 0;
    const seg = estado.deitado
      ? lado + ' · ' + (a.sab ? 21 : 0)
      : a.sat + ' · ' + a.sab;

    el.leitura.innerHTML = [
      celula('viewport', larg + ' × ' + alt, 'pt · ' + (estado.deitado ? 'paisagem' : 'retrato')),
      celula('densidade', '@' + a.dpr + '×', a.w * a.dpr + ' × ' + a.h * a.dpr + ' px'),
      celula('área segura', seg, estado.deitado ? 'lados · base' : 'topo · base'),
      celula('escala', um ? '1:1' : estado.k.toFixed(2) + '×', um ? 'tamanho real' : 'reduzido para caber')
    ].join('');
  }

  function celula(rotulo, valor, fonte) {
    return '<div class="pl-cel"><span class="ins-label-sm">' + rotulo + '</span>' +
           '<b class="pl-val">' + valor + '</b>' +
           '<i class="ins-provenance">' + fonte + '</i></div>';
  }

  /** O relógio do sistema é do sistema: hora de verdade, virando no minuto. */
  function relogio() {
    const agora = new Date();
    el.relogio.textContent = agora.getHours() + ':' + String(agora.getMinutes()).padStart(2, '0');
    setTimeout(relogio, (60 - agora.getSeconds()) * 1000 + 200);
  }

  function guarda() {
    try {
      localStorage.setItem(CHAVE, JSON.stringify({
        aparelho: estado.aparelho.id, deitado: estado.deitado
      }));
    } catch (e) {}
  }
}

function leGuardado() {
  try { return JSON.parse(localStorage.getItem(CHAVE)) || {}; } catch (e) { return {}; }
}

/* ============================================================
   O esqueleto.

   A ilha, o relógio e a barra de gestos são desenhados AQUI, na
   bancada, e não no app — pela mesma razão que o `body::before` do
   base.css devolve o fundo sob o relógio do iPhone: nada do app deve
   ser desenhado onde o sistema desenha o dele. Aqui quem faz o papel
   do sistema é a bancada, e por isso este é o único pedaço do
   projeto que não usa as fontes do app. Quem escreve o relógio do
   telefone não é o Lastro.

   A camada inteira é `aria-hidden` e sem ponteiro: é cenário, não
   interface. Clicar na ilha é clicar no app que está atrás dela.

   É função e não constante porque `type="module"` é adiado: quando
   este arquivo roda, o DOM já está pronto, `montaBancada()` é
   chamada na mesma passada — e uma `const` declarada aqui embaixo
   ainda estaria na zona morta. Declaração de função sobe inteira.
   ============================================================ */

function esqueleto() {
  return `
<div class="pl-cena">
  <div class="pl-regua pl-regua-y" aria-hidden="true"></div>
  <div class="pl-regua pl-regua-x" aria-hidden="true"></div>

  <div class="pl-aparelho">
    <div class="pl-botoes" aria-hidden="true"></div>

    <div class="pl-queixo pl-queixo-topo" aria-hidden="true">
      <i class="pl-alto-falante"></i><i class="pl-lente"></i>
    </div>

    <div class="pl-vidro">
      <iframe class="pl-tela" title="O app no aparelho simulado"
              allow="camera; microphone; screen-wake-lock; fullscreen; clipboard-write"></iframe>

      <div class="pl-sistema" aria-hidden="true">
        <div class="pl-ilha"><i class="pl-ilha-lente"></i></div>
        <div class="pl-status">
          <span class="pl-hora">--:--</span>
          <span class="pl-icones">
            <svg class="pl-sinal" width="18" height="12" viewBox="0 0 18 12" fill="currentColor">
              <rect x="0"  y="8" width="3" height="4"  rx="1"/>
              <rect x="5"  y="6" width="3" height="6"  rx="1"/>
              <rect x="10" y="3" width="3" height="9"  rx="1"/>
              <rect x="15" y="0" width="3" height="12" rx="1"/>
            </svg>
            <svg class="pl-wifi" width="16" height="12" viewBox="0 0 16 12" fill="currentColor">
              <path d="M8 11.4 5.9 8.9a3.2 3.2 0 0 1 4.2 0L8 11.4Z"/>
              <path d="M3.7 6.3 5 7.8a4.7 4.7 0 0 1 6 0l1.3-1.5a6.7 6.7 0 0 0-8.6 0Z"/>
              <path d="M1.4 3.6 2.7 5.1a8.2 8.2 0 0 1 10.6 0l1.3-1.5a10.2 10.2 0 0 0-13.2 0Z"/>
            </svg>
            <span class="pl-bateria"><i></i></span>
          </span>
        </div>
        <div class="pl-gestos"></div>
      </div>
    </div>

    <div class="pl-queixo pl-queixo-base" aria-hidden="true">
      <i class="pl-home"></i>
    </div>
  </div>

  <div class="pl-horizonte" aria-hidden="true"></div>
</div>

<aside class="pl-painel">
  <div class="pl-id">
    <span class="ins-label">aparelho</span>
    <h2 class="pl-nome"></h2>
  </div>

  <div class="pl-leitura ins-hairgrid"></div>

  <div class="pl-secao">
    <div class="pl-cab">
      <span class="ins-label">prateleira</span>
      <kbd class="pl-tecla">alt 1—4</kbd>
    </div>
    <div class="pl-lista"></div>
  </div>

  <div class="pl-secao">
    <span class="ins-label">bancada</span>
    <button type="button" class="pl-girar pl-acao">
      <span>girar o aparelho</span><kbd class="pl-tecla">alt r</kbd>
    </button>
  </div>

  <p class="pl-nota">Este não é o aparelho. O app foi desenhado para a mão, de
  pé, às 6h15 — aqui a área segura é desenhada pela bancada, não medida pelo
  sistema, e o dedo é um cursor.</p>
</aside>
`;
}
