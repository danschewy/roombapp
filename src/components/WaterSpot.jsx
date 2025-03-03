import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import useGameStore from "../store/gameStore";

export default function WaterSpot({ id, position }) {
  const meshRef = useRef();
  const removeWaterSpot = useGameStore((state) => state.removeWaterSpot);
  const addWaterSpot = useGameStore((state) => state.addWaterSpot);
  const setScore = useGameStore((state) => state.score);
  const isMopMode = useGameStore((state) => state.isMopMode);

  useEffect(() => {
    // Check for collision with Roomba
    const checkCollision = (roombaPosition) => {
      if (meshRef.current) {
        const distance = meshRef.current.position.distanceTo(roombaPosition);
        if (distance < 0.5) {
          if (isMopMode) {
            // Clean up water spot in mop mode
            removeWaterSpot(id);
            setScore((prev) => prev + 15);
          } else {
            // Splash and multiply water spots when not in mop mode
            removeWaterSpot(id);

            // Create 2-3 new water spots in nearby positions
            const numNewSpots = Math.floor(Math.random() * 2) + 2;
            for (let i = 0; i < numNewSpots; i++) {
              const angle = (Math.PI * 2 * i) / numNewSpots;
              const radius = 0.5 + Math.random() * 0.5;
              const newX = position[0] + Math.cos(angle) * radius;
              const newZ = position[2] + Math.sin(angle) * radius;
              addWaterSpot({
                id: `water-${id}-${i}`,
                position: [newX, position[1], newZ],
              });
            }
          }
        }
      }
    };

    return () => {
      // Cleanup if needed
    };
  }, [id, position, removeWaterSpot, addWaterSpot, setScore, isMopMode]);

  return (
    <mesh ref={meshRef} position={position}>
      <cylinderGeometry args={[0.2, 0.2, 0.01, 16]} />
      <meshStandardMaterial color="#4477ff" transparent={true} opacity={0.6} />
    </mesh>
  );
}
