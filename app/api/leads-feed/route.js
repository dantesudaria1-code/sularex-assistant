import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// CORS so the Installer Portal (on Netlify / sularex.com) can read this feed.
function cors(origin) {
  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Methods": "GET,OPTIONS",
    "Access-Control-Allow-Headers": "authorization,content-type",
    "Access-Control-Max-Age": "86400",
  };
}

export async function OPTIONS(req) {
  return new Response(null, { status: 204, headers: cors(req.headers.get("origin")) });
}

export async function GET(req) {
  const origin = req.headers.get("origin");
  const url = new URL(req.url);
  const token =
    url.searchParams.get("token") ||
    (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  const expected = process.env.LEADS_FEED_TOKEN;

  if (!expected) {
    return Response.json({ ok: false, error: "Leads feed not enabled (set LEADS_FEED_TOKEN)." }, { status: 503, headers: cors(origin) });
  }
  if (token !== expected) {
    return Response.json({ ok: false, error: "unauthorized" }, { status: 401, headers: cors(origin) });
  }

  const sb = supabaseAdmin();
  if (!sb) return Response.json({ ok: true, leads: [], visits: [] }, { headers: cors(origin) });

  const since = url.searchParams.get("since");
  let lq = sb.from("leads").select("*").order("created_at", { ascending: false }).limit(2000);
  let vq = sb.from("site_visits").select("*").order("created_at", { ascending: false }).limit(2000);
  if (since) { lq = lq.gte("created_at", since); vq = vq.gte("created_at", since); }

  const [{ data: leads, error: le }, { data: visits, error: ve }] = await Promise.all([lq, vq]);
  if (le || ve) return Response.json({ ok: false, error: (le || ve).message }, { status: 500, headers: cors(origin) });

  return Response.json({ ok: true, leads: leads || [], visits: visits || [] }, { headers: cors(origin) });
}
