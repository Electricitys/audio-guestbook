import { AudioPlayer } from "./speaker.ts";
import { AudioRecorder } from "./recorder.ts";
import path from "node:path";
import { AudioFileManager } from "./utils/audio-file-manager.ts";

export const audioFileManager = new AudioFileManager();

export const audioPlayer = new AudioPlayer({
  deviceName: Deno.env.get("PLAYER_OUTPUT_DEVICE"),
});

export const audioRecorder = new AudioRecorder({
  deviceName: Deno.env.get("PLAYER_INPUT_DEVICE") as string,
  outputDir: path.join(Deno.cwd(), "recordings"),
  audioFileManager: audioFileManager,
});
