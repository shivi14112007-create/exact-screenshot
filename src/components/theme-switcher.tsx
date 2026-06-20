import { useEffect } from "react";
import { Palette } from "lucide-react";
import { useArclight, type ThemeId } from "@/lib/arclight-store";

const themes: { id: ThemeId; label: string; swatch: string }[] = [
  { id: "cyber-blue", label: "Cyber Blue", swatch: "linear-gradient(135deg, #38e0ff, #7c5cff)" },
  { id: "aurora-green", label: "Aurora Green", swatch: "linear-gradient(135deg, #5cffb0, #3ee0c2)" },
  { id: "violet-pulse", label: "Violet Pulse", swatch: "linear-gradient(135deg, #b56bff, #ff5cc8)" },
  { id: "amber-signal", label: "Amber Signal", swatch: "linear-gradient(135deg, #ffb347, #ff6f59)" },
];

export function useApplyTheme() {
  const theme = useArclight((s) => s.theme);
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);
}

export function ThemeSwitcher() {
  const theme = useArclight((s) => s.theme);
  const setTheme = useArclight((s) => s.setTheme);
  return (
    <div className="relative group">
      <button
        className="h-8 px-2.5 rounded-md border border-[color:var(--panel-border)] inline-flex items-center gap-1.5 text-xs hover:border-[color:var(--primary)] transition"
        aria-label="Theme"
      >
        <Palette size={12} className="text-[color:var(--primary)]" />
        <span className="hidden sm:inline font-mono tracking-widest text-[10px]">
          {themes.find((t) => t.id === theme)?.label.split(" ")[0].toUpperCase()}
        </span>
      </button>
      <div className="absolute right-0 mt-2 w-56 rounded-lg border border-[color:var(--panel-border)] bg-[oklch(0.18_0.025_260)] shadow-2xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:pointer-events-auto transition z-50 p-1.5">
        <div className="text-[10px] font-mono tracking-[0.2em] text-muted-foreground px-2 py-1.5">
          NEON THEMES
        </div>
        {themes.map((t) => (
          <button
            key={t.id}
            onClick={() => setTheme(t.id)}
            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs hover:bg-[oklch(0.24_0.03_265)]/60 ${
              theme === t.id ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            <span
              className="w-5 h-5 rounded-md shrink-0"
              style={{ background: t.swatch, boxShadow: `0 0 12px -2px ${t.swatch.match(/#[a-f0-9]+/i)?.[0] ?? "transparent"}` }}
            />
            <span className="flex-1 text-left">{t.label}</span>
            {theme === t.id && (
              <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--primary)] shadow-[0_0_8px_var(--primary)]" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
