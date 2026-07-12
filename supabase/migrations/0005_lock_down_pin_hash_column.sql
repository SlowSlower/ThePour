-- The 0002/0003 column-level `revoke select (pin_hash)` never actually
-- blocked anon reads: Supabase grants table-wide SELECT on public-schema
-- tables to anon/authenticated by default, and a column-specific REVOKE does
-- not override a broader table-level GRANT that already covers that column
-- (Postgres unions all applicable ACL entries; the widest one wins). The fix
-- is to drop the table-wide SELECT grant entirely and re-grant SELECT only
-- for the columns that should be publicly readable.

revoke select on profiles from anon, authenticated;
grant select (id, display_name, created_at) on profiles to anon, authenticated;
