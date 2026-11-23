# Adunare

Aplicație pentru liderii și organizatorii de tineret din bisericile baptiste: programe, laudă și închinare, echipă și voluntari, mesaje. Merge în browser și se poate instala pe telefon (PWA).

## Ce conține acum

| Secțiune | Ce poți face |
|---|---|
| **Panou** | Următorul program minut cu minut, sarcini (adaugi, bifezi, ștergi), cântările, posturi libere, zile de naștere cu felicitare pe WhatsApp |
| **Programe** | Programe noi (și de mai multe zile), modifici sau ștergi, pornești de la un program existent, momente pe care le muți, modifici și ștergi, înscrieri și plăți, pregătire, reminder |
| **Laudă** | Lista pentru următorul program în ordinea dorită, bibliotecă cu tonalitate, BPM și link de ascultat, repetiția, trupa din programul de slujire, trimite lista trupei |
| **Echipă** | Slujire pe date (adaugi date noi cu aceleași posturi, posturi și echipe noi), voluntari cu abilități și zile, tinerii cu telefon, data nașterii și notițe |
| **Mesaje** | Alegi cui trimiți (grupele, trupa, voluntarii, înscrișii la un program), trimiți în grupul de WhatsApp sau fiecăruia în parte, istoric |
| **Setări** | Numele bisericii, numele tău, copie de siguranță (descarci și readuci), pornești de la zero, ieși |

Liderii intră cu o parolă comună și își scriu numele, ca aplicația să-i salute și să știe cine a trimis un mesaj.

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

Aplicația are nevoie de un server care păstrează fișierele între reporniri. Pe Vercel datele nu s-ar păstra.

### Railway (cel mai simplu)

1. Pe [railway.com](https://railway.com) alege **New Project → Deploy from GitHub repo** și alege acest repository. Railway citește `railway.json` și construiește aplicația din `Dockerfile`.
2. În serviciu, la **Variables**, adaugă `ADUNARE_PAROLA` cu parola pe care o dai liderilor.
3. La **Settings → Volumes** (sau click dreapta pe serviciu → **Attach volume**) adaugă un volum cu calea **`/data`**. Aici stau datele; fără volum se pierd la fiecare actualizare.
4. La **Settings → Networking** apasă **Generate Domain**. Primești o adresă de forma `adunare-xxxx.up.railway.app`.
5. Deschide adresa, scrie parola și numele. Din **Setări → Pornește de la zero** ștergi datele de exemplu când ești gata să pui oamenii reali.

### Pe un server propriu (VPS) cu Docker

```bash
echo "ADUNARE_PAROLA=parola-voastra" > .env
docker compose up -d --build
```

Aplicația pornește pe portul 3000, iar datele stau în volumul `adunare-date`. Pune în față un HTTPS (de exemplu Caddy) ca parola să nu circule necriptat.

### Variabile

| Variabilă | Ce face |
|---|---|
| `ADUNARE_PAROLA` | Parola comună. Obligatorie online. Dacă o schimbi, toți trebuie să intre din nou. |
| `ADUNARE_DB` | Unde e fișierul cu date (în Docker: `/data/adunare.db`). |
| `ADUNARE_FARA_EXEMPLE` | `1` = la prima pornire nu pune date de exemplu. |

Verificare de sănătate: `/api/sanatate`. Copie de siguranță: **Setări → Descarcă copia** (sau copiezi fișierul `adunare.db`).

## Structură

```
app/            paginile (Panou, Programe, Laudă, Echipă, Mesaje, Setări, Intrare)
app/api/        copie de siguranță și verificare de sănătate
proxy.ts        parola de acces (trimite la /intrare)
components/     piese comune: navigare, iconițe, carduri, notificări, butonul de ștergere
lib/            baza de date, salvări, tipuri, date de exemplu
public/         iconițele aplicației
```
