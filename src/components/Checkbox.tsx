import type { ComponentPropsWithoutRef } from "react";
import { forwardRef } from "react";

interface IInput extends Omit<ComponentPropsWithoutRef<"input">, "className" | "type"> {
  label: string;
  className?: ComponentPropsWithoutRef<"div">["className"];
}

export const Checkbox = forwardRef<HTMLInputElement, IInput>(({ label, className, ...rest }, ref) => (
  <div className={className}>
    <div className="mt-2 mb-3 flex flex-1 justify-between align-middle">
      <p className="text-sm">{label}</p>
      <input className="rounded border border-neutral-300 accent-black" ref={ref} type="checkbox" {...rest} />
    </div>
  </div>
));

Checkbox.displayName = "Checkbox";
