import React from "react";
import useGameStore from "../store/gameStore";

export default function WinScreen() {
  const score = useGameStore((state) => state.score);
  const gameStatus = useGameStore((state) => state.gameStatus);
  const resetGame = useGameStore((state) => state.resetGame);

  if (gameStatus !== "win") return null;

  return (
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
          maxWidth: "80%",
          color: "black",
        }}
      >
        <h1 style={{ marginBottom: "1rem" }}>Congratulations!</h1>
        <p style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>
          You've cleaned all the spots!
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
          Play Again
        </button>
      </div>
    </div>
  );
}
