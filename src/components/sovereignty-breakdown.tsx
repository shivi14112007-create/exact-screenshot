import { Shield } from "lucide-react";
import type { Sovereignty } from "@/lib/arclight";

export function SovereigntyPanel({ sov, compact = false }: { sov: Sovereignty; compact?: boolean }) {
  const { score, risk, components, breakdown } = sov;
  const riskColor =
    risk === "Low" ? "var(--success)" : risk === "Medium" ? "var(--warning)" : "var(--danger)";
  const r = 52;
  const c = 2 * Math.PI * r;
  const dash = (score / 100) * c;

  return (
    <div className="panel p-5 relative overflow-hidden scan-line">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Shield size={16} className="text-[color:var(--primary)]" />
          <h3 className="text-sm font-medium tracking-wide">Sovereignty Index</h3>
        </div>
        <span
          className="text-[10px] font-mono tracking-widest px-2 py-0.5 rounded-md border"
          style={{
            color: riskColor,
            borderColor: `color-mix(in oklab, ${riskColor} 50%, transparent)`,
            background: `color-mix(in oklab, ${riskColor} 12%, transparent)`,
          }}
        >
          {risk.toUpperCase()} RISK
        </span>
      </div>

      <div className="flex items-center gap-5">
        <div className="relative w-32 h-32 shrink-0">
          <svg viewBox="0 0 120 120" className="-rotate-90">
            <circle cx="60" cy="60" r={r} stroke="oklch(0.28 0.03 260)" strokeWidth="10" fill="none" />
            <circle
              cx="60" cy="60" r={r}
              stroke="url(#sov-g)" strokeWidth="10" fill="none" strokeLinecap="round"
              strokeDasharray={`${dash} ${c}`}
              style={{ transition: "stroke-dasharray 800ms ease" }}
            />
            <defs>
              <linearGradient id="sov-g" x1="0" x2="1">
                <stop offset="0%" stopColor="var(--primary)" />
                <stop offset="100%" stopColor="var(--neon-purple)" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 grid place-items-center">
            <div className="text-center">
              <div className="text-3xl font-semibold neon-text leading-none">{score}</div>
              <div className="text-[10px] tracking-[0.18em] text-muted-foreground mt-1 font-mono">/ 100</div>
            </div>
          </div>
        </div>

        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-mono mb-1">
            Score Composition
          </div>
          {components.map((c) => {
            const positive = c.delta > 0;
            const negative = c.delta < 0;
            const color = positive ? "var(--success)" : negative ? "var(--danger)" : "var(--muted-foreground)";
            return (
              <div key={c.key} className="flex items-center gap-2 text-xs" title={c.reason}>
                <span
                  className="font-mono w-10 text-right shrink-0 tabular-nums"
                  style={{ color }}
                >
                  {positive ? "+" : ""}{c.delta}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="truncate">{c.label}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {!compact && (
        <details className="mt-4 border-t border-[color:var(--panel-border)] pt-3" open>
          <summary className="cursor-pointer text-[10px] font-mono tracking-[0.18em] text-muted-foreground hover:text-[color:var(--primary)]">
            WHY THIS SCORE
          </summary>
          <div className="mt-2 space-y-1.5">
            {components.map((c) => (
              <div key={c.key} className="text-[11px] text-muted-foreground leading-snug">
                <span className="text-foreground font-medium">{c.label}:</span> {c.reason}
              </div>
            ))}
          </div>
          {breakdown.length > 0 && (
            <div className="mt-3">
              <div className="text-[10px] font-mono tracking-[0.18em] text-muted-foreground mb-1.5">
                PROVIDER SHARE
              </div>
              <div className="space-y-1.5">
                {breakdown.slice(0, 5).map((b) => (
                  <div key={b.provider}>
                    <div className="flex justify-between text-[11px] mb-0.5">
                      <span className="font-mono text-muted-foreground">{b.provider}</span>
                      <span className="font-medium tabular-nums">{b.pct}%</span>
                    </div>
                    <div className="h-1 bg-[oklch(0.28_0.03_260)] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${b.pct}%`,
                          background: "linear-gradient(90deg, var(--primary), var(--neon-purple))",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </details>
      )}
    </div>
  );
}
