import type { ComponentPropsWithoutRef } from "react";
import { forwardRef } from "react";

interface ISelect extends Omit<ComponentPropsWithoutRef<"select">, "className"> {
  className?: ComponentPropsWithoutRef<"div">["className"];
  values: Record<string, string>;
}

export const Select = forwardRef<HTMLSelectElement, ISelect>(({ values, className, ...rest }, ref) => (
  <div className={className}>
    <select className="h-10 w-full rounded border border-neutral-300 bg-white py-2 px-3 text-sm" ref={ref} {...rest}>
      {Object.entries(values).map(([key, value]) => (
        <option key={key} value={key}>
          {value}
        </option>
      ))}
    </select>
  </div>
));

Select.displayName = "Select";
