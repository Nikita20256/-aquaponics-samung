import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './DatePicker.css';

// По умолчанию — только даты (без времени). Можно включить время через пропсы.
const CustomDatePicker = ({ selected, onChange, showTimeSelect = false, dateFormat, timeIntervals = 15, ...props }) => {
  const effectiveDateFormat = dateFormat || (showTimeSelect ? 'dd.MM.yyyy HH:mm' : 'dd.MM.yyyy');

  return (
    <DatePicker
      selected={selected}
      onChange={onChange}
      dateFormat={effectiveDateFormat}
      showTimeSelect={showTimeSelect}
      timeFormat={showTimeSelect ? 'HH:mm' : undefined}
      timeIntervals={showTimeSelect ? timeIntervals : undefined}
      {...props}
    />
  );
};

export default CustomDatePicker;