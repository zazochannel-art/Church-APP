// Date helpers shared by server and browser. Dates are stored as "YYYY-MM-DD".
export const MONTHS_SHORT = ["ian", "feb", "mar", "apr", "mai", "iun", "iul", "aug", "sep", "oct", "nov", "dec"];
export const MONTHS_LONG = ["ianuarie", "februarie", "martie", "aprilie", "mai", "iunie", "iulie", "august", "septembrie", "octombrie", "noiembrie", "decembrie"];
export const DAYS_LONG = ["Duminică", "Luni", "Marți", "Miercuri", "Joi", "Vineri", "Sâmbătă"];

export const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
export const parse = (s: string) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1, 12);
};
export const today = () => iso(new Date());

/** "Vineri, 28 nov" */
export const dayLabel = (s: string) => {
  const d = parse(s);
  return `${DAYS_LONG[d.getDay()]}, ${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
};

/** Next given weekday (0 = Sunday) on or after `from`. */
export function nextWeekday(day: number, from = new Date()) {
  const d = new Date(from.getFullYear(), from.getMonth(), from.getDate(), 12);
  d.setDate(d.getDate() + ((day - d.getDay() + 7) % 7));
  return d;
}

export const addDays = (s: string, n: number) => {
  const d = parse(s);
  d.setDate(d.getDate() + n);
  return iso(d);
};

/** Text shown on cards, e.g. "Vineri, 28 nov, 19:00" or "28 – 31 dec". */
export function whenText(date: string, time?: string, endDate?: string) {
  const d = parse(date);
  if (endDate && endDate > date) {
    const e = parse(endDate);
    return d.getMonth() === e.getMonth()
      ? `${d.getDate()} – ${e.getDate()} ${MONTHS_LONG[e.getMonth()]}`
      : `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]} – ${e.getDate()} ${MONTHS_SHORT[e.getMonth()]}`;
  }
  return `${dayLabel(date)}${time ? `, ${time}` : ""}`;
}

/** Birthday stored as "12 nov" → month index and day, or null. */
export function birthdayParts(b: string) {
  const [d, m] = b.trim().split(/\s+/);
  const alt = m === "noi" ? "nov" : m;
  const mi = MONTHS_SHORT.indexOf(alt?.toLowerCase());
  const day = Number(d);
  return mi >= 0 && day >= 1 && day <= 31 ? { month: mi, day } : null;
}

/** Age today from an ISO birth date. */
export function ageFrom(born: string, now = new Date()) {
  const b = parse(born);
  let a = now.getFullYear() - b.getFullYear();
  if (now.getMonth() < b.getMonth() || (now.getMonth() === b.getMonth() && now.getDate() < b.getDate())) a--;
  return a;
}
export const birthdayFrom = (born: string) => {
  const b = parse(born);
  return `${b.getDate()} ${MONTHS_SHORT[b.getMonth()]}`;
};
