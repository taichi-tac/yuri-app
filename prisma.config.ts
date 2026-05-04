import { defineConfig } from "prisma/config";
import path from "path";

const tursoUrl = process.env.TURSO_DATABASE_URL;
const tursoToken = process.env.TURSO_AUTH_TOKEN;

// For Turso, embed auth token in URL as query param for Prisma config
function getDatasourceUrl() {
  if (tursoUrl) {
    const url = new URL(tursoUrl);
    if (tursoToken) url.searchParams.set("authToken", tursoToken);
    return url.toString();
  }
  return `file:${path.join(__dirname, "prisma/dev.db")}`;
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: getDatasourceUrl(),
  },
});
