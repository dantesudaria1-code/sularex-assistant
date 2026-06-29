import { saveLead } from "@/lib/leads";
export const runtime = "nodejs";
export async function POST(req) {
  let b; try { b = await req.json(); } catch { return Response.json({ ok: false, error: "bad request" }, { status: 400 }); }
  if (!b.full_name || !b.phone) return Response.json({ ok: false, error: "Name and phone are required." }, { status: 400 });
  const r = await saveLead({ ...b, source: b.source || "Web form" });
  return Response.json(r, { status: r.ok ? 200 : 500 });
}
