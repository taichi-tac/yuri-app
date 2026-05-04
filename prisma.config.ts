import { defineConfig } from "prisma/config";
import path from "path";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";

const tursoUrl = process.env.TURSO_DATABASE_URL;
const tursoToken = process.env.TURSO_AUTH_TOKEN;

function makeAdapter() {
  if (tursoUrl) {
    const client = createClient({ url: tursoUrl, authToken: tursoToken });
    return new PrismaLibSql(client);
  }
  const client = createClient({ url: `file:${path.join(__dirname, "prisma/dev.db")}` });
  return new PrismaLibSql(client);
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  adapter: makeAdapter(),
});
