const COLORS = ["#f6c58f", "#7ad3c8", "#f3a6c0", "#b3a8ff", "#a9c8f0", "#c6f3b8"];

export const initials = (name: string) =>
  name.split(" ").map((w) => w[0]).join("").slice(0, 2);

export const colorOf = (name: string) =>
  COLORS[[...name].reduce((sum, c) => sum + c.charCodeAt(0), 0) % COLORS.length];

export function Avatar({ name, className = "av" }: { name: string; className?: string }) {
  return (
    <span className={className} style={{ background: colorOf(name) }} title={name}>
      {initials(name)}
    </span>
  );
}

export const firstName = (name: string) => name.split(" ")[0];
