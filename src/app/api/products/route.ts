import { json, requireAdmin, readBody } from "@/lib/admin/respond";
import { getProducts, saveProduct } from "@/lib/admin/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  try {
    return json(200, await getProducts());
  } catch (e) {
    return json(500, { error: (e as Error).message });
  }
}

// Create (no id) or update (with id). Server re-reads the array and patches one
// office by id, so concurrent edits are safe without a client-side merge.
export async function POST(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  try {
    const body = await readBody(request);
    const product = await saveProduct(body);
    return json(200, { ok: true, product });
  } catch (e) {
    return json(400, { error: (e as Error).message });
  }
}
