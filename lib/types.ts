export type Category = "wine" | "whiskey" | "other";

export interface Profile {
  id: string;
  display_name: string;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  category: Category;
  producer: string | null;
  region: string | null;
  created_by: string | null;
  created_at: string;
}

export interface Characteristics {
  body?: number;
  sweetness?: number;
  acidity?: number;
  tannin?: number;
  smokiness?: number;
  spice?: number;
}

export interface Tasting {
  id: string;
  product_id: string;
  profile_id: string;
  vintage_or_age: string | null;
  abv: number | null;
  rating: number | null;
  tasted_on: string;
  purchased_on: string | null;
  purchase_place: string | null;
  purchase_price: number | null;
  nose_note: string | null;
  palate_note: string | null;
  finish_note: string | null;
  overall_note: string | null;
  characteristics: Characteristics;
  tags: string[];
  photo_paths: string[];
  would_repurchase: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface TastingSearchRow extends Tasting {
  product_name: string;
  producer: string | null;
  region: string | null;
  product_category: Category;
  author_name: string;
}

export const CATEGORY_LABELS: Record<Category, string> = {
  wine: "와인",
  whiskey: "위스키",
  other: "기타",
};
