import "./src/utils/loadEnv.ts";

import { audioRecorder } from "./src/audio.ts";
import { launch } from "./src/phone-logic.ts";
import rest from "./src/server.ts";
import { log } from "./src/utils/logging.ts";

const PORT = 8000;

audioRecorder.emitter.on("start", ({ sessionId }) => {
  log.info(`Recording started with session ID: ${sessionId}`);
});
audioRecorder.emitter.on("end", ({ sessionId, outputFile }) => {
  log.info(`Recording ended with session ID: ${sessionId}\n ${outputFile}`);
});
audioRecorder.emitter.on("error", ({ sessionId, err }) => {
  log.info(`Recording error with session ID: ${sessionId}`);
  log.error(err.message);
});

log.info(`Server Listen on: http://localhost:${PORT}`);

launch();

rest.listen({ port: PORT });
