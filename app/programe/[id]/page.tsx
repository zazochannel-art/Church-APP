import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/Icon";
import { getEvent, getPeople } from "@/lib/store";
import { EventTabs } from "./EventTabs";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return { title: (await getEvent(id))?.name ?? "Program" };
}

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [e, people] = await Promise.all([getEvent(id), getPeople()]);
  if (!e) notFound();
  const done = e.checklist.filter((c) => c.done).length;

  return (
    <>
      <Link className="back" href="/programe">
        <Icon name="back" />
        Programe
      </Link>
      <div>
        <span className="eyebrow">
          {e.when} · {e.where}
        </span>
        <h1 style={{ marginTop: 4 }}>{e.name}</h1>
      </div>
      <div className="kv">
        <div>
          <small>Înscriși</small>
          <b className="num">
            {e.going}
            {e.capacity ? `/${e.capacity}` : ""}
          </b>
        </div>
        <div>
          <small>Organizator</small>
          <b>{e.organizer.split(" ")[0]}</b>
        </div>
        <div>
          <small>{e.price ? "Preț" : "Pregătire"}</small>
          <b className="num">{e.price ?? `${done}/${e.checklist.length}`}</b>
        </div>
      </div>
      <EventTabs event={e} people={people.map((x) => x.name)} />
    </>
  );
}
