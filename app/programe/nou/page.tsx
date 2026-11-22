import Link from "next/link";
import { Icon } from "@/components/Icon";
import { getEvents, getMe, getPeople, sortEvents } from "@/lib/store";
import { EventForm } from "./EventForm";

export const metadata = { title: "Program nou" };

export default async function NewEvent() {
  const [people, events, me] = await Promise.all([getPeople(), getEvents(), getMe()]);
  const organizers = people.filter((p) => p.group !== "Adolescenți").map((p) => p.name);
  const { up, past } = sortEvents(events);
  return (
    <>
      <Link className="back" href="/programe">
        <Icon name="back" />
        Programe
      </Link>
      <h1>Program nou</h1>
      <EventForm organizers={organizers} me={me} templates={[...past, ...up].filter((e) => e.run.length).map((e) => ({ id: e.id, name: e.name, when: e.when }))} />
    </>
  );
}
