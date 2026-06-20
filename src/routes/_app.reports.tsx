import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useArclight } from "@/lib/arclight-store";
import {
  computeSovereignty,
  generateReport,
  projectAction,
  relTime,
  resilienceActions,
} from "@/lib/arclight";
import {
  Brain,
  ChevronRight,
  Download,
  FileText,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Info,
  ShieldCheck,
} from "lucide-react";

export const Route = createFileRoute("/_app/reports")({
  component: ReportsPage,
});

function downloadFile(filename: string, content: string, mime = "text/markdown") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function ReportsPage() {
  const ecosystem = useArclight((s) => s.ecosystem);
  const shock = useArclight((s) => s.shock);
  const addReport = useArclight((s) => s.addReport);
  const reports = useArclight((s) => s.reports);
  const sov = useMemo(() => computeSovereignty(ecosystem), [ecosystem]);
  const top = sov.breakdown[0];

  const [appliedSet, setAppliedSet] = useState<Set<string>>(new Set());
  const selectedActions = useMemo(
    () => resilienceActions.filter((a) => appliedSet.has(a.id)),
    [appliedSet],
  );
  const totalIncrease = selectedActions.reduce((sum, a) => sum + a.scoreIncrease, 0);
  const projectedScore = Math.max(0, Math.min(100, sov.score + totalIncrease));
  const projectedRisk: "Low" | "Medium" | "High" =
    projectedScore >= 70 ? "Low" : projectedScore >= 45 ? "Medium" : "High";
  const improvementPct = sov.score > 0
    ? Math.round(((projectedScore - sov.score) / sov.score) * 100)
    : 0;


  const exportBriefing = () => {
    const md = generateReport(ecosystem, sov, shock);
    const rec = addReport({
      title: `Weekly briefing — ${new Date().toLocaleDateString()}`,
      score: sov.score,
      risk: sov.risk,
      markdown: md,
    });
    downloadFile(`arclight-${rec.id}.md`, md);
    toast.success("Briefing generated", { description: `Sovereignty ${sov.score} · ${sov.risk}` });
  };

  const exportJSON = () => {
    const payload = { generatedAt: new Date().toISOString(), sovereignty: sov, ecosystem, shock };
    downloadFile(`arclight-snapshot-${Date.now()}.json`, JSON.stringify(payload, null, 2), "application/json");
    toast.success("Snapshot exported as JSON");
  };

  const insights = [
    {
      icon: TrendingDown,
      tone: "danger" as const,
      title: `${top?.provider ?? "OpenAI"} concentration is your dominant risk`,
      detail: `${top?.pct ?? 0}% of workflow exposure flows through a single vendor. A coordinated outage would collapse blast radius into a critical event.`,
      explain: `Calculated from ${ecosystem.nodes.filter(n => n.kind === "workflow").length} workflows × reachable providers. Penalty applies above 25% share.`,
    },
    {
      icon: Sparkles,
      tone: "cyan" as const,
      title: "Diversification windows are available",
      detail: `${sov.diversity} distinct providers detected. Increasing redundancy on ${top?.provider ?? "the top provider"} would shift the score upward.`,
      explain: "Each new fallback provider on a critical path adds redundancy bonus and shrinks the concentration penalty.",
    },
    {
      icon: TrendingUp,
      tone: "success" as const,
      title: `Redundancy coverage sits at ${sov.redundancyCoverage}%`,
      detail: `${sov.spofCount} component${sov.spofCount === 1 ? "" : "s"} flagged as single point${sov.spofCount === 1 ? "" : "s"} of failure. Closing the remaining gaps is the highest-leverage action.`,
      explain: "SPOF = no alternate provider of the same kind serves the dependent workflows.",
    },
  ];

  return (
    <div className="p-4 md:p-6 max-w-[1500px] mx-auto space-y-4">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Intelligence Reports</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Explainable insights, posture deltas, and the actionable resilience plan.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportJSON}
            className="text-sm px-3 py-2 rounded-md border border-[color:var(--panel-border)] inline-flex items-center gap-2 hover:border-[color:var(--primary)]"
          >
            <Download size={14} /> JSON snapshot
          </button>
          <button
            onClick={exportBriefing}
            className="text-sm px-3 py-2 rounded-md font-medium inline-flex items-center gap-2 text-[color:var(--primary-foreground)] hover:brightness-110"
            style={{ background: "linear-gradient(90deg, var(--primary), var(--neon-purple))" }}
          >
            <FileText size={14} /> Export weekly briefing
          </button>
        </div>
      </div>

      <div className="panel p-5">
        <div className="flex items-center gap-2 mb-4">
          <Brain size={16} className="text-[color:var(--neon-purple)]" />
          <h3 className="text-sm font-medium">Executive Summary</h3>
          <span className="ml-auto text-[10px] font-mono tracking-widest text-muted-foreground">
            LIVE · {ecosystem.nodes.length} NODES
          </span>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Your AI surface is operating at a{" "}
          <span className="text-foreground font-medium">sovereignty index of {sov.score} ({sov.risk})</span>.
          The largest structural risk is provider concentration on{" "}
          <span className="text-foreground font-medium">{top?.provider ?? "OpenAI"}</span>, carrying {top?.pct ?? 0}% of cross-workflow exposure.
          Executing the top mitigations queued below projects the index to{" "}
          <span className="text-foreground font-medium">{stackedSov.score}</span>.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-3">
        {insights.map((i) => {
          const Icon = i.icon;
          const color =
            i.tone === "danger" ? "var(--danger)" : i.tone === "success" ? "var(--success)" : "var(--primary)";
          return (
            <div key={i.title} className="panel p-5">
              <div
                className="w-9 h-9 rounded-lg grid place-items-center mb-3"
                style={{ background: `color-mix(in oklab, ${color} 18%, transparent)`, color }}
              >
                <Icon size={16} />
              </div>
              <div className="text-sm font-semibold leading-snug">{i.title}</div>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{i.detail}</p>
              <details className="mt-3 group">
                <summary className="cursor-pointer text-[10px] font-mono tracking-widest text-muted-foreground hover:text-[color:var(--primary)] inline-flex items-center gap-1">
                  <Info size={11} /> WHY THIS MATTERS
                </summary>
                <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed border-l border-[color:var(--panel-border)] pl-2">
                  {i.explain}
                </p>
              </details>
            </div>
          );
        })}
      </div>

      {/* Resilience Plan */}
      <div className="panel p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-[color:var(--success)]" />
            <h3 className="text-sm font-medium">Resilience Plan</h3>
            <span className="text-[10px] font-mono tracking-widest text-muted-foreground">
              {appliedSet.size} OF {projections.length} STACKED
            </span>
          </div>
          <Link
            to="/timeline"
            className="text-[11px] font-mono text-muted-foreground hover:text-[color:var(--primary)] inline-flex items-center gap-1"
          >
            OPEN FULL TIMELINE <ChevronRight size={12} />
          </Link>
        </div>

        <div className="grid md:grid-cols-[1fr_1fr_1fr] gap-4 mb-4 items-center">
          <ScoreBlock label="Current Score" score={sov.score} risk={sov.risk} />
          <div className="flex items-center justify-center text-muted-foreground">
            <ChevronRight size={24} />
          </div>
          <ScoreBlock
            label="Projected Score"
            score={stackedSov.score}
            risk={stackedSov.risk}
            delta={stackedSov.score - sov.score}
          />
        </div>

        <div className="space-y-2">
          {projections.map((p) => {
            const applied = appliedSet.has(p.action.id);
            const delta = p.sovereignty.score - sov.score;
            const diffColor =
              p.action.difficulty === "Easy"
                ? "var(--success)"
                : p.action.difficulty === "Medium"
                  ? "var(--warning)"
                  : "var(--danger)";
            return (
              <motion.button
                key={p.action.id}
                whileHover={{ x: 2 }}
                onClick={() =>
                  setAppliedSet((cur) => {
                    const next = new Set(cur);
                    if (next.has(p.action.id)) next.delete(p.action.id);
                    else next.add(p.action.id);
                    return next;
                  })
                }
                className={`w-full text-left flex items-center gap-3 rounded-lg border px-3 py-3 transition ${
                  applied
                    ? "border-[color:var(--success)]/50 bg-[color:var(--success)]/8"
                    : "border-[color:var(--panel-border)] hover:border-[color:var(--primary)]/60"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded border shrink-0 grid place-items-center transition ${
                    applied
                      ? "border-[color:var(--success)] bg-[color:var(--success)]"
                      : "border-[color:var(--panel-border)]"
                  }`}
                >
                  {applied && <span className="w-1.5 h-1.5 rounded-sm bg-background" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium flex items-center gap-2">
                    {p.action.title}
                    <span
                      className="text-[9px] font-mono tracking-widest px-1.5 py-0.5 rounded-sm"
                      style={{
                        color: diffColor,
                        background: `color-mix(in oklab, ${diffColor} 14%, transparent)`,
                      }}
                    >
                      {p.action.difficulty.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{p.action.detail}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[10px] font-mono text-muted-foreground">PROJECTED</div>
                  <div className="text-sm font-semibold tabular-nums">
                    {p.sovereignty.score}
                    <span
                      className={`ml-1 text-[10px] font-mono ${delta >= 0 ? "text-[color:var(--success)]" : "text-[color:var(--danger)]"}`}
                    >
                      ({delta >= 0 ? "+" : ""}{delta})
                    </span>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      <div className="panel p-5">
        <h3 className="text-sm font-medium mb-3">Report History</h3>
        {reports.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">
            No briefings yet — click <span className="text-foreground font-medium">Export weekly briefing</span> to generate one.
          </p>
        ) : (
          <div className="space-y-2">
            {reports.map((r) => (
              <div key={r.id} className="flex items-center gap-3 px-3 py-2.5 rounded-md border border-[color:var(--panel-border)]">
                <FileText size={14} className="text-[color:var(--primary)]" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{r.title}</div>
                  <div className="text-[10px] font-mono text-muted-foreground">
                    {relTime(r.ts)} · score {r.score} · {r.risk}
                  </div>
                </div>
                <button
                  onClick={() => downloadFile(`arclight-${r.id}.md`, r.markdown)}
                  className="text-[10px] font-mono text-muted-foreground hover:text-[color:var(--primary)] inline-flex items-center gap-1"
                >
                  <Download size={12} /> DOWNLOAD
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ScoreBlock({
  label,
  score,
  risk,
  delta,
}: {
  label: string;
  score: number;
  risk: string;
  delta?: number;
}) {
  const riskColor =
    risk === "Low" ? "var(--success)" : risk === "Medium" ? "var(--warning)" : "var(--danger)";
  return (
    <div className="rounded-lg border border-[color:var(--panel-border)] p-4 text-center">
      <div className="text-[10px] font-mono tracking-[0.18em] text-muted-foreground">
        {label.toUpperCase()}
      </div>
      <div className="text-4xl font-semibold neon-text mt-1 tabular-nums">{score}</div>
      <div className="flex items-center justify-center gap-2 mt-2">
        <span
          className="text-[10px] font-mono tracking-widest px-2 py-0.5 rounded-md"
          style={{ color: riskColor, background: `color-mix(in oklab, ${riskColor} 14%, transparent)` }}
        >
          {risk.toUpperCase()}
        </span>
        {typeof delta === "number" && (
          <span
            className="text-[11px] font-mono"
            style={{ color: delta >= 0 ? "var(--success)" : "var(--danger)" }}
          >
            {delta >= 0 ? "+" : ""}{delta}
          </span>
        )}
      </div>
    </div>
  );
}
