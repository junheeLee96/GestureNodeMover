import React, { useRef, useEffect, useState } from "react";
import { Stage, Container, Graphics } from "@pixi/react";
import * as PIXI from "pixi.js";
import Child from "./Child";

const Pixi = ({ data, imgsData }: any) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<PIXI.Container<PIXI.DisplayObject>>(null);
  const [updatedData, setUpdatedData] = useState(data);
  const [virtualMousePosition, setVirtualMousePosition] = useState({
    x: 300,
    y: 300,
  }); // 가상 마우스 위치

  const draggingNodeRef = useRef<any>(null);
  const dragStartRef = useRef({ x: 0, y: 0 });

  const handleShapeMove = (dx: number, dy: number) => {
    if (!draggingNodeRef.current) return;

    const updateNodePosition = (node: any) => {
      if (!node || !node.absoluteRenderBounds) return;
      node.absoluteRenderBounds.x += dx;
      node.absoluteRenderBounds.y += dy;
      if (node.children) {
        node.children.forEach(updateNodePosition);
      }
    };

    const newData = { ...updatedData };
    const traverseAndUpdate = (nodes: any[]) => {
      nodes.forEach((node) => {
        if (node.id === draggingNodeRef.current.id) {
          updateNodePosition(node);
        } else if (node.children) {
          traverseAndUpdate(node.children);
        }
      });
    };

    traverseAndUpdate(newData.children);
    setUpdatedData(newData);
  };

  const handlePointerMove = (event: any) => {
    if (!draggingNodeRef.current) return;

    const dx = event.data.global.x - dragStartRef.current.x;
    const dy = event.data.global.y - dragStartRef.current.y;

    dragStartRef.current = { x: event.data.global.x, y: event.data.global.y };

    handleShapeMove(dx, dy);
  };

  const handlePointerUp = () => {
    draggingNodeRef.current = null;
  };

  const GestureEventListener = (e: any) => {
    const gestureData = e.detail;
    if (gestureData.gestures[0][0].categoryName === "move") {
      const landmark = gestureData.landmarks[0][8]; // 예: 집게 손가락 끝의 랜드마크
      const newVirtualMousePosition = {
        x: landmark.x * window.innerWidth,
        y: landmark.y * window.innerHeight,
      };
      setVirtualMousePosition(newVirtualMousePosition);
    }
  };

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (!viewportRef.current) return;

      if (e.ctrlKey) {
        const zoomFactor = 1 + e.deltaY * -0.005;
        viewportRef.current.scale.x *= zoomFactor;
        viewportRef.current.scale.y *= zoomFactor;
      } else {
        viewportRef.current.position.x -= e.deltaX;
        viewportRef.current.position.y -= e.deltaY;
      }

      // 가상의 마우스 위치 업데이트
      const newVirtualMousePosition = {
        x:
          (window.innerWidth / 2 - viewportRef.current.position.x) /
          viewportRef.current.scale.x,
        y:
          (window.innerHeight / 2 - viewportRef.current.position.y) /
          viewportRef.current.scale.y,
      };
      setVirtualMousePosition(newVirtualMousePosition);
    };

    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener("wheel", handleWheel, { passive: false });
    }

    window.addEventListener("gestured", GestureEventListener);
    return () => {
      if (canvas) {
        canvas.removeEventListener("wheel", handleWheel);
      }
      window.removeEventListener("gestured", GestureEventListener);
    };
  }, []);

  useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.interactive = true;
      viewportRef.current.on("pointermove", handlePointerMove);
      viewportRef.current.on("pointerup", handlePointerUp);
      viewportRef.current.on("pointerupoutside", handlePointerUp);
    }
  }, []);

  const handleNodeDragStart = (child: any, event: any) => {
    draggingNodeRef.current = findParentNode(child) || child;
    dragStartRef.current = { x: event.data.global.x, y: event.data.global.y };
  };

  const findParentNode = (node: any) => {
    let currentNode = node;
    while (currentNode.parent) {
      if (
        ["FRAME", "GROUP", "SECTION", "INSTANCE"].includes(
          currentNode.parent.type
        )
      ) {
        return currentNode.parent;
      }
      currentNode = currentNode.parent;
    }
    return null;
  };

  return (
    <div ref={canvasRef} style={{ width: "100vw", height: "100vh" }}>
      <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        options={{
          backgroundColor: data.backgroundColor
            ? `rgba(${data.backgroundColor.r * 255}, ${
                data.backgroundColor.g * 255
              }, ${data.backgroundColor.b * 255}, ${data.backgroundColor.a})`
            : "#FFFF",
        }}
      >
        <Container ref={viewportRef}>
          {updatedData.children.map((child: any, idx: number) => (
            <Child
              child={child}
              key={idx}
              imgsData={imgsData}
              onDragStart={handleNodeDragStart}
            />
          ))}
          <Graphics
            draw={(g) => {
              g.clear();
              g.lineStyle(
                2 / (viewportRef.current ? viewportRef.current.scale.x : 1),
                0xff0000
              ); // 스케일에 따라 선 두께 조정
              g.drawCircle(
                virtualMousePosition.x,
                virtualMousePosition.y,
                5 / (viewportRef.current ? viewportRef.current.scale.x : 1) // 스케일에 따라 반지름 조정
              );
            }}
          />
        </Container>
      </Stage>
    </div>
  );
};

export default Pixi;
