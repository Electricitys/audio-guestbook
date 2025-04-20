import { AudioRecorder } from "./recorder.ts";
import { AudioPlayer } from "./speaker.ts";

export class Player {
  private audioPlayer: AudioPlayer;
  private audioRecorder: AudioRecorder;

  constructor() {
    this.audioPlayer = new AudioPlayer({
      deviceName: Deno.env.get("PLAYER_OUTPUT_DEVICE"),
    });

    this.audioRecorder = new AudioRecorder({
      deviceName: Deno.env.get("PLAYER_INPUT_DEVICE"),
      outputDir: "./recordings",
    });
  }
}
