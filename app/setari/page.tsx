import { PageHeader } from "@/components/Bits";
import { passwordSet } from "@/lib/auth";
import { getChurch, getMe } from "@/lib/store";
import { Settings } from "./Settings";

export const metadata = { title: "Setări" };

export default async function SettingsPage() {
  const [{ name }, me] = await Promise.all([getChurch(), getMe()]);
  return (
    <>
      <PageHeader eyebrow="Aplicația" title="Setări" />
      <Settings church={name} me={me} hasPassword={passwordSet()} />
    </>
  );
}
