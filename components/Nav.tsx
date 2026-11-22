"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "./Icon";

const tabs: { href: string; label: string; icon: IconName }[] = [
  { href: "/", label: "Panou", icon: "dash" },
  { href: "/programe", label: "Programe", icon: "events" },
  { href: "/lauda", label: "Laudă", icon: "worship" },
  { href: "/echipa", label: "Echipă", icon: "people" },
  { href: "/mesaje", label: "Mesaje", icon: "msg" },
];
const extra: { href: string; label: string; icon: IconName } = { href: "/setari", label: "Setări", icon: "gear" };

export function Nav({ churchName }: { churchName: string }) {
  const path = usePathname();
  if (path === "/intrare") return null;
  const isActive = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));
  return (
    <nav className="tabs" aria-label="Meniu">
      <div className="brandbar">
        <b>Adunare</b>
        <span>Tineret · {churchName}</span>
      </div>
      {tabs.map((t) => (
        <Link key={t.href} href={t.href} className="tab" aria-current={isActive(t.href) ? "page" : undefined}>
          <Icon name={t.icon} />
          {t.label}
        </Link>
      ))}
      <Link href={extra.href} className="tab desk" aria-current={isActive(extra.href) ? "page" : undefined}>
        <Icon name={extra.icon} />
        {extra.label}
      </Link>
    </nav>
  );
}
