import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Logo } from "@/components/arclight-app";
import { useArclight } from "@/lib/arclight-store";
import { ArrowRight, Lock, Mail } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Arclight — AI Dependency Intelligence" },
      {
        name: "description",
        content:
          "Enterprise platform to map, score, and stress-test AI and cloud dependencies in real-time.",
      },
    ],
  }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const setAuthed = useArclight((s) => s.setAuthed);
  const [email, setEmail] = useState("operator@arclight.io");
  const [pw, setPw] = useState("••••••••");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthed(true);
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left: brand panel */}
      <div className="relative hidden lg:flex flex-col justify-between p-10 border-r border-[color:var(--panel-border)] overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-70"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 30% 20%, oklch(0.30 0.12 230 / 0.5), transparent 60%), radial-gradient(ellipse 50% 50% at 80% 80%, oklch(0.28 0.18 295 / 0.4), transparent 60%)",
          }}
        />
        <Logo />
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-[10px] tracking-[0.3em] text-muted-foreground font-mono">
            AI DEPENDENCY INTELLIGENCE
          </div>
          <h1 className="mt-3 text-5xl font-semibold leading-[1.05] tracking-tight">
            See every <span className="neon-text">dependency</span>.
            <br />
            Survive every shock.
          </h1>
          <p className="mt-5 text-muted-foreground max-w-md">
            Arclight maps your AI, cloud, and data infrastructure as a live graph — then
            simulates outages, scores sovereignty, and prescribes resilience playbooks.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-3 max-w-md">
            {[
              { k: "Workflows", v: "1,284" },
              { k: "Providers", v: "47" },
              { k: "Avg sovereignty", v: "72" },
            ].map((s) => (
              <div key={s.k} className="panel p-3">
                <div className="text-[10px] tracking-[0.16em] font-mono text-muted-foreground">
                  {s.k.toUpperCase()}
                </div>
                <div className="text-lg font-semibold neon-text">{s.v}</div>
              </div>
            ))}
          </div>
        </motion.div>
        <div className="text-[11px] font-mono text-muted-foreground">
          © Arclight Systems · ISO 27001 · SOC 2 Type II
        </div>
      </div>

      {/* Right: form */}
      <div className="grid place-items-center p-6">
        <motion.form
          onSubmit={submit}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm panel p-7"
        >
          <div className="lg:hidden mb-6">
            <Logo />
          </div>
          <div className="text-[10px] tracking-[0.24em] text-muted-foreground font-mono">
            SECURE WORKSPACE ACCESS
          </div>
          <h2 className="text-2xl font-semibold mt-1">Sign in to Arclight</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Continue to the <span className="text-foreground">production-ecosystem</span> workspace.
          </p>

          <div className="mt-6 space-y-3">
            <label className="block">
              <span className="text-[10px] tracking-[0.18em] font-mono text-muted-foreground">
                EMAIL
              </span>
              <div className="mt-1 flex items-center gap-2 px-3 py-2.5 rounded-md border border-[color:var(--panel-border)] bg-[oklch(0.18_0.025_260)] focus-within:border-[color:var(--cyan)]">
                <Mail size={14} className="text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-transparent text-sm focus:outline-none"
                />
              </div>
            </label>
            <label className="block">
              <span className="text-[10px] tracking-[0.18em] font-mono text-muted-foreground">
                PASSWORD
              </span>
              <div className="mt-1 flex items-center gap-2 px-3 py-2.5 rounded-md border border-[color:var(--panel-border)] bg-[oklch(0.18_0.025_260)] focus-within:border-[color:var(--cyan)]">
                <Lock size={14} className="text-muted-foreground" />
                <input
                  type="password"
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  className="flex-1 bg-transparent text-sm focus:outline-none"
                />
              </div>
            </label>
          </div>

          <button
            type="submit"
            className="mt-6 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md font-medium text-[color:var(--primary-foreground)] glow-ring transition hover:brightness-110"
            style={{ background: "linear-gradient(90deg, var(--cyan), var(--neon-purple))" }}
          >
            Enter intelligence console <ArrowRight size={15} />
          </button>

          <div className="mt-4 text-[11px] text-muted-foreground text-center font-mono tracking-wider">
            DEMO MODE · SSO / SAML AVAILABLE
          </div>
        </motion.form>
      </div>
    </div>
  );
}
