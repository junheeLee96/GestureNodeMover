import React, { useRef, useEffect, useState } from "react";
import { Stage, Container } from "@pixi/react";
import Child from "./Child";
import * as PIXI from "pixi.js";

const Pixi = ({ data, imgsData, dataObj, dataSet }: any) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<PIXI.Container<PIXI.DisplayObject>>(null);

  const [updatedData, setUpdatedData] = useState(data);
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
  const handleNodeDragStart = (child: any, event: any) => {
    console.log(dataObj[dataSet[child.id]]);
    draggingNodeRef.current = dataObj[dataSet[child.id]];
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
    };

    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener("wheel", handleWheel, { passive: false });
    }

    return () => {
      if (canvas) {
        canvas.removeEventListener("wheel", handleWheel);
      }
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
        </Container>
      </Stage>
    </div>
  );
};

export default Pixi;
