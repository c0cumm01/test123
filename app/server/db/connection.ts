import { createClient as createLibsqlClient } from "@libsql/client/sqlite3";
import * as libsql from "drizzle-orm/libsql";

import * as schema from "@/server/db/schema";

const client = createLibsqlClient({
    url: "file:./sqlite.db",
});
const db: libsql.LibSQLDatabase<typeof schema> = libsql.drizzle(client, {
    schema,
});

export { db };
