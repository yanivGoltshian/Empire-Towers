// Local filesystem backend — used in development (no GITHUB_TOKEN). Reads and
// writes the real repo files so the Next dev server hot-reloads on save, exactly
// like editing the JSON by hand. On Vercel the filesystem is read-only, so this
// driver is never selected in production (GitHub is configured there instead).
import { promises as fs } from "node:fs";
import path from "node:path";

// process.cwd() is the repo root when running `next dev` / `next build`.
const ROOT = process.env.REPO_ROOT ? path.resolve(process.env.REPO_ROOT) : process.cwd();

function abs(p: string): string {
  return path.join(ROOT, p);
}

export async function readJSON<T = unknown>(p: string): Promise<T> {
  const text = await fs.readFile(abs(p), "utf8");
  return JSON.parse(text) as T;
}

export async function writeJSON(p: string, data: unknown): Promise<unknown> {
  await fs.mkdir(path.dirname(abs(p)), { recursive: true });
  await fs.writeFile(abs(p), JSON.stringify(data, null, 2) + "\n", "utf8");
  return { ok: true, path: p };
}

export async function writeBinary(p: string, buffer: Buffer): Promise<unknown> {
  await fs.mkdir(path.dirname(abs(p)), { recursive: true });
  await fs.writeFile(abs(p), buffer);
  return { ok: true, path: p };
}

export async function deleteFile(p: string): Promise<unknown> {
  try {
    await fs.unlink(abs(p));
  } catch {
    /* already gone */
  }
  return { ok: true, path: p };
}

export async function exists(p: string): Promise<boolean> {
  try {
    await fs.access(abs(p));
    return true;
  } catch {
    return false;
  }
}
