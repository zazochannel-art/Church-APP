// Example content the database is filled with on first start. Not real people.
import { addDays, iso, MONTHS_SHORT, nextWeekday, parse, whenText } from "./dates";
import type { Message, Person, Rehearsal, ServingWeek, Song, Task, Volunteer, YouthEvent } from "./types";

// Example dates are placed relative to the first start, so the demo always
// shows an upcoming Friday, a camp at the end of the year and a tournament.
const friday = iso(nextWeekday(5));
const camp = (() => {
  const y = new Date().getFullYear();
  const d = `${y}-12-28`;
  return d >= friday ? d : `${y + 1}-12-28`;
})();
const tournament = iso(nextWeekday(6, parse(addDays(camp, 14))));
const at = (date: string, time?: string, endDate?: string) => {
  const d = parse(date);
  return { date, time, endDate, day: String(d.getDate()), month: MONTHS_SHORT[d.getMonth()], when: whenText(date, time, endDate) };
};

export const churchName = "Biserica Harul";

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
  { id: "s1", title: "Ești bun", author: "Laudă tineret", key: "G", bpm: 72, link: "https://www.youtube.com/results?search_query=E%C8%99ti+bun+cantare" },
  { id: "s2", title: "Mare e credincioșia Ta", author: "Imn", key: "D", bpm: 68 },
  { id: "s3", title: "Isus, Numele Tău", author: "Laudă tineret", key: "A", bpm: 126, link: "https://www.youtube.com/results?search_query=Isus+Numele+T%C4%83u" },
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

export const events: YouthEvent[] = ([
  {
    id: "seara-de-tineret", ...at(friday, "19:00"), name: "Seara de tineret: Credința în săptămâna de luni",
    where: "Sala mare", capacity: null, organizer: "Mihai Dobre",
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
    id: "tabara-de-iarna", ...at(camp, "08:00", addDays(camp, 3)), name: "Tabăra de iarnă la Vatra Dornei",
    where: "Cabana Izvorul", capacity: 50, organizer: "Ioana Petrescu", price: "650 lei",
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
    id: "turneu-fotbal", ...at(tournament, "10:00"), name: "Turneu de fotbal între biserici",
    where: "Baza sportivă Nord", capacity: 24, organizer: "Cristi Lungu",
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
] as Omit<YouthEvent, "going">[]).map((e) => ({ ...e, going: e.signups.length }));

export const serving: ServingWeek[] = [
  {
    label: whenText(friday), date: friday,
    teams: [
      { name: "Laudă", slots: [
        { role: "Voce", person: "Eliza Toma", status: "confirmat" }, { role: "Pian", person: "Sara Ilie", status: "confirmat" },
        { role: "Chitară", person: "Timotei Vasile", status: "asteapta" }, { role: "Tobe", person: null } ] },
      { name: "Tehnică", slots: [{ role: "Sunet", person: "Beni Rusu", status: "confirmat" }, { role: "Proiecție", person: null }] },
      { name: "Primire", slots: [{ role: "Ușă", person: "Ruth Andrei", status: "confirmat" }, { role: "Cafea", person: "Cristi Lungu", status: "asteapta" }] },
    ],
  },
  {
    label: whenText(addDays(friday, 7)), date: addDays(friday, 7),
    teams: [
      { name: "Laudă", slots: [
        { role: "Voce", person: "Ana Munteanu", status: "asteapta" }, { role: "Pian", person: null },
        { role: "Chitară", person: "Timotei Vasile", status: "confirmat" }, { role: "Tobe", person: "Paul Neagu", status: "confirmat" } ] },
      { name: "Tehnică", slots: [{ role: "Sunet", person: null }, { role: "Proiecție", person: "Marcu Stan", status: "confirmat" }] },
      { name: "Primire", slots: [{ role: "Ușă", person: null }, { role: "Cafea", person: null }] },
    ],
  },
];

export const rehearsal: Rehearsal = { when: "Vineri, 17:30", where: "Capela" };

export const messages: Message[] = [
  { id: "m1", audience: "Toți tinerii", text: "Vinerea aceasta ne întâlnim în Sala mare, nu în Capelă. Vă așteptăm la 19:00!", when: new Date(Date.now() - 3 * 864e5).toISOString(), recipients: 12, author: "Mihai Dobre" },
  { id: "m2", audience: "Înscriși · Tabăra de iarnă la Vatra Dornei", text: "Mai sunt 3 locuri. Plata se face până pe 1 decembrie, la Ioana.", when: new Date(Date.now() - 864e5).toISOString(), recipients: 7, author: "Ioana Petrescu" },
];

