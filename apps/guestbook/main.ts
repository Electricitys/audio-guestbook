import { audioRecorder } from "./src/audio.ts";
import rest from "./src/server.ts";
import { onKeyCombo, ReverseVirtualKeyCodes } from "./src/utils/keycombo.ts";

const PORT = 8000;
let recording = false;

onKeyCombo(
  [
    ReverseVirtualKeyCodes.LCONTROL,
    ReverseVirtualKeyCodes.LSHIFT,
    ReverseVirtualKeyCodes.SPACE,
  ],
  () => {
    if (recording) {
      audioRecorder.stopRecording();
    } else {
      audioRecorder.startRecording();
    }
    recording = !recording;
  }
);

// hook.addEventListener("keyup", (event) => {
//   console.log("Key up:", VirtualKeyCodes[event.detail.vkCode]);
// });

audioRecorder.emitter.on("start", ({ sessionId }) => {
  console.log(`Recording started with session ID: ${sessionId}`);
});
audioRecorder.emitter.on("end", ({ sessionId, outputFile }) => {
  console.log(`Recording ended with session ID: ${sessionId}\n ${outputFile}`);
});
audioRecorder.emitter.on("error", ({ sessionId, err }) => {
  console.log(`Recording error with session ID: ${sessionId}`);
  console.error(err);
});

console.log(`Server Listen on: http://localhost:${PORT}`);

rest.listen({ port: PORT });
