import { AudioPlayer } from "./speaker.ts";
import { AudioRecorder } from "./recorder.ts";

export const audioPlayer = new AudioPlayer({
  deviceName: Deno.env.get("PLAYER_OUTPUT_DEVICE"),
});

export const audioRecorder = new AudioRecorder({
  deviceName: Deno.env.get("PLAYER_INPUT_DEVICE"),
  outputDir: "./recordings",
});
