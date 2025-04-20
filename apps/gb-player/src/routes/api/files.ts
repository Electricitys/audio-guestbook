import fs from "node:fs";
import nodepath from "node:path";

export const apiFiles = async (path: string) => {
  let result;
  try {
    const files = await fs.readdirSync(nodepath.join("./recordings", path), {
      withFileTypes: true,
    });
    result = files.map((file) => {
      const fileStats = fs.statSync(
        nodepath.join("./recordings", path, file.name)
      );
      return {
        name: file.name,
        size: fileStats.size,
        isDirectory: file.isDirectory(),
        isFile: file.isFile(),
      };
    });
  } catch (err) {
    console.error("Error reading directory:", err);
  }

  return result || [];
};
