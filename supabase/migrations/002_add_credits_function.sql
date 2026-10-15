-- Fonction pour incrémenter les crédits d'un utilisateur de façon atomique
create or replace function add_credits(user_uuid uuid, amount integer)
returns void language sql security definer as $$
  update public.profiles
  set credits = credits + amount, updated_at = now()
  where id = user_uuid;
$$;
