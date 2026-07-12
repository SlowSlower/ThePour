import { supabase } from "@/lib/supabase/client";
import type { Category, TastingSearchRow } from "@/lib/types";

export type SortOption = "recent" | "rating_desc" | "rating_asc";
export type RepurchaseFilter = "all" | "yes" | "no";

export interface TastingFilters {
  query?: string;
  category?: Category | "all";
  profileId?: string;
  minPrice?: number;
  maxPrice?: number;
  tag?: string;
  repurchase?: RepurchaseFilter;
  sort?: SortOption;
}

export async function fetchTastings(
  filters: TastingFilters,
): Promise<TastingSearchRow[]> {
  let q = supabase.from("tasting_search").select("*");

  if (filters.category && filters.category !== "all") {
    q = q.eq("product_category", filters.category);
  }
  if (filters.profileId) {
    q = q.eq("profile_id", filters.profileId);
  }
  if (filters.minPrice != null) {
    q = q.gte("purchase_price", filters.minPrice);
  }
  if (filters.maxPrice != null) {
    q = q.lte("purchase_price", filters.maxPrice);
  }
  if (filters.tag) {
    q = q.contains("tags", [filters.tag]);
  }
  if (filters.repurchase === "yes") {
    q = q.eq("would_repurchase", true);
  } else if (filters.repurchase === "no") {
    q = q.eq("would_repurchase", false);
  }
  if (filters.query && filters.query.trim()) {
    // Commas/parens are delimiters in PostgREST's .or() mini-language, so
    // strip them from free-text input rather than trying to escape them.
    const term = `%${filters.query.trim().replace(/[,()]/g, " ")}%`;
    q = q.or(
      [
        `product_name.ilike.${term}`,
        `producer.ilike.${term}`,
        `region.ilike.${term}`,
        `author_name.ilike.${term}`,
        `nose_note.ilike.${term}`,
        `palate_note.ilike.${term}`,
        `finish_note.ilike.${term}`,
        `overall_note.ilike.${term}`,
      ].join(","),
    );
  }

  switch (filters.sort) {
    case "rating_desc":
      q = q.order("rating", { ascending: false, nullsFirst: false });
      break;
    case "rating_asc":
      q = q.order("rating", { ascending: true, nullsFirst: true });
      break;
    default:
      q = q
        .order("tasted_on", { ascending: false })
        .order("created_at", { ascending: false });
  }

  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as TastingSearchRow[];
}

/**
 * Distinct previously-entered values for a free-text column, most-used first.
 * Backs the "pick again" suggestion chips on the tasting form (region,
 * producer, purchase place).
 */
export async function fetchColumnSuggestions(
  table: "products" | "tastings",
  column: string,
  limit = 300,
): Promise<string[]> {
  const { data } = await supabase
    .from(table)
    .select(column)
    .not(column, "is", null)
    .limit(limit);
  if (!data) return [];
  const counts = new Map<string, number>();
  for (const row of data as unknown as Record<string, unknown>[]) {
    const value = row[column];
    if (typeof value === "string" && value.trim()) {
      const trimmed = value.trim();
      counts.set(trimmed, (counts.get(trimmed) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .sort(([, a], [, b]) => b - a)
    .map(([value]) => value);
}

/** Distinct tags already used across tastings, most-used first. */
export async function fetchTagSuggestions(limit = 300): Promise<string[]> {
  const { data } = await supabase.from("tastings").select("tags").limit(limit);
  if (!data) return [];
  const counts = new Map<string, number>();
  for (const row of data as { tags: string[] }[]) {
    for (const tag of row.tags ?? []) {
      const trimmed = tag.trim();
      if (trimmed) counts.set(trimmed, (counts.get(trimmed) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .sort(([, a], [, b]) => b - a)
    .map(([value]) => value);
}
