import { cookies } from "next/headers";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!verifyToken(token)) return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
  const sb = supabaseAdmin();
  if (!sb) return Response.json({ ok: true, leads: [], visits: [], note: "Supabase not configured" });
  const [{ data: leads }, { data: visits }] = await Promise.all([
    sb.from("leads").select("*").order("created_at", { ascending: false }).limit(1000),
    sb.from("site_visits").select("*").order("created_at", { ascending: false }).limit(1000),
  ]);
  return Response.json({ ok: true, leads: leads || [], visits: visits || [] });
}
