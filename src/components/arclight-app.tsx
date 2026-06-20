import { useMemo, useState, useEffect, useCallback } from "react";
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  MarkerType,
  ReactFlowProvider,
  useReactFlow,
  type Edge,
  type Node,
} from "reactflow";
import { Search, Maximize2 } from "lucide-react";
import { ArcNode, type ArcNodeData } from "@/components/arc-node";
import {
  computeImpact,
  computeNodeIntel,
  type Ecosystem,
  type Shock,
} from "@/lib/arclight";

const nodeTypes = { arc: ArcNode };

const columnOf: Record<string, number> = {
  workflow: 0,
  api: 1,
  ai: 2,
  database: 3,
  cloud: 4,
};

function layout(eco: Ecosystem): { nodes: Node<ArcNodeData>[]; edges: Edge[] } {
  const byCol: Record<number, string[]> = { 0: [], 1: [], 2: [], 3: [], 4: [] };
  for (const n of eco.nodes) byCol[columnOf[n.kind] ?? 2].push(n.id);
  const positions: Record<string, { x: number; y: number }> = {};
  const colWidth = 320;
  Object.entries(byCol).forEach(([col, ids]) => {
    const c = Number(col);
    const gap = 130;
    const startY = -((ids.length - 1) * gap) / 2;
    ids.forEach((id, i) => {
      positions[id] = { x: c * colWidth, y: startY + i * gap + 300 };
    });
  });
  const nodes: Node<ArcNodeData>[] = eco.nodes.map((n) => ({
    id: n.id,
    type: "arc",
    position: positions[n.id] ?? { x: 0, y: 0 },
    data: { label: n.label, kind: n.kind, provider: n.provider },
  }));
  const edges: Edge[] = eco.edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    type: "smoothstep",
    animated: false,
    markerEnd: { type: MarkerType.ArrowClosed, color: "oklch(0.6 0.1 250)" },
  }));
  return { nodes, edges };
}

function GraphInner({
  ecosystem,
  shock,
  onNodeClick,
  selectedId,
}: {
  ecosystem: Ecosystem;
  shock: Shock | null;
  onNodeClick?: (id: string) => void;
  selectedId?: string | null;
}) {
  const rf = useReactFlow();
  const [search, setSearch] = useState("");
  const base = useMemo(() => layout(ecosystem), [ecosystem]);
  const impact = useMemo(() => computeImpact(ecosystem, shock), [ecosystem, shock]);

  const intelByNode = useMemo(() => {
    const m = new Map<string, ReturnType<typeof computeNodeIntel>>();
    for (const n of ecosystem.nodes) m.set(n.id, computeNodeIntel(ecosystem, n.id));
    return m;
  }, [ecosystem]);

  const query = search.trim().toLowerCase();
  const matchedIds = useMemo(() => {
    if (!query) return new Set<string>();
    return new Set(
      ecosystem.nodes
        .filter((n) => n.label.toLowerCase().includes(query) || (n.provider ?? "").toLowerCase().includes(query))
        .map((n) => n.id),
    );
  }, [ecosystem, query]);

  const nodes = base.nodes.map((n) => {
    const intel = intelByNode.get(n.id);
    const status = intel?.riskLevel ?? "Stable";
    return {
      ...n,
      selected: n.id === selectedId,
      data: {
        ...n.data,
        affected: impact.affectedNodeIds.has(n.id),
        status,
        criticality: intel?.criticalityScore,
        matched: matchedIds.has(n.id),
        dimmed: query.length > 0 && !matchedIds.has(n.id),
      },
    };
  });

  const edges = base.edges.map((e) => ({
    ...e,
    className: impact.affectedEdgeIds.has(e.id) ? "affected" : undefined,
    animated: impact.affectedEdgeIds.has(e.id),
  }));

  // Auto-fit when ecosystem changes
  useEffect(() => {
    const t = setTimeout(() => rf.fitView({ padding: 0.18, duration: 600 }), 50);
    return () => clearTimeout(t);
  }, [ecosystem, rf]);

  // Zoom to first match on search
  useEffect(() => {
    if (!query || matchedIds.size === 0) return;
    const first = nodes.find((n) => matchedIds.has(n.id));
    if (first) {
      rf.setCenter(first.position.x + 100, first.position.y, { zoom: 1.3, duration: 500 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const fit = useCallback(() => rf.fitView({ padding: 0.18, duration: 500 }), [rf]);

  return (
    <>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        proOptions={{ hideAttribution: true }}
        nodesDraggable
        nodesConnectable={false}
        elementsSelectable
        panOnScroll
        panOnDrag
        selectionOnDrag
        zoomOnScroll
        zoomOnPinch
        minZoom={0.3}
        maxZoom={2.2}
        onNodeClick={(_, n) => onNodeClick?.(n.id)}
        onPaneClick={() => onNodeClick?.("")}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={28}
          size={1}
          color="oklch(0.35 0.03 260 / 0.6)"
        />
        <Controls showInteractive={false} />
        <MiniMap
          pannable
          zoomable
          nodeStrokeWidth={2}
          maskColor="oklch(0.14 0.02 260 / 0.85)"
          nodeColor={(n: any) => {
            const k = n.data?.kind ?? "ai";
            const map: Record<string, string> = {
              ai: "#b56bff",
              cloud: "#38e0ff",
              api: "#5a8eff",
              workflow: "#ff5cc8",
              database: "#5cffb0",
            };
            return map[k] ?? "#888";
          }}
          style={{
            background: "oklch(0.18 0.025 260 / 0.92)",
            border: "1px solid var(--panel-border)",
            borderRadius: 8,
          }}
        />
      </ReactFlow>

      <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-[color:var(--panel-border)] bg-[oklch(0.18_0.025_260)]/85 backdrop-blur min-w-[220px]">
          <Search size={12} className="text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search node or provider…"
            className="bg-transparent outline-none text-xs flex-1 placeholder:text-muted-foreground"
          />
          {search && (
            <span className="text-[10px] font-mono text-[color:var(--primary)]">
              {matchedIds.size}
            </span>
          )}
        </div>
        <button
          onClick={fit}
          className="h-8 w-8 grid place-items-center rounded-md border border-[color:var(--panel-border)] bg-[oklch(0.18_0.025_260)]/85 backdrop-blur text-muted-foreground hover:text-[color:var(--primary)] hover:border-[color:var(--primary)]/50 transition"
          aria-label="Auto-fit"
          title="Auto-fit graph"
        >
          <Maximize2 size={13} />
        </button>
      </div>
    </>
  );
}

export function DependencyGraph(props: {
  ecosystem: Ecosystem;
  shock: Shock | null;
  onNodeClick?: (id: string) => void;
  selectedId?: string | null;
}) {
  return (
    <ReactFlowProvider>
      <GraphInner {...props} />
    </ReactFlowProvider>
  );
}

export function Logo({ size = "md" }: { size?: "sm" | "md" }) {
  const s = size === "sm" ? "w-6 h-6" : "w-7 h-7";
  return (
    <div className="flex items-center gap-2">
      <div
        className={`relative ${s} grid place-items-center rounded-md`}
        style={{ background: "linear-gradient(135deg, var(--primary), var(--neon-purple))" }}
      >
        <div className="absolute inset-0.5 rounded-[5px] bg-background grid place-items-center">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ background: "linear-gradient(135deg, var(--primary), var(--neon-purple))" }}
          />
        </div>
      </div>
      <div className="text-sm font-semibold tracking-[0.18em]">ARCLIGHT</div>
    </div>
  );
}
