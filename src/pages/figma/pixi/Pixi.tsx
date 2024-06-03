import React, {
  useRef,
  useEffect,
  useState,
  createContext,
  useContext,
} from "react";
import * as PIXI from "pixi.js";
import { Stage, Container, Graphics } from "@pixi/react";
import Child from "./Child";
import { ImgsDataCtx } from "../Figma";

interface DrawFigureContextType {
  drawFigure: (g: PIXI.Graphics, child: any) => void;
}

// 기본 값을 null로 설정
export const drawFigureCtx = createContext<DrawFigureContextType | null>(null);

const Pixi = ({ data, imgsData }: any) => {
  const canvasRef = useRef<HTMLDivElement>(null);

  const viewportRef = useRef<PIXI.Container<PIXI.DisplayObject>>(null);

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

  const drawSquare = (g: PIXI.Graphics) => {
    g.clear();
    g.beginFill(0xde3249);
    g.drawRect(0, 0, 100, 100);
    g.endFill();
  };
  const drawSquare2 = (g: PIXI.Graphics) => {
    g.clear();
    g.beginFill("red");
    g.drawRect(100, 100, 100, 100);
    g.endFill();
  };

  return (
    <div ref={canvasRef} style={{ width: "100vw", height: "100vh" }}>
      <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        options={{
          backgroundColor: data.backgroundColor
            ? `rgba(${data.backgroundColor.r * 255} ,${
                data.backgroundColor.g * 255
              } ,${data.backgroundColor.b * 255} ,${data.backgroundColor.a})`
            : "#FFFF",
        }}
      >
        <Container ref={viewportRef}>
          {data.children.map((child: any, idx: number) => (
            <Child
              child={child}
              key={idx}
              imgsData={imgsData}
              backgroundColor={`rgba(${data.backgroundColor.r * 255} ,${
                data.backgroundColor.g * 255
              } ,${data.backgroundColor.b * 255} ,${data.backgroundColor.a})`}
            />
          ))}
        </Container>
      </Stage>
    </div>
  );
};

export default Pixi;
