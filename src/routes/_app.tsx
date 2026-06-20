import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { AppSidebar } from "@/components/app-sidebar";
import { AppHeader } from "@/components/app-header";
import { CommandPalette } from "@/components/command-palette";
import { useApplyTheme } from "@/components/theme-switcher";
import { useArclight } from "@/lib/arclight-store";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const authed = useArclight((s) => s.authed);
  useApplyTheme();
  if (typeof window !== "undefined" && !authed) {
    throw redirect({ to: "/" });
  }
  return (
    <div className="min-h-screen flex w-full">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AppHeader />
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
      <CommandPalette />
      <Toaster
        theme="dark"
        position="bottom-right"
        toastOptions={{
          style: {
            background: "oklch(0.18 0.025 260)",
            border: "1px solid oklch(0.30 0.03 260)",
            color: "oklch(0.95 0.01 260)",
            fontSize: "12px",
          },
        }}
      />
    </div>
  );
}
