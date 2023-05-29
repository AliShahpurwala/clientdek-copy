import React from "react";

export default function PopupCornerButton({ icon, onClick, error = false, visible=true}) {
  if (!visible) return null;
  return (
    <button
        onClick={onClick}
        className={`flex
                    rounded-md
                    text-2xl
                    text-${!error ? "on-surface-variant" : "error" }
                    hover:bg-opacity-80 
                    focus:outline-none 
                    focus:ring-2 
                    focus:ring-offset-2 
                    focus:ring-blue-500  
                    dark:text-${!error ? "on-surface-variant-dark" : "on-error-container-dark" } 
                    dark:hover:bg-opacity-80 
                    dark:focus:ring-2 
                    dark:focus:ring-offset-2 
                    dark:focus:ring-blue-500`}
        
    >
      {icon}
    </button>
  );
}