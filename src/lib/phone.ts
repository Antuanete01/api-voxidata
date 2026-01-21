// src/lib/phone.ts
export function normalizePhoneForLinks(phone: string, defaultCountryCode = "51") {
  const raw = phone.trim();

  // deja solo + y números
  let digits = raw.replace(/[^\d+]/g, "");

  if (!digits) return { e164: "", wa: "" };

  // Si no tiene +, asumimos prefijo país
  if (!digits.startsWith("+")) {
    digits = digits.replace(/^0+/, "");
    digits = `+${defaultCountryCode}${digits}`;
  }

  // WhatsApp usa solo números sin +
  const wa = digits.replace(/^\+/, "");

  return { e164: digits, wa };
}
