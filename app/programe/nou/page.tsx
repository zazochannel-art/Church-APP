import Link from "next/link";
import { Icon } from "@/components/Icon";
import { people } from "@/lib/data";
import { NewEventForm } from "./NewEventForm";

export const metadata = { title: "Program nou" };

export default function NewEvent() {
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
