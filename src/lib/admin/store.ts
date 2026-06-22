// Backend-agnostic content store for the admin panel. Pure logic on top of the
// chosen backend (GitHub in prod, local FS in dev). Adapted to the Empire Towers
// content model: flat categories (no nav/descendants tree) and price-less office
// "products". ids are stable slug-strings and never change after creation, so
// references (homepage.bagTypes / featuredCategories, product.categoryIds) stay
// valid across renames.
import { getBackend } from "./backend";
import { PATHS, UPLOADS_DIR } from "./paths";
import type { Category, Product, Homepage, Site, ImageFocusMap } from "@/lib/types";

function toStr(v: unknown, fallback = ""): string {
  return v === undefined || v === null ? fallback : String(v);
}
function toStrArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.map((x) => String(x).trim()).filter(Boolean);
}

// Slug that keeps Hebrew + latin letters and digits; collapses everything else
// to single dashes. Falls back to a stable prefixed id when empty.
function slugify(value: string, fallback: string): string {
  const s = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u0590-\u05ff]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return s || fallback;
}

function uniqueId(base: string, taken: Set<string>): string {
  if (!taken.has(base)) return base;
  let i = 2;
  while (taken.has(`${base}-${i}`)) i++;
  return `${base}-${i}`;
}

// ---------- site & homepage (whole-object) ----------
export async function getSite(): Promise<Site> {
  return getBackend().readJSON<Site>(PATHS.site);
}
export async function putSite(obj: Site): Promise<unknown> {
  return getBackend().writeJSON(PATHS.site, obj, "admin: update site settings");
}
export async function getHomepage(): Promise<Homepage> {
  return getBackend().readJSON<Homepage>(PATHS.homepage);
}
export async function putHomepage(obj: Homepage): Promise<unknown> {
  return getBackend().writeJSON(PATHS.homepage, obj, "admin: update homepage");
}

// ---------- image focal points (object-position map) ----------
// A non-destructive path -> CSS object-position map. The public build reads it
// through src/lib/data.ts (imageFocus()) and applies it wherever an image sits
// inside an object-cover cropping frame, so owners control which part shows.
const DEFAULT_FOCUS = "50% 50%";

export async function getImageFocus(): Promise<ImageFocusMap> {
  try {
    const map = await getBackend().readJSON<ImageFocusMap>(PATHS.imageFocus);
    return map && typeof map === "object" ? map : {};
  } catch {
    return {};
  }
}

// Re-reads the map and patches a single key (merge-on-save) so concurrent edits
// don't clobber. A centered/empty position deletes the key to keep the map lean.
export async function setImageFocus(path: string, position: string): Promise<ImageFocusMap> {
  const key = toStr(path).trim();
  if (!key) throw new Error("image path is required");
  const map = await getImageFocus();
  const pos = toStr(position).trim();
  if (!pos || pos === DEFAULT_FOCUS) {
    delete map[key];
  } else {
    map[key] = pos;
  }
  await getBackend().writeJSON(PATHS.imageFocus, map, `admin: set image focus ${key}`);
  return map;
}

// ---------- categories (flat list) ----------
export async function getCategories(): Promise<Category[]> {
  return getBackend().readJSON<Category[]>(PATHS.categories);
}

function normalizeCategory(input: Record<string, unknown>, id: string): Category {
  return {
    id,
    name: toStr(input.name).trim(),
    slug: slugify(toStr(input.slug || input.name), id),
    blurb: toStr(input.blurb),
    color: toStr(input.color, "#16314f"),
  };
}

// Create (no input.id) or update (existing input.id). Re-reads the full array
// server-side and patches a single item so concurrent edits don't clobber.
export async function saveCategory(input: Record<string, unknown>): Promise<Category> {
  const be = getBackend();
  const categories = await getCategories();
  const name = toStr(input.name).trim();
  if (!name) throw new Error("שם הקטגוריה נדרש");

  const id = toStr(input.id).trim();
  const idx = id ? categories.findIndex((c) => c.id === id) : -1;

  if (idx === -1) {
    const taken = new Set(categories.map((c) => c.id));
    const newId = uniqueId(slugify(toStr(input.slug || name), `cat-${Date.now().toString(36)}`), taken);
    const cat = normalizeCategory(input, newId);
    categories.push(cat);
    await be.writeJSON(PATHS.categories, categories, `admin: create category ${cat.name}`);
    return cat;
  }

  // update — id stays fixed so product.categoryIds references remain valid.
  const merged = normalizeCategory({ ...categories[idx], ...input }, categories[idx].id);
  categories[idx] = merged;
  await be.writeJSON(PATHS.categories, categories, `admin: update category ${merged.id}`);
  return merged;
}

// Delete a category and strip its id from every product so none are orphaned.
export async function deleteCategory(id: string): Promise<{ ok: boolean; reason?: string; id?: string }> {
  const be = getBackend();
  let categories = await getCategories();
  if (!categories.some((c) => c.id === id)) return { ok: false, reason: "not_found" };
  categories = categories.filter((c) => c.id !== id);
  await be.writeJSON(PATHS.categories, categories, `admin: delete category ${id}`);

  const products = await getProducts();
  let changed = false;
  const cleaned = products.map((p) => {
    if (Array.isArray(p.categoryIds) && p.categoryIds.includes(id)) {
      changed = true;
      return { ...p, categoryIds: p.categoryIds.filter((c) => c !== id) };
    }
    return p;
  });
  if (changed) {
    await be.writeJSON(PATHS.products, cleaned, `admin: detach products from category ${id}`);
  }
  return { ok: true, id };
}

// ---------- products / offices ----------
export async function getProducts(): Promise<Product[]> {
  return getBackend().readJSON<Product[]>(PATHS.products);
}

export async function getProduct(id: string): Promise<Product | null> {
  const products = await getProducts();
  return products.find((p) => p.id === id) || null;
}

function normalizeProduct(input: Record<string, unknown>, id: string): Product {
  const gallery = toStrArray(input.gallery);
  return {
    id,
    name: toStr(input.name).trim(),
    slug: slugify(toStr(input.slug || input.name), id),
    categoryIds: toStrArray(input.categoryIds),
    image: toStr(input.image).trim(),
    ...(gallery.length ? { gallery } : {}),
    shortDesc: toStr(input.shortDesc),
    description: toStr(input.description),
    features: toStrArray(input.features),
    uses: toStrArray(input.uses),
    branded: Boolean(input.branded),
  };
}

// Create or update. Re-reads the full array server-side and patches one item by
// id, so concurrent office edits don't clobber each other (no client merge
// needed, unlike the whole-object homepage save). (gotchas #3)
export async function saveProduct(input: Record<string, unknown>): Promise<Product> {
  const be = getBackend();
  const products = await getProducts();
  const name = toStr(input.name).trim();
  if (!name) throw new Error("שם היחידה נדרש");

  const id = toStr(input.id).trim();
  const idx = id ? products.findIndex((p) => p.id === id) : -1;

  if (idx === -1) {
    const taken = new Set(products.map((p) => p.id));
    const newId = uniqueId(slugify(toStr(input.slug || name), `office-${Date.now().toString(36)}`), taken);
    const product = normalizeProduct(input, newId);
    products.unshift(product);
    await be.writeJSON(PATHS.products, products, `admin: add office ${newId} (${product.name})`);
    return product;
  }

  // update — preserve image if the caller didn't send one.
  const existing = products[idx];
  const merged = normalizeProduct(
    { ...existing, ...input, image: toStr(input.image).trim() || existing.image },
    existing.id
  );
  products[idx] = merged;
  await be.writeJSON(PATHS.products, products, `admin: update office ${existing.id} (${merged.name})`);
  return merged;
}

export async function deleteProduct(id: string): Promise<{ ok: boolean; reason?: string; id?: string }> {
  const be = getBackend();
  const products = await getProducts();
  const idx = products.findIndex((p) => p.id === id);
  if (idx === -1) return { ok: false, reason: "not_found" };
  const [removed] = products.splice(idx, 1);
  await be.writeJSON(PATHS.products, products, `admin: delete office ${id} (${removed.name})`);
  return { ok: true, id };
}

// ---------- image uploads ----------
const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

function slugifyFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
}

// payload: { base64, contentType, filename? }
// Stores under a UNIQUE name so a new upload never collides with an existing
// asset or a stale CDN copy. Returns the public path to store in the JSON.
export async function uploadImage(payload: {
  base64?: string;
  contentType?: string;
  filename?: string;
}): Promise<{ path: string; repoPath: string }> {
  const { base64, contentType, filename } = payload;
  if (!base64) throw new Error("Missing image data.");
  const ext = EXT_BY_TYPE[contentType || ""] || "jpg";
  const base = slugifyFilename(filename || "image") || "image";
  const unique = `${base}-${Date.now().toString(36)}.${ext}`;
  const repoPath = `${UPLOADS_DIR}/${unique}`;
  const publicPath = `/images/uploads/${unique}`;
  const buffer = Buffer.from(base64, "base64");
  await getBackend().writeBinary(repoPath, buffer, `admin: upload ${repoPath}`);
  return { path: publicPath, repoPath };
}
