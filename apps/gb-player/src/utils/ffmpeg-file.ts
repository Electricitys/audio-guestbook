import path from "node:path";
import os from "node:os";
import fs from "node:fs";
import ffmpegStaticPath from "npm:ffmpeg-static";

const platform = `${os.platform()}_${os.arch()}`;
const targetDir = `./lib/${platform}`;
const staticFfmpegPath = path.resolve(`${targetDir}/ffmpeg`);

let ffmpegPath: string;

const systemFfmpeg = await getSystemFfmpegPath();

if (systemFfmpeg) {
  console.log("✅ Using system-installed ffmpeg.");
  ffmpegPath = systemFfmpeg;
} else {
  console.log(Deno.env.get);
  if (!fs.existsSync(staticFfmpegPath)) {
    console.log(
      `ffmpeg not found, copying from static path to ${staticFfmpegPath}`
    );
    await Deno.mkdir(targetDir, { recursive: true });
    await Deno.copyFile(ffmpegStaticPath as never as string, staticFfmpegPath);
  } else {
    console.log("✅ Using already-copied static ffmpeg.");
  }
  ffmpegPath = staticFfmpegPath;
}

export default ffmpegPath;

async function getSystemFfmpegPath(): Promise<string | null> {
  try {
    const cmd = new Deno.Command("ffmpeg", {
      args: ["-version"],
      stdout: "null",
      stderr: "null",
    });

    const { code } = await cmd.output();

    return code === 0 ? "ffmpeg" : null; // use system ffmpeg if available
  } catch {
    return null;
  }
}
