import { createFileRoute, redirect } from "@tanstack/react-router";

import { $getSessionAndUser } from "@/server/functions/core/auth";

export const Route = createFileRoute("/(core)/accept-invitation/$invitation")({
  loader: async ({ params }) => {
    const data = await $getSessionAndUser();
    if (data.session) {
      throw redirect({
        to: "/",
        search: { invitation: params.invitation },
      });
    } else {
      throw redirect({
        to: "/login",
        search: { invitation: params.invitation },
      });
    }
  },
});
