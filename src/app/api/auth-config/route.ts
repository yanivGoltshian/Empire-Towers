// Public endpoint (no auth): tells the admin client which sign-in UI to show —
// Google button, passcode field, or (in dev) nothing.
import { authConfig } from "@/lib/admin/auth";
import { json } from "@/lib/admin/respond";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return json(200, authConfig());
}
