-- GERADO por ferramentas/catalogo/gera-sql.ts (mídia, conteúdo versão 4).
-- Rode como moderador no SQL Editor do Supabase, DEPOIS da semente. Pode rodar de novo.
-- Cria a coluna `midia` e grava o vídeo de referência (trecho do YouTube) de cada exercício abaixo.

begin;

alter table public.catalogo_exercicio add column if not exists midia jsonb;

update public.catalogo_exercicio set midia = '{"video":{"yt":"e2gmqTG1OgQ","inicio":25,"fim":50,"canal":"Leandro Twin","idioma":"pt"}}'::jsonb where id = 'abdutora';
update public.catalogo_exercicio set midia = '{"video":{"yt":"Wf602gn_9zU","inicio":52,"fim":72,"canal":"Leandro Twin","idioma":"pt"}}'::jsonb where id = 'adutora';
update public.catalogo_exercicio set midia = '{"video":{"yt":"IGf9fR4Y7Iw","inicio":78,"fim":108,"canal":"Leandro Twin","idioma":"pt"}}'::jsonb where id = 'agachamento-bulgaro-com-halteres';
update public.catalogo_exercicio set midia = '{"video":{"yt":"gqoPYLUgP48","inicio":5,"fim":58,"canal":"[P]rehab","idioma":"en"}}'::jsonb where id = 'alongamento-do-flexor-do-quadril-ajoelhado';
update public.catalogo_exercicio set midia = '{"video":{"yt":"thg6cGXSlvY","inicio":19,"fim":81,"canal":"Leandro Twin","idioma":"pt"}}'::jsonb where id = 'barra-fixa';
update public.catalogo_exercicio set midia = '{"video":{"yt":"04YYmk7R2G0","inicio":160,"fim":245,"canal":"Prof. Dr. João Moura","idioma":"pt"}}'::jsonb where id = 'belt-squat';
update public.catalogo_exercicio set midia = '{"video":{"yt":"el3oHblB5DM","inicio":48,"fim":86,"canal":"Leandro Twin","idioma":"pt"}}'::jsonb where id = 'cadeira-extensora';
update public.catalogo_exercicio set midia = '{"video":{"yt":"ra3Sf4-RFr8","inicio":86,"fim":131,"canal":"Laércio Refundini - Aulas","idioma":"pt"}}'::jsonb where id = 'cadeira-flexora-sentada';
update public.catalogo_exercicio set midia = '{"video":{"yt":"bKSvckCwvh4","inicio":32,"fim":86,"canal":"Laércio Refundini - Aulas","idioma":"pt"}}'::jsonb where id = 'chest-press-horizontal-convergente';
update public.catalogo_exercicio set midia = '{"video":{"yt":"SVVydit3uSw","inicio":78,"fim":165,"canal":"Thiago Gallina | Treinador","idioma":"pt"}}'::jsonb where id = 'crossover-de-baixo-para-cima';
update public.catalogo_exercicio set midia = '{"video":{"yt":"0loS0bRNqfs","inicio":33,"fim":77,"canal":"Treinadora Sarah Castro","idioma":"pt"}}'::jsonb where id = 'dead-bug';
update public.catalogo_exercicio set midia = '{"video":{"yt":"ORparUDksUk","inicio":24,"fim":75,"canal":"Guilherme Stellbrink I FisioPrev","idioma":"pt"}}'::jsonb where id = 'elevacao-lateral-com-halteres';
update public.catalogo_exercicio set midia = '{"video":{"yt":"IwWvZ0rlNXs","inicio":122,"fim":165,"canal":"Leandro Twin","idioma":"pt"}}'::jsonb where id = 'elevacao-lateral-na-maquina';
update public.catalogo_exercicio set midia = '{"video":{"yt":"NBkMIWWkIKQ","inicio":135,"fim":192,"canal":"Physique Development","idioma":"en"}}'::jsonb where id = 'elevacao-lateral-no-cabo';
update public.catalogo_exercicio set midia = '{"video":{"yt":"CQebwTfJjas","inicio":115,"fim":225,"canal":"Tay Training","idioma":"pt"}}'::jsonb where id = 'elevacao-pelvica-na-maquina';
update public.catalogo_exercicio set midia = '{"video":{"yt":"Qq1xT2Vs_SY","inicio":3,"fim":29,"canal":"All Strength Training","idioma":"en"}}'::jsonb where id = 'encolhimento-kelso-apoiado';
update public.catalogo_exercicio set midia = '{"video":{"yt":"2-ULaRrQa7c","inicio":58,"fim":108,"canal":"Leandro Twin","idioma":"pt"}}'::jsonb where id = 'mesa-flexora-deitada';
update public.catalogo_exercicio set midia = '{"video":{"yt":"fmc0mIj6Ewc","inicio":17,"fim":75,"canal":"Ricardo Fisiologista","idioma":"pt"}}'::jsonb where id = 'mobilidade-de-quadril-90-90';
update public.catalogo_exercicio set midia = '{"video":{"yt":"Wez6pSiwfJg","inicio":4,"fim":28,"canal":"CT Powerfit","idioma":"pt"}}'::jsonb where id = 'pallof-press';
update public.catalogo_exercicio set midia = '{"video":{"yt":"wCXvfH_-BLg","inicio":9,"fim":31,"canal":"Leandro Twin","idioma":"pt"}}'::jsonb where id = 'panturrilha-no-leg-press';
update public.catalogo_exercicio set midia = '{"video":{"yt":"jMWs_p-W9gY","inicio":20,"fim":62,"canal":"Leandro Twin","idioma":"pt"}}'::jsonb where id = 'panturrilha-sentada';
update public.catalogo_exercicio set midia = '{"video":{"yt":"2NjO5KrlVEM","inicio":7,"fim":48,"canal":"Rodrigo Zago Treinador","idioma":"pt"}}'::jsonb where id = 'prancha-lateral';
update public.catalogo_exercicio set midia = '{"video":{"yt":"oxpAl14EYyc","inicio":0,"fim":16,"canal":"Renaissance Periodization","idioma":"en"}}'::jsonb where id = 'pullover-em-maquina';
update public.catalogo_exercicio set midia = '{"video":{"yt":"uAnrJBnxrZ0","inicio":9,"fim":35,"canal":"Treino Mestre","idioma":"pt"}}'::jsonb where id = 'puxada-alta-pegada-neutra';
update public.catalogo_exercicio set midia = '{"video":{"yt":"_1YANc2e3qw","inicio":34,"fim":105,"canal":"Lukas Rodrigues Treinador","idioma":"pt"}}'::jsonb where id = 'remada-cavalinho-apoiada-pegada-aberta';
update public.catalogo_exercicio set midia = '{"video":{"yt":"QyvIEdEHzHc","inicio":70,"fim":97,"canal":"Leandro Twin","idioma":"pt"}}'::jsonb where id = 'remada-na-maquina-com-apoio-de-peito';
update public.catalogo_exercicio set midia = '{"video":{"yt":"wjlX-5DTjBQ","inicio":14,"fim":52,"canal":"Laércio Refundini - Aulas","idioma":"pt"}}'::jsonb where id = 'reverse-pec-deck';
update public.catalogo_exercicio set midia = '{"video":{"yt":"Cv0zCtntyto","inicio":20,"fim":58,"canal":"Miqueias Alves Personal","idioma":"pt"}}'::jsonb where id = 'rosca-inclinada-com-halteres';
update public.catalogo_exercicio set midia = '{"video":{"yt":"OnNmaG_tZM4","inicio":10,"fim":74,"canal":"Laércio Refundini - Aulas","idioma":"pt"}}'::jsonb where id = 'rosca-martelo';
update public.catalogo_exercicio set midia = '{"video":{"yt":"7vHwxXHBPMo","inicio":56,"fim":94,"canal":"Personal Maurício Moraes","idioma":"pt"}}'::jsonb where id = 'rosca-scott-na-maquina';
update public.catalogo_exercicio set midia = '{"video":{"yt":"D3WuIh8spwg","inicio":310,"fim":415,"canal":"Fabricio Pacholok","idioma":"pt"}}'::jsonb where id = 'supino-inclinado-com-halteres';
update public.catalogo_exercicio set midia = '{"video":{"yt":"WP1VLAt8hbM","inicio":82,"fim":113,"canal":"Leandro Twin","idioma":"pt"}}'::jsonb where id = 'supino-inclinado-no-smith';
update public.catalogo_exercicio set midia = '{"video":{"yt":"g7b_qYPJoOw","inicio":70,"fim":120,"canal":"ATLASTHETICS","idioma":"en"}}'::jsonb where id = 'triceps-acima-da-cabeca-na-polia-sentado';
update public.catalogo_exercicio set midia = '{"video":{"yt":"zznCYBVZOVA","inicio":28,"fim":68,"canal":"Leandro Twin","idioma":"pt"}}'::jsonb where id = 'triceps-testa-com-barra-w';

commit;
