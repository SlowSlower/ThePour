-- Lightweight PIN protection for nickname-based identity (still not full
-- login, but prevents casual impersonation without adding email/password
-- auth yet). The PIN is only ever stored as a bcrypt hash via pgcrypto —
-- never in plain text, and never returned to clients.

alter table profiles add column if not exists pin_hash text;

-- Clients (and the tasting_search view, which only selects display_name)
-- must never be able to read the hash directly; all access goes through the
-- security definer functions below.
revoke select (pin_hash) on profiles from anon, authenticated;

create or replace function set_profile_pin(p_profile_id uuid, p_pin text)
returns void
language plpgsql
security definer
set search_path = public
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
set search_path = public
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

create or replace function profile_has_pin(p_profile_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select pin_hash is not null from profiles where id = p_profile_id;
$$;

grant execute on function set_profile_pin(uuid, text) to anon;
grant execute on function verify_profile_pin(uuid, text) to anon;
grant execute on function profile_has_pin(uuid) to anon;
