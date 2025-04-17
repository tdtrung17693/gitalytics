import react from "@vitejs/plugin-react";
import { getViteConfig } from "astro/config";

export default getViteConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    reporters: ["dot"],
  },
});
