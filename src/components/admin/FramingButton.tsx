"use client";

import React from "react";
import { ImageFocusEditor } from "./ImageFocusEditor";

// A small "🎯 framing" button that opens the focal-point editor for one image.
// Self-contained (owns its open state) so it drops cleanly next to any image
// thumbnail or upload field. `path` is the stored site-absolute path that keys
// the focus map; `src` is what to display in the editor (a blob preview or path).
export function FramingButton({
  src,
  path,
  frame,
  className = "",
  compact = false,
  onSaved,
}: {
  src: string;
  path: string;
  frame?: string;
  className?: string;
  compact?: boolean;
  onSaved?: (position: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  if (!path) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="מיקוד התמונה במסגרת"
        aria-label="מיקוד התמונה במסגרת"
        className={
          compact
            ? `grid h-8 w-8 place-items-center rounded-full bg-black/60 text-sm text-white hover:bg-black/80 ${className}`
            : `inline-flex min-h-[2.25rem] items-center gap-1.5 rounded-xl bg-black/5 px-3 text-sm font-semibold text-[#16314f] hover:bg-black/10 ${className}`
        }
      >
        🎯{compact ? "" : <span>מיקוד במסגרת</span>}
      </button>
      {open ? (
        <ImageFocusEditor src={src} path={path} frame={frame} onClose={() => setOpen(false)} onSaved={onSaved} />
      ) : null}
    </>
  );
}
