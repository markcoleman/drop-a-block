import { beforeEach, describe, expect, it } from "vitest";
import {
  loadScores,
  loadSettings,
  resetScores,
  saveScore,
  saveSettings
} from "../storage";

type MockStorage = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
  clear: () => void;
};

const createMockStorage = (): MockStorage => {
  const store = new Map<string, string>();
  return {
    getItem: (key) => (store.has(key) ? store.get(key)! : null),
    setItem: (key, value) => {
      store.set(key, value);
    },
    removeItem: (key) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    }
  };
};

const mockStorage = createMockStorage();
Object.defineProperty(globalThis, "localStorage", {
  value: mockStorage,
  configurable: true
});

beforeEach(() => {
  mockStorage.clear();
});

describe("storage", () => {
  it("loads default settings when storage is empty", () => {
    const settings = loadSettings();
    expect(settings).toEqual({
      theme: "dark",
      sound: true,
      das: 150,
      arr: 50
    });
  });

  it("merges settings with defaults", () => {
    mockStorage.setItem("dropablock:settings", JSON.stringify({ sound: false }));
    const settings = loadSettings();
    expect(settings.sound).toBe(false);
    expect(settings.theme).toBe("dark");
    expect(settings.das).toBe(150);
    expect(settings.arr).toBe(50);
  });

  it("falls back to defaults on invalid settings JSON", () => {
    mockStorage.setItem("dropablock:settings", "{invalid");
    const settings = loadSettings();
    expect(settings.theme).toBe("dark");
    expect(settings.sound).toBe(true);
  });

  it("persists settings", () => {
    saveSettings({ theme: "light", sound: false, das: 120, arr: 40 });
    const settings = loadSettings();
    expect(settings).toEqual({
      theme: "light",
      sound: false,
      das: 120,
      arr: 40
    });
  });

  it("saves scores sorted and capped at 10", () => {
    for (let i = 0; i < 11; i += 1) {
      saveScore({
        name: `P${i}`,
        score: i * 100,
        lines: i,
        level: 1,
        date: `2024-01-0${i + 1}`
      });
    }
    const scores = loadScores();
    expect(scores).toHaveLength(10);
    expect(scores[0].score).toBe(1000);
    expect(scores[9].score).toBe(100);
  });

  it("returns empty scores on invalid JSON and resets", () => {
    mockStorage.setItem("dropablock:scores", "not-json");
    expect(loadScores()).toEqual([]);
    saveScore({ name: "AAA", score: 500, lines: 5, level: 1, date: "2024-01-01" });
    resetScores();
    expect(loadScores()).toEqual([]);
  });
});
