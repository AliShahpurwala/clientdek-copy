// InputField.js

import React from "react";

function InputField({ disabled, error, errorMsg, children }) {
  const baseClassName =
    `w-full p-2 my-1 rounded-lg outline-none outline-offset-0 border-outline-variant bg-white text-on-surface focus:outline-outline 
    dark:border-outline-variant-dark dark:bg-surface-40 dark:text-on-surface-dark dark:focus:outline-outline-dark`;

  const errorClassName =
    "outline-2 outline-error dark:outline-error-dark";

  const inputClassName = disabled
    ? `${baseClassName}`
    : error
    ? `${baseClassName} ${errorClassName}`
    : `${baseClassName}`;

  const inputWithError = (
    <div>
      {React.cloneElement(children, {
        className: inputClassName,
        disabled: disabled,
      })}
      {error && (
        <p className="text-xs text-error dark:text-error-dark">{errorMsg}</p>
      )}
    </div>
  );

  return <div>{inputWithError}</div>;
}

export default InputField;
