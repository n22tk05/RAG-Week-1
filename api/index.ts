// Polyfills cho pdfjs-dist trong môi trường serverless Node.js
if (typeof (globalThis as any).DOMMatrix === "undefined") {
  (globalThis as any).DOMMatrix = class DOMMatrix {};
}
if (typeof (globalThis as any).Path2D === "undefined") {
  (globalThis as any).Path2D = class Path2D {};
}
if (typeof (globalThis as any).ImageData === "undefined") {
  (globalThis as any).ImageData = class ImageData {};
}

let appPromise: any = null;

export default async function handler(req: any, res: any) {
  if (!appPromise) {
    const mod = await import("../server/src/main.js");
    appPromise = mod.default || mod;
  }
  return appPromise(req, res);
}