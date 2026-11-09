"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { get, list, put, setSetting } from "./db";
import type { RunKind, YouthEvent } from "./types";

const MONTHS = ["ian", "feb", "mar", "apr", "mai", "iun", "iul", "aug", "sep", "oct", "noi", "dec"];
const DAYS = ["Duminică", "Luni", "Marți", "Miercuri", "Joi", "Vineri", "Sâmbătă"];
const text = (v: unknown, max = 200) => String(v ?? "").trim().slice(0, max);
const refresh = () => revalidatePath("/", "layout");

const slug = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "program";

export async function createEvent(form: FormData) {
  const name = text(form.get("name"), 120);
  if (!name) return;
  const date = text(form.get("date"));
  const time = text(form.get("time")) || "19:00";
  const d = date ? new Date(`${date}T12:00:00`) : null;
  const cap = Number(form.get("capacity"));
  const price = text(form.get("price"), 20);
  let id = slug(name);
  for (let n = 2; get("event", id); n++) id = `${slug(name)}-${n}`;
  const event: YouthEvent = {
    id,
    day: d ? String(d.getDate()) : "–",
    month: d ? MONTHS[d.getMonth()] : "",
    name,
    when: d ? `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}, ${time}` : time,
    where: text(form.get("where"), 80) || "De stabilit",
    going: 0,
    capacity: Number.isFinite(cap) && cap > 0 ? Math.floor(cap) : null,
    organizer: text(form.get("organizer"), 80),
    ...(price ? { price: /lei/i.test(price) ? price : `${price} lei` } : {}),
    flags: [],
    signups: [],
    run: [],
    checklist: [],
  };
  put("event", id, event);
  refresh();
  redirect(`/programe/${id}`);
}

function updateEvent(id: string, change: (e: YouthEvent) => void) {
  const e = get("event", id);
  if (!e) return;
  change(e);
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

const addMinutes = (hhmm: string, m: number) => {
  const [h, mm] = hhmm.split(":").map(Number);
  const t = (h * 60 + mm + m) % (24 * 60);
  return `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
};

export async function addRunItem(eventId: string, item: { title: string; minutes: number; kind: RunKind; lead: string }) {
  const title = text(item.title, 120);
  const minutes = Math.max(1, Math.min(600, Math.floor(Number(item.minutes) || 10)));
  const kind: RunKind = ["lauda", "cuvant", "grupe", "altele"].includes(item.kind) ? item.kind : "altele";
  if (!title) return;
  updateEvent(eventId, (e) => {
    const last = e.run.at(-1);
    const start = last ? addMinutes(last.start, last.minutes) : (e.when.match(/\d{1,2}:\d{2}/)?.[0] ?? "19:00").padStart(5, "0");
    e.run.push({ start, minutes, kind, title, lead: text(item.lead, 80) });
  });
}

export async function removeRunItem(eventId: string, index: number) {
  updateEvent(eventId, (e) => {
    e.run.splice(index, 1);
    // Keep the times continuous after a removal.
    for (let i = 1; i < e.run.length; i++) e.run[i].start = addMinutes(e.run[i - 1].start, e.run[i - 1].minutes);
  });
}

export async function addSignup(eventId: string, name: string) {
  const n = text(name, 80);
  if (!n) return;
  updateEvent(eventId, (e) => {
    if (e.signups.some((s) => s.name === n)) return;
    e.signups.push(e.price ? { name: n, paid: false } : { name: n });
    e.going += 1;
  });
}

export async function togglePaid(eventId: string, name: string) {
  updateEvent(eventId, (e) => {
    const s = e.signups.find((x) => x.name === name);
    if (s && e.price) s.paid = !s.paid;
  });
}

export async function toggleTask(id: string) {
  const t = get("task", id);
  if (!t) return;
  put("task", id, { ...t, done: !t.done });
  refresh();
}

export async function addTask(item: string, owner: string, due: string) {
  const t = text(item, 120);
  if (!t) return;
  const id = `t${Date.now()}`;
  put("task", id, { id, text: t, owner: text(owner, 80), due: text(due, 40), done: false });
  refresh();
}

export async function saveSetlist(ids: string[]) {
  const known = new Set(list("song").map((s) => s._id));
  setSetting("setlist", [...new Set(ids)].filter((id) => known.has(id)));
  refresh();
}

export async function addSong(song: { title: string; author: string; key: string; bpm: number }) {
  const title = text(song.title, 120);
  if (!title) return;
  const id = `s${Date.now()}`;
  put("song", id, { id, title, author: text(song.author, 80), key: text(song.key, 4) || "C", bpm: Math.floor(Number(song.bpm)) || 70 });
  refresh();
}

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

export async function sendMessage(audience: string, body: string) {
  const t = text(body, 1000);
  const a = list("audience").find((x) => x.name === audience);
  if (!t || !a) return null;
  const id = `m${Date.now()}`;
  const msg = { id, audience: a.name, text: t, when: new Date().toISOString(), recipients: a.count, read: 0 };
  put("message", id, msg, { first: true });
  refresh();
  return msg;
}
