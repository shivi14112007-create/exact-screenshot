import { X, AlertTriangle, ShieldCheck, Lightbulb, Activity } from "lucide-react";
import type { NodeIntel } from "@/lib/arclight";

const riskColors: Record<NodeIntel["riskLevel"], string> = {
  Stable: "var(--success)",
  Watch: "var(--cyan)",
  "At Risk": "var(--warning)",
  Critical: "var(--danger)",
};

const redundancyColors: Record<NodeIntel["redundancyStatus"], string> = {
  Redundant: "var(--success)",
  Partial: "var(--warning)",
  None: "var(--danger)",
  "N/A": "var(--muted-foreground)",
};

export function NodeIntelPanel({
  intel,
  onClose,
  onRemove,
}: {
  intel: NodeIntel;
  onClose: () => void;
  onRemove?: () => void;
}) {
  const rColor = riskColors[intel.riskLevel];
  const redColor = redundancyColors[intel.redundancyStatus];
  return (
    <div className="panel p-5 h-full overflow-auto">
      <div className="flex items-start justify-between mb-3">
        <div className="min-w-0">
          <div className="text-[10px] font-mono tracking-[0.2em] text-muted-foreground">
            {intel.node.kind.toUpperCase()}
          </div>
          <h3 className="text-lg font-semibold mt-0.5 truncate">{intel.node.label}</h3>
          {intel.node.provider && (
            <div className="text-xs text-muted-foreground mt-0.5">Provider · {intel.node.provider}</div>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground p-1 -m-1"
          aria-label="Close"
        >
          <X size={16} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <Stat label="Risk Level" value={intel.riskLevel} color={rColor} />
        <Stat label="Criticality" value={intel.criticality} color="var(--cyan)" />
        <Stat label="Redundancy" value={intel.redundancyStatus} color={redColor} />
        <Stat label="Workflows" value={`${intel.dependentWorkflows.length}`} color="var(--neon-purple)" />
      </div>

      <div className="mb-4">
        <div className="text-[10px] font-mono tracking-[0.18em] text-muted-foreground mb-1.5">
          CRITICALITY SCORE
        </div>
        <div className="h-2 rounded-full bg-[oklch(0.28_0.03_260)] overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${intel.criticalityScore}%`,
              background: `linear-gradient(90deg, var(--cyan), ${rColor})`,
            }}
          />
        </div>
        <div className="text-[10px] font-mono text-muted-foreground mt-1 text-right">
          {intel.criticalityScore} / 100
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center gap-1.5 text-[10px] font-mono tracking-[0.18em] text-muted-foreground mb-1.5">
          <Activity size={11} /> REASONING
        </div>
        <ul className="space-y-1.5">
          {intel.reasons.map((r, i) => (
            <li key={i} className="text-xs text-muted-foreground leading-relaxed flex gap-2">
              <span className="text-[color:var(--cyan)] mt-1.5 w-1 h-1 rounded-full bg-[color:var(--cyan)] shrink-0" />
              {r}
            </li>
          ))}
        </ul>
      </div>

      {intel.dependentWorkflows.length > 0 && (
        <div className="mb-4">
          <div className="text-[10px] font-mono tracking-[0.18em] text-muted-foreground mb-1.5">
            DEPENDENT WORKFLOWS
          </div>
          <div className="flex flex-wrap gap-1.5">
            {intel.dependentWorkflows.map((w) => (
              <span
                key={w.id}
                className="text-[11px] px-2 py-0.5 rounded-md border border-[color:var(--panel-border)] bg-[oklch(0.22_0.025_260)]"
              >
                {w.label}
              </span>
            ))}
          </div>
        </div>
      )}

      <div
        className="rounded-lg border p-3 mb-3"
        style={{
          borderColor: `color-mix(in oklab, ${rColor} 35%, transparent)`,
          background: `color-mix(in oklab, ${rColor} 8%, transparent)`,
        }}
      >
        <div className="flex items-center gap-1.5 text-[10px] font-mono tracking-[0.18em] mb-1" style={{ color: rColor }}>
          {intel.riskLevel === "Stable" ? <ShieldCheck size={11} /> : <AlertTriangle size={11} />}
          RECOMMENDATION
        </div>
        <div className="flex items-start gap-2 text-xs leading-relaxed">
          <Lightbulb size={13} className="mt-0.5 shrink-0" style={{ color: rColor }} />
          <span>{intel.recommendation}</span>
        </div>
      </div>

      {onRemove && (
        <button
          onClick={onRemove}
          className="w-full text-[11px] font-mono tracking-widest text-muted-foreground hover:text-[color:var(--danger)] py-2 border border-[color:var(--panel-border)] rounded-md hover:border-[color:var(--danger)]/40 transition"
        >
          REMOVE FROM ECOSYSTEM
        </button>
      )}
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div
      className="rounded-md border p-2.5"
      style={{
        borderColor: `color-mix(in oklab, ${color} 30%, transparent)`,
        background: `color-mix(in oklab, ${color} 7%, transparent)`,
      }}
    >
      <div className="text-[10px] font-mono tracking-[0.15em] text-muted-foreground">
        {label.toUpperCase()}
      </div>
      <div className="text-sm font-semibold mt-0.5" style={{ color }}>
        {value}
      </div>
    </div>
  );
}
