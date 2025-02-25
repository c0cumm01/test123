import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/(core)/_auth")({
  beforeLoad: async ({ location, context }) => {
    if (!context.user) {
      return redirect({ to: "/login" });
    }
    return context;
  },
});
