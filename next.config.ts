import type { NextConfig } from "next";

// Single-host on Vercel: the public pages stay statically generated (SSG) while
// the admin write-API under /api/* runs as Vercel serverless functions. That is
// why `output: "export"` is intentionally NOT set here — a pure static export
// cannot serve route handlers. trailingSlash is kept so existing public URLs
// (and their SEO) don't change; the admin client therefore calls API paths WITH
// a trailing slash to avoid a 308 redirect.
//
// basePath/assetPrefix stay env-driven (empty on Vercel = served from root).
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  trailingSlash: true,
  images: { unoptimized: true },
  basePath,
  assetPrefix: basePath || undefined,
};

export default nextConfig;
