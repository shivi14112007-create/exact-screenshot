import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useArclight } from "@/lib/arclight-store";
import { computeSovereignty } from "@/lib/arclight";

export const Route = createFileRoute("/_app/analytics")({
  component: AnalyticsPage,
});

const trend = Array.from({ length: 14 }).map((_, i) => ({
  day: `D${i + 1}`,
  sovereignty: 60 + Math.round(Math.sin(i / 2) * 10) + (i > 8 ? 6 : 0),
  shocks: i % 4 === 0 ? 1 : 0,
}));

const usage = Array.from({ length: 24 }).map((_, i) => ({
  hour: `${i.toString().padStart(2, "0")}h`,
  openai: 40 + Math.round(Math.cos(i / 3) * 18 + i),
  claude: 12 + Math.round(Math.sin(i / 4) * 8 + i / 2),
  gemini: 8 + Math.round(Math.cos(i / 5) * 5 + i / 3),
}));

function AnalyticsPage() {
  const ecosystem = useArclight((s) => s.ecosystem);
  const sov = useMemo(() => computeSovereignty(ecosystem), [ecosystem]);

  return (
    <div className="p-4 md:p-6 max-w-[1500px] mx-auto space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Analytics & Trends</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Concentration, capacity, and sovereignty trends across your AI dependency surface.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Sovereignty Index — 14d trend">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trend}>
              <defs>
                <linearGradient id="sov" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.82 0.15 200)" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="oklch(0.82 0.15 200)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="oklch(0.30 0.03 260 / 0.4)" vertical={false} />
              <XAxis dataKey="day" stroke="oklch(0.6 0.02 260)" fontSize={11} />
              <YAxis stroke="oklch(0.6 0.02 260)" fontSize={11} domain={[40, 100]} />
              <Tooltip
                contentStyle={{
                  background: "oklch(0.20 0.025 260)",
                  border: "1px solid oklch(0.30 0.03 260)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey="sovereignty"
                stroke="oklch(0.82 0.15 200)"
                strokeWidth={2}
                fill="url(#sov)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="AI provider hourly usage (calls / min)">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={usage}>
              <CartesianGrid stroke="oklch(0.30 0.03 260 / 0.4)" vertical={false} />
              <XAxis dataKey="hour" stroke="oklch(0.6 0.02 260)" fontSize={10} interval={3} />
              <YAxis stroke="oklch(0.6 0.02 260)" fontSize={11} />
              <Tooltip
                contentStyle={{
                  background: "oklch(0.20 0.025 260)",
                  border: "1px solid oklch(0.30 0.03 260)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Line type="monotone" dataKey="openai" stroke="oklch(0.68 0.20 295)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="claude" stroke="oklch(0.82 0.15 200)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="gemini" stroke="oklch(0.72 0.22 340)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="Provider concentration (current)">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={sov.breakdown}>
            <CartesianGrid stroke="oklch(0.30 0.03 260 / 0.4)" vertical={false} />
            <XAxis dataKey="provider" stroke="oklch(0.6 0.02 260)" fontSize={11} />
            <YAxis stroke="oklch(0.6 0.02 260)" fontSize={11} />
            <Tooltip
              contentStyle={{
                background: "oklch(0.20 0.025 260)",
                border: "1px solid oklch(0.30 0.03 260)",
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <Bar dataKey="pct" fill="oklch(0.72 0.18 230)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="panel p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium">{title}</h3>
        <span className="text-[10px] font-mono tracking-widest text-muted-foreground">LIVE</span>
      </div>
      {children}
    </div>
  );
}
