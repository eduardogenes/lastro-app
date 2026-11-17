// O GRÁFICO DE LINHA do visual novo: uma série no tempo, com os pontos crus
// por baixo, a faixa do alvo e as marcas das sessões de fotos sob o eixo. Uma
// escala só para tudo; a cor vem das classes (`v3-graf-*`), nunca daqui.

const W = 340;

/**
 * @param {object} p
 * @param {{t:number,v:number}[]} p.linha    a série principal (média da semana, ou cada medida)
 * @param {{t:number,v:number}[]} [p.pontos] os valores crus, em pontos claros
 * @param {number[]} [p.marcas]              instantes marcados sob o eixo (sessões de fotos)
 * @param {{t:number,v:number,min:number,max:number}} [p.alvo]  faixa crescendo de min a max por semana
 * @param {number} p.de
 * @param {number} p.ate
 * @param {boolean} [p.bolas]                um círculo em cada ponto da linha
 * @param {string} p.rotulo                  o que o gráfico mostra, para o leitor de tela
 */
export function Grafico({ linha, pontos = [], marcas = [], alvo = null, de, ate, altura = 130, bolas, rotulo }) {
  const H = altura;
  const todos = linha.concat(pontos).map(p => p.v);
  if (alvo) todos.push(alvo.v, alvo.v + (ate - alvo.t) / 604800000 * alvo.max);
  if (!todos.length || ate <= de) return null;
  let mn = Math.min(...todos), mx = Math.max(...todos);
  const folga = Math.max(0.4, (mx - mn) * 0.12);
  mn -= folga; mx += folga;
  const X = t => ((t - de) / (ate - de)) * W;
  const Y = v => H - ((v - mn) / (mx - mn)) * H;
  const dentro = p => p.t >= de - 1 && p.t <= ate + 1;
  const vis = linha.filter(dentro);
  const caminho = vis.map((p, i) => (i ? 'L' : 'M') + X(p.t).toFixed(1) + ' ' + Y(p.v).toFixed(1)).join('');
  const u = vis[vis.length - 1];
  return (
    <svg class="v3-graf" viewBox={`-8 -10 ${W + 16} ${H + 28}`} role="img" aria-label={rotulo}>
      {alvo && (
        <path class="v3-graf-alvo" d={`M${X(Math.max(de, alvo.t))} ${Y(alvo.v)}L${X(ate)} ${Y(alvo.v + (ate - alvo.t) / 604800000 * alvo.max)}L${X(ate)} ${Y(alvo.v + (ate - alvo.t) / 604800000 * alvo.min)}Z`} />
      )}
      {marcas.filter(t => t >= de && t <= ate).map(t => <path key={'m' + t} class="v3-graf-marca" d={`M${X(t).toFixed(1)} ${H + 6}v8`} />)}
      {pontos.filter(dentro).map(p => <circle key={'p' + p.t} class="v3-graf-ponto" cx={X(p.t).toFixed(1)} cy={Y(p.v).toFixed(1)} r="2.6" />)}
      {vis.length > 1 && <path class="v3-graf-linha" d={caminho} />}
      {bolas && vis.map(p => <circle key={'b' + p.t} class="v3-graf-bola" cx={X(p.t).toFixed(1)} cy={Y(p.v).toFixed(1)} r="5" />)}
      {u && <circle class="v3-graf-fim" cx={X(u.t).toFixed(1)} cy={Y(u.v).toFixed(1)} r="6" />}
    </svg>
  );
}
