import type { Metadata } from "next";
import Image from "next/image";
import { site } from "@/lib/data";
import PageHero from "@/components/PageHero";
import { asset } from "@/lib/asset";

export const metadata: Metadata = {
  title: "אודות",
  description: "מגדלי האימפריה נדל״ן – חברת נדל״ן ויזמות המתמחה בפרויקטים יוקרתיים. ליווי אישי מרכישה ועד מסירת מפתח, בסטנדרטים הגבוהים ביותר.",
};

const values = [
  { title: "נדל״ן יוקרה ויזמות", text: "פרויקטים מתקדמים בליווי מקצועי, עם דגש על אדריכלות מצוינת ואיכות גמר יוצאת דופן." },
  { title: "ייעוץ מקצועי", text: "לפני כל עסקה – ניתוח אישי והתאמת הנכס לצרכים ולמטרות שלכם." },
  { title: "יחס אישי", text: "ליווי צמוד מהייעוץ הראשון ועד קבלת המפתח." },
  { title: "סטנדרט גבוה", text: "חומרי גמר מעולים, עיצוב אדריכלי פרמיום וסביבה מניבה ובטוחה להשקעה." },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="מי אנחנו"
        title="מגדלי האימפריה נדל״ן"
        subtitle="חברת נדל״ן ויזמות – פרויקטים יוקרתיים, בידיים מקצועיות."
      />

      <section className="mx-auto max-w-6xl px-4 py-14 grid gap-10 lg:grid-cols-2 items-center">
        <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-xl">
          <Image src={asset("/images/offices/ad-corridor.png")} alt="הפרויקטים שלנו" fill className="object-cover" />
        </div>
        <div>
          <h2 className="text-3xl font-black">יזמות נדל״ן יוקרה, עם ליווי אישי</h2>
          <p className="mt-4 text-muted leading-relaxed">
            מגדלי האימפריה נדל״ן היא חברת נדל״ן ויזמות המתמחה בפרויקטים יוקרתיים –
            ממגדלי מגורים ומשרדים, דרך בנייה להשכרה ופרויקטי השקה,
            ועד נכסי יוקרה ייחודיים ואיתור הזדמנויות השקעה נדירות.
          </p>
          <p className="mt-4 text-muted leading-relaxed">
            כל עסקה מתחילה בייעוץ אישי. אנחנו מאמינים בשקיפות מלאה, יחס אישי וסטנדרט מקצועי גבוה –
            כדי שתרגישו בנוח, בטוחים ומרוצים מהנכס שבחרתם.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {site.certifications.map((c) => (
              <span key={c} className="rounded-full bg-surface border border-border px-4 py-2 text-sm font-medium">{c}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <h2 className="text-center text-3xl font-black">הערכים שמנחים אותנו</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v) => (
              <div key={v.title} className="rounded-2xl bg-white border border-border border-t-2 border-t-gold p-6">
                <h3 className="font-display font-bold">{v.title}</h3>
                <p className="mt-2 text-sm text-muted leading-relaxed">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
