"use client";

import { useState, useTransition } from "react";
import { Avatar, firstName } from "@/components/Avatar";
import { Icon } from "@/components/Icon";
import { useToast } from "@/components/Toast";
import { assignSlot, confirmSlot } from "@/lib/actions";
import type { Person, ServingWeek, Volunteer } from "@/lib/types";

type Week = ServingWeek & { id: string };

const SEGS = [
  ["slujire", "Slujire"],
  ["voluntari", "Voluntari"],
  ["tineri", "Tineri"],
] as const;
const DAYS = "LMMJVSD".split("");
const GROUPS = ["Toți", "Adolescenți", "Tineri", "Lideri"] as const;

export function Team({ weeks: initialWeeks, volunteers, people }: { weeks: Week[]; volunteers: Volunteer[]; people: Person[] }) {
  const toast = useToast();
  const [seg, setSeg] = useState<(typeof SEGS)[number][0]>("slujire");
  const [weeks, setWeeks] = useState(initialWeeks);
  const [week, setWeek] = useState(0);
  const [group, setGroup] = useState<(typeof GROUPS)[number]>("Toți");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [, start] = useTransition();

  const candidates = [...new Set([...people.map((p) => p.name), ...volunteers.map((v) => v.name)])];
  const free = (w: ServingWeek) => w.teams.reduce((a, t) => a + t.slots.filter((s) => !s.person).length, 0);
  const change = (ti: number, si: number, f: (s: ServingWeek["teams"][number]["slots"][number]) => typeof s) =>
    setWeeks((ws) =>
      ws.map((w, wi) => (wi !== week ? w : { ...w, teams: w.teams.map((t, i) => (i !== ti ? t : { ...t, slots: t.slots.map((s, j) => (j !== si ? s : f(s))) })) })),
    );
  const assign = (ti: number, si: number, name: string) => {
    change(ti, si, (s) => ({ ...s, person: name, status: "asteapta" }));
    start(() => assignSlot(weeks[week].id, ti, si, name));
    toast(`Cerere trimisă lui ${firstName(name)}`);
  };
  const unassign = (ti: number, si: number) => {
    change(ti, si, (s) => ({ ...s, person: null, status: undefined }));
    start(() => assignSlot(weeks[week].id, ti, si, null));
  };
  const confirm = (ti: number, si: number) => {
    change(ti, si, (s) => ({ ...s, status: s.status === "confirmat" ? "asteapta" : "confirmat" }));
    start(() => confirmSlot(weeks[week].id, ti, si));
  };
  const list = people.filter((p) => (group === "Toți" || p.group === group) && p.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <>
      <div className="gl seg" role="group" aria-label="Secțiuni echipă">
        {SEGS.map(([id, label]) => (
          <button key={id} type="button" aria-pressed={seg === id} onClick={() => setSeg(id)}>
            {label}
          </button>
        ))}
      </div>

      {seg === "slujire" && (
        <>
          <div className="chips">
            {weeks.map((w, i) => (
              <button key={w.label} className="chip" type="button" aria-pressed={week === i} onClick={() => setWeek(i)}>
                {w.label} · {free(w) ? `${free(w)} libere` : "complet"}
              </button>
            ))}
          </div>
          <div className="scols">
            {weeks[week].teams.map((t, ti) => (
              <div className="gl team" key={t.name}>
                <div className="row" style={{ marginBottom: 4 }}>
                  <h3>{t.name}</h3>
                  <span className="meta num">
                    {t.slots.filter((s) => s.person).length}/{t.slots.length}
                  </span>
                </div>
                {t.slots.map((s, si) => (
                  <div className="slot" key={`${t.name}-${s.role}`}>
                    <span className="r">{s.role}</span>
                    <div className="grow">
                      {s.person ? (
                        <>
                          <Avatar name={s.person} />
                          <span>{firstName(s.person)}</span>
                        </>
                      ) : (
                        <select aria-label={`Alege pentru ${t.name}, ${s.role}`} defaultValue="" onChange={(e) => e.target.value && assign(ti, si, e.target.value)}>
                          <option value="">+ Alege pe cineva</option>
                          {candidates.map((n) => (
                            <option key={n}>{n}</option>
                          ))}
                        </select>
                      )}
                    </div>
                    {s.person && (
                      <>
                        <button
                          type="button"
                          className={`status ${s.status === "confirmat" ? "ok" : "warn"}`}
                          aria-label={`${s.person}: ${s.status === "confirmat" ? "confirmat" : "așteaptă"}. Schimbă`}
                          onClick={() => confirm(ti, si)}
                        >
                          {s.status === "confirmat" ? "Confirmat" : "Așteaptă"}
                        </button>
                        <button className="iconx" type="button" aria-label={`Eliberează ${s.role}`} onClick={() => unassign(ti, si)}>
                          <Icon name="minus" width={2.4} />
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
          <button className="btn" type="button" style={{ alignSelf: "flex-start" }} onClick={() => toast("Programul a fost trimis echipelor")}>
            <Icon name="send" />
            Trimite programul echipelor
          </button>
        </>
      )}

      {seg === "voluntari" && (
        <>
          <div className="row">
            <span className="meta">Disponibilitate pe zile: L M M J V S D</span>
            <button className="btn sm" type="button" onClick={() => toast("Link de înscriere voluntari copiat")}>
              <Icon name="plus" width={2.2} />
              Invită voluntari
            </button>
          </div>
          <div className="gl mlist">
            {volunteers.map((v) => (
              <div className="mrow" key={v.id} style={{ cursor: "default" }}>
                <Avatar name={v.name} />
                <div className="grow">
                  <b>{v.name}</b>
                  <div className="skills">
                    {v.skills.map((s) => (
                      <span className="skill" key={s}>{s}</span>
                    ))}
                  </div>
                </div>
                <div className="avail" aria-label={`Disponibil: ${DAYS.filter((_, i) => v.availability[i]).join(", ")}`}>
                  {DAYS.map((d, i) => (
                    <i key={i} className={v.availability[i] ? "y" : ""}>{d}</i>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {seg === "tineri" && (
        <>
          <div className="search">
            <Icon name="search" />
            <input type="text" placeholder="Caută după nume" aria-label="Caută după nume" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <div className="chips">
            {GROUPS.map((g) => (
              <button key={g} className="chip" type="button" aria-pressed={group === g} onClick={() => setGroup(g)}>
                {g}
              </button>
            ))}
          </div>
          <div className="gl mlist">
            {list.length === 0 && <div className="meta" style={{ padding: "14px 0" }}>Nimeni cu acest nume.</div>}
            {list.map((p) => {
              const isOpen = open === p.id;
              return (
                <div key={p.id}>
                  <button className="mrow" type="button" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : p.id)}>
                    <Avatar name={p.name} />
                    <div className="grow">
                      <b>{p.name}</b>
                      <div className="meta">{p.group} · {p.age} ani</div>
                    </div>
                    <span className="meta">{isOpen ? "−" : "+"}</span>
                  </button>
                  {isOpen && (
                    <div className="mdetail">
                      <div><small>Telefon</small><span className="num">{p.phone}</span></div>
                      <div><small>Zi de naștere</small>{p.birthday}</div>
                      <div className="full"><small>Notițe pentru lideri</small>{p.note}</div>
                      <div className="acts">
                        <button className="btn ghost sm" type="button" onClick={() => { navigator.clipboard?.writeText(p.phone).catch(() => {}); toast(`Număr copiat: ${p.phone}`); }}>
                          <Icon name="phone" />
                          Copiază numărul
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}
