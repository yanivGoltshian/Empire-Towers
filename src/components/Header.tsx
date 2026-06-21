"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { site, categories, telLink, whatsappLink } from "@/lib/data";
import SocialButtons from "@/components/SocialButtons";
import { asset } from "@/lib/asset";

const nav = [
  { label: "בית", href: "/" },
  { label: "המשרדים", href: "/products/" },
  { label: "מבצעי השקה", href: "/branded/" },
  { label: "אודות", href: "/about/" },
  { label: "צרו קשר", href: "/contact/" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40">
      {/* utility bar */}
      <div className="bg-ink text-white/80 text-xs sm:text-[13px]">
        <div className="mx-auto max-w-6xl px-4 py-2 flex items-center justify-between gap-3">
          <span className="hidden sm:flex items-center gap-2">
            {site.address}, {site.city}
          </span>
          <span className="flex items-center gap-3">
            <SocialButtons size="sm" variant="dark" className="hidden sm:flex" />
            <span className="hidden sm:inline opacity-30">|</span>
            <a href={telLink(site.phone)} className="hover:text-white transition flex items-center gap-1">
              {site.phone}
            </a>
            <span className="opacity-30">|</span>
            <span className="text-white/60">{site.hours}</span>
          </span>
        </div>
      </div>

      {/* main bar */}
      <div className="bg-cream/85 backdrop-blur-md border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <Image
              src={asset("/images/brand/logo.png")}
              alt={site.name}
              width={150}
              height={82}
              className="h-12 w-auto"
              priority
            />
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="relative px-3.5 py-2 text-sm font-medium text-foreground/75 hover:text-foreground transition after:absolute after:bottom-1 after:right-3.5 after:left-3.5 after:h-px after:scale-x-0 after:bg-gold after:transition-transform hover:after:scale-x-100"
              >
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <a
              href={whatsappLink("היי, אשמח לקבל פרטים על משרד פרטי להשכרה במגדלי האימפריה")}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-2 rounded-full bg-gradient-to-l from-brand to-brand-dark px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:shadow-md hover:brightness-110 transition"
            >
              לתיאום סיור
            </a>
            <button
              onClick={() => setOpen((v) => !v)}
              className="md:hidden p-2 rounded-lg hover:bg-cream-2 text-foreground"
              aria-label="תפריט"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {open ? <path d="M18 6 6 18M6 6l12 12" /> : <path d="M3 12h18M3 6h18M3 18h18" />}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {open && (
        <nav className="md:hidden border-b border-border bg-cream px-4 py-2">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              onClick={() => setOpen(false)}
              className="block px-2 py-3 text-sm font-medium border-b border-border/60 last:border-0"
            >
              {n.label}
            </Link>
          ))}
          <div className="py-3 flex flex-wrap gap-2">
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/category/${c.slug}/`}
                onClick={() => setOpen(false)}
                className="text-xs rounded-full px-3 py-1.5 text-white"
                style={{ backgroundColor: c.color }}
              >
                {c.name}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
