import { loadSync } from "jsr:@std/dotenv";
import { log } from "./logging.ts";

const loadMatrix = async (paths: string[]): Promise<Record<string, string>> => {
  let result: Record<string, string> = {};
  const loadedFrom: string[] = [];

  for (const path of paths) {
    const res = loadSync({
      envPath: path,
    });

    if (Object.keys(res).length > 0) {
      loadedFrom.push(path);
    }

    result = {
      ...result,
      ...res,
    };
  }

  for (const [key, value] of Object.entries(result)) {
    Deno.env.set(key, value);
  }

  log.info(`Loaded env from: ${loadedFrom.join(", ")}`);

  return result;
};

await loadMatrix([".env", ".env.local", ".env.production.local"]);
