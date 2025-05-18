import { execSync } from "node:child_process";
import * as path from "node:path";
import * as os from "node:os";
import { ConfigProps } from "./utils/config-db.ts";
import { log } from "./utils/logging.ts";

interface AudioPlayerOptions {
  playerPath?: string;
  defaultVolume?: number;
  deviceName?: string | null;
}

export interface AudioOutputDevice {
  index: number;
  name: string;
}

export class AudioPlayer {
  private outputDevice: string | null;
  private defaultVolume: number;
  private currentProcess: Deno.ChildProcess | null = null;
  private config: ConfigProps;

  constructor(
    config: ConfigProps,
    { deviceName = null, defaultVolume = 100 }: AudioPlayerOptions = {}
  ) {
    this.outputDevice = deviceName;
    this.defaultVolume = defaultVolume;
    this.config = config;
  }

  get isPlaying() {
    return this.currentProcess !== null;
  }

  async play(filePath: string): Promise<void> {
    if (this.currentProcess) {
      throw new Error("Audio is already playing.");
    }

    const absPath = path.resolve(filePath);
    const platform = os.platform();

    const args = [
      absPath,
      "-q", // quiet mode
    ];

    if (platform === "win32") {
      args.push("-t", "waveaudio");
      args.push(this.outputDevice ?? "0");
    } else {
      args.push("-t", "alsa");
      args.push(this.outputDevice ?? "default");
    }

    log.info(`Running: sox ${args.join(" ")}`);

    const command = new Deno.Command("sox", {
      args,
      stdout: "inherit",
      stderr: "inherit",
    });
    const child = command.spawn();
    this.currentProcess = child;
    try {
      const status = await child.status;
      if (this.currentProcess != null && status.success) {
        log.info("Playback complete.");
      } else {
        throw new Error(`Playback failed with code ${status.code}`);
      }
    } catch (err) {
      throw err;
    } finally {
      this.currentProcess = null;
    }
  }

  stop(): void {
    if (this.currentProcess) {
      this.currentProcess.kill("SIGTERM"); // Try to terminate nicely
      this.currentProcess = null;
      log.info("Playback stopped.");
    } else {
      log.warn("No audio is currently playing.");
    }
  }

  static listDevices(): AudioOutputDevice[] {
    const platform = os.platform();
    const devices: AudioOutputDevice[] = [];
    let index = 0;

    if (platform === "win32") {
      let output = "";

      try {
        // Intentionally fail to get verbose device list
        execSync(`sox -V6 -n -t waveaudio non-existent-device`, {
          encoding: "utf-8",
          stdio: ["pipe", "pipe", "pipe"],
        });
      } catch (err: any) {
        output = err.stdout || err.stderr || "";

        const regex = /Enumerating (output|input) device\s+(-?\d+):\s+"(.+?)"/g;
        let match;
        while ((match = regex.exec(output)) !== null) {
          const [, direction, idxStr, name] = match;
          const idx = parseInt(idxStr, 10);
          if (direction === "output") {
            devices.push({ index: idx, name });
          }
        }
      }
    } else if (platform === "linux") {
      try {
        const output = execSync(`aplay -L`, { encoding: "utf-8" });
        const seen = new Set<string>();

        output.split("\n").forEach((line) => {
          if (line && !line.startsWith(" ")) {
            const deviceName = line.trim();
            if (!seen.has(deviceName)) {
              seen.add(deviceName);
              devices.push({ index: index++, name: deviceName });
            }
          }
        });

        // Always prioritize and add "default" device if missing
        if (!seen.has("default")) {
          devices.unshift({ index: 0, name: "default" });
        }
      } catch (err) {
        console.error("Failed to list Linux audio devices:", err);
      }
    } else if (platform === "darwin") {
      try {
        const output = execSync(
          `ffmpeg -f avfoundation -list_devices true -i "" 2>&1`,
          { encoding: "utf-8" }
        );

        output.split("\n").forEach((line) => {
          const match = line.match(/\[\d+\] (.+?) \(output\)/i);
          if (match) {
            devices.push({ index: index++, name: match[1].trim() });
          }
        });
      } catch (err) {
        console.error("Failed to list macOS audio devices:", err);
      }
    }

    return devices;
  }
}
