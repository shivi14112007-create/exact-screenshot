import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

export function KPICard({
  label,
  value,
  sub,
  icon: Icon,
  tone = "default",
  trend,
  delay = 0,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon?: LucideIcon;
  tone?: "default" | "danger" | "warning" | "success" | "info";
  trend?: number[];
  delay?: number;
}) {
  const color =
    tone === "danger"
      ? "var(--danger)"
      : tone === "warning"
        ? "var(--warning)"
        : tone === "success"
          ? "var(--success)"
          : tone === "info"
            ? "var(--neon-purple)"
            : "var(--primary)";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -3, transition: { duration: 0.15 } }}
      className="panel p-4 relative overflow-hidden group"
      style={{
        boxShadow: `0 12px 32px -18px color-mix(in oklab, ${color} 60%, transparent)`,
      }}
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
        style={{
          background: `radial-gradient(circle at 80% 0%, color-mix(in oklab, ${color} 18%, transparent), transparent 60%)`,
        }}
      />
      <div className="flex items-center justify-between relative">
        <div className="text-[10px] tracking-[0.18em] text-muted-foreground font-mono">
          {label.toUpperCase()}
        </div>
        {Icon && (
          <div
            className="w-7 h-7 rounded-md grid place-items-center"
            style={{
              color,
              background: `color-mix(in oklab, ${color} 14%, transparent)`,
              boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${color} 30%, transparent)`,
            }}
          >
            <Icon size={14} />
          </div>
        )}
      </div>
      <div className="flex items-baseline gap-2 mt-2 relative">
        <span className="text-2xl font-semibold tabular-nums" style={{ color }}>
          {value}
        </span>
        {sub && <span className="text-[11px] text-muted-foreground">{sub}</span>}
      </div>
      {trend && trend.length > 1 && (
        <Sparkline values={trend} color={color} />
      )}
    </motion.div>
  );
}

function Sparkline({ values, color }: { values: number[]; color: string }) {
  const w = 100;
  const h = 28;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pts = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-7 mt-2 relative" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`spark-${color}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" />
      <polygon points={`0,${h} ${pts} ${w},${h}`} fill={`url(#spark-${color})`} />
    </svg>
  );
}
