import { createFileRoute, redirect } from "@tanstack/react-router";

import { $getSessionAndUser } from "@/server/functions/core/auth";

export const Route = createFileRoute("/(core)/_admin")({
  beforeLoad: async ({ location }) => {
    const data = await $getSessionAndUser();
    if (!data.user || data.user.role !== "admin") {
      throw redirect({ to: "/" });
    }
  },
});
