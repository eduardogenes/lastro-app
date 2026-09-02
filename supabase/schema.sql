-- Esquema da sincronização. Rode isto uma vez, no SQL Editor do Supabase.
--
-- Uma linha por usuário: o estado inteiro em JSONB e um inteiro de versão.
-- Não há normalização em tabelas de propósito — o estado do app é um documento
-- pequeno, e espalhá-lo em tabelas seria reescrever o app para resolver um
-- problema que ele não tem.
--
-- A versão é o que impede dois aparelhos de se atropelarem: o cliente só
-- escreve dizendo de que versão ele partiu, e o Postgres recusa se não bater.

create table if not exists public.estado (
  dono        uuid primary key references auth.users(id) on delete cascade,
  v           bigint      not null default 1,
  data        jsonb       not null,
  atualizado  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- A versão quem controla é o banco, nunca o cliente.
--
-- Se o cliente mandasse o número novo, um bug de cliente poderia repetir uma
-- versão e destruir a garantia. Aqui ele só declara de qual versão partiu — o
-- filtro `v=eq.<esperado>` na atualização — e o gatilho incrementa. Zero linhas
-- afetadas significa "alguém escreveu antes de você": o app relê, funde e
-- tenta de novo.
create or replace function public.estado_versiona()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.v := old.v + 1;
  new.atualizado := now();
  new.dono := old.dono;          -- dono não se troca por atualização
  return new;
end;
$$;

drop trigger if exists estado_versiona on public.estado;
create trigger estado_versiona
  before update on public.estado
  for each row execute function public.estado_versiona();

-- ---------------------------------------------------------------------------
-- RLS: a chave anônima é pública por design e vai no bundle do app. Quem
-- protege é isto — cada linha só é visível e gravável pelo dono autenticado.
alter table public.estado enable row level security;

drop policy if exists "dono lê o próprio estado"      on public.estado;
drop policy if exists "dono cria o próprio estado"    on public.estado;
drop policy if exists "dono atualiza o próprio estado" on public.estado;

create policy "dono lê o próprio estado"
  on public.estado for select
  using (auth.uid() = dono);

create policy "dono cria o próprio estado"
  on public.estado for insert
  with check (auth.uid() = dono);

create policy "dono atualiza o próprio estado"
  on public.estado for update
  using (auth.uid() = dono)
  with check (auth.uid() = dono);

-- Sem policy de DELETE: apagar a linha inteira não é operação do app. O que o
-- app apaga são registros DENTRO do documento, e isso é uma atualização.

-- ---------------------------------------------------------------------------
-- As fotos dos aparelhos.
--
-- Bucket PRIVADO. As fotos são de dentro da academia dele e o app está numa URL
-- pública — bucket público serviria qualquer arquivo a quem adivinhasse o
-- caminho, e o caminho é o id do exercício, que é adivinhável.
--
-- Os bytes vivem aqui só para REPLICAR entre os aparelhos dele. A cópia que o
-- app usa é a do Cache Storage do próprio aparelho: sem rede, a tela continua
-- desenhando a foto. Isto é a réplica, não a fonte.
insert into storage.buckets (id, name, public)
values ('aparelhos', 'aparelhos', false)
on conflict (id) do nothing;

-- O primeiro segmento do caminho é o uid do dono: 'a1b2.../pendulum-squat.webp'.
-- É o que faz a política abaixo ser suficiente — cada um só alcança a própria
-- pasta, e o nome do arquivo não precisa ser secreto.
drop policy if exists "dono lê as próprias fotos"      on storage.objects;
drop policy if exists "dono envia as próprias fotos"   on storage.objects;
drop policy if exists "dono troca as próprias fotos"   on storage.objects;
drop policy if exists "dono apaga as próprias fotos"   on storage.objects;

create policy "dono lê as próprias fotos"
  on storage.objects for select
  using (bucket_id = 'aparelhos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "dono envia as próprias fotos"
  on storage.objects for insert
  with check (bucket_id = 'aparelhos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "dono troca as próprias fotos"
  on storage.objects for update
  using (bucket_id = 'aparelhos' and (storage.foldername(name))[1] = auth.uid()::text);

-- Aqui existe DELETE, ao contrário da tabela de estado: apagar a foto de um
-- aparelho é operação do app, e sem isto o byte ficaria órfão no bucket para
-- sempre depois que a referência saísse do estado.
create policy "dono apaga as próprias fotos"
  on storage.objects for delete
  using (bucket_id = 'aparelhos' and (storage.foldername(name))[1] = auth.uid()::text);

-- ---------------------------------------------------------------------------
-- As fotos de acompanhamento do corpo.
--
-- Bucket PRÓPRIO, e não uma pasta dentro de 'aparelhos'. Não é organização: um
-- bucket é a unidade que o painel do Supabase apaga, exporta e mede de uma vez
-- só. Foto de aparelho é a placa de uma máquina de academia; foto de corpo é o
-- corpo dele em roupa justa. Um dia em que ele queira zerar uma das duas coisas
-- sem tocar na outra, a separação é o que torna isso um clique em vez de um
-- filtro por nome de arquivo.
--
-- Privado pela mesma razão do outro, com mais motivo ainda: o app está numa URL
-- pública, e aqui o caminho é ainda mais adivinhável — data mais nome de pose,
-- ambos vindos de um conjunto fechado que está no código do bundle.
--
-- E, como o outro, isto é RÉPLICA, não fonte de leitura: o app desenha a partir
-- do Cache Storage do aparelho. A diferença é a vida útil. São nove fotos por
-- sessão a cada duas semanas — uns 35 MB no primeiro ano, num cache que o iOS
-- despeja sob pressão de disco. O aparelho guarda só as sessões recentes e
-- PODA o resto; abrir uma sessão antiga busca os bytes de volta daqui. Para as
-- fotos de aparelho o bucket é seguro contra troca de celular; para estas ele é
-- o arquivo permanente, e o aparelho é que é o cache.
insert into storage.buckets (id, name, public)
values ('corpo', 'corpo', false)
on conflict (id) do nothing;

-- O caminho é 'a1b2.../2026-09-01/frente-relaxado.webp': uid, data da sessão,
-- pose. O primeiro segmento continua sendo o uid — é o que faz a política
-- abaixo ser a mesma do outro bucket. A pasta por sessão existe para dar para
-- olhar uma sessão inteira no painel; com tudo numa pasta só, conferir se um
-- byte se perdeu seria um grep.
drop policy if exists "dono lê as próprias fotos de corpo"    on storage.objects;
drop policy if exists "dono envia as próprias fotos de corpo" on storage.objects;
drop policy if exists "dono troca as próprias fotos de corpo" on storage.objects;
drop policy if exists "dono apaga as próprias fotos de corpo" on storage.objects;

create policy "dono lê as próprias fotos de corpo"
  on storage.objects for select
  using (bucket_id = 'corpo' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "dono envia as próprias fotos de corpo"
  on storage.objects for insert
  with check (bucket_id = 'corpo' and (storage.foldername(name))[1] = auth.uid()::text);

-- O app manda `x-upsert: true` ao subir: refazer uma pose reescreve o mesmo
-- caminho, e sem UPDATE o upsert falharia só na segunda vez — o pior tipo de
-- erro, porque passa nos testes de caminho feliz.
create policy "dono troca as próprias fotos de corpo"
  on storage.objects for update
  using (bucket_id = 'corpo' and (storage.foldername(name))[1] = auth.uid()::text);

-- Apagar uma pose e refazê-la são operações do app, e a poda do cache local
-- nunca chega aqui — quem apaga daqui é só ele.
create policy "dono apaga as próprias fotos de corpo"
  on storage.objects for delete
  using (bucket_id = 'corpo' and (storage.foldername(name))[1] = auth.uid()::text);
