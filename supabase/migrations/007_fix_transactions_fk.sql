-- Fix: transactions.user_id referenced public.profiles(id) but the codebase
-- uses public.users (separate table). Re-point FK to auth.users(id) so any
-- authenticated user can insert a transaction regardless of profiles row.

alter table public.transactions
  drop constraint if exists transactions_user_id_fkey;

alter table public.transactions
  add constraint transactions_user_id_fkey
  foreign key (user_id) references auth.users(id) on delete cascade;
