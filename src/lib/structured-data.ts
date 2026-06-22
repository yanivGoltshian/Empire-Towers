import { site } from "@/lib/data";
import type { Product } from "@/lib/types";

export const SITE_URL =
  (process.env.NEXT_PUBLIC_SITE_URL || "https://empire-towers.vercel.app") +
  (process.env.NEXT_PUBLIC_BASE_PATH || "");

export function organizationLd() {
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "@id": `${SITE_URL}/#organization`,
    name: site.name,
    legalName: site.legalName,
    description: site.description,
    url: SITE_URL,
    logo: `${SITE_URL}/images/brand/logo.png`,
    image: `${SITE_URL}/images/banners/hero.jpg`,
    telephone: site.phone,
    ...(site.email ? { email: site.email } : {}),
    priceRange: "₪₪",
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address,
      addressLocality: site.city,
      addressCountry: "IL",
    },
    openingHours: ["Su-Th 09:00-18:00", "Fr 09:00-13:00"],
    sameAs: [site.social.facebook, site.social.instagram].filter(Boolean),
  };
}

export function websiteLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: site.name,
    url: SITE_URL,
    inLanguage: "he-IL",
    publisher: { "@id": `${SITE_URL}/#organization` },
  };
}

export function productLd(product: Product) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDesc,
    image: product.image ? `${SITE_URL}${product.image}` : undefined,
    brand: { "@type": "Brand", name: site.name },
    manufacturer: { "@id": `${SITE_URL}/#organization` },
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
      priceCurrency: "ILS",
      seller: { "@id": `${SITE_URL}/#organization` },
      url: `${SITE_URL}/products/${product.slug}/`,
    },
  };
}

export function breadcrumbLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${SITE_URL}${it.url}`,
    })),
  };
}
