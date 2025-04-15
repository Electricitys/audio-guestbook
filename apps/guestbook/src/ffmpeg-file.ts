import path from "node:path";
import os from "node:os";
import fs from "node:fs";
import ffmpegStaticPath from "npm:ffmpeg-static";

const platform = `${os.platform()}_${os.arch()}`;
const targetDir = `./lib/${platform}`;
const ffmpegPath = path.resolve(`${targetDir}/ffmpeg`);

if (!fs.existsSync(ffmpegPath)) {
  console.log("ffmpeg not found, copying from static path");
  await Deno.mkdir(targetDir, { recursive: true });
  await Deno.copyFile(ffmpegStaticPath as never as string, ffmpegPath);
}

export default ffmpegPath;
