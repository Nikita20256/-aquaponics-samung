import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './DatePicker.css';

const CustomDatePicker = ({ selected, onChange, ...props }) => {
  return (
    <DatePicker
      selected={selected}
      onChange={onChange}
      dateFormat="dd.MM.yyyy HH:mm"
      showTimeSelect
      timeFormat="HH:mm"
      timeIntervals={10}
      {...props}
    />
  );
};

export default CustomDatePicker;