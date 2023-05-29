import React from "react";
import Appointment from "./Appointment";

const Day = ({ day, appointments, createAppointment, openAppointment}) => {


  return (
    <div className="relative flex-1 border border-surface-70 dark:border-surface-30">
      <div className="h-full">
        {Array.from({ length: 48}, (_, i) => i).map((hour, index) => (
          <div
            key={index}
            className="flex items-center border-t border-surface-70 dark:border-surface-30 w-full h-[1/48]"
            style={{ height: "5rem" }}
            onClick={() => createAppointment(day.hour(hour / 2).minute(hour % 2 === 0 ? 0 : 30).startOf("minute"))}
          >
          </div>
        ))}
        {appointments.map((appointment) => (
          <Appointment key={appointment.appointment_id} appointment={appointment} day={day} openAppointment={openAppointment} />
        ))}
      </div>
    </div>
  );
};

export default Day;