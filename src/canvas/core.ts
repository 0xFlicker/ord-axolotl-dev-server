import { getImage, IImageFetcher } from "./cache.js";
import { createCanvas } from "./canvas.js";

export interface ILayer {
  draw(ctx: CanvasRenderingContext2D): Promise<void>;
  zIndex: number;
}

export interface IGeneratable {
  generate(ctx: CanvasRenderingContext2D): void;
  layers: ILayer[];
}

export function cachedDrawImage(imgPath: string, imageFetcher: IImageFetcher) {
  return async (ctx: CanvasRenderingContext2D) => {
    const img = await getImage(imgPath, imageFetcher);
    ctx.drawImage(img as any, 0, 0);
  };
}

export function composeDrawOps(
  ...ops: ((ctx: CanvasRenderingContext2D) => Promise<void>)[]
) {
  return async (ctx: CanvasRenderingContext2D) => {
    for (const op of ops) {
      await op(ctx);
    }
  };
}

export async function composeWithCanvas(
  ...ops: ((ctx: CanvasRenderingContext2D) => Promise<void>)[]
) {
  return async (ctx: CanvasRenderingContext2D) => {
    const canvas = createCanvas(ctx.canvas.width, ctx.canvas.height);
    const ctx2 = canvas.getContext("2d")!;
    ctx2?.clearRect(0, 0, canvas.width, canvas.height);
    await composeDrawOps(...ops)(ctx2);
    ctx.drawImage(canvas, 0, 0);
  };
}

export async function renderCanvas(
  canvas: HTMLCanvasElement,
  layers: ILayer[],
) {
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const layer of [...layers].sort((a, b) => a.zIndex - b.zIndex)) {
    await layer.draw(ctx as any);
  }
}
export async function renderHtmlCanvas(
  canvas: HTMLCanvasElement,
  layers: ILayer[],
) {
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const layer of [...layers].sort((a, b) => a.zIndex - b.zIndex)) {
    await layer.draw(ctx as any);
  }
}

export async function renderCanvasCtx(
  ctx: CanvasRenderingContext2D,
  layers: ILayer[],
  top: number,
  left: number,
  width: number,
  height: number,
  progress?: (current: number, total: number) => void,
) {
  ctx.clearRect(top, left, width, height);
  const total = layers.length;
  let current = 1;
  for (const layer of [...layers].sort((a, b) => a.zIndex - b.zIndex)) {
    await layer.draw(ctx as any);
    if (progress) {
      progress(current++, total);
    }
  }
}
