import type { Metadata } from "next";
import { site, telLink, whatsappLink } from "@/lib/data";
import PageHero from "@/components/PageHero";

export const metadata: Metadata = {
  title: "הצהרת נגישות",
  description: "הצהרת הנגישות של אתר מגדלי האימפריה נדל״ן – המחויבות שלנו להנגשת האתר לאנשים עם מוגבלות בהתאם לתקן הישראלי 5568 ולהנחיות WCAG.",
  robots: { index: false, follow: true },
};

export default function AccessibilityPage() {
  return (
    <>
      <PageHero
        eyebrow="נגישות"
        title="הצהרת נגישות"
        subtitle="אנחנו מאמינים שהאתר צריך להיות זמין לכולם – לכל אדם, בכל מצב ובכל מכשיר."
      />

      <section className="mx-auto max-w-3xl px-4 py-14 text-muted leading-relaxed space-y-8">
        <div>
          <h2 className="font-display text-2xl font-black text-ink">המחויבות שלנו</h2>
          <p className="mt-3">
            במגדלי האימפריה נדל״ן אנו רואים חשיבות רבה במתן שירות שוויוני לכלל הגולשים, ופועלים
            כדי שאתר זה יהיה נגיש ונוח לשימוש גם עבור אנשים עם מוגבלות. ההנגשה בוצעה במאמץ
            ליישם את הנחיות התקן הישראלי (ת״י 5568) ברמת AA ואת הנחיות WCAG 2.1.
          </p>
        </div>

        <div>
          <h2 className="font-display text-2xl font-black text-ink">מה הונגש באתר</h2>
          <ul className="mt-3 list-disc pr-5 space-y-2">
            <li>מבנה היררכי וכותרות סמנטיות לניווט ברור באמצעות קורא מסך.</li>
            <li>טקסט חלופי לתמונות בעלות משמעות וכפתורי פעולה מתויגים.</li>
            <li>ניווט מלא באמצעות מקלדת ופוקוס נראה על רכיבים פעילים.</li>
            <li>ניגודיות צבעים תקינה וטיפוגרפיה קריאה.</li>
            <li>תמיכה מלאה בכיווניות מימין לשמאל (RTL) בעברית.</li>
            <li>תצוגה מותאמת למגוון גדלי מסך – מובייל, טאבלט ומחשב.</li>
          </ul>
        </div>

        <div>
          <h2 className="font-display text-2xl font-black text-ink">הסתייגות</h2>
          <p className="mt-3">
            אנו משקיעים מאמצים מתמשכים לשפר את נגישות האתר. יחד עם זאת, ייתכנו דפים או רכיבים
            שטרם הונגשו במלואם, או תכנים שמקורם בצד שלישי. אם נתקלתם ברכיב שאינו נגיש – נשמח
            שתעדכנו אותנו, ונפעל לתקן בהקדם.
          </p>
        </div>

        <div>
          <h2 className="font-display text-2xl font-black text-ink">יצירת קשר בנושא נגישות</h2>
          <p className="mt-3">
            לכל פנייה, בקשה או דיווח על בעיית נגישות ניתן לפנות אלינו:
          </p>
          <ul className="mt-3 space-y-2">
            <li>
              <span className="text-ink/70">טלפון:</span>{" "}
              <a href={telLink(site.phone)} className="text-eco-dark hover:underline">{site.phone}</a>
            </li>
            <li>
              <span className="text-ink/70">וואטסאפ:</span>{" "}
              <a href={whatsappLink("היי, אשמח לדווח על נושא נגישות באתר")} target="_blank" rel="noopener noreferrer" className="text-eco-dark hover:underline">שליחת הודעה</a>
            </li>
            <li>
              <span className="text-ink/70">כתובת:</span> {site.address}, {site.city}
            </li>
          </ul>
        </div>

        <p className="text-sm text-ink/50">הצהרה זו עודכנה בתאריך {new Date().toLocaleDateString("he-IL")}.</p>
      </section>
    </>
  );
}
