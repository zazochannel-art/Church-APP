"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Avatar } from "@/components/Avatar";
import { KIND, RunSheet } from "@/components/Bits";
import { Icon } from "@/components/Icon";
import { useToast } from "@/components/Toast";
import {
  addEventCheck,
  addRunItem,
  addSignup,
  moveRunItem,
  removeEventCheck,
  removeRunItem,
  removeSignup,
  toggleEventCheck,
  togglePaid,
  updateRunItem,
} from "@/lib/actions";
import type { RunItem, RunKind, YouthEvent } from "@/lib/types";

const TABS = [
  ["program", "Program"],
  ["inscrisi", "Înscriși"],
  ["pregatire", "Pregătire"],
] as const;

function RunForm({
  people,
  initial,
  onSave,
  onCancel,
  pending,
  saveLabel,
}: {
  people: string[];
  initial?: RunItem;
  onSave: (item: { title: string; minutes: number; kind: RunKind; lead: string }) => void;
  onCancel: () => void;
  pending: boolean;
  saveLabel: string;
}) {
  const leads = initial?.lead && !people.includes(initial.lead) ? [initial.lead, ...people] : people;
  return (
    <form
      className="gl panel addform"
      onSubmit={(ev) => {
        ev.preventDefault();
        const f = new FormData(ev.currentTarget);
        const item = {
          title: String(f.get("title") ?? ""),
          minutes: Number(f.get("minutes")),
          kind: String(f.get("kind")) as RunKind,
          lead: String(f.get("lead") ?? ""),
        };
        if (item.title.trim()) onSave(item);
      }}
    >
      <input name="title" type="text" placeholder="Ce se întâmplă (ex. Mărturie)" aria-label="Titlul momentului" autoFocus required maxLength={120} defaultValue={initial?.title} />
      <div className="two">
        <label className="f">
          Minute
          <input name="minutes" type="number" min={1} max={600} defaultValue={initial?.minutes ?? 10} />
        </label>
        <label className="f">
          Tip
          <select name="kind" defaultValue={initial?.kind ?? "altele"}>
            {Object.entries(KIND).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </label>
      </div>
      <label className="f">
        Cine se ocupă
        <select name="lead" defaultValue={initial?.lead ?? ""}>
          <option value="">Nimeni anume</option>
          {leads.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>
      </label>
      <div className="row" style={{ justifyContent: "flex-end", gap: 8 }}>
        <button className="btn ghost sm" type="button" onClick={onCancel}>Renunță</button>
        <button className="btn sm" type="submit" disabled={pending}>{saveLabel}</button>
      </div>
    </form>
  );
}

export function EventTabs({ event: e, people }: { event: YouthEvent; people: string[] }) {
  const toast = useToast();
  const [tab, setTab] = useState<(typeof TABS)[number][0]>("program");
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [who, setWho] = useState("");
  const [check, setCheck] = useState("");
  const [pending, start] = useTransition();
  const unpaid = e.signups.filter((s) => s.paid === false);
  const notSigned = people.filter((p) => !e.signups.some((s) => s.name === p));
  const audience = `Înscriși · ${e.name}`;
  const reminder = `Reminder: ${e.name}, ${e.when}, ${e.where}. Vă așteptăm!`;
  const payReminder = `Reminder plată pentru ${e.name} (${e.price}). Încă nu am primit plata de la: ${unpaid.map((s) => s.name).join(", ")}. Mulțumim!`;

  return (
    <>
      <div className="gl seg" role="group" aria-label="Secțiuni program">
        {TABS.map(([id, label]) => (
          <button key={id} type="button" aria-pressed={tab === id} onClick={() => setTab(id)}>
            {label}
          </button>
        ))}
      </div>

      {tab === "program" && (
        <section>
          <RunSheet
            event={e}
            actions={(i) => (
              <>
                <button className="iconx" type="button" aria-label="Mută mai sus" disabled={i === 0 || pending} onClick={() => start(() => moveRunItem(e.id, i, -1))}>
                  <Icon name="up" width={2.2} />
                </button>
                <button className="iconx" type="button" aria-label="Mută mai jos" disabled={i === e.run.length - 1 || pending} onClick={() => start(() => moveRunItem(e.id, i, 1))}>
                  <Icon name="down" width={2.2} />
                </button>
                <button className="iconx" type="button" aria-label={`Modifică „${e.run[i].title}”`} onClick={() => { setEditing(i); setAdding(false); }}>
                  <Icon name="edit" width={2} />
                </button>
                <button className="iconx" type="button" aria-label={`Scoate „${e.run[i].title}”`} disabled={pending} onClick={() => start(() => removeRunItem(e.id, i))}>
                  <Icon name="trash" width={2} />
                </button>
              </>
            )}
          />
          {editing !== null && e.run[editing] && (
            <RunForm
              key={editing}
              people={people}
              initial={e.run[editing]}
              pending={pending}
              saveLabel="Salvează"
              onCancel={() => setEditing(null)}
              onSave={(item) =>
                start(async () => {
                  await updateRunItem(e.id, editing, item);
                  setEditing(null);
                  toast("Moment modificat");
                })
              }
            />
          )}
          {adding ? (
            <RunForm
              people={people}
              pending={pending}
              saveLabel="Adaugă"
              onCancel={() => setAdding(false)}
              onSave={(item) =>
                start(async () => {
                  await addRunItem(e.id, item);
                  setAdding(false);
                  toast("Moment adăugat în program");
                })
              }
            />
          ) : (
            editing === null && (
              <button className="btn ghost sm" type="button" onClick={() => setAdding(true)} style={{ alignSelf: "flex-start" }}>
                <Icon name="plus" width={2.2} />
                Adaugă un moment
              </button>
            )
          )}
        </section>
      )}

      {tab === "inscrisi" && (
        <section>
          <h2>
            {e.signups.length} înscriși {e.price && <span className="meta">Atinge statusul ca să marchezi plata</span>}
          </h2>
          <div className="gl slist">
            {e.signups.length === 0 && <div className="srow meta">Nimeni înscris încă.</div>}
            {e.signups.map((s) => (
              <div className="srow" key={s.name}>
                <Avatar name={s.name} />
                <div className="grow">{s.name}</div>
                {e.price ? (
                  <button
                    type="button"
                    className={`status ${s.paid ? "ok" : "warn"}`}
                    aria-label={`${s.name}: ${s.paid ? "plătit" : "neplătit"}. Schimbă`}
                    onClick={() => start(() => togglePaid(e.id, s.name))}
                  >
                    {s.paid ? "Plătit" : "Neplătit"}
                  </button>
                ) : (
                  <span className="status ok">Vine</span>
                )}
                <button className="iconx" type="button" aria-label={`Scoate pe ${s.name}`} onClick={() => start(() => removeSignup(e.id, s.name))}>
                  <Icon name="minus" width={2.4} />
                </button>
              </div>
            ))}
            <form
              className="addrow"
              onSubmit={(ev) => {
                ev.preventDefault();
                const name = who.trim();
                if (!name) return;
                if (e.capacity && e.signups.length >= e.capacity) toast("Atenție: s-au depășit locurile");
                setWho("");
                start(() => addSignup(e.id, name));
              }}
            >
              <input
                list={`ppl-${e.id}`}
                value={who}
                onChange={(ev) => setWho(ev.target.value)}
                placeholder="Înscrie pe cineva (din listă sau un nume nou)"
                aria-label="Înscrie pe cineva"
                maxLength={80}
              />
              <datalist id={`ppl-${e.id}`}>
                {notSigned.map((p) => (
                  <option key={p} value={p} />
                ))}
              </datalist>
              <button className="btn ghost sm" type="submit" disabled={pending}>
                <Icon name="plus" width={2.2} />
                Înscrie
              </button>
            </form>
          </div>
        </section>
      )}

      {tab === "pregatire" && (
        <section>
          <h2>
            Pregătire <span className="meta num">{e.checklist.filter((c) => !c.done).length} rămase</span>
          </h2>
          <div className="gl tasks">
            {e.checklist.length === 0 && <div className="meta" style={{ padding: "12px 0" }}>Nimic adăugat încă.</div>}
            {e.checklist.map((c, i) => (
              <div key={`${i}-${c.text}`} className={`task ${c.done ? "done" : ""}`}>
                <button type="button" className="tasktoggle" aria-pressed={c.done} onClick={() => start(() => toggleEventCheck(e.id, i))}>
                  <span className="box">
                    <Icon name="check" width={2.6} />
                  </span>
                  <span className="grow tt">{c.text}</span>
                </button>
                <button className="iconx" type="button" aria-label={`Șterge „${c.text}”`} onClick={() => start(() => removeEventCheck(e.id, i))}>
                  <Icon name="trash" width={2} />
                </button>
              </div>
            ))}
            <form
              className="addrow"
              onSubmit={(ev) => {
                ev.preventDefault();
                const t = check.trim();
                if (!t) return;
                setCheck("");
                start(() => addEventCheck(e.id, t));
              }}
            >
              <input type="text" value={check} onChange={(ev) => setCheck(ev.target.value)} placeholder="Adaugă un punct (ex. Gustări)" aria-label="Adaugă un punct" maxLength={120} />
              <button className="btn ghost sm" type="submit" disabled={pending}>
                <Icon name="plus" width={2.2} />
                Adaugă
              </button>
            </form>
          </div>
        </section>
      )}

      <div className="row" style={{ justifyContent: "flex-start", gap: 8, flexWrap: "wrap" }}>
        <Link className="btn" href={`/mesaje?catre=${encodeURIComponent(e.signups.length ? audience : "Toți tinerii")}&text=${encodeURIComponent(reminder)}`}>
          <Icon name="send" />
          Trimite reminder
        </Link>
        {unpaid.length > 0 && (
          <Link className="btn ghost" href={`/mesaje?catre=${encodeURIComponent(audience)}&text=${encodeURIComponent(payReminder)}`}>
            Cere plățile ({unpaid.length})
          </Link>
        )}
      </div>
    </>
  );
}
