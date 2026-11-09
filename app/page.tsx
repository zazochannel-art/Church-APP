import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { EventCard, RunSheet } from "@/components/Bits";
import { Checklist } from "@/components/Checklist";
import { Icon } from "@/components/Icon";
import { ToastButton } from "@/components/ToastButton";
import { birthdaysThisWeek, currentLeader, events, fridaySetlist, openSlots, serving, songById, tasks } from "@/lib/data";

export default function Dashboard() {
  const friday = events[0];
  const free = openSlots(serving[0]);
  const todo = tasks.filter((t) => !t.done).length;
  const setlist = fridaySetlist.map(songById).filter((s) => s !== undefined);
  const [first, ...rest] = currentLeader.name.split(" ");

  return (
    <>
      <header>
        <div className="hi">
          <span className="eyebrow">Duminică, 9 noiembrie</span>
          <h1>
            Bună, <em>{first}</em>
          </h1>
          <span className="role-tag" title={rest.join(" ")}>{currentLeader.role}</span>
        </div>
        <div className="hdr-actions">
          <button className="iconbtn gl" type="button" aria-label="Notificări">
            <Icon name="bell" />
            <span className="badge" />
          </button>
        </div>
      </header>

      <div className="stats">
        <div className="gl stat"><b>{friday.going}</b><span>înscriși vineri</span></div>
        <div className="gl stat"><b>{setlist.length}</b><span>cântări pe lista de vineri</span></div>
        <div className={`gl stat ${free.length ? "alert" : ""}`}><b>{free.length}</b><span>posturi libere vineri</span></div>
        <div className="gl stat"><b>{todo}</b><span>sarcini de făcut</span></div>
      </div>

      <div className="cols">
        <div className="colA">
          <section>
            <h2>
              Programul de vineri <Link className="link" href={`/programe/${friday.id}`}>Deschide</Link>
            </h2>
            <RunSheet event={friday} />
          </section>
          <Checklist showCount="De făcut" items={tasks.map((t) => ({ id: t.id, text: t.text, done: t.done, due: t.due, soon: t.soon, owner: t.owner }))} />
          <section>
            <h2>Următorul eveniment mare</h2>
            <EventCard event={events[1]} />
          </section>
        </div>

        <div className="colB">
          <section>
            <h2>
              Laudă vineri <Link className="link" href="/lauda">Lista</Link>
            </h2>
            <div className="gl songs">
              {setlist.map((s, i) => (
                <div className="song" key={s.id}>
                  <span className="n">{i + 1}</span>
                  <div>
                    <b>{s.title}</b>
                    <span className="meta">{s.bpm} BPM</span>
                  </div>
                  <span className="key">{s.key}</span>
                </div>
              ))}
            </div>
          </section>

          {free.length > 0 && (
            <section>
              <h2>Echipa de vineri</h2>
              <div className="gl panel" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <b>{free.length} posturi încă libere</b>
                <span className="meta">{free.join(", ")}</span>
                <Link className="btn sm" href="/echipa" style={{ alignSelf: "flex-start" }}>
                  Completează programul
                </Link>
              </div>
            </section>
          )}

          <section>
            <h2>Zile de naștere săptămâna asta</h2>
            <div className="gl mlist">
              {birthdaysThisWeek().map((p) => (
                <div className="mrow" key={p.id} style={{ cursor: "default" }}>
                  <Avatar name={p.name} />
                  <div className="grow">
                    <b>{p.name}</b>
                    <div className="meta">
                      {p.birthday} · împlinește {p.age + 1} ani
                    </div>
                  </div>
                  <ToastButton message={`Mesaj de felicitare pregătit pentru ${p.name.split(" ")[0]}`}>
                    <Icon name="cake" />
                    Felicită
                  </ToastButton>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
