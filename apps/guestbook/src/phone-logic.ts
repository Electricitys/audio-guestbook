import { audioPlayer, audioRecorder } from "./audio.ts";
import {
  onKeyCombo,
  ReverseVirtualKeyCodes as RVirtualKeyCodes,
} from "./utils/keycombo.ts";

export const launch = async () => {
  let recording = false;
  onKeyCombo(
    [
      RVirtualKeyCodes.LCONTROL,
      RVirtualKeyCodes.LSHIFT,
      RVirtualKeyCodes.SPACE,
    ],
    async () => {
      if (recording) {
        audioRecorder.stopRecording();
      } else {
        console.log(Deno.cwd());
        await audioPlayer.play("./audio/guest_welcome.wav");
        audioRecorder.startRecording();
      }
      recording = !recording;
    }
  );
};
