import { dump } from "@/lib/db";
import { iso } from "@/lib/dates";

// Backup download: every record as JSON. Behind the password like every page.
export function GET() {
  const body = JSON.stringify({ app: "adunare", version: 1, made: new Date().toISOString(), records: dump() }, null, 1);
  return new Response(body, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="adunare-copie-${iso(new Date())}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
