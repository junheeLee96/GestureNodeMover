import { Container, Graphics } from "@pixi/react";
import { GetFileResult } from "figma-api/lib/api-types";
import React, { useRef } from "react";
import * as PIXI from "pixi.js";

const Child = ({ child }: { child: any }) => {
  const ref = useRef<PIXI.Container<PIXI.DisplayObject>>(null);
  const { x, y, width, height } = child.absoluteBoundingBox;
  const drawSquare = (g: PIXI.Graphics) => {
    g.clear();
    g.beginFill(0xde3249);
    g.drawRect(x, y, width, height);
    g.endFill();
  };
  if (child.type === "FRAME") {
    return (
      <Container ref={ref}>
        <Graphics
          draw={drawSquare}
          x={window.innerWidth / 2}
          y={window.innerHeight / 2}
        />
      </Container>
    );
  }
  return null;
};

export default Child;
