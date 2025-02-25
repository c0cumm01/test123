import { Context, Next } from "hono";
import { createMiddleware } from "hono/factory";

export const authenticated = createMiddleware((c: Context, next: Next) => {
  return next();
});
