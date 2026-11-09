import { PageHeader } from "@/components/Bits";
import { people, serving, volunteers } from "@/lib/data";
import { Team } from "./Team";

export const metadata = { title: "Echipă" };

export default function TeamPage() {
  return (
    <>
      <PageHeader eyebrow="Oamenii din tineret" title="Echipă" />
      <Team weeks={serving} volunteers={volunteers} people={people} />
    </>
  );
}
