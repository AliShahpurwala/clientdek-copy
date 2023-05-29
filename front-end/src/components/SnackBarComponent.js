import React from "react";
import { useSnackBarContext } from "./SnackBarProvider";
import Snackbar from "./Snackbar";

export default function SnackBarComponent() {
  const { snackBars, closeSnackBar } = useSnackBarContext();

  return (
    <div className="fixed bottom-2 right-2 z-50 p-4">
      {snackBars.map((snackBar, index) => (
        <div className="my-4">
          <Snackbar
            key={snackBar.id}
            snackBar={snackBar}
            index={index}
            closeSnackBar={closeSnackBar}
          />
        </div>
      ))}
    </div>
  );
}