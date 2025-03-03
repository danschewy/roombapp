import { create } from "zustand";

const useGameStore = create((set, get) => ({
  // Game state
  battery: 100,
  score: 0,
  isMopMode: false,
  tankFullness: 0,
  cameraMode: "thirdPerson", // 'firstPerson' or 'thirdPerson'
  gameStatus: "playing", // 'playing', 'paused', 'gameOver', 'win'
  isCharging: false,
  lowBatteryWarning: false,

  // Dirt and water spots
  dirtSpots: [],
  waterSpots: [],
  obstacles: [],

  // Actions
  setBattery: (value) => {
    set((state) => {
      const newBattery = Math.max(0, Math.min(100, value));
      const lowBatteryWarning = newBattery < 15;

      // Check for game over if battery dies
      if (newBattery <= 0) {
        return {
          battery: 0,
          gameStatus: "gameOver",
          lowBatteryWarning: false,
        };
      }

      return {
        battery: newBattery,
        lowBatteryWarning,
      };
    });
  },

  setScore: (value) =>
    set((state) => {
      const newScore = typeof value === "function" ? value(state.score) : value;
      return { score: newScore };
    }),

  toggleMopMode: () => set((state) => ({ isMopMode: !state.isMopMode })),
  setTankFullness: (value) => set({ tankFullness: value }),
  toggleCameraMode: () =>
    set((state) => ({
      cameraMode:
        state.cameraMode === "firstPerson" ? "thirdPerson" : "firstPerson",
    })),
  setGameStatus: (status) => set({ gameStatus: status }),
  setIsCharging: (value) => set({ isCharging: value }),

  // Game environment management
  addDirtSpot: (spot) =>
    set((state) => ({
      dirtSpots: [...state.dirtSpots, spot],
    })),
  removeDirtSpot: (id) =>
    set((state) => {
      const newDirtSpots = state.dirtSpots.filter((spot) => spot.id !== id);
      // Check for win condition if all spots are cleaned
      if (newDirtSpots.length === 0 && state.waterSpots.length === 0) {
        return {
          dirtSpots: newDirtSpots,
          gameStatus: "win",
        };
      }
      return { dirtSpots: newDirtSpots };
    }),
  addWaterSpot: (spot) =>
    set((state) => ({
      waterSpots: [...state.waterSpots, spot],
    })),
  removeWaterSpot: (id) =>
    set((state) => {
      const newWaterSpots = state.waterSpots.filter((spot) => spot.id !== id);
      // Check for win condition if all spots are cleaned
      if (newWaterSpots.length === 0 && state.dirtSpots.length === 0) {
        return {
          waterSpots: newWaterSpots,
          gameStatus: "win",
        };
      }
      return { waterSpots: newWaterSpots };
    }),
  setObstacles: (obstacles) => set({ obstacles }),

  // Game actions
  resetGame: () =>
    set({
      battery: 100,
      score: 0,
      isMopMode: false,
      tankFullness: 0,
      gameStatus: "playing",
      dirtSpots: [],
      waterSpots: [],
      isCharging: false,
      lowBatteryWarning: false,
    }),
}));

export default useGameStore;
