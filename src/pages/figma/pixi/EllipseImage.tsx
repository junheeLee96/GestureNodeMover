// EllipseImage.js
import React, { useRef, useEffect } from "react";
import { Sprite, Graphics } from "@pixi/react";
import * as PIXI from "pixi.js";

const EllipseImage = ({ imageUrl, x, y, width, height }: any) => {
  const spriteRef = useRef<any>(null);
  const maskRef = useRef<any>(null);

  useEffect(() => {
    if (spriteRef.current && maskRef.current) {
      spriteRef.current.mask = maskRef.current;

      const texture = PIXI.Texture.from(imageUrl);
      const textureRatio = texture.width / texture.height;
      const ellipseRatio = width / height;

      let scale = 1;
      if (textureRatio > ellipseRatio) {
        scale = height / texture.height;
      } else {
        scale = width / texture.width;
      }

      spriteRef.current.texture = texture;
      spriteRef.current.scale.set(scale);
      spriteRef.current.x = x + width / 2;
      spriteRef.current.y = y + height / 2;
      spriteRef.current.anchor.set(0.5, 0.5);
    }
  }, [imageUrl, x, y, width, height]);

  return (
    <>
      <Graphics
        ref={maskRef}
        draw={(g) => {
          g.clear();
          g.beginFill(0xffffff);
          g.drawEllipse(x + width / 2, y + height / 2, width / 2, height / 2);
          g.endFill();
        }}
      />
      <Sprite
        ref={spriteRef}
        image={imageUrl}
        anchor={0.5}
        x={x + width / 2}
        y={y + height / 2}
      />
    </>
  );
};

export default EllipseImage;
