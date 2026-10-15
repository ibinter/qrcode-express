-- ============================================================
-- RÉCOMPENSES DE PARRAINAGE
-- ============================================================
create table if not exists public.referral_rewards (
  id          uuid primary key default uuid_generate_v4(),
  referrer_id uuid not null references public.profiles(id) on delete cascade,
  referred_id uuid not null references public.profiles(id) on delete cascade,
  credits_given integer not null default 0,
  bonus_given   integer not null default 0,  -- bonus pour le filleul
  status      text not null default 'pending' check (status in ('pending','confirmed','cancelled')),
  created_at  timestamptz not null default now(),
  unique(referred_id)  -- un filleul ne peut être parrainé qu'une seule fois
);

create index referral_rewards_referrer_idx on public.referral_rewards(referrer_id);

alter table public.referral_rewards enable row level security;

-- Le parrain peut lire ses propres récompenses
create policy "referral_own" on public.referral_rewards
  for select using (auth.uid() = referrer_id or auth.uid() = referred_id);
