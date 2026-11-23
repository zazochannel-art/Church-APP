import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/Icon";
import { getEvent, getPeople } from "@/lib/store";
import { DeleteEvent } from "./DeleteEvent";
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
  const paid = e.signups.filter((s) => s.paid).length;

  return (
    <>
      <Link className="back" href="/programe">
        <Icon name="back" />
        Programe
      </Link>
      <div className="row" style={{ alignItems: "flex-end", flexWrap: "wrap" }}>
        <div style={{ minWidth: 0 }}>
          <span className="eyebrow">
            {e.when} · {e.where}
          </span>
          <h1 style={{ marginTop: 4 }}>{e.name}</h1>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <Link className="btn ghost sm" href={`/programe/${e.id}/editeaza`}>
            <Icon name="edit" />
            Modifică
          </Link>
          <DeleteEvent id={e.id} />
        </div>
      </div>
      <div className="kv">
        <div>
          <small>Înscriși</small>
          <b className="num">
            {e.signups.length}
            {e.capacity ? `/${e.capacity}` : ""}
          </b>
        </div>
        <div>
          <small>{e.price ? `Plătit · ${e.price}` : "Organizator"}</small>
          <b className="num">{e.price ? `${paid}/${e.signups.length}` : e.organizer ? e.organizer.split(" ")[0] : "–"}</b>
        </div>
        <div>
          <small>Pregătire</small>
          <b className="num">{e.checklist.length ? `${done}/${e.checklist.length}` : "–"}</b>
        </div>
      </div>
      <EventTabs event={e} people={people.map((x) => x.name)} />
    </>
  );
}
