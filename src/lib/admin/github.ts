// GitHub backend — production persistence. Commits JSON + images straight to the
// repo via the GitHub Contents API; each commit triggers Vercel's Git
// integration to rebuild and republish. No database, no blob storage → $0.
//
// Required env (set in the Vercel project):
//   GITHUB_TOKEN  - fine-grained PAT with Contents: read/write on the repo
//   GITHUB_REPO   - "owner/repo", e.g. "yanivGoltshian/Empire-Towers"
//   GITHUB_BRANCH - branch to commit to (default "main")
const API = "https://api.github.com";

type Meta = { sha: string; content: string; encoding: string };

function repo(): string {
  const r = process.env.GITHUB_REPO;
  if (!r) throw new Error("GITHUB_REPO is not configured.");
  return r;
}
function branch(): string {
  return process.env.GITHUB_BRANCH || "main";
}
function headers(): Record<string, string> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error("GITHUB_TOKEN is not configured.");
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "empire-admin",
  };
}

async function getMeta(p: string): Promise<Meta | null> {
  // The Contents API is edge-cached and lags a fresh commit by up to a minute.
  // Without busting that cache the admin reads STALE data right after a save —
  // the edit looks like it "reverted", and a stale read + save would silently
  // overwrite newer content. A unique `t=` makes every request a cache MISS and
  // `Cache-Control: no-cache` forces origin revalidation. (gotchas.md #2)
  const url =
    `${API}/repos/${repo()}/contents/${p}` +
    `?ref=${encodeURIComponent(branch())}&t=${Date.now()}`;
  const r = await fetch(url, {
    headers: { ...headers(), "Cache-Control": "no-cache" },
    cache: "no-store",
  });
  if (r.status === 404) return null;
  if (!r.ok) throw new Error(`GitHub read ${p}: ${r.status} ${await r.text()}`);
  return (await r.json()) as Meta;
}

async function put(p: string, contentB64: string, message: string): Promise<unknown> {
  const meta = await getMeta(p);
  const body: Record<string, unknown> = { message, content: contentB64, branch: branch() };
  if (meta && meta.sha) body.sha = meta.sha;
  const r = await fetch(`${API}/repos/${repo()}/contents/${p}`, {
    method: "PUT",
    headers: { ...headers(), "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`GitHub write ${p}: ${r.status} ${await r.text()}`);
  return r.json();
}

export async function readJSON<T = unknown>(p: string): Promise<T> {
  const meta = await getMeta(p);
  if (!meta) throw new Error(`Not found in repo: ${p}`);
  const buf = Buffer.from(meta.content, meta.encoding === "base64" ? "base64" : "utf8");
  return JSON.parse(buf.toString("utf8")) as T;
}

export async function exists(p: string): Promise<boolean> {
  return (await getMeta(p)) !== null;
}

export async function writeJSON(p: string, data: unknown, message?: string): Promise<unknown> {
  const b64 = Buffer.from(JSON.stringify(data, null, 2) + "\n", "utf8").toString("base64");
  return put(p, b64, message || `admin: update ${p}`);
}

export async function writeBinary(p: string, buffer: Buffer, message?: string): Promise<unknown> {
  const b64 = Buffer.from(buffer).toString("base64");
  return put(p, b64, message || `admin: upload ${p}`);
}

export async function deleteFile(p: string, message?: string): Promise<unknown> {
  const meta = await getMeta(p);
  if (!meta) return { ok: true };
  const r = await fetch(`${API}/repos/${repo()}/contents/${p}`, {
    method: "DELETE",
    headers: { ...headers(), "Content-Type": "application/json" },
    body: JSON.stringify({ message: message || `admin: delete ${p}`, sha: meta.sha, branch: branch() }),
  });
  if (!r.ok) throw new Error(`GitHub delete ${p}: ${r.status} ${await r.text()}`);
  return r.json();
}
