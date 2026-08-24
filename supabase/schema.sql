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
