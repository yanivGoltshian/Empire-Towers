"use client";

import React from "react";
import { adminPreviewSrc, uploadImage } from "@/lib/admin/client";

// Mobile-first admin primitives. Phone styles are unprefixed; `sm:` adds the
// desktop refinements. Tap targets are ≥44px on phones; inputs use text-base so
// iOS doesn't zoom on focus. The shell is RTL; URL/email/hex/phone/slug fields
// opt back into LTR per-field.

export function Button({
  variant = "primary",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition " +
    "min-h-[2.75rem] sm:min-h-[2.25rem] disabled:opacity-50 disabled:pointer-events-none";
  const styles: Record<string, string> = {
    primary: "bg-[#16314f] text-white hover:bg-[#0e2740] shadow-sm",
    secondary: "bg-[#c2a14e] text-[#0e1a2a] hover:bg-[#b08f44]",
    danger: "bg-red-600 text-white hover:bg-red-700",
    ghost: "bg-transparent text-[#16314f] hover:bg-black/5",
  };
  return <button className={`${base} ${styles[variant]} ${className}`} {...props} />;
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-[#1a2a3f]">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-[#5e6773]">{hint}</span> : null}
    </label>
  );
}

const inputCls =
  "w-full rounded-xl border border-[#dde3ea] bg-white px-3 py-2.5 text-base sm:text-sm " +
  "text-[#16202e] outline-none transition focus:border-[#16314f] focus:ring-2 focus:ring-[#16314f]/15";

export function Input({ className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${inputCls} ${className}`} {...props} />;
}

export function Textarea({ className = "", ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${inputCls} min-h-[6rem] resize-y leading-relaxed ${className}`} {...props} />;
}

// Edit a string[] as one line per item (handy for paragraphs, features, bullets).
export function ListEditor({
  label,
  hint,
  value,
  onChange,
  dir = "rtl",
}: {
  label: string;
  hint?: string;
  value: string[];
  onChange: (next: string[]) => void;
  dir?: "rtl" | "ltr";
}) {
  return (
    <Field label={label} hint={hint || "פריט אחד בכל שורה"}>
      <Textarea
        dir={dir}
        value={(value || []).join("\n")}
        onChange={(e) =>
          onChange(
            e.target.value
              .split("\n")
              .map((s) => s.replace(/\s+$/, ""))
              .filter((s, i, arr) => s.trim() !== "" || i < arr.length - 1)
          )
        }
      />
    </Field>
  );
}

// Toggle pill (e.g. "ממותג"/branded).
export function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`inline-flex min-h-[2.75rem] items-center gap-2 rounded-xl px-3 text-sm font-semibold transition ${
        checked ? "bg-[#16314f] text-white" : "bg-black/5 text-[#1a2a3f]"
      }`}
    >
      <span
        className={`grid h-5 w-5 place-items-center rounded-full border ${
          checked ? "border-white bg-white text-[#16314f]" : "border-[#9aa4b2]"
        }`}
      >
        {checked ? "✓" : ""}
      </span>
      {label}
    </button>
  );
}

// Image picker with same-origin preview. While a freshly uploaded image is still
// being published (404 on this origin until Vercel rebuilds), we show the local
// object-URL blob, then a "🕓 publishing…" placeholder if that ever errors.
export function ImageUpload({
  label,
  value,
  kind,
  onUploaded,
  onBusy,
}: {
  label: string;
  value: string;
  kind: "wide" | "card";
  onUploaded: (path: string) => void;
  onBusy?: (busy: boolean) => void;
}) {
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState("");
  const [blobUrl, setBlobUrl] = React.useState<string | null>(null);
  const [broken, setBroken] = React.useState(false);

  React.useEffect(() => () => { if (blobUrl) URL.revokeObjectURL(blobUrl); }, [blobUrl]);

  async function handle(file: File) {
    setErr("");
    setBusy(true);
    onBusy?.(true);
    const localPreview = URL.createObjectURL(file);
    setBlobUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return localPreview;
    });
    setBroken(false);
    try {
      const path = await uploadImage(kind, file);
      onUploaded(path);
    } catch (e) {
      setErr((e as Error).message || "ההעלאה נכשלה");
    } finally {
      setBusy(false);
      onBusy?.(false);
    }
  }

  const previewSrc = blobUrl || adminPreviewSrc(value);

  return (
    <div>
      <span className="mb-1 block text-sm font-semibold text-[#1a2a3f]">{label}</span>
      <div className="flex items-center gap-3">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-[#dde3ea] bg-[#f7f4ee]">
          {previewSrc && !broken ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewSrc}
              alt=""
              className="h-full w-full object-cover"
              onError={() => setBroken(true)}
            />
          ) : (
            <div className="grid h-full w-full place-items-center text-center text-[10px] text-[#5e6773]">
              {value ? "🕓 מתפרסם…" : "אין תמונה"}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <label className="inline-flex">
            <span
              className={`inline-flex min-h-[2.75rem] cursor-pointer items-center rounded-xl px-4 text-sm font-semibold ${
                busy ? "bg-black/10 text-[#5e6773]" : "bg-[#16314f] text-white hover:bg-[#0e2740]"
              }`}
            >
              {busy ? "מעלה…" : "העלאת תמונה"}
            </span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={busy}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handle(f);
                e.target.value = "";
              }}
            />
          </label>
          {value ? (
            <p dir="ltr" className="mt-1 truncate text-left text-xs text-[#5e6773]">
              {value}
            </p>
          ) : null}
          {err ? <p className="mt-1 text-xs text-red-600">{err}</p> : null}
        </div>
      </div>
    </div>
  );
}

// Full-screen on phones, centered card on desktop. Sticky header + footer keep
// the Save button reachable while the body scrolls.
export function Modal({
  title,
  onClose,
  footer,
  children,
}: {
  title: string;
  onClose: () => void;
  footer?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[110] flex items-stretch justify-center bg-black/50 sm:items-center sm:p-4">
      <div className="flex h-full w-full flex-col bg-white shadow-2xl sm:h-auto sm:max-h-[90vh] sm:max-w-2xl sm:rounded-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-[#dde3ea] bg-white px-4 py-3 sm:rounded-t-2xl">
          <h3 className="truncate text-base font-bold text-[#16314f]">{title}</h3>
          <button
            onClick={onClose}
            aria-label="סגירה"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-xl text-[#5e6773] hover:bg-black/5"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">{children}</div>
        {footer ? (
          <div className="sticky bottom-0 z-10 flex items-center justify-end gap-2 border-t border-[#dde3ea] bg-white px-4 py-3 sm:rounded-b-2xl">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}

// Toast — bottom-center, auto-dismiss.
export type ToastState = { msg: string; kind: "ok" | "err" } | null;

export function Toast({ state, onDone }: { state: ToastState; onDone: () => void }) {
  React.useEffect(() => {
    if (!state) return;
    const t = setTimeout(onDone, 3500);
    return () => clearTimeout(t);
  }, [state, onDone]);
  if (!state) return null;
  return (
    <div
      role="status"
      className={`fixed bottom-5 left-1/2 z-[120] -translate-x-1/2 rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-lg ${
        state.kind === "ok" ? "bg-[#16314f]" : "bg-red-600"
      }`}
    >
      {state.msg}
    </div>
  );
}

export function Spinner({ label = "טוען…" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-[#5e6773]">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#16314f]/30 border-t-[#16314f]" />
      {label}
    </div>
  );
}
