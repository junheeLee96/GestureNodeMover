import React, { useEffect, useRef } from "react";

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
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  //   const initialPinchDistanceRef = useRef(null);
  //   const childrenRef = useRef(null);
  const imgStore = useRef<any>({});
  const drawRectangle = ({ child }: any) => {
    // console.log(child);
    if (!ctxRef.current) return;
    const { x, y, width, height } = child.absoluteBoundingBox;
    ctxRef.current.fillStyle = "red";
    ctxRef.current.fillRect(x, y, width, height);
  };

  const drawFigure = (child: any) => {
    if (!ctxRef.current) return;
    ctxRef.current.beginPath();

    const { type } = child;
    switch (type) {
      case "RECTANGLE":
        drawRectangle({ child });
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

    console.log(cameraOffsetRef.current.x, cameraOffsetRef.current.y);

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
