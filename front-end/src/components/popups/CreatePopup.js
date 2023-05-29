import React from "react";
import Popup from "./Popup";
import PopupButton from "../buttons/PopupButton";
import { MdCreate, MdCancel } from "react-icons/md"; // Import the required icons from react-icons

export default function CreatePopup({ show, title, body, close, create}) {

  return (
      <Popup
        show={show}
        title={title}
        body={body}
        buttons={
            <div className="m-4">
                <PopupButton
                  icon={<MdCreate />}
                  name="Create"
                  onClick={create}
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
