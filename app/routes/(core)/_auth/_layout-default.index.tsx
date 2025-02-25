import { createFileRoute } from "@tanstack/react-router";
import { zodSearchValidator } from "@tanstack/router-zod-adapter";
import { z } from "zod";

import { acceptInvitation } from "@/lib/invitation";

export const Route = createFileRoute("/(core)/_auth/_layout-default/")({
  component: HomePageComponent,
  validateSearch: zodSearchValidator(
    z.object({
      invitation: z.string().optional(),
    }),
  ),
  loaderDeps: ({ search: { invitation } }) => ({
    invitation,
  }),

  loader: async (opts) => {
    if (opts.deps.invitation) {
      await acceptInvitation(opts.deps.invitation);
    }
  },
});

function HomePageComponent() {
  return <div className="flex flex-col gap-4 p-4">Home</div>;
}
