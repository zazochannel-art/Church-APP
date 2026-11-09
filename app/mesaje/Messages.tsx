"use client";

import { useState } from "react";
import { Icon } from "@/components/Icon";
import { useToast } from "@/components/Toast";
import type { Message } from "@/lib/types";

export function Messages({
  audiences,
  initialSent,
  initialAudience,
}: {
  audiences: { name: string; count: number }[];
  initialSent: Message[];
  initialAudience: string;
}) {
  const toast = useToast();
  const [audience, setAudience] = useState(initialAudience);
  const [text, setText] = useState("");
  const [sent, setSent] = useState(initialSent);
  const count = audiences.find((a) => a.name === audience)?.count ?? 0;

  return (
    <div className="mcols">
      <form
        className="gl panel"
        style={{ display: "flex", flexDirection: "column", gap: 14 }}
        onSubmit={(e) => {
          e.preventDefault();
          if (!text.trim()) return toast("Scrie mai întâi mesajul");
          setSent((s) => [{ id: `m${Date.now()}`, audience, text: text.trim(), when: "acum", recipients: count, read: 0 }, ...s]);
          setText("");
          toast(`Trimis la ${count} persoane`);
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span className="meta">Către</span>
          <div className="chips wrapchips">
            {audiences.map((a) => (
              <button key={a.name} className="chip" type="button" aria-pressed={audience === a.name} onClick={() => setAudience(a.name)}>
                {a.name}
              </button>
            ))}
          </div>
        </div>
        <label className="f" htmlFor="mtext">
          Mesaj
          <textarea id="mtext" placeholder="Scrie anunțul…" value={text} onChange={(e) => setText(e.target.value)} />
        </label>
        <div className="toggles">
          <label className="toggle"><input type="checkbox" defaultChecked /> Notificare pe telefon</label>
          <label className="toggle"><input type="checkbox" /> Email</label>
        </div>
        <div className="row">
          <span className="meta num">Ajunge la {count} persoane</span>
          <button className="btn" type="submit">
            <Icon name="send" />
            Trimite
          </button>
        </div>
      </form>

      <section>
        <h2>Trimise</h2>
        {sent.map((m) => (
          <div className="gl sent" key={m.id}>
            <div className="row">
              <b style={{ fontWeight: 500 }}>Către {m.audience}</b>
              <span className="meta">{m.when}</span>
            </div>
            <p>{m.text}</p>
            <div className="track">
              <i style={{ width: `${m.recipients ? (m.read / m.recipients) * 100 : 0}%` }} />
            </div>
            <span className="meta num">
              Citit de {m.read} din {m.recipients}
            </span>
          </div>
        ))}
      </section>
    </div>
  );
}
