-- O rastro dos agentes e a chave "Pode ler" (docs/mcp/00-desenho.md, etapa 1, parte 2).
--
-- Rode no SQL Editor do Supabase, uma vez. Pode rodar de novo: tudo é
-- "if not exists" / "drop policy if exists". Nada aqui toca a tabela `estado`.
--
-- Quem grava é a própria pessoa, com o próprio token (a porta do MCP repassa o
-- token que o Claude recebeu no login): não há chave de serviço em lugar nenhum.

-- ---------------------------------------------------------------------------
-- acessos: uma linha por ferramenta chamada. Para sempre (decisão do dono,
-- 23/11/2026): não há política de UPDATE nem de DELETE.
create table if not exists public.acessos (
  id         bigint generated always as identity primary key,
  dono       uuid not null default auth.uid() references auth.users(id) on delete cascade,
  papel      text not null check (papel in ('treinador', 'nutricionista', 'assistente')),
  ferramenta text not null check (length(ferramenta) between 1 and 60),
  resumo     text not null default '' check (length(resumo) <= 200),
  cliente    text check (cliente is null or length(cliente) <= 80),
  em         timestamptz not null default now()
);
create index if not exists acessos_dono_em on public.acessos (dono, em desc);

alter table public.acessos enable row level security;
drop policy if exists "dono lê os seus" on public.acessos;
drop policy if exists "dono grava os seus" on public.acessos;
create policy "dono lê os seus" on public.acessos for select to authenticated using (dono = auth.uid());
create policy "dono grava os seus" on public.acessos for insert to authenticated with check (dono = auth.uid());

-- ---------------------------------------------------------------------------
-- agentes: a chave "Pode ler" por papel. Sem linha = ligado. A porta lê; o
-- app grava (upsert) e pode desfazer.
create table if not exists public.agentes (
  dono   uuid not null default auth.uid() references auth.users(id) on delete cascade,
  papel  text not null check (papel in ('treinador', 'nutricionista', 'assistente')),
  ligado boolean not null default true,
  em     timestamptz not null default now(),
  primary key (dono, papel)
);

alter table public.agentes enable row level security;
drop policy if exists "dono lê os seus" on public.agentes;
drop policy if exists "dono cria os seus" on public.agentes;
drop policy if exists "dono muda os seus" on public.agentes;
create policy "dono lê os seus" on public.agentes for select to authenticated using (dono = auth.uid());
create policy "dono cria os seus" on public.agentes for insert to authenticated with check (dono = auth.uid());
create policy "dono muda os seus" on public.agentes for update to authenticated using (dono = auth.uid()) with check (dono = auth.uid());
