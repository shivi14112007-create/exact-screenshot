import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { useArclight } from "@/lib/arclight-store";
import { computeImpact, computeNodeIntel, computeSovereignty, relTime } from "@/lib/arclight";
import { SovereigntyPanel } from "@/components/sovereignty-breakdown";
import { KPICard } from "@/components/kpi-card";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Brain,
  Layers,
  Network,
  Shield,
  TrendingUp,
  Zap,
} from "lucide-react";

export const Route = createFileRoute("/_app/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const ecosystem = useArclight((s) => s.ecosystem);
  const shock = useArclight((s) => s.shock);

  const sov = useMemo(() => computeSovereignty(ecosystem), [ecosystem]);
  const impact = useMemo(() => computeImpact(ecosystem, shock), [ecosystem, shock]);

  const nonWfNodes = ecosystem.nodes.filter((n) => n.kind !== "workflow");
  const intels = useMemo(
    () => nonWfNodes.map((n) => computeNodeIntel(ecosystem, n.id)!).filter(Boolean),
    [ecosystem, nonWfNodes],
  );

  const criticalCount = intels.filter((i) => i.riskLevel === "Critical" || i.riskLevel === "At Risk").length;
  const topDep = [...intels].sort((a, b) => b.criticalityScore - a.criticalityScore)[0];
  const wfCount = ecosystem.nodes.filter((n) => n.kind === "workflow").length;
  const top = sov.breakdown[0];

  // Deterministic trends derived from current sovereignty score
  const trend = (base: number) => [
    base - 8, base - 5, base - 2, base + 1, base - 3, base + 2, base,
  ].map((v) => Math.max(0, v));

  const summary =
    `Your AI surface scores ${sov.score} (${sov.risk}). ` +
    `${top ? `${top.provider} dominates at ${top.pct}% of cross-workflow exposure. ` : ""}` +
    `${criticalCount} critical component${criticalCount === 1 ? "" : "s"} flagged; ` +
    `redundancy coverage sits at ${sov.redundancyCoverage}%. ` +
    `${shock ? `Active simulation "${shock.label}" projects ${impact.affectedWorkflows.length} affected workflows.` : "No active disruption scenarios."}`;

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-[1600px] mx-auto">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Mission Control</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Executive view across sovereignty, resilience and active disruption signals.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/graph"
            className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-md border border-[color:var(--panel-border)] hover:border-[color:var(--primary)] transition"
          >
            <Network size={14} className="text-[color:var(--primary)]" /> Open Dependency Graph
            <ArrowRight size={13} />
          </Link>
          <Link
            to="/simulation"
            className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-md font-medium text-[color:var(--primary-foreground)] hover:brightness-110 transition"
            style={{ background: "linear-gradient(90deg, var(--primary), var(--neon-purple))" }}
          >
            <Zap size={14} /> Run Simulation
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <KPICard
          label="Sovereignty"
          value={sov.score}
          sub={`/ 100 · ${sov.risk}`}
          icon={Shield}
          tone={sov.risk === "Low" ? "success" : sov.risk === "Medium" ? "warning" : "danger"}
          trend={trend(sov.score)}
        />
        <KPICard
          label="Risk Level"
          value={sov.risk}
          sub="composite"
          icon={AlertTriangle}
          tone={sov.risk === "Low" ? "success" : sov.risk === "Medium" ? "warning" : "danger"}
          delay={0.05}
        />
        <KPICard
          label="Top Dependency"
          value={topDep?.node.label.split(" ").slice(0, 2).join(" ") ?? "—"}
          sub={topDep ? `${topDep.criticalityScore}/100 crit` : "no data"}
          icon={Layers}
          tone="info"
          delay={0.1}
        />
        <KPICard
          label="Critical Nodes"
          value={criticalCount}
          sub={`of ${nonWfNodes.length}`}
          icon={Zap}
          tone={criticalCount > 0 ? "danger" : "success"}
          delay={0.15}
        />
        <KPICard
          label="Redundancy"
          value={`${sov.redundancyCoverage}%`}
          sub="coverage"
          icon={Activity}
          tone={sov.redundancyCoverage >= 60 ? "success" : sov.redundancyCoverage >= 30 ? "warning" : "danger"}
          delay={0.2}
        />
        <KPICard
          label="Sim Alerts"
          value={shock ? impact.affectedWorkflows.length : 0}
          sub={shock ? "workflows hit" : "no scenario"}
          icon={TrendingUp}
          tone={shock ? "danger" : "default"}
          delay={0.25}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-4">
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="panel p-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <Brain size={15} className="text-[color:var(--neon-purple)]" />
            <h3 className="text-sm font-medium">Executive Summary</h3>
            <span className="ml-auto text-[10px] font-mono tracking-widest text-muted-foreground">
              LIVE · {ecosystem.nodes.length} NODES
            </span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{summary}</p>

          <div className="grid md:grid-cols-3 gap-3 mt-4">
            <RiskCallout
              level="Critical"
              count={intels.filter((i) => i.riskLevel === "Critical").length}
              text="No-redundancy components with very high criticality."
            />
            <RiskCallout
              level="At Risk"
              count={intels.filter((i) => i.riskLevel === "At Risk").length}
              text="Partial redundancy under sustained load."
            />
            <RiskCallout
              level="Watch"
              count={intels.filter((i) => i.riskLevel === "Watch").length}
              text="Stable but worth periodic review."
            />
          </div>

          <div className="mt-4 pt-4 border-t border-[color:var(--panel-border)]">
            <div className="flex items-center justify-between mb-2">
              <div className="text-[10px] font-mono tracking-[0.18em] text-muted-foreground">
                TOP DEPENDENCIES BY CRITICALITY
              </div>
              <Link
                to="/graph"
                className="text-[10px] font-mono text-muted-foreground hover:text-[color:var(--primary)]"
              >
                INSPECT IN GRAPH →
              </Link>
            </div>
            <div className="space-y-2">
              {[...intels]
                .sort((a, b) => b.criticalityScore - a.criticalityScore)
                .slice(0, 4)
                .map((i) => (
                  <div key={i.node.id} className="flex items-center gap-3">
                    <div className="text-sm font-medium w-40 truncate">{i.node.label}</div>
                    <div className="flex-1 h-1.5 rounded-full bg-[oklch(0.28_0.03_260)] overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${i.criticalityScore}%`,
                          background:
                            i.riskLevel === "Critical"
                              ? "var(--danger)"
                              : i.riskLevel === "At Risk"
                                ? "var(--warning)"
                                : "linear-gradient(90deg, var(--primary), var(--neon-purple))",
                        }}
                      />
                    </div>
                    <div className="text-[10px] font-mono text-muted-foreground w-16 text-right">
                      {i.riskLevel.toUpperCase()}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </motion.div>

        <div className="flex flex-col gap-4 min-w-0">
          <SovereigntyPanel sov={sov} />
          <RecentSignals />
        </div>
      </div>
    </div>
  );
}

function RiskCallout({ level, count, text }: { level: string; count: number; text: string }) {
  const color =
    level === "Critical" ? "var(--danger)" : level === "At Risk" ? "var(--warning)" : "var(--cyan)";
  return (
    <div
      className="rounded-lg border p-3"
      style={{
        borderColor: `color-mix(in oklab, ${color} 30%, transparent)`,
        background: `color-mix(in oklab, ${color} 6%, transparent)`,
      }}
    >
      <div className="flex items-center justify-between">
        <span
          className="text-[10px] font-mono tracking-widest px-2 py-0.5 rounded-md"
          style={{ background: `color-mix(in oklab, ${color} 18%, transparent)`, color }}
        >
          {level.toUpperCase()}
        </span>
        <span className="text-xl font-semibold tabular-nums" style={{ color }}>
          {count}
        </span>
      </div>
      <p className="text-xs text-muted-foreground mt-2 leading-snug">{text}</p>
    </div>
  );
}

function RecentSignals() {
  const signals = useArclight((s) => s.signals).slice(0, 6);
  const toneColor: Record<string, string> = {
    success: "var(--success)",
    warning: "var(--warning)",
    danger: "var(--danger)",
    info: "var(--primary)",
    default: "var(--primary)",
  };
  return (
    <div className="panel p-5">
      <div className="flex items-center gap-2 mb-3">
        <Activity size={15} className="text-[color:var(--success)]" />
        <h3 className="text-sm font-medium">Recent Signals</h3>
        <span className="ml-auto text-[10px] font-mono text-muted-foreground tracking-widest">
          {signals.length} EVENTS
        </span>
      </div>
      {signals.length === 0 ? (
        <p className="text-xs text-muted-foreground italic">No signals yet.</p>
      ) : (
        <ul className="space-y-2 text-sm">
          {signals.map((s) => (
            <li key={s.id} className="flex items-start gap-3">
              <span className="text-[10px] font-mono text-muted-foreground mt-1 w-14 shrink-0">
                {relTime(s.ts)}
              </span>
              <span
                className="w-1.5 h-1.5 rounded-full mt-2 shrink-0"
                style={{ background: toneColor[s.tone] }}
              />
              <span className="flex-1 text-muted-foreground">{s.text}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
