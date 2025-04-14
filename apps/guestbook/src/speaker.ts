import * as fs from "node:fs";
import * as path from "node:path";
import { tmpdir } from "node:os";
import { randomUUID } from "node:crypto";
import { PvSpeaker } from "npm:@picovoice/pvspeaker-node";
import ffmpeg from "npm:fluent-ffmpeg";
import ffmpegPath from "npm:ffmpeg-static";

ffmpeg.setFfmpegPath(ffmpegPath!);

export class AudioPlayer {
  private speaker: PvSpeaker | null = null;
  private sampleRate: number;
  private bitsPerSample: number;
  private deviceIndex: number;

  constructor(
    options = {
      sampleRate: 16000,
      bitsPerSample: 16,
      deviceIndex: 1,
    }
  ) {
    this.sampleRate = options.sampleRate;
    this.bitsPerSample = options.bitsPerSample;
    this.deviceIndex = options.deviceIndex;
  }

  async playFile(filePath: string): Promise<void> {
    const rawPath = path.join(tmpdir(), `${randomUUID()}.raw`);

    try {
      const pcmBuffer = await this.decodeAudioToPCM(filePath, rawPath);

      this.speaker = new PvSpeaker(this.sampleRate, this.bitsPerSample, {
        deviceIndex: this.deviceIndex,
      });

      this.speaker.start();

      const bytesPerSample = this.bitsPerSample / 8;
      const pcmChunks = this.splitBuffer(
        pcmBuffer,
        this.sampleRate * bytesPerSample
      );

      for (const chunk of pcmChunks) {
        let written = 0;
        while (written < chunk.byteLength) {
          const len = this.speaker.write(chunk.slice(written));
          written += len * bytesPerSample;
        }
      }

      this.speaker.flush();
      this.speaker.stop();
      this.speaker.release();
      this.speaker = null;
    } catch (err) {
      console.error("Playback failed:", err);
    } finally {
      if (fs.existsSync(rawPath)) fs.unlinkSync(rawPath);
    }
  }

  listDevices(): string[] {
    return PvSpeaker.getAvailableDevices();
  }

  private decodeAudioToPCM(
    inputPath: string,
    outputRawPath: string
  ): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .audioCodec("pcm_s16le")
        .audioChannels(1)
        .audioFrequency(this.sampleRate)
        .format("s16le")
        .save(outputRawPath)
        .on("end", () => {
          const buffer = fs.readFileSync(outputRawPath);
          resolve(
            buffer.buffer.slice(
              buffer.byteOffset,
              buffer.byteOffset + buffer.byteLength
            )
          );
        })
        .on("error", (err: never) => reject(err));
    });
  }

  private splitBuffer(arrBuf: ArrayBuffer, chunkSize: number): ArrayBuffer[] {
    const inputArray = new Uint8Array(arrBuf);
    const chunks: ArrayBuffer[] = [];

    for (let i = 0; i < inputArray.length; i += chunkSize) {
      const end = Math.min(i + chunkSize, inputArray.length);
      const chunk = new Uint8Array(inputArray.slice(i, end));
      chunks.push(chunk.buffer);
    }

    return chunks;
  }
}
