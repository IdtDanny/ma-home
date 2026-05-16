// prisma.config.ts
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(__dirname, ".env.local") });
config();

import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",   // 👈 ADD THIS LINE
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});