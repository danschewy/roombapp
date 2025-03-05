import React from "react";
import useGameStore from "../store/gameStore";
import MobileControls from "./MobileControls";

export default function Interface() {
  const battery = useGameStore((state) => state.battery);
  const score = useGameStore((state) => state.score);
  const isMopMode = useGameStore((state) => state.isMopMode);
  const isCharging = useGameStore((state) => state.isCharging);
  const gameStatus = useGameStore((state) => state.gameStatus);
  const toggleMopMode = useGameStore((state) => state.toggleMopMode);
  const toggleCameraMode = useGameStore((state) => state.toggleCameraMode);
  const resetGame = useGameStore((state) => state.resetGame);

  const getBatteryColor = () => {
    if (isCharging) return "#44ff44";
    if (battery < 15) return "#ff4444";
    if (battery < 30) return "#ffaa44";
    return "#44ff44";
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        padding: "1rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        color: "white",
        fontFamily: "Arial, sans-serif",
        textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
        pointerEvents: "none",
        zIndex: 100,
      }}
    >
      {/* Left side - Battery and Mode */}
      <div>
        {/* Battery Indicator */}
        <div
          style={{
            marginBottom: "1rem",
            background: "rgba(0,0,0,0.5)",
            padding: "0.5rem",
            borderRadius: "0.5rem",
          }}
        >
          <div style={{ marginBottom: "0.25rem" }}>Battery</div>
          <div
            style={{
              width: "150px",
              height: "20px",
              background: "#333",
              borderRadius: "10px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${battery}%`,
                height: "100%",
                background: getBatteryColor(),
                transition: "width 0.3s, background-color 0.3s",
              }}
            />
          </div>
          <div style={{ marginTop: "0.25rem" }}>
            {battery.toFixed(0)}% {isCharging && "(Charging...)"}
          </div>
        </div>

        {/* Mode Indicator */}
        <div
          style={{
            background: "rgba(0,0,0,0.5)",
            padding: "0.5rem",
            borderRadius: "0.5rem",
          }}
        >
          <div>Mode: {isMopMode ? "Mop" : "Vacuum"}</div>
        </div>
      </div>

      {/* Center - Score */}
      <div
        style={{
          textAlign: "center",
          background: "rgba(0,0,0,0.5)",
          padding: "0.5rem",
          borderRadius: "0.5rem",
        }}
      >
        <div style={{ fontSize: "2rem" }}>Score: {score}</div>
      </div>

      {/* Right side - Controls */}
      <div
        style={{
          background: "rgba(0,0,0,0.5)",
          padding: "0.5rem",
          borderRadius: "0.5rem",
          pointerEvents: "auto",
        }}
      >
        <button
          onClick={toggleMopMode}
          style={{
            padding: "0.5rem 1rem",
            marginBottom: "0.5rem",
            background: isMopMode ? "#4444ff" : "#44ff44",
            border: "none",
            borderRadius: "0.25rem",
            color: "white",
            cursor: "pointer",
            width: "100%",
          }}
        >
          Toggle Mode (Space)
        </button>
        <button
          onClick={toggleCameraMode}
          style={{
            padding: "0.5rem 1rem",
            marginBottom: "0.5rem",
            background: "#2196F3",
            border: "none",
            borderRadius: "0.25rem",
            color: "white",
            cursor: "pointer",
            width: "100%",
          }}
        >
          Toggle Camera (V)
        </button>
        <button
          onClick={() => resetGame(true)}
          style={{
            padding: "0.5rem 1rem",
            background: "#ff4444",
            border: "none",
            borderRadius: "0.25rem",
            color: "white",
            cursor: "pointer",
            width: "100%",
          }}
        >
          New Game
        </button>
      </div>

      {/* Mobile Controls */}
      <MobileControls />

      {/* Game Over Overlay */}
      {gameStatus === "gameOver" && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "white",
              padding: "2rem",
              borderRadius: "1rem",
              textAlign: "center",
              color: "black",
              textShadow: "none",
            }}
          >
            <h1 style={{ marginBottom: "1rem" }}>Game Over!</h1>
            <p style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>
              Your battery ran out!
            </p>
            <p style={{ fontSize: "1.5rem", marginBottom: "2rem" }}>
              Final Score: {score}
            </p>
            <button
              onClick={() => resetGame(true)}
              style={{
                padding: "0.8rem 1.5rem",
                fontSize: "1.2rem",
                backgroundColor: "#4CAF50",
                color: "white",
                border: "none",
                borderRadius: "0.5rem",
                cursor: "pointer",
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
