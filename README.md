# Adunare

Aplicație pentru liderii și organizatorii de tineret din bisericile baptiste: programe, laudă și închinare, echipă și voluntari, mesaje. Merge în browser și se poate instala pe telefon (PWA).

## Ce conține acum

| Secțiune | Ce poți face |
|---|---|
| **Panou** | Programul de vineri minut cu minut, de făcut, cântările, locuri libere în slujire, zile de naștere |
| **Programe** | Evenimente, program pe momente, înscrieri și plăți, listă de pregătire, eveniment nou |
| **Laudă** | Lista de cântări cu tonalitate și BPM, bibliotecă, playlist, repetiție, trimite lista trupei |
| **Echipă** | Slujire pe săptămâni (alegi cine slujește), voluntari cu disponibilitate, lista tinerilor cu notițe |
| **Mesaje** | Alegi cui trimiți, scrii anunțul, vezi cine l-a citit |

Datele sunt deocamdată exemple din `lib/data.ts`. Pasul următor este conectarea la baza de date.

## Pornire locală

Ai nevoie de Node.js 20 sau mai nou.

```bash
npm install
npm run dev
```

Deschide http://localhost:3000.

Alte comenzi: `npm run typecheck` și `npm run build`.

## Baza de date (Supabase)

Structura este în `supabase/migrations/0001_init.sql`. Mai multe biserici pot folosi aceeași instalare; fiecare vede doar datele ei (Row Level Security). Membrii citesc, liderii și organizatorii modifică, iar notițele despre tineri le văd doar liderii.

1. Creează un proiect pe supabase.com.
2. Rulează fișierul de migrare în SQL Editor (sau `supabase db push`).
3. Copiază `.env.example` în `.env.local` și completează URL-ul și cheia publică.

## Structură

```
app/            paginile (Panou, Programe, Laudă, Echipă, Mesaje)
components/     piese comune: navigare, iconițe, carduri, notificări
lib/            tipuri și date de exemplu
supabase/       structura bazei de date
public/         iconițele aplicației
```
