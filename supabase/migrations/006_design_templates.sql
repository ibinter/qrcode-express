-- Design templates: save/load QR design presets per user
create table if not exists public.design_templates (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  design jsonb not null,
  created_at timestamptz default now()
);

alter table public.design_templates enable row level security;

create policy "Users manage own design templates"
  on public.design_templates for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
