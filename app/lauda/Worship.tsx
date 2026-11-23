"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Avatar, firstName } from "@/components/Avatar";
import { ConfirmButton } from "@/components/ConfirmButton";
import { Icon } from "@/components/Icon";
import { useToast } from "@/components/Toast";
import { addSong, deleteSong, saveRehearsal, saveSetlist, updateSong } from "@/lib/actions";
import type { Rehearsal, Song } from "@/lib/types";

const KEYS = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B", "Am", "Bm", "Cm", "Dm", "Em", "Fm", "F#m", "Gm"];

function SongForm({ song, onDone }: { song?: Song; onDone: (s?: Song) => void }) {
  const [pending, start] = useTransition();
  const toast = useToast();
  return (
    <form
      className="gl panel addform"
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const data = {
          title: String(f.get("title") ?? ""),
          author: String(f.get("author") ?? ""),
          key: String(f.get("key") ?? ""),
          bpm: Number(f.get("bpm")),
          link: String(f.get("link") ?? ""),
        };
        if (!data.title.trim()) return;
        start(async () => {
          if (song) {
            await updateSong(song.id, data);
            toast("Cântare salvată");
            onDone();
          } else {
            const s = await addSong(data);
            toast(`„${data.title.trim()}” a intrat în bibliotecă`);
            onDone(s ?? undefined);
          }
        });
      }}
    >
      <input name="title" type="text" placeholder="Titlul" aria-label="Titlul cântării" autoFocus required maxLength={120} defaultValue={song?.title} />
      <input name="author" type="text" placeholder="Autor sau sursă" aria-label="Autor" maxLength={80} defaultValue={song?.author} />
      <div className="two">
        <select name="key" aria-label="Tonalitate" defaultValue={song?.key ?? "G"}>
          {[...new Set([...(song ? [song.key] : []), ...KEYS])].map((k) => (
            <option key={k}>{k}</option>
          ))}
        </select>
        <input name="bpm" type="number" min={30} max={240} placeholder="BPM" aria-label="BPM" defaultValue={song?.bpm} />
      </div>
      <input name="link" type="url" placeholder="Link YouTube sau Spotify (opțional)" aria-label="Link pentru ascultat" maxLength={300} defaultValue={song?.link} />
      <div className="row" style={{ justifyContent: "flex-end", gap: 8 }}>
        <button className="btn ghost sm" type="button" onClick={() => onDone()}>Renunță</button>
        <button className="btn sm" type="submit" disabled={pending}>Salvează</button>
      </div>
    </form>
  );
}

export function Worship({
  library: initialLibrary,
  initialSet,
  band,
  rehearsal,
  forLabel,
}: {
  library: Song[];
  initialSet: string[];
  band: { role: string; person: string | null }[];
  rehearsal: Rehearsal;
  forLabel: string;
}) {
  const toast = useToast();
  const [library, setLibrary] = useState(initialLibrary);
  const [set, setSetState] = useState(initialSet);
  const [, start] = useTransition();
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [editRehearsal, setEditRehearsal] = useState(false);
  const [reh, setReh] = useState(rehearsal);
  const [query, setQuery] = useState("");
  const setSet = (next: string[]) => {
    setSetState(next);
    start(() => saveSetlist(next));
  };
  const byId = (id: string) => library.find((s) => s.id === id);
  const q = query.toLowerCase();
  const found = library.filter((s) => s.title.toLowerCase().includes(q) || s.author.toLowerCase().includes(q));
  const songsInSet = set.map(byId).filter((s): s is Song => Boolean(s));
  const withLinks = songsInSet.filter((s) => s.link);
  const move = (i: number, d: -1 | 1) => {
    const next = [...set];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    setSet(next);
  };
  const free = band.filter((b) => !b.person);
  const bandText = [
    `Lista de cântări pentru ${forLabel}:`,
    ...songsInSet.map((s, i) => `${i + 1}. ${s.title} (${s.key}, ${s.bpm} BPM)${s.link ? ` ${s.link}` : ""}`),
    reh.when ? `Repetiție: ${reh.when}${reh.where ? `, ${reh.where}` : ""}.` : "",
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <div className="wcols">
      <div className="colA">
        <section>
          <h2>
            <span>Lista pentru {forLabel}</span>
            <span className="meta num">{set.length} cântări · ~{set.length * 5} min</span>
          </h2>
          <div className="gl player">
            <div className="cover" />
            <div className="grow">
              <b>Playlist pentru trupă</b>
              <div className="meta">
                {withLinks.length ? `${withLinks.length} din ${songsInSet.length} cântări au link de ascultat` : "Adaugă linkuri la cântări ca trupa să le asculte dinainte"}
              </div>
            </div>
            {withLinks[0] ? (
              <a className="play" href={withLinks[0].link} target="_blank" rel="noreferrer" aria-label={`Ascultă ${withLinks[0].title}`}>
                <Icon name="play" />
              </a>
            ) : (
              <span className="play off" aria-hidden="true"><Icon name="play" /></span>
            )}
          </div>
          <div className="gl songs">
            {set.length === 0 && <div className="song meta" style={{ gridTemplateColumns: "1fr" }}>Adaugă cântări din bibliotecă.</div>}
            {songsInSet.map((s, i) => (
              <div className="song" key={s.id}>
                <span className="n">{i + 1}</span>
                <div>
                  <b>{s.title}</b>
                  <span className="meta">
                    {s.author} · {s.bpm} BPM
                    {s.link && (
                      <>
                        {" · "}
                        <a className="link" href={s.link} target="_blank" rel="noreferrer">ascultă</a>
                      </>
                    )}
                  </span>
                </div>
                <div className="songmeta">
                  <span className="key">{s.key}</span>
                  <button className="iconx" type="button" aria-label="Mută mai sus" disabled={i === 0} onClick={() => move(i, -1)}>
                    <Icon name="up" width={2.2} />
                  </button>
                  <button className="iconx" type="button" aria-label="Mută mai jos" disabled={i === set.length - 1} onClick={() => move(i, 1)}>
                    <Icon name="down" width={2.2} />
                  </button>
                  <button className="addsong in" type="button" aria-label={`Scoate ${s.title} din listă`} onClick={() => setSet(set.filter((x) => x !== s.id))}>
                    <Icon name="minus" width={2.2} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          {set.length > 0 && (
            <button className="link" type="button" style={{ alignSelf: "flex-start" }} onClick={() => setSet([])}>
              Golește lista
            </button>
          )}
        </section>

        <section>
          <h2>
            Repetiție și trupă
            <button className="link" type="button" onClick={() => setEditRehearsal((x) => !x)}>
              {editRehearsal ? "Închide" : "Modifică"}
            </button>
          </h2>
          <div className="gl panel" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {editRehearsal ? (
              <form
                className="two"
                onSubmit={(e) => {
                  e.preventDefault();
                  const f = new FormData(e.currentTarget);
                  const next = { when: String(f.get("when") ?? ""), where: String(f.get("where") ?? "") };
                  setReh(next);
                  setEditRehearsal(false);
                  start(() => saveRehearsal(next.when, next.where));
                  toast("Repetiția a fost salvată");
                }}
              >
                <input name="when" type="text" placeholder="Când (ex. Vineri, 17:30)" aria-label="Când e repetiția" defaultValue={reh.when} maxLength={60} />
                <input name="where" type="text" placeholder="Unde (ex. Capela)" aria-label="Unde e repetiția" defaultValue={reh.where} maxLength={60} />
                <button className="btn sm" type="submit" style={{ justifySelf: "start" }}>Salvează</button>
              </form>
            ) : (
              <div className="row">
                <b>Repetiție</b>
                <span className="meta">{[reh.when, reh.where].filter(Boolean).join(" · ") || "Nestabilită"}</span>
              </div>
            )}
            <div className="row" style={{ justifyContent: "flex-start", gap: 10, flexWrap: "wrap" }}>
              {band.filter((b) => b.person).map((b) => (
                <span key={b.role} className="resp" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }} title={b.role}>
                  <Avatar name={b.person!} />
                  {firstName(b.person!)} <span className="meta">· {b.role}</span>
                </span>
              ))}
              {free.map((b) => (
                <span key={b.role} className="flag warn">{b.role}: liber</span>
              ))}
              {band.length === 0 && <span className="meta">Nicio echipă de laudă în programul de slujire.</span>}
            </div>
            <div className="row" style={{ justifyContent: "flex-start", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
              <Link className="btn sm" href={`/mesaje?catre=${encodeURIComponent("Trupa de laudă")}&text=${encodeURIComponent(bandText)}`}>
                <Icon name="send" />
                Trimite lista trupei
              </Link>
              {free.length > 0 && (
                <Link className="btn ghost sm" href="/echipa">Completează trupa</Link>
              )}
            </div>
          </div>
        </section>
      </div>

      <div className="colB">
        <section>
          <h2>
            <span>Biblioteca <span className="meta num">· {library.length}</span></span>
            <button className="link" type="button" onClick={() => { setAdding((a) => !a); setEditing(null); }}>
              {adding ? "Închide" : "Cântare nouă"}
            </button>
          </h2>
          {adding && (
            <SongForm
              onDone={(s) => {
                setAdding(false);
                if (s) setLibrary((l) => [...l, s].sort((a, b) => a.title.localeCompare(b.title, "ro")));
              }}
            />
          )}
          <div className="search">
            <Icon name="search" />
            <input type="text" placeholder="Caută după titlu sau autor" aria-label="Caută o cântare" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <div className="gl songs">
            {found.length === 0 && <div className="song meta" style={{ gridTemplateColumns: "1fr" }}>Nicio cântare găsită.</div>}
            {found.map((s) => {
              const inSet = set.includes(s.id);
              if (editing === s.id)
                return (
                  <div key={s.id} style={{ padding: "6px 0" }}>
                    <SongForm
                      song={s}
                      onDone={() => setEditing(null)}
                    />
                    <div className="row" style={{ justifyContent: "flex-end", paddingBottom: 8 }}>
                      <ConfirmButton
                        label={`Șterge ${s.title}`}
                        confirmText="Sigur? Șterge"
                        onConfirm={() => {
                          setLibrary((l) => l.filter((x) => x.id !== s.id));
                          setSetState((x) => x.filter((id) => id !== s.id));
                          setEditing(null);
                          start(() => deleteSong(s.id));
                          toast("Cântare ștearsă");
                        }}
                      >
                        <Icon name="trash" />
                        Șterge din bibliotecă
                      </ConfirmButton>
                    </div>
                  </div>
                );
              return (
                <div className="song" key={s.id}>
                  <span className="key ghostkey">{s.key}</span>
                  <div>
                    <b>{s.title}</b>
                    <span className="meta">{s.author || "–"} · {s.bpm} BPM{s.link ? " · are link" : ""}</span>
                  </div>
                  <div className="songmeta">
                    <button className="iconx" type="button" aria-label={`Modifică ${s.title}`} onClick={() => { setEditing(s.id); setAdding(false); }}>
                      <Icon name="edit" width={2} />
                    </button>
                    <button
                      className={`addsong ${inSet ? "in" : ""}`}
                      type="button"
                      aria-label={`${inSet ? "Scoate" : "Adaugă"} ${s.title}`}
                      onClick={() => {
                        if (inSet) setSet(set.filter((x) => x !== s.id));
                        else {
                          setSet([...set, s.id]);
                          toast("Adăugată pe listă");
                        }
                      }}
                    >
                      <Icon name={inSet ? "check" : "plus"} width={2.2} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
