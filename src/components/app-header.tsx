import { useRouterState } from "@tanstack/react-router";
import { Command, Search } from "lucide-react";
import { useArclight } from "@/lib/arclight-store";
import { NotificationsPopover } from "./notifications-popover";
import { ThemeSwitcher } from "./theme-switcher";

const titles: Record<string, string> = {
  "/dashboard": "Mission Control",
  "/graph": "Dependency Mapping",
  "/simulation": "Risk Simulator",
  "/timeline": "Risk Timeline",
  "/reports": "Intelligence Reports",
  "/ecosystem": "Ecosystem Builder",
  "/analytics": "Analytics & Trends",
  "/settings": "Workspace Settings",
};

export function AppHeader() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const workspace = useArclight((s) => s.workspace);
  const shock = useArclight((s) => s.shock);
  const setPaletteOpen = useArclight((s) => s.setPaletteOpen);
  const setAuthed = useArclight((s) => s.setAuthed);

  return (
    <header className="h-14 border-b border-[color:var(--panel-border)] px-4 md:px-6 flex items-center gap-4 bg-background/60 backdrop-blur-xl sticky top-0 z-30">
      <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
        <span>arclight</span>
        <span className="opacity-50">/</span>
        <span>{workspace}</span>
        <span className="opacity-50">/</span>
        <span className="text-foreground">{titles[pathname] ?? "Arclight"}</span>
      </div>

      <div className="ml-auto flex items-center gap-2">
        {shock && (
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-md border border-[color:var(--danger)] bg-[color:var(--danger)]/12 text-[11px] font-mono tracking-wider text-[color:var(--danger)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--danger)] animate-pulse" />
            SIM: {shock.label.toUpperCase()}
          </div>
        )}

        <button
          onClick={() => setPaletteOpen(true)}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-md border border-[color:var(--panel-border)] bg-[oklch(0.20_0.025_260)]/60 text-xs text-muted-foreground min-w-[240px] hover:border-[color:var(--primary)]/60 hover:text-foreground transition"
        >
          <Search size={13} />
          <span className="flex-1 text-left">Search nodes, workflows…</span>
          <span className="inline-flex items-center gap-0.5 text-[10px] font-mono">
            <Command size={10} /> K
          </span>
        </button>

        <ThemeSwitcher />
        <NotificationsPopover />

        <AvatarMenu onSignOut={() => setAuthed(false)} />
      </div>
    </header>
  );
}

function AvatarMenu({ onSignOut }: { onSignOut: () => void }) {
  return (
    <div className="relative group">
      <button
        className="w-8 h-8 rounded-full grid place-items-center text-xs font-medium"
        style={{ background: "linear-gradient(135deg, var(--primary), var(--neon-purple))" }}
        aria-label="Account"
      >
        AR
      </button>
      <div className="absolute right-0 mt-2 w-48 rounded-lg border border-[color:var(--panel-border)] bg-[oklch(0.18_0.025_260)] shadow-2xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:pointer-events-auto transition z-50">
        <div className="px-3 py-2 border-b border-[color:var(--panel-border)]">
          <div className="text-xs font-medium">Arclight Analyst</div>
          <div className="text-[10px] text-muted-foreground font-mono">analyst@arclight.io</div>
        </div>
        <button
          onClick={onSignOut}
          className="w-full text-left px-3 py-2 text-xs hover:bg-[oklch(0.24_0.03_265)]/60"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
