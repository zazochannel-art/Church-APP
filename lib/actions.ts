"use server";

import { revalidatePath } from "next/cache";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE, MAX_AGE, NAME_COOKIE, same, tokenFor } from "./auth";
import { addDays, iso, MONTHS_SHORT, nextWeekday, parse, whenText } from "./dates";
import { clearData, get, list, put, remove, restore, setSetting } from "./db";
import type { GroupName, Person, RunKind, ServingWeek, Song, Volunteer, YouthEvent } from "./types";

const text = (v: unknown, max = 200) => String(v ?? "").trim().slice(0, max);
const isoDate = (v: unknown) => (/^\d{4}-\d{2}-\d{2}$/.test(String(v ?? "")) ? String(v) : "");
const hhmm = (v: unknown) => (/^\d{1,2}:\d{2}$/.test(String(v ?? "")) ? String(v).padStart(5, "0") : "");
const refresh = () => revalidatePath("/", "layout");
const uid = (p: string) => `${p}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
const GROUPS: GroupName[] = ["Adolescenți", "Tineri", "Lideri"];

const slug = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "program";

/* ---------- access ---------- */

export async function login(_: unknown, form: FormData) {
  const password = process.env.ADUNARE_PAROLA ?? "";
  const given = text(form.get("password"), 200);
  const name = text(form.get("name"), 60);
  const next = text(form.get("next"), 300);
  if (!password || !same(given, password)) {
    await new Promise((r) => setTimeout(r, 800)); // slows down guessing
    return { error: "Parola nu este corectă." };
  }
  // Secure cookies only over HTTPS, so a plain http://IP:3000 test server still works.
  const secure = (await headers()).get("x-forwarded-proto")?.split(",")[0].trim() === "https";
  const jar = await cookies();
  jar.set(COOKIE, await tokenFor(password), { httpOnly: true, sameSite: "lax", secure, maxAge: MAX_AGE, path: "/" });
  if (name) jar.set(NAME_COOKIE, encodeURIComponent(name), { httpOnly: true, sameSite: "lax", secure, maxAge: MAX_AGE, path: "/" });
  redirect(next.startsWith("/") && !next.startsWith("//") ? next : "/");
}

export async function logout() {
  const jar = await cookies();
  jar.delete(COOKIE);
  redirect("/intrare");
}

export async function setMyName(name: string) {
  const n = text(name, 60);
  const jar = await cookies();
  if (n) jar.set(NAME_COOKIE, encodeURIComponent(n), { httpOnly: true, sameSite: "lax", maxAge: MAX_AGE, path: "/" });
  else jar.delete(NAME_COOKIE);
  refresh();
}

const me = async () => {
  const v = (await cookies()).get(NAME_COOKIE)?.value;
  return v ? decodeURIComponent(v) : "";
};

/* ---------- programs ---------- */

function eventFields(form: FormData) {
  const date = isoDate(form.get("date"));
  const endRaw = isoDate(form.get("endDate"));
  const endDate = date && endRaw > date ? endRaw : undefined;
  const time = hhmm(form.get("time")) || "19:00";
  const d = date ? parse(date) : null;
  const cap = Number(form.get("capacity"));
  const price = text(form.get("price"), 20);
  return {
    date: date || undefined,
    endDate,
    time,
    day: d ? String(d.getDate()) : "–",
    month: d ? MONTHS_SHORT[d.getMonth()] : "",
    when: date ? whenText(date, time, endDate) : time,
    name: text(form.get("name"), 120),
    where: text(form.get("where"), 80) || "De stabilit",
    capacity: Number.isFinite(cap) && cap > 0 ? Math.floor(cap) : null,
    organizer: text(form.get("organizer"), 80),
    price: price ? (/lei|€|eur/i.test(price) ? price : `${price} lei`) : undefined,
  };
}

export async function createEvent(form: FormData) {
  const f = eventFields(form);
  if (!f.name) return;
  let id = slug(f.name);
  for (let n = 2; get("event", id); n++) id = `${slug(f.name)}-${n}`;
  const copyFrom = text(form.get("copyFrom"), 60);
  const src = copyFrom ? get("event", copyFrom) : undefined;
  const event: YouthEvent = {
    id,
    ...f,
    going: 0,
    signups: [],
    // "Copy from" brings over the run sheet and an unticked checklist.
    run: src ? structuredClone(src.run) : [],
    checklist: src ? src.checklist.map((c) => ({ text: c.text, done: false })) : [],
  };
  if (src && event.run.length) retime(event);
  put("event", id, event);
  refresh();
  redirect(`/programe/${id}`);
}

export async function updateEventDetails(id: string, form: FormData) {
  const f = eventFields(form);
  if (!f.name) return;
  updateEvent(id, (e) => {
    const timeChanged = e.time !== f.time;
    Object.assign(e, f);
    if (!f.price) delete e.price;
    if (!f.endDate) delete e.endDate;
    if (f.price) e.signups.forEach((s) => (s.paid ??= false));
    if (timeChanged && e.run.length) retime(e);
  });
  redirect(`/programe/${id}`);
}

export async function deleteEvent(id: string) {
  remove("event", id);
  refresh();
  redirect("/programe");
}

function updateEvent(id: string, change: (e: YouthEvent) => void) {
  const e = get("event", id);
  if (!e) return;
  change(e);
  e.going = e.signups.length;
  put("event", id, e);
  refresh();
}

export async function toggleEventCheck(eventId: string, index: number) {
  updateEvent(eventId, (e) => {
    if (e.checklist[index]) e.checklist[index].done = !e.checklist[index].done;
  });
}

export async function addEventCheck(eventId: string, item: string) {
  const t = text(item, 120);
  if (t) updateEvent(eventId, (e) => void e.checklist.push({ text: t, done: false }));
}

export async function removeEventCheck(eventId: string, index: number) {
  updateEvent(eventId, (e) => void e.checklist.splice(index, 1));
}

const addMinutes = (t: string, m: number) => {
  const [h, mm] = t.split(":").map(Number);
  const x = (h * 60 + mm + m) % (24 * 60);
  return `${String(Math.floor(x / 60)).padStart(2, "0")}:${String(x % 60).padStart(2, "0")}`;
};

/** Keep the run sheet continuous from the program's start time. */
function retime(e: YouthEvent) {
  if (!e.run.length) return;
  e.run[0].start = e.time ?? e.run[0].start;
  for (let i = 1; i < e.run.length; i++) e.run[i].start = addMinutes(e.run[i - 1].start, e.run[i - 1].minutes);
}

const KINDS: RunKind[] = ["lauda", "cuvant", "grupe", "altele"];

export async function addRunItem(eventId: string, item: { title: string; minutes: number; kind: RunKind; lead: string }) {
  const title = text(item.title, 120);
  const minutes = Math.max(1, Math.min(600, Math.floor(Number(item.minutes) || 10)));
  const kind: RunKind = KINDS.includes(item.kind) ? item.kind : "altele";
  if (!title) return;
  updateEvent(eventId, (e) => {
    const last = e.run.at(-1);
    const start = last ? addMinutes(last.start, last.minutes) : (e.time ?? e.when.match(/\d{1,2}:\d{2}/)?.[0] ?? "19:00").padStart(5, "0");
    e.run.push({ start, minutes, kind, title, lead: text(item.lead, 80) });
  });
}

export async function updateRunItem(eventId: string, index: number, item: { title: string; minutes: number; kind: RunKind; lead: string }) {
  const title = text(item.title, 120);
  if (!title) return;
  updateEvent(eventId, (e) => {
    const r = e.run[index];
    if (!r) return;
    r.title = title;
    r.minutes = Math.max(1, Math.min(600, Math.floor(Number(item.minutes) || r.minutes)));
    r.kind = KINDS.includes(item.kind) ? item.kind : r.kind;
    r.lead = text(item.lead, 80);
    retime(e);
  });
}

export async function moveRunItem(eventId: string, index: number, dir: -1 | 1) {
  updateEvent(eventId, (e) => {
    const j = index + dir;
    if (!e.run[index] || !e.run[j]) return;
    const first = e.run[0].start;
    [e.run[index], e.run[j]] = [e.run[j], e.run[index]];
    e.run[0].start = first;
    for (let i = 1; i < e.run.length; i++) e.run[i].start = addMinutes(e.run[i - 1].start, e.run[i - 1].minutes);
  });
}

export async function removeRunItem(eventId: string, index: number) {
  updateEvent(eventId, (e) => {
    const first = e.run[0]?.start;
    e.run.splice(index, 1);
    if (e.run[0] && first) e.run[0].start = first;
    for (let i = 1; i < e.run.length; i++) e.run[i].start = addMinutes(e.run[i - 1].start, e.run[i - 1].minutes);
  });
}

export async function addSignup(eventId: string, name: string) {
  const n = text(name, 80);
  if (!n) return;
  updateEvent(eventId, (e) => {
    if (e.signups.some((s) => s.name.toLowerCase() === n.toLowerCase())) return;
    e.signups.push(e.price ? { name: n, paid: false } : { name: n });
  });
}

export async function removeSignup(eventId: string, name: string) {
  updateEvent(eventId, (e) => void (e.signups = e.signups.filter((s) => s.name !== name)));
}

export async function togglePaid(eventId: string, name: string) {
  updateEvent(eventId, (e) => {
    const s = e.signups.find((x) => x.name === name);
    if (s && e.price) s.paid = !s.paid;
  });
}

/* ---------- tasks ---------- */

export async function toggleTask(id: string) {
  const t = get("task", id);
  if (!t) return;
  put("task", id, { ...t, done: !t.done });
  refresh();
}

export async function addTask(item: string, owner: string, due: string) {
  const t = text(item, 120);
  if (!t) return null;
  const id = uid("t");
  const task = { id, text: t, owner: text(owner, 80), due: text(due, 40), done: false };
  put("task", id, task);
  refresh();
  return task;
}

export async function deleteTask(id: string) {
  remove("task", id);
  refresh();
}

export async function clearDoneTasks() {
  list("task").filter((t) => t.done).forEach((t) => remove("task", t._id));
  refresh();
}

/* ---------- worship ---------- */

export async function saveSetlist(ids: string[]) {
  const known = new Set(list("song").map((s) => s._id));
  setSetting("setlist", [...new Set(ids)].filter((id) => known.has(id)));
  refresh();
}

const cleanLink = (v: unknown) => {
  const s = text(v, 300);
  try {
    const u = new URL(s);
    return u.protocol === "https:" || u.protocol === "http:" ? u.toString() : undefined;
  } catch {
    return undefined;
  }
};

function songFields(song: { title: string; author: string; key: string; bpm: number; link?: string }) {
  return {
    title: text(song.title, 120),
    author: text(song.author, 80),
    key: text(song.key, 4) || "C",
    bpm: Math.max(0, Math.min(300, Math.floor(Number(song.bpm)) || 0)) || 70,
    link: cleanLink(song.link),
  };
}

export async function addSong(song: { title: string; author: string; key: string; bpm: number; link?: string }) {
  const f = songFields(song);
  if (!f.title) return null;
  const id = uid("s");
  const s: Song = { id, ...f };
  if (!s.link) delete s.link;
  put("song", id, s);
  refresh();
  return s;
}

export async function updateSong(id: string, song: { title: string; author: string; key: string; bpm: number; link?: string }) {
  const old = get("song", id);
  const f = songFields(song);
  if (!old || !f.title) return;
  const s: Song = { id, ...f };
  if (!s.link) delete s.link;
  put("song", id, s);
  refresh();
}

export async function deleteSong(id: string) {
  remove("song", id);
  const set = (get("setting", "setlist")?.value as string[] | undefined) ?? [];
  setSetting("setlist", set.filter((x) => x !== id));
  refresh();
}

export async function saveRehearsal(when: string, where: string) {
  setSetting("rehearsal", { when: text(when, 60), where: text(where, 60) });
  refresh();
}

/* ---------- serving ---------- */

export async function assignSlot(weekId: string, team: number, slot: number, person: string | null) {
  const w = get("week", weekId);
  const s = w?.teams[team]?.slots[slot];
  if (!w || !s) return;
  s.person = person ? text(person, 80) : null;
  s.status = person ? "asteapta" : undefined;
  put("week", weekId, w);
  refresh();
}

export async function confirmSlot(weekId: string, team: number, slot: number) {
  const w = get("week", weekId);
  const s = w?.teams[team]?.slots[slot];
  if (!w || !s?.person) return;
  s.status = s.status === "confirmat" ? "asteapta" : "confirmat";
  put("week", weekId, w);
  refresh();
}

/** New serving date with the same teams and roles as the latest one, nobody assigned. */
export async function addWeek(date: string) {
  const weeks = list("week").sort((a, b) => (a.date ?? "").localeCompare(b.date ?? ""));
  const last = weeks.at(-1);
  const d = isoDate(date) || (last?.date ? addDays(last.date, 7) : iso(nextWeekday(5)));
  if (weeks.some((w) => w.date === d)) return null;
  const teams: ServingWeek["teams"] = last
    ? last.teams.map((t) => ({ name: t.name, slots: t.slots.map((s) => ({ role: s.role, person: null })) }))
    : [
        { name: "Laudă", slots: ["Voce", "Pian", "Chitară", "Tobe"].map((role) => ({ role, person: null })) },
        { name: "Tehnică", slots: ["Sunet", "Proiecție"].map((role) => ({ role, person: null })) },
        { name: "Primire", slots: ["Ușă", "Cafea"].map((role) => ({ role, person: null })) },
      ];
  const id = `w-${d}`;
  put("week", id, { label: whenText(d), date: d, teams });
  refresh();
  return id;
}

export async function deleteWeek(weekId: string) {
  remove("week", weekId);
  refresh();
}

export async function addSlot(weekId: string, team: number, role: string) {
  const w = get("week", weekId);
  const r = text(role, 40);
  if (!w || !r) return;
  if (team >= w.teams.length) {
    // team === teams.length means "new team" with role used as its name
    w.teams.push({ name: r, slots: [{ role: "Persoană", person: null }] });
  } else {
    w.teams[team].slots.push({ role: r, person: null });
  }
  put("week", weekId, w);
  refresh();
}

export async function removeSlot(weekId: string, team: number, slot: number) {
  const w = get("week", weekId);
  if (!w?.teams[team]) return;
  w.teams[team].slots.splice(slot, 1);
  if (!w.teams[team].slots.length) w.teams.splice(team, 1);
  put("week", weekId, w);
  refresh();
}

/* ---------- people ---------- */

function personFields(form: FormData): Omit<Person, "id"> | null {
  const name = text(form.get("name"), 80);
  if (!name) return null;
  const group = GROUPS.includes(form.get("group") as GroupName) ? (form.get("group") as GroupName) : "Tineri";
  const born = isoDate(form.get("born"));
  const age = Math.max(0, Math.min(120, Math.floor(Number(form.get("age")) || 0)));
  const bday = text(form.get("birthday"), 12);
  const p: Omit<Person, "id"> = { name, group, age, phone: text(form.get("phone"), 30), birthday: bday, note: text(form.get("note"), 1000) };
  if (born) {
    const d = parse(born);
    p.born = born;
    p.birthday = `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
  }
  return p;
}

export async function savePerson(id: string | null, form: FormData) {
  const f = personFields(form);
  if (!f) return null;
  const pid = id && get("person", id) ? id : uid("p");
  const old = id ? get("person", id) : undefined;
  const person: Person = { id: pid, ...f };
  put("person", pid, person);
  if (old && old.name !== person.name) renameEverywhere(old.name, person.name);
  refresh();
  return person;
}

export async function deletePerson(id: string) {
  remove("person", id);
  refresh();
}

/** Keep serving slots, signups and run sheets pointing at the new name. */
function renameEverywhere(from: string, to: string) {
  for (const w of list("week")) {
    let hit = false;
    w.teams.forEach((t) => t.slots.forEach((s) => s.person === from && ((s.person = to), (hit = true))));
    if (hit) put("week", w._id, w);
  }
  for (const e of list("event")) {
    let hit = false;
    e.signups.forEach((s) => s.name === from && ((s.name = to), (hit = true)));
    e.run.forEach((r) => r.lead === from && ((r.lead = to), (hit = true)));
    if (e.organizer === from) ((e.organizer = to), (hit = true));
    if (hit) put("event", e._id, e);
  }
  for (const t of list("task")) if (t.owner === from) put("task", t._id, { ...t, owner: to });
  for (const v of list("volunteer")) if (v.name === from) put("volunteer", v._id, { ...v, name: to });
}

export async function saveVolunteer(id: string | null, v: { name: string; skills: string; availability: boolean[] }) {
  const name = text(v.name, 80);
  if (!name) return null;
  const vid = id && get("volunteer", id) ? id : uid("v");
  const skills = [...new Set(text(v.skills, 300).split(/[,;]/).map((s) => s.trim()).filter(Boolean))].slice(0, 12);
  const a = Array.from({ length: 7 }, (_, i) => Boolean(v.availability?.[i])) as Volunteer["availability"];
  const vol: Volunteer = { id: vid, name, skills, availability: a };
  put("volunteer", vid, vol);
  refresh();
  return vol;
}

export async function deleteVolunteer(id: string) {
  remove("volunteer", id);
  refresh();
}

/* ---------- messages ---------- */

export async function sendMessage(audience: string, body: string, recipients: number) {
  const t = text(body, 2000);
  const a = text(audience, 140);
  if (!t || !a) return null;
  const id = uid("m");
  const msg = { id, audience: a, text: t, when: new Date().toISOString(), recipients: Math.max(0, Math.floor(recipients) || 0), author: await me() };
  put("message", id, msg, { first: true });
  refresh();
  return msg;
}

export async function deleteMessage(id: string) {
  remove("message", id);
  refresh();
}

/* ---------- settings ---------- */

export async function saveChurch(name: string) {
  const n = text(name, 80);
  if (n) setSetting("church", n);
  refresh();
}

export async function startFromZero(confirm: string) {
  if (text(confirm).toUpperCase() !== "ȘTERGE" && text(confirm).toUpperCase() !== "STERGE") return { error: "Scrie ȘTERGE ca să confirmi." };
  clearData();
  refresh();
  return { ok: true };
}

export async function restoreBackup(form: FormData) {
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "Alege fișierul de copie." };
  if (file.size > 20 * 1024 * 1024) return { error: "Fișierul e prea mare." };
  try {
    const data = JSON.parse(await file.text()) as { app?: string; records?: { kind: string; id: string; position: number; data: string }[] };
    if (data.app !== "adunare" || !Array.isArray(data.records)) return { error: "Acesta nu e o copie Adunare." };
    restore(data.records);
  } catch {
    return { error: "Fișierul nu a putut fi citit." };
  }
  refresh();
  return { ok: true };
}
