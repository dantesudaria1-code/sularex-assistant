// SULAREX standard hybrid packages + bill-based recommendation logic.
// Specs follow the official SULAREX package sheet. Prices are indicative
// cash prices, confirmed during the free site assessment.
export const PACKAGES = [
  { key: "3kw",  name: "3kW Hybrid Package",  kw: 3,  price: 195000, minBill: 3000,  maxBill: 5000,
    inverter: "3KW Hybrid Inverter",  panels: "6 Solar Panels (600W–650W)",  battery: "1 × 51.2V 228Ah",  good: "smaller homes" },
  { key: "6kw",  name: "6kW Hybrid Package",  kw: 6,  price: 340000, minBill: 6000,  maxBill: 10000,
    inverter: "6KW Hybrid Inverter",  panels: "10 Solar Panels (600W–650W)", battery: "1 × 228Ah",         good: "typical families" },
  { key: "8kw",  name: "8kW Hybrid Package",  kw: 8,  price: 475000, minBill: 11000, maxBill: 15000,
    inverter: "8KW Hybrid Inverter",  panels: "16 Solar Panels (600W–650W)", battery: "1 × 324Ah",         good: "larger homes" },
  { key: "12kw", name: "12kW Hybrid Package", kw: 12, price: 580000, minBill: 16000, maxBill: 20000,
    inverter: "12KW Hybrid Inverter", panels: "18 Solar Panels (600W–650W)", battery: "1 × 324Ah",         good: "big households" },
  { key: "16kw", name: "16kW Hybrid Package", kw: 16, price: 720000, minBill: 21000, maxBill: 25000,
    inverter: "16KW Hybrid Inverter", panels: "27 Solar Panels (600W–650W)", battery: "1 × 324Ah",         good: "large homes" },
  { key: "18kw", name: "18kW Hybrid Package", kw: 18, price: 820000, minBill: 26000, maxBill: 30000,
    inverter: "18KW Hybrid Inverter", panels: "30 Solar Panels (600W–650W)", battery: "2 × 324Ah",         good: "very large homes" },
];

// Bills above this require a custom design (NEVER a standard package).
export const COMMERCIAL_THRESHOLD = 30000;

export const COMMERCIAL_MESSAGE =
  "Your electrical consumption exceeds our standard residential packages. We recommend a custom solar design and FREE site assessment so our engineering team can properly evaluate your requirements and provide a customized proposal.";

export function recommendByBill(bill) {
  const b = Number(bill) || 0;
  if (b <= 0) return null;
  if (b > COMMERCIAL_THRESHOLD) return null; // custom / commercial — no standard package
  const hit = PACKAGES.find((p) => b >= p.minBill && b <= p.maxBill);
  if (hit) return hit;
  let best = null;
  for (const p of PACKAGES) { if (b >= p.minBill) best = p; }
  return best;
}

export function priceLabel(p) {
  if (!p) return "";
  return p.price ? "₱" + p.price.toLocaleString("en-PH") : "Custom quote";
}
