-- LIFEOS cloud sync schema (Supabase/Postgres)
create table if not exists public.lifeos_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.lifeos_state enable row level security;
drop policy if exists "Users can read their LIFEOS state" on public.lifeos_state;
drop policy if exists "Users can insert their LIFEOS state" on public.lifeos_state;
drop policy if exists "Users can update their LIFEOS state" on public.lifeos_state;
create policy "Users can read their LIFEOS state" on public.lifeos_state for select using (auth.uid()=user_id);
create policy "Users can insert their LIFEOS state" on public.lifeos_state for insert with check (auth.uid()=user_id);
create policy "Users can update their LIFEOS state" on public.lifeos_state for update using (auth.uid()=user_id) with check (auth.uid()=user_id);
