"use client";
import { useEffect, useRef, useState } from "react";

const SUGGESTIONS = [
  "My bill is ₱12,000",
  "How does solar work?",
  "Do I need a battery?",
  "Book a free site visit",
];

const GREETING =
  "Hi! 👋 I'm the SULAREX Solar Assistant. Tell me your average monthly electric bill (e.g. ₱12,000) and I'll recommend the right solar package — and how much you could save. Visit sularex.com for more details.";

function Markdownish({ text }) {
  // very small bold (**x**) + line break renderer; avoids extra deps
  const parts = String(text).split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("**") && p.endsWith("**") ? (
          <strong key={i} className="text-goldSoft">{p.slice(2, -2)}</strong>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </>
  );
}

export default function SolarAssistant({ embedded = false }) {
  const [open, setOpen] = useState(embedded);
  const [messages, setMessages] = useState([{ role: "assistant", content: GREETING }]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [showLead, setShowLead] = useState(false);
  const [showVisit, setShowVisit] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, busy, showLead, showVisit]);

  async function send(text) {
    const content = (text ?? input).trim();
    if (!content || busy) return;
    const next = [...messages, { role: "user", content }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.slice(-12) }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { role: "assistant", content: data.reply || "Sorry, please try again." }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "I had trouble connecting. Please call us at 0917 146 4377 or visit sularex.com." }]);
    } finally {
      setBusy(false);
    }
  }

  const panel = (
    <div
      className={
        embedded
          ? "flex flex-col w-full h-full bg-bg"
          : "sx-pop fixed z-[9999] bg-bg border border-line shadow-float overflow-hidden flex flex-col " +
            "bottom-0 right-0 left-0 top-0 rounded-none " +
            "sm:bottom-24 sm:right-6 sm:left-auto sm:top-auto sm:w-[400px] sm:h-[620px] sm:max-h-[80vh] sm:rounded-xl2"
      }
    >
      {/* header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-line bg-surface">
        <div className="w-9 h-9 rounded-full grid place-items-center" style={{ background: "linear-gradient(135deg,#f8cb4d,#9ad141)" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0b1220" strokeWidth="2.4"><circle cx="12" cy="12" r="4" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" /></svg>
        </div>
        <div className="flex-1">
          <div className="font-display font-extrabold text-ink leading-tight">SULAREX Assistant</div>
          <div className="text-[11px] text-lime flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-lime inline-block" /> Online · replies instantly</div>
        </div>
        {!embedded && (
          <button onClick={() => setOpen(false)} className="text-dim hover:text-ink p-1" aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        )}
      </div>

      {/* messages */}
      <div ref={scrollRef} className="sx-scroll flex-1 overflow-y-auto px-3 py-4 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={"flex " + (m.role === "user" ? "justify-end" : "justify-start")}>
            <div
              className={
                "max-w-[85%] px-3.5 py-2.5 text-[13.5px] leading-relaxed rounded-2xl " +
                (m.role === "user"
                  ? "bg-gold text-[#1a1300] rounded-br-md font-medium"
                  : "bg-surface border border-line text-ink rounded-bl-md")
              }
            >
              <Markdownish text={m.content} />
            </div>
          </div>
        ))}
        {busy && (
          <div className="flex justify-start">
            <div className="bg-surface border border-line rounded-2xl rounded-bl-md px-4 py-3 sx-typing text-mute text-xl leading-none">
              <span>•</span><span>•</span><span>•</span>
            </div>
          </div>
        )}

        {messages.length <= 1 && !busy && (
          <div className="flex flex-wrap gap-2 pt-1">
            {SUGGESTIONS.map((s) => (
              <button key={s} onClick={() => (s.includes("site visit") ? setShowVisit(true) : send(s))}
                className="text-xs px-3 py-1.5 rounded-full border border-line bg-surface text-mute hover:text-ink hover:border-gold transition">
                {s}
              </button>
            ))}
          </div>
        )}

        {showLead && <LeadForm onClose={() => setShowLead(false)} onDone={(msg) => { setShowLead(false); setMessages((m) => [...m, { role: "assistant", content: msg }]); }} />}
        {showVisit && <VisitForm onClose={() => setShowVisit(false)} onDone={(msg) => { setShowVisit(false); setMessages((m) => [...m, { role: "assistant", content: msg }]); }} />}
      </div>

      {/* quick actions */}
      <div className="flex gap-2 px-3 py-2 border-t border-line bg-surface/60">
        <button onClick={() => { setShowLead(true); setShowVisit(false); }} className="flex-1 text-xs font-semibold py-2 rounded-lg bg-surface2 border border-line text-ink hover:border-gold">📋 Get my free assessment</button>
        <button onClick={() => { setShowVisit(true); setShowLead(false); }} className="flex-1 text-xs font-semibold py-2 rounded-lg bg-surface2 border border-line text-ink hover:border-gold">📅 Book site visit</button>
      </div>

      {/* input */}
      <div className="flex items-center gap-2 p-3 border-t border-line bg-surface">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Type your message…"
          className="flex-1 bg-bg border border-line rounded-xl px-3.5 py-2.5 text-[13.5px] text-ink placeholder:text-dim outline-none focus:border-gold"
        />
        <button onClick={() => send()} disabled={busy || !input.trim()}
          className="w-10 h-10 grid place-items-center rounded-xl bg-gold text-[#1a1300] disabled:opacity-40">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" /></svg>
        </button>
      </div>
      <div className="text-center text-[10px] text-dim pb-2">Powered by SULAREX · sularex.com</div>
    </div>
  );

  if (embedded) return panel;

  return (
    <>
      {open && panel}
      {!open && (
        <button onClick={() => setOpen(true)}
          className="sx-pop fixed bottom-6 right-6 z-[9999] flex items-center gap-2 pl-4 pr-5 py-3.5 rounded-full shadow-float font-display font-extrabold text-[#1a1300]"
          style={{ background: "linear-gradient(135deg,#f8cb4d,#e3a81b)" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1a1300" strokeWidth="2.2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>
          Ask about solar
        </button>
      )}
    </>
  );
}

/* ---------------- inline forms ---------------- */
function Field({ label, ...p }) {
  return (
    <label className="block text-[11px] text-mute mb-2">
      {label}
      <input {...p} className="mt-1 w-full bg-bg border border-line rounded-lg px-3 py-2 text-[13px] text-ink placeholder:text-dim outline-none focus:border-gold" />
    </label>
  );
}

function LeadForm({ onClose, onDone }) {
  const [f, setF] = useState({ full_name: "", phone: "", email: "", location: "", monthly_bill: "", property_type: "Residential" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  async function submit() {
    if (!f.full_name || !f.phone) { setErr("Name and phone are required."); return; }
    setBusy(true); setErr("");
    try {
      const res = await fetch("/api/lead", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...f, source: "Web form (assistant)" }) });
      const d = await res.json();
      if (d.ok) onDone(`Thanks ${f.full_name.split(" ")[0]}! ✅ Your details are in — our team will reach out shortly to arrange your FREE site assessment. Visit sularex.com for more details.`);
      else setErr(d.error || "Something went wrong.");
    } catch { setErr("Network error. Please call 0917 146 4377."); }
    finally { setBusy(false); }
  }
  return (
    <div className="bg-surface border border-gold/40 rounded-xl p-3.5 mt-1">
      <div className="flex items-center justify-between mb-2"><div className="font-display font-bold text-ink text-sm">Get your FREE assessment</div><button onClick={onClose} className="text-dim text-xs">✕</button></div>
      <Field label="Full name *" value={f.full_name} onChange={set("full_name")} placeholder="Juan Dela Cruz" />
      <Field label="Phone number *" value={f.phone} onChange={set("phone")} placeholder="0917 xxx xxxx" />
      <Field label="Email" value={f.email} onChange={set("email")} placeholder="you@email.com" />
      <Field label="Property location" value={f.location} onChange={set("location")} placeholder="City / Barangay" />
      <div className="grid grid-cols-2 gap-2">
        <Field label="Monthly bill (₱)" value={f.monthly_bill} onChange={set("monthly_bill")} placeholder="12000" inputMode="numeric" />
        <label className="block text-[11px] text-mute mb-2">Property type
          <select value={f.property_type} onChange={set("property_type")} className="mt-1 w-full bg-bg border border-line rounded-lg px-3 py-2 text-[13px] text-ink outline-none focus:border-gold">
            <option>Residential</option><option>Commercial</option>
          </select>
        </label>
      </div>
      {err && <div className="text-coral text-xs mb-2">{err}</div>}
      <button onClick={submit} disabled={busy} className="w-full py-2.5 rounded-lg bg-gold text-[#1a1300] font-bold text-sm disabled:opacity-50">{busy ? "Sending…" : "Submit"}</button>
    </div>
  );
}

function VisitForm({ onClose, onDone }) {
  const [f, setF] = useState({ contact_person: "", phone: "", address: "", preferred_date: "", preferred_time: "", monthly_bill: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  async function submit() {
    if (!f.contact_person || !f.phone || !f.address || !f.preferred_date) { setErr("Please fill name, phone, address and date."); return; }
    setBusy(true); setErr("");
    try {
      const res = await fetch("/api/site-visit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...f, source: "Web form (assistant)" }) });
      const d = await res.json();
      if (d.ok) onDone(`Booked! ✅ Your FREE site visit request for ${f.preferred_date} is in. Our team will confirm by phone. Visit sularex.com for more details.`);
      else setErr(d.error || "Something went wrong.");
    } catch { setErr("Network error. Please call 0917 146 4377."); }
    finally { setBusy(false); }
  }
  return (
    <div className="bg-surface border border-gold/40 rounded-xl p-3.5 mt-1">
      <div className="flex items-center justify-between mb-2"><div className="font-display font-bold text-ink text-sm">Book a FREE site visit</div><button onClick={onClose} className="text-dim text-xs">✕</button></div>
      <Field label="Contact person *" value={f.contact_person} onChange={set("contact_person")} placeholder="Your name" />
      <Field label="Phone number *" value={f.phone} onChange={set("phone")} placeholder="0917 xxx xxxx" />
      <Field label="Address *" value={f.address} onChange={set("address")} placeholder="Street, Barangay, City" />
      <div className="grid grid-cols-2 gap-2">
        <Field label="Preferred date *" type="date" value={f.preferred_date} onChange={set("preferred_date")} />
        <Field label="Preferred time" value={f.preferred_time} onChange={set("preferred_time")} placeholder="e.g. 10:00 AM" />
      </div>
      <Field label="Monthly bill (₱)" value={f.monthly_bill} onChange={set("monthly_bill")} placeholder="12000" inputMode="numeric" />
      {err && <div className="text-coral text-xs mb-2">{err}</div>}
      <button onClick={submit} disabled={busy} className="w-full py-2.5 rounded-lg bg-gold text-[#1a1300] font-bold text-sm disabled:opacity-50">{busy ? "Booking…" : "Request site visit"}</button>
    </div>
  );
}
