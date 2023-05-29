// InputDropdown.js

import React from "react";
import InputField from "./InputField";

function InputDropdown({ name, value, onChange, disabled, error, errorMsg, options }) {
  return (
    <InputField disabled={disabled} error={error} errorMsg={errorMsg}>
      <select name={name} value={value} onChange={onChange}>
        {options.map((option, index) => (
          <option key={index} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </InputField>
  );
}

export default InputDropdown;
