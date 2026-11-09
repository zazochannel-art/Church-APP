import { NextResponse, type NextRequest } from "next/server";

// The app holds phone numbers and notes about young people, so it is closed
// with one shared password (ADUNARE_PAROLA). Locally it stays open if no
// password is set; in production it refuses to run without one.
function same(a: string, b: string) {
  let diff = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return diff === 0;
}

export function proxy(req: NextRequest) {
  const password = process.env.ADUNARE_PAROLA;
  if (!password) {
    if (process.env.NODE_ENV === "production") {
      return new NextResponse("Setează variabila ADUNARE_PAROLA înainte de a porni aplicația.", { status: 503 });
    }
    return NextResponse.next();
  }
  const auth = req.headers.get("authorization") ?? "";
  if (auth.startsWith("Basic ")) {
    const decoded = atob(auth.slice(6));
    const given = decoded.slice(decoded.indexOf(":") + 1);
    if (same(given, password)) return NextResponse.next();
  }
  return new NextResponse("Parolă necesară", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Adunare", charset="UTF-8"' },
  });
}

export const config = {
  // Icons and the manifest stay public so the app can be installed on a phone.
  matcher: ["/((?!_next/static|_next/image|manifest.webmanifest|icon.svg|icon-maskable.svg|favicon.ico).*)"],
};
