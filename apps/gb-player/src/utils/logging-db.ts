import { DatabaseSync } from "node:sqlite";
import { Level, LogRecord } from "jsr:@onjara/optic/logger";
import { TokenReplacer } from "jsr:@onjara/optic/formatters";
import { BaseStream } from "@onjara/optic";

export type LogType =
  | "trace"
  | "info"
  | "error"
  | "warn"
  | "debug"
  | "critical";

export type LogProps = {
  id: number;
  time: Date;
  message: string;
  type: LogType;
};

export const connection = new DatabaseSync("./logger.db");

connection.exec(`
  CREATE TABLE IF NOT EXISTS logger (
    id      INTEGER       PRIMARY KEY AUTOINCREMENT,
    time    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    message TEXT          NOT NULL,
    type    TEXT CHECK(type IN ('trace','info','error','warn','debug','critical'))  NOT NULL DEFAULT 'info'
  );
`);

const ParseType: Record<Level, LogType> = {
  10: "trace",
  20: "debug",
  30: "info",
  40: "warn",
  50: "error",
  60: "critical",
};

export class LoggingStream extends BaseStream {
  public db: DatabaseSync;

  constructor() {
    super(new TokenReplacer().withColor());
    this.db = connection;
  }

  override setup(): void {
    super.setup();
  }

  override destroy(): void {
    this.db.close();
  }

  override handle(logRecord: LogRecord): boolean {
    const handle = super.handle(logRecord);
    if (handle === false) return false;
    this.writeLog(logRecord.msg as string, ParseType[logRecord.level]);

    return true;
  }

  log(): void {
    // console.log(msg);
  }

  private writeLog(msg: string, type: LogType = "info") {
    return this.db
      .prepare(`INSERT INTO logger (message, type) VALUES (?, ?);`)
      .run(msg, type);
  }
}
