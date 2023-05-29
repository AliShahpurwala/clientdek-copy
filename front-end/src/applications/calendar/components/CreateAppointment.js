import React, { useState, useEffect, useContext } from "react";
import CreatePopup from "../../../components/popups/CreatePopup";
import ClientdekDatePicker from "../../../components/DatePicker";
import ClientdekTimePicker from "../../../components/TimePicker";
import DescriptionForm from "../../../components/DescriptionForm";
import InputText from "../../../components/inputs/InputText";
import MultiSelect from "../../../components/MultiSelect";
import { useSnackBarContext } from "../../../components/SnackBarProvider";
import apiHandler from "../../../utils/ApiHandler";
import InputForm from "../../../components/InputForm";
export default function EditAppointment({show, setShow, defaultAppointmentInfo, rerender}){

    const [appointmentInfo, setAppointmentInfo] = useState(defaultAppointmentInfo);
    const [appointmentType, setAppointmentType] = useState(null)
    //set appointmentInfo to be defaultAppointmentInfo if defaultAppointmentInfo changes
    useEffect(() => {
        setAppointmentInfo(defaultAppointmentInfo);
    }, [defaultAppointmentInfo]);
    const { showSnackBar } = useSnackBarContext();
    const createAppointment = () => {
        var client_list = [];
        var user_list = [];
        //create a for loop to loop through the user list and create a new form data for each user
        for (let i = 0; i < appointmentInfo.user_list.length; i++) {
            user_list.push(appointmentInfo.user_list[i].user_id);
        }
        //create a for loop to loop through the user list and create a new form data for each user
        for (let i = 0; i < appointmentInfo.client_list.length; i++) {
            client_list.push(appointmentInfo.client_list[i].client_id);
        }
        

        const formData = new FormData();
        formData.append("name", appointmentInfo.name);
        formData.append("description", appointmentInfo.description);
        formData.append("time", appointmentInfo.start_time.toISOString());
        formData.append("appointment_type", appointmentType);
        formData.append("length", appointmentInfo.end_time.diff(appointmentInfo.start_time, 'second'));
        //create a for loop to loop through the user list and create a new form data for each user
        user_list.map((user_id) => {
            formData.append("user_list", user_id);
            return user_id;
        });
        client_list.map((client_id) => {
            formData.append("client_list", client_id);
            return client_id;
        });
      
          const response = apiHandler.post("/events/appointments/", formData)
          .then(response => {
            console.log(response);
            if (response.status === 201) {
                rerender();
                showSnackBar("Appointment created successfully", "INFO");
                
              } else {
                showSnackBar("Appointment creation failed", "ERROR");
                
                }})
            .catch(error => {
            console.error(error);
            showSnackBar("Appointment creation failed", "ERROR");
            });
          setShow(false);
      };
      



    return(
        <CreatePopup
                show={show}
                close={() => {
                    setShow(false);
                }}
                create={() => { createAppointment(); }}
                title={<p>Create Appointment</p>}
                body={
                    <div className="overflow-y-auto space-y-4 p-2">
                        <div>
                        <p className="text-left">Name</p>
                        <InputText
                            placeholder="Enter name here..."
                            value={appointmentInfo.name}
                            onChange={(e) => setAppointmentInfo({ ...appointmentInfo, name: e.target.value })}
                        />
                        </div>
                        <div>
                            <InputForm value={appointmentType} name="appointment_type" type="select" selectableOptions={["Check-up", "Follow-up", "Examination", "Consultation", "Surgery"]} handleText={(e) => { setAppointmentType(e.target.value); }} />
                        </div>
                        <div>
                            <p className="text-left">Add clients</p>
                            <MultiSelect
                                apiSubPath={`/clients/?query=`}
                                placeholder="Add Clients to Appointment"
                                value={appointmentInfo.name}
                                handleChange={(client_list) => { setAppointmentInfo({ ...appointmentInfo, client_list: client_list }) }}
                            />
                        </div>
                        <div>
                            <p className="text-left">Add users</p>
                            <MultiSelect
                                apiSubPath={`/users/?name=`}
                                placeholder="Add Users to Appointment"
                                value={appointmentInfo.name}
                                handleChange={(user_list) => { setAppointmentInfo({ ...appointmentInfo, user_list: user_list }) }}
                            />
                        </div>
                        <div>
                        <p className="text-left">Start Time</p>
                        <div className="flex justify-center space-x-4">
                            <ClientdekDatePicker
                            selectedDate={appointmentInfo.start_time}
                            handleDateChange={(date) => {
                                setAppointmentInfo((prevState) => ({
                                    ...prevState,
                                    start_time: prevState.start_time ? prevState.start_time.date(date.date()).month(date.month()).year(date.year()) : date
                                  }));
                            }}
                            />
                            <ClientdekTimePicker
                            selectedTime={appointmentInfo.start_time}
                            handleTimeChange={(time) => {
                                setAppointmentInfo((prevState) => ({
                                    ...prevState,
                                    start_time: prevState.start_time ? prevState.start_time.hour(time.hour()).minute(time.minute()) : time
                                  }));
                            }}
                            />
                        </div>
                        </div>

                        <div>
                        <p className="text-left">End Time</p>
                        <div className="flex justify-center space-x-4">
                            <ClientdekDatePicker
                            selectedDate={appointmentInfo.end_time}
                            handleDateChange={(date) => setAppointmentInfo({ ...appointmentInfo, end_time: date })}
                            />
                            <ClientdekTimePicker
                            selectedTime={appointmentInfo.end_time}
                            handleTimeChange={(date) => setAppointmentInfo({ ...appointmentInfo, end_time: appointmentInfo.end_time.hour(date.hour()).minute(date.minute()) })}
                            />
                        </div>
                        </div>

                        {/* <div>
                        <p className="text-left">Timezone</p>
                        </div> */}

                        <div>
                        <p>Description</p>
                        <DescriptionForm
                            description={appointmentInfo.description}
                            setDescription={(e) => setAppointmentInfo({ ...appointmentInfo, description: e.target.value })}
                        />
                        </div>
                    </div>
                }
            />
    )
}