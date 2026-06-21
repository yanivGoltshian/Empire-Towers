export default function PageHero({
  title,
  subtitle,
  eyebrow,
}: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
}) {
  return (
    <section className="hero-glow text-white">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
        {eyebrow && (
          <span className="inline-block rounded-full border border-gold/40 bg-white/5 px-4 py-1.5 text-sm font-semibold text-gold">
            {eyebrow}
          </span>
        )}
        <h1 className="mt-3 font-display text-3xl sm:text-4xl lg:text-5xl font-black leading-tight">
          {title}
        </h1>
        <div className="mt-4 h-0.5 w-20 gold-rule rounded-full" />
        {subtitle && <p className="mt-4 max-w-2xl text-white/75 leading-relaxed">{subtitle}</p>}
      </div>
    </section>
  );
}
