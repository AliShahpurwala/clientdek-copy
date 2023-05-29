// InputText.js

import React, { useState, useEffect } from "react";
import InputField from "./InputField";

function InputText({
  name,
  type,
  value,
  placeholder,
  onChange,
  disabled,
  errorMsg,
  pattern,
  validate,
  updateError,
}) {
  const [error, setError] = useState(false);

  useEffect(() => {
    if (validate) {
      const regex = new RegExp(pattern);
      const isValid = regex.test(value);
      setError(!isValid);
      updateError && updateError(!isValid);
    }
  }, [validate, value, pattern, updateError]);

  return (
    <InputField disabled={disabled} error={error} errorMsg={errorMsg}>
      <input
        name={name}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        pattern={pattern}
      />
    </InputField>
  );
}

export default InputText;
