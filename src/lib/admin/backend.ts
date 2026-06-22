// Persistence backend contract. Two drivers implement it:
//   - github.ts  → commits to the repo via the GitHub Contents API (production)
//   - localfs.ts → writes the real working-tree files (local dev hot-reload)
export type Backend = {
  readJSON<T = unknown>(p: string): Promise<T>;
  writeJSON(p: string, data: unknown, message?: string): Promise<unknown>;
  writeBinary(p: string, buffer: Buffer, message?: string): Promise<unknown>;
  deleteFile(p: string, message?: string): Promise<unknown>;
  exists(p: string): Promise<boolean>;
};

import * as github from "./github";
import * as localfs from "./localfs";

// GitHub when a token + repo are configured (production on Vercel), otherwise
// the local filesystem (dev). On Vercel the serverless filesystem is read-only,
// so GitHub MUST be configured there for writes to work.
export function backendName(): "github" | "localfs" {
  if (process.env.GITHUB_TOKEN && process.env.GITHUB_REPO) return "github";
  return "localfs";
}

export function getBackend(): Backend {
  return backendName() === "github" ? github : localfs;
}
