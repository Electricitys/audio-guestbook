import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import nodepath from "node:path";
import { Upload } from "npm:tus-js-client";
import { ConfigProps } from "./config-db.ts";

type AudioFileStatus =
  | "recording"
  | "saved"
  | "pending"
  | "uploading"
  | "success"
  | "error"
  | "failed";

type AudioFile = {
  id: number;
  name: string;
  size: number;
  path: string;
  time: Date;
  status: AudioFileStatus;
};

export class AudioFileManager {
  private db: DatabaseSync;
  private isSyncing: boolean = false;
  public lastSync: Date | null = null;

  private config: ConfigProps;

  constructor(config: ConfigProps) {
    this.db = new DatabaseSync("./dist/audio.db");
    this.setup();
    this.config = config;
  }

  get serverUrl() {
    return (
      this.config.get("FILE_SERVER_URL") ||
      (Deno.env.get("FILE_SERVER_URL") as string)
    );
  }

  private setup = () => {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS recorders (
        id INTEGER      PRIMARY KEY AUTOINCREMENT,
        name TEXT       NOT NULL,
        size INTEGER    NOT NULL DEFAULT 0,
        path TEXT       NOT NULL,
        time TIMESTAMP  DEFAULT CURRENT_TIMESTAMP,
        status TEXT CHECK(status IN ('recording','saved','pending','uploading','success','failed','error')) NOT NULL DEFAULT 'saved'
      );
    `);
  };

  public addFile = ({ path, status }: Pick<AudioFile, "path" | "status">) => {
    const fileStats = this.verifyFile(path);
    const name = nodepath.basename(path);

    if (!fileStats) {
      throw new Error("File does not exist");
    }
    this.db
      .prepare(
        `INSERT INTO recorders (name, path, status, size) VALUES (?, ?, ?, ?);`
      )
      .run(name, path, status, fileStats.size);
  };

  public updateFile = (id: number, data: Partial<AudioFile>) => {
    const fields = Object.keys(data)
      .map((key) => `${key} = ?`)
      .join(", ");

    const values = Object.values(data).map((value) =>
      value instanceof Date
        ? value.toISOString().replace("T", " ").split(".")[0]
        : value
    );

    if (!fields) {
      throw new Error("No fields to update");
    }

    const result = this.db
      .prepare(`UPDATE recorders SET ${fields} WHERE id = ?;`)
      .run(...values, id);

    if (result.changes === 0) {
      throw new Error(`No record found with id ${id}`);
    }
  };

  public verifyFile = (path: string) => {
    const fileExists = fs.statSync(path);
    return fileExists;
  };

  public remoteFiles = async () => {
    const files = await fetch(`${this.serverUrl}/api/files`);
    return (await files.json()) as {
      id: string;
      type: "file" | "folder";
      size: number;
      parentPath: string;
      creation_date: Date;
    }[];
  };

  public listFiles = (): AudioFile[] => {
    const files = this.db
      .prepare(`SELECT *, datetime(time, 'localtime') as time FROM recorders`)
      .all() as AudioFile[];

    return files.map((file) => {
      return {
        ...file,
        time: new Date(file.time),
      };
    });
  };

  public syncFiles = async (force: boolean = false) => {
    if (this.isSyncing) throw new Error("Wait for Sync process.");
    const files = this.listFiles().filter((file) =>
      ["success", "uploading"].indexOf(file.status)
    );
    this.isSyncing = true;
    for (const file of files) {
      this.updateFile(file.id, {
        status: "uploading",
      });
      const upload = await this.syncFile(file);
      if (upload) {
        this.updateFile(file.id, {
          status: "success",
        });
      } else {
        this.updateFile(file.id, {
          status: "failed",
        });
      }
    }
    this.isSyncing = false;
    this.lastSync = new Date();
    return files;
  };

  public syncFile = async (file: AudioFile) => {
    const fileBuffer = fs.createReadStream(file.path); // Read the file as a buffer
    const folder = this.config.get("TARGET_DIR") || "from-deno";

    const upload = await new Promise<Upload>((resolve, reject) => {
      const u = new Upload(fileBuffer, {
        endpoint: `${this.serverUrl}/api/upload`,
        retryDelays: [0, 3000, 5000, 10000],
        metadata: {
          folder: folder,
          filename: file.name,
          name: file.name,
          type: "audio/wave",
        },
        onError(error) {
          reject(error as Error);
          throw error;
        },
        // onProgress(bytesUploaded, bytesTotal) {
        //   const percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
        //   // console.log(file.name, bytesUploaded, bytesTotal, `${percentage}%`);
        // },
        onSuccess() {
          resolve(u);
          console.log("Upload finished:", u.url);
        },
      });
      u.start();
    });

    return upload;
  };

  public testConnection = async (
    url: string
  ): Promise<{
    status: string | "OK";
    uptime: number;
  }> => {
    const conn = await fetch(`${url}/api/health`);
    return await conn.json();
  };
}
