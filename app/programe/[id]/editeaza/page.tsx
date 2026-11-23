import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/Icon";
import { getEvent, getPeople } from "@/lib/store";
import { EventForm } from "../../nou/EventForm";

export const metadata = { title: "Modifică programul" };

export default async function EditEvent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [e, people] = await Promise.all([getEvent(id), getPeople()]);
  if (!e) notFound();
  return (
    <>
      <Link className="back" href={`/programe/${id}`}>
        <Icon name="back" />
        {e.name}
      </Link>
      <h1>Modifică programul</h1>
      <EventForm organizers={people.filter((p) => p.group !== "Adolescenți").map((p) => p.name)} event={e} />
    </>
  );
}
