"use client";

import { useState } from "react";
import { products, site, whatsappLink } from "@/lib/data";

export default function LeadForm({ defaultProduct }: { defaultProduct?: string }) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    product: defaultProduct ?? "",
    quantity: "",
    branded: "",
    message: "",
  });

  function buildText() {
    const lines = [
      "היי, אשמח לקבל פרטים על הפרויקטים והנכסים של מגדלי האימפריה נדל״ן",
      form.name && `שם: ${form.name}`,
      form.phone && `טלפון: ${form.phone}`,
      form.product && `פרויקט מבוקש: ${form.product}`,
      form.quantity && `מועד מועדף: ${form.quantity}`,
      form.branded && `מטרת הפנייה: ${form.branded}`,
      form.message && `הערות: ${form.message}`,
    ].filter(Boolean);
    return lines.join("\n");
  }

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const inputCls =
    "w-full rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        window.open(whatsappLink(buildText()), "_blank");
      }}
      className="grid gap-4"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium mb-1.5">שם מלא</label>
          <input className={inputCls} value={form.name} onChange={set("name")} placeholder="ישראל ישראלי" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">טלפון</label>
          <input className={inputCls} value={form.phone} onChange={set("phone")} placeholder="050-0000000" type="tel" required />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium mb-1.5">הפרויקט המבוקש</label>
          <select className={inputCls} value={form.product} onChange={set("product")}>
            <option value="">בחרו פרויקט…</option>
            {products.map((p) => (
              <option key={p.id} value={p.name}>{p.name}</option>
            ))}
            <option value="אחר / לא בטוח/ה">אחר / לא בטוח/ה</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">מועד מועדף</label>
          <input className={inputCls} value={form.quantity} onChange={set("quantity")} placeholder="לדוגמה: ימי שלישי אחה״צ" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5">מטרת הפנייה</label>
        <div className="flex flex-wrap gap-2">
          {["תיאום סיור", "בקשת מידע", "שאלה כללית", "פרויקטים בהשקה"].map((opt) => (
            <button
              type="button"
              key={opt}
              onClick={() => setForm((f) => ({ ...f, branded: opt }))}
              className={`rounded-full px-4 py-2 text-sm font-medium border transition ${
                form.branded === opt
                  ? "border-brand bg-brand text-white"
                  : "border-border bg-white hover:border-brand/50"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5">הערות נוספות</label>
        <textarea className={inputCls} rows={3} value={form.message} onChange={set("message")} placeholder="שם הפרויקט, שאלות, מועד נוח לפגישה…" />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-eco px-6 py-3.5 font-semibold text-white hover:bg-eco-dark transition"
        >
          שליחה בוואטסאפ
        </button>
        <a
          href={`tel:${site.phone.replace(/[^0-9+]/g, "")}`}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-6 py-3.5 font-semibold hover:border-brand hover:text-brand transition"
        >
          חיוג למשרד
        </a>
      </div>
      <p className="text-xs text-muted">הפרטים נשלחים ישירות אלינו לוואטסאפ – ללא שמירה במאגר.</p>
    </form>
  );
}
