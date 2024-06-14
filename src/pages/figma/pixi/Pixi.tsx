import React, { useRef, useEffect, useState } from "react";
import { Stage, Container, Graphics } from "@pixi/react";
import * as PIXI from "pixi.js";
import Child from "./Child";

const Pixi = ({ data, imgsData, dataObj, dataSet }: any) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<PIXI.Container<PIXI.DisplayObject>>(null);
  const [updatedData, setUpdatedData] = useState(data);
  const virtualMousePositionRef = useRef({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  }); // 가상 마우스 위치
  const viewportOffsetRef = useRef({ x: 0, y: 0 });

  const draggingNodeRef = useRef<any>(null);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const virtualMouseGraphicsRef = useRef<PIXI.Graphics>(null);
  const selectedNodeRef = useRef<any>(null);
  const gestureStateRef = useRef<string>("");

  const handleShapeMove = (node: any, dx: number, dy: number) => {
    if (!node) return;

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
      nodes.forEach((childNode) => {
        if (childNode.id === node.id) {
          updateNodePosition(childNode);
        } else if (childNode.children) {
          traverseAndUpdate(childNode.children);
        }
      });
    };

    traverseAndUpdate(newData.children);
    setUpdatedData(newData);
  };

  const handlePointerMove = (event: any) => {
    if (!draggingNodeRef.current || !viewportRef.current) return;

    const dx = event.data.global.x - dragStartRef.current.x;
    const dy = event.data.global.y - dragStartRef.current.y;

    dragStartRef.current = { x: event.data.global.x, y: event.data.global.y };

    handleShapeMove(draggingNodeRef.current, dx, dy);
  };

  const handlePointerUp = () => {
    draggingNodeRef.current = null;
    selectedNodeRef.current = null;
  };

  const GestureEventListener = (e: any) => {
    const gestureData = e.detail;
    const landmark = gestureData.landmarks[0][8]; // 예: 집게 손가락 끝의 랜드마크
    const newVirtualMousePosition = {
      x: landmark.x * window.innerWidth,
      y: landmark.y * window.innerHeight,
    };

    if (gestureData.gestures[0][0].categoryName === "move") {
      virtualMousePositionRef.current = newVirtualMousePosition;
      gestureStateRef.current = "move";
      updateVirtualMouseGraphics(); // 가상 커서 위치 업데이트
    } else if (gestureData.gestures[0][0].categoryName === "pick") {
      if (!viewportRef.current) return;
      const pickedNode = findNodeAtPosition(
        (newVirtualMousePosition.x - viewportRef.current.position.x) /
          viewportRef.current.scale.x,
        (newVirtualMousePosition.y - viewportRef.current.position.y) /
          viewportRef.current.scale.y
      );
      if (pickedNode) {
        selectedNodeRef.current = pickedNode;
      }

      gestureStateRef.current = "pick";
    }

    if (gestureStateRef.current === "pick" && selectedNodeRef.current) {
      const dx = newVirtualMousePosition.x - virtualMousePositionRef.current.x;
      const dy = newVirtualMousePosition.y - virtualMousePositionRef.current.y;
      handleShapeMove(selectedNodeRef.current, dx, dy);
    }

    virtualMousePositionRef.current = newVirtualMousePosition;
    updateVirtualMouseGraphics(); // 가상 커서 위치 업데이트
  };

  const updateVirtualMouseGraphics = () => {
    if (!virtualMouseGraphicsRef.current || !viewportRef.current) return;
    const g = virtualMouseGraphicsRef.current;
    g.clear();
    g.lineStyle(2 / viewportRef.current.scale.x, 0xff0000); // 스케일에 따라 선 두께 조정
    g.drawCircle(
      (virtualMousePositionRef.current.x - viewportRef.current.position.x) /
        viewportRef.current.scale.x,
      (virtualMousePositionRef.current.y - viewportRef.current.position.y) /
        viewportRef.current.scale.y,
      5 / viewportRef.current.scale.x // 스케일에 따라 반지름 조정
    );
  };

  const findNodeAtPosition = (x: number, y: number) => {
    const checkNode = (node: any, parentX = 0, parentY = 0): any => {
      if (!node.absoluteRenderBounds) return null;
      const { x: nodeX, y: nodeY, width, height } = node.absoluteRenderBounds;
      const absoluteX = nodeX + parentX;
      const absoluteY = nodeY + parentY;

      if (
        x >= absoluteX &&
        x <= absoluteX + width &&
        y >= absoluteY &&
        y <= absoluteY + height
      ) {
        return node;
      }
      if (node.children) {
        for (let i = 0; i < node.children.length; i++) {
          const found = checkNode(node.children[i], absoluteX, absoluteY);
          if (found) return found;
        }
      }
      return null;
    };

    for (let i = 0; i < updatedData.children.length; i++) {
      const found = checkNode(updatedData.children[i]);
      if (found) return found;
    }
    return null;
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

      // 뷰포트 오프셋 업데이트
      viewportOffsetRef.current = {
        x: viewportRef.current.position.x,
        y: viewportRef.current.position.y,
      };

      updateVirtualMouseGraphics(); // 줌/이동 시 가상 커서 업데이트
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
          <Graphics ref={virtualMouseGraphicsRef} />
        </Container>
      </Stage>
    </div>
  );
};

export default Pixi;
