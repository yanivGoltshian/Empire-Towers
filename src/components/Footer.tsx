import Image from "next/image";
import Link from "next/link";
import { site, categories, telLink, whatsappLink } from "@/lib/data";
import SocialButtons from "@/components/SocialButtons";
import { asset } from "@/lib/asset";

export default function Footer() {
  return (
    <footer className="bg-ink text-white/70">
      <div className="mx-auto max-w-6xl px-4 pt-14 pb-8">
        <div className="grid gap-10 md:grid-cols-4">
          {/* brand */}
          <div className="md:col-span-1">
            <div className="inline-flex rounded-xl bg-white p-3">
              <Image
                src={asset("/images/brand/logo.png")}
                alt={site.name}
                width={150}
                height={82}
                className="h-12 w-auto"
              />
            </div>
            <p className="mt-4 text-sm leading-relaxed text-white/60">
              {site.tagline}. מתחם משרדים חדש ביבנה בכניסה לעיר ובסמוך לתחנת הרכבת – כניסה מיידית במחיר פיקס שכולל הכל.
            </p>
            <SocialButtons className="mt-5" variant="dark" />
          </div>

          {/* categories */}
          <div>
            <h4 className="font-display text-base font-bold text-white mb-4">המשרדים שלנו</h4>
            <ul className="space-y-2.5 text-sm">
              {categories.map((c) => (
                <li key={c.id}>
                  <Link href={`/category/${c.slug}/`} className="inline-flex items-center gap-2 hover:text-white transition">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: c.color }} />
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* links */}
          <div>
            <h4 className="font-display text-base font-bold text-white mb-4">ניווט</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/products/" className="hover:text-white transition">כל המשרדים</Link></li>
              <li><Link href="/branded/" className="hover:text-white transition">מבצעי השקה</Link></li>
              <li><Link href="/about/" className="hover:text-white transition">אודות</Link></li>
              <li><Link href="/contact/" className="hover:text-white transition">צרו קשר</Link></li>
              <li><Link href="/accessibility/" className="hover:text-white transition">הצהרת נגישות</Link></li>
            </ul>
          </div>

          {/* contact */}
          <div>
            <h4 className="font-display text-base font-bold text-white mb-4">יצירת קשר</h4>
            <ul className="space-y-2.5 text-sm">
              <li><span className="text-white/45">טלפון:</span> <a href={telLink(site.phone)} className="hover:text-white transition">{site.phone}</a></li>
              <li className="text-white/60"><span className="text-white/45">כתובת:</span> {site.address}, {site.city}</li>
              <li className="text-white/60"><span className="text-white/45">שעות:</span> {site.hours}</li>
              <li>
                <a href={whatsappLink("היי, אשמח לקבל פרטים על משרד פרטי להשכרה במגדלי האימפריה")} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-2 rounded-full bg-eco px-4 py-2 text-sm font-semibold text-white hover:brightness-110 transition">
                  וואטסאפ
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 h-px bg-white/10" />
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/45">
          <p>© {new Date().getFullYear()} {site.name}. כל הזכויות שמורות.</p>
          <p className="flex flex-wrap gap-2 justify-center">
            {site.certifications.map((c) => (
              <span key={c} className="rounded-full border border-white/15 px-3 py-1">{c}</span>
            ))}
          </p>
        </div>
      </div>
    </footer>
  );
}
