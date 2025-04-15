import { execSync, spawn } from "node:child_process";
import * as path from "node:path";
import * as os from "node:os";

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
  private currentProcess: ReturnType<typeof spawn> | null = null;

  constructor({
    deviceName = null,
    defaultVolume = 100,
  }: AudioPlayerOptions = {}) {
    this.outputDevice = deviceName;
    this.defaultVolume = defaultVolume;
  }

  play(filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.currentProcess) {
        return reject(new Error("Audio is already playing."));
      }

      const absPath = path.resolve(filePath);
      const args: string[] = [];

      const platform = os.platform();

      args.push(absPath);
      args.push("-q"); // Quiet mode (no output to console)

      // Windows: use -t waveaudio <index>
      if (platform === "win32") {
        args.push("-t", "waveaudio");
        if (this.outputDevice) {
          args.push(this.outputDevice); // This should be the device index as string
        } else {
          args.push("0"); // Default to first device
        }
      }
      // Linux/macOS: use -d <device>
      else {
        if (this.outputDevice) {
          args.push("-d", this.outputDevice);
        }
      }

      console.log("Running: sox", args.join(" "));

      this.currentProcess = spawn("sox", args, {
        stdio: ["ignore", "inherit", "inherit"],
      });

      this.currentProcess.on("exit", (code) => {
        this.currentProcess = null;
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Playback exited with code ${code}`));
        }
      });

      this.currentProcess.on("error", (err) => {
        this.currentProcess = null;
        reject(err);
      });
    });
  }

  static listDevices(): AudioOutputDevice[] {
    const platform = os.platform();
    const devices: AudioOutputDevice[] = [];
    let index = 0;

    if (platform === "win32") {
      let output = "";

      try {
        // Force error to get device list from debug output
        execSync(`sox -V6 -n -t waveaudio non-existent-device`, {
          encoding: "utf-8",
          stdio: ["pipe", "pipe", "pipe"], // keep stdout/stderr
        });
      } catch (err: any) {
        output = err.stdout || err.stderr || "";

        const regex = /Enumerating output device\s+(-?\d+):\s+"(.+?)"/g;
        let match;
        while ((match = regex.exec(output)) !== null) {
          const idx = parseInt(match[1], 10);
          const name = match[2];
          devices.push({ index: idx, name });
        }
      }
    } else if (platform === "linux") {
      const output = execSync(`aplay -L`, { encoding: "utf-8" });
      output.split("\n").forEach((line) => {
        if (line && !line.startsWith(" ")) {
          devices.push({ index: index++, name: line.trim() });
        }
      });
    } else if (platform === "darwin") {
      const output = execSync(
        `ffmpeg -f avfoundation -list_devices true -i "" 2>&1`,
        { encoding: "utf-8" }
      );
      output.split("\n").forEach((line) => {
        const match = line.match(/^\[\d+\] (.+?)\s*\(output\)/i);
        if (match) {
          devices.push({ index: index++, name: match[1] });
        }
      });
    }

    return devices;
  }
}
