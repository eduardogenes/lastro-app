// O endereço do projeto no Supabase e a chave pública dele.
//
// Mora num módulo só porque tem dois leitores: o app (`./nuvem.ts`) e a
// ferramenta que monta a pasta de leitura no computador
// (`ferramentas/espelho/`). Duas cópias da mesma string seriam dois lugares
// para trocar no dia em que o projeto mudar — e a que ficasse para trás
// falharia em silêncio, apontando para um banco que não existe mais.
//
// A chave é pública por design e vai no bundle. Quem protege os dados é o RLS
// do banco, que só devolve a linha do usuário autenticado — e o cadastro
// público está desligado no painel, então ela não abre porta para ninguém.

export const URL_BASE = 'https://wetwqqrrgormwyktewlm.supabase.co';
export const ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndldHdxcXJyZ29ybXd5a3Rld2xtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1OTQzMDIsImV4cCI6MjEwMzE3MDMwMn0.5Tdn3OW4khACuUvOdbcSWyK_UC3v8pm46mwB3MliAj0';

/** Os dois buckets de foto. Ver `supabase/schema.sql` para o porquê de serem dois. */
export const BUCKET_APARELHOS = 'aparelhos';
export const BUCKET_CORPO = 'corpo';
