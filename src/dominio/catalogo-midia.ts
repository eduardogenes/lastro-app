// A mídia dos exercícios (docs/catalogo/00-desenho.md, Fase D): o vídeo de
// referência da execução (YouTube, só o trecho: início e fim em segundos) e,
// quando houver, a animação (duas imagens, início e pico, com fonte e licença).
//
// Os vídeos vieram da pesquisa de 24/11 (~/lastro-rascunho/antigravity/
// videos-v30.json, o principal de cada um, links conferidos) e entram como
// semente; a curadoria de verdade (trocar, sugerir) é da Fase F. Animações
// ainda não: dependem do download autorizado pelo dono (fontes livres, D6).
//
// Chave: o id do catálogo do sistema. O nome que o treinador usa leva até ele
// pelo nome alternativo (ex.: "Crucifixo inverso no peck deck" → reverse-pec-deck).

import type { IdEx } from './tipos';

export interface VideoDoEx { yt: string; inicio: number; fim: number; canal: string; idioma: string }
export interface AnimDoEx { inicio: string; pico: string; fonte: string; licenca: string; credito: string }
export interface MidiaDoEx { video?: VideoDoEx; anim?: AnimDoEx }

export const MIDIA: Record<IdEx, MidiaDoEx> = {
  'supino-inclinado-no-smith': { video: { yt: 'WP1VLAt8hbM', inicio: 82, fim: 113, canal: 'Leandro Twin', idioma: 'pt' } },
  'barra-fixa': { video: { yt: 'thg6cGXSlvY', inicio: 19, fim: 81, canal: 'Leandro Twin', idioma: 'pt' } },
  'remada-na-maquina-com-apoio-de-peito': { video: { yt: 'QyvIEdEHzHc', inicio: 70, fim: 97, canal: 'Leandro Twin', idioma: 'pt' } },
  'chest-press-horizontal-convergente': { video: { yt: 'bKSvckCwvh4', inicio: 32, fim: 86, canal: 'Laércio Refundini - Aulas', idioma: 'pt' } },
  'elevacao-lateral-na-maquina': { video: { yt: 'IwWvZ0rlNXs', inicio: 122, fim: 165, canal: 'Leandro Twin', idioma: 'pt' } },
  'reverse-pec-deck': { video: { yt: 'wjlX-5DTjBQ', inicio: 14, fim: 52, canal: 'Laércio Refundini - Aulas', idioma: 'pt' } },
  'alongamento-do-flexor-do-quadril-ajoelhado': { video: { yt: 'gqoPYLUgP48', inicio: 5, fim: 58, canal: '[P]rehab', idioma: 'en' } },
  'mobilidade-de-quadril-90-90': { video: { yt: 'fmc0mIj6Ewc', inicio: 17, fim: 75, canal: 'Ricardo Fisiologista', idioma: 'pt' } },
  'cadeira-flexora-sentada': { video: { yt: 'ra3Sf4-RFr8', inicio: 86, fim: 131, canal: 'Laércio Refundini - Aulas', idioma: 'pt' } },
  'belt-squat': { video: { yt: '04YYmk7R2G0', inicio: 160, fim: 245, canal: 'Prof. Dr. João Moura', idioma: 'pt' } },
  'elevacao-pelvica-na-maquina': { video: { yt: 'CQebwTfJjas', inicio: 115, fim: 225, canal: 'Tay Training', idioma: 'pt' } },
  'cadeira-extensora': { video: { yt: 'el3oHblB5DM', inicio: 48, fim: 86, canal: 'Leandro Twin', idioma: 'pt' } },
  'adutora': { video: { yt: 'Wf602gn_9zU', inicio: 52, fim: 72, canal: 'Leandro Twin', idioma: 'pt' } },
  'panturrilha-no-leg-press': { video: { yt: 'wCXvfH_-BLg', inicio: 9, fim: 31, canal: 'Leandro Twin', idioma: 'pt' } },
  'pallof-press': { video: { yt: 'Wez6pSiwfJg', inicio: 4, fim: 28, canal: 'CT Powerfit', idioma: 'pt' } },
  'prancha-lateral': { video: { yt: '2NjO5KrlVEM', inicio: 7, fim: 48, canal: 'Rodrigo Zago Treinador', idioma: 'pt' } },
  'elevacao-lateral-com-halteres': { video: { yt: 'ORparUDksUk', inicio: 24, fim: 75, canal: 'Guilherme Stellbrink I FisioPrev', idioma: 'pt' } },
  'crossover-de-baixo-para-cima': { video: { yt: 'SVVydit3uSw', inicio: 78, fim: 165, canal: 'Thiago Gallina | Treinador', idioma: 'pt' } },
  'pullover-em-maquina': { video: { yt: 'oxpAl14EYyc', inicio: 0, fim: 16, canal: 'Renaissance Periodization', idioma: 'en' } },
  'triceps-acima-da-cabeca-na-polia-sentado': { video: { yt: 'g7b_qYPJoOw', inicio: 70, fim: 120, canal: 'ATLASTHETICS', idioma: 'en' } },
  'rosca-inclinada-com-halteres': { video: { yt: 'Cv0zCtntyto', inicio: 20, fim: 58, canal: 'Miqueias Alves Personal', idioma: 'pt' } },
  'triceps-testa-com-barra-w': { video: { yt: 'zznCYBVZOVA', inicio: 28, fim: 68, canal: 'Leandro Twin', idioma: 'pt' } },
  'rosca-scott-na-maquina': { video: { yt: '7vHwxXHBPMo', inicio: 56, fim: 94, canal: 'Personal Maurício Moraes', idioma: 'pt' } },
  'agachamento-bulgaro-com-halteres': { video: { yt: 'IGf9fR4Y7Iw', inicio: 78, fim: 108, canal: 'Leandro Twin', idioma: 'pt' } },
  'mesa-flexora-deitada': { video: { yt: '2-ULaRrQa7c', inicio: 58, fim: 108, canal: 'Leandro Twin', idioma: 'pt' } },
  'abdutora': { video: { yt: 'e2gmqTG1OgQ', inicio: 25, fim: 50, canal: 'Leandro Twin', idioma: 'pt' } },
  'panturrilha-sentada': { video: { yt: 'jMWs_p-W9gY', inicio: 20, fim: 62, canal: 'Leandro Twin', idioma: 'pt' } },
  'dead-bug': { video: { yt: '0loS0bRNqfs', inicio: 33, fim: 77, canal: 'Treinadora Sarah Castro', idioma: 'pt' } },
  'supino-inclinado-com-halteres': { video: { yt: 'D3WuIh8spwg', inicio: 310, fim: 415, canal: 'Fabricio Pacholok', idioma: 'pt' } },
  'puxada-alta-pegada-neutra': { video: { yt: 'uAnrJBnxrZ0', inicio: 9, fim: 35, canal: 'Treino Mestre', idioma: 'pt' } },
  'remada-cavalinho-apoiada-pegada-aberta': { video: { yt: '_1YANc2e3qw', inicio: 34, fim: 105, canal: 'Lukas Rodrigues Treinador', idioma: 'pt' } },
  'elevacao-lateral-no-cabo': { video: { yt: 'NBkMIWWkIKQ', inicio: 135, fim: 192, canal: 'Physique Development', idioma: 'en' } },
  'encolhimento-kelso-apoiado': { video: { yt: 'Qq1xT2Vs_SY', inicio: 3, fim: 29, canal: 'All Strength Training', idioma: 'en' } },
  'rosca-martelo': { video: { yt: 'OnNmaG_tZM4', inicio: 10, fim: 74, canal: 'Laércio Refundini - Aulas', idioma: 'pt' } }
};
