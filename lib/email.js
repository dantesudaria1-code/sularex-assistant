import { Resend } from "resend";

// Sends the lead/visit notification email. Failures are swallowed so they
// never block saving the record.
export async function sendNotification(subject, html) {
  try {
    const key = process.env.RESEND_API_KEY;
    const to = process.env.LEAD_NOTIFY_EMAIL || "Sudaria.cgt@gmail.com";
    const from = process.env.EMAIL_FROM || "SULAREX Assistant <onboarding@resend.dev>";
    if (!key) { console.warn("[email] RESEND_API_KEY not set — skipping email"); return { skipped: true }; }
    const resend = new Resend(key);
    const { data, error } = await resend.emails.send({ from, to, subject, html });
    if (error) { console.error("[email] resend error", error); return { error }; }
    return { id: data?.id };
  } catch (e) {
    console.error("[email] exception", e);
    return { error: String(e) };
  }
}

export function leadEmailHtml(lead) {
  const row = (k, v) => `<tr><td style="padding:6px 12px;border:1px solid #e5e7eb;color:#374151">${k}</td><td style="padding:6px 12px;border:1px solid #e5e7eb;font-weight:600">${v || "—"}</td></tr>`;
  return `<div style="font-family:Arial,sans-serif;max-width:560px">
    <h2 style="color:#0b2545">New SULAREX Lead</h2>
    <table style="border-collapse:collapse;width:100%">
      ${row("Name", lead.full_name)}
      ${row("Phone", lead.phone)}
      ${row("Email", lead.email)}
      ${row("Location", lead.location)}
      ${row("Monthly Bill", lead.monthly_bill ? "₱" + Number(lead.monthly_bill).toLocaleString("en-PH") : "")}
      ${row("Recommended Package", lead.recommended_package)}
      ${row("Property Type", lead.property_type)}
      ${row("Submitted", new Date().toLocaleString("en-PH"))}
    </table>
    <p style="color:#6b7280;font-size:13px">Source: AI Solar Assistant · sularex.com</p>
  </div>`;
}

export function visitEmailHtml(v) {
  const row = (k, val) => `<tr><td style="padding:6px 12px;border:1px solid #e5e7eb;color:#374151">${k}</td><td style="padding:6px 12px;border:1px solid #e5e7eb;font-weight:600">${val || "—"}</td></tr>`;
  return `<div style="font-family:Arial,sans-serif;max-width:560px">
    <h2 style="color:#0b2545">New Site Visit Request</h2>
    <table style="border-collapse:collapse;width:100%">
      ${row("Contact Person", v.contact_person || v.full_name)}
      ${row("Phone", v.phone)}
      ${row("Address", v.address)}
      ${row("Preferred Date", v.preferred_date)}
      ${row("Preferred Time", v.preferred_time)}
      ${row("Monthly Bill", v.monthly_bill ? "₱" + Number(v.monthly_bill).toLocaleString("en-PH") : "")}
      ${row("Recommended Package", v.recommended_package)}
      ${row("Submitted", new Date().toLocaleString("en-PH"))}
    </table>
    <p style="color:#6b7280;font-size:13px">Source: AI Solar Assistant · sularex.com</p>
  </div>`;
}
