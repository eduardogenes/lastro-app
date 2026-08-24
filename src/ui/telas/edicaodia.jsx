// A edição do treino de HOJE.
//
// Não é uma tela: acontece dentro de TREINO, no lugar da lista de exercícios,
// porque o assunto é o mesmo treino que está aberto. Sair para outro lugar
// para tirar um exercício e voltar seria perder o fio no meio da sessão.
//
// O contrato inteiro está na barra do topo: nada aqui mexe no programa. As
// mudanças valem hoje, ficam listadas embaixo com "desfazer" ao lado, e a
// decisão de torná-las permanentes vem no fim, uma a uma.

import { AddEx, LinhaEditavel } from '../instrumento/edicao.jsx';

export function EdicaoDoDia({ ctx }) {
  const e = ctx.edicaoDoDia();

  return (
    <>
      <div class="edbar">
        <div>
          <b>Editando o treino {e.dia} de hoje.</b>
          {' '}{e.aviso}
        </div>
        <button class="edbar-b" onClick={ctx.acoesDia.pronto}>pronto</button>
      </div>

      {e.linhas.map(l => <LinhaEditavel key={l.i} l={l} acoes={ctx.acoesDia} />)}

      <button class="edadd" onClick={ctx.acoesAdd.abre}>adicionar exercício</button>

      {e.mods.length > 0 && (
        <div class="edmods">
          <div class="edmods-h ins-label">mudanças de hoje</div>
          {e.mods.map(m => (
            <div class="edmod" key={m.j}>
              <span>{m.txt}</span>
              <button onClick={() => ctx.acoesDia.desfaz(m.j)}>desfazer</button>
            </div>
          ))}
        </div>
      )}

      {e.addEx && <AddEx c={e.addEx} acoes={ctx.acoesAdd} />}
    </>
  );
}
