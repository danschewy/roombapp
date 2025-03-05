import { useRef, useEffect, useCallback } from "react";
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
  const toggleMopMode = useGameStore((state) => state.toggleMopMode);
  const cameraMode = useGameStore((state) => state.cameraMode);
  const toggleCameraMode = useGameStore((state) => state.toggleCameraMode);
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
  const setMovementControls = useGameStore(
    (state) => state.setMovementControls
  );

  // Movement controls
  const [subscribeKeys, getKeys] = useKeyboardControls();

  // Define movement functions
  const moveForward = useCallback(() => {
    if (!roombaRef.current || gameStatus === "gameOver" || gameStatus === "win")
      return;
    if (battery <= 0 && !isCharging) return;

    const rigidBody = roombaRef.current;
    const speed = 5;
    const moveDirection = new THREE.Vector3(0, 0, 1);
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
      setBattery(Math.max(0, battery - 0.02));
    }

    const position = rigidBody.translation();
    checkCollisions(position, rotationAngle.current, true);
  }, [battery, isCharging, gameStatus, setBattery]);

  const moveBackward = useCallback(() => {
    if (!roombaRef.current || gameStatus === "gameOver" || gameStatus === "win")
      return;
    if (battery <= 0 && !isCharging) return;

    const rigidBody = roombaRef.current;
    const speed = 5;
    const moveDirection = new THREE.Vector3(0, 0, -1);
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
      setBattery(Math.max(0, battery - 0.02));
    }

    const position = rigidBody.translation();
    checkCollisions(position, rotationAngle.current, true);
  }, [battery, isCharging, gameStatus, setBattery]);

  const turnLeft = useCallback(() => {
    if (!roombaRef.current || gameStatus === "gameOver" || gameStatus === "win")
      return;
    if (battery <= 0 && !isCharging) return;

    const rigidBody = roombaRef.current;
    const rotationSpeed = 2;
    rotationAngle.current += rotationSpeed * 0.05;
    const quaternion = new THREE.Quaternion();
    quaternion.setFromAxisAngle(
      new THREE.Vector3(0, 1, 0),
      rotationAngle.current
    );
    rigidBody.setRotation(quaternion);
    if (!isCharging) {
      setBattery(Math.max(0, battery - 0.01));
    }
  }, [battery, isCharging, gameStatus, setBattery]);

  const turnRight = useCallback(() => {
    if (!roombaRef.current || gameStatus === "gameOver" || gameStatus === "win")
      return;
    if (battery <= 0 && !isCharging) return;

    const rigidBody = roombaRef.current;
    const rotationSpeed = 2;
    rotationAngle.current -= rotationSpeed * 0.05;
    const quaternion = new THREE.Quaternion();
    quaternion.setFromAxisAngle(
      new THREE.Vector3(0, 1, 0),
      rotationAngle.current
    );
    rigidBody.setRotation(quaternion);
    if (!isCharging) {
      setBattery(Math.max(0, battery - 0.01));
    }
  }, [battery, isCharging, gameStatus, setBattery]);

  // Stop movement function
  const stopMovement = useCallback(() => {
    if (!roombaRef.current) return;
    const rigidBody = roombaRef.current;
    rigidBody.setLinvel({ x: 0, y: 0, z: 0 });
  }, []);

  // Connect movement functions to store
  useEffect(() => {
    setMovementControls({
      moveForward,
      moveBackward,
      turnLeft,
      turnRight,
      stopMovement,
      resetRoombaPosition: () => {
        if (roombaRef.current) {
          roombaRef.current.setTranslation({ x: 0, y: 0.15, z: 0 });
          roombaRef.current.setRotation(new THREE.Quaternion());
          roombaRef.current.setLinvel({ x: 0, y: 0, z: 0 });
          roombaRef.current.setAngvel({ x: 0, y: 0, z: 0 });
          rotationAngle.current = 0;
        }
      },
    });
  }, [
    moveForward,
    moveBackward,
    turnLeft,
    turnRight,
    stopMovement,
    setMovementControls,
  ]);

  // Add global keyboard listeners
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Only handle keys if game is not over
      if (gameStatus !== "gameOver" && gameStatus !== "win") {
        // Toggle mop mode with space
        if (event.code === "Space") {
          event.preventDefault();
          toggleMopMode();
        }
        // Toggle camera mode with V
        if (event.code === "KeyV") {
          event.preventDefault();
          toggleCameraMode();
        }
      }
    };

    // Add the event listeners
    window.addEventListener("keydown", handleKeyDown);

    // Cleanup
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [gameStatus, toggleMopMode, toggleCameraMode]);

  // Make resetPosition available to the store
  useEffect(() => {
    if (roombaRef.current) {
      const resetPosition = () => {
        const rigidBody = roombaRef.current;
        rigidBody.setTranslation({ x: 0, y: 0.15, z: 0 });
        rigidBody.setRotation(new THREE.Quaternion());
        rigidBody.setLinvel({ x: 0, y: 0, z: 0 });
        rigidBody.setAngvel({ x: 0, y: 0, z: 0 });
        rotationAngle.current = 0;
      };

      useGameStore.setState({
        resetRoombaPosition: resetPosition,
      });
    }
  }, []);

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

  // Check for collisions with dirt and water spots
  const checkCollisions = (position, rotation, isMoving) => {
    // Only process collisions when moving
    if (!isMoving) return;

    // Add a small cooldown between collisions to prevent multiple detections
    const now = Date.now();
    if (now - lastCollisionTime.current < 100) return;

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

    // Check dirt spots (front collision only, not in mop mode)
    if (!isMopMode) {
      let closestDirt = null;
      let closestDirtDistance = Infinity;

      for (const spot of dirtSpots) {
        const spotPos = new THREE.Vector3(
          spot.position[0],
          0,
          spot.position[2]
        );
        const distance = frontCenter.distanceTo(spotPos);

        if (distance < 0.3 && distance < closestDirtDistance) {
          closestDirt = spot;
          closestDirtDistance = distance;
        }
      }

      if (closestDirt) {
        removeDirtSpot(closestDirt.id);
        setScore((prev) => prev + 10);
        lastCollisionTime.current = now;
      }
    }

    // Check water spots
    if (isMopMode) {
      // In mop mode, remove water when rear passes over it
      let closestWater = null;
      let closestWaterDistance = Infinity;

      for (const spot of waterSpots) {
        const spotPos = new THREE.Vector3(
          spot.position[0],
          0,
          spot.position[2]
        );
        const distance = rearCenter.distanceTo(spotPos);

        if (distance < 0.3 && distance < closestWaterDistance) {
          closestWater = spot;
          closestWaterDistance = distance;
        }
      }

      if (closestWater) {
        removeWaterSpot(closestWater.id);
        setScore((prev) => prev + 15);
        lastCollisionTime.current = now;
      }
    } else {
      // In vacuum mode, multiply water when front hits it
      let closestWater = null;
      let closestWaterDistance = Infinity;

      for (const spot of waterSpots) {
        const spotPos = new THREE.Vector3(
          spot.position[0],
          0,
          spot.position[2]
        );
        const distance = frontCenter.distanceTo(spotPos);

        if (distance < 0.3 && distance < closestWaterDistance) {
          closestWater = spot;
          closestWaterDistance = distance;
        }
      }

      if (closestWater) {
        removeWaterSpot(closestWater.id);
        lastCollisionTime.current = now;

        // Create 2-3 new water spots in random directions
        const numNewSpots = Math.floor(Math.random() * 2) + 2;
        for (let i = 0; i < numNewSpots; i++) {
          const angle = Math.random() * Math.PI * 2;
          const distance = 0.8 + Math.random() * 0.7;

          // Calculate new position
          const newX = closestWater.position[0] + Math.sin(angle) * distance;
          const newZ = closestWater.position[2] + Math.cos(angle) * distance;

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
              id: `water-${closestWater.id}-${i}-${Date.now()}`,
              position: [boundedX, closestWater.position[1], boundedZ],
            });
          }
        }
      }
    }
  };

  // Handle keyboard controls in useFrame
  useFrame((state, delta) => {
    if (!roombaRef.current || gameStatus === "gameOver" || gameStatus === "win")
      return;

    const rigidBody = roombaRef.current;
    const position = rigidBody.translation();

    // Check charging status
    const isAtCharger = checkCharging(position);

    // Charge battery when at charging station
    if (isAtCharger) {
      setBattery(Math.min(100, battery + delta * 20));
    }

    // Only allow movement if not game over and either has battery or is charging
    if (battery > 0 || isCharging) {
      const { forward, backward, left, right } = getKeys();

      if (forward) {
        moveForward();
      } else if (backward) {
        moveBackward();
      } else {
        stopMovement();
      }

      if (left) {
        turnLeft();
      }
      if (right) {
        turnRight();
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
