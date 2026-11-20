// OS AJUSTES no visual novo (Fase 4): a conta e a sincronia, o que aparece,
// a cópia de segurança, o interruptor do visual e o que apaga. Protótipo:
// docs/redesign-3/prototipos/resto.html ("Ajustes"). Dados e ações de sempre:
// `ctx.nuvem`, `ctx.dadosDoApp`, `ctx.exportar`, `ctx.importaArquivo`.
//
// Lembretes: dentro do app, no Hoje (decisão do dono, 17/11/2026). O aviso no
// celular, que no iPhone exige o app instalado e permissão, fica para depois.

import { useState } from 'preact/hooks';
import { Acoes, Apoio, Botao, Caixa, Cabecalho, Chave, Folha, Linha, Saida, Secao } from '../base.jsx';
import { SONDA } from '../../sonda.js';

const PARTES = [['comida', 'Comida', 'o plano e as refeições do dia'], ['agua', 'Água', 'contar copos no Hoje'], ['peso', 'Peso', 'a pesagem da manhã'], ['cardio', 'Cardio', 'as duas sessões da semana'],
                ['dobras', 'Dobras', 'adipômetro, no Corpo'], ['fotos', 'Fotos do corpo', 'sessão a cada 14 dias']];

export function AjustesV3({ ctx }) {
  const n = ctx.nuvem();
  const d = ctx.dadosDoApp();
  return (
    <>
      <Cabecalho titulo="Ajustes" aoVoltar={ctx.fechaAjustes} />
      <Secao titulo="Conta" nota={n.dentro ? n.estado : 'só neste aparelho'}>
        {n.dentro ? (
          <>
            <Linha titulo={n.conta} apoio={n.explica} />
            <Acoes><Botao tipo="contorno" cheio data-a="ajustes-sincroniza" disabled={n.rodando} onClick={ctx.sincronizaAgora}>{n.rodando ? 'Sincronizando…' : 'Sincronizar agora'}</Botao></Acoes>
            <Saida data-a="ajustes-sair" onClick={ctx.sairDaNuvem}>Sair desta conta</Saida>
          </>
        ) : (
          <>
            <Apoio>O app funciona sem conta e sem rede. Com a conta, o registro fica igual no celular e no computador, e as fotos ganham cópia.</Apoio>
            <label class="v3-rotulo" for="nuvem-email">E-mail</label>
            <input id="nuvem-email" class="v3-campo" type="email" inputmode="email" autocomplete="email" value={n.email}
                   onInput={e => ctx.nuvemCampo('email', e.currentTarget.value)} />
            <label class="v3-rotulo" for="nuvem-senha">Senha</label>
            <input id="nuvem-senha" class="v3-campo" type="password" autocomplete="current-password" value={n.senha}
                   onInput={e => ctx.nuvemCampo('senha', e.currentTarget.value)} />
            {n.erro && <p class="v3-erro" role="alert">{n.erro}</p>}
            <Acoes><Botao data-a="ajustes-entrar" disabled={n.rodando} onClick={ctx.entrarNaNuvem}>{n.rodando ? 'Entrando…' : 'Entrar'}</Botao></Acoes>
          </>
        )}
      </Secao>
      <Secao titulo="O que aparece" nota="o treino fica sempre">
        <div>
          {PARTES.map(p => <Chave key={p[0]} titulo={p[1]} apoio={p[2]} ligada={ctx.moduloLigado(p[0])} data-a={'ajustes-' + p[0]} aoMudar={on => ctx.ligaModulo(p[0], on)} />)}
        </div>
      </Secao>
      <Secao titulo="Lembretes" nota="dentro do app, quando você abre">
        <Chave titulo="Véspera das fotos" apoio="um aviso no Hoje, na véspera e no dia da sessão" ligada={ctx.moduloLigado('vesperaFotos')}
               data-a="ajustes-lembrete-fotos" aoMudar={on => ctx.ligaModulo('vesperaFotos', on)} />
        <Apoio>A pergunta da noite já aparece sozinha no Hoje quando alguma refeição fica sem resposta.</Apoio>
      </Secao>
      <Secao titulo="Cópia de segurança" nota={d.backupTxt}>
        <div>
          <Linha titulo="Guardar uma cópia" apoio="um arquivo com todo o registro, sem as fotos" data-a="ajustes-exporta" aoTocar={ctx.exportar} />
          <label class="v3-lin v3-lin-arq">
            <span class="v3-lin-t"><b>Restaurar de um arquivo</b><span>substitui o que está neste aparelho, com confirmação</span></span>
            <input type="file" accept="application/json,.json" hidden data-a="ajustes-importa" onChange={e => ctx.importaArquivo(e.currentTarget)} />
          </label>
          <Linha titulo="Colar a cópia como texto" apoio="quando o arquivo não abre no celular" data-a="ajustes-colar"
                 aoTocar={() => ctx.abreFolha({ k: 'colarCopia' })} />
        </div>
        <Apoio>{d.resumo}. Guardado em: {d.onde}.</Apoio>
      </Secao>
      <Diagnostico entrou={n.dentro} />
      <Secao titulo="Recomeçar">
        <div>
          {d.difTxt && <Linha titulo="Voltar ao programa do treinador" apoio={d.difTxt} data-a="ajustes-restaura-programa" aoTocar={ctx.restauraPrograma} />}
          {d.temPlanoEmbutido && <Linha titulo="Voltar ao plano do nutricionista" apoio="desfaz as suas mudanças na comida" data-a="ajustes-restaura-plano" aoTocar={ctx.restauraPlano} />}
          {/* sem volta: abre a confirmação que diz o que se perde e o que não se perde */}
          <Linha titulo="Voltar ao começo" apoio="apaga tudo o que você registrou neste aparelho" data-a="ajustes-apaga" aoTocar={ctx.apagaTudo} />
        </div>
      </Secao>
      <div class="v3-fim-curto" />
    </>
  );
}

/**
 * COLAR A CÓPIA COMO TEXTO (ds-telas2.js, "f-colar-copia"): para quando o
 * arquivo não abre no celular. O app confere o texto antes e diz o que tem
 * nele; restaurar passa pela mesma porta e pela mesma confirmação do arquivo
 * (`importaTexto`), que diz o que se perde.
 */
export function FolhaColarCopia({ ctx }) {
  const [txt, setTxt] = useState('');
  const [lido, setLido] = useState(null);
  const [erro, setErro] = useState(null);
  const confere = () => {
    setLido(null); setErro(null);
    let o;
    try { o = JSON.parse(txt); } catch (e) { setErro('Isto não é uma cópia do app: o texto não fecha. Copie o arquivo inteiro, do primeiro ao último caractere.'); return; }
    const d = o && o.data ? o.data : o;
    if (!(d && typeof d === 'object' && d.logs && typeof d.logs === 'object' && Array.isArray(d.done))) {
      setErro('Isto não parece uma cópia do app: faltam o histórico de treino e as sessões. Copie o arquivo inteiro.'); return;
    }
    const n = (x, um, varios) => x + ' ' + (x === 1 ? um : varios);
    const pes = d.body && Array.isArray(d.body.peso) ? d.body.peso.length : 0;
    const dias = Array.isArray(d.comidaHist) ? d.comidaHist.length : 0;
    setLido(n(d.done.length, 'sessão', 'sessões') + ', ' + n(dias, 'dia de comida', 'dias de comida') + ', ' + n(pes, 'pesagem', 'pesagens') + '.');
  };
  return (
    <Folha titulo="Colar a cópia" sub="Abra o arquivo .json da cópia, copie tudo e cole aqui." aoFechar={() => ctx.fechaFolha()}>
      <label class="v3-rotulo" for="colar-copia">Texto da cópia</label>
      <textarea id="colar-copia" class="v3-campo v3-texto" data-a="colar-texto" aria-invalid={erro ? 'true' : undefined}
                onInput={e => { setTxt(e.currentTarget.value); setLido(null); setErro(null); }}>{txt}</textarea>
      {erro && <Caixa tom="atencao" titulo="Não é uma cópia do app." nota={erro} />}
      {lido && <Caixa titulo="Cópia lida" nota={lido + ' Restaurar substitui o que está neste aparelho; o app pergunta antes.'} />}
      <Acoes>
        {lido
          ? <Botao data-a="colar-restaura" onClick={() => { ctx.fechaFolha(); ctx.importaTexto(txt); }}>Restaurar esta cópia</Botao>
          : <Botao data-a="colar-confere" aria-disabled={txt.trim() ? undefined : 'true'} onClick={() => { if (txt.trim()) confere(); }}>Conferir o texto</Botao>}
      </Acoes>
    </Folha>
  );
}

// A sonda de tela, para conferir o app no iPhone de verdade. Mede enquanto
// você usa e manda o relatório para a sua conta; quem lê é o computador.
function Diagnostico({ entrou }) {
  const [on, setOn] = useState(SONDA.ligada());
  let ultimo = '';
  try { ultimo = localStorage.getItem('lastro-sonda-ultimo') || ''; } catch (e) {}
  const nota = !entrou ? 'precisa entrar na conta' : on ? (ultimo || 'medindo') : 'desligado';
  return (
    <Secao titulo="Diagnóstico da tela" nota={nota}>
      <Chave titulo="Medir as telas" apoio="enquanto você usa, o app confere cortes e desalinhamentos e manda para a sua conta"
        ligada={on} data-a="ajustes-sonda" aoMudar={v => { SONDA.liga(v); setOn(v); }} />
    </Secao>
  );
}
