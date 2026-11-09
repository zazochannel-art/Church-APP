"use client";

import Link from "next/link";
import { useFormStatus } from "react-dom";
import { createEvent } from "@/lib/actions";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button className="btn" type="submit" disabled={pending}>
      {pending ? "Se salvează…" : "Creează programul"}
    </button>
  );
}

export function NewEventForm({ organizers }: { organizers: string[] }) {
  return (
    <form className="gl panel formgrid" action={createEvent}>
      <label className="f full" htmlFor="fname">
        Nume
        <input type="text" id="fname" name="name" placeholder="ex. Seară de jocuri" maxLength={120} required />
      </label>
      <label className="f" htmlFor="fdate">
        Data
        <input type="date" id="fdate" name="date" required />
      </label>
      <label className="f" htmlFor="ftime">
        Ora
        <input type="time" id="ftime" name="time" defaultValue="19:00" />
      </label>
      <label className="f full" htmlFor="fwhere">
        Locul
        <input type="text" id="fwhere" name="where" placeholder="ex. Sala tinerilor" maxLength={80} />
      </label>
      <label className="f" htmlFor="fcap">
        Locuri (opțional)
        <input type="number" id="fcap" name="capacity" min={1} placeholder="nelimitat" />
      </label>
      <label className="f" htmlFor="fprice">
        Preț (opțional)
        <input type="text" id="fprice" name="price" placeholder="ex. 150 lei" maxLength={20} />
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
        <Submit />
      </div>
    </form>
  );
}
