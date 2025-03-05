import React, { useState, useEffect } from "react";
import uparrow from "../assets/uparrow.svg";
import leftarrow from "../assets/leftarrow.svg";
import downarrow from "../assets/downarrow.svg";
import rightarrow from "../assets/rightarrow.svg";

const KEYS = {
  up: "KeyW",
  down: "KeyS",
  left: "KeyA",
  right: "KeyD",
};

export default function MobileControls() {
  // State to track if we're on mobile
  const [isMobile, setIsMobile] = useState(false);
  // States to track continuous movement
  const [activeButtons, setActiveButtons] = useState({
    up: false,
    down: false,
    left: false,
    right: false,
  });

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(
        /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
          window.innerWidth <= 768
      );
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleButtonPress = (direction, isPressed) => {
    setActiveButtons((prev) => ({ ...prev, [direction]: isPressed }));
    const event = new KeyboardEvent(isPressed ? "keydown" : "keyup", {
      code: KEYS[direction],
      bubbles: true,
    });
    document.dispatchEvent(event);
  };

  if (!isMobile) return null;

  const buttonStyle = (isActive) => ({
    position: "absolute",
    width: "40px",
    height: "40px",
    backgroundColor: isActive
      ? "rgba(255, 255, 255, 0.4)"
      : "rgba(255, 255, 255, 0.2)",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    WebkitTapHighlightColor: "transparent",
  });

  const imageStyle = {
    filter: "brightness(0) invert(1)",
    width: "24px",
    height: "24px",
    objectFit: "contain",
    pointerEvents: "none",
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        backgroundColor: "rgba(50, 50, 50, 0.5)",
        padding: "12px",
        borderRadius: "10px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
        pointerEvents: "auto",
        touchAction: "none",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "120px",
          height: "120px",
        }}
      >
        <button
          onTouchStart={() => handleButtonPress("up", true)}
          onTouchEnd={() => handleButtonPress("up", false)}
          onMouseDown={() => handleButtonPress("up", true)}
          onMouseUp={() => handleButtonPress("up", false)}
          onMouseLeave={() => handleButtonPress("up", false)}
          style={{
            ...buttonStyle(activeButtons.up),
            top: "0px",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          <img src={uparrow} alt="up" style={imageStyle} />
        </button>

        <button
          onTouchStart={() => handleButtonPress("left", true)}
          onTouchEnd={() => handleButtonPress("left", false)}
          onMouseDown={() => handleButtonPress("left", true)}
          onMouseUp={() => handleButtonPress("left", false)}
          onMouseLeave={() => handleButtonPress("left", false)}
          style={{
            ...buttonStyle(activeButtons.left),
            left: "0px",
            top: "50%",
            transform: "translateY(-50%)",
          }}
        >
          <img src={leftarrow} alt="left" style={imageStyle} />
        </button>

        <button
          onTouchStart={() => handleButtonPress("down", true)}
          onTouchEnd={() => handleButtonPress("down", false)}
          onMouseDown={() => handleButtonPress("down", true)}
          onMouseUp={() => handleButtonPress("down", false)}
          onMouseLeave={() => handleButtonPress("down", false)}
          style={{
            ...buttonStyle(activeButtons.down),
            bottom: "0px",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          <img src={downarrow} alt="down" style={imageStyle} />
        </button>

        <button
          onTouchStart={() => handleButtonPress("right", true)}
          onTouchEnd={() => handleButtonPress("right", false)}
          onMouseDown={() => handleButtonPress("right", true)}
          onMouseUp={() => handleButtonPress("right", false)}
          onMouseLeave={() => handleButtonPress("right", false)}
          style={{
            ...buttonStyle(activeButtons.right),
            right: "0px",
            top: "50%",
            transform: "translateY(-50%)",
          }}
        >
          <img src={rightarrow} alt="right" style={imageStyle} />
        </button>
      </div>
    </div>
  );
}
