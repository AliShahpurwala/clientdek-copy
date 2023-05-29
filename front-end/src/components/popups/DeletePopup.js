import React from "react";
import Popup from "./Popup";
import PopupButton from "../buttons/PopupButton";
import { MdDelete, MdCancel } from "react-icons/md"; // Import the edit and delete icons from react-icons

export default function DeletePopup({ show, title, body = <p>Are you sure you want to delete this item?</p>, onDelete, onCancel}) {

  return (
      <Popup
        show={show}
        title={<div>{title}</div>}
        body={body}
        close={onCancel}
        save={onDelete}
        buttons={
          <div className="m-4">
            <PopupButton
              icon={<MdDelete />}
              name="Delete"
              onClick={onDelete}
              error={true}
            />
            <PopupButton
              icon={<MdCancel />}
              name="Cancel"
              onClick={onCancel}
              />
          </div>
        }
      
      />
  );
}
