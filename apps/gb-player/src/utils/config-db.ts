import { DatabaseSync } from "node:sqlite";

export type AvailableConfigKey =
  | "FILE_SERVER_URL"
  | "TARGET_DIR"
  | "OUTPUT_VOLUME";

const config = (dbname: string) => (): ConfigProps => {
  const db = new DatabaseSync(dbname);

  setup(db);

  return {
    set: setFunc(db),
    get: getFunc(db),

    list: listFunc(db),
  };
};

export default config("./dist/config.db");

export interface ConfigProps {
  set: (key: AvailableConfigKey, value: string) => void;
  get: (key: AvailableConfigKey) => string | null;

  list: () => Record<AvailableConfigKey, string>;
}

function setup(db: DatabaseSync) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS config (
      key   TEXT PRIMARY KEY,
      value TEXT
    );
  `);
}

function setFunc(db: DatabaseSync) {
  return function (key: AvailableConfigKey, value: string) {
    db.prepare(`REPLACE INTO config (key, value) VALUES (?,?)`).run(key, value);
  };
}

function getFunc(db: DatabaseSync) {
  return function (key: AvailableConfigKey) {
    const values = db
      .prepare(`SELECT value FROM config WHERE key == '${key}';`)
      .all() as { value: string }[];
    return (values[0].value as string) || null;
  };
}

function listFunc(db: DatabaseSync) {
  return function () {
    const values = db.prepare(`SELECT * FROM config`).all() as Record<
      string,
      string
    >[];
    return values.reduce((acc, row) => {
      acc[row.key] = row.value;
      return acc;
    }, {} as Record<AvailableConfigKey, string>);
  };
}
