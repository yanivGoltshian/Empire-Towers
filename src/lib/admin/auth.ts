// Authorization for the admin write API. Supported sign-in modes, checked in
// order:
//   1) ADMIN_DEV=1            → local dev bypass (no auth at all).
//   2) ADMIN_PASSCODE         → a shared secret the owner types once; the admin
//                               panel sends it as the token. Lowest-friction,
//                               no Google Cloud setup. Use a long random value.
//   3) Google Sign-In         → GOOGLE_CLIENT_ID + ADMIN_EMAILS allowlist. The
//                               panel sends the Google ID token; we verify it
//                               against Google and require a verified, allow-
//                               listed email.
// If none are configured the API denies every write (safe default).
//
// The token always arrives in the custom `X-Admin-Token` header (never
// `Authorization`) — some managed hosts overwrite `Authorization`. (gotchas #1)

export function getToken(request: Request): string | null {
  const fromCustom = request.headers.get("x-admin-token");
  if (fromCustom && fromCustom.trim()) return fromCustom.trim();
  const raw = request.headers.get("authorization");
  if (!raw) return null;
  const m = /^Bearer\s+(.+)$/i.exec(raw.trim());
  return m ? m[1].trim() : null;
}

export function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

function emailAllowed(email: string | undefined | null): boolean {
  if (!email) return false;
  return adminEmails().includes(String(email).toLowerCase());
}

let _client: import("google-auth-library").OAuth2Client | null = null;
async function verifyGoogleToken(token: string, clientId: string) {
  if (!_client) {
    const { OAuth2Client } = await import("google-auth-library");
    _client = new OAuth2Client(clientId);
  }
  const ticket = await _client.verifyIdToken({ idToken: token, audience: clientId });
  return ticket.getPayload();
}

export async function isAdmin(request: Request): Promise<boolean> {
  // 1) Local development bypass.
  if (process.env.ADMIN_DEV === "1") return true;

  const token = getToken(request);

  // 2) Shared passcode.
  const passcode = process.env.ADMIN_PASSCODE || "";
  if (passcode) {
    if (token && timingSafeEqual(token, passcode)) return true;
  }

  // 3) Google Sign-In + email allowlist.
  const clientId = process.env.GOOGLE_CLIENT_ID || "";
  if (clientId && adminEmails().length) {
    if (!token) return false;
    try {
      const payload = await verifyGoogleToken(token, clientId);
      if (!payload || payload.email_verified !== true) return false;
      return emailAllowed(payload.email);
    } catch {
      return false;
    }
  }

  return false;
}

// Length-leak-resistant string compare for the passcode.
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// What the client needs to render the right login UI (all values are public).
export function authConfig() {
  return {
    googleClientId: process.env.GOOGLE_CLIENT_ID || "",
    passcode: Boolean(process.env.ADMIN_PASSCODE),
    dev: process.env.ADMIN_DEV === "1",
  };
}
