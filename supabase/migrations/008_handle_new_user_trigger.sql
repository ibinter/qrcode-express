-- ============================================================
-- TRIGGER : créer un profil automatiquement à chaque signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, referral_code)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    upper(substr(md5(random()::text || new.id::text), 1, 8))
  )
  on conflict (id) do update
    set referral_code = coalesce(profiles.referral_code, excluded.referral_code);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
