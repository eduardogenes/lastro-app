// Quais lugares já têm tela no visual novo.
//
// Enquanto um lugar não está aqui, o app mostra a tela antiga dele mesmo com o
// visual novo ligado. Cada fase do plano acrescenta as suas
// (docs/redesign-3/00-plano.md). A chave é a do estado: `agora`, `dias`,
// `corpo`, `semana`, `prescricao`.
//
// Cada tela nova embrulha o próprio conteúdo em `<div class="v3">`: é essa
// classe que liga os estilos do visual novo, e o `<main>` do app fica como é.
import { CorpoV3, FolhaComoMedir, FolhaLigarMedidas, MedirAgora } from './telas/corpo.jsx';
import { FolhaBioV3, FolhaCorrigeMarca, MedidaV3, NaMesmaData, PesoV3 } from './telas/corpoconsulta.jsx';
import { FolhaAulaTexto, FolhaDorEx, FolhaListaTreino, FolhaMenuSessaoV3, FolhaMudarEx, PorEmDiaV3, TreinoEmFoco } from './telas/treino.jsx';
import { ExercicioV3, FolhaFotoV3, FolhaRenomeiaEx, Progressao } from './telas/progressao.jsx';
import { ProgramaV3, RevisaoV3 } from './telas/programa.jsx';
import { ProgramasV3, ProgramaAbertoV3, FolhaReativaPrograma, FolhaRenomeiaPrograma, FolhaRevisaoDoPrograma, FolhaTreinoDoPrograma } from './telas/programas.jsx';
import { FolhaCardioV3, FolhaComiOutra, FolhaOQueAparece, FolhaRefeicaoV3, FolhaRegistrar, FolhaTipoDoDia, HojeV3, PrimeiraVez } from './telas/hoje.jsx';
import { FolhaRegistroTreino, FolhaAjustarRegistro } from './telas/registrotreino.jsx';
import { DiasV3, ResponderDias } from './telas/dias.jsx';
import { FolhaAplicar, FolhaMusculos, RetrospectivaV3, SemanaV3 } from './telas/semana.jsx';
import { FolhaAlimentos, FolhaCompras, FolhaRefeicaoDoPlano, PlanoV3 } from './telas/plano.jsx';
import { AjustesV3, FolhaColarCopia } from './telas/ajustes.jsx';
import { FolhaCatalogo } from './telas/catalogo.jsx';
import { FolhaEditaAlimentoV3, FolhaEditaRefeicaoV3, FolhaSeletorV3 } from './telas/comida.jsx';
import { DiaAbertoV3, FolhaPoeODiaGeralV3, FolhaPoeODiaV3, FolhaSeriePassada, RegistrarPassadoV3, SessaoPassadaV3 } from './telas/diaaberto.jsx';
export const TELAS_V3 = {
  // Fase 2
  corpo: CorpoV3,
  // Fase 4
  agora: HojeV3,
  dias: DiasV3,
  semana: SemanaV3,
  prescricao: PlanoV3
};

// Destinos (tela cheia) e folhas do visual novo. A chave do destino é a da
// camada em `camadasAbertas()` (`src/ui/navegacao.js`: `galeria`, `comparar`,
// `protocolo`…); a da folha é o `k` do item de `view.pilha`. Quem desenha é
// `telaCheia()` e `folhaDe()`, em `src/main.jsx`. Componente recebe `{ ctx }`
// (destino) ou `{ ctx, f }` (folha, com o item da pilha).
import { FolhaAviso } from './base.jsx';
import { SessaoDeFotos, PassosDasFotos, FolhaPreparo } from './telas/sessaofotos.jsx';
import { CameraV3 } from './telas/camera.jsx';
import {
  AjustarV3, CentroDasFotos, Comparar, FolhaFotoComparada, FolhaMandar, GaleriaFotoV3, GaleriaV3, LixeiraV3, NoTempo
} from './telas/consultafotos.jsx';
export const DESTINOS_V3 = {
  pvTreino: PrimeiraVez, pvComida: PrimeiraVez, pvAcompanhar: PrimeiraVez,
  // Fase 1, fotos
  protocolo: SessaoDeFotos,
  passos: PassosDasFotos,
  camera: CameraV3,
  fotos: CentroDasFotos,
  comparar: Comparar,
  noTempo: NoTempo,
  galeria: GaleriaV3,
  galeriaFoto: GaleriaFotoV3,
  lixeira: LixeiraV3,
  ajuste: AjustarV3,
  // Fase 2, corpo
  medidas: MedirAgora,
  evolucao: PesoV3,
  medida: MedidaV3,
  naMesmaData: NaMesmaData,
  // Fase 3, treino
  modoSessao: TreinoEmFoco,
  porEmDia: PorEmDiaV3,
  progressao: Progressao,
  hist: ExercicioV3,
  prog: ProgramaV3,
  programas: ProgramasV3,
  programa: ProgramaAbertoV3,
  revisao: RevisaoV3,
  responderDias: ResponderDias,
  ajustes: AjustesV3,
  // antes da Fase 5: o dia, a sessão passada, o treino que não foi anotado
  dia: DiaAbertoV3,
  sessao: SessaoPassadaV3,
  add: RegistrarPassadoV3,
  retro: RetrospectivaV3
};
export const FOLHAS_V3 = { aviso: FolhaAviso, preparo: FolhaPreparo, fotoComparada: FolhaFotoComparada, mandar: FolhaMandar,
  ligarMedidas: FolhaLigarMedidas, comoMedir: FolhaComoMedir, corrigeMarca: FolhaCorrigeMarca, bio: FolhaBioV3,
  listaTreino: FolhaListaTreino, mudarEx: FolhaMudarEx, dorEx: FolhaDorEx, aulaTexto: FolhaAulaTexto, menuSessao: FolhaMenuSessaoV3,
  renomeiaEx: FolhaRenomeiaEx,
  registroTreino: FolhaRegistroTreino, ajustarRegistro: FolhaAjustarRegistro, registrar: FolhaRegistrar, cardio: FolhaCardioV3, dia: FolhaTipoDoDia, poeODia: FolhaPoeODiaV3, poeODiaGeral: FolhaPoeODiaGeralV3, seriePassada: FolhaSeriePassada,
  editaRefeicao: FolhaEditaRefeicaoV3, seletor: FolhaSeletorV3, editaAlimento: FolhaEditaAlimentoV3, catalogo: FolhaCatalogo, foto: FolhaFotoV3, refeicao: FolhaRefeicaoV3, comiOutra: FolhaComiOutra, oQueAparece: FolhaOQueAparece, musculos: FolhaMusculos, aplicar: FolhaAplicar, colarCopia: FolhaColarCopia,
  refeicaoDoPlano: FolhaRefeicaoDoPlano, alimentos: FolhaAlimentos, compras: FolhaCompras,
  reativaPrograma: FolhaReativaPrograma, renomeiaPrograma: FolhaRenomeiaPrograma, revisaoDoPrograma: FolhaRevisaoDoPrograma,
  treinoDoPrograma: FolhaTreinoDoPrograma };
