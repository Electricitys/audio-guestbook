import { Logger, Level, Stream, LogRecord } from "jsr:@onjara/optic/logger";
import { LoggingStream } from "./logging-db.ts";
import { ConsoleStream } from "@onjara/optic";

const logStream = new LoggingStream();
const consoleStream = new ConsoleStream();

export const log = new Logger()
  .withMinLogLevel(Level.Debug)
  .addStream(logStream)
  .addStream(consoleStream);
