import { json, requireAdmin, readBody } from "@/lib/admin/respond";
import { getHomepage, putHomepage } from "@/lib/admin/store";
import type { Homepage } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  try {
    return json(200, await getHomepage());
  } catch (e) {
    return json(500, { error: (e as Error).message });
  }
}

// Whole-object PUT. The client implements merge-on-save (snapshot baseline on
// load, re-fetch + overwrite only the regions it changed) so a save of one
// region never clobbers another edited meanwhile. (gotchas #3)
export async function PUT(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  try {
    const body = await readBody<Homepage>(request);
    await putHomepage(body);
    return json(200, { ok: true });
  } catch (e) {
    return json(500, { error: (e as Error).message });
  }
}
