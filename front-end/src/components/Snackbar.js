import React from "react";
import { MdCheckCircle, MdWarning, MdClose } from "react-icons/md";
import useSnackBarTimer from "../utils/useSnackBarTimer";

const Snackbar = ({ snackBar, index, closeSnackBar }) => {
  const { snackBarType, content, id } = snackBar;

  const { clearTimer } = useSnackBarTimer(() => closeSnackBar(id), 5000);

  const snackBarColour = snackBarType === "INFO" ? "bg-primary dark:bg-primary-dark" : "bg-error dark:bg-error-dark";

  return (
    <div
      key={id}
      className={`fixed bottom-0 right-0 mb-4 ${
        index > 0 ? `translate-y-[${index * -100}%]` : ""
      } ${snackBarColour} min-w-[30%] text-white py-3 px-5 text-sm md:text-base rounded-lg shadow-lg mx-4 flex justify-between`}
      style={{
        transform: `translateY(${index * -100}% ) translateY(-${index * 10}px)`,
        transition: "transform 0.3s ease",
        zIndex: 10000 - index,
      }}
      id="snackbar"
    >
      <div className="flex items-center">
        {snackBarType === "INFO" ? (
          <MdCheckCircle className="mr-2" />
        ) : (
          <MdWarning className="mr-2" />
        )}
        <span>{content}</span>
      </div>
      <button
        className={`text-${
          snackBarType === "INFO" ? "on-primary" : "on-error"
        } dark:text-${
          snackBarType === "INFO" ? "on-primary-dark" : "on-error-dark"
        } hover:text-gray-300 font-bold ml-auto flex items-center`}
        onClick={() => {
          clearTimer();
          closeSnackBar(id);
        }}
      >
        <MdClose />
      </button>
    </div>
  );
};

export default Snackbar;
