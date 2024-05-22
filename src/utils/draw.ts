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
    drawImage(child, ctx, imgStore, imgsData);
  }

  return;
  if (child.fills.length > 0) {
    if (child.fills[0].color) {
      ctx.fillStyle = `rgba(${child.fills[0].color.r * 255}, ${
        child.fills[0].color.g * 255
      }, ${child.fills[0].color.b * 255},${child.fills[0].color.a})`;
    }
    // if (child.fills[0].gradientHandlePositions) {
    //   const gradientHandles = child.fills[0].gradientHandlePositions;
    //   const gradientStops = child.fills[0].gradientStops;
    //   const gradient = ctx.createLinearGradient(
    //     x + gradientHandles[0].x * width,
    //     y + gradientHandles[0].y * height,
    //     x + gradientHandles[1].x * width,
    //     y + gradientHandles[1].y * height
    //   );

    //   gradientStops.forEach((stop: any) => {
    //     const color = stop.color;
    //     const rgbaColor = `rgba(${color.r * 255}, ${color.g * 255}, ${
    //       color.b * 255
    //     }, ${color.a})`;
    //     gradient.addColorStop(stop.position, rgbaColor);
    //   });

    //   if (child.cornerRadius) {
    //     const { cornerRadius } = child;
    //     ctx.beginPath();
    //     ctx.moveTo(x + cornerRadius, y);
    //     ctx.lineTo(x + width - cornerRadius, y);
    //     ctx.quadraticCurveTo(x + width, y, x + width, y + cornerRadius);
    //     ctx.lineTo(x + width, y + height - cornerRadius);
    //     ctx.quadraticCurveTo(
    //       x + width,
    //       y + height,
    //       x + width - cornerRadius,
    //       y + height
    //     );
    //     ctx.lineTo(x + cornerRadius, y + height);
    //     ctx.quadraticCurveTo(x, y + height, x, y + height - cornerRadius);
    //     ctx.lineTo(x, y + cornerRadius);
    //     ctx.quadraticCurveTo(x, y, x + cornerRadius, y);
    //     ctx.closePath();
    //   } else {
    //   }
    // }
  }
};

export const drawImage = (
  child: any,
  ctx: any,
  imgStore: any,
  imgsData: any
) => {
  if (!ctx) return;
  const imageRef = child.fills[0].imageRef;
  const { x, y, width, height } = child.absoluteBoundingBox;

  if (imgStore.hasOwnProperty(imageRef)) {
    const img = imgStore[imageRef];
    ctx.drawImage(img, x, y, width, height);
  } else {
    const img = new Image();
    img.src = imgsData[child.fills[0].imageRef];
    imgStore[imageRef] = img;
    img.onload = () => {
      if (ctx) {
        ctx.drawImage(img, x, y, width, height);
      }
    };
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
  let { x, y, width, height } = child.absoluteBoundingBox;
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

  // switch (style.textAlignVertical) {
  //   case "CENTER":
  //     // y += height / 2 + 5;
  //     break;

  //   case "BOTTOM":
  //     // y += height;
  //     break;

  //   default:
  //     break;
  // }

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
