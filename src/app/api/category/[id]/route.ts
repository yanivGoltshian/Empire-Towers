import { json, requireAdmin } from "@/lib/admin/respond";
import { deleteCategory } from "@/lib/admin/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  try {
    const { id } = await params;
    const result = await deleteCategory(id);
    if (!result.ok) return json(404, { error: "Category not found." });
    return json(200, result);
  } catch (e) {
    return json(500, { error: (e as Error).message });
  }
}
