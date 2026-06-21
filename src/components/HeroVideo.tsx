"use client";

import { useEffect, useRef, useState } from "react";

// Muted, looping, autoplay YouTube background for the hero. Keeps the static
// hero image underneath as a poster (shown while loading and for users who
// prefer reduced motion). The iframe is scaled with JS to fully cover its
// container at 16:9 regardless of the hero's height.
export default function HeroVideo({
  videoId,
  start = 0,
}: {
  videoId: string;
  start?: number;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setShow(true);
  }, []);

  useEffect(() => {
    if (!show) return;
    const wrap = wrapRef.current;
    const frame = frameRef.current;
    if (!wrap || !frame) return;
    const ratio = 16 / 9;
    const cover = () => {
      const cw = wrap.clientWidth;
      const ch = wrap.clientHeight;
      let w = cw;
      let h = cw / ratio;
      if (h < ch) {
        h = ch;
        w = ch * ratio;
      }
      frame.style.width = `${Math.ceil(w)}px`;
      frame.style.height = `${Math.ceil(h)}px`;
    };
    cover();
    const ro = new ResizeObserver(cover);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [show]);

  if (!show) return null;

  const params = new URLSearchParams({
    autoplay: "1",
    mute: "1",
    controls: "0",
    loop: "1",
    playlist: videoId,
    playsinline: "1",
    modestbranding: "1",
    rel: "0",
    iv_load_policy: "3",
    disablekb: "1",
    fs: "0",
    start: String(start),
  });

  return (
    <div ref={wrapRef} className="absolute inset-0 overflow-hidden" aria-hidden="true">
      <iframe
        ref={frameRef}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none border-0"
        src={`https://www.youtube.com/embed/${videoId}?${params.toString()}`}
        title=""
        tabIndex={-1}
        allow="autoplay; encrypted-media"
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
  );
}
