import { createAPIFileRoute } from "@tanstack/start/api";

import { auth } from "@/lib/auth";

export const APIRoute = createAPIFileRoute("/api/(core)/auth/$")({
  GET: ({ request }) => {
    return auth.handler(request);
  },
  POST: ({ request }) => {
    return auth.handler(request);
  },
});
