-- Table pour stocker les soumissions de formulaires prospects
create table if not exists public.lead_submissions (
  id uuid primary key default uuid_generate_v4(),
  form_id uuid not null references public.qr_codes(id) on delete cascade,
  data jsonb not null default '{}',
  submitted_at timestamptz not null default now(),
  ip_country text
);

-- Index pour récupérer les soumissions d'un formulaire
create index if not exists lead_submissions_form_id_idx on public.lead_submissions(form_id, submitted_at desc);

-- RLS : seul le propriétaire du QR peut lire les soumissions
alter table public.lead_submissions enable row level security;

create policy "Owner reads own submissions"
  on public.lead_submissions for select
  using (
    exists (
      select 1 from public.qr_codes
      where qr_codes.id = lead_submissions.form_id
        and qr_codes.user_id = auth.uid()
    )
  );

-- Les soumissions sont publiques (pas besoin d'auth pour soumettre)
create policy "Anyone can insert"
  on public.lead_submissions for insert
  with check (true);
