// Domain model for the youth leaders app.

export type GroupName = "Adolescenți" | "Tineri" | "Lideri";

export type Person = {
  id: string;
  name: string;
  group: GroupName;
  age: number;
  /** ISO birth date when known; then age and birthday are derived from it. */
  born?: string;
  phone: string;
  birthday: string; // "12 nov"
  note: string;
};

export type Volunteer = {
  id: string;
  name: string;
  skills: string[];
  /** Availability Monday → Sunday. */
  availability: [boolean, boolean, boolean, boolean, boolean, boolean, boolean];
};

export type RunKind = "lauda" | "cuvant" | "grupe" | "altele";

export type RunItem = {
  start: string; // "19:00"
  minutes: number;
  kind: RunKind;
  title: string;
  lead: string;
};

export type Flag = { text: string; tone: "ok" | "warn" };

export type YouthEvent = {
  id: string;
  /** ISO date "2026-11-28" when known; used for sorting and "next program". */
  date?: string;
  /** Last day for multi-day events (camps). */
  endDate?: string;
  /** "19:00" */
  time?: string;
  day: string;
  month: string;
  name: string;
  when: string;
  where: string;
  /** Kept equal to signups.length. */
  going: number;
  capacity: number | null;
  organizer: string;
  price?: string;
  /** Old manual labels; alerts are now computed (see eventFlags). */
  flags?: Flag[];
  signups: { name: string; paid?: boolean }[];
  run: RunItem[];
  checklist: { text: string; done: boolean }[];
};

export type Song = {
  id: string;
  title: string;
  author: string;
  key: string;
  bpm: number;
  /** YouTube / Spotify link so the band can listen. */
  link?: string;
};

export type ServingSlot = { role: string; person: string | null; status?: "confirmat" | "asteapta" };
export type ServingTeam = { name: string; slots: ServingSlot[] };
export type ServingWeek = { label: string; date?: string; teams: ServingTeam[] };

export type Task = { id: string; text: string; due: string; soon?: boolean; owner: string; done: boolean };

export type Message = { id: string; audience: string; text: string; when: string; recipients: number; author?: string; read?: number };

export type Audience = { name: string; count: number; members: { name: string; phone: string }[] };

export type Rehearsal = { when: string; where: string };
