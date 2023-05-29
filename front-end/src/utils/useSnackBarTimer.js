import { useState, useEffect } from "react";

const useSnackBarTimer = (callback, duration) => {
  const [timerId, setTimerId] = useState(null);

  useEffect(() => {
    if (timerId === null) {
      const newTimerId = setTimeout(() => {
        callback();
      }, duration);

      setTimerId(newTimerId);
    }

    return () => {
      if (timerId) {
        clearTimeout(timerId);
      }
    };
  }, [timerId, duration, callback]);

  return { clearTimer: () => clearTimeout(timerId) };
};

export default useSnackBarTimer;
