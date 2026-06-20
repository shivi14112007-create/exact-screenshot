import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search, ArrowRight, Layers, Network, Zap, Brain, Settings, LineChart, LayoutDashboard } from "lucide-react";
import { useArclight } from "@/lib/arclight-store";

const PAGES = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/graph", label: "Dependency Graph", icon: Network },
  { to: "/simulation", label: "Risk Simulation", icon: Zap },
  { to: "/reports", label: "Intelligence Reports", icon: Brain },
  { to: "/ecosystem", label: "Ecosystem Builder", icon: Layers },
  { to: "/analytics", label: "Analytics", icon: LineChart },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function CommandPalette() {
  const open = useArclight((s) => s.paletteOpen);
  const setOpen = useArclight((s) => s.setPaletteOpen);
  const ecosystem = useArclight((s) => s.ecosystem);
  const setSelected = useArclight((s) => s.setSelected);
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(!open);
      } else if (e.key === "Escape" && open) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  useEffect(() => { if (!open) setQ(""); }, [open]);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    const pages = PAGES.filter((p) => !term || p.label.toLowerCase().includes(term));
    const nodes = ecosystem.nodes.filter((n) => !term || n.label.toLowerCase().includes(term) || n.kind.includes(term));
    return { pages: pages.slice(0, 6), nodes: nodes.slice(0, 8) };
  }, [q, ecosystem.nodes]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] grid place-items-start pt-[14vh] px-4 bg-background/70 backdrop-blur-sm" onClick={() => setOpen(false)}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[640px] rounded-xl border border-[color:var(--panel-border)] bg-[oklch(0.18_0.025_260)] shadow-2xl overflow-hidden"
        style={{ boxShadow: "0 20px 60px -10px oklch(0 0 0 / 0.6)" }}
      >
        <div className="flex items-center gap-2 px-3 border-b border-[color:var(--panel-border)]">
          <Search size={15} className="text-muted-foreground" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search pages, nodes, workflows…"
            className="flex-1 bg-transparent py-3 text-sm focus:outline-none"
          />
          <kbd className="text-[10px] font-mono text-muted-foreground border border-[color:var(--panel-border)] rounded px-1.5 py-0.5">ESC</kbd>
        </div>
        <div className="max-h-[60vh] overflow-auto p-2 space-y-3">
          <Section title="Pages">
            {results.pages.map((p) => {
              const Icon = p.icon;
              return (
                <button
                  key={p.to}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm hover:bg-[oklch(0.24_0.03_265)]/60"
                  onClick={() => { navigate({ to: p.to }); setOpen(false); }}
                >
                  <Icon size={14} className="text-[color:var(--cyan)]" />
                  <span className="flex-1 text-left">{p.label}</span>
                  <ArrowRight size={12} className="text-muted-foreground" />
                </button>
              );
            })}
          </Section>
          <Section title={`Nodes (${results.nodes.length})`}>
            {results.nodes.length === 0 && <Empty />}
            {results.nodes.map((n) => (
              <button
                key={n.id}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm hover:bg-[oklch(0.24_0.03_265)]/60"
                onClick={() => { setSelected(n.id); navigate({ to: "/graph" }); setOpen(false); }}
              >
                <span className="w-1.5 h-1.5 rounded-sm bg-[color:var(--cyan)]" />
                <span className="flex-1 text-left">{n.label}</span>
                <span className="text-[10px] font-mono text-muted-foreground tracking-widest">{n.kind.toUpperCase()}</span>
              </button>
            ))}
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] tracking-[0.2em] font-mono text-muted-foreground px-2.5 mb-1">{title.toUpperCase()}</div>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}
function Empty() { return <div className="px-2.5 py-2 text-xs text-muted-foreground italic">No matches</div>; }
