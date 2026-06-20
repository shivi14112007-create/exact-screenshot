import { useEffect, useRef, useState } from "react";
import { Bell, Check, Trash2 } from "lucide-react";
import { useArclight } from "@/lib/arclight-store";
import { relTime } from "@/lib/arclight";

const toneColor: Record<string, string> = {
  default: "var(--cyan)",
  info: "var(--cyan)",
  success: "var(--success)",
  warning: "var(--warning)",
  danger: "var(--danger)",
};

export function NotificationsPopover() {
  const [open, setOpen] = useState(false);
  const signals = useArclight((s) => s.signals);
  const markAllRead = useArclight((s) => s.markAllRead);
  const clearSignals = useArclight((s) => s.clearSignals);
  const ref = useRef<HTMLDivElement>(null);
  const unread = signals.filter((s) => !s.read).length;

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => { setOpen((o) => !o); if (!open) markAllRead(); }}
        className="relative p-2 rounded-md hover:bg-[oklch(0.24_0.03_265)]/60 text-muted-foreground hover:text-foreground"
        aria-label="Notifications"
      >
        <Bell size={15} />
        {unread > 0 && (
          <span className="absolute top-1 right-1 min-w-[14px] h-[14px] px-1 rounded-full text-[9px] font-mono grid place-items-center bg-[color:var(--neon-pink)] text-background">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[340px] rounded-lg border border-[color:var(--panel-border)] bg-[oklch(0.18_0.025_260)] shadow-2xl z-50 overflow-hidden">
          <div className="flex items-center px-3 py-2 border-b border-[color:var(--panel-border)]">
            <span className="text-xs font-medium">Alert Center</span>
            <span className="ml-2 text-[10px] font-mono text-muted-foreground">{signals.length} EVENTS</span>
            <div className="ml-auto flex items-center gap-1">
              <button onClick={markAllRead} className="text-[10px] font-mono text-muted-foreground hover:text-foreground inline-flex items-center gap-1 px-1.5 py-0.5 rounded">
                <Check size={11} /> READ
              </button>
              <button onClick={clearSignals} className="text-[10px] font-mono text-muted-foreground hover:text-[color:var(--danger)] inline-flex items-center gap-1 px-1.5 py-0.5 rounded">
                <Trash2 size={11} /> CLEAR
              </button>
            </div>
          </div>
          <div className="max-h-[360px] overflow-auto">
            {signals.length === 0 && (
              <div className="px-3 py-6 text-xs text-muted-foreground text-center">No signals yet.</div>
            )}
            {signals.map((s) => (
              <div key={s.id} className="flex items-start gap-2.5 px-3 py-2.5 border-b border-[color:var(--panel-border)]/50 last:border-0">
                <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: toneColor[s.tone] }} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs leading-snug">{s.text}</div>
                  <div className="text-[10px] font-mono text-muted-foreground mt-0.5">{relTime(s.ts)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
