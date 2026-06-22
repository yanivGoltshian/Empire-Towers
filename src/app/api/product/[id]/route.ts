import { json, requireAdmin } from "@/lib/admin/respond";
import { getProduct, deleteProduct } from "@/lib/admin/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  try {
    const { id } = await params;
    const product = await getProduct(id);
    if (!product) return json(404, { error: "Office not found." });
    return json(200, product);
  } catch (e) {
    return json(500, { error: (e as Error).message });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  try {
    const { id } = await params;
    const result = await deleteProduct(id);
    if (!result.ok) return json(404, { error: "Office not found." });
    return json(200, result);
  } catch (e) {
    return json(500, { error: (e as Error).message });
  }
}
