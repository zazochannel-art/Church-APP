// Sample data so the app can be explored before the database is connected.
// Everything here is example content, not real people.
import type { Message, Person, ServingWeek, Song, Task, Volunteer, YouthEvent } from "./types";

export const churchName = "Biserica Harul";
export const currentLeader = { name: "Mihai Dobre", role: "Lider tineret" };

export const people: Person[] = [
  { id: "p1", name: "Ana Munteanu", group: "Adolescenți", age: 16, phone: "0721 334 120", birthday: "12 nov", note: "Cântă la pian. Vrea să slujească în laudă." },
  { id: "p2", name: "Beni Rusu", group: "Adolescenți", age: 15, phone: "0744 982 001", birthday: "3 feb", note: "Ajută la sunet." },
  { id: "p3", name: "Cristi Lungu", group: "Tineri", age: 22, phone: "0755 210 778", birthday: "28 aug", note: "Student, vine din martie." },
  { id: "p4", name: "David Ciobanu", group: "Adolescenți", age: 17, phone: "0730 551 909", birthday: "14 nov", note: "Tatăl a fost în spital, să-l sunăm." },
  { id: "p5", name: "Eliza Toma", group: "Tineri", age: 19, phone: "0766 004 312", birthday: "9 ian", note: "Voce, trupa de laudă." },
  { id: "p6", name: "Filip Grigore", group: "Adolescenți", age: 14, phone: "0712 448 210", birthday: "21 iun", note: "Nou, primul an." },
  { id: "p7", name: "Ioana Petrescu", group: "Lideri", age: 27, phone: "0722 100 450", birthday: "5 mai", note: "Co-lider adolescenți." },
  { id: "p8", name: "Marcu Stan", group: "Tineri", age: 24, phone: "0745 778 120", birthday: "30 sep", note: "Proiecție și media." },
  { id: "p9", name: "Paul Neagu", group: "Tineri", age: 21, phone: "0733 290 664", birthday: "17 dec", note: "Tobe." },
  { id: "p10", name: "Ruth Andrei", group: "Lideri", age: 31, phone: "0720 910 223", birthday: "2 apr", note: "Grupa de casă Centru." },
  { id: "p11", name: "Sara Ilie", group: "Adolescenți", age: 16, phone: "0751 663 018", birthday: "11 oct", note: "Pian." },
  { id: "p12", name: "Timotei Vasile", group: "Tineri", age: 20, phone: "0742 330 517", birthday: "25 iul", note: "Chitară." },
];

export const volunteers: Volunteer[] = [
  { id: "v1", name: "Ruth Andrei", skills: ["Primire", "Bucătărie"], availability: [true, false, false, true, true, true, false] },
  { id: "v2", name: "Cristi Lungu", skills: ["Cafea", "Logistică", "Șofer"], availability: [false, false, true, false, true, true, false] },
  { id: "v3", name: "Marcu Stan", skills: ["Proiecție", "Foto/Video"], availability: [false, true, false, false, true, false, true] },
  { id: "v4", name: "Beni Rusu", skills: ["Sunet"], availability: [false, false, false, false, true, true, false] },
  { id: "v5", name: "Lidia Sava", skills: ["Copii", "Decor"], availability: [true, true, false, true, false, true, true] },
  { id: "v6", name: "Andrei Pop", skills: ["Șofer", "Montaj scenă"], availability: [false, false, false, false, true, true, true] },
];

export const songs: Song[] = [
  { id: "s1", title: "Ești bun", author: "Laudă tineret", key: "G", bpm: 72 },
  { id: "s2", title: "Mare e credincioșia Ta", author: "Imn", key: "D", bpm: 68 },
  { id: "s3", title: "Isus, Numele Tău", author: "Laudă tineret", key: "A", bpm: 126 },
  { id: "s4", title: "Harul Tău mă ține", author: "Laudă tineret", key: "E", bpm: 76 },
  { id: "s5", title: "Doamne, Tu ești tot ce am", author: "Laudă tineret", key: "C", bpm: 70 },
  { id: "s6", title: "Biruitor e Mielul", author: "Laudă tineret", key: "B", bpm: 132 },
  { id: "s7", title: "Cât de mare ești", author: "Imn", key: "Bb", bpm: 66 },
  { id: "s8", title: "Duh Sfânt, vino", author: "Laudă tineret", key: "F", bpm: 74 },
  { id: "s9", title: "În Tine mă încred", author: "Laudă tineret", key: "D", bpm: 118 },
];

export const fridaySetlist = ["s3", "s6", "s4", "s1"];

export const tasks: Task[] = [
  { id: "t1", text: "Rezervă autocarul pentru tabără", due: "până pe 20 nov", soon: true, owner: "Mihai Dobre", done: false },
  { id: "t2", text: "Trimite lista de cântări trupei", due: "miercuri", soon: true, owner: "Eliza Toma", done: false },
  { id: "t3", text: "Pregătește întrebările pentru grupe", due: "vineri, 17:00", owner: "Mihai Dobre", done: false },
  { id: "t4", text: "Cumpără gustări pentru seara de tineret", due: "vineri", owner: "Ruth Andrei", done: true },
];

export const events: YouthEvent[] = [
  {
    id: "seara-de-tineret", day: "14", month: "noi", name: "Seara de tineret: Credința în săptămâna de luni",
    when: "Vineri, 19:00", where: "Sala mare", going: 43, capacity: null, organizer: "Mihai Dobre",
    flags: [{ text: "2 posturi de slujire libere", tone: "warn" }],
    signups: ["Ana Munteanu", "Beni Rusu", "Cristi Lungu", "Eliza Toma", "Filip Grigore", "Sara Ilie"].map((name) => ({ name })),
    run: [
      { start: "19:00", minutes: 10, kind: "altele", title: "Bun venit și anunțuri", lead: "Ioana Petrescu" },
      { start: "19:10", minutes: 20, kind: "lauda", title: "Laudă și închinare (4 cântări)", lead: "Eliza Toma" },
      { start: "19:30", minutes: 5, kind: "altele", title: "Rugăciune", lead: "Ruth Andrei" },
      { start: "19:35", minutes: 30, kind: "cuvant", title: "Mesaj: Credința în săptămâna de luni", lead: "Daniel Pavel" },
      { start: "20:05", minutes: 25, kind: "grupe", title: "Discuții pe grupe", lead: "Mihai Dobre" },
      { start: "20:30", minutes: 30, kind: "altele", title: "Gustări și părtășie", lead: "Cristi Lungu" },
    ],
    checklist: [
      { text: "Predică pregătită (Daniel P.)", done: true },
      { text: "Lista de cântări trimisă trupei", done: false },
      { text: "Gustări", done: true },
      { text: "Proiecție: slide-uri", done: false },
    ],
  },
  {
    id: "tabara-de-iarna", day: "28", month: "dec", name: "Tabăra de iarnă la Vatra Dornei",
    when: "28 – 31 decembrie", where: "Cabana Izvorul", going: 47, capacity: 50, organizer: "Ioana Petrescu", price: "650 lei",
    flags: [{ text: "9 plăți restante", tone: "warn" }, { text: "Cabana confirmată", tone: "ok" }],
    signups: [
      { name: "Ana Munteanu", paid: true }, { name: "David Ciobanu", paid: false }, { name: "Eliza Toma", paid: true },
      { name: "Filip Grigore", paid: false }, { name: "Paul Neagu", paid: true }, { name: "Sara Ilie", paid: true }, { name: "Timotei Vasile", paid: true },
    ],
    run: [
      { start: "08:00", minutes: 30, kind: "altele", title: "Plecare cu autocarul de la biserică", lead: "Andrei Pop" },
      { start: "13:00", minutes: 60, kind: "altele", title: "Cazare și prânz", lead: "Ruth Andrei" },
      { start: "16:00", minutes: 90, kind: "grupe", title: "Jocuri pe echipe", lead: "Cristi Lungu" },
      { start: "19:00", minutes: 30, kind: "lauda", title: "Laudă", lead: "Eliza Toma" },
      { start: "19:30", minutes: 45, kind: "cuvant", title: "Mesaj de deschidere", lead: "Daniel Pavel" },
    ],
    checklist: [
      { text: "Avans cabană plătit", done: true },
      { text: "Autocar rezervat", done: false },
      { text: "Program pe zile", done: false },
      { text: "Meniu și bucătari", done: false },
    ],
  },
  {
    id: "turneu-fotbal", day: "10", month: "ian", name: "Turneu de fotbal între biserici",
    when: "Sâmbătă, 10:00", where: "Baza sportivă Nord", going: 18, capacity: 24, organizer: "Cristi Lungu",
    flags: [{ text: "Teren rezervat", tone: "ok" }],
    signups: ["Beni Rusu", "Cristi Lungu", "Filip Grigore", "Marcu Stan", "Paul Neagu"].map((name) => ({ name })),
    run: [
      { start: "10:00", minutes: 15, kind: "altele", title: "Încălzire și rugăciune", lead: "Cristi Lungu" },
      { start: "10:15", minutes: 120, kind: "altele", title: "Meciuri", lead: "Cristi Lungu" },
      { start: "12:15", minutes: 30, kind: "altele", title: "Premiere și masă", lead: "Ruth Andrei" },
    ],
    checklist: [
      { text: "Teren rezervat", done: true },
      { text: "Arbitru", done: false },
      { text: "Tricouri", done: false },
    ],
  },
];

export const serving: ServingWeek[] = [
  {
    label: "Vineri, 14 nov",
    teams: [
      { name: "Laudă", slots: [
        { role: "Voce", person: "Eliza Toma", status: "confirmat" }, { role: "Pian", person: "Sara Ilie", status: "confirmat" },
        { role: "Chitară", person: "Timotei Vasile", status: "asteapta" }, { role: "Tobe", person: null } ] },
      { name: "Tehnică", slots: [{ role: "Sunet", person: "Beni Rusu", status: "confirmat" }, { role: "Proiecție", person: null }] },
      { name: "Primire", slots: [{ role: "Ușă", person: "Ruth Andrei", status: "confirmat" }, { role: "Cafea", person: "Cristi Lungu", status: "asteapta" }] },
    ],
  },
  {
    label: "Vineri, 21 nov",
    teams: [
      { name: "Laudă", slots: [
        { role: "Voce", person: "Ana Munteanu", status: "asteapta" }, { role: "Pian", person: null },
        { role: "Chitară", person: "Timotei Vasile", status: "confirmat" }, { role: "Tobe", person: "Paul Neagu", status: "confirmat" } ] },
      { name: "Tehnică", slots: [{ role: "Sunet", person: null }, { role: "Proiecție", person: "Marcu Stan", status: "confirmat" }] },
      { name: "Primire", slots: [{ role: "Ușă", person: null }, { role: "Cafea", person: null }] },
    ],
  },
];

export const audiences: { name: string; count: number }[] = [
  { name: "Toți tinerii", count: 55 }, { name: "Adolescenți", count: 24 }, { name: "Tineri 18–30", count: 31 },
  { name: "Lideri", count: 6 }, { name: "Trupa de laudă", count: 9 }, { name: "Voluntari", count: 14 }, { name: "Tabăra de iarnă", count: 47 },
];

export const messages: Message[] = [
  { id: "m1", audience: "Toți tinerii", text: "Vinerea aceasta ne întâlnim în Sala mare, nu în Capelă. Vă așteptăm la 19:00!", when: "acum 3 zile", recipients: 55, read: 41 },
  { id: "m2", audience: "Tabăra de iarnă", text: "Mai sunt 3 locuri. Plata se face până pe 1 decembrie, la Ioana.", when: "ieri", recipients: 47, read: 29 },
];

export const songById = (id: string) => songs.find((s) => s.id === id);
export const eventById = (id: string) => events.find((e) => e.id === id);
export const openSlots = (week: ServingWeek) => week.teams.flatMap((t) => t.slots.filter((s) => !s.person).map((s) => `${t.name} · ${s.role}`));
export const birthdaysThisWeek = () => people.filter((p) => /^1[0-6] nov$/.test(p.birthday));
