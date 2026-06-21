import categoriesJson from "@/data/categories.json";
import productsJson from "@/data/products.json";
import homepageJson from "@/data/homepage.json";
import siteJson from "@/data/site.json";
import type { Category, Product, Homepage, Site } from "./types";

export const site = siteJson as Site;
export const categories = categoriesJson as Category[];
export const products = productsJson as Product[];
export const homepage = homepageJson as Homepage;

export function getCategory(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function productsInCategory(categoryId: string): Product[] {
  return products.filter((p) => p.categoryIds.includes(categoryId));
}

export function brandedProducts(): Product[] {
  return products.filter((p) => p.branded);
}

export function whatsappLink(text?: string): string {
  const base = `https://wa.me/${site.whatsapp}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

export function telLink(phone: string): string {
  return `tel:${phone.replace(/[^0-9+]/g, "")}`;
}
