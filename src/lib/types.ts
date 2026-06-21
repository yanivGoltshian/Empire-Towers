export type Category = {
  id: string;
  name: string;
  slug: string;
  blurb: string;
  color: string;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  categoryIds: string[];
  image: string;
  gallery?: string[];
  shortDesc: string;
  description: string;
  features: string[];
  uses: string[];
  branded: boolean;
};

export type CTA = { label: string; href: string };

export type Advantage = { title: string; text: string };

export type Stat = { value: string; label: string };

export type Homepage = {
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    image: string;
    ctaPrimary: CTA;
    ctaSecondary: CTA;
  };
  announcement: string;
  intro: { title: string; lead: string; paragraphs: string[]; gallery: string[] };
  advantages: Advantage[];
  bagTypesTitle: string;
  bagTypesSubtitle: string;
  bagTypes: string[];
  featuredCategories: string[];
  nylonAdvantages: { title: string; paragraphs: string[] };
  video: { youtubeId: string; title: string; caption: string };
  stats: Stat[];
  brandedPitch: { title: string; text: string; bullets: string[]; image: string };
  aboutTeaser: { title: string; text: string; href: string };
  hotDeals: {
    eyebrow: string;
    title: string;
    text: string;
    cta: CTA;
    images: string[];
  };
};

export type Site = {
  name: string;
  legalName: string;
  tagline: string;
  description: string;
  phone: string;
  phone2: string;
  whatsapp: string;
  email: string;
  address: string;
  city: string;
  hours: string;
  social: { facebook: string; instagram: string };
  certifications: string[];
};
