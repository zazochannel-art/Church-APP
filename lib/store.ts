import "server-only";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { NAME_COOKIE } from "./auth";
import { ageFrom, birthdayFrom, birthdayParts, today } from "./dates";
import { get, list, setting } from "./db";
import type { Audience, Flag, Message, Person, Rehearsal, ServingWeek, Song, Task, Volunteer, YouthEvent } from "./types";

// Read helpers for pages. `connection()` makes each page read fresh data
// on every request instead of being frozen at build time.
const fresh = async () => {
  await connection();
};
const strip = <T,>(rows: (T & { _id: string })[]) => rows.map(({ _id, ...x }) => x as T);

export async function getChurch() {
  await fresh();
  return { name: setting<string>("church") || "Biserica" };
}

/** The name this leader typed when logging in on this device. */
export async function getMe() {
  const v = (await cookies()).get(NAME_COOKIE)?.value;
  return v ? decodeURIComponent(v) : "";
}

export async function getPeople() {
  await fresh();
  return strip<Person>(list("person"))
    .map((p) => (p.born ? { ...p, age: ageFrom(p.born), birthday: birthdayFrom(p.born) } : p))
    .sort((a, b) => a.name.localeCompare(b.name, "ro"));
}
export async function getVolunteers() {
  await fresh();
  return strip<Volunteer>(list("volunteer")).sort((a, b) => a.name.localeCompare(b.name, "ro"));
}
export async function getSongs() {
  await fresh();
  return strip<Song>(list("song")).sort((a, b) => a.title.localeCompare(b.title, "ro"));
}
export async function getSetlist() {
  await fresh();
  return setting<string[]>("setlist") ?? [];
}
export async function getRehearsal() {
  await fresh();
  return setting<Rehearsal>("rehearsal") ?? { when: "", where: "" };
}
export async function getTasks() {
  await fresh();
  return strip<Task>(list("task"));
}

const lastDay = (e: YouthEvent) => e.endDate ?? e.date ?? "";
/** Upcoming first (soonest on top), then past ones (most recent on top). Undated ones stay with upcoming. */
export function sortEvents(events: YouthEvent[], now = today()) {
  const up = events.filter((e) => !e.date || lastDay(e) >= now).sort((a, b) => (a.date ?? "9999").localeCompare(b.date ?? "9999"));
  const past = events.filter((e) => e.date && lastDay(e) < now).sort((a, b) => lastDay(b).localeCompare(lastDay(a)));
  return { up, past };
}
export async function getEvents() {
  await fresh();
  return strip<YouthEvent>(list("event"));
}
export async function getEvent(id: string) {
  await fresh();
  return get("event", id);
}
export async function getWeeks() {
  await fresh();
  return list("week")
    .map(({ _id, ...w }) => ({ ...(w as ServingWeek), id: _id }))
    .sort((a, b) => (a.date ?? "").localeCompare(b.date ?? ""));
}
export async function getMessages() {
  await fresh();
  return strip<Message>(list("message")).sort((a, b) => b.when.localeCompare(a.when));
}

/** Who a message can go to, built from the real lists. */
export function audiencesFrom(people: Person[], volunteers: Volunteer[], weeks: ServingWeek[], events: YouthEvent[]): Audience[] {
  const band = [...new Set(weeks.flatMap((w) => w.teams.filter((t) => /laud/i.test(t.name)).flatMap((t) => t.slots.map((s) => s.person).filter(Boolean) as string[])))];
  const groups = ["Adolescenți", "Tineri", "Lideri"] as const;
  const phone = new Map(people.map((p) => [p.name, p.phone]));
  const make = (name: string, names: string[]) => {
    const members = [...new Set(names)].map((n) => ({ name: n, phone: phone.get(n) ?? "" }));
    return { name, count: members.length, members };
  };
  return [
    make("Toți tinerii", people.map((p) => p.name)),
    ...groups.map((g) => make(g, people.filter((p) => p.group === g).map((p) => p.name))),
    make("Trupa de laudă", band),
    make("Voluntari", volunteers.map((v) => v.name)),
    ...sortEvents(events).up.filter((e) => e.signups.length).map((e) => make(`Înscriși · ${e.name}`, e.signups.map((s) => s.name))),
  ];
}
export async function getAudiences() {
  const [people, volunteers, weeks, events] = await Promise.all([getPeople(), getVolunteers(), getWeeks(), getEvents()]);
  return audiencesFrom(people, volunteers, weeks, events);
}

/** Alerts shown on a program card, computed from its data. */
export function eventFlags(e: YouthEvent): Flag[] {
  const flags: Flag[] = [];
  const unpaid = e.price ? e.signups.filter((s) => !s.paid).length : 0;
  if (unpaid) flags.push({ text: `${unpaid} ${unpaid === 1 ? "plată restantă" : "plăți restante"}`, tone: "warn" });
  if (e.capacity && e.signups.length >= e.capacity) flags.push({ text: "Locuri ocupate", tone: "warn" });
  else if (e.capacity && e.capacity - e.signups.length <= 3) flags.push({ text: `Mai sunt ${e.capacity - e.signups.length} locuri`, tone: "warn" });
  const left = e.checklist.filter((c) => !c.done).length;
  if (e.checklist.length) flags.push(left ? { text: `Pregătire ${e.checklist.length - left}/${e.checklist.length}`, tone: "warn" } : { text: "Pregătire gata", tone: "ok" });
  if (!e.run.length) flags.push({ text: "Fără program pe momente", tone: "warn" });
  return flags;
}

export const openSlots = (week: ServingWeek) => week.teams.flatMap((t) => t.slots.filter((s) => !s.person).map((s) => `${t.name} · ${s.role}`));

/** People whose birthday ("12 nov") falls in the next 7 days, soonest first. */
export function birthdaysSoon(people: Person[], now = new Date()) {
  const out: { person: Person; inDays: number }[] = [];
  for (const p of people) {
    const b = birthdayParts(p.birthday);
    if (!b) continue;
    for (let k = 0; k < 7; k++) {
      const x = new Date(now.getFullYear(), now.getMonth(), now.getDate() + k);
      if (x.getMonth() === b.month && x.getDate() === b.day) out.push({ person: p, inDays: k });
    }
  }
  return out.sort((a, b) => a.inDays - b.inDays);
}
