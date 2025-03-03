import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import useGameStore from "../store/gameStore";

export default function DirtSpot({ id, position }) {
  const meshRef = useRef();
  const removeDirtSpot = useGameStore((state) => state.removeDirtSpot);
  const setScore = useGameStore((state) => state.score);
  const setTankFullness = useGameStore((state) => state.tankFullness);

  useEffect(() => {
    // Check for collision with Roomba and clean up if hit
    const checkCollision = (roombaPosition) => {
      if (meshRef.current) {
        const distance = meshRef.current.position.distanceTo(roombaPosition);
        if (distance < 0.5) {
          removeDirtSpot(id);
          setScore((prev) => prev + 10);
          setTankFullness((prev) => Math.min(100, prev + 5));
        }
      }
    };

    return () => {
      // Cleanup if needed
    };
  }, [id, removeDirtSpot, setScore, setTankFullness]);

  return (
    <mesh ref={meshRef} position={position}>
      <cylinderGeometry args={[0.2, 0.2, 0.02, 8]} />
      <meshStandardMaterial color="#8B4513" />
    </mesh>
  );
}
