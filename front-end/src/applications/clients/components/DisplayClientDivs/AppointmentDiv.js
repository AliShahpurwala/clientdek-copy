import React from "react";
import dayjs from "dayjs";
import { PopupHeading3, PopupText } from "../../../../components/text/PopupText";

function AppointmentDiv({ appointment }) {
  const { start_time, end_time, name, appointment_type, description } =
    appointment;
  const formattedStartTime = dayjs(start_time).format("MMM DD, YYYY h:mm A");
  const formattedEndTime = dayjs(end_time).format("h:mm A");
  return (
    <div className="mb-3">
      <PopupHeading3>Appointment</PopupHeading3>
      <div className="flex justify-between items-start">
        <div>
          <PopupText>{name}</PopupText>
          <PopupText>
            {formattedStartTime} - {formattedEndTime}
          </PopupText>
          <PopupText>{description}</PopupText>
        </div>
        <div className="text-right">
          <PopupText>Type: {appointment_type}</PopupText>
        </div>
      </div>
    </div>
  );
}

export default AppointmentDiv;
