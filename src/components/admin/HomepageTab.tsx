"use client";

import React from "react";
import type { Homepage, Category } from "@/lib/types";
import { getHomepage, putHomepage, apiGet, getCategories } from "@/lib/admin/client";
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

function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T;
}

// Collapsible section — collapsed by default on mobile keeps the long form
// navigable. <details>/<summary> needs no JS state.
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details className="group rounded-xl border border-[#dde3ea] bg-white">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 font-bold text-[#16314f]">
        {title}
        <span className="text-[#9aa4b2] transition group-open:rotate-180">▾</span>
      </summary>
      <div className="space-y-4 border-t border-[#eef1f5] px-4 py-4">{children}</div>
    </details>
  );
}

export default function HomepageTab({ toast }: { toast: (t: ToastState) => void }) {
  const [hp, setHp] = React.useState<Homepage | null>(null);
  const [cats, setCats] = React.useState<Category[]>([]);
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
    getCategories().then(setCats).catch(() => {});
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
      // the hero can't revert, say, hot deals that changed meanwhile. (gotchas #3)
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

  return (
    <div className="space-y-3">
      <Section title="כותרת ראשית (Hero)">
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
          label="תמונת רקע"
          value={hp.hero.image}
          kind="wide"
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

      <Section title="פס הודעה">
        <Field label="טקסט נגלל בראש העמוד">
          <Textarea value={hp.announcement} onChange={(e) => patch("announcement", e.target.value)} />
        </Field>
      </Section>

      <Section title="פתיח (אודות קצר)">
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
      </Section>

      <Section title="יתרונות">
        <p className="text-xs text-[#5e6773]">כל יתרון בשתי שורות: כותרת, ואז טקסט.</p>
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

      <Section title="סוגי חללים">
        <Field label="כותרת">
          <Input value={hp.bagTypesTitle} onChange={(e) => patch("bagTypesTitle", e.target.value)} />
        </Field>
        <Field label="תת‑כותרת">
          <Textarea value={hp.bagTypesSubtitle} onChange={(e) => patch("bagTypesSubtitle", e.target.value)} />
        </Field>
        <ListEditor label="פריטים" value={hp.bagTypes} onChange={(v) => patch("bagTypes", v)} />
      </Section>

      <Section title="קטגוריות מודגשות">
        <Field label="בחרו אילו קטגוריות יוצגו בעמוד הבית">
          <div className="flex flex-wrap gap-2">
            {cats.map((c) => {
              const on = hp.featuredCategories.includes(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() =>
                    patch(
                      "featuredCategories",
                      on ? hp.featuredCategories.filter((x) => x !== c.id) : [...hp.featuredCategories, c.id]
                    )
                  }
                  className={`min-h-[2.5rem] rounded-xl px-3 text-sm font-semibold ${
                    on ? "bg-[#16314f] text-white" : "bg-black/5 text-[#1a2a3f]"
                  }`}
                >
                  {on ? "✓ " : ""}
                  {c.name}
                </button>
              );
            })}
          </div>
        </Field>
      </Section>

      <Section title="בלוק יתרונות נוסף">
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
      </Section>

      <Section title="וידאו">
        <Field label="מזהה YouTube" hint="רק המזהה, למשל dQw4w9WgXcQ. ריק = משתמש בסרטון המקומי בעמוד הבית.">
          <Input dir="ltr" value={hp.video.youtubeId} onChange={(e) => patch("video", { ...hp.video, youtubeId: e.target.value })} />
        </Field>
        <Field label="כותרת">
          <Input value={hp.video.title} onChange={(e) => patch("video", { ...hp.video, title: e.target.value })} />
        </Field>
        <Field label="כיתוב">
          <Textarea value={hp.video.caption} onChange={(e) => patch("video", { ...hp.video, caption: e.target.value })} />
        </Field>
      </Section>

      <Section title="נתונים (Stats)">
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

      <Section title="קריאה לפעולה (יחידות פנויות)">
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
          onBusy={setBusy}
          onUploaded={(path) => patch("brandedPitch", { ...hp.brandedPitch, image: path })}
        />
      </Section>

      <Section title="הצצה למתחם (Hot Deals)">
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
        <HotDealsGallery
          value={hp.hotDeals.images}
          onBusy={setBusy}
          onChange={(imgs) => patch("hotDeals", { ...hp.hotDeals, images: imgs })}
        />
      </Section>

      <Section title="קצת עלינו">
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

      <div className="sticky bottom-0 -mx-3 border-t border-[#dde3ea] bg-white/95 px-3 py-3 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0">
        <Button onClick={save} disabled={saving || busy} className="w-full sm:w-auto">
          {saving ? "שומר…" : busy ? "מעלה תמונה…" : "שמירת עמוד הבית"}
        </Button>
      </div>
    </div>
  );
}

function HotDealsGallery({
  value,
  onChange,
  onBusy,
}: {
  value: string[];
  onChange: (g: string[]) => void;
  onBusy: (b: boolean) => void;
}) {
  return (
    <Field label="גלריית תמונות">
      {value.length ? (
        <div className="mb-2 flex flex-wrap gap-2">
          {value.map((src, i) => (
            <div key={`${src}-${i}`} className="relative h-16 w-16 overflow-hidden rounded-lg border border-[#dde3ea]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => onChange(value.filter((_, idx) => idx !== i))}
                className="absolute right-0 top-0 grid h-5 w-5 place-items-center bg-black/60 text-xs text-white"
                aria-label="הסרה"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      ) : null}
      <ImageUpload label="" value="" kind="wide" onBusy={onBusy} onUploaded={(path) => onChange([...value, path])} />
    </Field>
  );
}
