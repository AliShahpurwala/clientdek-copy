import React, { useState, useEffect } from "react";
import EditablePopup from "../../../components/popups/EditablePopup";
import ClientdekDatePicker from "../../../components/DatePicker";
import ClientdekTimePicker from "../../../components/TimePicker";
import DescriptionForm from "../../../components/DescriptionForm";
import InputText from "../../../components/inputs/InputText";
import { useSnackBarContext } from "../../../components/SnackBarProvider";
import apiHandler from "../../../utils/ApiHandler";
import dayjs from "dayjs";
import InputForm from "../../../components/InputForm";
import { MdEvent, MdAlarm, MdInfo } from "react-icons/md";
import { PopupText, PopupHeading3, PopupHeading2 } from "../../../components/text/PopupText";
export default function EditAppointment({ show, setShowAppointment, setShowDeleteAppointment, defaultAppointmentInfo, rerender }) {
    const { showSnackBar } = useSnackBarContext();
    const editAppointment = (appointmentInfo) => {
        apiHandler.patch(`/events/appointments/${appointmentInfo.appointment_id}`, {
            name: appointmentInfo.name,
            description: appointmentInfo.description,
            time: appointmentInfo.start_time.toISOString(),
            length: appointmentInfo.end_time.diff(appointmentInfo.start_time, 'second'),
            appointment_type: appointmentType,
            user_list: 1
        })
            .then(() => {
                rerender();
                setShowAppointment(false);
                showSnackBar("Appointment edited successfully", "INFO");
            })
            .catch((error) => {
                if (error.response && error.response.status === 400) {
                    showSnackBar("Appointment edit failed", "ERROR");
                }
                console.error(error);
            });
    };


    const appointmentIDTypeMap = {
        1: "Surgery",
        2: "Examination",
        3: "Consultation",
        4: "Check-up",
        5: "Follow-up"
    }

    const [appointmentInfo, setAppointmentInfo] = useState(defaultAppointmentInfo);
    const [appointmentType, setAppointmentType] = useState(defaultAppointmentInfo.appointment_type);
    //set appointmentInfo to be defaultAppointmentInfo if defaultAppointmentInfo changes
    useEffect(() => {
        setAppointmentInfo(defaultAppointmentInfo);
    }, [defaultAppointmentInfo]);

    const updateAppointment = () => {
        editAppointment(appointmentInfo);
    }
    return (

        <EditablePopup
            show={show}
            close={() => setShowAppointment(false)}
            title={<p>{appointmentInfo.name}</p>}
            save={updateAppointment}
            onDelete={
                () => {
                    setShowAppointment(false);
                    setShowDeleteAppointment(true);
                }
            }
            viewBody={
                <>
                    <div className="flex flex-col">
                        <div className="mb-4">
                            <PopupHeading2>
                                <MdAlarm className="inline-block mr-2" />
                                Appointment Time:
                            </PopupHeading2>
                            <PopupText>
                                {`${dayjs(appointmentInfo.start_time).format("MMM DD, YYYY h:mm A")} - ${dayjs(appointmentInfo.end_time).format("h:mm A")}`}
                            </PopupText>
                        </div>
                        <div className="mb-4">
                            <PopupHeading2>
                                <MdEvent className="inline-block mr-2" />
                                Type:
                            </PopupHeading2>
                            <PopupText>
                                {appointmentIDTypeMap[appointmentInfo.appointment_type]}
                            </PopupText>
                        </div>
                        <div className="mb-4">
                            <PopupHeading3>
                                Description:
                            </PopupHeading3>
                            <PopupText>
                                {appointmentInfo.description}
                            </PopupText>
                        </div>
                    </div>

                </>
            }
            editBody={
                <div className="w-7/12 mx-auto">
                    <div className="space-y-4">
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
                            <div>
                                <p>Description</p>
                                <DescriptionForm
                                    description={appointmentInfo.description}
                                    setDescription={(e) => setAppointmentInfo({ ...appointmentInfo, description: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                </div>
            }
        />)
}