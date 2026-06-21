import { site, whatsappLink } from "@/lib/data";

const wazeLink = `https://waze.com/ul?q=${encodeURIComponent(
  `${site.address} ${site.city}`
)}&navigate=yes`;

const ICONS: Record<string, React.ReactNode> = {
  facebook: (
    <path d="M13.5 21v-7h2.36l.35-2.74H13.5V9.51c0-.79.22-1.33 1.35-1.33h1.44V5.73a19.3 19.3 0 0 0-2.1-.11c-2.08 0-3.5 1.27-3.5 3.6v2.01H8.28V14h2.41v7z" />
  ),
  instagram: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="3.8" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17" cy="7" r="1.1" />
    </>
  ),
  email: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="m4 7.5 8 5.2 8-5.2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  waze: (
    <path d="M12 3a8 8 0 0 0-8 8c0 1 .2 1.8.5 2.6-.2.6-.7 1.2-1.3 1.5-.4.2-.4.8 0 1 .9.5 2.2.7 3.4.2A8 8 0 1 0 12 3zm-3 8.2a1.1 1.1 0 1 1 0-2.2 1.1 1.1 0 0 1 0 2.2zm6 0a1.1 1.1 0 1 1 0-2.2 1.1 1.1 0 0 1 0 2.2zm-5.4 2.4a.7.7 0 0 1 1 .1 2.9 2.9 0 0 0 4.8 0 .7.7 0 1 1 1.1.8 4.3 4.3 0 0 1-7 0 .7.7 0 0 1 .1-.9z" />
  ),
  whatsapp: (
    <path d="M12 2a9.9 9.9 0 0 0-8.5 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-2.8.8.8-2.8-.2-.3a8.2 8.2 0 1 1 6.7 3.6zm4.5-5.9c-.2-.1-1.4-.7-1.7-.8-.2-.1-.4-.1-.5.1l-.7.9c-.1.1-.2.2-.5.1-1.4-.5-2.3-1.7-2.6-2-.2-.3 0-.4.1-.6l.4-.4.2-.4v-.4l-.7-1.7c-.2-.5-.4-.4-.5-.4h-.5c-.2 0-.5.1-.7.3-.7.6-.9 1.6-.7 2.7.5 1.6 1.7 3 2 3.4 1.6 2.4 3.8 2.7 4.5 2.7.6 0 1.5-.3 1.7-.9.2-.5.2-1 .1-1.1z" />
  ),
};

type Item = { key: string; label: string; href: string; external?: boolean };

export default function SocialButtons({
  className = "",
  variant = "dark",
  size = "md",
}: {
  className?: string;
  variant?: "dark" | "light";
  size?: "sm" | "md";
}) {
  const items: Item[] = [
    { key: "facebook", label: "פייסבוק", href: site.social.facebook, external: true },
    { key: "instagram", label: "אינסטגרם", href: site.social.instagram, external: true },
    { key: "waze", label: "ניווט ב-Waze", href: wazeLink, external: true },
    {
      key: "whatsapp",
      label: "וואטסאפ",
      href: whatsappLink("היי, אשמח לקבל פרטים על משרד פרטי להשכרה במגדלי האימפריה"),
      external: true,
    },
  ];

  const base =
    variant === "light"
      ? "border-border bg-white text-foreground hover:border-gold hover:text-brand"
      : "border-white/15 bg-white/5 text-white/80 hover:border-gold hover:text-gold hover:bg-white/10";

  const sizing = size === "sm" ? "h-8 w-8" : "h-11 w-11";
  const iconSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  return (
    <div className={`flex flex-wrap items-center gap-2.5 ${className}`}>
      {items.map((it) => (
        <a
          key={it.key}
          href={it.href}
          aria-label={it.label}
          title={it.label}
          {...(it.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className={`inline-flex items-center justify-center rounded-full border transition ${sizing} ${base}`}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className={iconSize} aria-hidden="true">
            {ICONS[it.key]}
          </svg>
        </a>
      ))}
    </div>
  );
}
