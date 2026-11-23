"use client";

import { useState, useTransition } from "react";
import { Avatar, firstName } from "@/components/Avatar";
import { Icon } from "@/components/Icon";
import { useToast } from "@/components/Toast";
import { deleteMessage, sendMessage } from "@/lib/actions";
import { waText, waTo } from "@/lib/share";
import type { Audience, Message } from "@/lib/types";

function when(w: string) {
  const d = new Date(w);
  if (Number.isNaN(d.getTime())) return w;
  const min = Math.round((Date.now() - d.getTime()) / 60000);
  if (min < 1) return "acum";
  if (min < 60) return `acum ${min} min`;
  if (min < 24 * 60 && new Date().getDate() === d.getDate()) return `azi, ${d.toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" })}`;
  return d.toLocaleDateString("ro-RO", { day: "numeric", month: "short" });
}

export function Messages({
  audiences,
  initialSent,
  initialAudience,
  initialText,
}: {
  audiences: Audience[];
  initialSent: Message[];
  initialAudience: string;
  initialText: string;
}) {
  const toast = useToast();
  const [audience, setAudience] = useState(initialAudience);
  const [text, setText] = useState(initialText);
  const [sent, setSent] = useState(initialSent);
  const [personal, setPersonal] = useState<{ text: string; audience: Audience } | null>(null);
  const [pending, start] = useTransition();
  const current = audiences.find((a) => a.name === audience) ?? audiences[0];
  const withPhone = current.members.filter((m) => m.phone);

  const save = (after: (msg: Message) => void) => {
    if (!text.trim()) return toast("Scrie mai întâi mesajul");
    start(async () => {
      const msg = await sendMessage(current.name, text, current.count);
      if (!msg) return toast("Mesajul nu a putut fi salvat");
      setSent((s) => [msg, ...s]);
      after(msg);
    });
  };

  return (
    <div className="mcols">
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <form
          className="gl panel"
          style={{ display: "flex", flexDirection: "column", gap: 14 }}
          onSubmit={(e) => e.preventDefault()}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span className="meta">Către</span>
            <div className="chips wrapchips">
              {audiences.map((a) => (
                <button key={a.name} className="chip" type="button" aria-pressed={current.name === a.name} onClick={() => { setAudience(a.name); setPersonal(null); }}>
                  {a.name} <span className="num" style={{ opacity: 0.6 }}>{a.count}</span>
                </button>
              ))}
            </div>
          </div>
          <label className="f" htmlFor="mtext">
            Mesaj
            <textarea id="mtext" placeholder="Scrie anunțul…" value={text} maxLength={2000} onChange={(e) => setText(e.target.value)} />
          </label>
          <span className="meta num">
            {current.count} {current.count === 1 ? "persoană" : "persoane"} · {withPhone.length} cu număr de telefon
          </span>
          <div className="row" style={{ justifyContent: "flex-start", gap: 8, flexWrap: "wrap" }}>
            <button
              className="btn"
              type="button"
              disabled={pending}
              onClick={() =>
                save((msg) => {
                  window.open(waText(msg.text), "_blank", "noopener");
                  toast("Salvat. Alege grupul în WhatsApp.");
                  setText("");
                })
              }
            >
              <Icon name="chat" />
              Trimite în grupul WhatsApp
            </button>
            <button
              className="btn ghost"
              type="button"
              disabled={pending || withPhone.length === 0}
              onClick={() =>
                save((msg) => {
                  setPersonal({ text: msg.text, audience: current });
                  setText("");
                })
              }
            >
              <Icon name="send" />
              Fiecăruia în parte
            </button>
            <button
              className="btn ghost"
              type="button"
              disabled={pending}
              onClick={() =>
                save((msg) => {
                  navigator.clipboard?.writeText(msg.text).catch(() => {});
                  toast("Copiat și salvat în istoric");
                  setText("");
                })
              }
            >
              <Icon name="copy" />
              Copiază
            </button>
          </div>
        </form>

        {personal && (
          <section>
            <h2>
              <span>Trimite fiecăruia · {personal.audience.name}</span>
              <button className="link" type="button" onClick={() => setPersonal(null)}>Gata</button>
            </h2>
            <div className="gl mlist">
              {personal.audience.members.map((m) => (
                <div className="mrow" key={m.name} style={{ cursor: "default" }}>
                  <Avatar name={m.name} />
                  <div className="grow">
                    <b>{m.name}</b>
                    <div className="meta num">{m.phone || "fără număr"}</div>
                  </div>
                  {m.phone && (
                    <a className="btn ghost sm" href={waTo(m.phone, personal.text)} target="_blank" rel="noreferrer" aria-label={`Trimite lui ${firstName(m.name)} pe WhatsApp`}>
                      <Icon name="chat" />
                      {firstName(m.name)}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <section>
        <h2>Istoric</h2>
        {sent.length === 0 && <div className="gl panel meta">Niciun mesaj încă.</div>}
        {sent.map((m) => (
          <div className="gl sent" key={m.id}>
            <div className="row">
              <b style={{ fontWeight: 500 }}>Către {m.audience}</b>
              <span className="meta" suppressHydrationWarning>{when(m.when)}</span>
            </div>
            <p style={{ whiteSpace: "pre-line" }}>{m.text}</p>
            <div className="row">
              <span className="meta num">
                {m.recipients} {m.recipients === 1 ? "persoană" : "persoane"}
                {m.author ? ` · de la ${m.author}` : ""}
              </span>
              <span className="row" style={{ gap: 6 }}>
                <button className="iconx" type="button" aria-label="Folosește din nou textul" onClick={() => { setText(m.text); document.querySelector("main")?.scrollTo({ top: 0, behavior: "smooth" }); }}>
                  <Icon name="copy" width={2} />
                </button>
                <button
                  className="iconx"
                  type="button"
                  aria-label="Șterge din istoric"
                  onClick={() => {
                    setSent((s) => s.filter((x) => x.id !== m.id));
                    start(() => deleteMessage(m.id));
                  }}
                >
                  <Icon name="trash" width={2} />
                </button>
              </span>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
