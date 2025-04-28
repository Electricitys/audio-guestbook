import { Application, Router } from "jsr:@oak/oak";
import { AudioPlayer } from "./speaker.ts";
import { AudioRecorder } from "./recorder.ts";
import {
  audioFileManager,
  audioPlayer,
  audioRecorder,
  config,
} from "./audio.ts";
import { apiFiles } from "./routes/api/files.ts";
import process from "node:process";
import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts";
import { apiLogs, apiLogsClean } from "./routes/api/logs.ts";
import { AvailableConfigKey } from "./utils/config-db.ts";

const router = new Router();

const sample_audio = `${Deno.cwd()}/audio/audio_sample_mono.wav`;

router.get("/api/health", (ctx) => {
  ctx.response.body = {
    status: "ok",
    message: "Server is running",
    uptime: process.uptime(),
    uid: Deno.uid(),
    memory_usage: Deno.memoryUsage(),
    last_sync: audioFileManager.lastSync,
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

router.get("/api/logs", async (ctx) => {
  ctx.response.body = await apiLogs();
});

router.get("/api/logs/clean", async (ctx) => {
  await apiLogsClean();
  ctx.response.body = {
    message: "OK",
  };
});

router.get("/api/server_connection_test", async (ctx) => {
  const serverUrl = ctx.request.url.searchParams.get("url") as string;
  ctx.response.body = await audioFileManager.testConnection(serverUrl);
});

router.post("/api/settings", async (ctx) => {
  const body = await ctx.request.body.json();
  for (const [key, value] of Object.entries(body)) {
    await config.set(key as AvailableConfigKey, value as string);
  }
  ctx.response.body = {
    message: "OK",
  };
});

router.get("/api/settings", async (ctx) => {
  const body = await config.list();
  ctx.response.body = body;
});

const rest = new Application();

rest.use(
  oakCors({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);
rest.use(router.routes());
rest.use(router.allowedMethods());

export default rest;
