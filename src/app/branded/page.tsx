import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { homepage, brandedProducts, imageFocus } from "@/lib/data";
import ProductCard from "@/components/ProductCard";
import LeadForm from "@/components/LeadForm";
import PageHero from "@/components/PageHero";
import { asset } from "@/lib/asset";

export const metadata: Metadata = {
  title: "פרויקטים בהשקה",
  description: "פרויקטים בהשקה של מגדלי האימפריה נדל״ן – הזדמנויות השקעה בלעדיות במחירי הכרות מיוחדים. מספר היחידות מוגבל.",
};

const steps = [
  { n: "1", title: "קובעים פגישת ייעוץ", text: "פוגשים אותנו לאבחון אישי והתאמת הנכס המדויק עבורכם." },
  { n: "2", title: "בונים תוכנית", text: "מתאימים את הפרויקט, מועדי הרכישה ואפשרויות המימון לצרכים שלכם." },
  { n: "3", title: "מתקדמים לעסקה", text: "מלווים אתכם בתהליך הרכישה בליווי מקצועי צמוד ובסטנדרט גבוה." },
  { n: "4", title: "מקבלים מפתח", text: "מסירה חלקה ומוקפדת – עם מעקב והמשך ליווי לאחר הרכישה." },
];

export default function BrandedPage() {
  const branded = brandedProducts();
  return (
    <>
      <PageHero
        eyebrow="הזדמנויות בלעדיות"
        title={homepage.brandedPitch.title}
        subtitle={homepage.brandedPitch.text}
      />

      <section className="mx-auto max-w-6xl px-4 py-14 grid gap-10 lg:grid-cols-2 items-center">
        <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-xl">
          <Image src={asset(homepage.brandedPitch.image)} alt="פרויקטים בהשקה" fill className="object-cover" style={{ objectPosition: imageFocus(homepage.brandedPitch.image) }} />
        </div>
        <ul className="space-y-4">
          {homepage.brandedPitch.bullets.map((b) => (
            <li key={b} className="flex items-start gap-3 text-lg">
              <span className="mt-2.5 h-1.5 w-1.5 rounded-full bg-eco shrink-0" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <h2 className="text-center text-3xl font-black">איך זה עובד?</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s) => (
              <div key={s.n} className="rounded-2xl bg-white border border-border p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-white font-black">{s.n}</div>
                <h3 className="mt-3 font-bold">{s.title}</h3>
                <p className="mt-1 text-sm text-muted leading-relaxed">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="text-3xl font-black">הפרויקטים שבהשקה</h2>
        <div className="mt-8 grid gap-4 grid-cols-2 lg:grid-cols-3">
          {branded.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-16">
        <div className="rounded-3xl border border-border bg-white p-6 sm:p-10">
          <div className="text-center">
            <h2 className="text-3xl font-black">רוצים לנצל את ההזדמנות?</h2>
            <p className="mt-2 text-muted">השאירו פרטים ונחזור אליכם לתיאום פגישת ייעוץ.</p>
          </div>
          <div className="mt-8">
            <LeadForm />
          </div>
          <p className="mt-4 text-center text-sm">
            או חזרו <Link href="/products/" className="text-brand font-semibold hover:underline">לכל הפרויקטים</Link>
          </p>
        </div>
      </section>
    </>
  );
}
