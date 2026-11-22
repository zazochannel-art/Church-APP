// Shared-password access. After the right password is typed once, the
// browser keeps a cookie holding a signature of the password, so changing
// ADUNARE_PAROLA logs everybody out.
export const COOKIE = "adunare_acces";
export const NAME_COOKIE = "adunare_nume";
export const MAX_AGE = 60 * 60 * 24 * 180; // 180 days

export async function tokenFor(password: string) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode("adunare-acces-v1"));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function same(a: string, b: string) {
  let diff = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return diff === 0;
}

export const passwordSet = () => Boolean(process.env.ADUNARE_PAROLA);
