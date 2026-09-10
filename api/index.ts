let appPromise: any = null;

export default async function handler(req: any, res: any) {
  if (!appPromise) {
    const mod = await import("../server/src/main.js");
    appPromise = mod.default || mod;
  }
  return appPromise(req, res);
}