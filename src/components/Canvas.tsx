import React, { useEffect, useRef } from "react";

const maxZoom = 5;
const minZoom = 0.01;
const scrollSensitivity = 5;
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
  const lastZoomRef = useRef<number | null>(cameraZoomRef.current);
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

    // if (child.name === "Wifi") {
    //   console.log(child);
    // }

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
  const getEventLocation = (e: any): any => {
    if (e.touches && e.touches.length == 1) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else if (e.clientX && e.clientY) {
      return { x: e.clientX, y: e.clientY };
    }
  };
  const onScreenMove = (e: any) => {
    e.preventDefault();
    cameraOffsetRef.current = {
      x: cameraOffsetRef.current.x - e.deltaX * scrollSensitivity,
      y: cameraOffsetRef.current.y - e.deltaY * scrollSensitivity,
    };

    console.log(cameraOffsetRef.current.x, cameraOffsetRef.current.y);
    // const x: any =
    //   getEventLocation(e).x / cameraZoomRef.current - cameraOffsetRef.current.x;
    // const y: any =
    //   getEventLocation(e).y / cameraZoomRef.current - cameraOffsetRef.current.y;
    // dragStartRef.current = {
    //   x,
    //   y,
    // };
    // console.log(x, y);
    // cameraOffsetRef.current.x =
    //   getEventLocation(e).x / cameraZoomRef.current - x;
    // cameraOffsetRef.current.y =
    //   getEventLocation(e).y / cameraZoomRef.current - y;
    // lastZoomRef.current = cameraZoomRef.current;
    // console.log(e);
    // drawStart();
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
    requestAnimationFrame(drawStart);
  };
  const onPointerDown = (e: any) => {
    isDraggingRef.current = true;
    const x =
      getEventLocation(e).x / cameraZoomRef.current - cameraOffsetRef.current.x;
    const y =
      getEventLocation(e).y / cameraZoomRef.current - cameraOffsetRef.current.y;
    dragStartRef.current = {
      x,
      y,
    };
  };

  const onPointerMove = (e: any) => {
    if (isDraggingRef.current) {
      cameraOffsetRef.current.x =
        getEventLocation(e).x / cameraZoomRef.current - dragStartRef.current.x;
      cameraOffsetRef.current.y =
        getEventLocation(e).y / cameraZoomRef.current - dragStartRef.current.y;
    }
  };

  const onPointerUp = () => {
    isDraggingRef.current = false;
    // initialPinchDistanceRef.current = null;
    lastZoomRef.current = cameraZoomRef.current;
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
    ref.current.addEventListener("mousedown", onPointerDown);
    ref.current.addEventListener("mousemove", onPointerMove);
    ref.current.addEventListener("mouseup", onPointerUp);
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
