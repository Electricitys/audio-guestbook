// @ts-types="npm:@types/fluent-ffmpeg"
import { spawnSync } from "node:child_process";
import { createNanoEvents, Emitter } from "npm:nanoevents";
import * as fs from "node:fs";
import * as path from "node:path";
import process from "node:process";
import ffmpeg from "npm:fluent-ffmpeg";
import ffmpegPath from "./utils/ffmpeg-file.ts";
import { log } from "./utils/logging.ts";

ffmpeg.setFfmpegPath(ffmpegPath);

interface AudioRecorderOptions {
  deviceName?: string; // Optional: e.g., 'hw:1' on Linux or 'Microphone (Realtek Audio)' on Windows
  outputDir?: string;
  duration?: number; // Optional: limit recording duration
}

export class AudioRecorder {
  public emitter: Emitter<{
    start: (props: { sessionId: string; device?: string }) => void;
    end: (props: { sessionId: string; outputFile: string }) => void;
    error: (props: { sessionId: string; err: Error }) => void;
  }>;

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

    this.emitter = createNanoEvents();

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
      log.warn("Already recording!");
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
        // console.log(`🎙️ Recording started for session: ${this.sessionId}`);
        this.emitter.emit("start", {
          sessionId: this.sessionId!,
          device: this.deviceName,
        });
      })
      .on("end", () => {
        // console.log(`💾 Recording saved to: ${outputFile}`);
        this.emitter.emit("end", {
          sessionId: this.sessionId!,
          outputFile,
        });
      })
      .on("error", (err: Error) => {
        // console.error("Recording error:", err);
        if (this.recording === false) {
          this.emitter.emit("end", {
            sessionId: this.sessionId!,
            outputFile,
          });
        } else {
          if (this.ffmpegProcess) {
            this.ffmpegProcess.kill("SIGKILL");
          }
          this.recording = false;
          this.ffmpegProcess = null;
          this.emitter.emit("error", {
            sessionId: this.sessionId!,
            err,
          });
        }
      })

      .on("progress", (progress) => {
        console.log("Processing: ", progress.timemark);
      })
      .save(outputFile);

    return outputFile;
  }

  stopRecording(): void {
    if (this.recording && this.ffmpegProcess) {
      this.ffmpegProcess.kill("SIGKILL");
      this.recording = false;
      this.ffmpegProcess = null;
    } else {
      console.warn("Not currently recording.");
    }
  }
}
