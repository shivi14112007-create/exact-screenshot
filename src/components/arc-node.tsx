import { Handle, Position, type NodeProps } from "reactflow";
import { Cloud, Database, GitBranch, Sparkles, Workflow } from "lucide-react";
import type { NodeKind } from "@/lib/arclight";

const kindMeta: Record<NodeKind, { icon: typeof Cloud; color: string; label: string }> = {
  ai:        { icon: Sparkles,  color: "var(--neon-purple)", label: "AI MODEL" },
  cloud:     { icon: Cloud,     color: "var(--cyan)",        label: "CLOUD" },
  api:       { icon: GitBranch, color: "var(--neon-blue)",   label: "API" },
  workflow:  { icon: Workflow,  color: "var(--neon-pink)",   label: "WORKFLOW" },
  database:  { icon: Database,  color: "var(--success)",     label: "DATABASE" },
};

export type NodeStatus = "Stable" | "Watch" | "At Risk" | "Critical";

const statusColor: Record<NodeStatus, string> = {
  Stable: "var(--success)",
  Watch: "var(--cyan)",
  "At Risk": "var(--warning)",
  Critical: "var(--danger)",
};

export interface ArcNodeData {
  label: string;
  kind: NodeKind;
  provider?: string;
  affected?: boolean;
  status?: NodeStatus;
  criticality?: number;
  matched?: boolean; // search hit
  dimmed?: boolean;
}

export function ArcNode({ data, selected }: NodeProps<ArcNodeData>) {
  const meta = kindMeta[data.kind];
  const Icon = meta.icon;
  const status = data.status ?? "Stable";
  const sColor = statusColor[status];

  const ring = selected
    ? `0 0 0 2px var(--cyan), 0 8px 32px -8px var(--cyan)`
    : data.affected
    ? `0 0 0 1px var(--danger), 0 6px 28px -8px color-mix(in oklab, var(--danger) 60%, transparent)`
    : data.matched
    ? `0 0 0 2px var(--warning), 0 6px 24px -8px var(--warning)`
    : `0 4px 18px -10px rgba(0,0,0,0.6)`;

  return (
    <div
      className={`group relative rounded-xl border backdrop-blur px-3 py-2.5 min-w-[200px] transition-all duration-200 ${
        data.affected ? "pulse-danger border-[color:var(--danger)]" : "border-[color:var(--panel-border)] hover:border-[color:var(--cyan)]"
      } ${data.dimmed ? "opacity-30" : "opacity-100"}`}
      style={{
        background:
          "linear-gradient(160deg, oklch(0.22 0.03 260 / 0.95), oklch(0.17 0.025 260 / 0.95))",
        boxShadow: ring,
      }}
    >
      <Handle type="target" position={Position.Left} className="!w-2 !h-2 !bg-[color:var(--cyan)] !border-0" />
      <div className="flex items-center gap-2">
        <div
          className="grid place-items-center w-9 h-9 rounded-lg shrink-0"
          style={{
            background: `linear-gradient(135deg, color-mix(in oklab, ${meta.color} 28%, transparent), color-mix(in oklab, ${meta.color} 8%, transparent))`,
            color: meta.color,
            boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${meta.color} 35%, transparent)`,
          }}
        >
          <Icon size={16} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] tracking-[0.14em] text-muted-foreground font-mono">{meta.label}</div>
          <div className="text-sm font-medium text-foreground truncate">{data.label}</div>
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        <span
          className="text-[9px] font-mono tracking-widest px-1.5 py-0.5 rounded-sm border"
          style={{
            color: sColor,
            borderColor: `color-mix(in oklab, ${sColor} 50%, transparent)`,
            background: `color-mix(in oklab, ${sColor} 12%, transparent)`,
          }}
        >
          {status.toUpperCase()}
        </span>
        {typeof data.criticality === "number" && (
          <span className="text-[9px] font-mono text-muted-foreground">
            CRIT {data.criticality}
          </span>
        )}
      </div>
      <Handle type="source" position={Position.Right} className="!w-2 !h-2 !bg-[color:var(--cyan)] !border-0" />
    </div>
  );
}
