import { PageHeader } from "@/components/Bits";
import { audiences, messages } from "@/lib/data";
import { Messages } from "./Messages";

export const metadata = { title: "Mesaje" };

export default async function MessagesPage({ searchParams }: { searchParams: Promise<{ catre?: string }> }) {
  const { catre } = await searchParams;
  const initial = audiences.some((a) => a.name === catre) ? catre! : audiences[0].name;
  return (
    <>
      <PageHeader eyebrow="Comunicare" title="Mesaje" />
      <Messages audiences={audiences} initialSent={messages} initialAudience={initial} />
    </>
  );
}
