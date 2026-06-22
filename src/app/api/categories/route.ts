import { json, requireAdmin, readBody } from "@/lib/admin/respond";
import { getCategories, saveCategory } from "@/lib/admin/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  try {
    return json(200, await getCategories());
  } catch (e) {
    return json(500, { error: (e as Error).message });
  }
}

// Create (no id) or update (with id) — server re-reads + patches one item.
export async function POST(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  try {
    const body = await readBody(request);
    const cat = await saveCategory(body);
    return json(200, { ok: true, category: cat });
  } catch (e) {
    return json(400, { error: (e as Error).message });
  }
}
