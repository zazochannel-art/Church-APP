"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";

export function NewEventForm({ organizers }: { organizers: string[] }) {
  const toast = useToast();
  const router = useRouter();
  return (
    <form
      className="gl panel formgrid"
      onSubmit={(ev) => {
        ev.preventDefault();
        const name = String(new FormData(ev.currentTarget).get("name") ?? "").trim();
        if (!name) return toast("Scrie numele programului");
        // Saving arrives with the database; for now confirm and go back.
        toast(`„${name}” va fi salvat după ce conectăm baza de date`);
        router.push("/programe");
      }}
    >
      <label className="f full" htmlFor="fname">
        Nume
        <input type="text" id="fname" name="name" placeholder="ex. Seară de jocuri" required />
      </label>
      <label className="f" htmlFor="fdate">
        Data
        <input type="date" id="fdate" name="date" />
      </label>
      <label className="f" htmlFor="fcap">
        Locuri (opțional)
        <input type="number" id="fcap" name="capacity" min={1} placeholder="nelimitat" />
      </label>
      <label className="f full" htmlFor="fwhere">
        Locul
        <input type="text" id="fwhere" name="where" placeholder="ex. Sala tinerilor" />
      </label>
      <label className="f full" htmlFor="forg">
        Organizator
        <select id="forg" name="organizer">
          {organizers.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </label>
      <div className="full row" style={{ justifyContent: "flex-end", gap: 8 }}>
        <Link className="btn ghost" href="/programe">
          Renunță
        </Link>
        <button className="btn" type="submit">
          Creează și anunță
        </button>
      </div>
    </form>
  );
}
