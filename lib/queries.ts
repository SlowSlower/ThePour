import { supabase } from "@/lib/supabase/client";
import type { Category, TastingSearchRow } from "@/lib/types";

export type SortOption = "recent" | "rating_desc" | "rating_asc";

export interface TastingFilters {
  query?: string;
  category?: Category | "all";
  profileId?: string;
  minPrice?: number;
  maxPrice?: number;
  tag?: string;
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
