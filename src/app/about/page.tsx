import type { Metadata } from "next";
import Image from "next/image";
import { site, imageFocus } from "@/lib/data";
import PageHero from "@/components/PageHero";
import { asset } from "@/lib/asset";

export const metadata: Metadata = {
  title: "אודות",
  description: "מגדלי האימפריה נדל״ן – מתחם משרדים חדש להשכרה ביבנה, במודל מחיר פיקס שכולל הכל. משרדים פרטיים ברמת גמר גבוהה לכניסה מיידית, חדר ישיבות, חניה חופשית וגישה נוחה.",
};

const values = [
  { title: "מחיר פיקס – כולל הכל", text: "סכום חודשי קבוע שכולל חשמל, אינטרנט, ארנונה, ניהול וניקיון. בלי הפתעות ובלי חשבונות נפרדים." },
  { title: "כניסה מיידית", text: "המשרדים מוכנים ברמת גמר גבוהה. בוחרים יחידה, חותמים ומתחילים לעבוד כבר למחרת." },
  { title: "מיקום מנצח", text: "בכניסה ליבנה, בסמוך לתחנת הרכבת ולצירים הראשיים – גישה נוחה ללקוחות ולעובדים." },
  { title: "הכל במקום אחד", text: "חדר ישיבות מאובזר, מטבחון, שירותים פרטיים וחניה חופשית צמודה – מעטפת מלאה לעסק." },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="מי אנחנו"
        title="מגדלי האימפריה נדל״ן"
        subtitle="מתחם משרדים חדש להשכרה ביבנה – במחיר פיקס שכולל הכל."
      />

      <section className="mx-auto max-w-6xl px-4 py-14 grid gap-10 lg:grid-cols-2 items-center">
        <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-xl">
          <Image src={asset("/images/offices/ad-corridor.png")} alt="מסדרון המשרדים במתחם מגדלי האימפריה ביבנה" fill className="object-cover" style={{ objectPosition: imageFocus("/images/offices/ad-corridor.png") }} />
        </div>
        <div>
          <h2 className="text-3xl font-black">מתחם משרדים שנותן לעסק להתרכז בעיקר</h2>
          <p className="mt-4 text-muted leading-relaxed">
            מגדלי האימפריה הוא מתחם משרדים חדש בכניסה ליבנה, שנבנה במיוחד לעסקים שרוצים בית
            מקצועי בלי כאב הראש. במקום עשרות חשבונות, ספקים והפתעות – אנחנו עובדים במודל
            מחיר פיקס אחד: סכום חודשי קבוע שכולל חשמל, אינטרנט, ארנונה, ניהול וניקיון.
          </p>
          <p className="mt-4 text-muted leading-relaxed">
            המשרדים מסופקים ברמת גמר גבוהה ומוכנים לכניסה מיידית, עם חדר ישיבות מאובזר,
            מטבחון, שירותים וחניה חופשית צמודה. בוחרים יחידה שמתאימה לגודל הצוות, חותמים –
            ומתחילים לעבוד. הכל שקוף, פשוט ובמקום אחד.
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
