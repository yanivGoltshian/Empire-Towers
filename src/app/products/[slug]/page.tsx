import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { products, getProduct, categories, telLink, whatsappLink, site } from "@/lib/data";
import LeadForm from "@/components/LeadForm";
import ProductCard from "@/components/ProductCard";
import JsonLd from "@/components/JsonLd";
import { asset } from "@/lib/asset";
import { productLd, breadcrumbLd } from "@/lib/structured-data";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return {};
  return {
    title: product.name,
    description: product.shortDesc,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const productCats = categories.filter((c) => product.categoryIds.includes(c.id));
  const related = products
    .filter((p) => p.id !== product.id && p.categoryIds.some((c) => product.categoryIds.includes(c)))
    .slice(0, 3);

  return (
    <>
      <JsonLd
        data={[
          productLd(product),
          breadcrumbLd([
            { name: "בית", url: "/" },
            { name: "פרויקטים", url: "/products/" },
            { name: product.name, url: `/products/${product.slug}/` },
          ]),
        ]}
      />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <nav className="text-sm text-muted mb-6 flex gap-2">
          <Link href="/" className="hover:text-brand">בית</Link>
          <span>/</span>
          <Link href="/products/" className="hover:text-brand">פרויקטים</Link>
          <span>/</span>
          <span className="text-foreground">{product.name}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-2">
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-surface shadow-sm">
            <Image src={asset(product.image)} alt={product.name} fill className="object-cover" priority />
            {product.branded && (
              <span className="absolute top-4 right-4 rounded-full bg-eco px-3 py-1.5 text-sm font-semibold text-white">
                פרויקט בהשקה
              </span>
            )}
          </div>

          <div>
            <div className="flex flex-wrap gap-2">
              {productCats.map((c) => (
                <Link key={c.id} href={`/category/${c.slug}/`} className="rounded-full bg-surface px-3 py-1 text-xs font-medium hover:bg-border">
                  {c.name}
                </Link>
              ))}
            </div>
            <h1 className="mt-3 text-3xl sm:text-4xl font-black">{product.name}</h1>
            <p className="mt-4 text-muted leading-relaxed">{product.description}</p>

            <div className="mt-6 grid sm:grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold mb-2">מאפיינים</h3>
                <ul className="space-y-1.5 text-sm">
                  {product.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-eco shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-bold mb-2">מתאים ל־</h3>
                <div className="flex flex-wrap gap-2">
                  {product.uses.map((u) => (
                    <span key={u} className="rounded-lg bg-surface px-3 py-1.5 text-xs">{u}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <a href={whatsappLink(`היי, אשמח לקבל פרטים על הפרויקט ${product.name} של מגדלי האימפריה נדל״ן`)} target="_blank" rel="noopener noreferrer" className="rounded-full bg-eco px-6 py-3 font-semibold text-white hover:bg-eco-dark transition">
                לפרטים נוספים בוואטסאפ
              </a>
              <a href={telLink(site.phone)} className="rounded-full border border-border px-6 py-3 font-semibold hover:border-brand hover:text-brand transition">
                התקשרו {site.phone}
              </a>
            </div>
          </div>
        </div>

        <div className="mt-16 grid gap-10 lg:grid-cols-2 items-start">
          <div className="rounded-3xl border border-border bg-white p-6 sm:p-8">
            <h2 className="text-2xl font-black">תיאום סיור ב{product.name}</h2>
            <p className="mt-1 text-sm text-muted">מלאו פרטים ונחזור אליכם במהירות.</p>
            <div className="mt-6">
              <LeadForm defaultProduct={product.name} />
            </div>
          </div>

          {related.length > 0 && (
            <div>
              <h2 className="text-2xl font-black mb-6">פרויקטים נוספים</h2>
              <div className="grid gap-4 grid-cols-2">
                {related.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
