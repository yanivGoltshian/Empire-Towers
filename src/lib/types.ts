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
  nylonAdvantages: { title: string; paragraphs: string[]; image: string };
  stats: Stat[];
  brandedPitch: { title: string; text: string; bullets: string[]; image: string };
  galleryMosaic: string[];
  aboutTeaser: { title: string; text: string; href: string };
  hotDeals: {
    eyebrow: string;
    title: string;
    text: string;
    cta: CTA;
    images: string[];
  };
  faq?: { q: string; a: string }[];
  // Legacy fields kept optional for backward compatibility; no longer rendered
  // on the live homepage and not editable in the admin.
  bagTypesTitle?: string;
  bagTypesSubtitle?: string;
  bagTypes?: string[];
  featuredCategories?: string[];
  video?: { youtubeId: string; title: string; caption: string };
};

// Maps a stored image path (e.g. "/images/uploads/foo.jpg") to a CSS
// object-position value (e.g. "50% 30%") so the admin can choose which part of
// each photo stays visible inside the site's cropping (object-cover) frames.
export type ImageFocusMap = Record<string, string>;

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
  mapEmbedUrl?: string;
  social: { facebook: string; instagram: string };
  certifications: string[];
};
