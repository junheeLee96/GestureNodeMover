import { Paint, Rectangle } from "figma-api";
import React, { useEffect, useRef } from "react";
import { drawEllipse, drawRectangle, drawText } from "../utils/draw";

const maxZoom = 5;
const minZoom = 0.01;
const scrollSensitivity = 5;
const zoomSensitivity = 0.001;

const Canvas = ({ data, imgsData }: any) => {
  const ref = useRef<null | HTMLCanvasElement>(null);
  const ctxRef = useRef<null | CanvasRenderingContext2D>(null);
  const cameraOffsetRef = useRef({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  });
  const cameraZoomRef = useRef<number>(0.1);
  //   const scroll_sensitivityRef = useRef<number>(0.0005);
  const isDraggingRef = useRef<boolean>(false);
  const lastZoomRef = useRef<number>(cameraZoomRef.current);
  const imgStore = useRef<any>({});

  const drawFigure = (child: any) => {
    if (!ctxRef.current) return;
    ctxRef.current.closePath();
    ctxRef.current.beginPath();
    if (child.name === "Keys" || child.name === "Lowercase") {
      console.log(child);
    }
    const { type } = child;
    switch (type) {
      case "RECTANGLE":
        drawRectangle({
          child,
          ctx: ctxRef.current,
          imgStore: imgStore.current,
          imgsData: imgsData,
        });
        break;

      case "TEXT":
        drawText({
          child,
          ctx: ctxRef.current,
          imgStore: imgStore.current,
          imgsData: imgsData,
        });
        break;

      case "FRAME":
        if (child.fills.length > 0 && child.fills[0].color) {
          drawRectangle({
            child,
            ctx: ctxRef.current,
            imgStore: imgStore.current,
            imgsData: imgsData,
          });
        }
        break;

      case "ELLIPSE":
        drawEllipse({
          ctx: ctxRef.current,
          child,
          imgStore: imgStore.current,
          imgsData: imgsData,
        });
        break;

      case "GROUP":
        if (child.fills.length > 0 && child.fills[0].color) {
          const { r, g, b, a } = child.fills[0].color;
          const { x, y, width, height } = child.absoluteBoundingBox;
          ctxRef.current.fillStyle = `rgba(${r * 255},${g * 255},${
            b * 255
          },${a})`;
          ctxRef.current.fillRect(x, y, width, height);
        }
        break;

      //   case "FRAME":
      //     drawFrame({ canvas: ref.current, ctx: ctxRef.current, child });
      //     return;

      //   case "STAR":
      //     return;
      //   case "ELLIPSE":
      //     drawEllipse({ ctx: ctxRef.current, child });
      //     return;
      //   case "TEXT":
      //     drawText({ ctx: ctxRef.current, child });
      //     return;
      //   case "INSTANCE":
      //     drawInstance({ ctx: ctxRef.current, child });
      //     return;
      //   case "VECTOR":
      //     drawVector({ ctx: ctxRef.current, child });
      //     return;
      //   case "BOOLEAN_OPERATION":
      //     drawBoolOper({ ctx: ctxRef.current, child });
      //     return;
      default:
        break;
    }
    if (child.children) {
      child.children.forEach(drawFigure);
    }
  };

  const drawStart = () => {
    if (!ref.current || !ctxRef.current) return;
    ref.current.width = window.innerWidth;
    ref.current.height = window.innerHeight;

    ctxRef.current.translate(window.innerWidth / 2, window.innerHeight / 2);
    ctxRef.current.scale(cameraZoomRef.current, cameraZoomRef.current);
    ctxRef.current.translate(
      -window.innerWidth / 2 + cameraOffsetRef.current.x,
      -window.innerHeight / 2 + cameraOffsetRef.current.y
    );

    ctxRef.current.clearRect(0, 0, window.innerWidth, window.innerHeight);
    const arr = data.document;
    arr.children.forEach(drawFigure);
    // requestAnimationFrame(drawStart);
  };
  const onScreenMove = (e: any) => {
    e.preventDefault();
    if (e.ctrlKey) {
      adjustZoom(-e.deltaY * zoomSensitivity, null);
    }
    cameraOffsetRef.current = {
      x: cameraOffsetRef.current.x - e.deltaX * scrollSensitivity,
      y: cameraOffsetRef.current.y - e.deltaY * scrollSensitivity,
    };

    drawStart();
  };

  const adjustZoom = (zoomAmount: any, zoomFactor: any) => {
    if (!isDraggingRef.current) {
      if (zoomAmount) {
        cameraZoomRef.current += zoomAmount;
      } else if (zoomFactor) {
        console.log(zoomFactor);
        cameraZoomRef.current = zoomFactor * lastZoomRef.current;
      }

      cameraZoomRef.current = Math.min(cameraZoomRef.current, maxZoom);
      cameraZoomRef.current = Math.max(cameraZoomRef.current, minZoom);
    }
  };

  useEffect(() => {
    if (!ref.current) return;
    const ctx = ref.current.getContext("2d");
    if (!ctx) return;
    ctxRef.current = ctx;
    console.log(window.navigator.platform);
    ctx.fillStyle = "red";
    ctx.fillRect(-500, -500, 500, 500);
    drawStart();

    ref.current.addEventListener("wheel", onScreenMove);
  }, []);

  return (
    <canvas
      ref={ref}
      style={{
        background: "#111",
        width: "100dvw",
        height: "100dvh",
        overflow: "hidden",
        position: "fixed",
      }}
    />
  );
};

export default Canvas;
