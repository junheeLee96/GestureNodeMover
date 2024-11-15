import { Paint, Rectangle } from "figma-api";
import React, { useEffect, useRef } from "react";
// import // drawEllipse,
// // drawRectangle,
// // drawText,
// // drawVector,
// "../utils/draw";

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
    return;

    // if (!ctxRef.current) return;
    // ctxRef.current.closePath();
    // ctxRef.current.beginPath();

    // if (!child.absoluteRenderBounds) {
    //   return;
    // }
    // const { type } = child;
    // switch (type) {
    //   case "RECTANGLE":
    //     drawRectangle({
    //       child,
    //       ctx: ctxRef.current,
    //       imgStore: imgStore.current,
    //       imgsData: imgsData,
    //     });
    //     break;

    //   case "TEXT":
    //     drawText({
    //       child,
    //       ctx: ctxRef.current,
    //       imgStore: imgStore.current,
    //       imgsData: imgsData,
    //     });
    //     break;

    //   case "FRAME":
    //     if (child.fills.length > 0 && child.fills[0].color) {
    //       const { x, y } = child.absoluteRenderBounds;
    //       ctxRef.current.fillStyle = "rgb(77,77,77)";
    //       ctxRef.current.fillText(child.name, x, y - 110);

    //       drawRectangle({
    //         child,
    //         ctx: ctxRef.current,
    //         imgStore: imgStore.current,
    //         imgsData: imgsData,
    //       });
    //     }
    //     break;

    //   case "ELLIPSE":
    //     drawEllipse({
    //       ctx: ctxRef.current,
    //       child,
    //       imgStore: imgStore.current,
    //       imgsData: imgsData,
    //     });
    //     break;

    //   case "GROUP":
    //     if (
    //       child.fills.length > 0 &&
    //       child.fills[0].color &&
    //       child.absoluteRenderBounds
    //     ) {
    //       drawRectangle({
    //         child,
    //         ctx: ctxRef.current,
    //         imgStore: imgStore.current,
    //         imgsData: imgsData,
    //       });
    //     }
    //     break;

    //   case "SECTION":
    //     if (child.fills.length > 0 && child.fills[0].color) {
    //       drawRectangle({
    //         child,
    //         ctx: ctxRef.current,
    //         imgStore: imgStore.current,
    //         imgsData: imgsData,
    //       });
    //     }
    //     break;

    //   case "VECTOR":
    //     break;

    //   default:
    //     break;
    // }
    // if (child.children && child.absoluteRenderBounds) {
    //   child.children.forEach(drawFigure);
    // }
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
    let arr = data.document;
    arr = arr.children[0];
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

    // drawStart();
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
        background: "yellowgreen",
        width: "100dvw",
        height: "100dvh",
        overflow: "hidden",
        position: "fixed",
      }}
    />
  );
};

export default Canvas;
