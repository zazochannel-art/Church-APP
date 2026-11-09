import Link from "next/link";
import { Icon } from "@/components/Icon";
import { getPeople } from "@/lib/store";
import { NewEventForm } from "./NewEventForm";

export const metadata = { title: "Program nou" };

export default async function NewEvent() {
  const people = await getPeople();
  const organizers = people.filter((p) => p.group !== "Adolescenți").map((p) => p.name);
  return (
    <>
      <Link className="back" href="/programe">
        <Icon name="back" />
        Programe
      </Link>
      <h1>Program nou</h1>
      <NewEventForm organizers={organizers} />
    </>
  );
}
