import React from "react";
import Popup from "./Popup";
import PopupButton from "../buttons/PopupButton";
import { MdCreate, MdCancel } from "react-icons/md"; // Import the required icons from react-icons

export default function UploadPopup({ show, title, body, close, upload}) {

  return (
      <Popup
        show={show}
        title={title}
        body={body}
        buttons={
            <div m-4>
                <PopupButton
                  icon={<MdCreate />}
                  name="Upload"
                  onClick={upload}
                />
                <PopupButton
                  icon={<MdCancel />}
                  name="Cancel"
                  onClick={close}
                />
              </div>
        }
      />
  );
}
