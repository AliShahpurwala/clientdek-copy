import React from "react";

export default function Banner( { content, visibility, closeBanner } ) {
  return (
    <div
      className={`${
        visibility ? "block" : "hidden"
      } bg-yellow-200 text-yellow-900 px-4 py-3 mb-2`}
      role="alert"
    >
      <span className="flex-1">{content}</span>
      <button onClick={closeBanner}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-white hover:text-gray-200"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
    </div>
  );
}
