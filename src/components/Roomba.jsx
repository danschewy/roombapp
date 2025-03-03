import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useKeyboardControls, PerspectiveCamera } from "@react-three/drei";
import { RigidBody, useRapier } from "@react-three/rapier";
import useGameStore from "../store/gameStore";
import * as THREE from "three";

export default function Roomba() {
  const roombaRef = useRef();
  const rotationAngle = useRef(0);
  const lastCollisionTime = useRef(0);
  const { rapier, world } = useRapier();

  const battery = useGameStore((state) => state.battery);
  const setBattery = useGameStore((state) => state.setBattery);
  const isMopMode = useGameStore((state) => state.isMopMode);
  const cameraMode = useGameStore((state) => state.cameraMode);
  const dirtSpots = useGameStore((state) => state.dirtSpots);
  const waterSpots = useGameStore((state) => state.waterSpots);
  const removeDirtSpot = useGameStore((state) => state.removeDirtSpot);
  const removeWaterSpot = useGameStore((state) => state.removeWaterSpot);
  const addWaterSpot = useGameStore((state) => state.addWaterSpot);
  const setScore = useGameStore((state) => state.setScore);
  const gameStatus = useGameStore((state) => state.gameStatus);
  const setIsCharging = useGameStore((state) => state.setIsCharging);
  const isCharging = useGameStore((state) => state.isCharging);
  const lowBatteryWarning = useGameStore((state) => state.lowBatteryWarning);

  // Movement controls
  const [subscribeKeys, getKeys] = useKeyboardControls();

  // Check for collisions with dirt and water spots
  const checkCollisions = (position, rotation, isMoving) => {
    const radius = 0.4; // Roomba radius
    const frontCenter = new THREE.Vector3(
      position.x + Math.sin(rotation) * (radius * 0.7),
      0,
      position.z + Math.cos(rotation) * (radius * 0.7)
    );
    const rearCenter = new THREE.Vector3(
      position.x - Math.sin(rotation) * (radius * 0.7),
      0,
      position.z - Math.cos(rotation) * (radius * 0.7)
    );

    // Only process collisions when moving
    if (!isMoving) return;

    // Add a small cooldown between collisions to prevent multiple detections
    const now = Date.now();
    if (now - lastCollisionTime.current < 100) return;

    // Check dirt spots (front collision only, not in mop mode)
    if (!isMopMode) {
      for (const spot of dirtSpots) {
        const spotPos = new THREE.Vector3(
          spot.position[0],
          0,
          spot.position[2]
        );
        if (frontCenter.distanceTo(spotPos) < 0.3) {
          removeDirtSpot(spot.id);
          setScore((prev) => prev + 10);
          lastCollisionTime.current = now;
          break; // Only handle one dirt spot at a time
        }
      }
    }

    // Check water spots
    for (const spot of waterSpots) {
      const spotPos = new THREE.Vector3(spot.position[0], 0, spot.position[2]);

      if (isMopMode) {
        // In mop mode, remove water when rear passes over it
        if (rearCenter.distanceTo(spotPos) < 0.3) {
          removeWaterSpot(spot.id);
          setScore((prev) => prev + 15);
          lastCollisionTime.current = now;
          break;
        }
      } else {
        // In vacuum mode, multiply water when front hits it
        if (frontCenter.distanceTo(spotPos) < 0.3) {
          removeWaterSpot(spot.id);
          lastCollisionTime.current = now;

          // Create 2-3 new water spots in random directions
          const numNewSpots = Math.floor(Math.random() * 2) + 2;
          for (let i = 0; i < numNewSpots; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = 0.8 + Math.random() * 0.7;

            // Calculate new position
            const newX = spot.position[0] + Math.sin(angle) * distance;
            const newZ = spot.position[2] + Math.cos(angle) * distance;

            // Keep within room bounds (-5 to 5)
            const boundedX = Math.max(-4.5, Math.min(4.5, newX));
            const boundedZ = Math.max(-4.5, Math.min(4.5, newZ));

            // Only create new spot if it's not too close to other water spots
            const tooClose = waterSpots.some((existingSpot) => {
              const existingPos = new THREE.Vector3(
                existingSpot.position[0],
                0,
                existingSpot.position[2]
              );
              const newPos = new THREE.Vector3(boundedX, 0, boundedZ);
              return existingPos.distanceTo(newPos) < 0.5;
            });

            if (!tooClose) {
              addWaterSpot({
                id: `water-${spot.id}-${i}-${Date.now()}`,
                position: [boundedX, spot.position[1], boundedZ],
              });
            }
          }
          break; // Only handle one water spot at a time
        }
      }
    }
  };

  // Check if Roomba is at charging station
  const checkCharging = (position) => {
    const chargingStationPos = new THREE.Vector3(4.5, 0, 4.5);
    const distance = new THREE.Vector3(position.x, 0, position.z).distanceTo(
      chargingStationPos
    );
    const isAtCharger = distance < 0.5;

    if (isAtCharger && !isCharging) {
      setIsCharging(true);
    } else if (!isAtCharger && isCharging) {
      setIsCharging(false);
    }

    return isAtCharger;
  };

  useFrame((state, delta) => {
    if (!roombaRef.current || gameStatus === "gameOver" || gameStatus === "win")
      return;

    const rigidBody = roombaRef.current;
    const position = rigidBody.translation();

    // Check charging status
    const isAtCharger = checkCharging(position);

    // Charge battery when at charging station
    if (isAtCharger) {
      setBattery(Math.min(100, battery + delta * 20)); // Charge 20% per second
    }

    // Only allow movement if not game over and either has battery or is charging
    if (battery > 0 || isCharging) {
      const { forward, backward, left, right } = getKeys();
      const speed = 5;
      const rotationSpeed = 2;

      // Handle rotation in place
      if (left || right) {
        rotationAngle.current += (left ? 1 : -1) * rotationSpeed * delta;
        const quaternion = new THREE.Quaternion();
        quaternion.setFromAxisAngle(
          new THREE.Vector3(0, 1, 0),
          rotationAngle.current
        );
        rigidBody.setRotation(quaternion);
        if (!isCharging) {
          setBattery(Math.max(0, battery - delta));
        }
      }

      // Handle forward/backward movement
      if (forward || backward) {
        const direction = forward ? 1 : -1;
        const moveDirection = new THREE.Vector3(0, 0, direction);
        moveDirection.applyQuaternion(
          new THREE.Quaternion().setFromAxisAngle(
            new THREE.Vector3(0, 1, 0),
            rotationAngle.current
          )
        );

        const velocity = {
          x: moveDirection.x * speed,
          y: 0,
          z: moveDirection.z * speed,
        };

        rigidBody.setLinvel(velocity);
        if (!isCharging) {
          setBattery(Math.max(0, battery - delta * 2));
        }

        // Check for collisions while moving
        checkCollisions(position, rotationAngle.current, true);
      } else {
        rigidBody.setLinvel({ x: 0, y: 0, z: 0 });
      }

      rigidBody.resetTorques(true);
      rigidBody.resetForces(true);
    }
  });

  return (
    <RigidBody
      ref={roombaRef}
      colliders="hull"
      type="dynamic"
      position={[0, 0.15, 0]}
      restitution={0.2}
      friction={1}
      linearDamping={1}
      angularDamping={1}
      lockRotations={true}
    >
      <group>
        {/* Base */}
        <mesh>
          <cylinderGeometry args={[0.4, 0.4, 0.2, 32]} />
          <meshStandardMaterial
            color={isMopMode ? "#4444ff" : "#44ff44"}
            emissive={
              lowBatteryWarning ? "#ff0000" : isCharging ? "#44ff44" : "#000000"
            }
            emissiveIntensity={lowBatteryWarning ? 0.5 : isCharging ? 0.3 : 0}
          />
        </mesh>

        {/* Top */}
        <mesh position={[0, 0.15, 0]}>
          <cylinderGeometry args={[0.2, 0.4, 0.1, 32]} />
          <meshStandardMaterial color="#333333" />
        </mesh>

        {/* Front Indicator */}
        <mesh position={[0, 0, 0.35]} rotation={[0, 0, 0]}>
          <boxGeometry args={[0.1, 0.1, 0.1]} />
          <meshStandardMaterial color="#ff0000" />
        </mesh>

        {/* Camera mount point for FPV */}
        {cameraMode === "firstPerson" && (
          <group position={[0, 0.5, -0.2]}>
            <PerspectiveCamera
              makeDefault
              position={[0, 0, 0]}
              rotation={[0, Math.PI, 0]}
              fov={75}
            />
          </group>
        )}

        {/* Battery Warning Indicator */}
        {lowBatteryWarning && (
          <mesh position={[0, 0.4, 0]}>
            <sphereGeometry args={[0.05]} />
            <meshStandardMaterial
              color="#ff0000"
              emissive="#ff0000"
              emissiveIntensity={0.5}
            />
          </mesh>
        )}
      </group>
    </RigidBody>
  );
}
