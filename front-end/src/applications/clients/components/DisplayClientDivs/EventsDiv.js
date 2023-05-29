import React, { useState, useEffect } from "react";
import AppointmentDiv from "./AppointmentDiv";
import JournalDiv from "./JournalDiv";
import { PopupHeading2 } from "../../../../components/text/PopupText";

const EventsDiv = ({ journalDetails, appointmentDetails }) => {
  const [combinedData, setCombinedData] = useState([]);

  useEffect(() => {
    const combined = [...journalDetails, ...appointmentDetails].sort((a, b) => {
      const dateA = a.start_time || a.timestamp;
      const dateB = b.start_time || b.timestamp;
      return new Date(dateB) - new Date(dateA);
    });
    setCombinedData(combined);
  }, [journalDetails, appointmentDetails]);

  const findAppointment = (appointmentId) => {
    return appointmentDetails.find((a) => a.appointment_id === appointmentId);
  };

  if (combinedData.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col overflow-hidden">
      <div className="text-center mb-4">
        <PopupHeading2> Events</PopupHeading2>
      </div>

      <div className="flex-grow flex flex-col overflow-hidden">
        <div className="overflow-y-auto flex-grow">
          <div className="mx-4">
            {combinedData.map((item, index) => {
              if (item.journal_entry_id && item.entry !== null) {
                const appointment = item.appointment_id
                  ? findAppointment(item.appointment_id)
                  : null;
                return (
                  <JournalDiv
                    key={`journal-${index}`}
                    journalEntry={item}
                    appointment={appointment}
                  />
                );
              } else if (item.appointment_id && item.start_time !== null) {
                return (
                  <AppointmentDiv
                    key={`appointment-${index}`}
                    appointment={item}
                  />
                );
              } else {
                return null;
              }
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventsDiv;
