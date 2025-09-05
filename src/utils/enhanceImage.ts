export interface EnhanceOptions {
  contrast?: number; // 1 = no change
  saturation?: number; // 1 = no change
  sharpness?: number; // 0-1 typical
  smoothing?: number; // 0-1 typical
  brightness?: number; // 1 = no change
  shadows?: number; // 0-1 lift shadows
}

function applyLocalAdjustments(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  contrast = 1,
  saturation = 1,
  brightness = 1,
  shadows = 0
) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  const c = contrast;
  const bMul = brightness; // multiplicative brightness

  // Saturation matrix
  const s = saturation;
  const sr = 0.2126 * (1 - s);
  const sg = 0.7152 * (1 - s);
  const sb = 0.0722 * (1 - s);

  for (let i = 0; i < data.length; i += 4) {
    // Apply brightness (multiply)
    let r = data[i] * bMul;
    let g = data[i + 1] * bMul;
    let bl = data[i + 2] * bMul;

    // Contrast
    r = (r - 128) * c + 128;
    g = (g - 128) * c + 128;
    bl = (bl - 128) * c + 128;

    // Clamp pre-sat
    r = Math.max(0, Math.min(255, r));
    g = Math.max(0, Math.min(255, g));
    bl = Math.max(0, Math.min(255, bl));

    // Shadows lift (based on luma)
    if (shadows > 0) {
      const luma = 0.2126 * r + 0.7152 * g + 0.0722 * bl; // 0..255
      const t = Math.max(0, (128 - luma) / 128); // stronger for darker pixels
      const lift = shadows * t * 64; // up to ~64 lift in darkest areas
      r = Math.min(255, r + lift);
      g = Math.min(255, g + lift);
      bl = Math.min(255, bl + lift);
    }

    // Saturation via matrix
    const nr = (sr + s) * r + sg * g + sb * bl;
    const ng = sr * r + (sg + s) * g + sb * bl;
    const nb = sr * r + sg * g + (sb + s) * bl;

    data[i] = Math.max(0, Math.min(255, nr));
    data[i + 1] = Math.max(0, Math.min(255, ng));
    data[i + 2] = Math.max(0, Math.min(255, nb));
  }

  ctx.putImageData(imageData, 0, 0);
}

function unsharpMask(baseCtx: CanvasRenderingContext2D, width: number, height: number, amount = 0.5, smoothing = 0.1) {
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = width;
  tempCanvas.height = height;
  const tctx = tempCanvas.getContext('2d');
  if (!tctx) return;

  const baseImage = baseCtx.getImageData(0, 0, width, height);
  const imgCanvas = document.createElement('canvas');
  imgCanvas.width = width;
  imgCanvas.height = height;
  const imgCtx = imgCanvas.getContext('2d');
  if (!imgCtx) return;
  imgCtx.putImageData(baseImage, 0, 0);

  const blurPx = Math.max(0, Math.min(8, smoothing * 8));
  if (blurPx > 0) {
    (tctx as any).filter = `blur(${blurPx}px)`;
  }
  tctx.drawImage(imgCanvas, 0, 0, width, height);

  const blurData = tctx.getImageData(0, 0, width, height);
  const baseData = baseImage;
  const d = baseData.data;
  const b = blurData.data;
  const a = amount;
  for (let i = 0; i < d.length; i += 4) {
    d[i] = Math.max(0, Math.min(255, d[i] + a * (d[i] - b[i])));
    d[i + 1] = Math.max(0, Math.min(255, d[i + 1] + a * (d[i + 1] - b[i + 1])));
    d[i + 2] = Math.max(0, Math.min(255, d[i + 2] + a * (d[i + 2] - b[i + 2])));
  }
  baseCtx.putImageData(baseData, 0, 0);
}

export function enhanceCanvasInPlace(ctx: CanvasRenderingContext2D, width: number, height: number, options: EnhanceOptions = {}) {
  const contrast = options.contrast ?? 1.1;
  const saturation = options.saturation ?? 1.1;
  const sharpness = options.sharpness ?? 0.6;
  const smoothing = options.smoothing ?? 0.1;
  const brightness = options.brightness ?? 1.0;
  const shadows = options.shadows ?? 0.0;
  applyLocalAdjustments(ctx, width, height, contrast, saturation, brightness, shadows);
  if (sharpness > 0 || smoothing > 0) {
    unsharpMask(ctx, width, height, sharpness, smoothing);
  }
}

export async function enhanceImage(dataUrl: string, options: EnhanceOptions = {}): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true } as any) as CanvasRenderingContext2D;
      if (!ctx) {
        reject(new Error('Canvas not supported'));
        return;
      }
      ctx.drawImage(img, 0, 0);

      enhanceCanvasInPlace(ctx, canvas.width, canvas.height, options);

      try {
        resolve(canvas.toDataURL('image/jpeg', 0.95));
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
}
