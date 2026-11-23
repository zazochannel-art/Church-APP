"use client";

import { useActionState } from "react";
import { login } from "@/lib/actions";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(login, null);
  return (
    <form action={action} className="loginform">
      <input type="hidden" name="next" value={next} />
      <label className="f" htmlFor="lname">
        Numele tău
        <input id="lname" name="name" type="text" autoComplete="name" placeholder="ex. Ioana Petrescu" maxLength={60} />
      </label>
      <label className="f" htmlFor="lpass">
        Parola
        <input id="lpass" name="password" type="password" autoComplete="current-password" required autoFocus />
      </label>
      {state?.error && <p className="formerror" role="alert">{state.error}</p>}
      <button className="btn" type="submit" disabled={pending}>
        {pending ? "Se verifică…" : "Intră"}
      </button>
    </form>
  );
}
