import { Application, Router } from "@oak/oak";
import { AudioPlayer } from "./speaker.ts";
// import path from "node:path";

const router = new Router();

const audioPlayer = new AudioPlayer();
const sample_audio = `${Deno.cwd()}/audio/audio_sample_mono.wav`;
router.get("/", (ctx) => {
  console.log("HIT");
  ctx.response.body = "Hello world";
});

router.get("/record/start", async (ctx) => {
  console.log("record Start");
  console.log(sample_audio);
  ctx.response.body = "Starting";
  await audioPlayer.playFile(sample_audio);
  console.log("record stop");
});

router.get("/speaker/start", async (ctx) => {
  console.log("record Start");
  console.log(sample_audio);
  ctx.response.body = "Starting";
  await audioPlayer.playFile(sample_audio);
  console.log("record stop");
});

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

export default app;
