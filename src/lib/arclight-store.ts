import { create } from "zustand";
import {
  defaultEcosystem,
  type Ecosystem,
  type Shock,
  type DepNode,
  type NodeKind,
} from "./arclight";

export type SignalTone = "default" | "success" | "warning" | "danger" | "info";
export interface Signal {
  id: string;
  ts: number;
  tone: SignalTone;
  text: string;
  read?: boolean;
}

export interface AlertRule {
  id: string;
  channel: string;
  scope: "Critical only" | "Critical + High" | "All severities" | "Disabled";
  enabled: boolean;
}

export interface ComplianceControl {
  id: string;
  label: string;
  detail: string;
  enabled: boolean;
}

export interface ReportRecord {
  id: string;
  title: string;
  ts: number;
  score: number;
  risk: string;
  markdown: string;
}

export type ThemeId = "cyber-blue" | "aurora-green" | "violet-pulse" | "amber-signal";

interface ArclightState {
  ecosystem: Ecosystem;
  shock: Shock | null;
  selectedNodeId: string | null;
  comparisonShockId: string | null;
  authed: boolean;
  workspace: string;
  theme: ThemeId;
  signals: Signal[];
  alertRules: AlertRule[];
  controls: ComplianceControl[];
  reports: ReportRecord[];
  appliedRecs: string[];
  paletteOpen: boolean;

  setShock: (s: Shock | null) => void;
  setComparisonShock: (id: string | null) => void;
  setSelected: (id: string | null) => void;
  setAuthed: (v: boolean) => void;
  setWorkspace: (w: string) => void;
  setTheme: (t: ThemeId) => void;
  addDependency: (workflowLabel: string, providerLabel: string, kind: NodeKind) => void;
  removeNode: (id: string) => void;
  resetEcosystem: () => void;
  loadDemoData: () => void;

  pushSignal: (tone: SignalTone, text: string) => void;
  markAllRead: () => void;
  clearSignals: () => void;

  toggleAlertRule: (id: string) => void;
  cycleAlertScope: (id: string) => void;
  toggleControl: (id: string) => void;
  applyRecommendation: (title: string) => void;

  addReport: (r: Omit<ReportRecord, "id" | "ts">) => ReportRecord;
  removeReport: (id: string) => void;

  setPaletteOpen: (v: boolean) => void;
}

const slug = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const scopes: AlertRule["scope"][] = [
  "Critical only",
  "Critical + High",
  "All severities",
  "Disabled",
];

export const useArclight = create<ArclightState>((set, get) => ({
  ecosystem: defaultEcosystem,
  shock: null,
  selectedNodeId: null,
  comparisonShockId: null,
  authed: false,
  workspace: "production-ecosystem",
  theme: "cyber-blue",
  signals: [
    { id: "s1", ts: Date.now() - 1000 * 60 * 18, tone: "warning", text: "Concentration drift on OpenAI surpassed 45%" },
    { id: "s2", ts: Date.now() - 1000 * 60 * 31, tone: "success", text: "Vector Search latency normalized" },
    { id: "s3", ts: Date.now() - 1000 * 60 * 46, tone: "default", text: "Postgres replica failover rehearsed" },
    { id: "s4", ts: Date.now() - 1000 * 60 * 82, tone: "info", text: "New AI workflow registered: Recommendations" },
  ],
  alertRules: [
    { id: "slack", channel: "Slack #intel-alerts", scope: "Critical + High", enabled: true },
    { id: "pager", channel: "PagerDuty · ai-platform", scope: "Critical only", enabled: true },
    { id: "email", channel: "Email · security@arclight.io", scope: "All severities", enabled: false },
  ],
  controls: [
    { id: "eu-ai-act", label: "EU AI Act controls", detail: "Tag high-risk workflows; require human-in-loop for tier-2 events.", enabled: true },
    { id: "soc2", label: "SOC 2 telemetry", detail: "Forward provider posture into audit log every 6h.", enabled: true },
    { id: "data-residency", label: "EU data residency", detail: "Block model calls routing outside EU regions.", enabled: false },
  ],
  reports: [],
  appliedRecs: [],
  paletteOpen: false,

  setShock: (s) => set({ shock: s }),
  setComparisonShock: (id) => set({ comparisonShockId: id }),
  setSelected: (id) => set({ selectedNodeId: id }),
  setAuthed: (v) => set({ authed: v }),
  setWorkspace: (w) => set({ workspace: w }),
  setTheme: (t) => set({ theme: t }),

  addDependency: (workflowLabel, providerLabel, kind) => {
    set((state) => {
      const wfId = `wf-${slug(workflowLabel)}`;
      const provId = `${kind}-${slug(providerLabel)}`;
      const nodes: DepNode[] = [...state.ecosystem.nodes];
      const edges = [...state.ecosystem.edges];
      if (!nodes.find((n) => n.id === wfId)) nodes.push({ id: wfId, label: workflowLabel, kind: "workflow" });
      if (!nodes.find((n) => n.id === provId)) nodes.push({ id: provId, label: providerLabel, kind, provider: providerLabel });
      const edgeId = `e-${wfId}-${provId}`;
      if (!edges.find((e) => e.id === edgeId)) edges.push({ id: edgeId, source: wfId, target: provId });
      return { ecosystem: { nodes, edges } };
    });
    get().pushSignal("info", `Mapped ${workflowLabel} → ${providerLabel}`);
  },

  removeNode: (id) => {
    const n = get().ecosystem.nodes.find((x) => x.id === id);
    set((state) => ({
      ecosystem: {
        nodes: state.ecosystem.nodes.filter((x) => x.id !== id),
        edges: state.ecosystem.edges.filter((e) => e.source !== id && e.target !== id),
      },
    }));
    if (n) get().pushSignal("warning", `Removed ${n.label} from ecosystem`);
  },

  resetEcosystem: () => {
    set({ ecosystem: defaultEcosystem, shock: null, selectedNodeId: null });
    get().pushSignal("info", "Ecosystem reset to defaults");
  },

  loadDemoData: () => {
    set((state) => {
      const nodes = [...state.ecosystem.nodes];
      const edges = [...state.ecosystem.edges];
      const extras: DepNode[] = [
        { id: "wf-fraud", label: "Fraud Detection", kind: "workflow" },
        { id: "wf-marketing", label: "Marketing Copy", kind: "workflow" },
        { id: "wf-codegen", label: "Code Assist", kind: "workflow" },
        { id: "ai-mistral", label: "Mistral Large", kind: "ai", provider: "Mistral" },
        { id: "cloud-gcp", label: "GCP", kind: "cloud", provider: "GCP" },
        { id: "db-pinecone", label: "Pinecone", kind: "database", provider: "Pinecone" },
      ];
      const extraEdges = [
        { id: "d-e1", source: "wf-fraud", target: "ai-openai" },
        { id: "d-e2", source: "wf-fraud", target: "db-pinecone" },
        { id: "d-e3", source: "wf-marketing", target: "ai-claude" },
        { id: "d-e4", source: "wf-codegen", target: "ai-openai" },
        { id: "d-e5", source: "wf-codegen", target: "ai-mistral" },
        { id: "d-e6", source: "ai-mistral", target: "cloud-gcp" },
        { id: "d-e7", source: "db-pinecone", target: "cloud-gcp" },
      ];
      for (const n of extras) if (!nodes.find((x) => x.id === n.id)) nodes.push(n);
      for (const e of extraEdges) if (!edges.find((x) => x.id === e.id)) edges.push(e);
      return { ecosystem: { nodes, edges } };
    });
    get().pushSignal("success", "Demo dataset loaded — 6 nodes / 7 edges added");
  },

  pushSignal: (tone, text) =>
    set((state) => ({
      signals: [
        { id: `s-${Date.now()}-${state.signals.length}`, ts: Date.now(), tone, text },
        ...state.signals,
      ].slice(0, 50),
    })),
  markAllRead: () => set((s) => ({ signals: s.signals.map((x) => ({ ...x, read: true })) })),
  clearSignals: () => set({ signals: [] }),

  toggleAlertRule: (id) =>
    set((s) => ({ alertRules: s.alertRules.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)) })),
  cycleAlertScope: (id) =>
    set((s) => ({
      alertRules: s.alertRules.map((r) =>
        r.id === id ? { ...r, scope: scopes[(scopes.indexOf(r.scope) + 1) % scopes.length] } : r,
      ),
    })),
  toggleControl: (id) => {
    set((s) => ({ controls: s.controls.map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c)) }));
    const c = get().controls.find((x) => x.id === id);
    if (c) get().pushSignal(c.enabled ? "success" : "warning", `${c.label} ${c.enabled ? "enabled" : "disabled"}`);
  },
  applyRecommendation: (title) => {
    set((s) =>
      s.appliedRecs.includes(title) ? s : { appliedRecs: [...s.appliedRecs, title] },
    );
    get().pushSignal("success", `Applied: ${title}`);
  },

  addReport: (r) => {
    const rec: ReportRecord = { ...r, id: `rep-${Date.now()}`, ts: Date.now() };
    set((s) => ({ reports: [rec, ...s.reports].slice(0, 20) }));
    get().pushSignal("info", `Briefing generated — sovereignty ${r.score}`);
    return rec;
  },
  removeReport: (id) => set((s) => ({ reports: s.reports.filter((r) => r.id !== id) })),

  setPaletteOpen: (v) => set({ paletteOpen: v }),
}));
