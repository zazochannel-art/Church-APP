"use client";

import { useState, useTransition } from "react";
import { Avatar } from "@/components/Avatar";
import { Icon } from "@/components/Icon";
import { useToast } from "@/components/Toast";
import { addTask, clearDoneTasks, deleteTask, toggleTask } from "@/lib/actions";
import type { Task } from "@/lib/types";

export function TaskList({ tasks, people, me }: { tasks: Task[]; people: string[]; me: string }) {
  const toast = useToast();
  const [list, setList] = useState(tasks);
  const [adding, setAdding] = useState(false);
  const [, start] = useTransition();
  const left = list.filter((t) => !t.done).length;
  const done = list.length - left;
  const owners = me && !people.includes(me) ? [me, ...people] : people;

  return (
    <section id="de-facut">
      <h2>
        <span>De făcut <span className="meta num">· {left} rămase</span></span>
        {done > 0 && (
          <button
            className="link"
            type="button"
            onClick={() => {
              setList((l) => l.filter((t) => !t.done));
              start(() => clearDoneTasks());
            }}
          >
            Șterge cele bifate
          </button>
        )}
      </h2>
      <div className="gl tasks">
        {list.length === 0 && !adding && <div className="meta" style={{ padding: "12px 0" }}>Nicio sarcină. Bine lucrat!</div>}
        {list.map((t) => (
          <div key={t.id} className={`task ${t.done ? "done" : ""}`}>
            <button
              type="button"
              className="tasktoggle"
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
                {(t.due || t.owner) && (
                  <>
                    <br />
                    <span className={`due ${t.soon && !t.done ? "soon" : ""}`}>
                      {[t.due, t.owner && t.owner.split(" ")[0]].filter(Boolean).join(" · ")}
                    </span>
                  </>
                )}
              </span>
              {t.owner && <Avatar name={t.owner} className="who" />}
            </button>
            <button
              className="iconx"
              type="button"
              aria-label={`Șterge „${t.text}”`}
              onClick={() => {
                setList((l) => l.filter((x) => x.id !== t.id));
                start(() => deleteTask(t.id));
              }}
            >
              <Icon name="trash" width={2} />
            </button>
          </div>
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
              setAdding(false);
              start(async () => {
                const task = await addTask(text, owner, due);
                if (task) setList((l) => [...l, task]);
                toast("Sarcină adăugată");
              });
            }}
          >
            <input name="text" type="text" placeholder="Ce trebuie făcut?" aria-label="Ce trebuie făcut" autoFocus required maxLength={120} />
            <div className="two">
              <select name="owner" aria-label="Cine se ocupă" defaultValue={me || owners[0]}>
                <option value="">Nimeni anume</option>
                {owners.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
              <input name="due" type="text" placeholder="Până când (ex. vineri)" aria-label="Până când" maxLength={40} />
            </div>
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
