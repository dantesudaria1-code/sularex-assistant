# SULAREX AI Solar Assistant

A production‑ready, AI‑powered **24/7 solar sales assistant** for **SULAREX Solar Solutions**
(Abellanosa Street, Consolacion, Cagayan de Oro City · 0917 146 4377 · sularex.com).

It answers solar questions, recommends a package from the customer's monthly bill, captures
qualified leads, books free site visits, emails your team instantly, and gives you an admin
dashboard — all with a clean, ChatGPT‑style floating chat widget.

Built with **Next.js (App Router) · React · Tailwind CSS · Supabase · Claude (Anthropic) · Resend**.
Deploys to **Vercel** in minutes.

---

## What you get

| Feature | Where |
|---|---|
| Floating chat widget (desktop + mobile) | `components/SolarAssistant.jsx` |
| AI chat (recommendation, FAQ, lead + visit capture) | `app/api/chat/route.js` |
| Package logic (₱3K→3kW … ₱30K+→18kW) | `lib/packages.js` |
| Lead capture API | `app/api/lead/route.js` |
| Site‑visit scheduler API | `app/api/site-visit/route.js` |
| Email notifications to `Sudaria.cgt@gmail.com` | `lib/email.js` |
| Admin dashboard (leads, visits, search, CSV, status) | `app/admin/page.jsx` |
| Database schema | `supabase/schema.sql` |
| Embed script for sularex.com | `public/embed.js` |

> **Works before you add keys.** If `ANTHROPIC_API_KEY` is missing the widget falls back to a
> built‑in rule‑based assistant, and if Supabase isn't set leads simply aren't persisted (but the
> UI still works). Add the keys to switch everything on.

---

## 1. Run locally

```bash
npm install
cp .env.example .env.local   # then fill in the values (see below)
npm run dev                  # http://localhost:3000
```

- Landing/demo: `http://localhost:3000`
- Bare widget (for iframe): `http://localhost:3000/widget`
- Admin dashboard: `http://localhost:3000/admin`

## 2. Environment variables

Copy `.env.example` → `.env.local` (local) and add the same in Vercel → Project → Settings → Environment Variables.

```
ANTHROPIC_API_KEY=          # console.anthropic.com → API Keys
ANTHROPIC_MODEL=claude-sonnet-4-5   # or claude-haiku-4-5 (cheaper) / claude-3-5-sonnet-latest
NEXT_PUBLIC_SUPABASE_URL=   # Supabase → Project Settings → API → Project URL
SUPABASE_SERVICE_ROLE_KEY=  # Supabase → API → service_role key (SERVER ONLY)
RESEND_API_KEY=             # resend.com → API Keys
EMAIL_FROM=SULAREX Assistant <onboarding@resend.dev>
LEAD_NOTIFY_EMAIL=Sudaria.cgt@gmail.com
ADMIN_PASSWORD=             # password to open /admin
ADMIN_SECRET=               # long random string (session signing)
```

> Set `ANTHROPIC_MODEL` to a model your Anthropic account can access. If a chat request errors,
> the widget automatically falls back to the rule‑based assistant, so it never goes blank.

## 3. Set up Supabase (database)

1. Create a free project at **supabase.com**.
2. Open **SQL Editor → New query**, paste the contents of `supabase/schema.sql`, and **Run**.
   This creates `leads` and `site_visits` tables with Row Level Security **on** (so only your
   server, using the service‑role key, can read/write — customer data stays private).
3. Copy **Project URL** and the **service_role** key into your env vars.

## 4. Set up email (Resend)

1. Create an account at **resend.com** and an **API key**.
2. For testing you can send from `onboarding@resend.dev` (already the default `EMAIL_FROM`).
3. For production, verify your domain in Resend and set `EMAIL_FROM=SULAREX <noreply@sularex.com>`.
4. Notifications go to `LEAD_NOTIFY_EMAIL` (default `Sudaria.cgt@gmail.com`).

*Prefer Gmail SMTP instead of Resend?* Swap `lib/email.js` to use `nodemailer` with a Gmail
App Password — the rest of the app is unchanged.

## 5. Get a Claude API key

1. Go to **console.anthropic.com → API Keys**, create a key, set `ANTHROPIC_API_KEY`.
2. (Optional) choose a model via `ANTHROPIC_MODEL`. `claude-haiku-4-5` is fast and economical for a chat widget.

## 6. Deploy to Vercel

1. Push this folder to a GitHub repo.
2. On **vercel.com → New Project**, import the repo (framework auto‑detected: **Next.js**).
3. Add all the environment variables from step 2.
4. **Deploy.** You'll get a URL like `https://sularex-assistant.vercel.app`.
5. (Optional) add a custom subdomain, e.g. `assistant.sularex.com`.

## 7. Add the widget to sularex.com

Your main site is on Netlify (static `index.html`). Add **one line** just before `</body>`:

```html
<script src="https://YOUR-VERCEL-APP.vercel.app/embed.js" defer></script>
```

`embed.js` injects the gold floating button (bottom‑right) and opens the assistant in an iframe
(`/widget`). It's full‑screen on mobile, a 400×620 panel on desktop. No other changes needed.

> The `/widget` route is configured (in `next.config.mjs`) to allow embedding from `sularex.com`,
> `*.sularex.com` and `*.netlify.app`. Add other domains there if needed.

---

## Package recommendation logic

| Monthly bill | Package |
|---|---|
| ₱3,000 – ₱6,000 | 3kW (₱195,000) |
| ₱6,000 – ₱10,000 | 6kW (₱340,000) |
| ₱10,000 – ₱15,000 | 8kW (₱475,000) |
| ₱15,000 – ₱20,000 | 12kW (₱580,000) |
| ₱20,000 – ₱30,000 | 16kW (₱720,000) |
| ₱30,000+ | 18kW (custom quote) |

Edit prices/specs in `lib/packages.js`; the AI prompt and forms read from there automatically.

## Admin dashboard (`/admin`)

Sign in with `ADMIN_PASSWORD`. You can:
- View all **leads** and **site‑visit** requests
- **Search** across every field, filter by status
- **Export CSV**
- Set status: **New → Contacted → Site Visit Scheduled → Proposal Sent → Closed Sale**

## Security notes

- The Supabase **service‑role key** is only used in server route handlers — never shipped to the browser.
- Tables have RLS enabled with no public policies, so the anon key can't read customer data.
- Admin routes are protected by a signed, HttpOnly session cookie (`ADMIN_SECRET`).
- Use strong values for `ADMIN_PASSWORD` and `ADMIN_SECRET` in production.

## Customising the assistant

- **Personality / FAQ / rules:** `lib/systemPrompt.js`
- **Company details:** `lib/company.js`
- **Packages & pricing:** `lib/packages.js`
- **Colors / fonts:** `tailwind.config.js` (already matched to sularex.com)

---

Made for SULAREX Solar Solutions · Visit **sularex.com** for more details.
