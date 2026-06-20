import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Network,
  Zap,
  Brain,
  Layers,
  LineChart,
  Settings,
  LogOut,
  Clock,
} from "lucide-react";
import { Logo } from "./arclight-app";
import { useArclight } from "@/lib/arclight-store";

const items = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/graph", label: "Dependency Mapping", icon: Network },
  { to: "/simulation", label: "Risk Simulator", icon: Zap },
  { to: "/timeline", label: "Risk Timeline", icon: Clock },
  { to: "/reports", label: "Intelligence Reports", icon: Brain },
  { to: "/ecosystem", label: "Ecosystem Builder", icon: Layers },
  { to: "/analytics", label: "Analytics", icon: LineChart },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppSidebar() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const setAuthed = useArclight((s) => s.setAuthed);

  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-[color:var(--panel-border)] bg-[oklch(0.17_0.022_260)]/80 backdrop-blur-xl">
      <div className="h-14 flex items-center px-5 border-b border-[color:var(--panel-border)]">
        <Logo />
      </div>

      <div className="px-3 py-4">
        <div className="text-[10px] tracking-[0.22em] text-muted-foreground font-mono px-2 mb-2">
          INTELLIGENCE
        </div>
        <nav className="space-y-0.5">
          {items.map((item) => {
            const active = pathname === item.to;
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`group flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition ${
                  active
                    ? "bg-[color:var(--primary)]/12 text-foreground border border-[color:var(--primary)]/30"
                    : "text-muted-foreground hover:text-foreground hover:bg-[oklch(0.24_0.03_265)]/60 border border-transparent"
                }`}
              >
                <Icon
                  size={15}
                  className={active ? "text-[color:var(--primary)]" : ""}
                />
                <span className="flex-1">{item.label}</span>
                {active && (
                  <span className="w-1 h-1 rounded-full bg-[color:var(--primary)] shadow-[0_0_8px_var(--primary)]" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-3 border-t border-[color:var(--panel-border)]">
        <div className="rounded-md border border-[color:var(--panel-border)] p-3 mb-2">
          <div className="text-[10px] tracking-[0.2em] text-muted-foreground font-mono">
            SYSTEM
          </div>
          <div className="text-xs mt-1 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--success)] animate-pulse" />
            All systems nominal
          </div>
        </div>
        <button
          onClick={() => setAuthed(false)}
          className="w-full inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground px-2 py-1.5 rounded-md hover:bg-[oklch(0.24_0.03_265)]/60"
        >
          <LogOut size={13} /> Sign out
        </button>
      </div>
    </aside>
  );
}
