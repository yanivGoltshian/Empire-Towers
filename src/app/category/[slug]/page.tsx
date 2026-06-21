import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { categories, getCategory, productsInCategory, products } from "@/lib/data";
import ProductsCatalog from "@/components/ProductsCatalog";
import PageHero from "@/components/PageHero";

export function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) return {};
  return { title: category.name, description: category.blurb };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) notFound();

  const inCat = productsInCategory(category.id);

  return (
    <>
      <PageHero eyebrow="קטגוריית נדל״ן" title={category.name} subtitle={category.blurb} />
      <div className="mx-auto max-w-6xl px-4 py-12">
        <ProductsCatalog products={products} categories={categories} initialCategory={category.id} />
        <p className="sr-only">{inCat.length} פרויקטים בקטגוריה</p>
      </div>
    </>
  );
}
