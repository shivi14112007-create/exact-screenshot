import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  CircuitBoard,
  Cloud,
  DollarSign,
  Scale,
  Sparkles,
  Target,
  X,
  Zap,
} from "lucide-react";
import { useArclight } from "@/lib/arclight-store";
import {
  computeImpact,
  computeSovereignty,
  recoveryComplexity,
  shocks,
  type Shock,
  type ShockType,
} from "@/lib/arclight";

export const Route = createFileRoute("/_app/simulation")({
  component: SimulationPage,
});

const scenarioMeta: Record<ShockType, { icon: typeof Zap; color: string }> = {
  "openai-down": { icon: Sparkles, color: "var(--neon-purple)" },
  "aws-outage": { icon: Cloud, color: "var(--cyan)" },
  "cost-increase": { icon: DollarSign, color: "var(--warning)" },
  "policy-restriction": { icon: Scale, color: "var(--neon-pink)" },
};

function SimulationPage() {
  const ecosystem = useArclight((s) => s.ecosystem);
  const shock = useArclight((s) => s.shock);
  const setShock = useArclight((s) => s.setShock);
  const comparisonId = useArclight((s) => s.comparisonShockId);
  const setComparison = useArclight((s) => s.setComparisonShock);
  const sov = useMemo(() => computeSovereignty(ecosystem), [ecosystem]);

  const compareMode = !!comparisonId;
  const shockB = comparisonId ? shocks.find((s) => s.id === comparisonId) ?? null : null;

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-[1600px] mx-auto">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Risk Simulation Lab</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Trigger controlled disruption scenarios and study their blast radius.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setComparison(compareMode ? null : (shock?.id === "aws-outage" ? "openai-down" : "aws-outage"))}
            className="text-xs px-3 py-2 rounded-md border border-[color:var(--panel-border)] hover:border-[color:var(--primary)] transition inline-flex items-center gap-1.5"
          >
            <Target size={12} /> {compareMode ? "Exit Compare" : "Compare Scenarios"}
          </button>
        </div>
      </div>

      {/* Scenario picker */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {shocks.map((s) => {
          const meta = scenarioMeta[s.id];
          const Icon = meta.icon;
          const isActive = shock?.id === s.id;
          const isCompare = comparisonId === s.id;
          return (
            <motion.button
              key={s.id}
              whileHover={{ y: -2 }}
              onClick={() => {
                if (compareMode) {
                  setComparison(s.id);
                } else {
                  setShock(isActive ? null : s);
                }
              }}
              className={`relative text-left rounded-xl border p-4 transition overflow-hidden ${
                isActive
                  ? "border-[color:var(--danger)] bg-[color:var(--danger)]/10"
                  : isCompare
                    ? "border-[color:var(--warning)] bg-[color:var(--warning)]/8"
                    : "border-[color:var(--panel-border)] hover:border-[color:var(--primary)]/60 bg-[oklch(0.20_0.025_260)]/60"
              }`}
              style={{
                boxShadow: isActive
                  ? "0 8px 32px -10px var(--danger)"
                  : isCompare
                    ? "0 8px 32px -10px var(--warning)"
                    : undefined,
              }}
            >
              <div
                className="w-9 h-9 rounded-lg grid place-items-center mb-2"
                style={{
                  background: `color-mix(in oklab, ${meta.color} 18%, transparent)`,
                  color: meta.color,
                  boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${meta.color} 35%, transparent)`,
                }}
              >
                <Icon size={18} />
              </div>
              <div className="text-sm font-semibold">{s.label}</div>
              <div className="text-[11px] text-muted-foreground mt-1 leading-snug">{s.description}</div>
              <div className="flex items-center gap-1.5 mt-2">
                <span
                  className="text-[9px] font-mono tracking-widest px-1.5 py-0.5 rounded-sm"
                  style={{
                    color: meta.color,
                    background: `color-mix(in oklab, ${meta.color} 14%, transparent)`,
                  }}
                >
                  {s.severity.toUpperCase()}
                </span>
                {isActive && (
                  <span className="text-[9px] font-mono tracking-widest text-[color:var(--danger)]">
                    ● ACTIVE
                  </span>
                )}
                {isCompare && (
                  <span className="text-[9px] font-mono tracking-widest text-[color:var(--warning)]">
                    ● COMPARE
                  </span>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Impact analysis */}
      <div className={`grid gap-4 ${compareMode && shockB ? "grid-cols-1 xl:grid-cols-2" : "grid-cols-1"}`}>
        <ImpactCard shock={shock} ecosystem={ecosystem} baseScore={sov.score} title={shock ? `Scenario A · ${shock.label}` : "Pick a scenario"} />
        {compareMode && shockB && (
          <ImpactCard shock={shockB} ecosystem={ecosystem} baseScore={sov.score} title={`Scenario B · ${shockB.label}`} accent />
        )}
      </div>

      {shock && (
        <div className="panel p-5">
          <div className="flex items-center gap-2 mb-3">
            <CircuitBoard size={15} className="text-[color:var(--primary)]" />
            <h3 className="text-sm font-medium">Next steps</h3>
          </div>
          <div className="grid md:grid-cols-3 gap-3">
            <Link
              to="/graph"
              search={{ shock: shock.id }}
              className="rounded-lg border border-[color:var(--panel-border)] p-3 hover:border-[color:var(--primary)] transition group"
            >
              <div className="text-xs font-medium flex items-center gap-1.5">
                Visualize blast radius <ArrowRight size={12} className="group-hover:translate-x-0.5 transition" />
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">Open dependency graph with affected nodes highlighted.</p>
            </Link>
            <Link
              to="/timeline"
              className="rounded-lg border border-[color:var(--panel-border)] p-3 hover:border-[color:var(--primary)] transition group"
            >
              <div className="text-xs font-medium flex items-center gap-1.5">
                Project resilience timeline <ArrowRight size={12} />
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">See how mitigations change sovereignty score over time.</p>
            </Link>
            <Link
              to="/reports"
              className="rounded-lg border border-[color:var(--panel-border)] p-3 hover:border-[color:var(--primary)] transition group"
            >
              <div className="text-xs font-medium flex items-center gap-1.5">
                Export briefing <ArrowRight size={12} />
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">Generate a markdown report including this scenario.</p>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function ImpactCard({
  shock,
  ecosystem,
  baseScore,
  title,
  accent,
}: {
  shock: Shock | null;
  ecosystem: ReturnType<typeof useArclight.getState>["ecosystem"];
  baseScore: number;
  title: string;
  accent?: boolean;
}) {
  const setShock = useArclight((s) => s.setShock);
  const impact = useMemo(() => computeImpact(ecosystem, shock), [ecosystem, shock]);
  const sev = shock ? { low: 1, medium: 2, high: 3, critical: 4 }[shock.severity] : 0;
  const recovery = shock ? recoveryComplexity(shock, ecosystem, impact) : "Low";
  const wfTotal = ecosystem.nodes.filter((n) => n.kind === "workflow").length || 1;
  const blastPct = Math.round((impact.affectedWorkflows.length / wfTotal) * 100);
  const sevColor =
    sev >= 4 ? "var(--danger)" : sev >= 3 ? "var(--warning)" : sev >= 2 ? "var(--cyan)" : "var(--success)";

  return (
    <motion.div
      layout
      className="panel p-5 relative overflow-hidden"
      style={{
        borderColor: accent ? "color-mix(in oklab, var(--warning) 40%, var(--panel-border))" : undefined,
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Zap size={15} className={accent ? "text-[color:var(--warning)]" : "text-[color:var(--neon-pink)]"} />
          <h3 className="text-sm font-medium">{title}</h3>
        </div>
        {shock && !accent && (
          <button
            onClick={() => setShock(null)}
            className="text-[10px] font-mono tracking-widest text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
          >
            <X size={11} /> CLEAR
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {!shock ? (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <p className="text-sm text-muted-foreground">Select a scenario above to compute impact, severity and recovery complexity.</p>
          </motion.div>
        ) : (
          <motion.div key={shock.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="grid grid-cols-3 gap-2 mb-4">
              <ImpactStat label="Severity" value={shock.severity.toUpperCase()} color={sevColor} />
              <ImpactStat label="Recovery" value={recovery.toUpperCase()} color={recovery === "High" ? "var(--danger)" : recovery === "Medium" ? "var(--warning)" : "var(--success)"} />
              <ImpactStat label="Dependencies" value={`${impact.affectedNodeIds.size}`} color="var(--primary)" />
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between text-[10px] font-mono tracking-[0.18em] text-muted-foreground mb-1.5">
                <span>BLAST RADIUS</span>
                <span>{blastPct}% of workflows</span>
              </div>
              <div className="h-2.5 rounded-full bg-[oklch(0.28_0.03_260)] overflow-hidden relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${blastPct}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full"
                  style={{
                    background: "linear-gradient(90deg, var(--warning), var(--danger))",
                    boxShadow: "0 0 16px var(--danger)",
                  }}
                />
              </div>
            </div>

            <div className="mb-3">
              <div className="text-[10px] font-mono tracking-[0.18em] text-muted-foreground mb-2">
                AFFECTED WORKFLOWS
              </div>
              {impact.affectedWorkflows.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">No workflows in the impact path.</p>
              ) : (
                <div className="space-y-1.5">
                  {impact.affectedWorkflows.map((w, i) => (
                    <motion.div
                      key={w.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + i * 0.06 }}
                      className="flex items-center gap-2 px-3 py-2 rounded-md border border-[color:var(--danger)]/30 bg-[color:var(--danger)]/8"
                    >
                      <AlertTriangle size={12} className="text-[color:var(--danger)] shrink-0" />
                      <span className="text-sm flex-1">{w.label}</span>
                      <span className="text-[10px] font-mono text-[color:var(--danger)]">IMPACTED</span>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            <div className="text-[11px] text-muted-foreground border-t border-[color:var(--panel-border)] pt-3">
              Projected sovereignty under this scenario:{" "}
              <span className="text-[color:var(--danger)] font-medium">
                {Math.max(5, baseScore - blastPct - sev * 4)}
              </span>{" "}
              (from {baseScore})
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ImpactStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div
      className="rounded-md border p-2.5"
      style={{
        borderColor: `color-mix(in oklab, ${color} 30%, transparent)`,
        background: `color-mix(in oklab, ${color} 7%, transparent)`,
      }}
    >
      <div className="text-[9px] font-mono tracking-[0.15em] text-muted-foreground">
        {label.toUpperCase()}
      </div>
      <div className="text-sm font-semibold mt-0.5" style={{ color }}>
        {value}
      </div>
    </div>
  );
}
