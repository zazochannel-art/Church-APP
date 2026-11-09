import Link from "next/link";
import { Icon } from "./Icon";
import type { ReactNode } from "react";
import type { RunKind, YouthEvent } from "@/lib/types";
import { Avatar, firstName } from "./Avatar";

export function PageHeader({ eyebrow, title, actions }: { eyebrow: string; title: ReactNode; actions?: ReactNode }) {
  return (
    <header>
      <div className="hi">
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
      </div>
      <div className="hdr-actions">{actions}</div>
    </header>
  );
}

export const KIND: Record<RunKind, { label: string; color: string }> = {
  lauda: { label: "Laudă", color: "#f3a6c0" },
  cuvant: { label: "Cuvânt", color: "#f6c58f" },
  grupe: { label: "Grupe", color: "#7ad3c8" },
  altele: { label: "Altele", color: "#b3a8ff" },
};

export function RunSheet({ event, onRemove }: { event: YouthEvent; onRemove?: (index: number) => void }) {
  if (!event.run.length) return <div className="gl panel meta">Încă nu ați adăugat ordinea programului.</div>;
  const total = event.run.reduce((a, r) => a + r.minutes, 0);
  return (
    <>
      <div className="totalbar" aria-hidden="true">
        {event.run.map((r, i) => (
          <i key={i} style={{ flex: r.minutes, background: KIND[r.kind].color }} />
        ))}
      </div>
      <div className="legend">
        {Object.values(KIND).map((k) => (
          <span key={k.label}>
            <i style={{ background: k.color }} />
            {k.label}
          </span>
        ))}
        <span className="num" style={{ marginLeft: "auto" }}>
          Total {Math.floor(total / 60)}h {total % 60} min
        </span>
      </div>
      <div className="gl run">
        {event.run.map((r, i) => (
          <div className="step" key={i}>
            <div className="t">
              {r.start}
              <small>{r.minutes} min</small>
            </div>
            <div>
              <span className="kind" style={{ background: KIND[r.kind].color }} />
              <b>{r.title}</b>
            </div>
            <span className="resp">
              <Avatar name={r.lead} />
              {firstName(r.lead)}
            </span>
            {onRemove && (
              <button className="iconx" type="button" aria-label={`Scoate „${r.title}”`} onClick={() => onRemove(i)}>
                <Icon name="minus" width={2.4} />
              </button>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

export function EventCard({ event: e }: { event: YouthEvent }) {
  const pct = e.capacity ? Math.min(100, (e.going / e.capacity) * 100) : null;
  return (
    <Link href={`/programe/${e.id}`} className="gl ecard">
      <div className="ehead">
        <div className="date">
          <b>{e.day}</b>
          <small>{e.month}</small>
        </div>
        <div className="grow">
          <h3>{e.name}</h3>
          <span className="meta">
            {e.when} · {e.where}
          </span>
        </div>
      </div>
      <div className="row">
        <span className="meta num">
          {e.going}
          {e.capacity ? ` / ${e.capacity} locuri` : " înscriși"}
        </span>
        <span className="meta">Organizator: {firstName(e.organizer)}</span>
      </div>
      {pct !== null && (
        <div className={`track ${pct > 90 ? "warn" : ""}`}>
          <i style={{ width: `${pct}%` }} />
        </div>
      )}
      <div className="flags">
        {e.flags.map((f) => (
          <span key={f.text} className={`flag ${f.tone}`}>
            {f.text}
          </span>
        ))}
      </div>
    </Link>
  );
}
