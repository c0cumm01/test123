import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./app/server/db/schema.ts",
  dialect: "sqlite",
  out: "./app/server/db/migrations",
  dbCredentials: {
    url: "./sqlite.db",
  },
  verbose: true,
  strict: true,
});
