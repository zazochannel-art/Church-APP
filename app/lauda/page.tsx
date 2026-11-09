import { PageHeader } from "@/components/Bits";
import { fridaySetlist, songs } from "@/lib/data";
import { Worship } from "./Worship";

export const metadata = { title: "Laudă" };

export default function WorshipPage() {
  return (
    <>
      <PageHeader eyebrow="Laudă și închinare" title="Laudă" />
      <Worship library={songs} initialSet={fridaySetlist} band={["Eliza Toma", "Sara Ilie", "Timotei Vasile"]} />
    </>
  );
}
