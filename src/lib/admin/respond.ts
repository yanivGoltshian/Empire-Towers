// Shared helpers for the admin route handlers.
import { NextResponse } from "next/server";
import { isAdmin } from "./auth";

// Admin API responses are always live data — never let the browser or any proxy
// serve a cached copy, or an edit can appear to "revert" on reload. (gotchas #2)
export function json(status: number, data: unknown): NextResponse {
  return NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
  });
}

// Returns a 403 response if the caller is not an admin, otherwise null.
export async function requireAdmin(request: Request): Promise<NextResponse | null> {
  if (!(await isAdmin(request))) {
    return json(403, { error: "Forbidden — admin sign-in required." });
  }
  return null;
}

export async function readBody<T = Record<string, unknown>>(request: Request): Promise<T> {
  try {
    const text = await request.text();
    return (text ? JSON.parse(text) : {}) as T;
  } catch {
    throw new Error("Invalid JSON body.");
  }
}
