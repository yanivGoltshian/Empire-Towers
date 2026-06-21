import type { NextConfig } from "next";

// Static export → fully static `out/`, hostable on any CDN for ~$0.
// On GitHub Pages (project site) the app is served under a sub-path, so the
// CI build sets NEXT_PUBLIC_BASE_PATH (e.g. "/LandingPage"). Locally it is empty
// so dev/preview keep serving from the root.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  basePath,
  assetPrefix: basePath || undefined,
};

export default nextConfig;
