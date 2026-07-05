-- ThePour initial schema
-- MVP has no real authentication yet: every request uses the Supabase anon key,
-- so RLS policies below are intentionally permissive (shared feed for a small trusted group).
-- When real login is added later, replace these policies with auth.uid()-based ones.

create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";

-- Lightweight identity: a display name, no password.
create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  display_name text not null unique,
  created_at timestamptz not null default now()
);

-- "What was drunk" — shared across users and across vintages of the same wine/whiskey.
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null check (category in ('wine', 'whiskey', 'other')),
  producer text,
  region text,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists products_name_trgm_idx on products using gin (name gin_trgm_ops);
create index if not exists products_producer_trgm_idx on products using gin (producer gin_trgm_ops);

-- "Who tasted it, when, and how" — one row per log entry.
create table if not exists tastings (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  profile_id uuid not null references profiles(id) on delete cascade,
  vintage_or_age text,
  abv numeric,
  rating numeric(2, 1) check (rating >= 0 and rating <= 5),
  tasted_on date not null default current_date,
  purchased_on date,
  purchase_place text,
  purchase_price numeric,
  nose_note text,
  palate_note text,
  finish_note text,
  overall_note text,
  characteristics jsonb not null default '{}'::jsonb,
  tags text[] not null default '{}',
  photo_paths text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tastings_product_id_idx on tastings (product_id);
create index if not exists tastings_profile_id_idx on tastings (profile_id);
create index if not exists tastings_tags_idx on tastings using gin (tags);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists tastings_set_updated_at on tastings;
create trigger tastings_set_updated_at
before update on tastings
for each row execute function set_updated_at();

-- Flattened view used by the unified search (author/product/notes all in one row).
create or replace view tasting_search as
select
  t.*,
  p.name as product_name,
  p.producer as producer,
  p.region as region,
  p.category as product_category,
  pr.display_name as author_name
from tastings t
join products p on p.id = t.product_id
join profiles pr on pr.id = t.profile_id;

alter table profiles enable row level security;
alter table products enable row level security;
alter table tastings enable row level security;

drop policy if exists "profiles_anon_all" on profiles;
create policy "profiles_anon_all" on profiles for all to anon using (true) with check (true);

drop policy if exists "products_anon_all" on products;
create policy "products_anon_all" on products for all to anon using (true) with check (true);

drop policy if exists "tastings_anon_all" on tastings;
create policy "tastings_anon_all" on tastings for all to anon using (true) with check (true);

grant select on tasting_search to anon;

-- Photo storage: public bucket so photo URLs can be rendered directly.
insert into storage.buckets (id, name, public)
values ('drink-photos', 'drink-photos', true)
on conflict (id) do nothing;

drop policy if exists "drink_photos_anon_all" on storage.objects;
create policy "drink_photos_anon_all"
on storage.objects for all
to anon
using (bucket_id = 'drink-photos')
with check (bucket_id = 'drink-photos');
