import React from "react";
import dayjs from "dayjs";
import { MdLink } from "react-icons/md";
import { PopupHeading3, PopupText } from "../../../../components/text/PopupText";

function JournalDiv({ journalEntry, appointment }) {
  const { timestamp, entry } = journalEntry;
  const formattedTimestamp = dayjs(timestamp).format("MMM DD, YYYY h:mm A");

  return (
    <div className="mb-3">
      <div className="flex justify-between items-start">
        <PopupHeading3>Journal</PopupHeading3>
        {appointment && (
          <div className="flex items-center mt-1">
            <span className="ml-1">
              <PopupText>
                <MdLink className="inline mr-1" /> {appointment.name}
              </PopupText>
            </span>
          </div>
        )}
      </div>
      <div className="flex">
        <div>
          <PopupText>{formattedTimestamp}</PopupText>
        </div>
        <div className="flex-1 pl-4">
          <div>
            <PopupText>{entry}</PopupText>
          </div>
        </div>
      </div>
    </div>
  );
}

export default JournalDiv;
