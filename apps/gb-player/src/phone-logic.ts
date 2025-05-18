import os from "node:os";
import { audioPlayer, audioRecorder } from "./audio.ts";
import { debounce } from "@lib/debounce";
import { monitorPins } from "@lib/gpio";
import { log } from "./utils/logging.ts";

const audioOpenerPath = "audio/guest_welcome.wav";

export const launch = async () => {
  if (os.platform() !== "linux") {
    throw new Error("Needs to be run on Linux Based OS");
  }

  log.info("Starting launch Phone Logic");

  let isPressed = false;

  const risingHandler = debounce(async () => {
    log.info("Rising edge detected on GPIO 18");
    if (isPressed || audioPlayer.isPlaying) return;
    isPressed = true;
    try {
      await audioPlayer.play(audioOpenerPath);
      await audioRecorder.startRecording();
    } catch (err) {
      console.dir(err);
    }
  }, 500);

  const fallingHandler = debounce(() => {
    if (!isPressed) return;
    isPressed = false;
    log.info("Falling edge detected on GPIO 18");
    audioPlayer.stop();
    audioRecorder.stopRecording();
  }, 200);

  const handleMon = debounce((pin, state) => {
    if (pin != 18) return;
    if (state) {
      risingHandler();
    } else {
      fallingHandler();
    }
  }, 500);

  await monitorPins([18], handleMon, {
    chip: "gpiochip0",
  });
};
