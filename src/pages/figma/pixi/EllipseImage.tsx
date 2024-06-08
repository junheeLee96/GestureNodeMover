// EllipseImage.js
import React, { useRef, useEffect, useState } from "react";
import { Sprite, Graphics } from "@pixi/react";
import * as PIXI from "pixi.js";

const EllipseImage = ({ imageUrl, x, y, width, height }: any) => {
  const [texture, setTexture] = useState<any>(null);
  const spriteRef = useRef<any>(null);
  const maskRef = useRef<any>(null);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous"; // crossOrigin 속성 설정
    img.src = imageUrl;
    img.onload = () => {
      const texture = PIXI.Texture.from(img);
      setTexture(texture);
    };
  }, [imageUrl]);

  useEffect(() => {
    if (spriteRef.current && maskRef.current && texture) {
      spriteRef.current.mask = maskRef.current;

      const textureRatio = texture.width / texture.height;
      const ellipseRatio = width / height;

      let scale = 1;
      if (textureRatio > ellipseRatio) {
        scale = height / texture.height;
      } else {
        scale = width / texture.width;
      }

      spriteRef.current.scale.set(scale);
      spriteRef.current.x = x + width / 2;
      spriteRef.current.y = y + height / 2;
      spriteRef.current.anchor.set(0.5, 0.5);
    }
  }, [texture, x, y]);

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
      {texture && (
        <Sprite
          ref={spriteRef}
          texture={texture}
          anchor={0.5}
          x={x + width / 2}
          y={y + height / 2}
        />
      )}
    </>
  );
};

export default EllipseImage;
