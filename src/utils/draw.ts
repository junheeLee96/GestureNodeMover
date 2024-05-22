import { Paint } from "figma-api";

export const drawRectangle = ({ child, ctx, imgStore, imgsData }: any) => {
  // console.log(child);
  //   child.rectangleCornerRadii = [6,0,6,6]
  //   strokes []

  if (!ctx) return;
  const { x, y, width, height } = child.absoluteBoundingBox;
  //   const
  if (child.fills.length > 0 && child.fills[0].color) {
    ctx.fillStyle = `rgba(${child.fills[0].color.r * 255}, ${
      child.fills[0].color.g * 255
    }, ${child.fills[0].color.b * 255},${child.fills[0].color.a})`;
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
};

const drawRectImage = ({ ctx, child, imgStore, imageRef, imgsData }: any) => {
  const { x, y, width, height } = child.absoluteBoundingBox;
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
  if (!ctx) return;
  const imageRef = child.fills[0].imageRef;

  if (figure === "rect") {
    drawRectImage({ ctx, child, imgStore, imageRef, imgsData });
  } else if (figure === "arc") {
    const { x, y, width, height } = child.absoluteBoundingBox;

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

  // const { width, height, x, y } = absoluteBoundingBox;
  const { r, g, b, a }: any = info;
  ctx.fillStyle = `rgba(${r * 255},${g * 255},${b * 255},${a})`;
  ctx.lineWidth = strokeWeight;
  ctx.stroke();
};

export const drawText = ({ child, ctx, imgStore, imgsData }: any) => {
  let { x, y } = child.absoluteBoundingBox;
  const { r, g, b, a } = child.fills[0].color;
  ctx.fillStyle = `rgba(${Math.round(r * 255)}, ${Math.round(
    g * 255
  )}, ${Math.round(b * 255)},${a})`;
  const { style } = child;
  let text = child.characters;

  switch (style.textCase) {
    case "UPPER":
      text = text.toUpperCase();
      break;

    case "LOWER":
      text = text.toLowerCase();
      break;
    default:
      break;
  }

  switch (style.textAlignHorizontal) {
    case "LEFT":
      break;

    case "RIGHT":
      break;

    case "CENTER":
      break;

    case "JUSTIFIED":
      break;

    default:
      break;
  }

  if (style.lineHeightPx && style.lineHeightPx > 0) {
    y += style.lineHeightPx;
  }
  ctx.font = `${style.fontWeight} ${style.fontSize}px ${style.fontFamily}`;
  ctx.fillText(text, x, y);
};

export const drawEllipse = ({ child, ctx, imgStore, imgsData }: any) => {
  if (child.fills.length > 0 && child.fills[0].imageRef) {
    drawImage(child, ctx, imgStore, imgsData, "arc");
  }
};
