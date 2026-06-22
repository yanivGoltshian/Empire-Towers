import type { Metadata } from "next";
import { site, telLink, whatsappLink } from "@/lib/data";
import LeadForm from "@/components/LeadForm";
import PageHero from "@/components/PageHero";

export const metadata: Metadata = {
  title: "צרו קשר",
  description: "צרו קשר עם מגדלי האימפריה נדל״ן לתיאום פגישת ייעוץ או סיור בפרויקט. טלפון, וואטסאפ ומיקום המשרד.",
};

export default function ContactPage() {
  const cards = [
    { title: "טלפון", value: site.phone, href: telLink(site.phone) },
    { title: "וואטסאפ", value: "שליחת הודעה", href: whatsappLink("היי, אשמח לקבל פרטים על הפרויקטים והנכסים של מגדלי האימפריה נדל״ן") },
    { title: "אינסטגרם", value: "empire.towers", href: site.social.instagram },
    { title: "פייסבוק", value: "מגדלי האימפריה נדל״ן", href: site.social.facebook },
  ];

  return (
    <>
      <PageHero
        eyebrow="דברו איתנו"
        title="צרו קשר"
        subtitle="נשמח לעמוד לרשותכם ולתאם פגישת ייעוץ או סיור בפרויקט. מענה אישי בשעות הפעילות."
      />

      <section className="mx-auto max-w-6xl px-4 py-12 grid gap-10 lg:grid-cols-2">
        <div>
          <div className="grid sm:grid-cols-2 gap-4">
            {cards.map((c) => (
              <a
                key={c.title}
                href={c.href}
                target={c.href.startsWith("http") ? "_blank" : undefined}
                rel="noopener noreferrer"
                className="rounded-2xl border border-border border-t-2 border-t-gold bg-white p-5 hover:border-brand hover:shadow-md transition"
              >
                <h3 className="font-display font-bold">{c.title}</h3>
                <p className="mt-1 text-sm text-muted">{c.value}</p>
              </a>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-border bg-surface p-5 space-y-2 text-sm">
            <p><strong>כתובת:</strong> {site.address}, {site.city}</p>
            <p><strong>שעות פעילות:</strong> {site.hours}</p>
            <div className="flex gap-3 pt-2">
              <a href={site.social.facebook} target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">Facebook</a>
              <a href={site.social.instagram} target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">Instagram</a>
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-border">
            <iframe
              title="מפה"
              src={site.mapEmbedUrl || `https://maps.google.com/maps?q=${encodeURIComponent(site.address + ", " + site.city)}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
              className="w-full h-64"
              loading="lazy"
            />
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-white p-6 sm:p-8 h-fit">
          <h2 className="text-2xl font-black">תיאום פגישת ייעוץ</h2>
          <p className="mt-1 text-sm text-muted">מלאו את הטופס ונחזור אליכם בהקדם.</p>
          <div className="mt-6">
            <LeadForm />
          </div>
        </div>
      </section>
    </>
  );
}
