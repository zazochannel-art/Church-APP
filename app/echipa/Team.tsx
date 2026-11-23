"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Avatar, firstName } from "@/components/Avatar";
import { ConfirmButton } from "@/components/ConfirmButton";
import { Icon } from "@/components/Icon";
import { useToast } from "@/components/Toast";
import {
  addSlot,
  addWeek,
  assignSlot,
  confirmSlot,
  deletePerson,
  deleteVolunteer,
  deleteWeek,
  removeSlot,
  savePerson,
  saveVolunteer,
} from "@/lib/actions";
import { waTo } from "@/lib/share";
import type { Person, ServingWeek, Volunteer } from "@/lib/types";

type Week = ServingWeek & { id: string };

const SEGS = [
  ["slujire", "Slujire"],
  ["voluntari", "Voluntari"],
  ["tineri", "Tineri"],
] as const;
const DAYS = "LMMJVSD".split("");
const DAY_NAMES = ["Luni", "Marți", "Miercuri", "Joi", "Vineri", "Sâmbătă", "Duminică"];
const GROUPS = ["Toți", "Adolescenți", "Tineri", "Lideri"] as const;

/* ---------- serving ---------- */

function Serving({ weeks, candidates, firstWeek }: { weeks: Week[]; candidates: string[]; firstWeek: string }) {
  const toast = useToast();
  const [weekId, setWeekId] = useState(firstWeek);
  const [newDate, setNewDate] = useState("");
  const [addingTo, setAddingTo] = useState<number | null>(null);
  const [role, setRole] = useState("");
  const [pending, start] = useTransition();
  const week = weeks.find((w) => w.id === weekId) ?? weeks[0];
  const free = (w: ServingWeek) => w.teams.reduce((a, t) => a + t.slots.filter((s) => !s.person).length, 0);
  const summary = week
    ? [
        `Programul de slujire · ${week.label}`,
        ...week.teams.map((t) => `${t.name}: ${t.slots.map((s) => `${s.role} ${s.person ?? "(liber)"}`).join(", ")}`),
        "Vă rog confirmați. Mulțumim că slujiți!",
      ].join("\n")
    : "";

  return (
    <>
      <div className="chips">
        {weeks.map((w) => (
          <button key={w.id} className="chip" type="button" aria-pressed={week?.id === w.id} onClick={() => setWeekId(w.id)}>
            {w.label} · {free(w) ? `${free(w)} libere` : "complet"}
          </button>
        ))}
      </div>
      <form
        className="row newweek"
        onSubmit={(e) => {
          e.preventDefault();
          start(async () => {
            const id = await addWeek(newDate);
            if (!id) return toast("Data aceasta există deja");
            setWeekId(id);
            setNewDate("");
            toast("Dată nouă adăugată, cu aceleași posturi");
          });
        }}
      >
        <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} aria-label="Data nouă de slujire" />
        <button className="btn ghost sm" type="submit" disabled={pending}>
          <Icon name="plus" width={2.2} />
          {newDate ? "Adaugă data" : "Săptămâna următoare"}
        </button>
      </form>

      {!week && <div className="gl panel meta">Nicio dată de slujire. Adaugă una mai sus.</div>}
      {week && (
        <>
          <div className="scols">
            {week.teams.map((t, ti) => (
              <div className="gl team" key={`${week.id}-${ti}-${t.name}`}>
                <div className="row" style={{ marginBottom: 4 }}>
                  <h3>{t.name}</h3>
                  <span className="meta num">
                    {t.slots.filter((s) => s.person).length}/{t.slots.length}
                  </span>
                </div>
                {t.slots.map((s, si) => (
                  <div className="slot" key={`${si}-${s.role}`}>
                    <span className="r">{s.role}</span>
                    <div className="grow">
                      {s.person ? (
                        <>
                          <Avatar name={s.person} />
                          <span>{firstName(s.person)}</span>
                        </>
                      ) : (
                        <select
                          aria-label={`Alege pentru ${t.name}, ${s.role}`}
                          value=""
                          onChange={(e) => {
                            const name = e.target.value;
                            if (!name) return;
                            start(() => assignSlot(week.id, ti, si, name));
                            toast(`${firstName(name)} pus la ${s.role}. Așteaptă confirmarea.`);
                          }}
                        >
                          <option value="">+ Alege pe cineva</option>
                          {candidates.map((n) => (
                            <option key={n}>{n}</option>
                          ))}
                        </select>
                      )}
                    </div>
                    {s.person ? (
                      <>
                        <button
                          type="button"
                          className={`status ${s.status === "confirmat" ? "ok" : "warn"}`}
                          aria-label={`${s.person}: ${s.status === "confirmat" ? "confirmat" : "așteaptă"}. Schimbă`}
                          onClick={() => start(() => confirmSlot(week.id, ti, si))}
                        >
                          {s.status === "confirmat" ? "Confirmat" : "Așteaptă"}
                        </button>
                        <button className="iconx" type="button" aria-label={`Eliberează ${s.role}`} onClick={() => start(() => assignSlot(week.id, ti, si, null))}>
                          <Icon name="minus" width={2.4} />
                        </button>
                      </>
                    ) : (
                      <button className="iconx" type="button" aria-label={`Scoate postul ${s.role}`} onClick={() => start(() => removeSlot(week.id, ti, si))}>
                        <Icon name="trash" width={2} />
                      </button>
                    )}
                  </div>
                ))}
                {addingTo === ti ? (
                  <form
                    className="addrow"
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!role.trim()) return;
                      start(() => addSlot(week.id, ti, role));
                      setRole("");
                      setAddingTo(null);
                    }}
                  >
                    <input type="text" value={role} onChange={(e) => setRole(e.target.value)} placeholder="Post nou (ex. Bas)" aria-label="Post nou" autoFocus maxLength={40} />
                    <button className="btn ghost sm" type="submit">Adaugă</button>
                  </form>
                ) : (
                  <button className="link" type="button" style={{ alignSelf: "flex-start", marginTop: 6 }} onClick={() => { setAddingTo(ti); setRole(""); }}>
                    + Post nou
                  </button>
                )}
              </div>
            ))}
            <div className="gl team">
              {addingTo === week.teams.length ? (
                <form
                  className="addrow"
                  style={{ borderTop: 0 }}
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!role.trim()) return;
                    start(() => addSlot(week.id, week.teams.length, role));
                    setRole("");
                    setAddingTo(null);
                  }}
                >
                  <input type="text" value={role} onChange={(e) => setRole(e.target.value)} placeholder="Echipă nouă (ex. Copii)" aria-label="Echipă nouă" autoFocus maxLength={40} />
                  <button className="btn ghost sm" type="submit">Adaugă</button>
                </form>
              ) : (
                <button className="link" type="button" style={{ alignSelf: "flex-start" }} onClick={() => { setAddingTo(week.teams.length); setRole(""); }}>
                  + Echipă nouă
                </button>
              )}
            </div>
          </div>
          <div className="row" style={{ justifyContent: "flex-start", gap: 8, flexWrap: "wrap" }}>
            <Link className="btn" href={`/mesaje?catre=${encodeURIComponent("Voluntari")}&text=${encodeURIComponent(summary)}`}>
              <Icon name="send" />
              Trimite programul echipelor
            </Link>
            <ConfirmButton label={`Șterge data ${week.label}`} confirmText="Sigur? Șterge data" onConfirm={() => start(() => deleteWeek(week.id))}>
              <Icon name="trash" />
              Șterge data
            </ConfirmButton>
          </div>
        </>
      )}
    </>
  );
}

/* ---------- volunteers ---------- */

function VolunteerForm({ v, onDone }: { v?: Volunteer; onDone: () => void }) {
  const [avail, setAvail] = useState<boolean[]>(v?.availability ?? [false, false, false, false, true, true, false]);
  const [pending, start] = useTransition();
  const toast = useToast();
  return (
    <form
      className="addform"
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        start(async () => {
          const saved = await saveVolunteer(v?.id ?? null, { name: String(f.get("name") ?? ""), skills: String(f.get("skills") ?? ""), availability: avail });
          if (saved) {
            toast(v ? "Voluntar salvat" : `${firstName(saved.name)} a fost adăugat`);
            onDone();
          }
        });
      }}
    >
      <input name="name" type="text" placeholder="Nume și prenume" aria-label="Nume" required autoFocus maxLength={80} defaultValue={v?.name} />
      <input name="skills" type="text" placeholder="Ce poate face, despărțit prin virgulă (ex. Sunet, Șofer)" aria-label="Abilități" maxLength={300} defaultValue={v?.skills.join(", ")} />
      <div className="avail pick" role="group" aria-label="Disponibil în zilele">
        {DAYS.map((d, i) => (
          <button key={i} type="button" className={avail[i] ? "y" : ""} aria-pressed={avail[i]} aria-label={DAY_NAMES[i]} onClick={() => setAvail((a) => a.map((x, j) => (j === i ? !x : x)))}>
            {d}
          </button>
        ))}
      </div>
      <div className="row" style={{ justifyContent: "flex-end", gap: 8 }}>
        <button className="btn ghost sm" type="button" onClick={onDone}>Renunță</button>
        <button className="btn sm" type="submit" disabled={pending}>Salvează</button>
      </div>
    </form>
  );
}

function Volunteers({ volunteers }: { volunteers: Volunteer[] }) {
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [skill, setSkill] = useState("");
  const [, start] = useTransition();
  const skills = [...new Set(volunteers.flatMap((v) => v.skills))].sort((a, b) => a.localeCompare(b, "ro"));
  const list = skill ? volunteers.filter((v) => v.skills.includes(skill)) : volunteers;
  return (
    <>
      <div className="row">
        <span className="meta">Disponibilitate pe zile: L M M J V S D</span>
        <button className="btn sm" type="button" onClick={() => { setAdding((a) => !a); setEditing(null); }}>
          <Icon name="plus" width={2.2} />
          Voluntar nou
        </button>
      </div>
      {skills.length > 0 && (
        <div className="chips">
          <button className="chip" type="button" aria-pressed={!skill} onClick={() => setSkill("")}>Toți</button>
          {skills.map((s) => (
            <button key={s} className="chip" type="button" aria-pressed={skill === s} onClick={() => setSkill(s)}>{s}</button>
          ))}
        </div>
      )}
      <div className="gl mlist">
        {adding && <VolunteerForm onDone={() => setAdding(false)} />}
        {list.length === 0 && !adding && <div className="meta" style={{ padding: "14px 0" }}>Niciun voluntar încă.</div>}
        {list.map((v) =>
          editing === v.id ? (
            <div key={v.id}>
              <VolunteerForm v={v} onDone={() => setEditing(null)} />
              <div className="row" style={{ justifyContent: "flex-end", paddingBottom: 10 }}>
                <ConfirmButton label={`Șterge pe ${v.name}`} confirmText="Sigur? Șterge" onConfirm={() => { setEditing(null); start(() => deleteVolunteer(v.id)); }}>
                  <Icon name="trash" />
                  Șterge voluntarul
                </ConfirmButton>
              </div>
            </div>
          ) : (
            <button className="mrow" key={v.id} type="button" onClick={() => { setEditing(v.id); setAdding(false); }} aria-label={`Modifică ${v.name}`}>
              <Avatar name={v.name} />
              <div className="grow">
                <b>{v.name}</b>
                <div className="skills">
                  {v.skills.map((s) => (
                    <span className="skill" key={s}>{s}</span>
                  ))}
                </div>
              </div>
              <div className="avail" aria-label={`Disponibil: ${DAY_NAMES.filter((_, i) => v.availability[i]).join(", ") || "nicio zi"}`}>
                {DAYS.map((d, i) => (
                  <i key={i} className={v.availability[i] ? "y" : ""}>{d}</i>
                ))}
              </div>
            </button>
          ),
        )}
      </div>
    </>
  );
}

/* ---------- people ---------- */

function PersonForm({ p, onDone }: { p?: Person; onDone: () => void }) {
  const [pending, start] = useTransition();
  const toast = useToast();
  return (
    <form
      className="addform personform"
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        start(async () => {
          const saved = await savePerson(p?.id ?? null, f);
          if (saved) {
            toast(p ? "Salvat" : `${firstName(saved.name)} a fost adăugat`);
            onDone();
          }
        });
      }}
    >
      <input name="name" type="text" placeholder="Nume și prenume" aria-label="Nume" required autoFocus maxLength={80} defaultValue={p?.name} />
      <div className="two">
        <select name="group" aria-label="Grupa" defaultValue={p?.group ?? "Tineri"}>
          {GROUPS.slice(1).map((g) => (
            <option key={g}>{g}</option>
          ))}
        </select>
        <input name="phone" type="tel" placeholder="Telefon" aria-label="Telefon" maxLength={30} defaultValue={p?.phone} />
      </div>
      <div className="two">
        <label className="f">
          Data nașterii
          <input name="born" type="date" defaultValue={p?.born} />
        </label>
        {p && (
          <>
            <input type="hidden" name="age" value={p.age} />
            <input type="hidden" name="birthday" value={p.birthday} />
          </>
        )}
        <span className="hint" style={{ alignSelf: "end", paddingBottom: 10 }}>
          {p && !p.born ? `Acum: ${p.birthday}, ${p.age} ani` : "Vârsta și ziua de naștere se calculează singure"}
        </span>
      </div>
      <textarea name="note" placeholder="Notițe pentru lideri (pentru ce să ne rugăm, ce talente are…)" aria-label="Notițe" maxLength={1000} defaultValue={p?.note} style={{ minHeight: 80 }} />
      <div className="row" style={{ justifyContent: "flex-end", gap: 8 }}>
        <button className="btn ghost sm" type="button" onClick={onDone}>Renunță</button>
        <button className="btn sm" type="submit" disabled={pending}>Salvează</button>
      </div>
    </form>
  );
}

function People({ people }: { people: Person[] }) {
  const toast = useToast();
  const [group, setGroup] = useState<(typeof GROUPS)[number]>("Toți");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [, start] = useTransition();
  const list = people.filter((p) => (group === "Toți" || p.group === group) && p.name.toLowerCase().includes(query.toLowerCase()));
  const count = (g: (typeof GROUPS)[number]) => (g === "Toți" ? people.length : people.filter((p) => p.group === g).length);
  return (
    <>
      <div className="row" style={{ gap: 8 }}>
        <div className="search grow">
          <Icon name="search" />
          <input type="text" placeholder="Caută după nume" aria-label="Caută după nume" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <button className="btn sm" type="button" onClick={() => { setAdding((a) => !a); setEditing(null); }}>
          <Icon name="plus" width={2.2} />
          Persoană nouă
        </button>
      </div>
      <div className="chips">
        {GROUPS.map((g) => (
          <button key={g} className="chip" type="button" aria-pressed={group === g} onClick={() => setGroup(g)}>
            {g} <span className="num" style={{ opacity: 0.6 }}>{count(g)}</span>
          </button>
        ))}
      </div>
      <div className="gl mlist">
        {adding && <PersonForm onDone={() => setAdding(false)} />}
        {list.length === 0 && !adding && <div className="meta" style={{ padding: "14px 0" }}>{people.length ? "Nimeni cu acest nume." : "Adaugă primii tineri cu „Persoană nouă”."}</div>}
        {list.map((p) => {
          const isOpen = open === p.id;
          if (editing === p.id)
            return (
              <div key={p.id}>
                <PersonForm p={p} onDone={() => setEditing(null)} />
                <div className="row" style={{ justifyContent: "flex-end", paddingBottom: 10 }}>
                  <ConfirmButton
                    label={`Șterge pe ${p.name}`}
                    confirmText="Sigur? Șterge"
                    onConfirm={() => {
                      setEditing(null);
                      start(() => deletePerson(p.id));
                      toast(`${firstName(p.name)} a fost șters din listă`);
                    }}
                  >
                    <Icon name="trash" />
                    Șterge din listă
                  </ConfirmButton>
                </div>
              </div>
            );
          return (
            <div key={p.id}>
              <button className="mrow" type="button" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : p.id)}>
                <Avatar name={p.name} />
                <div className="grow">
                  <b>{p.name}</b>
                  <div className="meta">{p.group}{p.age ? ` · ${p.age} ani` : ""}</div>
                </div>
                <span className="meta">{isOpen ? "−" : "+"}</span>
              </button>
              {isOpen && (
                <div className="mdetail">
                  <div><small>Telefon</small><span className="num">{p.phone || "–"}</span></div>
                  <div><small>Zi de naștere</small>{p.birthday || "–"}</div>
                  <div className="full"><small>Notițe pentru lideri</small>{p.note || "–"}</div>
                  <div className="acts">
                    {p.phone && (
                      <>
                        <a className="btn ghost sm" href={`tel:${p.phone.replace(/\s/g, "")}`}>
                          <Icon name="phone" />
                          Sună
                        </a>
                        <a className="btn ghost sm" href={waTo(p.phone, `Salut, ${firstName(p.name)}!`)} target="_blank" rel="noreferrer">
                          <Icon name="chat" />
                          WhatsApp
                        </a>
                      </>
                    )}
                    <button className="btn ghost sm" type="button" onClick={() => { setEditing(p.id); setAdding(false); }}>
                      <Icon name="edit" />
                      Modifică
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

export function Team({ weeks, volunteers, people, firstWeek }: { weeks: Week[]; volunteers: Volunteer[]; people: Person[]; firstWeek: string }) {
  const [seg, setSeg] = useState<(typeof SEGS)[number][0]>("slujire");
  const candidates = [...new Set([...people.map((p) => p.name), ...volunteers.map((v) => v.name)])].sort((a, b) => a.localeCompare(b, "ro"));
  return (
    <>
      <div className="gl seg" role="group" aria-label="Secțiuni echipă">
        {SEGS.map(([id, label]) => (
          <button key={id} type="button" aria-pressed={seg === id} onClick={() => setSeg(id)}>
            {label}
          </button>
        ))}
      </div>
      {seg === "slujire" && <Serving weeks={weeks} candidates={candidates} firstWeek={firstWeek} />}
      {seg === "voluntari" && <Volunteers volunteers={volunteers} />}
      {seg === "tineri" && <People people={people} />}
    </>
  );
}
