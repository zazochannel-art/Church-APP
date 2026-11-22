"use client";

import { useState, useTransition } from "react";
import { Icon } from "@/components/Icon";
import { useToast } from "@/components/Toast";
import { logout, restoreBackup, saveChurch, setMyName, startFromZero } from "@/lib/actions";

export function Settings({ church, me, hasPassword }: { church: string; me: string; hasPassword: boolean }) {
  const toast = useToast();
  const [pending, start] = useTransition();
  const [zero, setZero] = useState("");
  const [error, setError] = useState("");

  return (
    <div className="mcols">
      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        <section>
          <h2>Biserica și tu</h2>
          <form
            className="gl panel formgrid"
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              start(async () => {
                await saveChurch(String(f.get("church") ?? ""));
                await setMyName(String(f.get("me") ?? ""));
                toast("Salvat");
              });
            }}
          >
            <label className="f full">
              Numele bisericii
              <input name="church" type="text" defaultValue={church} maxLength={80} required />
            </label>
            <label className="f full">
              Numele tău (doar pe acest telefon sau calculator)
              <input name="me" type="text" defaultValue={me} maxLength={60} placeholder="ex. Ioana Petrescu" />
              <span className="hint">Apare la salut și la mesajele pe care le trimiți.</span>
            </label>
            <div className="full row" style={{ justifyContent: "flex-end" }}>
              <button className="btn sm" type="submit" disabled={pending}>Salvează</button>
            </div>
          </form>
        </section>

        <section>
          <h2>Pe telefon</h2>
          <div className="gl panel" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span className="meta">
              Deschide aplicația în browser și alege <b>Adaugă pe ecranul principal</b> (iPhone: butonul Partajează în Safari; Android: meniul ⋮ din Chrome). Apoi se deschide ca o aplicație normală.
            </span>
          </div>
        </section>

        {hasPassword && (
          <section>
            <h2>Acces</h2>
            <div className="gl panel" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <span className="meta">Toți liderii folosesc aceeași parolă. Dacă o schimbi pe server, toată lumea trebuie să intre din nou.</span>
              <form action={logout}>
                <button className="btn ghost sm" type="submit">
                  <Icon name="logout" />
                  Ieși de pe acest dispozitiv
                </button>
              </form>
            </div>
          </section>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        <section>
          <h2>Copie de siguranță</h2>
          <div className="gl panel" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <span className="meta">Descarcă toate datele într-un fișier. Fă asta din când în când și păstrează fișierul în siguranță: are numere de telefon și notițe despre tineri.</span>
            <a className="btn sm" href="/api/copie" style={{ alignSelf: "flex-start" }}>
              <Icon name="download" />
              Descarcă copia
            </a>
            <form
              className="restore"
              onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                setError("");
                start(async () => {
                  const r = await restoreBackup(f);
                  if (r.error) setError(r.error);
                  else toast("Datele au fost readuse din copie");
                });
              }}
            >
              <span className="meta">Readu datele dintr-o copie (înlocuiește tot ce e acum):</span>
              <div className="row" style={{ gap: 8, flexWrap: "wrap", justifyContent: "flex-start" }}>
                <input name="file" type="file" accept="application/json,.json" aria-label="Fișierul copiei" />
                <button className="btn ghost sm" type="submit" disabled={pending}>Readu datele</button>
              </div>
            </form>
            {error && <p className="formerror" role="alert">{error}</p>}
          </div>
        </section>

        <section>
          <h2>Pornește de la zero</h2>
          <form
            className="gl panel"
            style={{ display: "flex", flexDirection: "column", gap: 10 }}
            onSubmit={(e) => {
              e.preventDefault();
              setError("");
              start(async () => {
                const r = await startFromZero(zero);
                if (r.error) return setError(r.error);
                setZero("");
                toast("Toate datele de exemplu au fost șterse");
              });
            }}
          >
            <span className="meta">
              Șterge tinerii, programele, cântările, slujirea, sarcinile și mesajele (de exemplu cele de probă de la început). Numele bisericii rămâne. Descarcă o copie înainte.
            </span>
            <div className="row" style={{ gap: 8 }}>
              <input type="text" value={zero} onChange={(e) => setZero(e.target.value)} placeholder="Scrie ȘTERGE" aria-label="Scrie ȘTERGE ca să confirmi" />
              <button className="btn ghost sm danger" type="submit" disabled={pending || !zero}>Șterge tot</button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
