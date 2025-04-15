import process from "node:process";
import { Application, Router } from "jsr:@oak/oak";
import { AudioPlayer } from "./speaker.ts";
import { AudioRecorder } from "./recorder.ts";

const router = new Router();

const audioPlayer = new AudioPlayer({
  deviceName:
    // process.platform === "win32" ? "Microphone (Realtek(R) Audio)" : "hw:1",
    process.platform === "win32" ? "1" : "hw:1",
});
const audioRecorder = new AudioRecorder({
  deviceName:
    // process.platform === "win32" ? "Microphone (Realtek(R) Audio)" : "hw:1",
    process.platform === "win32"
      ? "External Microphone (Realtek(R) Audio)"
      : "hw:1",
  outputDir: "./recordings",
});

const sample_audio = `${Deno.cwd()}/audio/audio_sample_mono.wav`;
router.get("/", (ctx) => {
  console.log("HIT");
  ctx.response.body = "Hello world";
});

router.get("/record/start", async (ctx) => {
  const file_output = await audioRecorder.startRecording();
  ctx.response.body = {
    type: "recording",
    file: file_output,
    device: audioRecorder._deviceName || "default",
  };
});

router.get("/record/list", (ctx) => {
  const list_devices = AudioRecorder.listDevices();
  ctx.response.body = {
    list_devices,
  };
});

router.get("/record/stop", async (ctx) => {
  ctx.response.body = "Stopping";
  await audioRecorder.stopRecording();
  console.log("record stop");
});

router.get("/speaker/start", async (ctx) => {
  ctx.response.body = "Starting";
  await audioPlayer.play(sample_audio);
  console.log("speaker stop");
});

router.get("/speaker/list", async (ctx) => {
  const list_devices = await AudioPlayer.listDevices();
  ctx.response.body = {
    list_devices,
  };
});

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

export default app;
