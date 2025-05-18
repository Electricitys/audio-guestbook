import { AudioPlayer } from "./speaker.ts";
import { AudioRecorder } from "./recorder.ts";
import path from "node:path";
import { AudioFileManager } from "./utils/audio-file-manager.ts";
import configDb from "./utils/config-db.ts";

export const config = configDb();

export const audioFileManager = new AudioFileManager(config);

export const audioPlayer = new AudioPlayer(config, {
  deviceName: Deno.env.get("PLAYER_OUTPUT_DEVICE"),
});

export const audioRecorder = new AudioRecorder({
  deviceName: Deno.env.get("PLAYER_INPUT_DEVICE") as string,
  outputDir: path.join(Deno.cwd(), "dist", "recordings"),
  audioFileManager: audioFileManager,
});
