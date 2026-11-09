import Link from "next/link";
import { EventCard, PageHeader } from "@/components/Bits";
import { Icon } from "@/components/Icon";
import { getEvents } from "@/lib/store";

export const metadata = { title: "Programe" };

export default async function Programs() {
  const events = await getEvents();
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
      <div className="egrid">
        {events.map((e) => (
          <EventCard key={e.id} event={e} />
        ))}
      </div>
    </>
  );
}
