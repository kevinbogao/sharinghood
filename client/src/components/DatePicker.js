import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { DateRangePicker } from 'react-dates';
import 'react-dates/initialize';
import 'react-dates/lib/css/_datepicker.css';

function DatePicker({
  isMobile,
  isVertical,
  dateNeed,
  dateReturn,
  setDateNeed,
  setDateReturn,
}) {
  const [focusedInput, setFocusedInput] = useState(null);

  return (
    <>
      <DateRangePicker
        startDate={dateNeed}
        startDateId="your_unique_start_date_id"
        endDate={dateReturn}
        endDateId="your_unique_end_date_id"
        onDatesChange={({ startDate, endDate }) => {
          setDateNeed(startDate);
          setDateReturn(endDate);
        }}
        focusedInput={focusedInput}
        onFocusChange={(focusedInput) => setFocusedInput(focusedInput)}
        orientation={isMobile ? 'vertical' : 'horizontal'}
        withFullScreenPortal={isMobile || isVertical}
        displayFormat="yyyy.MM.DD"
        hideKeyboardShortcutsPanel
      />
      <style jsx global>
        {`
          @import './src/assets/scss/index.scss';

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
        `}
      </style>
    </>
  );
}

DatePicker.propTypes = {
  isMobile: PropTypes.bool.isRequired,
  isVertical: PropTypes.bool,
  setDateNeed: PropTypes.func.isRequired,
  setDateReturn: PropTypes.func.isRequired,
};

DatePicker.defaultProps = {
  isVertical: false,
};

export default DatePicker;
