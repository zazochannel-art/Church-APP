"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Avatar } from "@/components/Avatar";
import { KIND, RunSheet } from "@/components/Bits";
import { Checklist } from "@/components/Checklist";
import { Icon } from "@/components/Icon";
import { ToastButton } from "@/components/ToastButton";
import { useToast } from "@/components/Toast";
import { addEventCheck, addRunItem, addSignup, removeRunItem, toggleEventCheck, togglePaid } from "@/lib/actions";
import type { RunKind, YouthEvent } from "@/lib/types";

const TABS = [
  ["program", "Program"],
  ["inscrisi", "Înscriși"],
  ["pregatire", "Pregătire"],
] as const;

export function EventTabs({ event: e, people }: { event: YouthEvent; people: string[] }) {
  const toast = useToast();
  const [tab, setTab] = useState<(typeof TABS)[number][0]>("program");
  const [adding, setAdding] = useState(false);
  const [pending, start] = useTransition();
  const unpaid = e.signups.filter((s) => s.paid === false).length;
  const notSigned = people.filter((p) => !e.signups.some((s) => s.name === p));

  return (
    <>
      <div className="gl seg" role="group" aria-label="Secțiuni eveniment">
        {TABS.map(([id, label]) => (
          <button key={id} type="button" aria-pressed={tab === id} onClick={() => setTab(id)}>
            {label}
          </button>
        ))}
      </div>

      {tab === "program" && (
        <section>
          <RunSheet event={e} onRemove={(i) => start(() => removeRunItem(e.id, i))} />
          {adding ? (
            <form
              className="gl panel addform"
              style={{ borderTop: 0 }}
              onSubmit={(ev) => {
                ev.preventDefault();
                const f = new FormData(ev.currentTarget);
                const item = {
                  title: String(f.get("title") ?? ""),
                  minutes: Number(f.get("minutes")),
                  kind: String(f.get("kind")) as RunKind,
                  lead: String(f.get("lead") ?? ""),
                };
                if (!item.title.trim()) return;
                start(async () => {
                  await addRunItem(e.id, item);
                  setAdding(false);
                  toast("Moment adăugat în program");
                });
              }}
            >
              <input name="title" type="text" placeholder="Ce se întâmplă (ex. Mărturie)" aria-label="Titlul momentului" autoFocus required />
              <div className="two">
                <input name="minutes" type="number" min={1} max={600} defaultValue={10} aria-label="Durata în minute" />
                <select name="kind" aria-label="Tipul momentului" defaultValue="altele">
                  {Object.entries(KIND).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>
              <select name="lead" aria-label="Cine se ocupă">
                {people.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
              <div className="row" style={{ justifyContent: "flex-end", gap: 8 }}>
                <button className="btn ghost sm" type="button" onClick={() => setAdding(false)}>Renunță</button>
                <button className="btn sm" type="submit" disabled={pending}>Adaugă</button>
              </div>
            </form>
          ) : (
            <button className="btn ghost sm" type="button" onClick={() => setAdding(true)} style={{ alignSelf: "flex-start" }}>
              <Icon name="plus" width={2.2} />
              Adaugă un moment
            </button>
          )}
        </section>
      )}

      {tab === "inscrisi" && (
        <section>
          <h2>
            {e.going} înscriși {e.price && <span className="meta">Atinge statusul ca să marchezi plata</span>}
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
                  <span className="status ok">Confirmat</span>
                )}
              </div>
            ))}
            {e.going > e.signups.length && (
              <div className="srow meta" style={{ justifyContent: "center" }}>
                și încă {e.going - e.signups.length}
              </div>
            )}
            {notSigned.length > 0 && (
              <form
                className="addrow"
                onSubmit={(ev) => {
                  ev.preventDefault();
                  const name = String(new FormData(ev.currentTarget).get("who") ?? "");
                  if (name) start(() => addSignup(e.id, name));
                }}
              >
                <select name="who" aria-label="Înscrie pe cineva" defaultValue="">
                  <option value="" disabled>Înscrie pe cineva…</option>
                  {notSigned.map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
                <button className="btn ghost sm" type="submit" disabled={pending}>
                  <Icon name="plus" width={2.2} />
                  Înscrie
                </button>
              </form>
            )}
          </div>
        </section>
      )}

      {tab === "pregatire" && (
        <Checklist
          key={e.checklist.length}
          showCount="Pregătire"
          items={e.checklist.map((c, i) => ({ id: String(i), text: c.text, done: c.done }))}
          onToggle={(id) => toggleEventCheck(e.id, Number(id))}
          onAdd={(text) => addEventCheck(e.id, text)}
        />
      )}

      <div className="row" style={{ justifyContent: "flex-start", gap: 8, flexWrap: "wrap" }}>
        <Link className="btn" href={`/mesaje?catre=${encodeURIComponent(e.price ? "Tabăra de iarnă" : "Toți tinerii")}`}>
          <Icon name="send" />
          Trimite reminder
        </Link>
        {unpaid > 0 && (
          <ToastButton className="btn ghost" message={`Reminder de plată pregătit pentru ${unpaid} ${unpaid === 1 ? "persoană" : "persoane"}`}>
            Cere plățile
          </ToastButton>
        )}
      </div>
    </>
  );
}
