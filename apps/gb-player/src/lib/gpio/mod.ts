export type GpioOptions = {
  chip?: string;
  bias?: "disable" | "pull-up" | "pull-down";
  signal?: AbortSignal;
};

export async function readPins(
  pins: number[],
  options?: GpioOptions
): Promise<{ pin: number; value: boolean }[]> {
  pins = pins
    .filter((pin) => Number.isInteger(pin))
    .toSorted((a, b) => a - b)
    .filter((p, i, s) => i === 0 || s[i - 1] !== p);

  const commandArgs: string[] = [];

  if (options?.bias) commandArgs.push("--bias", options.bias);
  commandArgs.push(options?.chip || "gpiochip0");
  commandArgs.push(...pins.map((pin) => String(pin)));

  const result = await new Deno.Command("/usr/bin/gpioget", {
    args: commandArgs,
    signal: options?.signal,
  }).output();

  if (!result.success) throw new Error(`Can't access gpio values`);

  const output = new TextDecoder().decode(result.stdout).trim();
  const pinStatuses = output.split(/\s+/).map((s) => s === "1");

  if (pinStatuses.length !== pins.length) {
    throw new Error(`'Can't read gpio values`);
  }

  return pins.map((pin, index) => ({ pin, value: pinStatuses[index] }));
}

export function monitorPins(
  pins: number[],
  onEvent: (pin: number, state: boolean) => unknown,
  options?: GpioOptions
): { stop: (force?: boolean) => Promise<void> } {
  pins = pins
    .filter((pin) => Number.isInteger(pin))
    .toSorted((a, b) => a - b)
    .filter((p, i, s) => i === 0 || s[i - 1] !== p);

  const commandArgs: string[] = [];

  if (options?.bias) commandArgs.push("--bias", options.bias);
  commandArgs.push("--format", "[%o:%e]");
  commandArgs.push("--line-buffered");
  commandArgs.push(options?.chip || "gpiochip0");
  commandArgs.push(...pins.map((pin) => String(pin)));

  const command = new Deno.Command("/usr/bin/gpiomon", {
    args: commandArgs,
    stdin: "null",
    stderr: "null",
    stdout: "piped",
    signal: options?.signal,
  }).spawn();

  let readState = 0;
  let pinNumber: number | undefined;
  let pinState: boolean | undefined;

  const charStart = "[".charCodeAt(0);
  const charSeparator = ":".charCodeAt(0);
  const charEnd = "]".charCodeAt(0);

  // Parse output as a state machine
  command.stdout.pipeTo(
    new WritableStream({
      write: (value) => {
        value.forEach((char) => {
          switch (readState) {
            case 0:
              if (char === charStart) {
                readState = 1;
                pinNumber = undefined;
                pinState = undefined;
              }
              break;

            case 1:
              if (char >= 0x30 && char <= 0x39) {
                const digit = char - 0x30;
                pinNumber = (pinNumber ?? 0) * 10 + digit;
              } else if (char === charSeparator) {
                readState = 2;
              } else if (char === charStart) {
                pinNumber = undefined;
                pinState = undefined;
              } else {
                readState = 0;
              }
              break;

            case 2:
              if (char === 0x30 || char === 0x31) {
                pinState = char === 0x31;
              } else if (char === charStart) {
                readState = 1;
                pinNumber = undefined;
                pinState = undefined;
              } else {
                readState = 0;
                if (
                  char === charEnd &&
                  pinNumber !== undefined &&
                  pinState !== undefined
                ) {
                  try {
                    onEvent(pinNumber, pinState);
                  } catch {
                    /* */
                  }
                }
              }
          }
        });
      },
    })
  );

  const stop = async (force = false) => {
    try {
      command.kill(force ? "SIGKILL" : "SIGTERM");
    } catch {
      /* */
    }

    await command.status;
  };
  return { stop };
}
