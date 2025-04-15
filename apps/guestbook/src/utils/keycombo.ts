import { KeyboardHook, VirtualKeyCodes } from "jsr:@nktkas/keyboard-hook";

type VirtualKeyValue = (typeof VirtualKeyCodes)[keyof typeof VirtualKeyCodes];

export const ReverseVirtualKeyCodes: Record<VirtualKeyValue, number> = (
  Object.entries(VirtualKeyCodes) as [unknown, VirtualKeyValue][]
)
  .map(([key, value]) => [key as number, value])
  .reduce((acc, [key, value]) => {
    acc[value as VirtualKeyValue] = Number(key);
    return acc;
  }, {} as Record<VirtualKeyValue, number>);

const hook = new KeyboardHook();
const pressedKeys = new Set<number>();

export function onKeyCombo(keys: number[], callback: () => void) {
  hook.addEventListener("keydown", (event) => {
    pressedKeys.add(event.detail.vkCode);
    if (
      keys.every((key) => {
        return pressedKeys.has(key);
      })
    ) {
      callback();
    }
  });

  hook.addEventListener("keyup", (event) => {
    pressedKeys.delete(event.detail.vkCode);
  });
}
