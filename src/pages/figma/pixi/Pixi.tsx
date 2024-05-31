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
  const [isDragging, setIsDragging] = useState(false);
  const draggingRef = useRef<any>({
    x: 0,
    y: 0,
  });

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (!viewportRef.current) return;
      if (e.ctrlKey) {
        const zoomFactor = 1 + e.deltaY * -0.005;
        viewportRef.current.scale.x *= zoomFactor;
        viewportRef.current.scale.y *= zoomFactor;
      } else {
        console.log(
          viewportRef.current.position.x,
          viewportRef.current.position.y
        );
        viewportRef.current.position.x -= e.deltaX;
        viewportRef.current.position.y -= e.deltaY;
      }
      // if (viewportRef.current) {
      //   e.preventDefault();
      //   const zoomFactor = 1 + e.deltaY * -0.001;
      //   viewportRef.current.scale.x *= zoomFactor;
      //   viewportRef.current.scale.y *= zoomFactor;
      // }
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (viewportRef.current) {
        setIsDragging(true);
        // setDragStart({
        //   x: e.clientX - viewportRef.current.position.x,
        //   y: e.clientY - viewportRef.current.position.y,
        // });
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      // if (isDragging && viewportRef.current) {
      //   viewportRef.current.position.set(
      //     e.clientX - dragStart.x,
      //     e.clientY - dragStart.y
      //   );
      // }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener("wheel", handleWheel, { passive: false });
      // canvas.addEventListener("mousedown", handleMouseDown);
      // canvas.addEventListener("mousemove", handleMouseMove);
      // canvas.addEventListener("mouseup", handleMouseUp);
      // canvas.addEventListener("mouseleave", handleMouseUp);
    }

    return () => {
      if (canvas) {
        canvas.removeEventListener("wheel", handleWheel);
        // canvas.removeEventListener("mousedown", handleMouseDown);
        // canvas.removeEventListener("mousemove", handleMouseMove);
        // canvas.removeEventListener("mouseup", handleMouseUp);
        // canvas.removeEventListener("mouseleave", handleMouseUp);
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
