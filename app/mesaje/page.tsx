import { PageHeader } from "@/components/Bits";
import { getAudiences, getMessages } from "@/lib/store";
import { Messages } from "./Messages";

export const metadata = { title: "Mesaje" };

export default async function MessagesPage({ searchParams }: { searchParams: Promise<{ catre?: string }> }) {
  const [{ catre }, audiences, messages] = await Promise.all([searchParams, getAudiences(), getMessages()]);
  const initial = audiences.some((a) => a.name === catre) ? catre! : audiences[0].name;
  return (
    <>
      <PageHeader eyebrow="Comunicare" title="Mesaje" />
      <Messages audiences={audiences} initialSent={messages} initialAudience={initial} />
    </>
  );
}
