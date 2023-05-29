import React, { useRef } from "react";
import { PopupHeading1 } from "../text/PopupText";

export default function Popup({ title, body, cornerButtons, buttons, show =true}) {
  const popupRef = useRef(null);
  const bodyRef = useRef(null);


  if (!show) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 flex justify-center items-center z-50 bg-black bg-opacity-50">
      <div
        ref={popupRef}
        className="py-4 px-12 rounded-xl shadow-lg bg-surface dark:bg-surface-dark flex flex-col items-start max-h-[70vh]"
      >
        <div className="w-full flex items-center">
          <div className="flex-grow text-xl font-semibold text-center break-words">
            
            <div className="whitespace-pre-wrap">
            <PopupHeading1>
              {title}
            </PopupHeading1>
            </div>
          </div>
          <div className="flex">
            {cornerButtons}
          </div>
        </div>
        <div
          ref={bodyRef}
          className={`mt-4 overflow-x-hidden overflow-y-hidden flex flex-col flex-grow`}
        >
          {body}
        </div>
        <div className="flex justify-center mt-4 w-full">
          {buttons}
        </div>
      </div>
    </div>
  );
}
