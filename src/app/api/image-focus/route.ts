import { json, requireAdmin, readBody } from "@/lib/admin/respond";
import { getImageFocus, setImageFocus } from "@/lib/admin/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  try {
    return json(200, await getImageFocus());
  } catch (e) {
    return json(500, { error: (e as Error).message });
  }
}

export async function PUT(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  try {
    const body = await readBody<{ path?: string; position?: string }>(request);
    if (!body?.path) return json(400, { error: "path is required" });
    const map = await setImageFocus(body.path, body.position || "");
    return json(200, { ok: true, map });
  } catch (e) {
    return json(500, { error: (e as Error).message });
  }
}
