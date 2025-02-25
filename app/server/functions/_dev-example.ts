import { createServerFn } from "@tanstack/start";

import { authMiddleware } from "@/middleware/auth";

export const $devExample = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    return {
      message: "Hello, world!",
      userId: context.userId,
    };
  });
