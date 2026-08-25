import { Folha } from '../instrumento/folha.jsx';

/**
 * A foto do aparelho.
 *
 * Vive numa folha, e não no cartão, por duas razões. O cartão aberto já ocupa
 * a maior parte da tela e o que ele existe para mostrar é a tabela de séries;
 * e a partir da segunda semana de um bloco ele não precisa mais da imagem —
 * o exercício fica de 6 a 8 semanas, e a dúvida de "qual aparelho" acontece
 * no começo, na volta de uma pausa, ou quando um substituto entra.
 */
export function FolhaFoto({ ctx, id }) {
  const f = ctx.foto(id);
  if (!f) return null;

  return (
    <Folha titulo={f.nome} olho="o aparelho" aoFechar={ctx.fechaFolha}>
      {f.url
        ? <img class="fotoex" src={f.url} alt={'Aparelho: ' + f.nome} />
        : <p class="ins-body-sm ins-t3 foto-vazio">
            Sem foto. Fotografe o aparelho da sua academia — é ele que responde
            qual dos modelos parecidos é o certo. A imagem fica neste aparelho e
            não vai para o histórico.
          </p>}

      {f.cue && <p class="ins-body-sm ins-t2 foto-cue">{f.cue}</p>}

      {/* `capture` abre a câmera direto no celular e é ignorado no computador,
          onde vira seletor de arquivo — os dois caminhos servem. */}
      <label class="ins-btn-primary foto-b">
        {f.tem ? 'trocar a foto' : 'tirar foto'}
        <input type="file" accept="image/*" capture="environment"
               onChange={e => ctx.tiraFoto(e.currentTarget)} />
      </label>

      {f.tem && (
        <button class="ins-btn-secondary ins-btn-destructive foto-b2"
                onClick={ctx.apagaFoto}>apagar a foto</button>
      )}
    </Folha>
  );
}
