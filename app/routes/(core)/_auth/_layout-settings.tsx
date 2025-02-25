import { createFileRoute, Outlet } from "@tanstack/react-router";

import { SetingsSidebar } from "@/components/sidebars/settings-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export const Route = createFileRoute("/(core)/_auth/_layout-settings")({
  component: SettingsLayout,
});

export default function SettingsLayout() {
  return (
    <SidebarProvider>
      <SetingsSidebar />
      <SidebarInset>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
