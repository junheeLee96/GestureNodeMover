import { Container, Graphics } from "@pixi/react";
import { GetFileResult } from "figma-api/lib/api-types";
import React, {
  useRef,
  useEffect,
  useState,
  createContext,
  useContext,
} from "react";
import * as PIXI from "pixi.js";
import { drawFigureCtx } from "./Pixi";
import { userToken } from "../../../App";
import { ImgsDataCtx } from "../Figma";
import { drawGraphics } from "../../../utils/draw";

const Child = ({ child, imgsData, backgroundColor }: any) => {
  const contexts = useContext(ImgsDataCtx);
  if (child.name === "Rectangle 2") {
    console.log(child);
  }
  const ref = useRef<PIXI.Container<PIXI.DisplayObject>>(null);
  // const { x, y, width, height } = child.absoluteRenderBounds;
  const drawSquare = (g: PIXI.Graphics) => {
    // if (!child.absoluteRenderBounds) return null;
    drawGraphics(g, child, imgsData, backgroundColor);
    // if (!child.fills || child.fills.length === 0 || !child.fills[0].color)
    //   return;
    // const [red, blue, green, a] = [
    //   child.fills[0].color.r,
    //   child.fills[0].color.g,
    //   child.fills[0].color.b,
    //   child.fills[0].color.a,
    // ];
    // g.clear();
    // g.beginFill(`rgba(${red * 255}, ${green * 255}, ${blue * 255}, ${a})`);
    // if (child.cornerRadius) {
    //   g.drawRoundedRect(x, y, width, height, child.cornerRadius);
    // } else {
    //   g.drawRect(x, y, width, height);
    // }
    // g.endFill();
  };

  if (child.type === "FRAME" || child.type === "RECTANGLE") {
    return (
      <Container ref={ref}>
        <Graphics
          draw={drawSquare}
          x={window.innerWidth / 2}
          y={window.innerHeight / 2}
        />
        {child.children &&
          child.children.map((child: any, idx: any) => (
            <Child child={child} key={idx} />
          ))}
      </Container>
    );
  }
  return null;
};

export default Child;
