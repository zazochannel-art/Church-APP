"use client";

import { useState, useTransition } from "react";
import { Avatar, firstName } from "@/components/Avatar";
import { Icon } from "@/components/Icon";
import { useToast } from "@/components/Toast";
import { addSong, saveSetlist } from "@/lib/actions";
import type { Song } from "@/lib/types";

export function Worship({ library, initialSet, band }: { library: Song[]; initialSet: string[]; band: string[] }) {
  const toast = useToast();
  const [set, setSetState] = useState(initialSet);
  const [, start] = useTransition();
  const [adding, setAdding] = useState(false);
  const setSet = (f: (s: string[]) => string[]) => {
    const next = f(set);
    setSetState(next);
    start(() => saveSetlist(next));
  };
  const [query, setQuery] = useState("");
  const [playing, setPlaying] = useState(false);
  const byId = (id: string) => library.find((s) => s.id === id);
  const found = library.filter((s) => s.title.toLowerCase().includes(query.toLowerCase()));
  const add = (id: string) => {
    setSet((s) => [...s, id]);
    toast("Adăugată pe lista de vineri");
  };
  const remove = (id: string) => setSet((s) => s.filter((x) => x !== id));

  return (
    <div className="wcols">
      <div className="colA">
        <section>
          <h2>
            Vineri, 14 nov <span className="meta num">{set.length} cântări · ~{set.length * 5} min</span>
          </h2>
          <div className="gl player">
            <div className="cover" />
            <div className="grow">
              <b>Playlist: Seara de tineret</b>
              <div className="meta">Ca trupa și tinerii să asculte cântările dinainte</div>
            </div>
            <button
              className="play"
              type="button"
              aria-label={playing ? "Pauză" : "Ascultă"}
              onClick={() => {
                setPlaying((p) => !p);
                if (!playing && set[0]) toast(`Se redă: ${byId(set[0])?.title ?? ""}`);
              }}
            >
              <Icon name={playing ? "pause" : "play"} />
            </button>
          </div>
          <div className="gl songs">
            {set.length === 0 && <div className="song meta" style={{ gridTemplateColumns: "1fr" }}>Adăugați cântări din bibliotecă.</div>}
            {set.map((id, i) => {
              const s = byId(id);
              if (!s) return null;
              return (
                <div className="song" key={id}>
                  <span className="n">{i + 1}</span>
                  <div>
                    <b>{s.title}</b>
                    <span className="meta">{s.author} · {s.bpm} BPM</span>
                  </div>
                  <div className="songmeta">
                    <span className="key">{s.key}</span>
                    <button className="addsong in" type="button" aria-label={`Scoate ${s.title} din listă`} onClick={() => remove(id)}>
                      <Icon name="minus" width={2.2} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="gl panel" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div className="row">
              <b>Repetiție</b>
              <span className="meta">Vineri, 17:30 · Capela</span>
            </div>
            <div className="row" style={{ justifyContent: "flex-start", gap: 10, flexWrap: "wrap" }}>
              {band.map((n) => (
                <span key={n} className="resp" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
                  <Avatar name={n} />
                  {firstName(n)}
                </span>
              ))}
              <span className="flag warn">Tobe: liber</span>
            </div>
            <button className="btn sm" type="button" style={{ alignSelf: "flex-start", marginTop: 4 }} onClick={() => toast("Lista, tonalitățile și playlistul au fost trimise trupei")}>
              <Icon name="send" />
              Trimite lista trupei
            </button>
          </div>
        </section>
      </div>

      <div className="colB">
        <section>
          <h2>
            Biblioteca de cântări{" "}
            <button className="link" type="button" onClick={() => setAdding((a) => !a)}>
              {adding ? "Închide" : "Cântare nouă"}
            </button>
          </h2>
          {adding && (
            <form
              className="gl panel addform"
              style={{ borderTop: 0 }}
              onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                const song = { title: String(f.get("title") ?? ""), author: String(f.get("author") ?? ""), key: String(f.get("key") ?? ""), bpm: Number(f.get("bpm")) };
                if (!song.title.trim()) return;
                start(async () => {
                  await addSong(song);
                  setAdding(false);
                  toast(`„${song.title.trim()}” a intrat în bibliotecă`);
                });
              }}
            >
              <input name="title" type="text" placeholder="Titlul" aria-label="Titlul cântării" autoFocus required />
              <input name="author" type="text" placeholder="Autor sau sursă" aria-label="Autor" />
              <div className="two">
                <select name="key" aria-label="Tonalitate" defaultValue="G">
                  {["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"].map((k) => (
                    <option key={k}>{k}</option>
                  ))}
                </select>
                <input name="bpm" type="number" min={30} max={240} placeholder="BPM" aria-label="BPM" />
              </div>
              <div className="row" style={{ justifyContent: "flex-end" }}>
                <button className="btn sm" type="submit">Salvează</button>
              </div>
            </form>
          )}
          <div className="search">
            <Icon name="search" />
            <input type="text" placeholder="Caută o cântare" aria-label="Caută o cântare" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <div className="gl songs">
            {found.length === 0 && <div className="song meta" style={{ gridTemplateColumns: "1fr" }}>Nicio cântare găsită.</div>}
            {found.map((s) => {
              const inSet = set.includes(s.id);
              return (
                <div className="song" key={s.id}>
                  <span className="key" style={{ background: "rgba(255,255,255,.18)", color: "#fff" }}>{s.key}</span>
                  <div>
                    <b>{s.title}</b>
                    <span className="meta">{s.author} · {s.bpm} BPM</span>
                  </div>
                  <button
                    className={`addsong ${inSet ? "in" : ""}`}
                    type="button"
                    aria-label={`${inSet ? "Scoate" : "Adaugă"} ${s.title}`}
                    onClick={() => (inSet ? remove(s.id) : add(s.id))}
                  >
                    <Icon name={inSet ? "check" : "plus"} width={2.2} />
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
