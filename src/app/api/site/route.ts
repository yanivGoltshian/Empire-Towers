import { json, requireAdmin, readBody } from "@/lib/admin/respond";
import { getSite, putSite } from "@/lib/admin/store";
import type { Site } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  try {
    return json(200, await getSite());
  } catch (e) {
    return json(500, { error: (e as Error).message });
  }
}

export async function PUT(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  try {
    const body = await readBody<Site>(request);
    await putSite(body);
    return json(200, { ok: true });
  } catch (e) {
    return json(500, { error: (e as Error).message });
  }
}
