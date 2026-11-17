// OS AJUSTES no visual novo (Fase 4): a conta e a sincronia, o que aparece,
// a cópia de segurança, o interruptor do visual e o que apaga. Protótipo:
// docs/redesign-3/prototipos/resto.html ("Ajustes"). Dados e ações de sempre:
// `ctx.nuvem`, `ctx.dadosDoApp`, `ctx.exportar`, `ctx.importaArquivo`.
//
// Lembretes (a pergunta da noite, a véspera das fotos) ficam de fora até o
// dono decidir: no iPhone, aviso exige o app instalado e permissão.

import { Acoes, Apoio, Botao, Cabecalho, Chave, Linha, Saida, Secao } from '../base.jsx';

const PARTES = [['agua', 'Água', 'contar copos no Hoje'], ['peso', 'Peso', 'a pesagem da manhã'], ['cardio', 'Cardio', 'as duas sessões da semana'],
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
      <Secao titulo="O que aparece" nota="treino e comida ficam sempre">
        <div>
          {PARTES.map(p => <Chave key={p[0]} titulo={p[1]} apoio={p[2]} ligada={ctx.moduloLigado(p[0])} data-a={'ajustes-' + p[0]} aoMudar={on => ctx.ligaModulo(p[0], on)} />)}
        </div>
      </Secao>
      <Secao titulo="Cópia de segurança" nota={d.backupTxt}>
        <div>
          <Linha titulo="Guardar uma cópia" apoio="um arquivo com todo o registro, sem as fotos" data-a="ajustes-exporta" aoTocar={ctx.exportar} />
          <label class="v3-lin v3-lin-arq">
            <span class="v3-lin-t"><b>Restaurar de uma cópia</b><span>substitui o que está neste aparelho, com confirmação</span></span>
            <input type="file" accept="application/json,.json" hidden data-a="ajustes-importa" onChange={e => ctx.importaArquivo(e.currentTarget)} />
          </label>
        </div>
        <Apoio>{d.resumo}. Guardado em: {d.onde}.</Apoio>
      </Secao>
      <Secao titulo="Visual">
        <Chave titulo="Visual novo" apoio="desligar volta ao visual antigo neste aparelho" ligada={ctx.visualNovo()} data-a="visual-novo" aoMudar={ctx.alternaVisual} />
      </Secao>
      <Secao titulo="Voltar ao começo">
        <div>
          {d.difTxt && <Linha titulo="Voltar ao programa do treinador" apoio={d.difTxt} data-a="ajustes-restaura-programa" aoTocar={ctx.restauraPrograma} />}
          <Linha titulo="Voltar ao plano do nutricionista" apoio="desfaz as suas mudanças na comida" data-a="ajustes-restaura-plano" aoTocar={ctx.restauraPlano} />
        </div>
        <Saida data-a="ajustes-apaga" onClick={ctx.apagaTudo}>Apagar todo o histórico deste aparelho</Saida>
      </Secao>
      <div class="v3-fim-curto" />
    </>
  );
}
