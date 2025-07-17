import * as React from "react";
import { cn } from "../../lib/utils";

const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-3xl bg-gradient-to-br from-indigo-500 via-blue-400 to-purple-300 shadow-xl p-6",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

export { Card };