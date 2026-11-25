-- O bucket `midia` do Storage (Fase D): as imagens dos exercícios (início e pico),
-- servidas ao app por URL pública. Rode no SQL Editor do Supabase, ANTES de subir
-- os arquivos. Pode rodar de novo.
--
-- Leitura: pública (o app e o service worker baixam sem login).
-- Escrita: só o moderador (public.eh_moderador(), do 20261123120000_catalogo.sql).
-- Subir pelo painel (Storage) usa a chave de serviço e não depende destas regras.
--
-- As imagens do RepDB (plano gratuito) são só para uso dentro do app: não
-- republicar o bucket como dataset (termo 3 da licença).

insert into storage.buckets (id, name, public)
values ('midia', 'midia', true)
on conflict (id) do update set public = true;

drop policy if exists "midia: moderador sobe" on storage.objects;
drop policy if exists "midia: moderador troca" on storage.objects;
drop policy if exists "midia: moderador apaga" on storage.objects;

create policy "midia: moderador sobe" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'midia' and public.eh_moderador());

create policy "midia: moderador troca" on storage.objects
  for update to authenticated
  using (bucket_id = 'midia' and public.eh_moderador())
  with check (bucket_id = 'midia' and public.eh_moderador());

create policy "midia: moderador apaga" on storage.objects
  for delete to authenticated
  using (bucket_id = 'midia' and public.eh_moderador());
