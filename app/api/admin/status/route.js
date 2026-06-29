import { cookies } from "next/headers";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
export const runtime = "nodejs";

const STATUSES = ["New", "Contacted", "Site Visit Scheduled", "Proposal Sent", "Closed Sale"];

export async function POST(req) {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!verifyToken(token)) return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
  let b; try { b = await req.json(); } catch { return Response.json({ ok: false }, { status: 400 }); }
  const table = b.table === "site_visits" ? "site_visits" : "leads";
  if (!b.id || !STATUSES.includes(b.status)) return Response.json({ ok: false, error: "invalid" }, { status: 400 });
  const sb = supabaseAdmin();
  if (!sb) return Response.json({ ok: false, error: "Supabase not configured" }, { status: 500 });
  const { error } = await sb.from(table).update({ status: b.status }).eq("id", b.id);
  if (error) return Response.json({ ok: false, error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
