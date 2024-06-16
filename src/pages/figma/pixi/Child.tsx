import React, { useRef, useEffect } from "react";
import { Container, Graphics, Text, Sprite } from "@pixi/react";
import * as PIXI from "pixi.js";
import EllipseImage from "./EllipseImage"; // 새로운 컴포넌트 경로에 맞게 수정

const FigmaTypes = [
  "FRAME",
  "GROUP",
  "TEXT",
  "RECTANGLE",
  "ELLIPSE",
  "SECTION",
  "IMAGE",
  "INSTANCE",
  "VECTOR",
];

const Child = React.memo(({ child, imgsData, onDragStart }: any) => {
  const ref = useRef(null);
  const graphicsRef = useRef<any>(null);

  // 노드 드래그 시작 핸들러
  const handlePointerDown = (event: any) => {
    onDragStart(child, event);
  };

  useEffect(() => {
    if (graphicsRef.current) {
      const graphics = graphicsRef.current;
      graphics.interactive = true;
      graphics.buttonMode = true;
      graphics.on("pointerdown", handlePointerDown);
    }
  }, [child, onDragStart]);

  // 그래픽을 그리는 함수
  const drawGraphics = (g: any, child: any) => {
    if (!child || !child.absoluteRenderBounds) return;

    const { absoluteRenderBounds, fills, type, isHovered } = child;
    let opacity = 1;

    if (fills.length === 0 || !fills[0].color) {
      opacity = 0;
    } else if (fills[0].opacity !== undefined) {
      opacity = fills[0].opacity;
    }

    if (
      type === "RECTANGLE" ||
      type === "FRAME" ||
      type === "SECTION" ||
      type === "INSTANCE" ||
      type === "VECTOR"
    ) {
      if (child.cornerRadius) {
        drawRoundedRectangle(
          g,
          absoluteRenderBounds,
          fills,
          opacity,
          isHovered,
          child.cornerRadius
        );
      } else {
        drawRectangle(g, absoluteRenderBounds, fills, opacity, isHovered);
      }
    } else if (type === "ELLIPSE") {
      drawEllipse(g, absoluteRenderBounds, fills, opacity, isHovered);
    }
  };

  const drawRectangle = (
    g: any,
    bounds: any,
    fills: any,
    opacity: number,
    isHovered: boolean
  ) => {
    const color =
      fills.length > 0 && fills[0].color
        ? fills[0].color
        : { r: 0, g: 0, b: 0, a: 0 };
    g.clear();
    g.beginFill(
      PIXI.utils.rgb2hex([color.r, color.g, color.b]),
      color.a * opacity
    );
    g.drawRect(bounds.x, bounds.y, bounds.width, bounds.height);
    g.endFill();
    if (isHovered) {
      g.lineStyle(2, 0x800080); // 보라색 테두리
      g.drawRect(bounds.x, bounds.y, bounds.width, bounds.height);
    }
  };

  const drawRoundedRectangle = (
    g: any,
    bounds: any,
    fills: any,
    opacity: number,
    isHovered: boolean,
    cornerRadius: number
  ) => {
    const color =
      fills.length > 0 && fills[0].color
        ? fills[0].color
        : { r: 0, g: 0, b: 0, a: 0 };
    g.clear();
    g.beginFill(
      PIXI.utils.rgb2hex([color.r, color.g, color.b]),
      color.a * opacity
    );
    g.drawRoundedRect(
      bounds.x,
      bounds.y,
      bounds.width,
      bounds.height,
      cornerRadius
    );
    g.endFill();
    if (isHovered) {
      g.lineStyle(2, 0x800080); // 보라색 테두리
      g.drawRoundedRect(
        bounds.x,
        bounds.y,
        bounds.width,
        bounds.height,
        cornerRadius
      );
    }
  };

  const drawEllipse = (
    g: any,
    bounds: any,
    fills: any,
    opacity: number,
    isHovered: boolean
  ) => {
    const color =
      fills.length > 0 && fills[0].color
        ? fills[0].color
        : { r: 0, g: 0, b: 0, a: 0 };
    g.clear();
    g.beginFill(
      PIXI.utils.rgb2hex([color.r, color.g, color.b]),
      color.a * opacity
    );
    g.drawEllipse(
      bounds.x + bounds.width / 2,
      bounds.y + bounds.height / 2,
      bounds.width / 2,
      bounds.height / 2
    );
    g.endFill();
    if (isHovered) {
      g.lineStyle(2, 0x800080); // 보라색 테두리
      g.drawEllipse(
        bounds.x + bounds.width / 2,
        bounds.y + bounds.height / 2,
        bounds.width / 2,
        bounds.height / 2
      );
    }
  };

  const renderChild = (child: any) => {
    if (!child || !child.absoluteRenderBounds) return null;
    const { type, absoluteRenderBounds, fills, style } = child;
    let opacity = 1;

    if (fills.length === 0 || !fills[0].color) {
      opacity = 0;
    } else if (fills[0].opacity !== undefined) {
      opacity = fills[0].opacity;
    }

    const color =
      fills.length === 0 || !fills[0].color
        ? "black"
        : `rgba(${fills[0].color.r * 255}, ${fills[0].color.g * 255}, ${
            fills[0].color.b * 255
          }, ${fills[0].color.a * opacity})`;

    if (type === "TEXT") {
      const textStyle = new PIXI.TextStyle({
        fontFamily: style.fontFamily,
        fontSize: style.fontSize,
        fontWeight: style.fontWeight,
        fill: color,
        letterSpacing: style.letterSpacing,
        wordWrap: true,
        wordWrapWidth:
          absoluteRenderBounds.width || child.absoluteBoundingBox.width,
      });
      return (
        <Text
          text={child.characters}
          x={absoluteRenderBounds.x || child.absoluteBoundingBox.x}
          y={absoluteRenderBounds.y || child.absoluteBoundingBox.y}
          style={textStyle}
        />
      );
    } else if (fills && fills.length > 0 && fills[0].type === "IMAGE") {
      const imageUrl = imgsData[fills[0].imageRef];
      const { x, y, width, height } = absoluteRenderBounds;

      if (type === "ELLIPSE") {
        return (
          <EllipseImage
            imageUrl={imageUrl}
            x={x}
            y={y}
            width={width}
            height={height}
          />
        );
      } else {
        return (
          <Sprite image={imageUrl} x={x} y={y} width={width} height={height} />
        );
      }
    } else {
      return (
        <Graphics ref={graphicsRef} draw={(g) => drawGraphics(g, child)} />
      );
    }
  };

  if (FigmaTypes.includes(child.type)) {
    return (
      <Container ref={ref}>
        {renderChild(child)}
        {child.children &&
          child.children.map((child: any, idx: any) => (
            <Child
              key={idx}
              child={child}
              imgsData={imgsData}
              onDragStart={onDragStart}
            />
          ))}
      </Container>
    );
  }
  return null;
});

export default Child;
