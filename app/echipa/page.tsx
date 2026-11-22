import { PageHeader } from "@/components/Bits";
import { today } from "@/lib/dates";
import { getPeople, getVolunteers, getWeeks } from "@/lib/store";
import { Team } from "./Team";

export const metadata = { title: "Echipă" };

export default async function TeamPage() {
  const [weeks, volunteers, people] = await Promise.all([getWeeks(), getVolunteers(), getPeople()]);
  const now = today();
  // Past serving dates are hidden except the most recent one.
  const upcoming = weeks.filter((w) => !w.date || w.date >= now);
  const shown = upcoming.length ? upcoming : weeks.slice(-1);
  return (
    <>
      <PageHeader eyebrow="Oamenii din tineret" title="Echipă" />
      <Team weeks={shown} volunteers={volunteers} people={people} firstWeek={shown[0]?.id ?? ""} />
    </>
  );
}
