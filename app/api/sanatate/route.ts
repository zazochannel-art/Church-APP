import { ping } from "@/lib/db";

// Health check for the host (Railway, Docker): answers 200 when the data file can be read.
export function GET() {
  try {
    ping();
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false }, { status: 503 });
  }
}
