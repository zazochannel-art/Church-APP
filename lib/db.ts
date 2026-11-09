import "server-only";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";
import * as seed from "./seed";

// Everything lives in one SQLite file next to the app, so no external
// service is needed. Each record is stored as JSON under (kind, id).
const file = resolve(/* turbopackIgnore: true */ process.cwd(), process.env.ADUNARE_DB ?? "data/adunare.db");

type Kinds = {
  person: import("./types").Person;
  volunteer: import("./types").Volunteer;
  song: import("./types").Song;
  task: import("./types").Task;
  event: import("./types").YouthEvent;
  week: import("./types").ServingWeek;
  audience: import("./types").Audience;
  message: import("./types").Message;
  setting: { value: unknown };
};
export type Kind = keyof Kinds;

const g = globalThis as unknown as { __adunareDb?: DatabaseSync };

function open() {
  if (g.__adunareDb) return g.__adunareDb;
  mkdirSync(dirname(file), { recursive: true });
  const db = new DatabaseSync(file);
  db.exec(`
    pragma journal_mode = wal;
    create table if not exists records (
      kind text not null,
      id text not null,
      position integer not null default 0,
      data text not null,
      updated_at text not null default (datetime('now')),
      primary key (kind, id)
    );
  `);
  const empty = db.prepare("select count(*) as n from records").get() as { n: number };
  if (empty.n === 0) fill(db);
  g.__adunareDb = db;
  return db;
}

function fill(db: DatabaseSync) {
  const put = db.prepare("insert into records (kind, id, position, data) values (?, ?, ?, ?)");
  const many = <K extends Kind>(kind: K, items: Kinds[K][], id: (x: Kinds[K], i: number) => string) =>
    items.forEach((x, i) => put.run(kind, id(x, i), i, JSON.stringify(x)));
  db.exec("begin");
  many("person", seed.people, (x) => x.id);
  many("volunteer", seed.volunteers, (x) => x.id);
  many("song", seed.songs, (x) => x.id);
  many("task", seed.tasks, (x) => x.id);
  many("event", seed.events, (x) => x.id);
  many("week", seed.serving, (_, i) => `w${i + 1}`);
  many("audience", seed.audiences, (x) => x.name);
  many("message", seed.messages, (x) => x.id);
  put.run("setting", "setlist", 0, JSON.stringify({ value: seed.fridaySetlist }));
  put.run("setting", "church", 0, JSON.stringify({ value: seed.churchName }));
  put.run("setting", "leader", 0, JSON.stringify({ value: seed.currentLeader }));
  db.exec("commit");
}

export function list<K extends Kind>(kind: K): (Kinds[K] & { _id: string })[] {
  const rows = open().prepare("select id, data from records where kind = ? order by position, rowid").all(kind) as { id: string; data: string }[];
  return rows.map((r) => ({ ...(JSON.parse(r.data) as Kinds[K]), _id: r.id }));
}

export function get<K extends Kind>(kind: K, id: string): Kinds[K] | undefined {
  const row = open().prepare("select data from records where kind = ? and id = ?").get(kind, id) as { data: string } | undefined;
  return row ? (JSON.parse(row.data) as Kinds[K]) : undefined;
}

/** Insert or replace. New records go last unless `first` is set. */
export function put<K extends Kind>(kind: K, id: string, data: Kinds[K], opts: { first?: boolean } = {}) {
  const db = open();
  const exists = db.prepare("select 1 from records where kind = ? and id = ?").get(kind, id);
  if (exists) {
    db.prepare("update records set data = ?, updated_at = datetime('now') where kind = ? and id = ?").run(JSON.stringify(data), kind, id);
    return;
  }
  const edge = db.prepare(`select coalesce(${opts.first ? "min(position) - 1" : "max(position) + 1"}, 0) as p from records where kind = ?`).get(kind) as { p: number };
  db.prepare("insert into records (kind, id, position, data) values (?, ?, ?, ?)").run(kind, id, edge.p, JSON.stringify(data));
}

export function setting<T>(id: string): T {
  return (get("setting", id)?.value as T) ?? (undefined as T);
}

export function setSetting(id: string, value: unknown) {
  put("setting", id, { value });
}
