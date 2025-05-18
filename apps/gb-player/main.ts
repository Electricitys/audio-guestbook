import "./src/utils/loadEnv.ts";

import os from "node:os";
import { audioRecorder } from "./src/audio.ts";
import { launch } from "./src/phone-logic.ts";
import rest from "./src/server.ts";
import { log } from "./src/utils/logging.ts";

const PORT = 8000;

audioRecorder.emitter.on("start", ({ sessionId }) => {
  log.info(`Recording started with session ID: ${sessionId}`);
});
audioRecorder.emitter.on("end", ({ sessionId, outputFile }) => {
  log.info(`Recording ended with session ID: ${sessionId}\n\t${outputFile}`);
});
audioRecorder.emitter.on("error", ({ sessionId, err }) => {
  log.info(`Recording error with session ID: ${sessionId}`);
  log.error(err.message);
});

log.info(`Server Listen on: http://localhost:${PORT}`);

const PhoneLogic = async () => {
  if (os.platform() === "linux") {
    await launch();
  }
};

Promise.all([PhoneLogic(), rest.listen({ port: PORT })]);
