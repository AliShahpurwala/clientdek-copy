import React from "react";

export default function PopupButton({ icon, name, onClick, error = false }) {
  return (
    <button
      onClick={onClick}
      className={`flex-shrink-0
                  inline-flex
                  items-center
                  justify-center
                  w-28
                  h-10
                  px-4
                  py-2
                  mb-4
                  mr-4
                  border
                  border-transparent
                  text-base
                  font-medium
                  rounded-md
                  ${!error ? "bg-primary-container" : "bg-error-container"}
                  ${!error ? "text-on-primary-container" : "text-on-error-container"}
                  hover:bg-opacity-80
                  dark:bg-${!error ? "primary-container-dark" : "error-container-dark"}
                  dark:text-${!error ? "on-primary-container-dark" : "on-error-container-dark"}
                  dark:hover:bg-opacity-80`}
    >
      <span className="mr-2">{icon}</span>
      {name}
    </button>
  );
}
