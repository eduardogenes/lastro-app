// A GALERIA das fotos do corpo, e a LIXEIRA (pedido do dono, 13/11/2026).
//
// Todas as fotos, organizadas por sessão, da mais nova para a mais antiga.
// Tocar numa abre em tela cheia, com comparar e apagar. Apagar põe a foto na
// lixeira, por 30 dias, com "Desfazer" no aviso; refazer uma pose também põe a
// anterior lá. Da lixeira, a foto volta para a sessão dela ou sai de vez.

import { TelaCheia } from '../instrumento/telacheia.jsx';
import { Procedencia, Secao, Vazio } from '../instrumento/primitivos.jsx';

function Miniatura({ url, aviso, rotulo }) {
  return url
    ? <img class="ga-img" src={url} alt={rotulo} loading="lazy" />
    : <span class="ga-img ga-vazio">{aviso || 'buscando a foto…'}</span>;
}

function Foto({ g, ctx }) {
  const f = g.foto;
  return (
    <TelaCheia olho={f.data + (f.hora ? ' · ' + f.hora : '')} titulo={f.n} aoVoltar={ctx.fechaFotoDaGaleria} corpo="hwrap ga">
      <div class="ga-cheia"><Miniatura url={f.url} aviso={f.aviso} rotulo={f.n + ', ' + f.data} /></div>
      <div class="ga-acoes">
        <button class="ins-btn-secondary" data-a="galeria-comparar"
                onClick={() => { ctx.fechaFotoDaGaleria(); ctx.abreComparar(f.pose); }}>Comparar</button>
        <button class="ins-btn-secondary ga-apaga" data-a="galeria-apaga"
                onClick={() => ctx.apagaDaGaleria(f.d, f.pose)}>Apagar</button>
      </div>
      <Procedencia>apagar põe a foto na lixeira por 30 dias; dá para desfazer</Procedencia>
    </TelaCheia>
  );
}

function Lixeira({ g, ctx }) {
  return (
    <TelaCheia olho="fotos do corpo" titulo="Lixeira" aoVoltar={ctx.fechaLixeira} corpo="hwrap ga">
      <p class="ins-body-sm ins-t2">
        As fotos apagadas e as substituídas ficam aqui por 30 dias. Depois saem
        de vez, sozinhas, deste aparelho e da nuvem.
      </p>
      {g.lixeira.length === 0 && <Vazio>A lixeira está vazia.</Vazio>}
      <div class="ga-lixo">
        {g.lixeira.map(x => (
          <div class="ga-lixo-i" key={x.k} data-k={x.k}>
            <span class="ga-lixo-m"><Miniatura url={x.url} rotulo={x.n + ', sessão de ' + x.sessao} /></span>
            <span class="ga-lixo-t">
              <b>{x.n}</b>
              <span class="ins-body-xs ins-t2">sessão de {x.sessao}</span>
              <span class="ins-body-xs ins-t3">{x.quando} · {x.restam}</span>
              <span class="ga-lixo-b">
                <button class="ins-btn-secondary" data-a="lixo-restaura" onClick={() => ctx.restauraDaLixeira(x.k)}>Restaurar</button>
                <button class="crow-x" data-a="lixo-apaga" onClick={() => ctx.apagaDaLixeira(x.k)}>Apagar de vez</button>
              </span>
            </span>
          </div>
        ))}
      </div>
      {g.lixeira.length > 1 && (
        <button class="ins-btn-secondary ga-esvazia" data-a="lixo-esvazia" onClick={ctx.esvaziaLixeira}>Esvaziar a lixeira</button>
      )}
    </TelaCheia>
  );
}

export function Galeria({ ctx }) {
  const g = ctx.galeria();
  if (!g) return null;
  if (g.foto) return <Foto g={g} ctx={ctx} />;
  if (g.lixeiraAberta) return <Lixeira g={g} ctx={ctx} />;
  return (
    <TelaCheia olho="fotos do corpo" titulo="Galeria" aoVoltar={ctx.fechaGaleria} corpo="hwrap ga"
               acao={<button class="tc-acao" data-a="abre-lixeira" onClick={ctx.abreLixeira}>
                       Lixeira{g.naLixeira ? ' · ' + g.naLixeira : ''}</button>}>
      {g.sessoes.length === 0 && <Vazio>Nenhuma foto ainda.</Vazio>}
      {g.sessoes.map(s => (
        <Secao key={s.d} rotulo={s.data} nota={s.conta}>
          <div class="ga-grade">
            {s.fotos.map(f => (
              <button key={f.pose} class="ga-cel" data-a={'galeria-' + s.d + '-' + f.pose}
                      onClick={() => ctx.abreFotoDaGaleria(s.d, f.pose)}>
                <Miniatura url={f.url} aviso={f.aviso} rotulo={f.n} />
                <span class="ga-nome">{f.n}</span>
              </button>
            ))}
          </div>
        </Secao>
      ))}
    </TelaCheia>
  );
}
