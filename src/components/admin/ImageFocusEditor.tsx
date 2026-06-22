"use client";

import React from "react";
import { Modal, Button } from "./ui";
import { getImageFocusMap, setImageFocus } from "@/lib/admin/client";

// Parse an "x% y%" object-position string into {x, y} numbers (0-100).
function parsePos(pos: string | undefined): { x: number; y: number } {
  if (!pos) return { x: 50, y: 50 };
  const m = pos.match(/(-?\d+(?:\.\d+)?)%?\s+(-?\d+(?:\.\d+)?)%?/);
  if (!m) return { x: 50, y: 50 };
  const clamp = (n: number) => Math.max(0, Math.min(100, n));
  return { x: clamp(parseFloat(m[1])), y: clamp(parseFloat(m[2])) };
}

// Maps the optional aspect-ratio string to a Hebrew label for the preview caption.
function frameLabel(ratio: string): string {
  if (ratio === "1 / 1") return "ריבוע (כפי שמופיע באתר)";
  if (ratio === "4 / 3") return "מסגרת 4:3 (כפי שמופיע באתר)";
  if (ratio === "3 / 4") return "מסגרת לאורך (כפי שמופיע באתר)";
  return "מסגרת רחבה (כפי שמופיע באתר)";
}

// A draggable focal-point picker. The owner clicks/drags the part of the image
// they want kept in view; we store it as a CSS object-position so every cropping
// (object-cover) frame on the site shows that point. Non-destructive — the
// original image file is untouched. `frame` is the EXACT aspect-ratio this image
// uses on the public site, so the preview shows the real crop (not a generic grid).
export function ImageFocusEditor({
  src,
  path,
  frame,
  onClose,
  onSaved,
}: {
  src: string;
  path: string;
  frame?: string;
  onClose: () => void;
  onSaved?: (position: string) => void;
}) {
  const previewRatio = frame || "16 / 9";
  const [pos, setPos] = React.useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [loaded, setLoaded] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState("");
  const areaRef = React.useRef<HTMLDivElement | null>(null);
  const dragging = React.useRef(false);

  // Load the current saved focal point for this path (default centered).
  React.useEffect(() => {
    let alive = true;
    getImageFocusMap()
      .then((map) => {
        if (alive) setPos(parsePos(map[path]));
      })
      .catch(() => {
        /* keep centered default */
      })
      .finally(() => {
        if (alive) setLoaded(true);
      });
    return () => {
      alive = false;
    };
  }, [path]);

  const setFromEvent = React.useCallback((clientX: number, clientY: number) => {
    const el = areaRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((clientX - r.left) / r.width) * 100));
    const y = Math.max(0, Math.min(100, ((clientY - r.top) / r.height) * 100));
    setPos({ x: Math.round(x), y: Math.round(y) });
  }, []);

  const position = `${pos.x}% ${pos.y}%`;

  async function save() {
    setBusy(true);
    setErr("");
    try {
      await setImageFocus(path, position);
      onSaved?.(position);
      onClose();
    } catch (e) {
      setErr((e as Error).message || "השמירה נכשלה");
    } finally {
      setBusy(false);
    }
  }

  async function reset() {
    setBusy(true);
    setErr("");
    try {
      await setImageFocus(path, "50% 50%");
      setPos({ x: 50, y: 50 });
      onSaved?.("50% 50%");
      onClose();
    } catch (e) {
      setErr((e as Error).message || "האיפוס נכשל");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      title="מיקוד התמונה במסגרות"
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={reset} disabled={busy}>
            איפוס למרכז
          </Button>
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            ביטול
          </Button>
          <Button onClick={save} disabled={busy || !loaded}>
            {busy ? "שומר…" : "שמירה"}
          </Button>
        </>
      }
    >
      {err ? (
        <div className="sticky top-0 z-20 -mx-1 rounded-lg bg-red-600 px-3 py-2 text-center text-sm font-semibold text-white shadow">
          {err}
        </div>
      ) : null}

      <p className="text-sm text-[#5e6773]">
        גררו את הנקודה אל החלק החשוב בתמונה. כך נדאג שהוא יישאר במרכז המסגרת בכל
        מקום שבו התמונה מופיעה באתר (התמונה המקורית לא משתנה).
      </p>

      {/* Focal-point picker — image at natural aspect, click/drag to set point. */}
      <div
        ref={areaRef}
        className="relative w-full cursor-crosshair touch-none overflow-hidden rounded-xl border border-[#dde3ea] bg-[#f7f4ee] select-none"
        onPointerDown={(e) => {
          dragging.current = true;
          (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
          setFromEvent(e.clientX, e.clientY);
        }}
        onPointerMove={(e) => {
          if (dragging.current) setFromEvent(e.clientX, e.clientY);
        }}
        onPointerUp={() => {
          dragging.current = false;
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" className="block max-h-[50vh] w-full object-contain" draggable={false} />
        <span
          className="pointer-events-none absolute z-10 h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white bg-[#c2a14e] shadow-[0_0_0_2px_rgba(0,0,0,0.35)]"
          style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
        />
      </div>
      <p dir="ltr" className="text-center text-xs text-[#5e6773]">
        object-position: {position}
      </p>

      {/* Live preview of how the chosen point crops in the EXACT frame the site uses. */}
      <div>
        <span className="mb-2 block text-sm font-semibold text-[#1a2a3f]">
          {frameLabel(previewRatio)}
        </span>
        <div className="mx-auto w-full max-w-[280px]">
          <div
            className="relative w-full overflow-hidden rounded-lg border border-[#dde3ea] bg-[#f7f4ee]"
            style={{ aspectRatio: previewRatio }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              style={{ objectPosition: position }}
              draggable={false}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}
