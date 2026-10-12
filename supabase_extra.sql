-- Ejecutar UNA vez en Supabase > SQL Editor (elige "Run and enable RLS")
create table if not exists ajustes (
  clave text primary key,
  valor text
);

alter table ajustes enable row level security;
drop policy if exists "coordinadores acceso total" on ajustes;
create policy "coordinadores acceso total" on ajustes
  for all to authenticated using (true) with check (true);
