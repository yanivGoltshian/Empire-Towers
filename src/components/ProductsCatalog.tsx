"use client";

import { useMemo, useState } from "react";
import type { Category, Product } from "@/lib/types";
import ProductCard from "./ProductCard";

export default function ProductsCatalog({
  products,
  categories,
  initialCategory,
}: {
  products: Product[];
  categories: Category[];
  initialCategory?: string;
}) {
  const [active, setActive] = useState<string>(initialCategory ?? "all");
  const [brandedOnly, setBrandedOnly] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (active !== "all" && !p.categoryIds.includes(active)) return false;
      if (brandedOnly && !p.branded) return false;
      if (query && !`${p.name} ${p.shortDesc}`.includes(query)) return false;
      return true;
    });
  }, [products, active, brandedOnly, query]);

  const chip = (id: string, label: string) => (
    <button
      key={id}
      onClick={() => setActive(id)}
      className={`rounded-full px-4 py-2 text-sm font-medium border transition ${
        active === id ? "border-brand bg-brand text-white" : "border-border bg-white hover:border-brand/50"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {chip("all", "הכל")}
          {categories.map((c) => chip(c.id, c.name))}
        </div>
        <div className="flex items-center gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="חיפוש פרויקט…"
            className="rounded-xl border border-border bg-white px-4 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
          <label className="flex items-center gap-2 text-sm whitespace-nowrap cursor-pointer">
            <input type="checkbox" checked={brandedOnly} onChange={(e) => setBrandedOnly(e.target.checked)} className="accent-eco h-4 w-4" />
            פרויקטים בהשקה
          </label>
        </div>
      </div>

      <p className="mt-4 text-sm text-muted">{filtered.length} פרויקטים</p>

      {filtered.length > 0 ? (
        <div className="mt-6 grid gap-4 grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <div className="mt-10 rounded-2xl border border-dashed border-border p-12 text-center text-muted">
          לא נמצאו פרויקטים מתאימים. נסו סינון אחר.
        </div>
      )}
    </div>
  );
}
