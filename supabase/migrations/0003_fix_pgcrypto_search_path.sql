-- Supabase installs pgcrypto into the `extensions` schema, not `public`, so
-- the PIN functions from 0002 (which pinned search_path to `public` only)
-- couldn't resolve crypt()/gen_salt() at call time. Recreate them with
-- `extensions` on the search_path, and reassert the pin_hash column lockdown
-- in case it didn't take effect before.

create or replace function set_profile_pin(p_profile_id uuid, p_pin text)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  if p_pin is null or length(p_pin) < 4 then
    raise exception 'PIN must be at least 4 characters';
  end if;
  update profiles
  set pin_hash = crypt(p_pin, gen_salt('bf'))
  where id = p_profile_id;
end;
$$;

create or replace function verify_profile_pin(p_profile_id uuid, p_pin text)
returns boolean
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  stored_hash text;
begin
  select pin_hash into stored_hash from profiles where id = p_profile_id;
  if stored_hash is null then
    return true;
  end if;
  return stored_hash = crypt(p_pin, stored_hash);
end;
$$;

revoke select (pin_hash) on profiles from anon, authenticated;
