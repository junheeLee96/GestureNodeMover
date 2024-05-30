import { Paint } from "figma-api";

export const drawRectangle = ({ child, ctx, imgStore, imgsData }: any) => {
  // console.log(child);
  //   child.rectangleCornerRadii = [6,0,6,6]
  //   strokes []

  if (!ctx || !child.absoluteRenderBounds) return;

  const obj: any = {};
  Object.keys(child).forEach((key) => {
    if (key !== "children") {
      obj[key] = child[key];
    }
  });
  console.log(obj, JSON.stringify(obj));
  const { x, y, width, height } = child.absoluteRenderBounds;
  //   const
  if (child.fills.length > 0 && child.fills[0].color) {
    ctx.fillStyle = `rgba(${child.fills[0].color.r * 255}, ${
      child.fills[0].color.g * 255
    }, ${child.fills[0].color.b * 255},${child.fills[0].color.a})`;
  }

  if (child.rotation) {
    // console.log()
    ctx.save(); // 현재 상태 저장
    ctx.translate(x + width / 2, y + height / 2); // 회전 중심으로 이동
    ctx.rotate((child.rotation * Math.PI) / 180); // 회전
    ctx.translate(-(x + width / 2), -(y + height / 2));
  }

  if (child.rectangleCornerRadii) {
    ctx.roundRect(x, y, width, height, child.rectangleCornerRadii);
    if (child.fills.length > 0 && child.fills[0].color) ctx.fill();
  } else if (child.cornerRadius) {
    ctx.roundRect(x, y, width, height, [child.cornerRadius]);
    if (child.fills.length > 0 && child.fills[0].color) ctx.fill();
  } else {
    ctx.fillRect(x, y, width, height);
  }

  if (child.strokes && child.strokes.length > 0) {
    child.strokes.forEach((stroke: any) =>
      drawStroke(stroke, child.strokeWeight, ctx)
    );
  }

  if (child.fills.length > 0 && child.fills[0].imageRef) {
    drawImage(child, ctx, imgStore, imgsData, "rect");
  }
  if (child.rotation) {
    ctx.restore();
  }
};

const drawRectImage = ({ ctx, child, imgStore, imageRef, imgsData }: any) => {
  if (!ctx || !child.absoluteRenderBounds) return;
  const { x, y, width, height } = child.absoluteRenderBounds;
  if (imgStore.hasOwnProperty(imageRef)) {
    const img = imgStore[imageRef];
    ctx.drawImage(img, x, y, width, height);
  } else {
    const img = new Image();
    img.src = imgsData[imageRef];
    imgStore[imageRef] = img;
    img.onload = () => {
      if (ctx) {
        ctx.drawImage(img, x, y, width, height);
      }
    };
  }
};

const drawArcImage = ({
  ctx,
  centerX,
  centerY,
  radiusX,
  radiusY,
  width,
  height,
  img,
}: any) => {
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
  ctx.clip();

  // 이미지를 원 안에 맞춰 비율을 유지하면서 꽉 채우기
  const imgAspectRatio = img.width / img.height;
  const ellipseAspectRatio = width / height;

  let drawWidth, drawHeight;
  let offsetX, offsetY;

  if (imgAspectRatio > ellipseAspectRatio) {
    // 이미지가 더 넓은 경우, 높이를 기준으로 맞춤
    drawHeight = height;
    drawWidth = drawHeight * imgAspectRatio;
    offsetX = (drawWidth - width) / 2;
    offsetY = 0;
  } else {
    // 이미지가 더 높은 경우, 너비를 기준으로 맞춤
    drawWidth = width;
    drawHeight = drawWidth / imgAspectRatio;
    offsetX = 0;
    offsetY = (drawHeight - height) / 2;
  }

  // drawImage로 이미지 비율을 유지하면서 원을 꽉 채우기
  ctx.drawImage(
    img,
    centerX - radiusX - offsetX,
    centerY - radiusY - offsetY,
    drawWidth,
    drawHeight
  );

  ctx.restore();

  // 선택적으로 원의 테두리 그리기
  ctx.beginPath();
  ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
  ctx.strokeStyle = "black";
  ctx.lineWidth = 2;
  ctx.stroke();
};

export const drawImage = (
  child: any,
  ctx: any,
  imgStore: any,
  imgsData: any,
  figure?: string
) => {
  if (!ctx || !child.absoluteRenderBounds) return;
  const imageRef = child.fills[0].imageRef;

  if (figure === "rect") {
    drawRectImage({ ctx, child, imgStore, imageRef, imgsData });
  } else if (figure === "arc") {
    const { x, y, width, height } = child.absoluteRenderBounds;

    const radiusX = width / 2;
    const radiusY = height / 2;
    const centerX = x + radiusX;
    const centerY = y + radiusY;
    // return;
    const obj = { ...imgStore.current };
    const img = obj[child.fills[0].imageRef];
    if (obj.hasOwnProperty(child.fills[0].imageRef)) {
      // 원형 클리핑 경로 설정
      // arcImg({ ctx, centerX, centerY, radiusX, radiusY, width, height, img });
      drawArcImage({
        ctx,
        centerX,
        centerY,
        radiusX,
        radiusY,
        width,
        height,
        img,
      });
    } else {
      const img = new Image();
      const url = imgsData[child.fills[0].imageRef];
      img.src = url;
      imgStore.current = {
        ...imgStore.current,
        [child.fills[0].imageRef]: img,
      };
      img.onload = () => {
        drawArcImage({
          ctx,
          centerX,
          centerY,
          radiusX,
          radiusY,
          width,
          height,
          img,
        });
      };
    }
  }
};

export const drawStroke = (info: Paint, strokeWeight: number, ctx: any) => {
  if (!ctx) return;

  // const { width, height, x, y } = absoluteRenderBounds;
  const { r, g, b, a }: any = info;
  ctx.fillStyle = `rgba(${r * 255},${g * 255},${b * 255},${a})`;
  ctx.lineWidth = strokeWeight;
  ctx.stroke();
};

export const drawText = ({ child, ctx }: any) => {
  if (!ctx || !child.absoluteRenderBounds) return;
  let { x, y, width } = child.absoluteRenderBounds;

  // let text = child.characters;
  // 텍스트 스타일 설정
  const fontSize = child.style.fontSize;
  const fontFamily = child.style.fontFamily;
  const fontWeight = child.style.fontWeight;
  const lineHeight = child.style.lineHeightPx;
  const textColor = child.fills[0].color;
  const textColorRgba = `rgba(${textColor.r * 255}, ${textColor.g * 255}, ${
    textColor.b * 255
  }, ${textColor.a})`;

  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  ctx.fillStyle = textColorRgba;

  // const { x, y, width, height } = child.absoluteBoundingBox;

  let text = child.characters;

  const words = text.split("");
  let line = "";
  const lines = [];

  switch (child.style.textCase) {
    case "UPPER":
      text = text.toUpperCase();
      break;

    case "LOWER":
      text = text.toLowerCase();
      break;
    default:
      break;
  }

  words.forEach((word: any, index: any) => {
    const testLine = line + word;
    const testWidth = ctx.measureText(testLine).width;
    if (testWidth > width && index > 0) {
      lines.push(line);
      line = word + " ";
    } else {
      line = testLine;
    }
  });
  lines.push(line);

  // 텍스트 그리기
  let yOffset = y + fontSize;
  lines.forEach((line) => {
    ctx.fillText(line.trim(), x, yOffset);
    yOffset += lineHeight;
  });
};

export const drawEllipse = ({ child, ctx, imgStore, imgsData }: any) => {
  if (!ctx || !child.absoluteRenderBounds) return;
  if (child.fills.length > 0 && child.fills[0].imageRef) {
    drawImage(child, ctx, imgStore, imgsData, "arc");
  } else {
    if (child.fills.length <= 0) {
      return;
    }
    const { arcData } = child;
    const { r, g, b, a } = child.fills[0].color;
    ctx.fillStyle = `rgba(${Math.round(r * 255)}, ${Math.round(
      g * 255
    )}, ${Math.round(b * 255)},${a})`;
    const x =
      child.absoluteRenderBounds !== null
        ? child.absoluteRenderBounds.x
        : child.absoluteBoundingBox.x;
    const y =
      child.absoluteRenderBounds !== null
        ? child.absoluteRenderBounds.y
        : child.absoluteBoundingBox.y;
    const width =
      child.absoluteRenderBounds !== null
        ? child.absoluteRenderBounds.width
        : child.absoluteBoundingBox.width;
    const height =
      child.absoluteRenderBounds !== null
        ? child.absoluteRenderBounds.height
        : child.absoluteBoundingBox.height;
    ctx.arc(
      x + width,
      y + height / 2,
      width / 2,
      arcData.startingAngle,
      arcData.endingAngle
    );
    ctx.fill();
  }
};

export const drawVector = ({ child, ctx, imgStore, imgsData }: any) => {
  const { x, y, width, height } = child.absoluteBoundingBox;

  // 벡터 노드의 색상
  if (child.fills.length > 0 && child.fills[0].color) {
    const fillColor = child.fills[0].color;
    const rgbaColor = `rgba(${fillColor.r * 255}, ${fillColor.g * 255}, ${
      fillColor.b * 255
    }, ${fillColor.a})`;
    // 사각형 그리기
    ctx.fillStyle = rgbaColor;
  }
  ctx.fillRect(x, y, width, height);
};
