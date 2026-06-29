import SolarAssistant from "@/components/SolarAssistant";

export default function Home() {
  return (
    <main className="min-h-screen">
      <div className="max-w-[1160px] mx-auto px-6 py-16">
        <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wide text-lime border border-line rounded-full px-3 py-1 mb-6">
          <span className="w-2 h-2 rounded-full bg-lime" /> AI SOLAR ASSISTANT · 24/7
        </div>
        <h1 className="font-display font-black text-4xl sm:text-6xl leading-[1.05] max-w-3xl">
          Get your solar <span className="text-gold">recommendation</span> in under a minute.
        </h1>
        <p className="text-mute mt-5 max-w-xl text-lg">
          Tell the SULAREX Assistant your monthly electric bill and it instantly recommends the right
          solar package, estimates your savings, and books a <strong className="text-ink">free</strong> on-site assessment.
        </p>
        <div className="mt-8 flex flex-wrap gap-3 text-sm text-mute">
          <span className="px-3 py-1.5 rounded-full bg-surface border border-line">Package recommendation</span>
          <span className="px-3 py-1.5 rounded-full bg-surface border border-line">Lead capture</span>
          <span className="px-3 py-1.5 rounded-full bg-surface border border-line">Site-visit scheduler</span>
          <span className="px-3 py-1.5 rounded-full bg-surface border border-line">Instant answers</span>
        </div>

        <div className="mt-14 grid lg:grid-cols-2 gap-10 items-start">
          <div className="space-y-4">
            <h2 className="font-display font-bold text-2xl">How it helps your customers</h2>
            <ul className="space-y-3 text-mute">
              {[
                ["💬", "Answers solar questions 24/7 — how it works, batteries, warranty, installation, financing."],
                ["⚡", "Recommends a package from the customer's monthly bill (₱3K → 3kW up to ₱30K+ → 18kW)."],
                ["📋", "Captures qualified leads and emails them to your team instantly."],
                ["📅", "Books free site visits straight into your dashboard."],
              ].map(([i, t]) => (
                <li key={t} className="flex gap-3"><span className="text-xl">{i}</span><span>{t}</span></li>
              ))}
            </ul>
            <div className="pt-4">
              <a href="/admin" className="inline-block px-5 py-3 rounded-xl2 bg-surface border border-line font-semibold hover:border-gold">Open Admin Dashboard →</a>
            </div>
          </div>

          {/* embedded preview */}
          <div className="h-[620px] rounded-xl2 border border-line overflow-hidden shadow-float">
            <SolarAssistant embedded />
          </div>
        </div>
      </div>

      {/* floating widget for this demo page too */}
      <SolarAssistant />
    </main>
  );
}
