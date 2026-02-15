import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.ts",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "json-summary"],
      include: [
        "src/engine/**/*.ts",
        "src/game/**/*.ts",
        "src/utils/**/*.ts",
        "src/components/**/*.tsx"
      ],
      exclude: [
        "**/__tests__/**",
        "src/components/GameCanvas.tsx",
        "src/engine/engine.ts",
        "src/engine/index.ts",
        "src/engine/types.ts",
        "src/game/useGame.ts",
        "src/utils/sound.ts"
      ]
    }
  }
});
