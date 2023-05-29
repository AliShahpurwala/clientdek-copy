import React, { useState } from "react";
import EditAppointment from "./components/EditAppointment";
import CreateAppointment from "./components/CreateAppointment";
import DeletePopup from "../../components/popups/DeletePopup";
import apiHandler from "../../utils/ApiHandler";
import { useSnackBarContext } from "../../components/SnackBarProvider";
import AppointmentCalendar from "./AppointmentCalendar/AppointmentCalendar";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers";
import dayjs from "dayjs";


//import next arrow and prev arrow from components
import PrimaryButton from "../../components/buttons/PrimaryButton";


export default function CalendarPage() {
  //set a boolean variable to rerender the page
  const [value, setValue] = useState(false);
    
    const [referenceDate, setReferenceDate] = useState(dayjs());

    const { showSnackBar } = useSnackBarContext();

    const [showAppointment, setShowAppointment] = useState(false);
    const [appointmentInfo, setAppointmentInfo] = useState("");
    
    const [showDeleteAppointment, setShowDeleteAppointment] = useState(false);
  
    const [createAppointmentPopup, setCreateAppointment] = useState(false);
    const [createAppointmentInfo, setCreateAppointmentInfo] = useState({
        start_time: null,
        end_time: null,
        name: "",
        description: "",
        user_list: [],
        client_list: []
      });

    const rerenderFunc = () => {
      setValue(!value);
    }

    const createAppointmentPopupFunc = (date) => {
        setCreateAppointment(true);
        setCreateAppointmentInfo({
            start_time: date,
            end_time: date.add(1, 'hour'),
            name: "",
            description: ""
          });
      };
    
    const openAppointmentFunc = (appointment) => {
      //translate start and end time to dayjs
      appointment.start_time = dayjs(appointment.start_time);
      appointment.end_time = dayjs(appointment.end_time);
      setShowAppointment(true);
      setAppointmentInfo(appointment);
    };

    const deleteAppointment = () => {
      apiHandler.delete(`/events/appointments/${appointmentInfo.appointment_id}`)
        .then(() => {
          setShowAppointment(false);
          setShowDeleteAppointment(false);
          showSnackBar("Appointment deleted successfully", "INFO");
          rerenderFunc();
        })
        .catch((error) => {
          if (error.response.status === 400) {
            setShowAppointment(false);
            setShowDeleteAppointment(false);
            showSnackBar("Appointment deletion failed", "ERROR");
            rerenderFunc();
          }
          console.error(error);
        });
    };
    


    return (
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <div className="h-full w-full flex flex-col">
          
          <div className="mb-3 flex justify-end">
            <div className= "w-1/4">
              <div className="flex justify-end space-x-2">
                <PrimaryButton
                  text="Previous"
                  onClick={() => {
                    setReferenceDate(referenceDate.subtract(7, "day"));
                  }}
                />
                <PrimaryButton text="Next" 
                  onClick={() => {
                    setReferenceDate(referenceDate.add(7, "day"));
                  }}
                />
              </div>
            </div>
          </div>
          <div className="h-full w-full bg-surface-95 dark:bg-surface-10 overflow-auto">
            <AppointmentCalendar
              numOfDays={7}
              hours={8}
              referenceDate={referenceDate}
              openAppointmentFunc={openAppointmentFunc}
              createAppointmentFunc={createAppointmentPopupFunc}
              rerender={value}
            />
          </div>
        </div>

        <DeletePopup
                        show={showDeleteAppointment}
                        onDelete={deleteAppointment}
                        onCancel={() => {
                            setShowDeleteAppointment(false);
                            setShowAppointment(true);}}
                        title="Delete Appointment"
                        body="Are you sure you want to delete this appointment?"

        />
        <EditAppointment
            show={showAppointment}
            setShowAppointment={setShowAppointment}
            setShowDeleteAppointment={setShowDeleteAppointment}
            defaultAppointmentInfo={appointmentInfo}
            rerender={rerenderFunc}
        />
        <CreateAppointment
            show={createAppointmentPopup}
            setShow={setCreateAppointment}
            defaultAppointmentInfo={createAppointmentInfo}
            rerender={rerenderFunc}
        />
      </LocalizationProvider>
    )
}