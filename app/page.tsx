import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { EventCard, RunSheet } from "@/components/Bits";
import { Icon } from "@/components/Icon";
import { ToastButton } from "@/components/ToastButton";
import { birthdaysSoon, getChurch, getEvents, getPeople, getSetlist, getSongs, getTasks, getWeeks, openSlots } from "@/lib/store";
import { TaskList } from "./TaskList";

const DAYS = ["Duminică", "Luni", "Marți", "Miercuri", "Joi", "Vineri", "Sâmbătă"];
const MONTHS = ["ianuarie", "februarie", "martie", "aprilie", "mai", "iunie", "iulie", "august", "septembrie", "octombrie", "noiembrie", "decembrie"];

export default async function Dashboard() {
  const [{ leader }, events, weeks, tasks, songs, setIds, people] = await Promise.all([
    getChurch(), getEvents(), getWeeks(), getTasks(), getSongs(), getSetlist(), getPeople(),
  ]);
  const friday = events[0];
  const bigOne = events.find((e) => e !== friday && e.price) ?? events[1];
  const free = weeks[0] ? openSlots(weeks[0]) : [];
  const todo = tasks.filter((t) => !t.done).length;
  const setlist = setIds.map((id) => songs.find((s) => s.id === id)).filter((s) => s !== undefined);
  const [first, ...rest] = leader.name.split(" ");
  const now = new Date();
  const birthdays = birthdaysSoon(people, now);

  return (
    <>
      <header>
        <div className="hi">
          <span className="eyebrow">{DAYS[now.getDay()]}, {now.getDate()} {MONTHS[now.getMonth()]}</span>
          <h1>
            Bună, <em>{first}</em>
          </h1>
          <span className="role-tag" title={rest.join(" ")}>{leader.role}</span>
        </div>
        <div className="hdr-actions">
          <button className="iconbtn gl" type="button" aria-label="Notificări">
            <Icon name="bell" />
            <span className="badge" />
          </button>
        </div>
      </header>

      <div className="stats">
        <div className="gl stat"><b>{friday?.going ?? 0}</b><span>înscriși vineri</span></div>
        <div className="gl stat"><b>{setlist.length}</b><span>cântări pe lista de vineri</span></div>
        <div className={`gl stat ${free.length ? "alert" : ""}`}><b>{free.length}</b><span>posturi libere vineri</span></div>
        <div className="gl stat"><b>{todo}</b><span>sarcini de făcut</span></div>
      </div>

      <div className="cols">
        <div className="colA">
          {friday && (
            <section>
              <h2>
                Programul de vineri <Link className="link" href={`/programe/${friday.id}`}>Deschide</Link>
              </h2>
              <RunSheet event={friday} />
            </section>
          )}
          <TaskList tasks={tasks} people={people.filter((p) => p.group !== "Adolescenți").map((p) => p.name)} />
          {bigOne && (
            <section>
              <h2>Următorul eveniment mare</h2>
              <EventCard event={bigOne} />
            </section>
          )}
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
            <h2>Zile de naștere în următoarele 7 zile</h2>
            <div className="gl mlist">
              {birthdays.length === 0 && <div className="meta" style={{ padding: "14px 0" }}>Nicio zi de naștere în următoarele 7 zile.</div>}
              {birthdays.map((p) => (
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
