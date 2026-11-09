// Domain model for the youth leaders app. Mirrors supabase/migrations/0001_init.sql.

export type GroupName = "Adolescenți" | "Tineri" | "Lideri";

export type Person = {
  id: string;
  name: string;
  group: GroupName;
  age: number;
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
  day: string;
  month: string;
  name: string;
  when: string;
  where: string;
  going: number;
  capacity: number | null;
  organizer: string;
  price?: string;
  flags: Flag[];
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
};

export type ServingSlot = { role: string; person: string | null; status?: "confirmat" | "asteapta" };
export type ServingTeam = { name: string; slots: ServingSlot[] };
export type ServingWeek = { label: string; teams: ServingTeam[] };

export type Task = { id: string; text: string; due: string; soon?: boolean; owner: string; done: boolean };

export type Message = { id: string; audience: string; text: string; when: string; recipients: number; read: number };
