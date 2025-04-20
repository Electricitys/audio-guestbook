import { audioRecorder } from "./src/audio.ts";
import { launch } from "./src/phone-logic.ts";
import rest from "./src/server.ts";

const PORT = 8000;

audioRecorder.emitter.on("start", ({ sessionId }) => {
  console.log(`Recording started with session ID: ${sessionId}`);
});
audioRecorder.emitter.on("end", ({ sessionId, outputFile }) => {
  console.log(`Recording ended with session ID: ${sessionId}\n ${outputFile}`);
});
audioRecorder.emitter.on("error", ({ sessionId, err }) => {
  console.log(`Recording error with session ID: ${sessionId}`);
  console.error(err);
});

console.log(`Server Listen on: http://localhost:${PORT}`);

launch();

rest.listen({ port: PORT });
