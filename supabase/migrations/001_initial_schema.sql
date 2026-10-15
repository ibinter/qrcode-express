-- QR CODE EXPRESS — Migration initiale
-- Activer les extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";

-- ============================================================
-- UTILISATEURS (profils étendus, liés à auth.users)
-- ============================================================
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  phone       text,
  avatar_url  text,
  lang        text not null default 'fr',
  credits     integer not null default 0,
  plan        text not null default 'free'
                check (plan in ('free','essential','pro','business','agency','enterprise')),
  referral_code text unique default substr(md5(random()::text), 1, 8),
  referred_by   uuid references public.profiles(id),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ============================================================
-- ORGANISATIONS (équipes, agences)
-- ============================================================
create table public.organizations (
  id          uuid primary key default uuid_generate_v4(),
  owner_id    uuid not null references public.profiles(id),
  name        text not null,
  plan        text not null default 'free',
  logo_url    text,
  brand_colors jsonb default '{}',
  custom_domain text,
  created_at  timestamptz not null default now()
);

create table public.org_members (
  id       uuid primary key default uuid_generate_v4(),
  org_id   uuid not null references public.organizations(id) on delete cascade,
  user_id  uuid not null references public.profiles(id) on delete cascade,
  role     text not null default 'editor'
             check (role in ('owner','admin','editor','controller','reader')),
  unique(org_id, user_id)
);

-- ============================================================
-- QR CODES
-- ============================================================
create table public.qr_codes (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references public.profiles(id) on delete set null,
  org_id      uuid references public.organizations(id) on delete set null,
  name        text,
  type        text not null,
  mode        text not null default 'static' check (mode in ('static','dynamic')),
  content     text not null,                      -- contenu direct (statique) ou URL destination (dynamique)
  slug        text unique,                        -- chemin court pour QR dynamique, ex: abc123
  design      jsonb not null default '{}',        -- couleurs, style, logo, cadre
  status      text not null default 'active'
                check (status in ('active','paused','expired','archived')),
  folder_id   uuid,
  tags        text[] default '{}',
  password_hash text,                             -- protection optionnelle
  expires_at  timestamptz,
  max_scans   integer,
  scan_count  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index qr_codes_user_id_idx on public.qr_codes(user_id);
create index qr_codes_slug_idx on public.qr_codes(slug) where slug is not null;
create index qr_codes_status_idx on public.qr_codes(status);

-- ============================================================
-- DESTINATIONS DYNAMIQUES (historique des redirections)
-- ============================================================
create table public.qr_destinations (
  id          uuid primary key default uuid_generate_v4(),
  qr_id       uuid not null references public.qr_codes(id) on delete cascade,
  destination text not null,
  is_active   boolean not null default false,
  set_at      timestamptz not null default now(),
  set_by      uuid references public.profiles(id)
);

create index qr_destinations_qr_id_idx on public.qr_destinations(qr_id);

-- ============================================================
-- RÈGLES DE ROUTAGE INTELLIGENT
-- ============================================================
create table public.routing_rules (
  id          uuid primary key default uuid_generate_v4(),
  qr_id       uuid not null references public.qr_codes(id) on delete cascade,
  rule_type   text not null
                check (rule_type in ('device','language','country','schedule','scan_count','ab_test')),
  condition   jsonb not null default '{}',
  destination text not null,
  priority    integer not null default 0,
  is_active   boolean not null default true
);

-- ============================================================
-- SCANS (événements analytiques)
-- ============================================================
create table public.scan_events (
  id          uuid primary key default uuid_generate_v4(),
  qr_id       uuid not null references public.qr_codes(id) on delete cascade,
  campaign_id uuid,
  scanned_at  timestamptz not null default now(),
  device_type text,
  os          text,
  browser     text,
  country     text,
  city        text,
  is_bot      boolean not null default false,
  destination text
);

create index scan_events_qr_id_idx on public.scan_events(qr_id);
create index scan_events_scanned_at_idx on public.scan_events(scanned_at desc);

-- ============================================================
-- PAGES DE DESTINATION (menu, catalogue, vCard Plus, bio-lien)
-- ============================================================
create table public.landing_pages (
  id          uuid primary key default uuid_generate_v4(),
  qr_id       uuid references public.qr_codes(id) on delete cascade,
  user_id     uuid not null references public.profiles(id),
  template    text not null,
  title       text,
  blocks      jsonb not null default '[]',
  lang        text not null default 'fr',
  status      text not null default 'draft' check (status in ('draft','published')),
  published_at timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ============================================================
-- BILLETS ET COUPONS
-- ============================================================
create table public.tickets (
  id          uuid primary key default uuid_generate_v4(),
  event_id    uuid,
  code        text not null unique,
  holder_name text,
  holder_email text,
  status      text not null default 'valid' check (status in ('valid','used','cancelled')),
  validated_at timestamptz,
  validated_by uuid references public.profiles(id),
  created_at  timestamptz not null default now()
);

-- ============================================================
-- TRANSACTIONS ET CRÉDITS
-- ============================================================
create table public.transactions (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.profiles(id),
  type            text not null check (type in ('credit','debit','refund','bonus')),
  amount          integer not null,
  currency        text not null default 'XOF',
  description     text,
  reference       text unique,
  payment_method  text,
  status          text not null default 'pending' check (status in ('pending','success','failed','refunded')),
  metadata        jsonb default '{}',
  created_at      timestamptz not null default now()
);

create index transactions_user_id_idx on public.transactions(user_id);

-- ============================================================
-- ABONNEMENTS
-- ============================================================
create table public.subscriptions (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.profiles(id),
  plan            text not null,
  status          text not null default 'active' check (status in ('active','paused','cancelled','expired')),
  period_start    timestamptz not null,
  period_end      timestamptz not null,
  auto_renew      boolean not null default true,
  provider_ref    text,
  created_at      timestamptz not null default now()
);

-- ============================================================
-- JOURNAL D'AUDIT
-- ============================================================
create table public.audit_logs (
  id          uuid primary key default uuid_generate_v4(),
  actor_id    uuid references public.profiles(id),
  action      text not null,
  resource    text,
  resource_id text,
  metadata    jsonb default '{}',
  created_at  timestamptz not null default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.profiles enable row level security;
alter table public.qr_codes enable row level security;
alter table public.scan_events enable row level security;
alter table public.transactions enable row level security;
alter table public.landing_pages enable row level security;

-- Profils : lecture/modification de son propre profil
create policy "profiles_own" on public.profiles
  for all using (auth.uid() = id);

-- QR codes : accès à ses propres QR
create policy "qr_codes_own" on public.qr_codes
  for all using (auth.uid() = user_id);

-- Scans : lecture de ses propres scans (via QR)
create policy "scan_events_own" on public.scan_events
  for select using (
    qr_id in (select id from public.qr_codes where user_id = auth.uid())
  );

-- Transactions : lecture de ses propres transactions
create policy "transactions_own" on public.transactions
  for select using (auth.uid() = user_id);

-- Pages : accès à ses propres pages
create policy "landing_pages_own" on public.landing_pages
  for all using (auth.uid() = user_id);

-- ============================================================
-- FONCTION : incrémenter les scans
-- ============================================================
create or replace function increment_scan_count(qr_uuid uuid)
returns void language sql security definer as $$
  update public.qr_codes set scan_count = scan_count + 1, updated_at = now()
  where id = qr_uuid;
$$;

-- ============================================================
-- TRIGGER : updated_at automatique
-- ============================================================
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger qr_codes_updated_at before update on public.qr_codes
  for each row execute function set_updated_at();

create trigger profiles_updated_at before update on public.profiles
  for each row execute function set_updated_at();
