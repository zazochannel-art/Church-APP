"use client";

import Link from "next/link";
import { useState } from "react";
import { Avatar } from "@/components/Avatar";
import { RunSheet } from "@/components/Bits";
import { Checklist } from "@/components/Checklist";
import { Icon } from "@/components/Icon";
import { ToastButton } from "@/components/ToastButton";
import type { YouthEvent } from "@/lib/types";

const TABS = [
  ["program", "Program"],
  ["inscrisi", "Înscriși"],
  ["pregatire", "Pregătire"],
] as const;

export function EventTabs({ event: e }: { event: YouthEvent }) {
  const [tab, setTab] = useState<(typeof TABS)[number][0]>("program");
  const unpaid = e.signups.filter((s) => s.paid === false).length;

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
          <RunSheet event={e} />
          <ToastButton message="Moment nou adăugat în program" className="btn ghost sm">
            <Icon name="plus" width={2.2} />
            Adaugă un moment
          </ToastButton>
        </section>
      )}

      {tab === "inscrisi" && (
        <section>
          <h2>
            {e.going} înscriși <ToastButton className="link" message="Lista a fost exportată">Exportă lista</ToastButton>
          </h2>
          <div className="gl slist">
            {e.signups.map((s) => (
              <div className="srow" key={s.name}>
                <Avatar name={s.name} />
                <div className="grow">{s.name}</div>
                {s.paid === false ? (
                  <span className="status warn">Neplătit</span>
                ) : (
                  <span className="status ok">{s.paid ? "Plătit" : "Confirmat"}</span>
                )}
              </div>
            ))}
            {e.going > e.signups.length && (
              <div className="srow meta" style={{ justifyContent: "center" }}>
                și încă {e.going - e.signups.length}
              </div>
            )}
          </div>
        </section>
      )}

      {tab === "pregatire" && (
        <Checklist showCount="Pregătire" items={e.checklist.map((c, i) => ({ id: String(i), text: c.text, done: c.done }))} />
      )}

      <div className="row" style={{ justifyContent: "flex-start", gap: 8, flexWrap: "wrap" }}>
        <Link className="btn" href={`/mesaje?catre=${encodeURIComponent(e.price ? "Tabăra de iarnă" : "Toți tinerii")}`}>
          <Icon name="send" />
          Trimite reminder
        </Link>
        {unpaid > 0 && (
          <ToastButton className="btn ghost" message={`Reminder de plată trimis celor care n-au plătit`}>
            Cere plățile
          </ToastButton>
        )}
      </div>
    </>
  );
}
