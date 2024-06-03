import React, { useRef } from "react";
import { Container, Graphics, Text, Sprite } from "@pixi/react";
import * as PIXI from "pixi.js";
import EllipseImage from "./EllipseImage"; // 새로운 컴포넌트 경로에 맞게 수정

const FigmaTypes = [
  "FRAME",
  "GROUP",
  "VECTOR",
  "TEXT",
  "RECTANGLE",
  "ELLIPSE",
  "IMAGE",
];

const Child = ({ child, imgsData }: any) => {
  const ref = useRef(null);

  const drawGraphics = (g: any, child: any) => {
    const { absoluteRenderBounds, fills, type } = child;
    if (type === "RECTANGLE" || type === "FRAME") {
      drawRectangle(g, absoluteRenderBounds, fills);
    } else if (type === "ELLIPSE") {
      drawEllipse(g, absoluteRenderBounds, fills);
    } else if (type === "VECTOR") {
      // Implement custom drawing for vector graphics
    }
  };

  const drawRectangle = (g: any, bounds: any, fills: any) => {
    if (fills.length === 0 || !fills[0].color) return;
    const color = fills[0].color;
    g.clear();
    g.beginFill(PIXI.utils.rgb2hex([color.r, color.g, color.b]), color.a);
    g.drawRect(bounds.x, bounds.y, bounds.width, bounds.height);
    g.endFill();
  };

  const drawEllipse = (g: any, bounds: any, fills: any) => {
    if (fills.length === 0 || !fills[0].color) return;
    const color = fills[0].color;
    g.clear();
    g.beginFill(PIXI.utils.rgb2hex([color.r, color.g, color.b]), color.a);
    g.drawEllipse(
      bounds.x + bounds.width / 2,
      bounds.y + bounds.height / 2,
      bounds.width / 2,
      bounds.height / 2
    );
    g.endFill();
  };

  const renderChild = (child: any) => {
    const { type, absoluteRenderBounds, fills, style } = child;

    const color =
      fills.length === 0 || !fills[0].color
        ? "black"
        : `rgba(${fills[0].color.r * 255}, ${fills[0].color.g * 255}, ${
            fills[0].color.b * 255
          }, ${fills[0].color.a})`;

    if (type === "TEXT") {
      const textStyle = new PIXI.TextStyle({
        fontFamily: style.fontFamily,
        fontSize: style.fontSize,
        fontWeight: style.fontWeight,
        fill: color,
        letterSpacing: style.letterSpacing,
      });
      return (
        <Text
          text={child.characters}
          x={absoluteRenderBounds.x}
          y={absoluteRenderBounds.y}
          style={textStyle}
        />
      );
    } else if (fills && fills.length > 0 && fills[0].type === "IMAGE") {
      const imageUrl = imgsData[child.fills[0].imageRef];
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
      return <Graphics draw={(g) => drawGraphics(g, child)} />;
    }
  };

  if (FigmaTypes.includes(child.type)) {
    return (
      <Container ref={ref}>
        {renderChild(child)}
        {child.children &&
          child.children.map((child: any, idx: any) => (
            <Child key={idx} child={child} imgsData={imgsData} />
          ))}
      </Container>
    );
  }
  return null;
};

export default Child;
