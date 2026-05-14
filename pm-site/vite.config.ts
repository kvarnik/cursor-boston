import { defineConfig } from "vite";

/** GitHub project Pages: https://<user>.github.io/<repo>/ */
const base = process.env.VITE_BASE ?? "/";

export default defineConfig({
  base,
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
