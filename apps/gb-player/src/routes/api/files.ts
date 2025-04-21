import { audioFileManager } from "../../audio.ts";

export const apiFiles = async () => {
  const files = await audioFileManager.listFiles();
  return files;
};
