import { useState, useEffect, React } from "react";
import Popup from "./Popup";
import PopupButton from "../buttons/PopupButton";
import PopupCornerButton from "../buttons/PopupCornerButton";
import { MdEdit, MdDelete, MdSave, MdCancel, MdOutlineClose } from "react-icons/md"; // Import the required icons from react-icons

export default function EditablePopup({ show, title, editTitle=title, viewBody, editBody, close, save, onDelete }) {
  const [edit, setEdit] = useState(false);

  useEffect(() => {
    setEdit(false);
  }, [show]);

  const deleteOption = onDelete !== null && onDelete !== undefined; // check if onDelete exists
  return (
      <Popup
        show={show}
        title={edit ? editTitle: title }
        body={edit ? editBody : viewBody}
        cornerButtons={
          <>
          <PopupCornerButton
            icon={
              <MdEdit />}
              onClick={() => setEdit((prevEdit) => !prevEdit)}
          />
          {edit ?
          <PopupCornerButton
            icon={
            <MdDelete />
            }
            onClick={onDelete}
            visible={deleteOption}
            error={true}
          />
          :
          <PopupCornerButton
          icon={<MdOutlineClose />}
          onClick={() => {
            setEdit(false);
            close();
          }}
          name="Close"
        />
          }
          </>
        }
        buttons={
          edit
            ? <div className="m-4">
                <PopupButton
                  icon={<MdSave />}
                  name="Save"
                  onClick={()=>{
                    setEdit(false);
                    save();
                  }}
                />
                <PopupButton
                  icon={<MdCancel />}
                  name="Cancel"
                  onClick={() => setEdit(false)}
                />
              </div>
            : null
        }
      />
  );
}
