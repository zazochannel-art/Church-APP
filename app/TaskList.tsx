"use client";

import { useState, useTransition } from "react";
import { Avatar } from "@/components/Avatar";
import { Icon } from "@/components/Icon";
import { useToast } from "@/components/Toast";
import { addTask, toggleTask } from "@/lib/actions";
import type { Task } from "@/lib/types";

export function TaskList({ tasks, people }: { tasks: Task[]; people: string[] }) {
  const toast = useToast();
  const [list, setList] = useState(tasks);
  const [adding, setAdding] = useState(false);
  const [, start] = useTransition();
  const left = list.filter((t) => !t.done).length;

  return (
    <section>
      <h2>
        De făcut <span className="meta num">{left} rămase</span>
      </h2>
      <div className="gl tasks">
        {list.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`task ${t.done ? "done" : ""}`}
            aria-pressed={t.done}
            onClick={() => {
              setList((l) => l.map((x) => (x.id === t.id ? { ...x, done: !x.done } : x)));
              start(() => toggleTask(t.id));
            }}
          >
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
        {adding ? (
          <form
            className="addform"
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              const text = String(f.get("text") ?? "").trim();
              if (!text) return;
              const owner = String(f.get("owner") ?? "");
              const due = String(f.get("due") ?? "").trim();
              setList((l) => [...l, { id: `new-${l.length}`, text, owner, due, done: false }]);
              setAdding(false);
              start(() => addTask(text, owner, due));
              toast("Sarcină adăugată");
            }}
          >
            <input name="text" type="text" placeholder="Ce trebuie făcut?" aria-label="Ce trebuie făcut" autoFocus required />
            <select name="owner" aria-label="Cine se ocupă">
              {people.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
            <input name="due" type="text" placeholder="Până când (ex. vineri)" aria-label="Până când" />
            <div className="row" style={{ justifyContent: "flex-end", gap: 8 }}>
              <button className="btn ghost sm" type="button" onClick={() => setAdding(false)}>Renunță</button>
              <button className="btn sm" type="submit">Salvează</button>
            </div>
          </form>
        ) : (
          <button className="task addtask" type="button" onClick={() => setAdding(true)}>
            <span className="box"><Icon name="plus" width={2.4} /></span>
            <span className="grow tt">Sarcină nouă</span>
          </button>
        )}
      </div>
    </section>
  );
}
