import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import {
  KeyboardControls,
  OrbitControls,
  PerspectiveCamera,
} from "@react-three/drei";
import { Physics } from "@react-three/rapier";
import useGameStore from "./store/gameStore";

import Roomba from "./components/Roomba";
import Environment from "./components/Environment";
import DirtSpot from "./components/DirtSpot";
import WaterSpot from "./components/WaterSpot";
import GameUI from "./components/GameUI";

// Define keyboard controls
const keyboardMap = [
  { name: "forward", keys: ["ArrowUp", "KeyW"] },
  { name: "backward", keys: ["ArrowDown", "KeyS"] },
  { name: "left", keys: ["ArrowLeft", "KeyA"] },
  { name: "right", keys: ["ArrowRight", "KeyD"] },
  { name: "mopMode", keys: ["Space"] },
  { name: "camera", keys: ["KeyV"] },
];

function Game() {
  const dirtSpots = useGameStore((state) => state.dirtSpots);
  const waterSpots = useGameStore((state) => state.waterSpots);
  const cameraMode = useGameStore((state) => state.cameraMode);

  return (
    <Canvas shadows>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[10, 10, 10]}
        intensity={1}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />

      {/* Camera - Only show OrbitControls in third person mode */}
      {cameraMode === "thirdPerson" && (
        <OrbitControls
          target={[0, 0, 0]}
          maxPolarAngle={Math.PI / 2}
          minDistance={5}
          maxDistance={15}
        />
      )}

      <Physics gravity={[0, -9.81, 0]}>
        <Suspense fallback={null}>
          <Environment />
          <Roomba />

          {/* Render dirt spots */}
          {dirtSpots.map((spot, index) => (
            <DirtSpot key={"dirt" + index} {...spot} />
          ))}

          {/* Render water spots */}
          {waterSpots.map((spot, index) => (
            <WaterSpot key={"water" + index} {...spot} />
          ))}
        </Suspense>
      </Physics>
    </Canvas>
  );
}

export default function App() {
  return (
    <KeyboardControls map={keyboardMap}>
      <div style={{ width: "100vw", height: "100vh" }}>
        <Game />
        <GameUI />
      </div>
    </KeyboardControls>
  );
}
