"use client";

import React from "react";
import type { Site } from "@/lib/types";
import { getSite, putSite } from "@/lib/admin/client";
import { Button, Field, Input, Textarea, ListEditor, Spinner, type ToastState } from "./ui";

export default function SiteTab({ toast }: { toast: (t: ToastState) => void }) {
  const [site, setSite] = React.useState<Site | null>(null);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    getSite()
      .then(setSite)
      .catch((e) => toast({ msg: (e as Error).message, kind: "err" }));
  }, [toast]);

  if (!site) return <Spinner />;

  const set = <K extends keyof Site>(k: K, v: Site[K]) => setSite({ ...site, [k]: v });

  async function save() {
    if (!site) return;
    setSaving(true);
    try {
      await putSite(site);
      toast({ msg: "פרטי העסק נשמרו ✓", kind: "ok" });
    } catch (e) {
      toast({ msg: (e as Error).message, kind: "err" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <Field label="שם העסק">
        <Input value={site.name} onChange={(e) => set("name", e.target.value)} />
      </Field>
      <Field label="שם משפטי / אנגלי">
        <Input dir="ltr" value={site.legalName} onChange={(e) => set("legalName", e.target.value)} />
      </Field>
      <Field label="סלוגן">
        <Input value={site.tagline} onChange={(e) => set("tagline", e.target.value)} />
      </Field>
      <Field label="תיאור (SEO)">
        <Textarea value={site.description} onChange={(e) => set("description", e.target.value)} />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="טלפון">
          <Input dir="ltr" value={site.phone} onChange={(e) => set("phone", e.target.value)} />
        </Field>
        <Field label="טלפון נוסף">
          <Input dir="ltr" value={site.phone2} onChange={(e) => set("phone2", e.target.value)} />
        </Field>
        <Field label="וואטסאפ" hint="פורמט בינלאומי ללא + , למשל 972507446563">
          <Input dir="ltr" value={site.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} />
        </Field>
        <Field label="אימייל">
          <Input dir="ltr" type="email" value={site.email} onChange={(e) => set("email", e.target.value)} />
        </Field>
        <Field label="כתובת">
          <Input value={site.address} onChange={(e) => set("address", e.target.value)} />
        </Field>
        <Field label="עיר">
          <Input value={site.city} onChange={(e) => set("city", e.target.value)} />
        </Field>
      </div>

      <Field label="שעות פעילות">
        <Input value={site.hours} onChange={(e) => set("hours", e.target.value)} />
      </Field>

      <Field
        label="קישור מפת Google (embed)"
        hint="הדבק כאן את כתובת ה־src מתוך 'הטמעת מפה' ב‑Google Maps. ריק = ברירת מחדל לפי הכתובת."
      >
        <Textarea
          dir="ltr"
          value={site.mapEmbedUrl || ""}
          onChange={(e) => set("mapEmbedUrl", e.target.value)}
          placeholder="https://www.google.com/maps/embed?pb=..."
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="פייסבוק">
          <Input
            dir="ltr"
            value={site.social.facebook}
            onChange={(e) => set("social", { ...site.social, facebook: e.target.value })}
          />
        </Field>
        <Field label="אינסטגרם">
          <Input
            dir="ltr"
            value={site.social.instagram}
            onChange={(e) => set("social", { ...site.social, instagram: e.target.value })}
          />
        </Field>
      </div>

      <ListEditor
        label="יתרונות / תגיות"
        value={site.certifications}
        onChange={(v) => set("certifications", v)}
      />

      <div className="sticky bottom-0 -mx-3 border-t border-[#dde3ea] bg-white/95 px-3 py-3 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0">
        <Button onClick={save} disabled={saving} className="w-full sm:w-auto">
          {saving ? "שומר…" : "שמירת פרטי העסק"}
        </Button>
      </div>
    </div>
  );
}
