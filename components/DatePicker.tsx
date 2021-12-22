import { useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { Moment } from "moment";
import { DateRangePicker, FocusedInputShape } from "react-dates";
import "react-dates/initialize";
import "react-dates/lib/css/_datepicker.css";
import { TimeFrame } from "../lib/types";

interface DatePickerProps {
  // timeFrame: TimeFrame;
  // setTimeFrame(timeFrame: TimeFrame): void;
  dateNeed: Moment | null;
  setDateNeed(dateNeed: Moment): void;
  dateReturn: Moment | null;
  setDateReturn(dateReturn: Moment): void;
}

export default function DatePicker({
  // timeFrame,
  dateNeed,
  dateReturn,
  // setTimeFrame,
  setDateNeed,
  setDateReturn,
}: DatePickerProps) {
  const { register, watch } = useFormContext();
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [focusedInput, setFocusedInput] = useState<FocusedInputShape | null>(
    null
  );

  // Set isMobile boolean value based on window width
  useEffect(() => {
    // Set isMobile on init
    setIsMobile(window.matchMedia("(max-width: 576px)").matches);

    // Set isMobile on screen size
    function handleWindowResize() {
      setIsMobile(window.matchMedia("(max-width: 576px)").matches);
    }

    // Event listener for screen resizing
    window.addEventListener("resize", handleWindowResize);

    // Return a function from the effect that removes the event listener
    return () => window.removeEventListener("resize", handleWindowResize);
  }, []);

  return (
    <>
      <p className="main-p">When do you need the item?</p>
      <select {...register("timeFrame")}>
        <option value={TimeFrame.ASAP}>As soon as possible</option>
        <option value={TimeFrame.RANDOM}>No time frame</option>
        <option value={TimeFrame.SPECIFIC}>Select time frame</option>
      </select>
      {watch("timeFrame") === "specific" && (
        <>
          <p className="main-p">By when do you need it?</p>
          <DateRangePicker
            startDate={dateNeed}
            startDateId="your_unique_start_date_id"
            endDate={dateReturn}
            endDateId="your_unique_end_date_id"
            onDatesChange={({ startDate, endDate }) => {
              setDateNeed(startDate!);
              setDateReturn(endDate!);
            }}
            focusedInput={focusedInput}
            onFocusChange={(focusedInput) => setFocusedInput(focusedInput)}
            orientation={isMobile ? "vertical" : "horizontal"}
            withFullScreenPortal
            displayFormat="yyyy.MM.DD"
            hideKeyboardShortcutsPanel
          />
        </>
      )}
      <style jsx global>
        {`
          @import "../pages/index.scss";

          select {
            font-size: 18px;
            padding-left: 10px;
            color: #a0998f;
            width: 300px;
            height: 40px;
            border-width: 0px;
            background: $grey-000;
            border-radius: 4px;
            margin-bottom: 12px;
          }

          .DateRangePicker {
            display: block;
            margin: 20px auto;
          }

          .DateInput {
            width: 127px;
            position: static;
          }

          .DateInput_input {
            color: #a0998f;
            font-size: 20px;
            background: $grey-000;
          }

          .DateInput_input__focused {
            border-bottom: 2px solid $orange;
          }

          .DateRangePickerInput__withBorder {
            border: none;
            background: $grey-000;
          }

          .DayPickerNavigation__verticalDefault {
            display: flex;
          }

          .CalendarDay__selected_span {
            background: $beige;
            border: 1px double $beige-100;
          }

          .CalendarDay__selected,
          .CalendarDay__selected:active,
          .CalendarDay__selected:hover {
            background: $orange;
            border: 1px double $orange;
          }

          .CalendarDay__selected_span:hover {
            background: $beige-100;
            border: 1px double $beige-100;
          }

          .CalendarDay__hovered_span,
          .CalendarDay__hovered_span:hover {
            color: $black;
            background: $beige;
            border: 1px double $beige-100;
          }

          .CalendarDay__blocked_out_of_range,
          .CalendarDay__blocked_out_of_range:active,
          .CalendarDay__blocked_out_of_range:hover {
            background: #fff;
            border: 1px solid #e4e7e7;
            color: #cacccd;
          }
        `}
      </style>
    </>
  );
}
