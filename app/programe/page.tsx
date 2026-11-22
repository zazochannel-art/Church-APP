import Link from "next/link";
import { EventCard, PageHeader } from "@/components/Bits";
import { Icon } from "@/components/Icon";
import { eventFlags, getEvents, sortEvents } from "@/lib/store";

export const metadata = { title: "Programe" };

export default async function Programs() {
  const { up, past } = sortEvents(await getEvents());
  return (
    <>
      <PageHeader
        eyebrow="Organizare"
        title="Programe"
        actions={
          <Link className="btn sm" href="/programe/nou">
            <Icon name="plus" width={2.2} />
            Nou
          </Link>
        }
      />
      <section>
        <h2>Urmează <span className="meta num">{up.length}</span></h2>
        {up.length === 0 && (
          <div className="gl panel empty">
            <span className="meta">Niciun program planificat.</span>
            <Link className="btn sm" href="/programe/nou"><Icon name="plus" width={2.2} />Program nou</Link>
          </div>
        )}
        <div className="egrid">
          {up.map((e) => (
            <EventCard key={e.id} event={e} flags={eventFlags(e)} />
          ))}
        </div>
      </section>
      {past.length > 0 && (
        <section className="past">
          <h2>Au trecut <span className="meta num">{past.length}</span></h2>
          <div className="egrid">
            {past.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
