import type { Metadata } from "next";
import AdminApp from "@/components/admin/AdminApp";

export const metadata: Metadata = {
  title: "ניהול תוכן · מגדלי האימפריה",
  robots: { index: false, follow: false },
};

// Rendered as a full-screen overlay (z-[100]) that covers the site's Header,
// Footer and floating WhatsApp button (the root layout always renders them).
export default function AdminPage() {
  return <AdminApp />;
}
