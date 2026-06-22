"use client";

import React from "react";
import { getAuthConfig, setAuthToken, getAuthToken, getSite, type AdminAuthConfig } from "@/lib/admin/client";
import { Button, Field, Input, Toast, Spinner, type ToastState } from "./ui";
import SiteTab from "./SiteTab";
import HomepageTab from "./HomepageTab";
import CategoriesTab from "./CategoriesTab";
import OfficesTab from "./OfficesTab";

type TabKey = "site" | "homepage" | "categories" | "offices";

const TABS: { key: TabKey; label: string }[] = [
  { key: "homepage", label: "עמוד הבית" },
  { key: "offices", label: "משרדים" },
  { key: "categories", label: "קטגוריות" },
  { key: "site", label: "הגדרות" },
];

// Google Identity Services loaded lazily only when Google mode is configured.
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (o: { client_id: string; callback: (r: { credential: string }) => void }) => void;
          renderButton: (el: HTMLElement, o: Record<string, unknown>) => void;
        };
      };
    };
  }
}

function loadGsi(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) return resolve();
    const existing = document.getElementById("gsi-script");
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("GSI load failed")));
      return;
    }
    const s = document.createElement("script");
    s.id = "gsi-script";
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("GSI load failed"));
    document.head.appendChild(s);
  });
}

export default function AdminApp() {
  const [config, setConfig] = React.useState<AdminAuthConfig | null>(null);
  const [authed, setAuthed] = React.useState(false);
  const [checking, setChecking] = React.useState(true);
  const [tab, setTab] = React.useState<TabKey>("homepage");
  const [toastState, setToastState] = React.useState<ToastState>(null);

  const toast = React.useCallback((t: ToastState) => setToastState(t), []);

  // Validate a token against a guarded endpoint to confirm admin access.
  const validate = React.useCallback(async () => {
    try {
      await getSite();
      return true;
    } catch {
      return false;
    }
  }, []);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      const cfg = await getAuthConfig();
      if (!alive) return;
      setConfig(cfg);
      if (cfg.dev) {
        setAuthed(true);
        setChecking(false);
        return;
      }
      // Re-validate a previously stored token (passcode or Google) after reload.
      if (getAuthToken()) {
        const ok = await validate();
        if (!alive) return;
        if (ok) {
          setAuthed(true);
          setChecking(false);
          return;
        }
        setAuthToken(null);
      }
      setChecking(false);
    })();
    return () => {
      alive = false;
    };
  }, [validate]);

  if (checking) {
    return (
      <div className="fixed inset-0 z-[100] grid place-items-center bg-[#f7f4ee]">
        <Spinner label="טוען את לוח הניהול…" />
      </div>
    );
  }

  if (!authed) {
    return (
      <Login
        config={config}
        onAuthed={() => setAuthed(true)}
        toast={toast}
        validate={validate}
        toastState={toastState}
        onToastDone={() => setToastState(null)}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-[#f7f4ee]" dir="rtl">
      <header className="flex items-center justify-between gap-3 border-b border-[#dde3ea] bg-[#16314f] px-4 py-3 text-white">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold">מגדלי האימפריה · ניהול תוכן</p>
          <p className="truncate text-[11px] text-white/70">השינויים מתפרסמים תוך דקה‑שתיים</p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/"
            className="rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold hover:bg-white/20"
          >
            לאתר ↗
          </a>
          {!config?.dev ? (
            <button
              onClick={() => {
                setAuthToken(null);
                setAuthed(false);
              }}
              className="rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold hover:bg-white/20"
            >
              יציאה
            </button>
          ) : null}
        </div>
      </header>

      <nav className="no-scrollbar flex gap-2 overflow-x-auto border-b border-[#dde3ea] bg-white px-3 py-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
              tab === t.key ? "bg-[#16314f] text-white" : "bg-black/5 text-[#1a2a3f]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <main className="flex-1 overflow-y-auto px-3 py-4 sm:px-6">
        <div className="mx-auto max-w-2xl">
          {tab === "site" ? <SiteTab toast={toast} /> : null}
          {tab === "homepage" ? <HomepageTab toast={toast} /> : null}
          {tab === "categories" ? <CategoriesTab toast={toast} /> : null}
          {tab === "offices" ? <OfficesTab toast={toast} /> : null}
        </div>
      </main>

      <Toast state={toastState} onDone={() => setToastState(null)} />
    </div>
  );
}

function Login({
  config,
  onAuthed,
  toast,
  validate,
  toastState,
  onToastDone,
}: {
  config: AdminAuthConfig | null;
  onAuthed: () => void;
  toast: (t: ToastState) => void;
  validate: () => Promise<boolean>;
  toastState: ToastState;
  onToastDone: () => void;
}) {
  const [passcode, setPasscode] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const googleBtnRef = React.useRef<HTMLDivElement>(null);

  const tryAuth = React.useCallback(
    async (token: string) => {
      setBusy(true);
      setAuthToken(token);
      const ok = await validate();
      setBusy(false);
      if (ok) onAuthed();
      else {
        setAuthToken(null);
        toast({ msg: "אימות נכשל. נסו שוב.", kind: "err" });
      }
    },
    [onAuthed, toast, validate]
  );

  React.useEffect(() => {
    if (!config?.googleClientId || !googleBtnRef.current) return;
    let cancelled = false;
    loadGsi()
      .then(() => {
        if (cancelled || !googleBtnRef.current || !window.google) return;
        window.google.accounts.id.initialize({
          client_id: config.googleClientId,
          callback: (r) => tryAuth(r.credential),
        });
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: "outline",
          size: "large",
          width: 280,
          text: "signin_with",
          shape: "pill",
        });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [config?.googleClientId, tryAuth]);

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-[#f7f4ee] px-4" dir="rtl">
      <div className="w-full max-w-sm rounded-2xl border border-[#dde3ea] bg-white p-6 shadow-xl">
        <div className="mb-5 text-center">
          <p className="text-lg font-extrabold text-[#16314f]">מגדלי האימפריה</p>
          <p className="text-sm text-[#5e6773]">כניסה ללוח הניהול</p>
        </div>

        {config?.passcode ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (passcode.trim()) tryAuth(passcode.trim());
            }}
            className="space-y-3"
          >
            <Field label="קוד גישה">
              <Input
                type="password"
                dir="ltr"
                value={passcode}
                autoComplete="current-password"
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="••••••••"
              />
            </Field>
            <Button type="submit" disabled={busy || !passcode.trim()} className="w-full">
              {busy ? "מאמת…" : "כניסה"}
            </Button>
          </form>
        ) : null}

        {config?.passcode && config?.googleClientId ? (
          <div className="my-4 flex items-center gap-3 text-xs text-[#9aa4b2]">
            <span className="h-px flex-1 bg-[#e3e7ec]" />
            או
            <span className="h-px flex-1 bg-[#e3e7ec]" />
          </div>
        ) : null}

        {config?.googleClientId ? (
          <div className="flex justify-center">
            <div ref={googleBtnRef} />
          </div>
        ) : null}

        {!config?.passcode && !config?.googleClientId ? (
          <p className="rounded-lg bg-amber-50 p-3 text-center text-xs text-amber-800">
            לוח הניהול לא הוגדר עדיין. הגדירו <code>ADMIN_PASSCODE</code> או התחברות Google במשתני
            הסביבה ב‑Vercel.
          </p>
        ) : null}
      </div>
      <Toast state={toastState} onDone={onToastDone} />
    </div>
  );
}
