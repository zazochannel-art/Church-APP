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

Totul se salvează: programe noi, momente din program, înscrieri și plăți, pregătire, sarcini, lista de cântări și cântări noi, cine slujește, mesajele trimise.

## Pornire locală

Ai nevoie de Node.js 22.5 sau mai nou.

```bash
npm install
npm run dev
```

Deschide http://localhost:3000. La prima pornire aplicația își creează singură baza de date în `data/adunare.db` și o umple cu date de exemplu. Ca să pornești de la zero, șterge folderul `data/`.

Alte comenzi: `npm run typecheck` și `npm run build`.

## Datele

Nu e nevoie de niciun serviciu extern. Datele stau într-un singur fișier SQLite (`data/adunare.db`), salvat de aplicație. Pentru copie de siguranță e suficient să copiezi acest fișier.

## Online

Aplicația are nevoie de un server care păstrează fișierele între reporniri: un VPS, sau Railway, Render ori Fly.io cu un disc atașat. Pe Vercel datele nu s-ar păstra.

1. Setează `ADUNARE_PAROLA`: parola comună pe care o dai liderilor. Fără ea aplicația nu pornește online, pentru că are numere de telefon și notițe despre tineri.
2. Opțional, `ADUNARE_DB` arată unde să fie fișierul cu date (pe discul atașat).
3. `npm install && npm run build && npm start`

## Structură

```
app/            paginile (Panou, Programe, Laudă, Echipă, Mesaje)
proxy.ts        parola de acces
components/     piese comune: navigare, iconițe, carduri, notificări
lib/            baza de date, salvări, tipuri, date de exemplu
public/         iconițele aplicației
```
