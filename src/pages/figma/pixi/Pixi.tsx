import React, { useRef, useEffect, useState } from "react";
import * as PIXI from "pixi.js";
import { Stage, Container, Graphics } from "@pixi/react";
const Pixi = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<PIXI.Container<PIXI.DisplayObject>>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (viewportRef.current) {
        e.preventDefault();
        const zoomFactor = 1 + e.deltaY * -0.001;
        viewportRef.current.scale.x *= zoomFactor;
        viewportRef.current.scale.y *= zoomFactor;
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (viewportRef.current) {
        setIsDragging(true);
        setDragStart({
          x: e.clientX - viewportRef.current.position.x,
          y: e.clientY - viewportRef.current.position.y,
        });
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && viewportRef.current) {
        viewportRef.current.position.set(
          e.clientX - dragStart.x,
          e.clientY - dragStart.y
        );
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener("wheel", handleWheel, { passive: false });
      canvas.addEventListener("mousedown", handleMouseDown);
      canvas.addEventListener("mousemove", handleMouseMove);
      canvas.addEventListener("mouseup", handleMouseUp);
      canvas.addEventListener("mouseleave", handleMouseUp);
    }

    return () => {
      if (canvas) {
        canvas.removeEventListener("wheel", handleWheel);
        canvas.removeEventListener("mousedown", handleMouseDown);
        canvas.removeEventListener("mousemove", handleMouseMove);
        canvas.removeEventListener("mouseup", handleMouseUp);
        canvas.removeEventListener("mouseleave", handleMouseUp);
      }
    };
  }, [isDragging, dragStart]);

  const drawSquare = (g: PIXI.Graphics) => {
    g.clear();
    g.beginFill(0xde3249);
    g.drawRect(0, 0, 100, 100);
    g.endFill();
  };

  return (
    <div ref={canvasRef} style={{ width: "100vw", height: "100vh" }}>
      <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        options={{ backgroundColor: 0x1099bb }}
      >
        <Container ref={viewportRef}>
          <Graphics
            draw={drawSquare}
            x={window.innerWidth / 2}
            y={window.innerHeight / 2}
          />
        </Container>
      </Stage>
    </div>
  );
};

export default Pixi;
