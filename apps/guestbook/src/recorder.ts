// @ts-types="npm:@types/fluent-ffmpeg"
import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import process from "node:process";
import ffmpeg from "npm:fluent-ffmpeg";
import ffmpegPath from "./ffmpeg-file.ts";

ffmpeg.setFfmpegPath(ffmpegPath);

interface AudioRecorderOptions {
  deviceName?: string; // Optional: e.g., 'hw:1' on Linux or 'Microphone (Realtek Audio)' on Windows
  outputDir?: string;
  duration?: number; // Optional: limit recording duration
}

export class AudioRecorder {
  private deviceName: string | undefined;
  private duration: number;
  private outputDir: string;
  private recording: boolean;
  private sessionId: string | null;
  private ffmpegProcess: ffmpeg.FfmpegCommand | null;

  constructor({
    deviceName,
    outputDir = "./recordings",
    duration = 60,
  }: AudioRecorderOptions = {}) {
    this.deviceName = deviceName;
    this.duration = duration;
    this.outputDir = outputDir;
    this.recording = false;
    this.sessionId = null;
    this.ffmpegProcess = null;

    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  get _deviceName(): string | undefined {
    return this.deviceName;
  }

  static listDevices(): string[] {
    const platform = process.platform;
    const devices: string[] = [];

    if (platform === "win32") {
      const result = spawnSync(
        ffmpegPath,
        ["-list_devices", "true", "-f", "dshow", "-i", "dummy"],
        { encoding: "utf8" }
      );

      const lines = result.stderr.split("\n");
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.includes("(audio)")) {
          const match = trimmed.match(/"(.+?)"/);
          if (match) {
            devices.push(match[1]);
          }
        }
      }
    } else {
      const result = spawnSync("arecord", ["-l"], { encoding: "utf8" });
      const lines = result.stdout.split("\n");
      for (const line of lines) {
        const match = line.match(/card (\d+): (\S+).*device (\d+): (.+?) \[/);
        if (match) {
          const [, cardNum, _cardName, deviceNum, deviceName] = match;
          devices.push(`hw:${cardNum},${deviceNum} (${deviceName})`);
        }
      }
    }

    return devices;
  }

  startRecording(sessionId: string = `guest_${Date.now()}`): string {
    if (this.recording) {
      console.warn("Already recording!");
      return "";
    }

    this.sessionId = sessionId;
    const outputFile = path.join(this.outputDir, `${this.sessionId}.wav`);
    this.recording = true;

    const input =
      process.platform === "win32"
        ? `audio=${this.deviceName ?? "default"}`
        : this.deviceName ?? "default";

    const inputFormat = process.platform === "win32" ? "dshow" : "alsa";

    this.ffmpegProcess = ffmpeg()
      .input(input)
      .inputFormat(inputFormat)
      .audioCodec("pcm_s16le")
      .duration(120)
      .format("wav")
      .on("start", () => {
        console.log(`🎙️ Recording started for session: ${this.sessionId}`);
      })
      .on("end", () => {
        console.log(`💾 Recording saved to: ${outputFile}`);
      })
      .on("error", (err: Error) => {
        console.error("Recording error:", err);
      })
      .save(outputFile);

    return outputFile;
  }

  stopRecording(): void {
    if (this.recording && this.ffmpegProcess) {
      this.ffmpegProcess.kill("SIGINT");
      this.recording = false;
      this.ffmpegProcess = null;
    } else {
      console.warn("Not currently recording.");
    }
  }
}
