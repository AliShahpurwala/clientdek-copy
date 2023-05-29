import React, { useEffect } from "react";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(timezone)
const Appointment = ({ appointment, day, openAppointment }) => {


  const appointmentTypeColourMap = {
    "Check-up": "bg-blue-300",
    "Follow-up": "bg-green-500",
    "Surgery": "bg-red-500",
    "Examination": "bg-purple-500",
    "Consultation": "bg-orange-500"
  }


  dayjs.tz.setDefault("America/Toronto") // Can be updated in the future
  const startDateTime = dayjs(appointment.start_time);
  const endDateTime = dayjs(appointment.end_time);
  const isInDay = startDateTime.isSame(day, "day") || endDateTime.isSame(day, "day") || (startDateTime.isBefore(day, "day") && endDateTime.isAfter(day, "day"));

  const startTime = startDateTime.isSame(day, "day") ? (startDateTime.hour()*60 + startDateTime.minute())/60: 0;
  const endTime = endDateTime.isSame(day, "day") ? (endDateTime.hour()*60 + endDateTime.minute())/60: 24;
  useEffect(() => { console.log(appointment.appointment_type); })


  if (!isInDay) return null;

  const duration = (endTime - startTime);
  

  return (
    <div
      className={`absolute left-0 right-0 ${appointment.appointment_type ? appointmentTypeColourMap[appointment.appointment_type] : "bg-blue-500"} text-white p-2 rounded-md`}
      style={{
        top: `${(startTime) * 10}rem`,
        height: `${(duration) * 10}rem`,
      }}
      onClick={() => openAppointment(appointment)}
    >
      {appointment.name}
    </div>
  );
};

export default Appointment;