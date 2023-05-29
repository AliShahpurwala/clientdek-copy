import React, { useContext, useState } from "react";

export const SnackBarContext = React.createContext();

export const useSnackBarContext = () => {
  var context = useContext(SnackBarContext);
  if (!context) {
    throw new Error("Snackbar context not available");
  }
  return context;
};

export const SnackBarProvider = ({ children }) => {
  const [snackBars, setSnackBars] = useState([]);

  const showSnackBar = (content, snackBarType) => {
    const id = Date.now();
    setSnackBars((prevSnackBars) => [
      ...prevSnackBars,
      { show: true, content: content, snackBarType: snackBarType, id: id },
    ]);
  };

  const closeSnackBar = (id) => {
    setSnackBars((prevSnackBars) =>
      prevSnackBars.filter((snackBar) => snackBar.id !== id)
    );
  };

  return (
    <div>
        <SnackBarContext.Provider value={{ snackBars, showSnackBar, closeSnackBar }}>
        {children}
        </SnackBarContext.Provider>
    </div>

  );
};

