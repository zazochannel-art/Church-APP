// Links that hand a text to WhatsApp or SMS on the leader's phone.
export const waText = (text: string) => `https://wa.me/?text=${encodeURIComponent(text)}`;

/** "0721 334 120" → "40721334120" (Romanian numbers), otherwise digits as typed. */
export function intlPhone(phone: string) {
  const d = phone.replace(/[^\d+]/g, "");
  if (d.startsWith("+")) return d.slice(1);
  if (d.startsWith("00")) return d.slice(2);
  if (d.startsWith("0")) return `40${d.slice(1)}`;
  return d;
}
export const waTo = (phone: string, text: string) => `https://wa.me/${intlPhone(phone)}?text=${encodeURIComponent(text)}`;
