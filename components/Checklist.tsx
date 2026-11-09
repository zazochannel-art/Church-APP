"use client";

import { useState } from "react";
import { Avatar } from "./Avatar";
import { Icon } from "./Icon";

export type CheckItem = { id: string; text: string; done: boolean; due?: string; soon?: boolean; owner?: string };

/** Tickable list used for leader tasks and event preparation. */
export function Checklist({ items, showCount }: { items: CheckItem[]; showCount?: string }) {
  const [list, setList] = useState(items);
  const toggle = (id: string) => setList((l) => l.map((x) => (x.id === id ? { ...x, done: !x.done } : x)));
  const left = list.filter((x) => !x.done).length;
  return (
    <section>
      {showCount && (
        <h2>
          {showCount} <span className="meta num">{left} rămase</span>
        </h2>
      )}
      <div className="gl tasks">
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
      </div>
    </section>
  );
}
