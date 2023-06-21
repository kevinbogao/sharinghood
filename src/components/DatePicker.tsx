import type { FC } from "react";
import type { DateRange } from "react-day-picker";
import { DayPicker } from "react-day-picker";

import { TIME_FRAME } from "../lib/db/enums";
import { Select } from "./Select";

interface IDatePicker {
  range?: DateRange;
  setRange: (range?: DateRange) => void;
}

export const DatePicker: FC<IDatePicker> = ({ range, setRange }) => (
  <div>
    <Select values={TIME_FRAME} />
    <DayPicker mode="range" onSelect={setRange} selected={range} style={{ margin: 0, padding: 0 }} />
  </div>
);
