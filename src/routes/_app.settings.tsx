import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { useArclight } from "@/lib/arclight-store";
import { relTime } from "@/lib/arclight";
import { Bell, Download, Key, Shield, Trash2, Webhook, FileText, Lock } from "lucide-react";

export const Route = createFileRoute("/_app/settings")({
  component: SettingsPage,
});

function downloadFile(filename: string, content: string, mime = "text/markdown") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function SettingsPage() {
  const workspace = useArclight((s) => s.workspace);
  const setWorkspace = useArclight((s) => s.setWorkspace);
  const alertRules = useArclight((s) => s.alertRules);
  const toggleAlertRule = useArclight((s) => s.toggleAlertRule);
  const cycleAlertScope = useArclight((s) => s.cycleAlertScope);
  const controls = useArclight((s) => s.controls);
  const toggleControl = useArclight((s) => s.toggleControl);
  const reports = useArclight((s) => s.reports);
  const removeReport = useArclight((s) => s.removeReport);
  const loadDemoData = useArclight((s) => s.loadDemoData);

  return (
    <div className="p-4 md:p-6 max-w-[1000px] mx-auto space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Workspace Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Configure provider connections, alert policies, compliance controls, and exports.
        </p>
      </div>

      <div className="panel p-5">
        <div className="flex items-center gap-2 mb-3">
          <Shield size={15} className="text-[color:var(--cyan)]" />
          <h3 className="text-sm font-medium">Workspace</h3>
        </div>
        <label className="block">
          <span className="text-[10px] tracking-[0.18em] font-mono text-muted-foreground">WORKSPACE NAME</span>
          <input
            value={workspace}
            onChange={(e) => setWorkspace(e.target.value)}
            className="mt-1 w-full bg-[oklch(0.18_0.025_260)] border border-[color:var(--panel-border)] rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-[color:var(--cyan)]"
          />
        </label>
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => { loadDemoData(); toast.success("Demo dataset loaded"); }}
            className="text-xs px-3 py-2 rounded-md border border-[color:var(--panel-border)] hover:border-[color:var(--cyan)]"
          >
            Load demo dataset
          </button>
        </div>
      </div>

      <div className="panel p-5">
        <div className="flex items-center gap-2 mb-3">
          <Key size={15} className="text-[color:var(--neon-purple)]" />
          <h3 className="text-sm font-medium">Provider API Connections</h3>
        </div>
        <div className="space-y-2">
          {[
            { name: "OpenAI", status: "Connected", tone: "success" },
            { name: "Anthropic Claude", status: "Connected", tone: "success" },
            { name: "Google Gemini", status: "Read-only", tone: "warning" },
            { name: "AWS CloudWatch", status: "Connected", tone: "success" },
            { name: "Azure Monitor", status: "Not configured", tone: "danger" },
          ].map((p) => {
            const c = p.tone === "success" ? "var(--success)" : p.tone === "warning" ? "var(--warning)" : "var(--danger)";
            return (
              <div key={p.name} className="flex items-center justify-between px-3 py-2.5 rounded-md border border-[color:var(--panel-border)]">
                <span className="text-sm">{p.name}</span>
                <div className="flex items-center gap-2">
                  <span
                    className="text-[10px] font-mono tracking-widest px-2 py-0.5 rounded-md border"
                    style={{ color: c, borderColor: c, background: `color-mix(in oklab, ${c} 12%, transparent)` }}
                  >
                    {p.status.toUpperCase()}
                  </span>
                  <button
                    onClick={() => toast(`${p.status === "Connected" ? "Rotated" : "Connection wizard"} — ${p.name}`)}
                    className="text-[10px] font-mono text-muted-foreground hover:text-foreground"
                  >
                    {p.status === "Connected" ? "ROTATE" : "CONNECT"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="panel p-5">
        <div className="flex items-center gap-2 mb-3">
          <Bell size={15} className="text-[color:var(--neon-pink)]" />
          <h3 className="text-sm font-medium">Alert Routing</h3>
          <span className="ml-auto text-[10px] font-mono text-muted-foreground tracking-widest">
            CLICK SCOPE TO CYCLE
          </span>
        </div>
        <div className="space-y-2">
          {alertRules.map((r) => (
            <div key={r.id} className="flex items-center gap-2 px-3 py-2.5 rounded-md border border-[color:var(--panel-border)]">
              <Webhook size={13} className="text-muted-foreground" />
              <span className="text-sm flex-1">{r.channel}</span>
              <button
                onClick={() => cycleAlertScope(r.id)}
                className="text-[10px] font-mono text-muted-foreground hover:text-[color:var(--cyan)] px-2 py-0.5 rounded border border-[color:var(--panel-border)]"
              >
                {r.scope.toUpperCase()}
              </button>
              <button
                onClick={() => toggleAlertRule(r.id)}
                className={`relative w-9 h-5 rounded-full transition ${r.enabled ? "bg-[color:var(--cyan)]/60" : "bg-[oklch(0.28_0.03_260)]"}`}
                aria-label="Toggle rule"
              >
                <span
                  className="absolute top-0.5 w-4 h-4 rounded-full bg-foreground transition-all"
                  style={{ left: r.enabled ? "18px" : "2px" }}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="panel p-5">
        <div className="flex items-center gap-2 mb-3">
          <Lock size={15} className="text-[color:var(--success)]" />
          <h3 className="text-sm font-medium">Compliance Controls</h3>
        </div>
        <div className="space-y-2">
          {controls.map((c) => (
            <div key={c.id} className="flex items-start gap-3 px-3 py-2.5 rounded-md border border-[color:var(--panel-border)]">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">{c.label}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{c.detail}</div>
              </div>
              <button
                onClick={() => toggleControl(c.id)}
                className={`relative w-9 h-5 rounded-full transition shrink-0 mt-1 ${c.enabled ? "bg-[color:var(--success)]/60" : "bg-[oklch(0.28_0.03_260)]"}`}
                aria-label="Toggle control"
              >
                <span
                  className="absolute top-0.5 w-4 h-4 rounded-full bg-foreground transition-all"
                  style={{ left: c.enabled ? "18px" : "2px" }}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="panel p-5">
        <div className="flex items-center gap-2 mb-3">
          <FileText size={15} className="text-[color:var(--cyan)]" />
          <h3 className="text-sm font-medium">Report History</h3>
        </div>
        {reports.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">No reports yet. Generate one in Intelligence Reports.</p>
        ) : (
          <div className="space-y-2">
            {reports.map((r) => (
              <div key={r.id} className="flex items-center gap-2 px-3 py-2.5 rounded-md border border-[color:var(--panel-border)]">
                <FileText size={13} className="text-[color:var(--cyan)]" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{r.title}</div>
                  <div className="text-[10px] font-mono text-muted-foreground">
                    {relTime(r.ts)} · score {r.score} · {r.risk}
                  </div>
                </div>
                <button
                  onClick={() => downloadFile(`arclight-${r.id}.md`, r.markdown)}
                  className="text-muted-foreground hover:text-[color:var(--cyan)]"
                  aria-label="Download"
                >
                  <Download size={13} />
                </button>
                <button
                  onClick={() => removeReport(r.id)}
                  className="text-muted-foreground hover:text-[color:var(--danger)]"
                  aria-label="Delete"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
