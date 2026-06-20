export type NodeKind = "ai" | "cloud" | "api" | "workflow" | "database";

export interface DepNode {
  id: string;
  label: string;
  kind: NodeKind;
  provider?: string;
}

export interface DepEdge {
  id: string;
  source: string;
  target: string;
}

export interface Ecosystem {
  nodes: DepNode[];
  edges: DepEdge[];
}

export const defaultEcosystem: Ecosystem = {
  nodes: [
    { id: "wf-support", label: "Customer Support", kind: "workflow" },
    { id: "wf-search", label: "Internal Search", kind: "workflow" },
    { id: "wf-analytics", label: "Analytics Pipeline", kind: "workflow" },
    { id: "wf-recs", label: "Recommendations", kind: "workflow" },

    { id: "ai-openai", label: "OpenAI GPT-4", kind: "ai", provider: "OpenAI" },
    { id: "ai-gemini", label: "Google Gemini", kind: "ai", provider: "Gemini" },
    { id: "ai-claude", label: "Anthropic Claude", kind: "ai", provider: "Claude" },

    { id: "api-vector", label: "Vector Search API", kind: "api" },
    { id: "db-postgres", label: "Postgres", kind: "database" },

    { id: "cloud-aws", label: "AWS", kind: "cloud", provider: "AWS" },
    { id: "cloud-azure", label: "Azure", kind: "cloud", provider: "Azure" },
  ],
  edges: [
    { id: "e1", source: "wf-support", target: "ai-openai" },
    { id: "e2", source: "wf-search", target: "ai-openai" },
    { id: "e3", source: "wf-search", target: "api-vector" },
    { id: "e4", source: "wf-analytics", target: "ai-gemini" },
    { id: "e5", source: "wf-recs", target: "ai-openai" },
    { id: "e6", source: "wf-recs", target: "ai-claude" },
    { id: "e7", source: "api-vector", target: "db-postgres" },
    { id: "e8", source: "ai-openai", target: "cloud-aws" },
    { id: "ai-gemini-cloud", source: "ai-gemini", target: "cloud-aws" },
    { id: "e9", source: "db-postgres", target: "cloud-aws" },
    { id: "e10", source: "ai-claude", target: "cloud-azure" },
  ],
};

export type ShockType = "openai-down" | "aws-outage" | "cost-increase" | "policy-restriction";

export interface Shock {
  id: ShockType;
  label: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  affectedProviders: string[];
}

export const shocks: Shock[] = [
  { id: "openai-down", label: "OpenAI Outage", description: "OpenAI APIs unreachable globally", severity: "critical", affectedProviders: ["OpenAI"] },
  { id: "aws-outage", label: "AWS Region Down", description: "us-east-1 hard failure cascading", severity: "critical", affectedProviders: ["AWS"] },
  { id: "cost-increase", label: "AI Cost Surge", description: "Model pricing rises 4× overnight", severity: "medium", affectedProviders: ["OpenAI", "Claude"] },
  { id: "policy-restriction", label: "Data Regulation Change", description: "Cross-border AI data restricted", severity: "high", affectedProviders: ["OpenAI", "Gemini"] },
];

// ---------- Traversal helpers ----------

function reachableFrom(eco: Ecosystem, startId: string): Set<string> {
  const seen = new Set<string>([startId]);
  const stack = [startId];
  while (stack.length) {
    const cur = stack.pop()!;
    for (const e of eco.edges) {
      if (e.source === cur && !seen.has(e.target)) {
        seen.add(e.target);
        stack.push(e.target);
      }
    }
  }
  return seen;
}

function workflowsDependingOn(eco: Ecosystem, nodeId: string): DepNode[] {
  return eco.nodes.filter(
    (n) => n.kind === "workflow" && reachableFrom(eco, n.id).has(nodeId),
  );
}

// ---------- Impact / Shock propagation ----------

export function computeImpact(eco: Ecosystem, shock: Shock | null) {
  if (!shock)
    return {
      affectedNodeIds: new Set<string>(),
      affectedEdgeIds: new Set<string>(),
      affectedWorkflows: [] as DepNode[],
    };
  const directly = new Set(
    eco.nodes.filter((n) => n.provider && shock.affectedProviders.includes(n.provider)).map((n) => n.id),
  );
  const affected = new Set(directly);
  let changed = true;
  while (changed) {
    changed = false;
    for (const e of eco.edges) {
      if (affected.has(e.target) && !affected.has(e.source)) {
        affected.add(e.source);
        changed = true;
      }
    }
  }
  const affectedEdgeIds = new Set(
    eco.edges.filter((e) => affected.has(e.source) && affected.has(e.target)).map((e) => e.id),
  );
  const affectedWorkflows = eco.nodes.filter((n) => n.kind === "workflow" && affected.has(n.id));
  return { affectedNodeIds: affected, affectedEdgeIds, affectedWorkflows };
}

export function recoveryComplexity(
  shock: Shock,
  eco: Ecosystem,
  impact: ReturnType<typeof computeImpact>,
): "Low" | "Medium" | "High" {
  const wfCount = impact.affectedWorkflows.length;
  const totalWf = eco.nodes.filter((n) => n.kind === "workflow").length || 1;
  const share = wfCount / totalWf;
  const sev = { low: 1, medium: 2, high: 3, critical: 4 }[shock.severity];
  const score = share * 6 + sev;
  if (score >= 6) return "High";
  if (score >= 3.5) return "Medium";
  return "Low";
}

// ---------- Node Intelligence ----------

export interface NodeIntel {
  node: DepNode;
  dependencyCount: number;
  dependentWorkflows: DepNode[];
  workflowShare: number;
  criticalityScore: number;
  criticality: "Low" | "Medium" | "High" | "Very High";
  riskLevel: "Stable" | "Watch" | "At Risk" | "Critical";
  redundancyStatus: "Redundant" | "Partial" | "None" | "N/A";
  reasons: string[];
  recommendation: string;
}

export function computeNodeIntel(eco: Ecosystem, nodeId: string): NodeIntel | null {
  const node = eco.nodes.find((n) => n.id === nodeId);
  if (!node) return null;
  const downstream = reachableFrom(eco, nodeId);
  downstream.delete(nodeId);
  const dependentWorkflows = workflowsDependingOn(eco, nodeId).filter((w) => w.id !== nodeId);
  const totalWf = eco.nodes.filter((n) => n.kind === "workflow").length || 1;
  const workflowShare = dependentWorkflows.length / totalWf;

  // Criticality 0-100: weighted by workflow share + downstream fan-out
  const criticalityScore = Math.min(
    100,
    Math.round(workflowShare * 75 + Math.min(downstream.size, 6) * 4),
  );
  const criticality: NodeIntel["criticality"] =
    criticalityScore >= 75 ? "Very High" : criticalityScore >= 50 ? "High" : criticalityScore >= 25 ? "Medium" : "Low";

  // Redundancy: are there siblings of the same kind serving the same dependent workflows?
  let redundancyStatus: NodeIntel["redundancyStatus"] = "N/A";
  if (node.kind === "workflow") {
    redundancyStatus = "N/A";
  } else {
    const siblings = eco.nodes.filter((n) => n.kind === node.kind && n.id !== node.id);
    if (siblings.length === 0) {
      redundancyStatus = "None";
    } else {
      const covered = dependentWorkflows.filter((wf) => {
        const wfReach = reachableFrom(eco, wf.id);
        return siblings.some((s) => wfReach.has(s.id));
      }).length;
      const coverRatio = dependentWorkflows.length === 0 ? 1 : covered / dependentWorkflows.length;
      redundancyStatus = coverRatio >= 0.9 ? "Redundant" : coverRatio >= 0.4 ? "Partial" : "None";
    }
  }

  // Risk level from criticality + redundancy
  let riskScore = criticalityScore;
  if (redundancyStatus === "None") riskScore += 20;
  else if (redundancyStatus === "Partial") riskScore += 8;
  else if (redundancyStatus === "Redundant") riskScore -= 15;
  const riskLevel: NodeIntel["riskLevel"] =
    riskScore >= 80 ? "Critical" : riskScore >= 55 ? "At Risk" : riskScore >= 30 ? "Watch" : "Stable";

  // Reasons
  const reasons: string[] = [];
  if (dependentWorkflows.length > 0)
    reasons.push(
      `${Math.round(workflowShare * 100)}% of workflows depend on this node (${dependentWorkflows.length}/${totalWf}).`,
    );
  if (downstream.size > 0)
    reasons.push(`Fan-out reaches ${downstream.size} downstream components.`);
  if (redundancyStatus === "None")
    reasons.push("No alternate provider serves the same downstream workflows.");
  else if (redundancyStatus === "Partial")
    reasons.push("Only some dependent workflows have an alternate path.");
  else if (redundancyStatus === "Redundant")
    reasons.push("All dependent workflows have an alternate provider available.");

  // Recommendation
  const fallbackByKind: Record<NodeKind, string[]> = {
    ai: ["Gemini", "Anthropic Claude", "Mistral", "Local Llama-3"],
    cloud: ["GCP", "Azure", "Cloudflare"],
    database: ["Replicated Postgres", "DynamoDB", "Cockroach"],
    api: ["Self-hosted gateway", "Regional replica"],
    workflow: [],
  };
  const peers = eco.nodes
    .filter((n) => n.kind === node.kind && n.id !== node.id)
    .map((n) => n.provider ?? n.label);
  const suggestions = (fallbackByKind[node.kind] ?? []).filter((s) => !peers.includes(s));
  let recommendation = "Posture is healthy — no action required.";
  if (node.kind === "workflow") {
    recommendation =
      riskLevel === "Critical" || riskLevel === "At Risk"
        ? "Diversify the providers this workflow depends on."
        : "Continue monitoring; rehearse failover quarterly.";
  } else if (redundancyStatus === "None" && suggestions.length) {
    recommendation = `Add ${suggestions[0]} as fallback provider${suggestions[1] ? `; consider ${suggestions[1]} for cross-region redundancy.` : "."}`;
  } else if (redundancyStatus === "Partial" && suggestions.length) {
    recommendation = `Extend ${suggestions[0]} coverage to remaining dependent workflows.`;
  } else if (criticality === "Very High") {
    recommendation = "Rehearse failover and define automated traffic shifting.";
  }

  return {
    node,
    dependencyCount: downstream.size,
    dependentWorkflows,
    workflowShare,
    criticalityScore,
    criticality,
    riskLevel,
    redundancyStatus,
    reasons,
    recommendation,
  };
}

// ---------- Sovereignty Score (explainable components) ----------

export interface SovereigntyComponent {
  key: string;
  label: string;
  delta: number;
  reason: string;
  positive: boolean;
}

export interface Sovereignty {
  score: number;
  risk: "Low" | "Medium" | "High";
  components: SovereigntyComponent[];
  breakdown: { provider: string; pct: number }[];
  topShare: number;
  diversity: number;
  redundancyCoverage: number;
  spofCount: number;
  cloudShare: number;
}

export function computeSovereignty(eco: Ecosystem): Sovereignty {
  const providerLoad: Record<string, number> = {};
  const workflows = eco.nodes.filter((n) => n.kind === "workflow");
  for (const wf of workflows) {
    const visited = reachableFrom(eco, wf.id);
    for (const id of visited) {
      const n = eco.nodes.find((x) => x.id === id);
      if (n?.provider) providerLoad[n.provider] = (providerLoad[n.provider] ?? 0) + 1;
    }
  }
  const total = Object.values(providerLoad).reduce((a, b) => a + b, 0) || 1;
  const breakdown = Object.entries(providerLoad)
    .map(([provider, count]) => ({ provider, pct: Math.round((count / total) * 100) }))
    .sort((a, b) => b.pct - a.pct);

  const topShare = breakdown[0]?.pct ?? 0;
  const diversity = breakdown.length;

  // SPOF: critical nodes with no redundancy
  const criticalNodes = eco.nodes.filter((n) => n.kind !== "workflow");
  let spofCount = 0;
  for (const n of criticalNodes) {
    const intel = computeNodeIntel(eco, n.id);
    if (!intel) continue;
    if (intel.redundancyStatus === "None" && intel.criticalityScore >= 40) spofCount++;
  }

  // Cloud share
  const cloudProviders = eco.nodes.filter((n) => n.kind === "cloud" && n.provider);
  const cloudCounts: Record<string, number> = {};
  for (const c of cloudProviders) cloudCounts[c.provider!] = providerLoad[c.provider!] ?? 0;
  const cloudTotal = Object.values(cloudCounts).reduce((a, b) => a + b, 0);
  const cloudShare = cloudTotal === 0 ? 0 : Math.round((Math.max(...Object.values(cloudCounts)) / cloudTotal) * 100);

  // Redundancy coverage = % of non-workflow nodes that have any sibling kind
  const redundant = criticalNodes.filter((n) => {
    const intel = computeNodeIntel(eco, n.id);
    return intel?.redundancyStatus === "Redundant" || intel?.redundancyStatus === "Partial";
  }).length;
  const redundancyCoverage = criticalNodes.length === 0 ? 0 : Math.round((redundant / criticalNodes.length) * 100);

  // Components (each contributes a signed delta from a baseline of 50)
  const vendorConcentration = -Math.round(Math.max(0, topShare - 25) * 0.9); // up to -68 if 100%
  const providerDiversity = Math.min(20, Math.round((diversity - 1) * 5));
  const redundancyBonus = Math.round((redundancyCoverage / 100) * 25);
  const cloudPenalty = -Math.round(Math.max(0, cloudShare - 60) * 0.4);
  const spofPenalty = -Math.min(20, spofCount * 6);

  const components: SovereigntyComponent[] = [
    {
      key: "vendor-concentration",
      label: "Vendor Concentration",
      delta: vendorConcentration,
      positive: false,
      reason:
        topShare > 0
          ? `Top provider ${breakdown[0]?.provider} carries ${topShare}% of workflow exposure (penalised above 25%).`
          : "No measurable vendor concentration.",
    },
    {
      key: "provider-diversity",
      label: "Provider Diversity",
      delta: providerDiversity,
      positive: true,
      reason: `${diversity} distinct providers in the ecosystem (+5 each, capped at +20).`,
    },
    {
      key: "redundancy",
      label: "Redundancy Coverage",
      delta: redundancyBonus,
      positive: true,
      reason: `${redundancyCoverage}% of critical components have an alternate provider.`,
    },
    {
      key: "cloud-dependence",
      label: "Cloud Dependence",
      delta: cloudPenalty,
      positive: false,
      reason:
        cloudShare > 60
          ? `${cloudShare}% of cloud exposure consolidated on a single hyperscaler.`
          : "Cloud exposure is balanced across providers.",
    },
    {
      key: "spof",
      label: "Single Point of Failure",
      delta: spofPenalty,
      positive: false,
      reason:
        spofCount > 0
          ? `${spofCount} critical component${spofCount === 1 ? "" : "s"} without redundancy.`
          : "No critical single points of failure detected.",
    },
  ];

  const score = Math.max(
    5,
    Math.min(100, 50 + components.reduce((acc, c) => acc + c.delta, 0)),
  );
  const rounded = Math.round(score);
  const risk: "Low" | "Medium" | "High" = rounded >= 70 ? "Low" : rounded >= 45 ? "Medium" : "High";

  return {
    score: rounded,
    risk,
    components,
    breakdown,
    topShare,
    diversity,
    redundancyCoverage,
    spofCount,
    cloudShare,
  };
}

// ---------- Resilience Actions (deterministic simulation) ----------

export interface ResilienceAction {
  id: string;
  title: string;
  detail: string;
  difficulty: "Easy" | "Medium" | "High";
  impact: "Low" | "Medium" | "High";
  scoreIncrease: number;
  rationale: string;
  apply: (eco: Ecosystem) => Ecosystem;
}

function addNode(eco: Ecosystem, node: DepNode, edges: DepEdge[]): Ecosystem {
  const nodes = eco.nodes.find((n) => n.id === node.id) ? eco.nodes : [...eco.nodes, node];
  const existingEdgeIds = new Set(eco.edges.map((e) => e.id));
  const merged = [...eco.edges, ...edges.filter((e) => !existingEdgeIds.has(e.id))];
  return { nodes, edges: merged };
}

export const resilienceActions: ResilienceAction[] = [
  {
    id: "add-gemini-backup",
    title: "Add Gemini as backup model",
    detail: "Route OpenAI-dependent workflows through Gemini as failover.",
    difficulty: "Easy",
    impact: "High",
    scoreIncrease: 22,
    rationale: "Halves single-vendor concentration on the most-used AI provider.",
    apply: (eco) => {
      let next = addNode(
        eco,
        { id: "ai-gemini", label: "Google Gemini", kind: "ai", provider: "Gemini" },
        [],
      );
      const openaiConsumers = eco.edges.filter((e) => e.target === "ai-openai");
      const newEdges = openaiConsumers
        .filter((e) => !eco.edges.find((x) => x.source === e.source && x.target === "ai-gemini"))
        .map((e) => ({ id: `r-gemini-${e.source}`, source: e.source, target: "ai-gemini" }));
      next = { ...next, edges: [...next.edges, ...newEdges] };
      return next;
    },
  },
  {
    id: "deploy-local-llm",
    title: "Deploy local LLM",
    detail: "Self-hosted model for critical workflows; reduces vendor dependency.",
    difficulty: "High",
    impact: "High",
    scoreIncrease: 15,
    rationale: "Removes external dependency for the two highest-criticality workflows.",
    apply: (eco) => {
      let next = addNode(
        eco,
        { id: "ai-local", label: "Local Llama-3", kind: "ai", provider: "Local" },
        [],
      );
      const critical = ["wf-support", "wf-recs"];
      const newEdges = critical
        .filter((wfId) => eco.nodes.find((n) => n.id === wfId))
        .map((wfId) => ({ id: `r-local-${wfId}`, source: wfId, target: "ai-local" }));
      next = { ...next, edges: [...next.edges, ...newEdges] };
      return next;
    },
  },
  {
    id: "regional-cloud-redundancy",
    title: "Regional cloud redundancy",
    detail: "Add GCP as secondary cloud; replicate state across two regions.",
    difficulty: "Medium",
    impact: "High",
    scoreIncrease: 18,
    rationale: "Eliminates the AWS single-cloud SPOF for stateful services.",
    apply: (eco) => {
      let next = addNode(
        eco,
        { id: "cloud-gcp", label: "GCP", kind: "cloud", provider: "GCP" },
        [],
      );
      const awsConsumers = eco.edges.filter((e) => e.target === "cloud-aws");
      const newEdges = awsConsumers
        .filter((e) => !eco.edges.find((x) => x.source === e.source && x.target === "cloud-gcp"))
        .map((e) => ({ id: `r-gcp-${e.source}`, source: e.source, target: "cloud-gcp" }));
      next = { ...next, edges: [...next.edges, ...newEdges] };
      return next;
    },
  },
  {
    id: "multi-region-db",
    title: "Multi-region database replication",
    detail: "Postgres replicas across regions; failover under 90s.",
    difficulty: "Medium",
    apply: (eco) => {
      return addNode(
        eco,
        { id: "db-postgres-replica", label: "Postgres Replica", kind: "database", provider: "Postgres-Replica" },
        [
          { id: "r-replica-1", source: "api-vector", target: "db-postgres-replica" },
        ],
      );
    },
  },
];

export function projectAction(eco: Ecosystem, actionId: string) {
  const action = resilienceActions.find((a) => a.id === actionId);
  if (!action) return null;
  const next = action.apply(eco);
  return { action, ecosystem: next, sovereignty: computeSovereignty(next) };
}

// ---------- Reporting ----------

export function generateReport(eco: Ecosystem, sov: Sovereignty, shock: Shock | null) {
  const date = new Date().toISOString();
  const wfCount = eco.nodes.filter((n) => n.kind === "workflow").length;
  const providers = new Set(eco.nodes.filter((n) => n.provider).map((n) => n.provider!)).size;
  const top = sov.breakdown[0];
  const md = `# Arclight Intelligence Briefing
Generated: ${date}

## Posture
- Sovereignty Index: **${sov.score} / 100** (${sov.risk})
- Workflows under monitoring: ${wfCount}
- Distinct providers: ${providers}
- Top concentration: ${top?.provider ?? "n/a"} @ ${top?.pct ?? 0}%
- Redundancy coverage: ${sov.redundancyCoverage}%
- Active simulation: ${shock ? shock.label + " (" + shock.severity + ")" : "none"}

## Score Composition
${sov.components.map((c) => `- ${c.label}: ${c.delta >= 0 ? "+" : ""}${c.delta} — ${c.reason}`).join("\n")}

## Provider Breakdown
${sov.breakdown.map((b) => `- ${b.provider}: ${b.pct}%`).join("\n")}
`;
  return md;
}

export function relTime(ts: number) {
  const diff = Math.max(0, Date.now() - ts);
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
