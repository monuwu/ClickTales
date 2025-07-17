import * as React from "react";
import { cn } from "../../lib/utils";

export function Switch({ checked, onChange, className, ...props }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange && onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-12 items-center rounded-full bg-indigo-300 transition focus:outline-none",
        checked ? "bg-indigo-600" : "",
        className
      )}
      {...props}
    >
      <span
        className={cn(
          "inline-block h-5 w-5 transform rounded-full bg-white shadow transition",
          checked ? "translate-x-6" : "translate-x-1"
        )}
      />
    </button>
  );
}