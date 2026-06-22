"use client";

import React from "react";
import type { Category } from "@/lib/types";
import { getCategories, saveCategory, deleteCategory } from "@/lib/admin/client";
import { Button, Field, Input, Textarea, Modal, Spinner, type ToastState } from "./ui";

const BLANK: Partial<Category> = { name: "", slug: "", blurb: "", color: "#16314f" };

export default function CategoriesTab({ toast }: { toast: (t: ToastState) => void }) {
  const [cats, setCats] = React.useState<Category[] | null>(null);
  const [editing, setEditing] = React.useState<Partial<Category> | null>(null);
  const [saving, setSaving] = React.useState(false);

  const reload = React.useCallback(() => {
    getCategories()
      .then(setCats)
      .catch((e) => toast({ msg: (e as Error).message, kind: "err" }));
  }, [toast]);

  React.useEffect(reload, [reload]);

  async function save() {
    if (!editing) return;
    if (!editing.name?.trim()) return toast({ msg: "נא להזין שם קטגוריה", kind: "err" });
    setSaving(true);
    try {
      await saveCategory(editing);
      toast({ msg: "הקטגוריה נשמרה ✓", kind: "ok" });
      setEditing(null);
      reload();
    } catch (e) {
      toast({ msg: (e as Error).message, kind: "err" });
    } finally {
      setSaving(false);
    }
  }

  async function remove(c: Category) {
    if (!confirm(`למחוק את הקטגוריה "${c.name}"? היא תוסר מכל היחידות.`)) return;
    try {
      await deleteCategory(c.id);
      toast({ msg: "הקטגוריה נמחקה", kind: "ok" });
      reload();
    } catch (e) {
      toast({ msg: (e as Error).message, kind: "err" });
    }
  }

  if (!cats) return <Spinner />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-[#16314f]">קטגוריות ({cats.length})</h2>
        <Button variant="secondary" onClick={() => setEditing({ ...BLANK })}>
          + קטגוריה
        </Button>
      </div>

      <ul className="space-y-2">
        {cats.map((c) => (
          <li
            key={c.id}
            className="flex items-center gap-3 rounded-xl border border-[#dde3ea] bg-white p-3"
          >
            <span
              className="h-9 w-9 shrink-0 rounded-lg"
              style={{ background: c.color }}
              aria-hidden
            />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-[#16202e]">{c.name}</p>
              <p className="truncate text-xs text-[#5e6773]">{c.blurb}</p>
            </div>
            <button
              onClick={() => setEditing({ ...c })}
              className="shrink-0 rounded-lg px-3 py-2 text-sm font-semibold text-[#16314f] hover:bg-black/5"
            >
              עריכה
            </button>
            <button
              onClick={() => remove(c)}
              aria-label="מחיקה"
              className="shrink-0 rounded-lg px-2 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              🗑
            </button>
          </li>
        ))}
      </ul>

      {editing ? (
        <Modal
          title={editing.id ? "עריכת קטגוריה" : "קטגוריה חדשה"}
          onClose={() => setEditing(null)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setEditing(null)}>
                ביטול
              </Button>
              <Button onClick={save} disabled={saving}>
                {saving ? "שומר…" : "שמירה"}
              </Button>
            </>
          }
        >
          <Field label="שם הקטגוריה">
            <Input value={editing.name || ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
          </Field>
          <Field label="כתובת (slug)" hint={editing.id ? "לא ניתן לשינוי לאחר יצירה" : "יתמלא אוטומטית מהשם אם ריק"}>
            <Input
              dir="ltr"
              value={editing.slug || ""}
              disabled={Boolean(editing.id)}
              onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
            />
          </Field>
          <Field label="תיאור קצר">
            <Textarea value={editing.blurb || ""} onChange={(e) => setEditing({ ...editing, blurb: e.target.value })} />
          </Field>
          <Field label="צבע">
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={editing.color || "#16314f"}
                onChange={(e) => setEditing({ ...editing, color: e.target.value })}
                className="h-11 w-14 shrink-0 cursor-pointer rounded-lg border border-[#dde3ea] bg-white"
              />
              <Input
                dir="ltr"
                value={editing.color || ""}
                onChange={(e) => setEditing({ ...editing, color: e.target.value })}
              />
            </div>
          </Field>
        </Modal>
      ) : null}
    </div>
  );
}
