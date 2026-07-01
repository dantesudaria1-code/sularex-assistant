// SULAREX standard hybrid packages + bill-based recommendation logic.
// Specs follow the official SULAREX package sheet. Prices are indicative
// cash prices, confirmed during the free site assessment.
export const PACKAGES = [
  { key: "3kw",  name: "3kW Hybrid Solar Package",  kw: 3,  price: 195000,
    inverter: "3KW Hybrid Inverter",  panels: "6 Solar Panels (600W–650W)",  battery: "1 × 51.2V 228Ah", good: "smaller homes" },
  { key: "6kw",  name: "6kW Hybrid Solar Package",  kw: 6,  price: 340000,
    inverter: "6KW Hybrid Inverter",  panels: "10 Solar Panels (600W–650W)", battery: "1 × 228Ah",       good: "typical families" },
  { key: "8kw",  name: "8kW Hybrid Solar Package",  kw: 8,  price: 475000,
    inverter: "8KW Hybrid Inverter",  panels: "16 Solar Panels (600W–650W)", battery: "1 × 324Ah",       good: "larger homes" },
  { key: "12kw", name: "12kW Hybrid Solar Package", kw: 12, price: 580000,
    inverter: "12KW Hybrid Inverter", panels: "18 Solar Panels (600W–650W)", battery: "1 × 324Ah",       good: "big households" },
  { key: "16kw", name: "16kW Hybrid Solar Package", kw: 16, price: 720000,
    inverter: "16KW Hybrid Inverter", panels: "27 Solar Panels (600W–650W)", battery: "1 × 324Ah",       good: "large homes" },
  { key: "18kw", name: "18kW Hybrid Solar Package", kw: 18, price: 820000,
    inverter: "18KW Hybrid Inverter", panels: "30 Solar Panels (600W–650W)", battery: "2 × 324Ah",       good: "very large homes" },
];

// Official SULAREX bill-based recommendation bands. NOTE: these ranges
// intentionally OVERLAP — when a bill falls in two bands, the assistant is
// meant to explain both options and recommend the best fit for the customer.
export const BILL_BANDS = [
  { min: 1000,  max: 5000,  label: "3kW Hybrid Solar Package",  keys: ["3kw"] },
  { min: 5000,  max: 10000, label: "6kW Hybrid Solar Package",  keys: ["6kw"] },
  { min: 8000,  max: 14000, label: "8kW Hybrid Solar Package",  keys: ["8kw"] },
  { min: 15000, max: 20000, label: "12kW Hybrid Solar Package", keys: ["12kw"] },
  { min: 20000, max: 25000, label: "16kW Hybrid Solar Package", keys: ["16kw"] },
  { min: 25000, max: 30000, label: "18kW Hybrid Solar Package", keys: ["18kw"] },
];

// Bills above this get a custom-designed system + site assessment (never a
// standard package).
export const COMMERCIAL_THRESHOLD = 30000;

export const COMMERCIAL_MESSAGE =
  "Your consumption is beyond our standard packages, so we'd recommend a custom-designed solar system. The best next step is a FREE on-site assessment so our engineering team can size it properly and give you an accurate proposal.";

export function getPackage(key) {
  return PACKAGES.find((p) => p.key === key) || null;
}

// Returns ALL bill bands the bill falls into (may be more than one, because
// ranges overlap). Ordered by system size, smallest first.
export function billBands(bill) {
  const b = Number(String(bill).replace(/[^\d.]/g, "")) || 0;
  if (b <= 0) return [];
  return BILL_BANDS.filter((band) => b >= band.min && b <= band.max);
}

// Convenience: the first matching band (smallest suitable system), or null.
export function billBand(bill) {
  return billBands(bill)[0] || null;
}

// Returns the primary recommended package object for a bill (smallest
// suitable). For bills above COMMERCIAL_THRESHOLD returns null (custom design).
export function recommendByBill(bill) {
  const b = Number(String(bill).replace(/[^\d.]/g, "")) || 0;
  if (b <= 0) return null;
  if (b > COMMERCIAL_THRESHOLD) return null;
  const band = billBand(b);
  return band ? getPackage(band.keys[0]) : null;
}

export function priceLabel(p) {
  if (!p) return "";
  return p.price ? "₱" + p.price.toLocaleString("en-PH") : "Custom quote";
}
