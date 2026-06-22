// Where the JSON "database" and uploaded images live in the repo. The admin
// write API commits these paths back via the GitHub Contents API (prod) or
// writes them on the local filesystem (dev), exactly as the public build reads
// them through src/lib/data.ts.
export const PATHS = {
  site: "src/data/site.json",
  homepage: "src/data/homepage.json",
  products: "src/data/products.json",
  categories: "src/data/categories.json",
} as const;

// Uploaded images get a single, unique destination so we never collide with an
// existing file or fight a stale CDN copy (see reference/gotchas.md #6).
export const UPLOADS_DIR = "public/images/uploads";
