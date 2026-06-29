import { saveSiteVisit } from "@/lib/leads";
export const runtime = "nodejs";
export async function POST(req) {
  let b; try { b = await req.json(); } catch { return Response.json({ ok: false, error: "bad request" }, { status: 400 }); }
  if (!b.contact_person && !b.full_name) return Response.json({ ok: false, error: "Contact person is required." }, { status: 400 });
  if (!b.phone || !b.address || !b.preferred_date) return Response.json({ ok: false, error: "Phone, address and preferred date are required." }, { status: 400 });
  const r = await saveSiteVisit({ ...b, source: b.source || "Web form" });
  return Response.json(r, { status: r.ok ? 200 : 500 });
}
