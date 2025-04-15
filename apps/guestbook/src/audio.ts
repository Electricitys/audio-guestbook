import { AudioPlayer } from "./speaker.ts";
import { AudioRecorder } from "./recorder.ts";
import process from "node:process";

export const audioPlayer = new AudioPlayer({
  deviceName:
    // process.platform === "win32" ? "Microphone (Realtek(R) Audio)" : "hw:1",
    process.platform === "win32" ? "1" : "hw:1",
});

export const audioRecorder = new AudioRecorder({
  deviceName:
    // process.platform === "win32" ? "Microphone (Realtek(R) Audio)" : "hw:1",
    process.platform === "win32"
      ? "External Microphone (Realtek(R) Audio)"
      : "hw:1",
  outputDir: "./recordings",
});
