import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Layers, Clock, ChevronRight, Sparkles } from "lucide-react";
import { useArclight } from "@/lib/arclight-store";
import {
  computeSovereignty,
  resilienceActions,
  type Ecosystem,
  type ResilienceAction,
  type Sovereignty,
} from "@/lib/arclight";

export const Route = createFileRoute("/_app/timeline")({
  component: TimelinePage,
});

interface Step {
  label: string;
  action: ResilienceAction | null;
  ecosystem: Ecosystem;
  sov: Sovereignty;
}

function TimelinePage() {
  const ecosystem = useArclight((s) => s.ecosystem);
  const [selectedActions, setSelectedActions] = useState<string[]>([
    "add-gemini-backup",
    "regional-cloud-redundancy",
    "deploy-local-llm",
  ]);

  const steps: Step[] = useMemo(() => {
    const result: Step[] = [];
    let current = ecosystem;
    let sov = computeSovereignty(current);
    result.push({ label: "Current state", action: null, ecosystem: current, sov });
    for (const id of selectedActions) {
      const action = resilienceActions.find((a) => a.id === id);
      if (!action) continue;
      current = action.apply(current);
      sov = computeSovereignty(current);
      result.push({ label: action.title, action, ecosystem: current, sov });
    }
    return result;
  }, [ecosystem, selectedActions]);

  const [focusIdx, setFocusIdx] = useState(0);
  const focused = steps[Math.min(focusIdx, steps.length - 1)];
  const final = steps[steps.length - 1];
  const baseline = steps[0];
  const delta = final.sov.score - baseline.sov.score;

  const toggleAction = (id: string) => {
    setSelectedActions((cur) =>
      cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id],
    );
  };

  return (
    <div className="p-4 md:p-6 max-w-[1500px] mx-auto space-y-4">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            AI Dependency Risk Timeline <Sparkles size={16} className="text-[color:var(--primary)]" />
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Simulate the evolution of resilience as mitigations are stacked sequentially.
          </p>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-mono tracking-[0.2em] text-muted-foreground">
            BASELINE → PROJECTED
          </div>
          <div className="text-2xl font-semibold tabular-nums">
            <span className="text-muted-foreground">{baseline.sov.score}</span>{" "}
            <ChevronRight size={16} className="inline -mt-1 text-muted-foreground" />{" "}
            <span className="neon-text">{final.sov.score}</span>{" "}
            <span
              className={`text-sm font-mono ${delta >= 0 ? "text-[color:var(--success)]" : "text-[color:var(--danger)]"}`}
            >
              ({delta >= 0 ? "+" : ""}{delta})
            </span>
          </div>
        </div>
      </div>

      {/* Action picker */}
      <div className="panel p-4">
        <div className="flex items-center gap-2 mb-3">
          <Layers size={14} className="text-[color:var(--primary)]" />
          <h3 className="text-sm font-medium">Mitigation Actions</h3>
          <span className="ml-auto text-[10px] font-mono tracking-widest text-muted-foreground">
            CLICK TO STACK
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
          {resilienceActions.map((a) => {
            const on = selectedActions.includes(a.id);
            const diffColor =
              a.difficulty === "Easy" ? "var(--success)" : a.difficulty === "Medium" ? "var(--warning)" : "var(--danger)";
            return (
              <button
                key={a.id}
                onClick={() => toggleAction(a.id)}
                className={`text-left rounded-lg border px-3 py-2.5 transition ${
                  on
                    ? "border-[color:var(--primary)] bg-[color:var(--primary)]/8"
                    : "border-[color:var(--panel-border)] hover:border-[color:var(--primary)]/60"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{a.title}</span>
                  <span
                    className="text-[9px] font-mono tracking-widest px-1.5 py-0.5 rounded-sm"
                    style={{
                      color: diffColor,
                      background: `color-mix(in oklab, ${diffColor} 14%, transparent)`,
                    }}
                  >
                    {a.difficulty.toUpperCase()}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1 leading-snug">{a.detail}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Timeline */}
      <div className="panel p-5">
        <div className="flex items-center gap-2 mb-5">
          <Clock size={14} className="text-[color:var(--primary)]" />
          <h3 className="text-sm font-medium">Resilience Evolution</h3>
        </div>

        <ScoreCurve steps={steps} focusIdx={focusIdx} onFocus={setFocusIdx} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
          {steps.map((s, i) => {
            const isFocus = i === focusIdx;
            return (
              <button
                key={i}
                onClick={() => setFocusIdx(i)}
                className={`text-left rounded-lg border p-3 transition relative overflow-hidden ${
                  isFocus
                    ? "border-[color:var(--primary)] bg-[color:var(--primary)]/8"
                    : "border-[color:var(--panel-border)] hover:border-[color:var(--primary)]/40"
                }`}
              >
                <div className="text-[10px] font-mono tracking-widest text-muted-foreground">
                  STEP {i}
                </div>
                <div className="text-sm font-medium mt-1 leading-tight">{s.label}</div>
                <div className="text-2xl font-semibold mt-2 tabular-nums neon-text">{s.sov.score}</div>
                {i > 0 && (
                  <div
                    className={`text-[10px] font-mono mt-0.5 ${
                      s.sov.score - steps[i - 1].sov.score >= 0
                        ? "text-[color:var(--success)]"
                        : "text-[color:var(--danger)]"
                    }`}
                  >
                    {s.sov.score - steps[i - 1].sov.score >= 0 ? "+" : ""}
                    {s.sov.score - steps[i - 1].sov.score}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Focused step breakdown */}
      <div className="panel p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium">
            Step {focusIdx}: {focused.label}
          </h3>
          <span className="text-[10px] font-mono tracking-widest text-muted-foreground">
            {focused.ecosystem.nodes.length} nodes · {focused.ecosystem.edges.length} edges
          </span>
        </div>
        <div className="space-y-1.5">
          {focused.sov.components.map((c) => (
            <div key={c.key} className="flex items-center gap-3 text-xs">
              <span
                className="font-mono w-10 text-right tabular-nums"
                style={{ color: c.delta > 0 ? "var(--success)" : c.delta < 0 ? "var(--danger)" : "var(--muted-foreground)" }}
              >
                {c.delta > 0 ? "+" : ""}{c.delta}
              </span>
              <div className="flex-1">
                <div className="font-medium">{c.label}</div>
                <div className="text-[11px] text-muted-foreground">{c.reason}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ScoreCurve({ steps, focusIdx, onFocus }: { steps: Step[]; focusIdx: number; onFocus: (i: number) => void }) {
  const w = 800;
  const h = 160;
  const pad = 24;
  const innerW = w - pad * 2;
  const innerH = h - pad * 2;
  const points = steps.map((s, i) => {
    const x = pad + (i / Math.max(1, steps.length - 1)) * innerW;
    const y = pad + innerH - (s.sov.score / 100) * innerH;
    return { x, y, score: s.sov.score, i };
  });
  const path = points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(" ");
  const area = `${path} L ${pad + innerW} ${pad + innerH} L ${pad} ${pad + innerH} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-40">
      <defs>
        <linearGradient id="curve-area" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="curve-stroke" x1="0" x2="1">
          <stop offset="0%" stopColor="var(--primary)" />
          <stop offset="100%" stopColor="var(--neon-purple)" />
        </linearGradient>
      </defs>
      {[0, 25, 50, 75, 100].map((g) => {
        const y = pad + innerH - (g / 100) * innerH;
        return (
          <g key={g}>
            <line x1={pad} x2={pad + innerW} y1={y} y2={y} stroke="oklch(0.30 0.03 260 / 0.4)" strokeDasharray="2 4" />
            <text x={pad - 4} y={y + 3} fontSize="9" textAnchor="end" fill="oklch(0.6 0.02 260)" fontFamily="monospace">{g}</text>
          </g>
        );
      })}
      <motion.path
        d={area}
        fill="url(#curve-area)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      />
      <motion.path
        d={path}
        stroke="url(#curve-stroke)"
        strokeWidth="2.5"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        style={{ filter: "drop-shadow(0 0 8px var(--primary))" }}
      />
      {points.map((p) => (
        <g key={p.i} onClick={() => onFocus(p.i)} style={{ cursor: "pointer" }}>
          <circle
            cx={p.x}
            cy={p.y}
            r={p.i === focusIdx ? 7 : 5}
            fill={p.i === focusIdx ? "var(--primary)" : "var(--background)"}
            stroke="var(--primary)"
            strokeWidth="2"
            style={{ filter: p.i === focusIdx ? "drop-shadow(0 0 8px var(--primary))" : undefined }}
          />
          <text
            x={p.x}
            y={p.y - 12}
            fontSize="11"
            textAnchor="middle"
            fill="oklch(0.95 0.01 260)"
            fontFamily="monospace"
            fontWeight="600"
          >
            {p.score}
          </text>
        </g>
      ))}
    </svg>
  );
}
