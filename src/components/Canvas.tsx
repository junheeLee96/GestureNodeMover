import { Paint, Rectangle } from "figma-api";
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
  const imgStore = useRef<any>({});

  const drawStroke = (
    info: Paint,
    absoluteBoundingBox: Rectangle,
    strokeWeight: number
  ) => {
    if (!ctxRef.current) return;
    // const { width, height, x, y } = absoluteBoundingBox;
    const { r, g, b, a }: any = info;
    ctxRef.current.fillStyle = `rgba(${r * 255},${g * 255},${b * 255},${a})`;
    ctxRef.current.lineWidth = strokeWeight;
    ctxRef.current.stroke();
    //   ctxRef.current.
  };

  const drawImage = (child: any) => {
    if (!ctxRef.current) return;
    const imageRef = child.fills[0].imageRef;
    const { x, y, width, height } = child.absoluteBoundingBox;

    if (imgStore.current.hasOwnProperty(imageRef)) {
      const img = imgStore.current[imageRef];
      ctxRef.current.drawImage(img, x, y, width, height);
    } else {
      const img = new Image();
      img.src = imgsData[child.fills[0].imageRef];
      imgStore.current[imageRef] = img;
      img.onload = () => {
        if (ctxRef.current) {
          ctxRef.current.drawImage(img, x, y, width, height);
        }
      };
    }
  };

  const drawRectangle = ({ child }: any) => {
    // console.log(child);
    //   child.rectangleCornerRadii = [6,0,6,6]
    //   strokes []

    if (!ctxRef.current) return;
    const { x, y, width, height } = child.absoluteBoundingBox;
    //   const
    if (child.fills.length > 0) {
      if (child.fills[0].color) {
        ctxRef.current.fillStyle = `rgba(${child.fills[0].color.r * 255}, ${
          child.fills[0].color.g * 255
        }, ${child.fills[0].color.b * 255},${child.fills[0].color.a})`;
      }
      if (child.fills[0].gradientHandlePositions) {
      }
    }
    if (child.rectangleCornerRadii) {
      ctxRef.current.roundRect(x, y, width, height, child.rectangleCornerRadii);
    } else if (child.cornerRadius) {
      ctxRef.current.roundRect(x, y, width, height, [child.cornerRadius]);
    } else if (child.fills[0].imageRef) {
      drawImage(child);
    } else {
      ctxRef.current.fillRect(x, y, width, height);
    }
    if (child.strokes.length > 0) {
      //   console.log(child);
      child.strokes.forEach((stroke: any) =>
        drawStroke(stroke, child.absoluteBoundingBox, child.strokeWeight)
      );
    }
  };

  const drawFigure = (child: any) => {
    if (!ctxRef.current) return;
    ctxRef.current.closePath();
    ctxRef.current.beginPath();
    // if(child.)
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
