import { buildSystemPrompt } from "@/lib/systemPrompt";
import { saveLead, saveSiteVisit } from "@/lib/leads";
import { recommendByBill, priceLabel, COMMERCIAL_THRESHOLD, COMMERCIAL_MESSAGE } from "@/lib/packages";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TOOLS = [
  {
    name: "save_lead",
    description: "Save a qualified customer lead to the SULAREX CRM and notify the team by email. Call this once you have at least the customer's name and contact number.",
    input_schema: {
      type: "object",
      properties: {
        full_name: { type: "string" },
        phone: { type: "string" },
        email: { type: "string" },
        location: { type: "string" },
        monthly_bill: { type: "string", description: "Monthly electric bill in pesos, digits only" },
        recommended_package: { type: "string" },
        property_type: { type: "string", enum: ["Residential", "Commercial"] },
        business_name: { type: "string", description: "Commercial only (optional)" },
        utility_provider: { type: "string", description: "e.g. CEPALCO, Davao Light, VECO" },
      },
      required: ["full_name", "phone"],
    },
  },
  {
    name: "schedule_site_visit",
    description: "Book a FREE on-site solar assessment and notify the SULAREX team by email.",
    input_schema: {
      type: "object",
      properties: {
        contact_person: { type: "string" },
        phone: { type: "string" },
        address: { type: "string" },
        preferred_date: { type: "string" },
        preferred_time: { type: "string" },
        monthly_bill: { type: "string" },
        recommended_package: { type: "string" },
      },
      required: ["contact_person", "phone", "address", "preferred_date"],
    },
  },
];

async function runTool(name, input) {
  if (name === "save_lead") {
    const extra = [];
    if (input.utility_provider) extra.push("Utility: " + input.utility_provider);
    if (input.business_name) extra.push("Business: " + input.business_name);
    const location = [input.location, extra.join(" · ")].filter(Boolean).join(" · ");
    const r = await saveLead({ ...input, location, source: "AI Assistant (chat)" });
    return { ok: r.ok, id: r.id, message: r.ok ? "Lead saved and team notified." : ("Could not save: " + r.error) };
  }
  if (name === "schedule_site_visit") {
    const r = await saveSiteVisit({ ...input, full_name: input.contact_person, source: "AI Assistant (chat)" });
    return { ok: r.ok, id: r.id, message: r.ok ? "Site visit booked and team notified." : ("Could not book: " + r.error) };
  }
  return { ok: false, message: "Unknown tool" };
}

// Lightweight assistant used when no ANTHROPIC_API_KEY is configured,
// so the widget still works on first deploy.
function fallbackReply(messages) {
  const last = (messages[messages.length - 1]?.content || "").toString();
  if (/talk to (a )?human|talk to (an )?agent|speak to|real person|customer service|representative/i.test(last)) {
    return `Thank you for your interest in SULAREX.\nTo connect you with one of our solar specialists, please provide:\n• Full Name • Contact Number • Location • Average Monthly Electric Bill\n\nYou may also contact us directly:\n📍 Office Address: Tanleh Building (Inside Mindanao Daily News), Abellanosa Street, Consolacion, Cagayan de Oro City\n📞 Mobile: 0917 146 4377\n📘 Facebook Page: https://www.facebook.com/SularexEnergy\n\nOnce we receive your details, our team will contact you to discuss your solar requirements and recommend the most suitable solar package for your home or business.`;
  }
  const m = last.replace(/,/g, "").match(/(\d{3,7})/);
  const bill = m ? Number(m[1]) : null;
  if (bill && bill >= 1000) {
    if (bill > COMMERCIAL_THRESHOLD) {
      return `${COMMERCIAL_MESSAGE}\n\nMay I also know — is this for 🏠 Residential or 🏢 Commercial use? Visit sularex.com for more details.`;
    }
    const p = recommendByBill(bill);
    if (p) {
      return `Based on a ₱${bill.toLocaleString("en-PH")} monthly bill, we recommend our **${p.name}** (${priceLabel(p)}): ${p.inverter}, ${p.panels}, Battery ${p.battery}. Battery capacity and brands can be customized to your backup needs and budget. The best next step is a FREE on-site assessment for an accurate proposal — may I have your name, contact number, location, and average monthly bill? You can also tap [Get Free Assessment] or [Book Site Visit] below. Visit sularex.com for more details.`;
    }
  }
  if (/battery/i.test(last)) return "A battery is optional. It stores daytime solar energy for night use and keeps essentials running during brownouts. Tell me your average monthly electric bill and I'll recommend a package, then we can book your FREE site assessment. Visit sularex.com for more details.";
  if (/warrant/i.test(last)) return "Our panels carry a long-term performance warranty and inverters are covered too — exact terms are confirmed in your proposal. Share your monthly bill and I'll recommend a package. Visit sularex.com for more details.";
  if (/location|office|where|address/i.test(last)) return "Our office is at Tanleh Building (Inside Mindanao Daily News), Abellanosa Street, Consolacion, Cagayan de Oro City. 📞 0917 146 4377 · 📘 facebook.com/SularexEnergy. Visit sularex.com for more details.";
  return "Hi! I'm the SULAREX Solar Assistant. Tell me your average monthly electric bill (e.g. ₱12,000) and I'll recommend the right solar package and savings — then we can book a FREE site assessment. Visit sularex.com for more details.";
}

export async function POST(req) {
  let body;
  try { body = await req.json(); } catch { return Response.json({ error: "bad request" }, { status: 400 }); }
  const history = Array.isArray(body.messages) ? body.messages : [];
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return Response.json({ reply: fallbackReply(history), fallback: true });
  }

  try {
    const Anthropic = (await import("@anthropic-ai/sdk")).default;
    const client = new Anthropic({ apiKey });
    const model = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5";
    const system = buildSystemPrompt();

    let messages = history
      .filter((m) => m && (m.role === "user" || m.role === "assistant") && m.content)
      .map((m) => ({ role: m.role, content: String(m.content) }));

    let actions = { leadSaved: false, visitSaved: false };
    for (let i = 0; i < 4; i++) {
      const resp = await client.messages.create({ model, max_tokens: 1024, system, messages, tools: TOOLS });
      if (resp.stop_reason === "tool_use") {
        const toolResults = [];
        for (const block of resp.content) {
          if (block.type === "tool_use") {
            const result = await runTool(block.name, block.input || {});
            if (block.name === "save_lead" && result.ok) actions.leadSaved = true;
            if (block.name === "schedule_site_visit" && result.ok) actions.visitSaved = true;
            toolResults.push({ type: "tool_result", tool_use_id: block.id, content: JSON.stringify(result) });
          }
        }
        messages.push({ role: "assistant", content: resp.content });
        messages.push({ role: "user", content: toolResults });
        continue;
      }
      const text = (resp.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n").trim();
      return Response.json({ reply: text || "How can I help you with solar today?", ...actions });
    }
    return Response.json({ reply: "Thanks! Our team will follow up shortly. Visit sularex.com for more details.", ...actions });
  } catch (e) {
    console.error("[chat] error", e);
    return Response.json({ reply: fallbackReply(history), error: String(e?.message || e), fallback: true });
  }
}
