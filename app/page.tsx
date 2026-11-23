import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { EventCard, RunSheet } from "@/components/Bits";
import { Icon } from "@/components/Icon";
import { DAYS_LONG, MONTHS_LONG, today } from "@/lib/dates";
import { waTo } from "@/lib/share";
import { birthdaysSoon, eventFlags, getEvents, getMe, getPeople, getSetlist, getSongs, getTasks, getWeeks, openSlots, sortEvents } from "@/lib/store";
import { TaskList } from "./TaskList";

export default async function Dashboard() {
  const [me, events, weeks, tasks, songs, setIds, people] = await Promise.all([
    getMe(), getEvents(), getWeeks(), getTasks(), getSongs(), getSetlist(), getPeople(),
  ]);
  const now = new Date();
  const { up } = sortEvents(events);
  const next = up[0];
  const bigOne = up.find((e) => e !== next && (e.price || e.endDate)) ?? up[1];
  const week = weeks.find((w) => !w.date || w.date >= today()) ?? weeks.at(-1);
  const free = week ? openSlots(week) : [];
  const todo = tasks.filter((t) => !t.done).length;
  const setlist = setIds.map((id) => songs.find((s) => s.id === id)).filter((s) => s !== undefined);
  const birthdays = birthdaysSoon(people, now);
  const first = me.split(" ")[0];
  const leaders = people.filter((p) => p.group !== "Adolescenți").map((p) => p.name);

  return (
    <>
      <header>
        <div className="hi">
          <span className="eyebrow">{DAYS_LONG[now.getDay()]}, {now.getDate()} {MONTHS_LONG[now.getMonth()]}</span>
          <h1>
            Bună{first ? ", " : ""}
            <em>{first || "ziua"}</em>
          </h1>
        </div>
        <div className="hdr-actions">
          <Link className="iconbtn gl mob" href="/setari" aria-label="Setări">
            <Icon name="gear" />
          </Link>
        </div>
      </header>

      <div className="stats">
        <Link href={next ? `/programe/${next.id}` : "/programe"} className="gl stat">
          <b>{next?.signups.length ?? 0}</b>
          <span>înscriși la următorul program</span>
        </Link>
        <Link href="/lauda" className="gl stat">
          <b>{setlist.length}</b>
          <span>cântări pe listă</span>
        </Link>
        <Link href="/echipa" className={`gl stat ${free.length ? "alert" : ""}`}>
          <b>{free.length}</b>
          <span>posturi libere {week ? week.label.split(",")[0].toLowerCase() : ""}</span>
        </Link>
        <a href="#de-facut" className="gl stat">
          <b>{todo}</b>
          <span>sarcini de făcut</span>
        </a>
      </div>

      <div className="cols">
        <div className="colA">
          {next ? (
            <section>
              <h2>
                <span>Următorul program <span className="meta">· {next.when}</span></span>
                <Link className="link" href={`/programe/${next.id}`}>Deschide</Link>
              </h2>
              <div className="meta" style={{ marginTop: -6 }}>{next.name} · {next.where}</div>
              <RunSheet event={next} />
            </section>
          ) : (
            <section>
              <h2>Următorul program</h2>
              <div className="gl panel empty">
                <span className="meta">Niciun program planificat.</span>
                <Link className="btn sm" href="/programe/nou"><Icon name="plus" width={2.2} />Program nou</Link>
              </div>
            </section>
          )}
          <TaskList tasks={tasks} people={leaders} me={me} />
          {bigOne && (
            <section>
              <h2>Următorul eveniment mare</h2>
              <EventCard event={bigOne} flags={eventFlags(bigOne)} />
            </section>
          )}
        </div>

        <div className="colB">
          <section>
            <h2>
              Laudă <Link className="link" href="/lauda">Lista</Link>
            </h2>
            <div className="gl songs">
              {setlist.length === 0 && <div className="song meta" style={{ gridTemplateColumns: "1fr" }}>Lista de cântări e goală.</div>}
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

          {week && (
            <section>
              <h2>Slujire · {week.label}</h2>
              <div className="gl panel" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {free.length ? (
                  <>
                    <b>{free.length} {free.length === 1 ? "post încă liber" : "posturi încă libere"}</b>
                    <span className="meta">{free.join(", ")}</span>
                    <Link className="btn sm" href="/echipa" style={{ alignSelf: "flex-start" }}>
                      Completează programul
                    </Link>
                  </>
                ) : (
                  <span className="meta">Toate posturile sunt ocupate.</span>
                )}
              </div>
            </section>
          )}

          <section>
            <h2>Zile de naștere în următoarele 7 zile</h2>
            <div className="gl mlist">
              {birthdays.length === 0 && <div className="meta" style={{ padding: "14px 0" }}>Nicio zi de naștere în următoarele 7 zile.</div>}
              {birthdays.map(({ person: p, inDays }) => (
                <div className="mrow" key={p.id} style={{ cursor: "default" }}>
                  <Avatar name={p.name} />
                  <div className="grow">
                    <b>{p.name}</b>
                    <div className="meta">
                      {inDays === 0 ? "azi" : inDays === 1 ? "mâine" : p.birthday} · împlinește {p.age + (inDays === 0 && p.born ? 0 : 1)} ani
                    </div>
                  </div>
                  {p.phone && (
                    <a
                      className="btn ghost sm"
                      href={waTo(p.phone, `La mulți ani, ${p.name.split(" ")[0]}! Domnul să te binecuvânteze în noul an de viață. 🎉`)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Icon name="cake" />
                      Felicită
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
