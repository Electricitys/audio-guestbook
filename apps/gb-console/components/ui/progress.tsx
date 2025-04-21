"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@/lib/utils";

interface ProgressProps
  extends Omit<React.ComponentProps<typeof ProgressPrimitive.Root>, "value"> {
  value: [number, number][];
}

function Progress({ className, value, ...props }: ProgressProps) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "bg-primary/20 relative h-2 w-full overflow-hidden rounded-full",
        className
      )}
      {...props}
    >
      {value.map(([start, end]) => (
        <ProgressPrimitive.Indicator
          data-slot="progress-indicator"
          className="bg-primary h-full w-full flex-1 transition-all"
          style={{ transform: `translateX(-${end - (start || 0)}%)` }}
        />
      ))}
    </ProgressPrimitive.Root>
  );
}

export { Progress };
