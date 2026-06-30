// SULAREX solar packages + bill-based recommendation logic.
// Prices reflect the public sularex.com pricing.
export const PACKAGES = [
  { key: "3kw",  name: "3kW Package",  kw: 3,  price: 195000, minBill: 3000,  maxBill: 5000,
    panels: "5–6 × 600–650W mono panels",  inverter: "3kW hybrid inverter",  battery: "optional",   good: "smaller homes" },
  { key: "6kw",  name: "6kW Package",  kw: 6,  price: 340000, minBill: 6000,  maxBill: 10000,
    panels: "9–10 × 600–650W mono panels", inverter: "6kW hybrid inverter",  battery: "optional",   good: "typical families" },
  { key: "8kw",  name: "8kW Package",  kw: 8,  price: 475000, minBill: 11000, maxBill: 15000,
    panels: "12–13 × 600–650W mono panels", inverter: "8kW hybrid inverter",  battery: "324Ah option", good: "larger homes" },
  { key: "12kw", name: "12kW Package", kw: 12, price: 580000, minBill: 16000, maxBill: 20000,
    panels: "18–20 × 600–650W mono panels", inverter: "12kW hybrid inverter", battery: "324Ah option", good: "big households" },
  { key: "16kw", name: "16kW Package", kw: 16, price: 720000, minBill: 21000, maxBill: 25000,
    panels: "24–26 × 600–650W mono panels", inverter: "16kW hybrid inverter", battery: "324Ah option", good: "large homes" },
  { key: "18kw", name: "18kW Package", kw: 18, price: 820000, minBill: 26000, maxBill: 30000,
    panels: "28–30 × 600–650W mono panels", inverter: "18kW hybrid inverter", battery: "custom sizing", good: "very large homes" },
];

// Bills above this require a custom commercial design (NEVER a standard package).
export const COMMERCIAL_THRESHOLD = 30000;

export const COMMERCIAL_MESSAGE =
  "This electrical consumption exceeds our standard residential packages. We recommend a custom commercial solar design and engineering assessment. Please provide your name, contact number, location, and average monthly bill so our team can prepare a customized proposal.";

export function recommendByBill(bill) {
  const b = Number(bill) || 0;
  if (b <= 0) return null;
  if (b > COMMERCIAL_THRESHOLD) return null; // commercial / custom — no standard package
  // exact inclusive ranges
  const hit = PACKAGES.find((p) => b >= p.minBill && b <= p.maxBill);
  if (hit) return hit;
  // gaps (e.g. ₱5,001–₱5,999 or ₱10,001–₱10,999): pick the nearest lower package
  let best = null;
  for (const p of PACKAGES) { if (b >= p.minBill) best = p; }
  return best;
}

export function priceLabel(p) {
  if (!p) return "";
  return p.price ? "₱" + p.price.toLocaleString("en-PH") : "Custom quote";
}
