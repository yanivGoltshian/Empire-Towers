"use client";

import React from "react";
import type { Homepage } from "@/lib/types";
import { getHomepage, putHomepage, apiGet } from "@/lib/admin/client";
import {
  Button,
  Field,
  Input,
  Textarea,
  ListEditor,
  ImageUpload,
  Spinner,
  type ToastState,
} from "./ui";
import { FramingButton } from "./FramingButton";

function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T;
}

// Collapsible section — collapsed by default on mobile keeps the long form
// navigable. <details>/<summary> needs no JS state.
function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <details className="group rounded-xl border border-[#dde3ea] bg-white">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 font-bold text-[#16314f]">
        <span>
          {title}
          {hint ? <span className="block text-xs font-normal text-[#9aa4b2]">{hint}</span> : null}
        </span>
        <span className="shrink-0 text-[#9aa4b2] transition group-open:rotate-180">▾</span>
      </summary>
      <div className="space-y-4 border-t border-[#eef1f5] px-4 py-4">{children}</div>
    </details>
  );
}

// Reusable gallery editor: thumbnails (with per-image framing + remove) plus an
// uploader that appends. Used for every multi-image block on the homepage so the
// owner edits each one the same way.
function GalleryField({
  label,
  hint,
  value,
  frame,
  onChange,
  onBusy,
}: {
  label: string;
  hint?: string;
  value: string[];
  frame?: string;
  onChange: (g: string[]) => void;
  onBusy: (b: boolean) => void;
}) {
  return (
    <Field label={label} hint={hint}>
      {value.length ? (
        <div className="mb-2 flex flex-wrap gap-2">
          {value.map((src, i) => (
            <div key={`${src}-${i}`} className="relative h-20 w-20 overflow-hidden rounded-lg border border-[#dde3ea]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => onChange(value.filter((_, idx) => idx !== i))}
                className="absolute right-0 top-0 grid h-6 w-6 place-items-center bg-black/60 text-xs text-white"
                aria-label="הסרת תמונה"
              >
                ✕
              </button>
              <div className="absolute bottom-0.5 left-0.5">
                <FramingButton src={src} path={src} frame={frame} compact />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="mb-2 text-xs text-[#9aa4b2]">עדיין אין תמונות. הוסיפו תמונה ראשונה למטה.</p>
      )}
      <ImageUpload label="" value="" kind="wide" framing={false} onBusy={onBusy} onUploaded={(path) => onChange([...value, path])} />
    </Field>
  );
}

export default function HomepageTab({ toast }: { toast: (t: ToastState) => void }) {
  const [hp, setHp] = React.useState<Homepage | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const baseRef = React.useRef<Homepage | null>(null);

  React.useEffect(() => {
    getHomepage()
      .then((d) => {
        setHp(d);
        baseRef.current = clone(d);
      })
      .catch((e) => toast({ msg: (e as Error).message, kind: "err" }));
  }, [toast]);

  if (!hp) return <Spinner />;

  // Patch one top-level region immutably.
  const patch = <K extends keyof Homepage>(k: K, v: Homepage[K]) => setHp({ ...hp, [k]: v });

  async function save() {
    if (!hp) return;
    setSaving(true);
    try {
      // Merge-on-save: re-read the freshest server copy and overwrite ONLY the
      // top-level regions changed this session (vs the loaded baseline). Editing
      // the hero can't revert, say, the gallery that changed meanwhile. (gotchas #3)
      let payload: Homepage = hp;
      const base = baseRef.current;
      if (base) {
        try {
          const fresh = await apiGet<Homepage>("/api/homepage/");
          const merged = { ...fresh } as Homepage;
          (Object.keys(hp) as (keyof Homepage)[]).forEach((k) => {
            if (JSON.stringify(hp[k]) !== JSON.stringify(base[k])) {
              (merged as Record<string, unknown>)[k as string] = hp[k];
            }
          });
          payload = merged;
        } catch {
          payload = hp;
        }
      }
      await putHomepage(payload);
      setHp(payload);
      baseRef.current = clone(payload);
      toast({ msg: "עמוד הבית נשמר ✓ האתר יתעדכן תוך דקה‑שתיים", kind: "ok" });
    } catch (e) {
      toast({ msg: (e as Error).message, kind: "err" });
    } finally {
      setSaving(false);
    }
  }

  const faq = hp.faq ?? [];

  return (
    <div className="space-y-3">
      <p className="rounded-xl bg-[#eef3f8] px-4 py-3 text-sm text-[#16314f]">
        הסעיפים מסודרים בדיוק לפי סדר ההופעה באתר – מלמעלה למטה. לחצו על סעיף כדי לפתוח ולערוך אותו.
      </p>

      {/* 1 — HERO */}
      <Section title="1 · כותרת ראשית (Hero)" hint="הבאנר העליון עם הסרטון ותמונת הבניין">
        <Field label="תווית עליונה">
          <Input value={hp.hero.eyebrow} onChange={(e) => patch("hero", { ...hp.hero, eyebrow: e.target.value })} />
        </Field>
        <Field label="כותרת">
          <Textarea value={hp.hero.title} onChange={(e) => patch("hero", { ...hp.hero, title: e.target.value })} />
        </Field>
        <Field label="תת‑כותרת">
          <Textarea value={hp.hero.subtitle} onChange={(e) => patch("hero", { ...hp.hero, subtitle: e.target.value })} />
        </Field>
        <ImageUpload
          label="תמונת רקע (הבניין)"
          value={hp.hero.image}
          kind="wide"
          frame="16 / 9"
          onBusy={setBusy}
          onUploaded={(path) => patch("hero", { ...hp.hero, image: path })}
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="כפתור ראשי – טקסט">
            <Input
              value={hp.hero.ctaPrimary.label}
              onChange={(e) => patch("hero", { ...hp.hero, ctaPrimary: { ...hp.hero.ctaPrimary, label: e.target.value } })}
            />
          </Field>
          <Field label="כפתור ראשי – קישור">
            <Input
              dir="ltr"
              value={hp.hero.ctaPrimary.href}
              onChange={(e) => patch("hero", { ...hp.hero, ctaPrimary: { ...hp.hero.ctaPrimary, href: e.target.value } })}
            />
          </Field>
          <Field label="כפתור משני – טקסט">
            <Input
              value={hp.hero.ctaSecondary.label}
              onChange={(e) => patch("hero", { ...hp.hero, ctaSecondary: { ...hp.hero.ctaSecondary, label: e.target.value } })}
            />
          </Field>
          <Field label="כפתור משני – קישור">
            <Input
              dir="ltr"
              value={hp.hero.ctaSecondary.href}
              onChange={(e) => patch("hero", { ...hp.hero, ctaSecondary: { ...hp.hero.ctaSecondary, href: e.target.value } })}
            />
          </Field>
        </div>
      </Section>

      {/* 2 — ANNOUNCEMENT BAR */}
      <Section title="2 · פס הודעה" hint="הרצועה הצרה מתחת לבאנר">
        <Field label="טקסט ההודעה">
          <Textarea value={hp.announcement} onChange={(e) => patch("announcement", e.target.value)} />
        </Field>
      </Section>

      {/* 3 — ADVANTAGES */}
      <Section title="3 · יתרונות" hint="ארבעת הכרטיסים הצפים מתחת לבאנר">
        <p className="text-xs text-[#5e6773]">כל יתרון: כותרת קצרה ואז שורת הסבר.</p>
        {hp.advantages.map((a, i) => (
          <div key={i} className="space-y-2 rounded-lg bg-[#f7f4ee] p-3">
            <Input
              value={a.title}
              placeholder="כותרת"
              onChange={(e) => {
                const next = [...hp.advantages];
                next[i] = { ...a, title: e.target.value };
                patch("advantages", next);
              }}
            />
            <Textarea
              value={a.text}
              placeholder="טקסט"
              onChange={(e) => {
                const next = [...hp.advantages];
                next[i] = { ...a, text: e.target.value };
                patch("advantages", next);
              }}
            />
            <button
              type="button"
              onClick={() => patch("advantages", hp.advantages.filter((_, idx) => idx !== i))}
              className="text-sm text-red-600"
            >
              הסרה
            </button>
          </div>
        ))}
        <Button variant="ghost" onClick={() => patch("advantages", [...hp.advantages, { title: "", text: "" }])}>
          + יתרון
        </Button>
      </Section>

      {/* 4 — INTRO / WELCOME (+ slideshow) */}
      <Section title="4 · ברוכים הבאים" hint="פסקת הפתיחה ומצגת התמונות שלצידה">
        <Field label="כותרת">
          <Input value={hp.intro.title} onChange={(e) => patch("intro", { ...hp.intro, title: e.target.value })} />
        </Field>
        <Field label="משפט פתיחה">
          <Textarea value={hp.intro.lead} onChange={(e) => patch("intro", { ...hp.intro, lead: e.target.value })} />
        </Field>
        <ListEditor
          label="פסקאות"
          value={hp.intro.paragraphs}
          onChange={(v) => patch("intro", { ...hp.intro, paragraphs: v })}
        />
        <GalleryField
          label="מצגת תמונות (גלריה מתחלפת)"
          hint="התמונות שמתחלפות לצד טקסט הפתיחה."
          value={hp.intro.gallery}
          frame="16 / 9"
          onBusy={setBusy}
          onChange={(imgs) => patch("intro", { ...hp.intro, gallery: imgs })}
        />
      </Section>

      {/* 5 — HOT DEALS (rotating cube) */}
      <Section title="5 · הצצה למתחם (קוביה מסתובבת)" hint="הקובייה התלת‑ממדית עם תמונות המתחם">
        <Field label="תווית">
          <Input value={hp.hotDeals.eyebrow} onChange={(e) => patch("hotDeals", { ...hp.hotDeals, eyebrow: e.target.value })} />
        </Field>
        <Field label="כותרת">
          <Input value={hp.hotDeals.title} onChange={(e) => patch("hotDeals", { ...hp.hotDeals, title: e.target.value })} />
        </Field>
        <Field label="טקסט">
          <Textarea value={hp.hotDeals.text} onChange={(e) => patch("hotDeals", { ...hp.hotDeals, text: e.target.value })} />
        </Field>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="כפתור – טקסט">
            <Input value={hp.hotDeals.cta.label} onChange={(e) => patch("hotDeals", { ...hp.hotDeals, cta: { ...hp.hotDeals.cta, label: e.target.value } })} />
          </Field>
          <Field label="כפתור – קישור">
            <Input dir="ltr" value={hp.hotDeals.cta.href} onChange={(e) => patch("hotDeals", { ...hp.hotDeals, cta: { ...hp.hotDeals.cta, href: e.target.value } })} />
          </Field>
        </div>
        <GalleryField
          label="תמונות הקובייה"
          hint="מומלץ 3 תמונות – אחת לכל פאה."
          value={hp.hotDeals.images}
          frame="1 / 1"
          onBusy={setBusy}
          onChange={(imgs) => patch("hotDeals", { ...hp.hotDeals, images: imgs })}
        />
      </Section>

      {/* 6 — STATS */}
      <Section title="6 · נתונים" hint="רצועת המספרים/המילים הבולטות">
        {hp.stats.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <Input
              className="w-24"
              value={s.value}
              placeholder="ערך"
              onChange={(e) => {
                const next = [...hp.stats];
                next[i] = { ...s, value: e.target.value };
                patch("stats", next);
              }}
            />
            <Input
              value={s.label}
              placeholder="תווית"
              onChange={(e) => {
                const next = [...hp.stats];
                next[i] = { ...s, label: e.target.value };
                patch("stats", next);
              }}
            />
            <button type="button" onClick={() => patch("stats", hp.stats.filter((_, idx) => idx !== i))} className="text-red-600">
              ✕
            </button>
          </div>
        ))}
        <Button variant="ghost" onClick={() => patch("stats", [...hp.stats, { value: "", label: "" }])}>
          + נתון
        </Button>
      </Section>

      {/* 7 — MODEL (nylonAdvantages) */}
      <Section title="7 · המודל שלנו" hint="בלוק 'מודל פיקס' עם הסקיצה">
        <Field label="כותרת">
          <Input
            value={hp.nylonAdvantages.title}
            onChange={(e) => patch("nylonAdvantages", { ...hp.nylonAdvantages, title: e.target.value })}
          />
        </Field>
        <ListEditor
          label="פסקאות"
          value={hp.nylonAdvantages.paragraphs}
          onChange={(v) => patch("nylonAdvantages", { ...hp.nylonAdvantages, paragraphs: v })}
        />
        <ImageUpload
          label="תמונה (סקיצת המודל)"
          value={hp.nylonAdvantages.image}
          kind="wide"
          framing={false}
          onBusy={setBusy}
          onUploaded={(path) => patch("nylonAdvantages", { ...hp.nylonAdvantages, image: path })}
        />
      </Section>

      {/* 8 — BRANDED PITCH */}
      <Section title="8 · יחידות פנויות להשכרה" hint="הבלוק עם תמונה ורשימת נקודות">
        <Field label="כותרת">
          <Input value={hp.brandedPitch.title} onChange={(e) => patch("brandedPitch", { ...hp.brandedPitch, title: e.target.value })} />
        </Field>
        <Field label="טקסט">
          <Textarea value={hp.brandedPitch.text} onChange={(e) => patch("brandedPitch", { ...hp.brandedPitch, text: e.target.value })} />
        </Field>
        <ListEditor
          label="נקודות"
          value={hp.brandedPitch.bullets}
          onChange={(v) => patch("brandedPitch", { ...hp.brandedPitch, bullets: v })}
        />
        <ImageUpload
          label="תמונה"
          value={hp.brandedPitch.image}
          kind="wide"
          frame="4 / 3"
          onBusy={setBusy}
          onUploaded={(path) => patch("brandedPitch", { ...hp.brandedPitch, image: path })}
        />
      </Section>

      {/* 9 — GALLERY MOSAIC */}
      <Section title="9 · גלריית המתחם" hint="רשת התמונות הגדולה לקראת סוף העמוד">
        <GalleryField
          label="תמונות הגלריה"
          hint="התמונה הראשונה מוצגת גדולה. מומלץ 6 תמונות."
          value={hp.galleryMosaic}
          frame="1 / 1"
          onBusy={setBusy}
          onChange={(imgs) => patch("galleryMosaic", imgs)}
        />
      </Section>

      {/* 10 — ABOUT TEASER */}
      <Section title="10 · קצת עלינו" hint="הפסקה הקצרה עם הקישור לעמוד אודות">
        <Field label="כותרת">
          <Input value={hp.aboutTeaser.title} onChange={(e) => patch("aboutTeaser", { ...hp.aboutTeaser, title: e.target.value })} />
        </Field>
        <Field label="טקסט">
          <Textarea value={hp.aboutTeaser.text} onChange={(e) => patch("aboutTeaser", { ...hp.aboutTeaser, text: e.target.value })} />
        </Field>
        <Field label="קישור">
          <Input dir="ltr" value={hp.aboutTeaser.href} onChange={(e) => patch("aboutTeaser", { ...hp.aboutTeaser, href: e.target.value })} />
        </Field>
      </Section>

      {/* 11 — FAQ */}
      <Section title="11 · שאלות נפוצות" hint="האקורדיון בתחתית העמוד">
        <p className="text-xs text-[#5e6773]">כל שורה: שאלה ותשובה. השאלות מופיעות גם בגוגל (FAQ).</p>
        {faq.map((f, i) => (
          <div key={i} className="space-y-2 rounded-lg bg-[#f7f4ee] p-3">
            <Input
              value={f.q}
              placeholder="שאלה"
              onChange={(e) => {
                const next = [...faq];
                next[i] = { ...f, q: e.target.value };
                patch("faq", next);
              }}
            />
            <Textarea
              value={f.a}
              placeholder="תשובה"
              onChange={(e) => {
                const next = [...faq];
                next[i] = { ...f, a: e.target.value };
                patch("faq", next);
              }}
            />
            <button
              type="button"
              onClick={() => patch("faq", faq.filter((_, idx) => idx !== i))}
              className="text-sm text-red-600"
            >
              הסרה
            </button>
          </div>
        ))}
        <Button variant="ghost" onClick={() => patch("faq", [...faq, { q: "", a: "" }])}>
          + שאלה
        </Button>
      </Section>

      <div className="sticky bottom-0 -mx-3 border-t border-[#dde3ea] bg-white/95 px-3 py-3 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0">
        <Button onClick={save} disabled={saving || busy} className="w-full sm:w-auto">
          {saving ? "שומר…" : busy ? "מעלה תמונה…" : "שמירת עמוד הבית"}
        </Button>
      </div>
    </div>
  );
}
