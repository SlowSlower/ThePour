-- Adds a repurchase-intent flag to tastings, used for filtering/sorting
-- ("재구매 의사 있는/없는 기록", "지역별 재구매율") on the home feed and stats page.

alter table tastings add column if not exists would_repurchase boolean;

create index if not exists tastings_would_repurchase_idx on tastings (would_repurchase);

-- tasting_search selects `t.*`, and Postgres view columns are fixed at creation
-- time — `create or replace view` can only append columns at the very end of
-- the SELECT list, but the new column lands in the middle (before the joined
-- product_name/producer/... columns). Drop and recreate instead.
drop view if exists tasting_search;

create view tasting_search as
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

grant select on tasting_search to anon;
