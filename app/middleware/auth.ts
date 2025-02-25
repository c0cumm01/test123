import { createMiddleware } from "@tanstack/start";

import { $getSessionAndUser } from "@/server/functions/core/auth";

export const authMiddleware = createMiddleware().server(async ({ next }) => {
  const { session, user, organization } = await $getSessionAndUser();
  if (!session || !user) {
    throw new Error("Unauthorized");
  } else {
    return next({
      context: {
        userName: user.name,
        userId: user.id,
        orgId: organization?.id ?? null,
      },
    });
  }
});
