// Prefixes site-absolute asset paths (e.g. "/images/..") with the deploy base
// path so images resolve when the site is served from a sub-path (GitHub Pages
// project site). next/image does NOT add basePath to `src` when images are
// unoptimized, so every Image src must go through this helper.
const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";

export function asset(path: string): string {
  if (!path) return path;
  if (/^(https?:)?\/\//.test(path) || path.startsWith("data:") || path.startsWith("blob:")) {
    return path;
  }
  return path.startsWith("/") ? BASE + path : path;
}
