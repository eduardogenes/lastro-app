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
import { FolhaListaTreino, FolhaMenuSessaoV3, FolhaMudarEx, FolhaPorEmDia, TreinoEmFoco } from './telas/treino.jsx';
import { ExercicioV3, FolhaRenomeiaEx, Progressao } from './telas/progressao.jsx';
import { ProgramaV3, RevisaoV3 } from './telas/programa.jsx';
import { FolhaOQueAparece, FolhaRefeicaoV3, FolhaRegistrar, HojeV3 } from './telas/hoje.jsx';
import { DiasV3, ResponderDias } from './telas/dias.jsx';
export const TELAS_V3 = {
  // Fase 2
  corpo: CorpoV3,
  // Fase 4
  agora: HojeV3,
  dias: DiasV3
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
  progressao: Progressao,
  hist: ExercicioV3,
  prog: ProgramaV3,
  revisao: RevisaoV3,
  responderDias: ResponderDias
};
export const FOLHAS_V3 = { aviso: FolhaAviso, preparo: FolhaPreparo, fotoComparada: FolhaFotoComparada, mandar: FolhaMandar,
  ligarMedidas: FolhaLigarMedidas, comoMedir: FolhaComoMedir, corrigeMarca: FolhaCorrigeMarca, bio: FolhaBioV3,
  listaTreino: FolhaListaTreino, mudarEx: FolhaMudarEx, menuSessao: FolhaMenuSessaoV3, porEmDia: FolhaPorEmDia,
  renomeiaEx: FolhaRenomeiaEx,
  registrar: FolhaRegistrar, refeicao: FolhaRefeicaoV3, oQueAparece: FolhaOQueAparece };
