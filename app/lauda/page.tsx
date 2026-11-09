import { PageHeader } from "@/components/Bits";
import { getSetlist, getSongs } from "@/lib/store";
import { Worship } from "./Worship";

export const metadata = { title: "Laudă" };

export default async function WorshipPage() {
  const [songs, setlist] = await Promise.all([getSongs(), getSetlist()]);
  return (
    <>
      <PageHeader eyebrow="Laudă și închinare" title="Laudă" />
      <Worship library={songs} initialSet={setlist} band={["Eliza Toma", "Sara Ilie", "Timotei Vasile"]} />
    </>
  );
}
