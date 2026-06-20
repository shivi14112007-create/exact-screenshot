import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useArclight } from "@/lib/arclight-store";
import type { NodeKind } from "@/lib/arclight";
import { Layers, Plus, RotateCcw, Sparkles, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_app/ecosystem")({
  component: EcosystemPage,
});

const PROVIDERS: { name: string; kind: NodeKind }[] = [
  { name: "OpenAI", kind: "ai" },
  { name: "Gemini", kind: "ai" },
  { name: "Claude", kind: "ai" },
  { name: "AWS", kind: "cloud" },
  { name: "Azure", kind: "cloud" },
  { name: "GCP", kind: "cloud" },
  { name: "Postgres", kind: "database" },
  { name: "Pinecone", kind: "database" },
];

function kindColor(k: NodeKind) {
  switch (k) {
    case "ai":
      return "var(--neon-purple)";
    case "cloud":
      return "var(--cyan)";
    case "database":
      return "var(--success)";
    case "api":
      return "var(--neon-blue)";
    default:
      return "var(--neon-pink)";
  }
}

function EcosystemPage() {
  const ecosystem = useArclight((s) => s.ecosystem);
  const addDependency = useArclight((s) => s.addDependency);
  const removeNode = useArclight((s) => s.removeNode);
  const reset = useArclight((s) => s.resetEcosystem);
  const loadDemoData = useArclight((s) => s.loadDemoData);

  const [workflow, setWorkflow] = useState("");
  const [provider, setProvider] = useState(PROVIDERS[0].name);
  const [filter, setFilter] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!workflow.trim()) return;
    const p = PROVIDERS.find((x) => x.name === provider)!;
    addDependency(workflow.trim(), p.name, p.kind);
    setWorkflow("");
  };

  const filtered = ecosystem.nodes.filter(
    (n) => !filter.trim() || n.label.toLowerCase().includes(filter.toLowerCase()) || n.kind.includes(filter.toLowerCase()),
  );

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto space-y-4">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Ecosystem Builder</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Define your workflows and the providers powering them. Changes propagate to every view live.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadDemoData}
            className="text-sm px-3 py-2 rounded-md border border-[color:var(--panel-border)] inline-flex items-center gap-2 hover:border-[color:var(--neon-purple)]"
          >
            <Sparkles size={14} className="text-[color:var(--neon-purple)]" /> Load demo data
          </button>
          <button
            onClick={reset}
            className="text-sm px-3 py-2 rounded-md border border-[color:var(--panel-border)] inline-flex items-center gap-2 hover:border-[color:var(--cyan)]"
          >
            <RotateCcw size={14} /> Reset to defaults
          </button>
        </div>
      </div>

      <form onSubmit={submit} className="panel p-5">
        <div className="flex items-center gap-2 mb-3">
          <Plus size={15} className="text-[color:var(--cyan)]" />
          <h3 className="text-sm font-medium">Add new dependency</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-[1fr_220px_auto] gap-2">
          <input
            value={workflow}
            onChange={(e) => setWorkflow(e.target.value)}
            placeholder="Workflow name (e.g. Fraud Detection)"
            className="bg-[oklch(0.18_0.025_260)] border border-[color:var(--panel-border)] rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-[color:var(--cyan)]"
          />
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className="bg-[oklch(0.18_0.025_260)] border border-[color:var(--panel-border)] rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-[color:var(--cyan)]"
          >
            {PROVIDERS.map((p) => (
              <option key={p.name} value={p.name}>
                {p.name} · {p.kind.toUpperCase()}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="px-4 py-2.5 rounded-md font-medium text-[color:var(--primary-foreground)] hover:brightness-110"
            style={{ background: "linear-gradient(90deg, var(--cyan), var(--neon-purple))" }}
          >
            Add to graph
          </button>
        </div>
      </form>

      <div className="panel p-5">
        <div className="flex items-center gap-2 mb-3">
          <Layers size={15} className="text-[color:var(--cyan)]" />
          <h3 className="text-sm font-medium">Registered nodes</h3>
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter…"
            className="ml-3 bg-[oklch(0.18_0.025_260)] border border-[color:var(--panel-border)] rounded-md px-2 py-1 text-xs focus:outline-none focus:border-[color:var(--cyan)] w-40"
          />
          <span className="ml-auto text-[10px] font-mono text-muted-foreground tracking-widest">
            {filtered.length}/{ecosystem.nodes.length} NODES · {ecosystem.edges.length} EDGES
          </span>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2">
          {filtered.map((n) => {
            const color = kindColor(n.kind);
            return (
              <div
                key={n.id}
                className="flex items-center gap-3 px-3 py-2.5 rounded-md border border-[color:var(--panel-border)]"
              >
                <span className="w-2 h-2 rounded-sm" style={{ background: color }} />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">{n.label}</div>
                  <div className="text-[10px] font-mono text-muted-foreground tracking-widest">
                    {n.kind.toUpperCase()}
                    {n.provider ? ` · ${n.provider}` : ""}
                  </div>
                </div>
                <button
                  onClick={() => removeNode(n.id)}
                  className="text-muted-foreground hover:text-[color:var(--danger)]"
                  aria-label="Remove"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
