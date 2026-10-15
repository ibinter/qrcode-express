-- ============================================================
-- INVITATIONS (email-based team invites)
-- ============================================================
create table if not exists public.org_invitations (
  id         uuid primary key default uuid_generate_v4(),
  org_id     uuid not null references public.organizations(id) on delete cascade,
  email      text not null,
  role       text not null default 'editor'
               check (role in ('admin','editor','controller','reader')),
  token      text not null unique default substr(md5(random()::text || clock_timestamp()::text), 1, 32),
  invited_by uuid references public.profiles(id),
  accepted   boolean not null default false,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '7 days'),
  unique(org_id, email)
);

create index org_invitations_token_idx on public.org_invitations(token);

-- ============================================================
-- RLS pour organizations et org_members
-- ============================================================
alter table public.organizations enable row level security;
alter table public.org_members enable row level security;
alter table public.org_invitations enable row level security;

-- organizations : owner voit et gère
create policy "orgs_owner_all" on public.organizations
  for all using (auth.uid() = owner_id);

-- organizations : membres peuvent lire
create policy "orgs_member_read" on public.organizations
  for select using (
    exists (select 1 from public.org_members where org_id = organizations.id and user_id = auth.uid())
  );

-- org_members : membres voient les autres membres de leur org
create policy "org_members_read" on public.org_members
  for select using (
    exists (select 1 from public.org_members om2 where om2.org_id = org_members.org_id and om2.user_id = auth.uid())
  );

-- org_members : owner/admin peut gérer les membres
create policy "org_members_manage" on public.org_members
  for all using (
    exists (
      select 1 from public.org_members om
      where om.org_id = org_members.org_id
        and om.user_id = auth.uid()
        and om.role in ('owner','admin')
    )
  );

-- org_invitations : membres de l'org peuvent voir
create policy "org_inv_read" on public.org_invitations
  for select using (
    exists (select 1 from public.org_members where org_id = org_invitations.org_id and user_id = auth.uid())
    or auth.uid() = invited_by
  );

-- org_invitations : owner/admin peut créer
create policy "org_inv_insert" on public.org_invitations
  for insert with check (
    exists (
      select 1 from public.org_members
      where org_id = org_invitations.org_id
        and user_id = auth.uid()
        and role in ('owner','admin')
    )
  );

-- ============================================================
-- QR codes : accès org (membres voient les QR de leur org)
-- ============================================================
create policy "qr_codes_org_member" on public.qr_codes
  for select using (
    org_id is not null and
    exists (select 1 from public.org_members where org_id = qr_codes.org_id and user_id = auth.uid())
  );
