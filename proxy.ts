import { NextResponse, type NextRequest } from "next/server";
import { COOKIE, same, tokenFor } from "./lib/auth";

// The app holds phone numbers and notes about young people, so it is closed
// with one shared password (ADUNARE_PAROLA). Locally it stays open if no
// password is set; in production it refuses to run without one.
const PUBLIC = ["/intrare", "/api/sanatate"];

export async function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  if (PUBLIC.some((p) => pathname === p)) return NextResponse.next();
  const password = process.env.ADUNARE_PAROLA;
  if (!password) {
    if (process.env.NODE_ENV === "production") {
      return new NextResponse("Setează variabila ADUNARE_PAROLA înainte de a porni aplicația.", { status: 503 });
    }
    return NextResponse.next();
  }
  const cookie = req.cookies.get(COOKIE)?.value ?? "";
  if (cookie && same(cookie, await tokenFor(password))) return NextResponse.next();
  const url = req.nextUrl.clone();
  url.pathname = "/intrare";
  url.search = pathname === "/" ? "" : `?next=${encodeURIComponent(pathname + search)}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Icons and the manifest stay public so the app can be installed on a phone.
  matcher: ["/((?!_next/static|_next/image|manifest.webmanifest|icon.svg|icon-maskable.svg|favicon.ico).*)"],
};
