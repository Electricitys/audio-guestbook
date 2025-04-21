// @ts-types="npm:@types/fluent-ffmpeg"
import { spawnSync, spawn } from "node:child_process";
import { createNanoEvents, Emitter } from "npm:nanoevents";
import * as fs from "node:fs";
import * as path from "node:path";
import process from "node:process";
import ffmpeg from "npm:fluent-ffmpeg";
import ffmpegPath from "./utils/ffmpeg-file.ts";
import { AudioFileManager } from "./utils/audio-file-manager.ts";

ffmpeg.setFfmpegPath(ffmpegPath);

interface AudioRecorderOptions {
  deviceName: string;
  outputDir: string;
  duration?: number;
  audioFileManager: AudioFileManager;
}

export class AudioRecorder {
  public emitter: Emitter<{
    start: (props: { sessionId: string; device?: string }) => void;
    end: (props: { sessionId: string; outputFile: string }) => void;
    error: (props: { sessionId: string; err: Error }) => void;
  }>;

  // for private use
  private _emitter: Emitter<{
    start: (props: { sessionId: string; device?: string }) => void;
    end: (props: { sessionId: string; outputFile: string }) => void;
    error: (props: { sessionId: string; err: Error }) => void;
  }>;

  public deviceName?: string;
  private duration: number;
  private outputDir: string;
  private recording: boolean;
  private sessionId: string | null;
  private ffmpegProcess: ffmpeg.FfmpegCommand | null;

  private audioFileManager: AudioFileManager;

  constructor({
    deviceName,
    outputDir,
    duration = 60,
    audioFileManager,
  }: AudioRecorderOptions) {
    this.deviceName = deviceName;
    this.duration = duration;
    this.outputDir = outputDir;
    this.recording = false;
    this.sessionId = null;
    this.ffmpegProcess = null;

    this.audioFileManager = audioFileManager;

    this.emitter = createNanoEvents();
    this._emitter = createNanoEvents();

    this._emitter.on("start", (props) => {
      this.emitter.emit("start", props);
    });
    this._emitter.on("end", (props) => {
      this.audioFileManager.addFile({
        path: props.outputFile,
        status: "saved",
      });
      this.emitter.emit("end", props);
    });
    this._emitter.on("error", (props) => {
      this.emitter.emit("error", props);
    });

    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
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
          if (match) devices.push(match[1]);
        }
      }
    } else if (platform === "linux") {
      // Prefer PulseAudio
      const result = spawnSync("pactl", ["list", "sources", "short"], {
        encoding: "utf8",
      });

      if (result.status === 0) {
        result.stdout.split("\n").forEach((line) => {
          const parts = line.split("\t");
          if (parts.length >= 2) {
            devices.push(parts[1]);
          }
        });
      } else {
        // Fallback to arecord for ALSA
        const resultAlsa = spawnSync("arecord", ["-l"], { encoding: "utf8" });
        resultAlsa.stdout.split("\n").forEach((line) => {
          const match = line.match(/card (\d+): (\S+).*device (\d+): (.+?) \[/);
          if (match) {
            const [, cardNum, , deviceNum, deviceName] = match;
            devices.push(`hw:${cardNum},${deviceNum} (${deviceName})`);
          }
        });
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

    const platform = process.platform;

    if (platform === "linux") {
      const deviceArg = this.deviceName ? ["-D", this.deviceName] : [];
      const args = [
        ...deviceArg,
        "-f",
        "cd", // 16-bit, 44.1kHz, stereo
        "-t",
        "wav",
        "-d",
        this.duration.toString(),
        outputFile,
      ];

      const arecordProc = spawn("arecord", args);

      this.ffmpegProcess = arecordProc as any; // for compatibility

      this._emitter.emit("start", {
        sessionId: this.sessionId!,
        device: this.deviceName,
      });

      arecordProc.on("close", (code, signal) => {
        this.recording = false;
        this.ffmpegProcess = null;

        if (code === 0 || signal === "SIGKILL" || code === 137) {
          this._emitter.emit("end", {
            sessionId: this.sessionId!,
            outputFile,
          });
        } else {
          this._emitter.emit("error", {
            sessionId: this.sessionId!,
            err: new Error(`arecord exited with code ${code}`),
          });
        }
      });

      arecordProc.on("error", (err: Error) => {
        this.recording = false;
        this.ffmpegProcess = null;
        this._emitter.emit("error", {
          sessionId: this.sessionId!,
          err,
        });
      });

      return outputFile;
    }

    // ✅ FFmpeg fallback for Windows/macOS
    const input =
      platform === "win32"
        ? `audio=${this.deviceName ?? "default"}`
        : this.deviceName ?? ":0";

    const inputFormat = platform === "win32" ? "dshow" : "avfoundation";

    this.ffmpegProcess = ffmpeg()
      .input(input)
      .inputFormat(inputFormat)
      .audioCodec("pcm_s16le")
      .duration(this.duration)
      .format("wav")
      .on("start", () => {
        this._emitter.emit("start", {
          sessionId: this.sessionId!,
          device: this.deviceName,
        });
      })
      .on("end", () => {
        this.recording = false;
        this.ffmpegProcess = null;
        this._emitter.emit("end", {
          sessionId: this.sessionId!,
          outputFile,
        });
      })
      .on("error", (err: Error) => {
        this.recording = false;
        this.ffmpegProcess = null;
        this._emitter.emit("error", {
          sessionId: this.sessionId!,
          err,
        });
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
