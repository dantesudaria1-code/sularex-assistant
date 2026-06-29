import { supabaseAdmin } from "./supabaseAdmin";
import { sendNotification, leadEmailHtml, visitEmailHtml } from "./email";

export async function saveLead(lead) {
  const sb = supabaseAdmin();
  const record = {
    full_name: lead.full_name || null,
    phone: lead.phone || null,
    email: lead.email || null,
    location: lead.location || null,
    property_type: lead.property_type || null,
    monthly_bill: lead.monthly_bill ? Number(String(lead.monthly_bill).replace(/[^\d.]/g, "")) : null,
    recommended_package: lead.recommended_package || null,
    status: "New",
    source: lead.source || "AI Assistant",
  };
  let saved = record;
  if (sb) {
    // simple de-dupe: skip if same phone saved in the last 10 minutes
    if (record.phone) {
      const since = new Date(Date.now() - 10 * 60 * 1000).toISOString();
      const { data: dup } = await sb.from("leads").select("id").eq("phone", record.phone).gte("created_at", since).limit(1);
      if (dup && dup.length) return { ok: true, id: dup[0].id, duplicate: true };
    }
    const { data, error } = await sb.from("leads").insert(record).select().single();
    if (error) return { ok: false, error: error.message };
    saved = data;
  }
  await sendNotification("New SULAREX Lead: " + (record.full_name || record.phone || "unknown"), leadEmailHtml(record));
  return { ok: true, id: saved.id || null, record: saved };
}

export async function saveSiteVisit(v) {
  const sb = supabaseAdmin();
  const record = {
    full_name: v.full_name || v.contact_person || null,
    contact_person: v.contact_person || v.full_name || null,
    phone: v.phone || null,
    address: v.address || null,
    preferred_date: v.preferred_date || null,
    preferred_time: v.preferred_time || null,
    monthly_bill: v.monthly_bill ? Number(String(v.monthly_bill).replace(/[^\d.]/g, "")) : null,
    recommended_package: v.recommended_package || null,
    status: "Site Visit Scheduled",
    source: v.source || "AI Assistant",
  };
  let saved = record;
  if (sb) {
    const { data, error } = await sb.from("site_visits").insert(record).select().single();
    if (error) return { ok: false, error: error.message };
    saved = data;
  }
  await sendNotification("New SULAREX Site Visit Request: " + (record.contact_person || record.phone || "unknown"), visitEmailHtml(record));
  return { ok: true, id: saved.id || null, record: saved };
}
