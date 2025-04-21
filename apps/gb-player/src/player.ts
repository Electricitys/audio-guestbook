import { audioFileManager } from "./audio.ts";
import { AudioRecorder } from "./recorder.ts";
import { AudioPlayer } from "./speaker.ts";
import { ConfigProps } from "./utils/config-db.ts";

export class Player {
  private audioPlayer: AudioPlayer;
  private audioRecorder: AudioRecorder;

  constructor(config: ConfigProps) {
    this.audioPlayer = new AudioPlayer(config, {
      deviceName: Deno.env.get("PLAYER_OUTPUT_DEVICE"),
    });

    this.audioRecorder = new AudioRecorder({
      deviceName: Deno.env.get("PLAYER_INPUT_DEVICE") as string,
      outputDir: "./recordings",
      audioFileManager: audioFileManager,
    });
  }
}
