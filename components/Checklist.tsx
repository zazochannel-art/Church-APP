"use client";

import { useState, useTransition } from "react";
import { Avatar } from "./Avatar";
import { Icon } from "./Icon";

export type CheckItem = { id: string; text: string; done: boolean; due?: string; soon?: boolean; owner?: string };

/** Tickable list used for leader tasks and event preparation. Changes are saved through the callbacks. */
export function Checklist({
  items,
  showCount,
  onToggle,
  onAdd,
  addPlaceholder = "Adaugă un punct",
}: {
  items: CheckItem[];
  showCount?: string;
  onToggle: (id: string) => Promise<unknown>;
  onAdd?: (text: string) => Promise<unknown>;
  addPlaceholder?: string;
}) {
  const [list, setList] = useState(items);
  const [draft, setDraft] = useState("");
  const [, start] = useTransition();
  const toggle = (id: string) => {
    setList((l) => l.map((x) => (x.id === id ? { ...x, done: !x.done } : x)));
    start(async () => {
      await onToggle(id);
    });
  };
  const left = list.filter((x) => !x.done).length;
  return (
    <section>
      {showCount && (
        <h2>
          {showCount} <span className="meta num">{left} rămase</span>
        </h2>
      )}
      <div className="gl tasks">
        {list.length === 0 && <div className="meta" style={{ padding: "12px 4px" }}>Nimic adăugat încă.</div>}
        {list.map((t) => (
          <button key={t.id} type="button" className={`task ${t.done ? "done" : ""}`} aria-pressed={t.done} onClick={() => toggle(t.id)}>
            <span className="box">
              <Icon name="check" width={2.6} />
            </span>
            <span className="grow">
              <span className="tt">{t.text}</span>
              {t.due && (
                <>
                  <br />
                  <span className={`due ${t.soon && !t.done ? "soon" : ""}`}>{t.due}</span>
                </>
              )}
            </span>
            {t.owner && <Avatar name={t.owner} className="who" />}
          </button>
        ))}
        {onAdd && (
          <form
            className="addrow"
            onSubmit={(e) => {
              e.preventDefault();
              const text = draft.trim();
              if (!text) return;
              setList((l) => [...l, { id: `new-${l.length}`, text, done: false }]);
              setDraft("");
              start(async () => {
                await onAdd(text);
              });
            }}
          >
            <input type="text" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={addPlaceholder} aria-label={addPlaceholder} />
            <button className="btn ghost sm" type="submit">
              <Icon name="plus" width={2.2} />
              Adaugă
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
