import { PvRecorder } from "@picovoice/pvrecorder-node";
import * as fs from "fs";
import * as path from "path";

interface AudioGuestbookOptions {
  deviceIndex?: number;
  outputDir?: string;
  frameLength?: number;
}

export class AudioGuestbook {
  private deviceIndex: number;
  private outputDir: string;
  private frameLength: number;
  private recorder: PvRecorder | null;
  private recording: boolean;
  private chunks: Buffer[];
  private sessionId: string | null;

  constructor({
    deviceIndex = -1,
    outputDir = "./recordings",
    frameLength = 512,
  }: AudioGuestbookOptions = {}) {
    this.deviceIndex = deviceIndex;
    this.outputDir = outputDir;
    this.frameLength = frameLength;
    this.recorder = null;
    this.recording = false;
    this.chunks = [];
    this.sessionId = null;

    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  static listDevices(): string[] {
    return PvRecorder.getAvailableDevices();
  }

  startRecording(sessionId: string = `guest_${Date.now()}`): void {
    if (this.recording) {
      console.warn("Already recording!");
      return;
    }

    this.sessionId = sessionId;
    this.recorder = new PvRecorder(this.deviceIndex, this.frameLength);
    this.recorder.start();
    this.recording = true;
    this.chunks = [];

    console.log(`🎙️ Recording started for session: ${this.sessionId}`);

    this.recorder.on("data", (pcmFrame: number[]) => {
      const buffer = Buffer.from(new Int16Array(pcmFrame).buffer);
      this.chunks.push(buffer);
    });
  }

  async stopRecording(): Promise<string | undefined> {
    if (!this.recording || !this.recorder || !this.sessionId) {
      console.warn("Not currently recording.");
      return;
    }

    this.recording = false;
    await this.recorder.stop();
    this.recorder.release();

    const filePath = path.join(this.outputDir, `${this.sessionId}.pcm`);
    fs.writeFileSync(filePath, Buffer.concat(this.chunks));

    console.log(`💾 Recording saved to: ${filePath}`);
    return filePath;
  }
}
