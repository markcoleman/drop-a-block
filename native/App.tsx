import { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, SafeAreaView, StyleSheet, Text, useWindowDimensions, View } from "react-native";

import {
  BOARD_HEIGHT,
  BOARD_WIDTH,
  COLORS,
  GameState,
  getBlocks,
  getGhost,
  HIDDEN_ROWS,
  resetGame,
  TETROMINO_ORDER,
  tick,
  VISIBLE_ROWS
} from "../src/engine";
import { applyAction, canApplyAction } from "../src/game/actions";

type CellTone = {
  backgroundColor: string;
  borderColor: string;
  opacity?: number;
};

const EMPTY_CELL: CellTone = {
  backgroundColor: "#111827",
  borderColor: "#1f2937"
};

const buildBoard = (state: GameState): CellTone[][] => {
  const rows = state.board.map((row) =>
    row.map((value) => {
      if (value <= 0) return EMPTY_CELL;
      const type = TETROMINO_ORDER[value - 1];
      return {
        backgroundColor: (type ? COLORS[type] : undefined) ?? "#60a5fa",
        borderColor: "#0b1020"
      };
    })
  );

  if (!state.modifiers.noGhost && state.status === "running" && state.mode === "tetris") {
    const ghost = getGhost(state);
    for (const block of getBlocks(ghost)) {
      if (block.y < 0 || block.y >= BOARD_HEIGHT || block.x < 0 || block.x >= BOARD_WIDTH) continue;
      if (rows[block.y]?.[block.x]?.backgroundColor === EMPTY_CELL.backgroundColor) {
        rows[block.y][block.x] = {
          backgroundColor: "#94a3b8",
          borderColor: "#334155",
          opacity: 0.35
        };
      }
    }
  }

  for (const block of getBlocks(state.active)) {
    if (block.y < 0 || block.y >= BOARD_HEIGHT || block.x < 0 || block.x >= BOARD_WIDTH) continue;
    rows[block.y][block.x] = {
      backgroundColor: COLORS[state.active.type] ?? "#f43f5e",
      borderColor: "#020617"
    };
  }

  return rows.slice(HIDDEN_ROWS, HIDDEN_ROWS + VISIBLE_ROWS);
};

const GameButton = ({ label, onPress }: { label: string; onPress: () => void }) => (
  <Pressable style={styles.button} onPress={onPress}>
    <Text style={styles.buttonText}>{label}</Text>
  </Pressable>
);

export default function App() {
  const [state, setState] = useState<GameState>(() => resetGame());
  const stateRef = useRef(state);
  const { width } = useWindowDimensions();

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    let last = Date.now();
    const STEP_MS = 1000 / 60;
    const MAX_FRAME_MS = 100;
    const MAX_STEPS = 5;

    const interval = setInterval(() => {
      const now = Date.now();
      const frame = Math.min(now - last, MAX_FRAME_MS);
      last = now;
      let accumulator = frame;
      let next = stateRef.current;
      let steps = 0;

      while (accumulator >= STEP_MS && steps < MAX_STEPS) {
        const updated = tick(next, STEP_MS);
        if (updated !== next) next = updated;
        accumulator -= STEP_MS;
        steps += 1;
      }

      if (next !== stateRef.current) {
        stateRef.current = next;
        setState(next);
      }
    }, 16);

    return () => clearInterval(interval);
  }, []);

  const dispatch = (action: Parameters<typeof applyAction>[1]) => {
    const prev = stateRef.current;
    if (!canApplyAction(prev, action)) return;
    const next = applyAction(prev, action);
    stateRef.current = next;
    setState(next);
  };

  const board = useMemo(() => buildBoard(state), [state]);
  const boardWidth = Math.min(width - 24, 380);
  const cellSize = Math.floor(boardWidth / BOARD_WIDTH);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Drop-a-Block iOS</Text>
      <View style={styles.statsRow}>
        <Text style={styles.stat}>Score: {state.score}</Text>
        <Text style={styles.stat}>Lines: {state.lines}</Text>
        <Text style={styles.stat}>Level: {state.level}</Text>
      </View>
      <Text style={styles.status}>
        Mode: {state.mode.toUpperCase()} • {state.status.toUpperCase()}
      </Text>

      <View style={[styles.board, { width: cellSize * BOARD_WIDTH }]}>
        {board.map((row, rowIndex) => (
          <View key={`r-${rowIndex}`} style={styles.row}>
            {row.map((cell, colIndex) => (
              <View
                key={`c-${rowIndex}-${colIndex}`}
                style={[
                  styles.cell,
                  {
                    width: cellSize,
                    height: cellSize,
                    backgroundColor: cell.backgroundColor,
                    borderColor: cell.borderColor,
                    opacity: cell.opacity ?? 1
                  }
                ]}
              />
            ))}
          </View>
        ))}
      </View>

      <View style={styles.controls}>
        <View style={styles.controlsRow}>
          <GameButton label="◀" onPress={() => dispatch("left")} />
          <GameButton label="▶" onPress={() => dispatch("right")} />
          <GameButton label="▼" onPress={() => dispatch("down")} />
          <GameButton label="⤓" onPress={() => dispatch("hardDrop")} />
        </View>
        <View style={styles.controlsRow}>
          <GameButton label="↺" onPress={() => dispatch("rotateCcw")} />
          <GameButton label="↻" onPress={() => dispatch("rotateCw")} />
          <GameButton label="Hold" onPress={() => dispatch("hold")} />
          <GameButton
            label={state.status === "paused" ? "Resume" : "Pause"}
            onPress={() => dispatch("pause")}
          />
        </View>
        {state.status !== "running" && (
          <View style={styles.controlsRow}>
            <GameButton label="Start / Restart" onPress={() => setState(resetGame())} />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#020617",
    paddingHorizontal: 12,
    paddingTop: 8,
    gap: 10
  },
  title: {
    color: "#f8fafc",
    fontSize: 22,
    fontWeight: "700"
  },
  statsRow: {
    flexDirection: "row",
    gap: 12
  },
  stat: {
    color: "#cbd5e1",
    fontSize: 14
  },
  status: {
    color: "#94a3b8",
    fontSize: 12
  },
  board: {
    borderWidth: 2,
    borderColor: "#334155",
    backgroundColor: "#0f172a"
  },
  row: {
    flexDirection: "row"
  },
  cell: {
    borderWidth: 0.5
  },
  controls: {
    width: "100%",
    gap: 8
  },
  controlsRow: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 8
  },
  button: {
    minWidth: 70,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#1d4ed8",
    alignItems: "center"
  },
  buttonText: {
    color: "#eff6ff",
    fontWeight: "700"
  }
});
