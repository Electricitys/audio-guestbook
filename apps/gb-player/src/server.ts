import { Application, Router } from "jsr:@oak/oak";
import { AudioPlayer } from "./speaker.ts";
import { AudioRecorder } from "./recorder.ts";
import { audioPlayer, audioRecorder } from "./audio.ts";

const router = new Router();

const sample_audio = `${Deno.cwd()}/audio/audio_sample_mono.wav`;

router.get("/", (ctx) => {
  ctx.response.body = "Hello world";
});

router.get("/recorder/start", async (ctx) => {
  const file_output = await audioRecorder.startRecording();
  ctx.response.body = {
    type: "recording",
    file: file_output,
    device: audioRecorder._deviceName || "default",
  };
});

router.get("/recorder/list", (ctx) => {
  const list_devices = AudioRecorder.listDevices();
  ctx.response.body = {
    list_devices,
  };
});

router.get("/recorder/stop", async (ctx) => {
  ctx.response.body = "Stopping";
  await audioRecorder.stopRecording();
});

router.get("/speaker/start", async (ctx) => {
  ctx.response.body = "Starting";
  await audioPlayer.play(sample_audio);
});

router.get("/speaker/list", async (ctx) => {
  const list_devices = await AudioPlayer.listDevices();
  ctx.response.body = {
    list_devices,
  };
});

const rest = new Application();

rest.use(router.routes());
rest.use(router.allowedMethods());

export default rest;
