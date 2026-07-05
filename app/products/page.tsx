"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { CATEGORY_LABELS, type Category, type Product } from "@/lib/types";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductsPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category | "all">("all");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const timer = setTimeout(async () => {
      let q = supabase.from("products").select("*").order("name");
      if (category !== "all") q = q.eq("category", category);
      if (query.trim()) {
        const term = `%${query.trim().replace(/[,()]/g, " ")}%`;
        q = q.or(`name.ilike.${term},producer.ilike.${term}`);
      }
      const { data } = await q;
      if (!cancelled) {
        setProducts(data ?? []);
        setLoading(false);
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, category]);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">전체 제품</h1>
      <div className="flex gap-2">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="이름, 생산자로 검색"
          className="flex-1"
        />
        <Select
          value={category}
          onValueChange={(v) => setCategory(v as Category | "all")}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="종류" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 종류</SelectItem>
            <SelectItem value="wine">와인</SelectItem>
            <SelectItem value="whiskey">위스키</SelectItem>
            <SelectItem value="other">기타</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          제품이 없습니다.
        </p>
      ) : (
        <div className="space-y-2">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/product/${product.id}`}
              className="flex items-center justify-between rounded-md border p-3 text-sm hover:bg-accent"
            >
              <div>
                <p className="font-medium">{product.name}</p>
                <p className="text-xs text-muted-foreground">
                  {product.producer}
                  {product.region ? ` · ${product.region}` : ""}
                </p>
              </div>
              <Badge variant="secondary">
                {CATEGORY_LABELS[product.category]}
              </Badge>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
