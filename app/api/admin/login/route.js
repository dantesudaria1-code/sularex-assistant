import { makeToken, COOKIE_NAME } from "@/lib/auth";
export const runtime = "nodejs";
export async function POST(req) {
  let b; try { b = await req.json(); } catch { return Response.json({ ok: false }, { status: 400 }); }
  const expected = process.env.ADMIN_PASSWORD || "admin";
  if (!b.password || b.password !== expected) return Response.json({ ok: false, error: "Wrong password" }, { status: 401 });
  const token = makeToken();
  const res = Response.json({ ok: true });
  res.headers.append("Set-Cookie", `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=43200; ${process.env.NODE_ENV === "production" ? "Secure;" : ""}`);
  return res;
}
