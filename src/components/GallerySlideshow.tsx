"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { asset } from "@/lib/asset";

export default function GallerySlideshow({
  images,
  alt,
  interval = 3500,
}: {
  images: string[];
  alt: string;
  interval?: number;
}) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const id = setInterval(
      () => setActive((i) => (i + 1) % images.length),
      interval
    );
    return () => clearInterval(id);
  }, [images.length, interval]);

  return (
    <div className="relative aspect-video rounded-3xl overflow-hidden shadow-xl ring-1 ring-border">
      {images.map((src, i) => (
        <Image
          key={src}
          src={asset(src)}
          alt={alt}
          fill
          sizes="(max-width:1024px) 100vw, 50vw"
          className={`object-cover transition-opacity duration-[1200ms] ease-in-out ${
            i === active ? "opacity-100" : "opacity-0"
          }`}
          priority={i === 0}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-ink/45 to-transparent pointer-events-none" />
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            aria-label={`תמונה ${i + 1}`}
            className={`h-2 rounded-full transition-all ${
              i === active ? "w-7 bg-white" : "w-2 bg-white/50 hover:bg-white/80"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
