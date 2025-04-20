import { Logger, Level } from "jsr:@onjara/optic/logger";
import { ConsoleStream } from "jsr:@onjara/optic";
import { LoggingStream } from "./logging-db.ts";

const logStream = new LoggingStream();
const consoleStream = new ConsoleStream();

export const log = new Logger()
  .withMinLogLevel(Level.Debug)
  .addStream(logStream)
  .addStream(consoleStream);
