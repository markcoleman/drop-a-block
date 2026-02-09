import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "json-summary"],
      include: ["src/engine/**/*.ts", "src/game/**/*.ts", "src/utils/**/*.ts"],
      exclude: ["**/__tests__/**", "src/game/useGame.ts", "src/utils/sound.ts"]
    }
  }
});
