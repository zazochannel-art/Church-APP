import { PageHeader } from "@/components/Bits";
import { getPeople, getVolunteers, getWeeks } from "@/lib/store";
import { Team } from "./Team";

export const metadata = { title: "Echipă" };

export default async function TeamPage() {
  const [weeks, volunteers, people] = await Promise.all([getWeeks(), getVolunteers(), getPeople()]);
  return (
    <>
      <PageHeader eyebrow="Oamenii din tineret" title="Echipă" />
      <Team weeks={weeks} volunteers={volunteers} people={people} />
    </>
  );
}
