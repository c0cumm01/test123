import { createFileRoute, redirect } from "@tanstack/react-router";

import { $signOut } from "@/server/functions/core/auth";

export const Route = createFileRoute("/(core)/logout")({
  component: RouteComponent,
  beforeLoad: async ({ location }) => {
    await $signOut();
    throw redirect({ to: "/login" });
  },
});

function RouteComponent() {
  return <div>Hello "/logout"!</div>;
}
