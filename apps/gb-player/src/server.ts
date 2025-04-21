import { Application, Router } from "jsr:@oak/oak";
import { AudioPlayer } from "./speaker.ts";
import { AudioRecorder } from "./recorder.ts";
import { audioFileManager, audioPlayer, audioRecorder } from "./audio.ts";
import { apiFiles } from "./routes/api/files.ts";
import process from "node:process";
import { AudioFileManager } from "./utils/audio-file-manager.ts";

const router = new Router();

const sample_audio = `${Deno.cwd()}/audio/audio_sample_mono.wav`;

router.get("/api/health", (ctx) => {
  ctx.response.body = {
    status: "ok",
    message: "Server is running",
    uptime: process.uptime(),
    uid: Deno.uid(),
    memory_usage: Deno.memoryUsage(),
    last_sync: new Date(),
  };
});

router.get("/recorder/start", async (ctx) => {
  const file_output = await audioRecorder.startRecording();
  ctx.response.body = {
    type: "recording",
    file: file_output,
    device: audioRecorder.deviceName || "default",
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

router.get("/api/sync", async (ctx) => {
  const syncFiles = await audioFileManager.syncFiles();

  ctx.response.body = {
    message: "OK",
    total: syncFiles.length,
  };
});

router.get("/api/files", async (ctx) => {
  ctx.response.body = await apiFiles();
});

const rest = new Application();

rest.use(router.routes());
rest.use(router.allowedMethods());

export default rest;
