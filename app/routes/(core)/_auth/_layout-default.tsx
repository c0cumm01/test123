import { createFileRoute, Outlet } from "@tanstack/react-router";

import { DefaultSidebar } from "@/components/sidebars/default-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export const Route = createFileRoute("/(core)/_auth/_layout-default")({
  component: MainLayout,
});

export default function MainLayout() {
  return (
    <SidebarProvider>
      <DefaultSidebar />
      <SidebarInset>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
