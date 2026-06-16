-- Tumpline contact-form lead capture.
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor → New query).

create table if not exists public.tumpline_leads (
  id          uuid        primary key default gen_random_uuid(),
  created_at  timestamptz not null    default now(),
  name        text        not null,
  email       text        not null,
  company     text,
  team_size   text,
  message     text
);

-- Lock the table down, then allow anonymous (anon key) inserts only.
-- No select/update/delete policy exists, so the client can write but never read.
alter table public.tumpline_leads enable row level security;

create policy "anon can insert tumpline_leads"
  on public.tumpline_leads
  for insert
  to anon
  with check (true);
