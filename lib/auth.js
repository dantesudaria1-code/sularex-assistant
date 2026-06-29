import crypto from "crypto";

const COOKIE = "sx_admin";
function secret() { return process.env.ADMIN_SECRET || "dev-insecure-secret"; }

export function makeToken(ttlMs = 1000 * 60 * 60 * 12) {
  const exp = Date.now() + ttlMs;
  const payload = String(exp);
  const sig = crypto.createHmac("sha256", secret()).update(payload).digest("hex");
  return Buffer.from(payload).toString("base64") + "." + sig;
}

export function verifyToken(token) {
  if (!token || token.indexOf(".") < 0) return false;
  const [b64, sig] = token.split(".");
  let payload;
  try { payload = Buffer.from(b64, "base64").toString("utf8"); } catch { return false; }
  const expect = crypto.createHmac("sha256", secret()).update(payload).digest("hex");
  if (sig.length !== expect.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expect))) return false;
  return Number(payload) > Date.now();
}

export const COOKIE_NAME = COOKIE;
