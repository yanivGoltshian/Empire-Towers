import type { Metadata } from "next";
import { products, categories } from "@/lib/data";
import ProductsCatalog from "@/components/ProductsCatalog";
import PageHero from "@/components/PageHero";

export const metadata: Metadata = {
  title: "כל הפרויקטים",
  description: "כל הפרויקטים של מגדלי האימפריה נדל״ן – מגורים, מסחרי, משרדים, השקעה ויוקרה. סננו לפי סוג נכס ומצאו את הנכס המתאים.",
};

export default function ProductsPage() {
  return (
    <>
      <PageHero
        eyebrow="פרויקטים"
        title="כל הפרויקטים שלנו"
        subtitle="סננו לפי סוג נכס, חפשו פרויקט או הציגו רק את פרויקטי ההשקה."
      />
      <div className="mx-auto max-w-6xl px-4 py-12">
        <ProductsCatalog products={products} categories={categories} />
      </div>
    </>
  );
}
