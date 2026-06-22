import { json, requireAdmin, readBody } from "@/lib/admin/respond";
import { uploadImage } from "@/lib/admin/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Body: { base64, contentType, filename? }. Images are resized/recompressed in
// the BROWSER (Canvas) before they reach here, so this stays dependency-free and
// keeps the deployed app lean. Returns the public path to store in the JSON.
export async function POST(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  try {
    const body = await readBody<{ base64?: string; contentType?: string; filename?: string }>(request);
    const result = await uploadImage(body);
    return json(200, { ok: true, ...result });
  } catch (e) {
    return json(400, { error: (e as Error).message });
  }
}
