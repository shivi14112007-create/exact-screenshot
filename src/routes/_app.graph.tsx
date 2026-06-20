import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { useArclight } from "@/lib/arclight-store";
import { computeNodeIntel, shocks } from "@/lib/arclight";
import { DependencyGraph } from "@/components/arclight-app";
import { NodeIntelPanel } from "@/components/node-intel-panel";

export const Route = createFileRoute("/_app/graph")({
  validateSearch: (s: Record<string, unknown>) => ({
    shock: typeof s.shock === "string" ? s.shock : undefined,
    node: typeof s.node === "string" ? s.node : undefined,
  }),
  component: GraphPage,
});

function GraphPage() {
  const ecosystem = useArclight((s) => s.ecosystem);
  const shock = useArclight((s) => s.shock);
  const setShock = useArclight((s) => s.setShock);
  const selectedId = useArclight((s) => s.selectedNodeId);
  const setSelected = useArclight((s) => s.setSelected);
  const removeNode = useArclight((s) => s.removeNode);
  const search = useSearch({ from: "/_app/graph" });

  // Apply shock from query param on mount
  useEffect(() => {
    if (search.shock) {
      const s = shocks.find((x) => x.id === search.shock);
      if (s) setShock(s);
    }
    if (search.node) setSelected(search.node);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const intel = useMemo(
    () => (selectedId ? computeNodeIntel(ecosystem, selectedId) : null),
    [ecosystem, selectedId],
  );

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-end justify-between mb-4 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dependency Topology</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            The single source of truth for AI &amp; cloud dependency mapping. Click any node for intelligence.
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono">
          <Legend color="var(--neon-pink)" label="WORKFLOW" />
          <Legend color="var(--neon-blue)" label="API" />
          <Legend color="var(--neon-purple)" label="AI" />
          <Legend color="var(--success)" label="DB" />
          <Legend color="var(--cyan)" label="CLOUD" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4">
        <div className="panel relative overflow-hidden h-[calc(100vh-200px)] min-h-[520px]">
          <div className="absolute inset-0">
            <DependencyGraph
              ecosystem={ecosystem}
              shock={shock}
              selectedId={selectedId}
              onNodeClick={(id) => setSelected(id || null)}
            />
          </div>
        </div>

        <div className="h-[calc(100vh-200px)] min-h-[520px]">
          {intel ? (
            <NodeIntelPanel
              intel={intel}
              onClose={() => setSelected(null)}
              onRemove={() => {
                removeNode(intel.node.id);
                setSelected(null);
              }}
            />
          ) : (
            <div className="panel p-5 h-full flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-full mb-3 grid place-items-center" style={{ background: "color-mix(in oklab, var(--primary) 14%, transparent)" }}>
                <span className="w-2 h-2 rounded-full bg-[color:var(--primary)] animate-pulse" />
              </div>
              <div className="text-[10px] font-mono tracking-[0.2em] text-muted-foreground mb-2">
                NODE INTELLIGENCE
              </div>
              <div className="text-sm text-muted-foreground max-w-[260px] leading-relaxed">
                Select any node in the graph to inspect criticality, redundancy and rule-based recommendations.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
      <span className="w-2 h-2 rounded-sm" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
      {label}
    </span>
  );
}
