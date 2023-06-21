import type { ComponentPropsWithoutRef } from "react";
import { forwardRef } from "react";

interface IInput extends Omit<ComponentPropsWithoutRef<"input">, "className"> {
  errText?: string;
  className?: ComponentPropsWithoutRef<"div">["className"];
}

export const Input = forwardRef<HTMLInputElement, IInput>(({ errText, className, ...rest }, ref) => (
  <div className={className}>
    <input
      className="flex h-10 w-full flex-1 rounded border border-neutral-300 px-3 py-2 text-sm font-light placeholder:italic placeholder:text-neutral-300 focus:border-black focus:outline-none"
      ref={ref}
      {...rest}
    />
    <p className={`text-[13px] text-red-500 ${errText ? "" : "opacity-0"}`} role="alert">
      {errText ?? "error"}
    </p>
  </div>
));

Input.displayName = "Input";
