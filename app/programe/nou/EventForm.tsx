"use client";

import Link from "next/link";
import { useState } from "react";
import { useFormStatus } from "react-dom";
import { createEvent, updateEventDetails } from "@/lib/actions";
import type { YouthEvent } from "@/lib/types";

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button className="btn" type="submit" disabled={pending}>
      {pending ? "Se salvează…" : label}
    </button>
  );
}

/** Used both for a new program and for editing one. */
export function EventForm({
  organizers,
  me = "",
  templates = [],
  event,
}: {
  organizers: string[];
  me?: string;
  templates?: { id: string; name: string; when: string }[];
  event?: YouthEvent;
}) {
  const [multi, setMulti] = useState(Boolean(event?.endDate));
  const list = event?.organizer && !organizers.includes(event.organizer) ? [event.organizer, ...organizers] : organizers;
  const action = event ? updateEventDetails.bind(null, event.id) : createEvent;
  return (
    <form className="gl panel formgrid" action={action}>
      <label className="f full" htmlFor="fname">
        Nume
        <input type="text" id="fname" name="name" placeholder="ex. Seară de jocuri" maxLength={120} required defaultValue={event?.name} />
      </label>
      <label className="f" htmlFor="fdate">
        {multi ? "Prima zi" : "Data"}
        <input type="date" id="fdate" name="date" required defaultValue={event?.date} />
      </label>
      <label className="f" htmlFor="ftime">
        Ora de început
        <input type="time" id="ftime" name="time" defaultValue={event?.time ?? "19:00"} />
      </label>
      {multi && (
        <label className="f" htmlFor="fend">
          Ultima zi
          <input type="date" id="fend" name="endDate" defaultValue={event?.endDate} />
        </label>
      )}
      <label className={`toggle ${multi ? "" : "full"}`} style={{ alignSelf: "end", paddingBottom: 12 }}>
        <input type="checkbox" checked={multi} onChange={(e) => setMulti(e.target.checked)} /> Durează mai multe zile (tabără, excursie)
      </label>
      <label className="f full" htmlFor="fwhere">
        Locul
        <input type="text" id="fwhere" name="where" placeholder="ex. Sala tinerilor" maxLength={80} defaultValue={event?.where === "De stabilit" ? "" : event?.where} />
      </label>
      <label className="f" htmlFor="fcap">
        Locuri (opțional)
        <input type="number" id="fcap" name="capacity" min={1} placeholder="nelimitat" defaultValue={event?.capacity ?? undefined} />
      </label>
      <label className="f" htmlFor="fprice">
        Preț (opțional)
        <input type="text" id="fprice" name="price" placeholder="ex. 150 lei" maxLength={20} defaultValue={event?.price} />
      </label>
      <label className="f full" htmlFor="forg">
        Organizator
        <select id="forg" name="organizer" defaultValue={event?.organizer ?? (list.includes(me) ? me : list[0])}>
          <option value="">Nimeni anume</option>
          {list.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </label>
      {!event && templates.length > 0 && (
        <label className="f full" htmlFor="fcopy">
          Pornește de la un program existent (opțional)
          <select id="fcopy" name="copyFrom" defaultValue="">
            <option value="">Program gol</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} · {t.when}
              </option>
            ))}
          </select>
          <span className="hint">Se copiază momentele programului și lista de pregătire, fără înscrieri.</span>
        </label>
      )}
      <div className="full row" style={{ justifyContent: "flex-end", gap: 8 }}>
        <Link className="btn ghost" href={event ? `/programe/${event.id}` : "/programe"}>
          Renunță
        </Link>
        <Submit label={event ? "Salvează" : "Creează programul"} />
      </div>
    </form>
  );
}
