import { PageHeader } from "@/components/Bits";
import { today } from "@/lib/dates";
import { getEvents, getRehearsal, getSetlist, getSongs, getWeeks, sortEvents } from "@/lib/store";
import { Worship } from "./Worship";

export const metadata = { title: "Laudă" };

export default async function WorshipPage() {
  const [songs, setlist, rehearsal, weeks, events] = await Promise.all([getSongs(), getSetlist(), getRehearsal(), getWeeks(), getEvents()]);
  const week = weeks.find((w) => !w.date || w.date >= today());
  const bandTeam = week?.teams.find((t) => /laud/i.test(t.name));
  const band = bandTeam?.slots.map((s) => ({ role: s.role, person: s.person })) ?? [];
  const next = sortEvents(events).up[0];
  return (
    <>
      <PageHeader eyebrow="Laudă și închinare" title="Laudă" />
      <Worship
        library={songs}
        initialSet={setlist}
        band={band}
        rehearsal={rehearsal}
        forLabel={next ? next.when : week?.label ?? "Următoarea întâlnire"}
      />
    </>
  );
}
