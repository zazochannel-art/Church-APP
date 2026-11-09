import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/Icon";
import { eventById, events } from "@/lib/data";
import { EventTabs } from "./EventTabs";

export function generateStaticParams() {
  return events.map((e) => ({ id: e.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return { title: eventById(id)?.name ?? "Program" };
}

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const e = eventById(id);
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
      <EventTabs event={e} />
    </>
  );
}
