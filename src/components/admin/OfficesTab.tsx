"use client";

import React from "react";
import type { Product, Category } from "@/lib/types";
import { getProducts, getCategories, saveProduct, deleteProduct, adminPreviewSrc } from "@/lib/admin/client";
import {
  Button,
  Field,
  Input,
  Textarea,
  ListEditor,
  ImageUpload,
  Toggle,
  Modal,
  Spinner,
  type ToastState,
} from "./ui";

const BLANK: Partial<Product> = {
  name: "",
  slug: "",
  categoryIds: [],
  image: "",
  gallery: [],
  shortDesc: "",
  description: "",
  features: [],
  uses: [],
  branded: false,
};

export default function OfficesTab({ toast }: { toast: (t: ToastState) => void }) {
  const [products, setProducts] = React.useState<Product[] | null>(null);
  const [cats, setCats] = React.useState<Category[]>([]);
  const [editing, setEditing] = React.useState<Partial<Product> | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [busy, setBusy] = React.useState(false);

  const reload = React.useCallback(() => {
    getProducts()
      .then(setProducts)
      .catch((e) => toast({ msg: (e as Error).message, kind: "err" }));
    getCategories().then(setCats).catch(() => {});
  }, [toast]);

  React.useEffect(reload, [reload]);

  async function save() {
    if (!editing) return;
    if (!editing.name?.trim()) return toast({ msg: "נא להזין שם ליחידה", kind: "err" });
    setSaving(true);
    try {
      await saveProduct(editing);
      toast({ msg: "היחידה נשמרה ✓", kind: "ok" });
      setEditing(null);
      reload();
    } catch (e) {
      toast({ msg: (e as Error).message, kind: "err" });
    } finally {
      setSaving(false);
    }
  }

  async function remove(p: Product) {
    if (!confirm(`למחוק את "${p.name}"?`)) return;
    try {
      await deleteProduct(p.id);
      toast({ msg: "היחידה נמחקה", kind: "ok" });
      reload();
    } catch (e) {
      toast({ msg: (e as Error).message, kind: "err" });
    }
  }

  if (!products) return <Spinner />;

  const e = editing;
  const toggleCat = (id: string) => {
    if (!e) return;
    const cur = e.categoryIds || [];
    setEditing({ ...e, categoryIds: cur.includes(id) ? cur.filter((c) => c !== id) : [...cur, id] });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-[#16314f]">משרדים ויחידות ({products.length})</h2>
        <Button variant="secondary" onClick={() => setEditing({ ...BLANK })}>
          + יחידה
        </Button>
      </div>

      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {products.map((p) => (
          <li key={p.id} className="flex items-center gap-3 rounded-xl border border-[#dde3ea] bg-white p-2.5">
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-[#f7f4ee]">
              {p.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={adminPreviewSrc(p.image)} alt="" className="h-full w-full object-cover" />
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-[#16202e]">
                {p.branded ? "★ " : ""}
                {p.name}
              </p>
              <p className="truncate text-xs text-[#5e6773]">{p.shortDesc}</p>
            </div>
            <button
              onClick={() => setEditing({ ...p, gallery: p.gallery || [] })}
              className="shrink-0 rounded-lg px-3 py-2 text-sm font-semibold text-[#16314f] hover:bg-black/5"
            >
              עריכה
            </button>
            <button
              onClick={() => remove(p)}
              aria-label="מחיקה"
              className="shrink-0 rounded-lg px-2 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              🗑
            </button>
          </li>
        ))}
      </ul>

      {e ? (
        <Modal
          title={e.id ? "עריכת יחידה" : "יחידה חדשה"}
          onClose={() => setEditing(null)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setEditing(null)}>
                ביטול
              </Button>
              <Button onClick={save} disabled={saving || busy}>
                {saving ? "שומר…" : busy ? "מעלה תמונה…" : "שמירה"}
              </Button>
            </>
          }
        >
          <Field label="שם היחידה">
            <Input value={e.name || ""} onChange={(ev) => setEditing({ ...e, name: ev.target.value })} />
          </Field>
          <Field label="כתובת (slug)" hint={e.id ? "לא ניתן לשינוי לאחר יצירה" : "יתמלא אוטומטית מהשם אם ריק"}>
            <Input
              dir="ltr"
              value={e.slug || ""}
              disabled={Boolean(e.id)}
              onChange={(ev) => setEditing({ ...e, slug: ev.target.value })}
            />
          </Field>

          <ImageUpload
            label="תמונה ראשית"
            value={e.image || ""}
            kind="card"
            onBusy={setBusy}
            onUploaded={(path) => setEditing({ ...e, image: path })}
          />

          <GalleryEditor
            value={e.gallery || []}
            onBusy={setBusy}
            onChange={(g) => setEditing({ ...e, gallery: g })}
          />

          <Field label="קטגוריות">
            <div className="flex flex-wrap gap-2">
              {cats.map((c) => {
                const on = (e.categoryIds || []).includes(c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleCat(c.id)}
                    className={`min-h-[2.5rem] rounded-xl px-3 text-sm font-semibold transition ${
                      on ? "bg-[#16314f] text-white" : "bg-black/5 text-[#1a2a3f]"
                    }`}
                  >
                    {on ? "✓ " : ""}
                    {c.name}
                  </button>
                );
              })}
              {cats.length === 0 ? <span className="text-sm text-[#5e6773]">אין קטגוריות עדיין</span> : null}
            </div>
          </Field>

          <Field label="תיאור קצר">
            <Input value={e.shortDesc || ""} onChange={(ev) => setEditing({ ...e, shortDesc: ev.target.value })} />
          </Field>
          <Field label="תיאור מלא">
            <Textarea value={e.description || ""} onChange={(ev) => setEditing({ ...e, description: ev.target.value })} />
          </Field>

          <ListEditor label="מאפיינים" value={e.features || []} onChange={(v) => setEditing({ ...e, features: v })} />
          <ListEditor label="מתאים ל…" value={e.uses || []} onChange={(v) => setEditing({ ...e, uses: v })} />

          <Toggle label="יחידה מודגשת (★ מוצגת בעמוד הבית)" checked={Boolean(e.branded)} onChange={(v) => setEditing({ ...e, branded: v })} />
        </Modal>
      ) : null}
    </div>
  );
}

// Gallery: thumbnails with remove, plus an uploader that appends.
function GalleryEditor({
  value,
  onChange,
  onBusy,
}: {
  value: string[];
  onChange: (g: string[]) => void;
  onBusy: (b: boolean) => void;
}) {
  return (
    <Field label="גלריה">
      {value.length ? (
        <div className="mb-2 flex flex-wrap gap-2">
          {value.map((src, i) => (
            <div key={`${src}-${i}`} className="relative h-16 w-16 overflow-hidden rounded-lg border border-[#dde3ea]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={adminPreviewSrc(src)} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => onChange(value.filter((_, idx) => idx !== i))}
                className="absolute right-0 top-0 grid h-5 w-5 place-items-center bg-black/60 text-xs text-white"
                aria-label="הסרה"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      ) : null}
      <ImageUpload
        label=""
        value=""
        kind="wide"
        onBusy={onBusy}
        onUploaded={(path) => onChange([...value, path])}
      />
    </Field>
  );
}
