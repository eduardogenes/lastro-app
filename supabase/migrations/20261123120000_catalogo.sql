-- O catálogo do sistema (docs/catalogo/00-desenho.md, etapa 0).
--
-- Rode no SQL Editor do Supabase, uma vez, ANTES da semente
-- (20261123120100_catalogo_semente.sql). Pode rodar de novo: tudo é
-- "if not exists" / "or replace" / "drop policy if exists".
--
-- Igual para todos os usuários e curado: todo usuário autenticado lê, só o
-- moderador grava. Nada aqui toca a tabela `estado`.
--
-- Três regras que o app pressupõe e o banco garante:
--   1. Um exercício nunca é apagado (não há política de DELETE). Unir dois é
--      criar um redirecionamento, e o histórico de quem usava o id antigo
--      continua resolvendo.
--   2. Um redirecionamento nunca é apagado (idem).
--   3. O tipo de carga e a grandeza de um exercício não mudam: eles dizem como
--      ler a série guardada. Mudou a carga, é outro exercício — id novo, e o
--      antigo como equivalente. O gatilho `catalogo_carimba` recusa a troca.

-- ---------------------------------------------------------------------------
-- Quem modera. Sem política nenhuma: só o SQL Editor (ou a chave de serviço)
-- lê e grava esta tabela. O uid do dono NÃO está neste arquivo — o repositório
-- é público para quem tiver o bundle, e o passo de incluí-lo é manual:
--
--   insert into public.moderadores (uid) values ('<uid do dono>');
--
-- (o uid está em Authentication › Users, no painel do Supabase)
create table if not exists public.moderadores (
  uid uuid primary key references auth.users(id) on delete cascade,
  desde timestamptz not null default now()
);
alter table public.moderadores enable row level security;

-- Pergunta "quem chama é moderador?" sem expor a tabela: security definer lê
-- por cima da RLS, e só devolve verdadeiro ou falso.
create or replace function public.eh_moderador()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.moderadores m where m.uid = auth.uid());
$$;
revoke all on function public.eh_moderador() from public;
grant execute on function public.eh_moderador() to authenticated;

-- ---------------------------------------------------------------------------
-- As tabelas.

create table if not exists public.catalogo_movimento (
  id   text primary key,
  nome text not null
);

create table if not exists public.catalogo_equipamento (
  id    text primary key,
  nome  text not null,
  carga text not null check (carga in ('pino','lado','barra','halter','halter1','corpo','assist'))
);

-- Os nomes das colunas são os de `deLinha`/`paraLinha` em src/dominio/catalogo.ts.
create table if not exists public.catalogo_exercicio (
  id            text primary key check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  nome          text not null check (length(nome) >= 2),
  alt           text[] not null default '{}',
  movimento     text not null references public.catalogo_movimento(id),
  equipamento   text not null references public.catalogo_equipamento(id),
  grupo         text not null default '',
  -- [["peito superior", 1], ["tríceps", 0.5]]
  musculos      jsonb not null default '[]' check (jsonb_typeof(musculos) = 'array'),
  carga         text not null check (carga in ('pino','lado','barra','halter','halter1','corpo','assist')),
  unidade       text check (unidade in ('seg','m','cal','rep')),
  quantidade    numeric,
  composto      boolean not null default false,
  unilateral    boolean not null default false,
  equivalentes  text[] not null default '{}',
  dica          text,
  pegada        text,
  pegada_pe     boolean not null default false,
  substituto    boolean not null default false,
  curadoria     boolean not null default false,
  criado        timestamptz not null default now(),
  atualizado    timestamptz not null default now()
);

create table if not exists public.catalogo_redirecionamento (
  de     text primary key,
  para   text not null references public.catalogo_exercicio(id),
  motivo text not null default '',
  em     timestamptz not null default now(),
  check (de <> para)
);

-- Uma linha só: a versão do catálogo no banco. O app baixa o catálogo quando
-- ela passa a versão do banco que ele já tem (0 = só a semente embutida). Não
-- se compara com a versão do conteúdo da semente: são contadores diferentes.
create table if not exists public.catalogo_versao (
  id smallint primary key default 1 check (id = 1),
  v  bigint not null default 0
);
insert into public.catalogo_versao (id, v) values (1, 0) on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Toda LINHA gravada no catálogo sobe a versão. Por linha, e não por comando:
-- um comando que não muda nada (um update que a RLS filtrou, inclusive de quem
-- não modera) não pode mudar a versão e fazer todo aparelho baixar de novo.
create or replace function public.catalogo_sobe_versao()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.catalogo_versao set v = v + 1 where id = 1;
  return null;
end;
$$;

create or replace function public.catalogo_carimba()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.carga is distinct from old.carga or new.unidade is distinct from old.unidade then
    raise exception 'catálogo: a carga e a grandeza de "%" não mudam; crie outro exercício e ligue os dois como equivalentes', old.id;
  end if;
  new.atualizado := now();
  new.criado := old.criado;
  new.id := old.id;            -- o id é identidade: não se troca por atualização
  return new;
end;
$$;

drop trigger if exists catalogo_carimba on public.catalogo_exercicio;
create trigger catalogo_carimba before update on public.catalogo_exercicio
  for each row execute function public.catalogo_carimba();

do $$
declare t text;
begin
  foreach t in array array['catalogo_movimento','catalogo_equipamento','catalogo_exercicio','catalogo_redirecionamento'] loop
    execute format('drop trigger if exists catalogo_versao on public.%I', t);
    execute format('create trigger catalogo_versao after insert or update or delete on public.%I
                    for each row execute function public.catalogo_sobe_versao()', t);
  end loop;
end;
$$;

-- ---------------------------------------------------------------------------
-- RLS: lê quem está autenticado; grava só o moderador; ninguém apaga.
do $$
declare t text;
begin
  foreach t in array array['catalogo_movimento','catalogo_equipamento','catalogo_exercicio','catalogo_redirecionamento','catalogo_versao'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "autenticado lê" on public.%I', t);
    execute format('create policy "autenticado lê" on public.%I for select to authenticated using (true)', t);
  end loop;
  foreach t in array array['catalogo_movimento','catalogo_equipamento','catalogo_exercicio','catalogo_redirecionamento'] loop
    execute format('drop policy if exists "moderador cria" on public.%I', t);
    execute format('drop policy if exists "moderador muda" on public.%I', t);
    execute format('create policy "moderador cria" on public.%I for insert to authenticated with check (public.eh_moderador())', t);
    execute format('create policy "moderador muda" on public.%I for update to authenticated using (public.eh_moderador()) with check (public.eh_moderador())', t);
  end loop;
end;
$$;
-- `catalogo_versao` não tem política de escrita: só o gatilho (security
-- definer) a muda.
