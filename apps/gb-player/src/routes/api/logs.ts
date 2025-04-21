import { connection, LogProps } from "../../utils/logging-db.ts";

export const apiLogs = async () => {
  const logs = (await connection
    .prepare(
      `SELECT *, datetime(time, 'localtime') as time FROM logger ORDER BY id DESC LIMIT 50;`
    )
    .all()) as LogProps[];
  return logs.map((log) => ({
    ...log,
    time: new Date(log.time),
  }));
};

export const apiLogsClean = async () => {
  await connection.exec(`DELETE FROM logger`);
};
