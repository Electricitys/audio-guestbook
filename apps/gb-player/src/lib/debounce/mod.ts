interface DebounceOptions {
  leading?: boolean;
  trailing?: boolean;
}

export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number,
  options: DebounceOptions = {}
): (this: ThisParameterType<T>, ...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<T> | null = null;
  let lastThis: ThisParameterType<T> | undefined;
  let called = false;

  const { leading = false, trailing = true } = options;

  const invoke = () => {
    if (trailing && lastArgs) {
      func.apply(lastThis, lastArgs);
      lastArgs = null;
    }
    timeoutId = null;
    called = false;
  };

  return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    lastArgs = args;
    lastThis = this;

    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    if (leading && !called) {
      func.apply(this, args);
      called = true;
    }

    timeoutId = setTimeout(invoke, wait);
  };
}
