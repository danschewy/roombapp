import { useEffect } from "react";
import { RigidBody } from "@react-three/rapier";
import useGameStore from "../store/gameStore";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

// Helper function to generate spots
export const generateSpots = (addDirtSpot, addWaterSpot) => {
  // Generate dirt spots
  for (let i = 0; i < 10; i++) {
    const x = Math.random() * 8 - 4;
    const z = Math.random() * 8 - 4;
    addDirtSpot({ id: `dirt-${i}`, position: [x, 0.01, z] });
  }

  // Generate water spots
  for (let i = 0; i < 5; i++) {
    const x = Math.random() * 8 - 4;
    const z = Math.random() * 8 - 4;
    addWaterSpot({ id: `water-${i}`, position: [x, 0.01, z] });
  }
};

// Furniture and clothing models
const TableLegs = ({ position }) => (
  <group position={position}>
    <RigidBody type="fixed" colliders="cuboid">
      <mesh position={[-0.9, 0.4, -0.9]}>
        <cylinderGeometry args={[0.05, 0.05, 0.8, 8]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      <mesh position={[0.9, 0.4, -0.9]}>
        <cylinderGeometry args={[0.05, 0.05, 0.8, 8]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      <mesh position={[-0.9, 0.4, 0.9]}>
        <cylinderGeometry args={[0.05, 0.05, 0.8, 8]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      <mesh position={[0.9, 0.4, 0.9]}>
        <cylinderGeometry args={[0.05, 0.05, 0.8, 8]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      <mesh position={[0, 0.85, 0]}>
        <boxGeometry args={[2, 0.1, 2]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
    </RigidBody>
  </group>
);

const ChairLegs = ({ position, rotation = 0 }) => (
  <group position={position} rotation={[0, rotation, 0]}>
    <RigidBody type="fixed" colliders="cuboid">
      <mesh position={[-0.3, 0.25, -0.3]}>
        <cylinderGeometry args={[0.03, 0.03, 0.5, 8]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      <mesh position={[0.3, 0.25, -0.3]}>
        <cylinderGeometry args={[0.03, 0.03, 0.5, 8]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      <mesh position={[-0.3, 0.25, 0.3]}>
        <cylinderGeometry args={[0.03, 0.03, 0.5, 8]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      <mesh position={[0.3, 0.25, 0.3]}>
        <cylinderGeometry args={[0.03, 0.03, 0.5, 8]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[0.7, 0.05, 0.7]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
    </RigidBody>
  </group>
);

const Clothing = ({ position, type, rotation = 0 }) => {
  const getClothingGeometry = () => {
    switch (type) {
      case "shirt":
        return (
          <mesh position={position} rotation={[0, rotation, 0]}>
            <boxGeometry args={[0.4, 0.05, 0.6]} />
            <meshStandardMaterial color="#4444ff" />
          </mesh>
        );
      case "sock":
        return (
          <mesh position={position} rotation={[0, rotation, 0]}>
            <boxGeometry args={[0.1, 0.05, 0.25]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
        );
      case "shoe":
        return (
          <mesh position={position} rotation={[0, rotation, 0]}>
            <boxGeometry args={[0.15, 0.1, 0.3]} />
            <meshStandardMaterial color="#444444" />
          </mesh>
        );
      default:
        return null;
    }
  };

  return (
    <RigidBody type="fixed" colliders="cuboid">
      {getClothingGeometry()}
    </RigidBody>
  );
};

export default function Environment() {
  const setObstacles = useGameStore((state) => state.setObstacles);
  const addDirtSpot = useGameStore((state) => state.addDirtSpot);
  const addWaterSpot = useGameStore((state) => state.addWaterSpot);

  useEffect(() => {
    // Generate initial spots
    generateSpots(addDirtSpot, addWaterSpot);

    // Generate obstacles list for collision checking
    const obstacles = [
      { id: "table", position: [2, 0, 2], size: [2, 1, 2] },
      { id: "chair1", position: [-2, 0, -2], size: [0.7, 0.6, 0.7] },
      { id: "chair2", position: [1, 0, -2], size: [0.7, 0.6, 0.7] },
    ];
    setObstacles(obstacles);
  }, []);

  return (
    <>
      {/* Floor */}
      <RigidBody type="fixed">
        <mesh rotation-x={-Math.PI / 2} position={[0, 0, 0]} receiveShadow>
          <planeGeometry args={[10, 10]} />
          <meshStandardMaterial color="#cccccc" />
        </mesh>
      </RigidBody>

      {/* Walls */}
      <RigidBody type="fixed">
        <mesh position={[0, 1, -5]} receiveShadow>
          <boxGeometry args={[10, 2, 0.2]} />
          <meshStandardMaterial color="#999999" />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed">
        <mesh position={[0, 1, 5]} receiveShadow>
          <boxGeometry args={[10, 2, 0.2]} />
          <meshStandardMaterial color="#999999" />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed">
        <mesh position={[-5, 1, 0]} rotation-y={Math.PI / 2} receiveShadow>
          <boxGeometry args={[10, 2, 0.2]} />
          <meshStandardMaterial color="#999999" />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed">
        <mesh position={[5, 1, 0]} rotation-y={Math.PI / 2} receiveShadow>
          <boxGeometry args={[10, 2, 0.2]} />
          <meshStandardMaterial color="#999999" />
        </mesh>
      </RigidBody>

      {/* Furniture */}
      <TableLegs position={[2, 0, 2]} />
      <ChairLegs position={[-2, 0, -2]} rotation={Math.PI / 4} />
      <ChairLegs position={[1, 0, -2]} rotation={-Math.PI / 6} />

      {/* Clothing */}
      <Clothing position={[-1, 0.025, 1]} type="shirt" rotation={Math.PI / 6} />
      <Clothing
        position={[3, 0.025, -3]}
        type="shirt"
        rotation={-Math.PI / 4}
      />
      <Clothing position={[-3, 0.025, 3]} type="sock" rotation={Math.PI / 3} />
      <Clothing position={[2, 0.025, -1]} type="sock" rotation={-Math.PI / 5} />
      <Clothing position={[-2, 0.05, 0]} type="shoe" rotation={Math.PI / 4} />
      <Clothing position={[1, 0.05, 3]} type="shoe" rotation={-Math.PI / 3} />

      {/* Charging Dock */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[4.5, 0.1, 4.5]} rotation-y={-Math.PI / 4}>
          <boxGeometry args={[0.6, 0.2, 0.4]} />
          <meshStandardMaterial color="#333333" />
          {/* Charging indicator light */}
          <mesh position={[0, 0.15, 0]} scale={[0.1, 0.1, 0.1]}>
            <sphereGeometry />
            <meshStandardMaterial
              color="#44ff44"
              emissive="#44ff44"
              emissiveIntensity={0.5}
            />
          </mesh>
        </mesh>
      </RigidBody>
    </>
  );
}
