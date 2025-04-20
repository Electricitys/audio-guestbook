import { audioPlayer, audioRecorder } from "./audio.ts";
import os from "node:os";

export const launch = async () => {
  let recording = false;
  if (os.platform() === "win32") {
    console.log(os.platform());
  }
};
