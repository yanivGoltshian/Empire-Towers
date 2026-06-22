"use client";

import type { Site, Homepage, Category, Product } from "@/lib/types";

// --- Admin auth token -------------------------------------------------------
// The token is either a Google ID token (Google Sign-In mode) or the shared
// ADMIN_PASSCODE (passcode mode). It rides in the custom `X-Admin-Token` header
// on every write — never `Authorization`, which some hosts overwrite. (gotchas #1)
const TOKEN_KEY = "empire-admin-token";
let authToken: string | null = null;

export function setAuthToken(token: string | null): void {
  authToken = token;
  try {
    if (token) sessionStorage.setItem(TOKEN_KEY, token);
    else sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    /* sessionStorage unavailable */
  }
}

export function getAuthToken(): string | null {
  if (authToken) return authToken;
  try {
    authToken = sessionStorage.getItem(TOKEN_KEY);
  } catch {
    authToken = null;
  }
  return authToken;
}

function withAuth(headers: Record<string, string>): Record<string, string> {
  const t = getAuthToken();
  return t ? { ...headers, "x-admin-token": t } : headers;
}

export type AdminAuthConfig = { googleClientId: string; passcode: boolean; dev: boolean };

export async function getAuthConfig(): Promise<AdminAuthConfig> {
  try {
    const r = await fetch("/api/auth-config/", { cache: "no-store" });
    if (r.ok) {
      const j = (await r.json()) as Partial<AdminAuthConfig>;
      return {
        googleClientId: String(j.googleClientId || ""),
        passcode: Boolean(j.passcode),
        dev: Boolean(j.dev),
      };
    }
  } catch {
    /* unreachable → treat as not configured */
  }
  return { googleClientId: "", passcode: false, dev: false };
}

async function safeErr(r: Response): Promise<string> {
  try {
    const j = (await r.json()) as { error?: string };
    return j?.error || r.statusText;
  } catch {
    return r.statusText;
  }
}

// trailingSlash:true in next.config means /api/site 308-redirects to /api/site/.
// We call the trailing-slash form directly to skip that round-trip.
export async function apiGet<T>(path: string): Promise<T> {
  const r = await fetch(path, {
    headers: withAuth({ accept: "application/json" }),
    cache: "no-store",
  });
  if (!r.ok) throw new Error(`(${r.status}) ${await safeErr(r)}`);
  return (await r.json()) as T;
}

export async function apiSend<T>(path: string, method: string, body: unknown): Promise<T> {
  const r = await fetch(path, {
    method,
    headers: withAuth({ "content-type": "application/json" }),
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!r.ok) throw new Error(`(${r.status}) ${await safeErr(r)}`);
  return (await r.json()) as T;
}

// --- typed endpoints --------------------------------------------------------
export const getSite = () => apiGet<Site>("/api/site/");
export const putSite = (s: Site) => apiSend<{ ok: boolean }>("/api/site/", "PUT", s);

export const getHomepage = () => apiGet<Homepage>("/api/homepage/");
export const putHomepage = (h: Homepage) => apiSend<{ ok: boolean }>("/api/homepage/", "PUT", h);

export const getCategories = () => apiGet<Category[]>("/api/categories/");
export const saveCategory = (c: Partial<Category>) =>
  apiSend<{ ok: boolean; category: Category }>("/api/categories/", "POST", c);
export const deleteCategory = (id: string) =>
  apiSend<{ ok: boolean }>(`/api/category/${encodeURIComponent(id)}/`, "DELETE", {});

export const getProducts = () => apiGet<Product[]>("/api/products/");
export const saveProduct = (p: Partial<Product>) =>
  apiSend<{ ok: boolean; product: Product }>("/api/products/", "POST", p);
export const deleteProduct = (id: string) =>
  apiSend<{ ok: boolean }>(`/api/product/${encodeURIComponent(id)}/`, "DELETE", {});

// Image focal points: a path -> CSS object-position map applied wherever an
// image renders inside an object-cover cropping frame. Non-destructive.
export type ImageFocusMap = Record<string, string>;
export const getImageFocusMap = () => apiGet<ImageFocusMap>("/api/image-focus/");
export const setImageFocus = (path: string, position: string) =>
  apiSend<{ ok: boolean; map: ImageFocusMap }>("/api/image-focus/", "PUT", { path, position });

// --- image upload + client-side optimisation --------------------------------
type ImageSpec = { maxW: number; maxH: number; quality: number };

// "wide"  → hero, branded pitch, intro gallery, hot-deals (big, ≤2000px).
// "card"  → office thumbnails (≤1000px). Both flatten onto white + JPEG-encode.
const IMAGE_SPECS: Record<"wide" | "card", ImageSpec> = {
  wide: { maxW: 2000, maxH: 2000, quality: 0.85 },
  card: { maxW: 1000, maxH: 1000, quality: 0.82 },
};

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onerror = () => reject(new Error("Failed to process image"));
    fr.onload = () => {
      const res = String(fr.result || "");
      const comma = res.indexOf(",");
      resolve(comma >= 0 ? res.slice(comma + 1) : res);
    };
    fr.readAsDataURL(blob);
  });
}

function fileToData(file: File): Promise<{ base64: string; contentType: string }> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onerror = () => reject(new Error("Failed to read file"));
    fr.onload = () => {
      const res = String(fr.result || "");
      const comma = res.indexOf(",");
      resolve({
        base64: comma >= 0 ? res.slice(comma + 1) : res,
        contentType: file.type || "image/jpeg",
      });
    };
    fr.readAsDataURL(file);
  });
}

function loadImageElement(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = url;
  });
}

async function processImageFile(file: File, spec: ImageSpec): Promise<{ base64: string; contentType: string }> {
  let source: CanvasImageSource;
  let srcW = 0;
  let srcH = 0;
  let bitmap: ImageBitmap | null = null;
  let objectUrl: string | null = null;

  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    source = bitmap;
    srcW = bitmap.width;
    srcH = bitmap.height;
  } catch {
    objectUrl = URL.createObjectURL(file);
    const img = await loadImageElement(objectUrl);
    source = img;
    srcW = img.naturalWidth;
    srcH = img.naturalHeight;
  }

  try {
    if (!srcW || !srcH) throw new Error("Invalid image dimensions");
    const scale = Math.min(1, spec.maxW / srcW, spec.maxH / srcH);
    const w = Math.max(1, Math.round(srcW * scale));
    const h = Math.max(1, Math.round(srcH * scale));

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas not supported");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(source, 0, 0, w, h);

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", spec.quality));
    if (!blob) throw new Error("Failed to encode image");
    return { base64: await blobToBase64(blob), contentType: "image/jpeg" };
  } finally {
    bitmap?.close();
    if (objectUrl) URL.revokeObjectURL(objectUrl);
  }
}

function toJpgName(name: string): string {
  const base = (name || "image").replace(/\.[^.]+$/, "");
  return `${base || "image"}.jpg`;
}

// Same-origin preview. A just-committed image 404s on this origin until Vercel
// finishes the rebuild (~1-2 min); the editor covers that window with a local
// object-URL blob + a "publishing…" onError placeholder. Existing images live in
// the current deploy and load instantly. So return the stored path unchanged.
export function adminPreviewSrc(path: string): string {
  return path || "";
}

export async function uploadImage(kind: "wide" | "card", file: File): Promise<string> {
  let payload: { base64: string; contentType: string };
  let filename = file.name;
  try {
    payload = await processImageFile(file, IMAGE_SPECS[kind]);
    filename = toJpgName(file.name);
  } catch {
    payload = await fileToData(file);
  }
  const res = await apiSend<{ path: string }>("/api/upload/", "POST", {
    base64: payload.base64,
    contentType: payload.contentType,
    filename,
  });
  return res.path;
}
