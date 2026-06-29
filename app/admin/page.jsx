"use client";
import { useEffect, useMemo, useState } from "react";

const STATUSES = ["New", "Contacted", "Site Visit Scheduled", "Proposal Sent", "Closed Sale"];
const STATUS_COLOR = {
  New: "#3b9ae0", Contacted: "#f8cb4d", "Site Visit Scheduled": "#9ad141",
  "Proposal Sent": "#a78bfa", "Closed Sale": "#6fa524",
};

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [loginErr, setLoginErr] = useState("");
  const [tab, setTab] = useState("leads");
  const [leads, setLeads] = useState([]);
  const [visits, setVisits] = useState([]);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState("");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/data", { cache: "no-store" });
    if (res.status === 401) { setAuthed(false); setLoading(false); return; }
    const d = await res.json();
    setAuthed(true);
    setLeads(d.leads || []);
    setVisits(d.visits || []);
    setNote(d.note || "");
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function login() {
    setLoginErr("");
    const res = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
    if (res.ok) { setPassword(""); load(); } else setLoginErr("Wrong password");
  }
  async function logout() { await fetch("/api/admin/logout", { method: "POST" }); setAuthed(false); }

  async function setStatus(table, id, status) {
    const upd = (arr) => arr.map((r) => (r.id === id ? { ...r, status } : r));
    if (table === "leads") setLeads(upd); else setVisits(upd);
    await fetch("/api/admin/status", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ table, id, status }) });
  }

  const rows = tab === "leads" ? leads : visits;
  const filtered = useMemo(() => {
    const term = q.toLowerCase().trim();
    return rows.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (!term) return true;
      return Object.values(r).join(" ").toLowerCase().includes(term);
    });
  }, [rows, q, statusFilter]);

  function exportCsv() {
    const cols = tab === "leads"
      ? ["created_at", "full_name", "phone", "email", "location", "property_type", "monthly_bill", "recommended_package", "status", "source"]
      : ["created_at", "contact_person", "phone", "address", "preferred_date", "preferred_time", "monthly_bill", "recommended_package", "status", "source"];
    const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const csv = [cols.join(","), ...filtered.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `sularex-${tab}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  }

  if (!authed) {
    return (
      <main className="min-h-screen grid place-items-center px-6">
        <div className="w-full max-w-sm bg-surface border border-line rounded-xl2 p-6 shadow-float">
          <div className="font-display font-black text-2xl mb-1">SULAREX Admin</div>
          <div className="text-mute text-sm mb-5">Leads & site-visit dashboard</div>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && login()}
            placeholder="Admin password" className="w-full bg-bg border border-line rounded-lg px-3 py-2.5 text-ink outline-none focus:border-gold" />
          {loginErr && <div className="text-coral text-sm mt-2">{loginErr}</div>}
          <button onClick={login} className="mt-4 w-full py-2.5 rounded-lg bg-gold text-[#1a1300] font-bold">Sign in</button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <header className="border-b border-line bg-surface">
        <div className="max-w-[1160px] mx-auto px-6 py-4 flex items-center gap-3">
          <div className="font-display font-black text-xl">SULAREX <span className="text-gold">Admin</span></div>
          <div className="flex-1" />
          <button onClick={load} className="text-sm px-3 py-1.5 rounded-lg border border-line hover:border-gold">↻ Refresh</button>
          <button onClick={logout} className="text-sm px-3 py-1.5 rounded-lg border border-line hover:border-gold">Logout</button>
        </div>
      </header>

      <div className="max-w-[1160px] mx-auto px-6 py-6">
        {note && <div className="mb-4 text-sm text-gold bg-surface border border-line rounded-lg px-3 py-2">{note} — add your Supabase keys to persist records.</div>}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <Stat label="Total Leads" value={leads.length} color="#3b9ae0" />
          <Stat label="Site Visits" value={visits.length} color="#9ad141" />
          <Stat label="New" value={leads.filter((l) => l.status === "New").length} color="#f8cb4d" />
          <Stat label="Closed Sales" value={leads.filter((l) => l.status === "Closed Sale").length} color="#6fa524" />
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-4">
          <div className="flex rounded-lg border border-line overflow-hidden">
            {["leads", "visits"].map((t) => (
              <button key={t} onClick={() => setTab(t)} className={"px-4 py-2 text-sm font-semibold " + (tab === t ? "bg-gold text-[#1a1300]" : "bg-surface text-mute")}>
                {t === "leads" ? "Leads" : "Site Visits"}
              </button>
            ))}
          </div>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, phone, email, location…"
            className="flex-1 min-w-[220px] bg-surface border border-line rounded-lg px-3 py-2 text-sm text-ink outline-none focus:border-gold" />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-surface border border-line rounded-lg px-3 py-2 text-sm text-ink">
            <option value="all">All statuses</option>
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
          <button onClick={exportCsv} className="px-3 py-2 text-sm font-semibold rounded-lg bg-surface border border-line hover:border-gold">⬇ Export CSV</button>
        </div>

        <div className="overflow-x-auto rounded-xl2 border border-line">
          <table className="w-full text-sm">
            <thead className="bg-surface text-mute text-xs uppercase tracking-wide">
              {tab === "leads" ? (
                <tr>{["Date", "Name", "Phone", "Email", "Location", "Bill", "Package", "Status"].map((h) => <th key={h} className="text-left px-3 py-3 font-semibold">{h}</th>)}</tr>
              ) : (
                <tr>{["Date", "Contact", "Phone", "Address", "Preferred", "Bill", "Package", "Status"].map((h) => <th key={h} className="text-left px-3 py-3 font-semibold">{h}</th>)}</tr>
              )}
            </thead>
            <tbody>
              {loading && <tr><td colSpan={8} className="px-3 py-8 text-center text-dim">Loading…</td></tr>}
              {!loading && filtered.length === 0 && <tr><td colSpan={8} className="px-3 py-10 text-center text-dim">No {tab} yet.</td></tr>}
              {filtered.map((r) => (
                <tr key={r.id} className="border-t border-line hover:bg-surface/50">
                  <td className="px-3 py-2.5 text-dim whitespace-nowrap">{r.created_at ? new Date(r.created_at).toLocaleDateString("en-PH", { month: "short", day: "numeric" }) : "—"}</td>
                  {tab === "leads" ? (
                    <>
                      <td className="px-3 py-2.5 font-semibold text-ink">{r.full_name || "—"}</td>
                      <td className="px-3 py-2.5 font-mono">{r.phone || "—"}</td>
                      <td className="px-3 py-2.5 text-mute">{r.email || "—"}</td>
                      <td className="px-3 py-2.5 text-mute">{r.location || "—"}</td>
                    </>
                  ) : (
                    <>
                      <td className="px-3 py-2.5 font-semibold text-ink">{r.contact_person || r.full_name || "—"}</td>
                      <td className="px-3 py-2.5 font-mono">{r.phone || "—"}</td>
                      <td className="px-3 py-2.5 text-mute">{r.address || "—"}</td>
                      <td className="px-3 py-2.5 text-mute whitespace-nowrap">{r.preferred_date || "—"}{r.preferred_time ? " · " + r.preferred_time : ""}</td>
                    </>
                  )}
                  <td className="px-3 py-2.5 text-gold whitespace-nowrap">{r.monthly_bill ? "₱" + Number(r.monthly_bill).toLocaleString("en-PH") : "—"}</td>
                  <td className="px-3 py-2.5 text-mute whitespace-nowrap">{r.recommended_package || "—"}</td>
                  <td className="px-3 py-2.5">
                    <select value={r.status} onChange={(e) => setStatus(tab === "leads" ? "leads" : "site_visits", r.id, e.target.value)}
                      className="bg-bg border rounded-lg px-2 py-1 text-xs font-semibold outline-none"
                      style={{ borderColor: STATUS_COLOR[r.status] || "#1d3a5e", color: STATUS_COLOR[r.status] || "#eef4fb" }}>
                      {STATUSES.map((s) => <option key={s} className="text-ink bg-bg">{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="text-xs text-dim mt-3">{filtered.length} record{filtered.length === 1 ? "" : "s"} shown</div>
      </div>
    </main>
  );
}

function Stat({ label, value, color }) {
  return (
    <div className="bg-surface border border-line rounded-xl2 p-4">
      <div className="text-[11px] uppercase tracking-wide text-mute">{label}</div>
      <div className="font-display font-black text-3xl mt-1" style={{ color }}>{value}</div>
    </div>
  );
}
