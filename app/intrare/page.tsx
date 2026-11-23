import { redirect } from "next/navigation";
import { passwordSet } from "@/lib/auth";
import { getChurch } from "@/lib/store";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "Intrare" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const [{ next }, { name }] = await Promise.all([searchParams, getChurch()]);
  if (!passwordSet()) redirect("/");
  return (
    <div className="login">
      <div className="gl panel loginbox">
        <div className="brandmark">
          <b>Adunare</b>
          <span>Tineret · {name}</span>
        </div>
        <p className="meta">Aplicația liderilor. Scrie parola primită de la responsabilul de tineret.</p>
        <LoginForm next={next ?? "/"} />
      </div>
    </div>
  );
}
