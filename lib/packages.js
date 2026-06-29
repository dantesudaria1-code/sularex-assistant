// SULAREX solar packages + bill-based recommendation logic.
// Prices reflect the public sularex.com pricing.
export const PACKAGES = [
  { key: "3kw",  name: "3kW Solar Package",  kw: 3,  price: 195000, minBill: 3000,  maxBill: 6000,
    panels: "5–6 × 600–650W mono panels", inverter: "3kW hybrid inverter",  battery: "optional",  good: "smaller homes" },
  { key: "6kw",  name: "6kW Solar Package",  kw: 6,  price: 340000, minBill: 6000,  maxBill: 10000,
    panels: "9–10 × 600–650W mono panels", inverter: "6kW hybrid inverter", battery: "optional",  good: "typical families" },
  { key: "8kw",  name: "8kW Solar Package",  kw: 8,  price: 475000, minBill: 10000, maxBill: 15000,
    panels: "12–13 × 600–650W mono panels", inverter: "8kW hybrid inverter", battery: "324Ah option", good: "larger homes" },
  { key: "12kw", name: "12kW Solar Package", kw: 12, price: 580000, minBill: 15000, maxBill: 20000,
    panels: "18–20 × 600–650W mono panels", inverter: "12kW hybrid inverter", battery: "324Ah option", good: "big households" },
  { key: "16kw", name: "16kW Solar Package", kw: 16, price: 720000, minBill: 20000, maxBill: 30000,
    panels: "24–26 × 600–650W mono panels", inverter: "16kW hybrid inverter", battery: "324Ah option", good: "medium–large homes" },
  { key: "18kw", name: "18kW Solar Package", kw: 18, price: null,   minBill: 30000, maxBill: Infinity,
    panels: "28+ × 600–650W mono panels", inverter: "18kW hybrid inverter", battery: "custom sizing", good: "large / commercial loads" },
];

export function recommendByBill(bill) {
  const b = Number(bill) || 0;
  if (b <= 0) return null;
  return PACKAGES.find((p) => b >= p.minBill && b < p.maxBill) || PACKAGES[PACKAGES.length - 1];
}

export function priceLabel(p) {
  if (!p) return "";
  return p.price ? "₱" + p.price.toLocaleString("en-PH") : "Custom quote";
}
