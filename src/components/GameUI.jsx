import useGameStore from "../store/gameStore";

export default function GameUI() {
  const battery = useGameStore((state) => state.battery);
  const score = useGameStore((state) => state.score);
  const isMopMode = useGameStore((state) => state.isMopMode);
  const tankFullness = useGameStore((state) => state.tankFullness);
  const toggleMopMode = useGameStore((state) => state.toggleMopMode);
  const cameraMode = useGameStore((state) => state.cameraMode);
  const toggleCameraMode = useGameStore((state) => state.toggleCameraMode);
  const gameStatus = useGameStore((state) => state.gameStatus);
  const resetGame = useGameStore((state) => state.resetGame);

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        padding: "20px",
        color: "white",
        fontFamily: "Arial, sans-serif",
        userSelect: "none",
        width: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          maxWidth: "800px",
          margin: "0 auto",
          background: "rgba(0,0,0,0.5)",
          padding: "15px",
          borderRadius: "10px",
        }}
      >
        <div>
          <div>Battery: {Math.round(battery)}%</div>
          <div>Score: {score}</div>
          <div>Tank Fullness: {Math.round(tankFullness)}%</div>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={toggleMopMode}
            style={{
              padding: "8px 16px",
              background: isMopMode ? "#4444ff" : "#44ff44",
              border: "none",
              borderRadius: "5px",
              color: "white",
              cursor: "pointer",
            }}
          >
            {isMopMode ? "Mop Mode: ON" : "Mop Mode: OFF"}
          </button>

          <button
            onClick={toggleCameraMode}
            style={{
              padding: "8px 16px",
              background: "#666666",
              border: "none",
              borderRadius: "5px",
              color: "white",
              cursor: "pointer",
            }}
          >
            Camera: {cameraMode === "firstPerson" ? "FPV" : "TPV"}
          </button>
        </div>
      </div>

      {gameStatus === "gameOver" && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "rgba(0,0,0,0.8)",
            padding: "20px",
            borderRadius: "10px",
            textAlign: "center",
          }}
        >
          <h2>Game Over!</h2>
          <p>Final Score: {score}</p>
          <button
            onClick={resetGame}
            style={{
              padding: "10px 20px",
              background: "#44ff44",
              border: "none",
              borderRadius: "5px",
              color: "white",
              cursor: "pointer",
              marginTop: "10px",
            }}
          >
            Play Again
          </button>
        </div>
      )}

      <div
        style={{
          position: "absolute",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(0,0,0,0.5)",
          padding: "10px",
          borderRadius: "5px",
          textAlign: "center",
        }}
      >
        <p>
          Controls: WASD to move, SPACE to toggle mop mode, V to change camera
        </p>
      </div>
    </div>
  );
}
