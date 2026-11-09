import "server-only";
import { connection } from "next/server";
import { get, list, setting } from "./db";
import type { Audience, Message, Person, ServingWeek, Song, Task, Volunteer, YouthEvent } from "./types";

// Read helpers for pages. `connection()` makes each page read fresh data
// on every request instead of being frozen at build time.
const fresh = async () => {
  await connection();
};
const strip = <T,>(rows: (T & { _id: string })[]) => rows.map(({ _id, ...x }) => x as T);

export async function getChurch() {
  await fresh();
  return { name: setting<string>("church"), leader: setting<{ name: string; role: string }>("leader") };
}
export async function getPeople() {
  await fresh();
  return strip<Person>(list("person"));
}
export async function getVolunteers() {
  await fresh();
  return strip<Volunteer>(list("volunteer"));
}
export async function getSongs() {
  await fresh();
  return strip<Song>(list("song"));
}
export async function getSetlist() {
  await fresh();
  return setting<string[]>("setlist") ?? [];
}
export async function getTasks() {
  await fresh();
  return strip<Task>(list("task"));
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
  return list("week").map(({ _id, ...w }) => ({ ...(w as ServingWeek), id: _id }));
}
export async function getAudiences() {
  await fresh();
  return strip<Audience>(list("audience"));
}
export async function getMessages() {
  await fresh();
  return strip<Message>(list("message"));
}

export const openSlots = (week: ServingWeek) => week.teams.flatMap((t) => t.slots.filter((s) => !s.person).map((s) => `${t.name} · ${s.role}`));

const MONTHS = ["ian", "feb", "mar", "apr", "mai", "iun", "iul", "aug", "sep", "oct", "noi", "dec"];
/** People whose birthday ("12 nov") falls in the next 7 days. */
export function birthdaysSoon(people: Person[], today = new Date()) {
  const short = ["ian", "feb", "mar", "apr", "mai", "iun", "iul", "aug", "sep", "oct", "nov", "dec"];
  return people.filter((p) => {
    const [d, m] = p.birthday.split(" ");
    const mi = short.indexOf(m) >= 0 ? short.indexOf(m) : MONTHS.indexOf(m);
    if (mi < 0) return false;
    for (let k = 0; k < 7; k++) {
      const x = new Date(today.getFullYear(), today.getMonth(), today.getDate() + k);
      if (x.getMonth() === mi && x.getDate() === Number(d)) return true;
    }
    return false;
  });
}
