import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { asset } from "@/lib/asset";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.slug}/`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-surface card-elegant transition duration-300 hover:-translate-y-1.5 hover:shadow-xl"
    >
      <div className="relative aspect-square overflow-hidden bg-cream-2">
        <Image
          src={asset(product.image)}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 300px"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        {product.branded && (
          <span className="absolute top-3 right-3 rounded-full bg-eco px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
            מבצע השקה
          </span>
        )}
        <span className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-gradient-to-l from-brand via-gold to-eco opacity-0 group-hover:opacity-100 transition" />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display text-lg font-bold text-foreground group-hover:text-brand transition">
          {product.name}
        </h3>
        <p className="mt-1 text-sm text-muted line-clamp-2 flex-1">{product.shortDesc}</p>
        <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-gold-dark">
          לפרטים נוספים
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="rotate-180">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </span>
      </div>
    </Link>
  );
}
