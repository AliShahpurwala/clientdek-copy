// InputDate.js

import React, { useState, useEffect } from "react";
import InputField from "./InputField";

function InputDate({
  name,
  value,
  onChange,
  disabled,
  errorMsg,
  validate,
  dateValidationFunction,
  updateError,
}) {
  const [error, setError] = useState(false);

  useEffect(() => {
    if (validate) {
      const isValid = dateValidationFunction(value);
      setError(!isValid);
      updateError && updateError(!isValid);
    }
  }, [validate, value, dateValidationFunction, updateError]);

  return (
    <InputField disabled={disabled} error={error} errorMsg={errorMsg}>
      <input name={name} type="date" value={value} onChange={onChange} />
    </InputField>
  );
}

export default InputDate;
