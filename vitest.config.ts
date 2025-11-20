import { resolve } from "node:path";
import dotenv from "dotenv";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    env: dotenv.config({ path: ".env.development" }).parsed,
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
