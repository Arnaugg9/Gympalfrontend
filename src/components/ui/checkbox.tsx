"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { cn } from "./utils";

function Checkbox({ className, children, ...props }: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      className={cn(
        "inline-flex h-5 w-5 appearance-none items-center justify-center rounded border border-slate-300 bg-white text-white transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator>
        <Check className="h-4 w-4 text-emerald-500" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
