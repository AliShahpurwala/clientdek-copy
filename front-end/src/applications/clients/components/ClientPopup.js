import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import EditablePopup from "../../../components/popups/EditablePopup";
import apiHandler from "../../../utils/ApiHandler";
import clientAppointments from "../utils/ClientAppointments";
import clientJournals from "../utils/ClientJournals";
import DisplayClient from "./DisplayClient";
import EditableClient from "./EditableClient";
import { useSnackBarContext } from "../../../components/SnackBarProvider";

export default function ClientPopup() {
  const { showSnackBar } = useSnackBarContext();
  const [clientDetails, setClientDetails] = useState({});
  const [editClientDetails, setEditClientDetails] = useState({});
  const [appointmentDetails, setAppointmentDetails] = useState([]);
  const [journalDetails, setJournalDetails] = useState([]);
  const navigate = useNavigate();
  let { client_id } = useParams();

  useEffect(() => {
    if (client_id !== null) {
      apiHandler
        .get(`/clients/${client_id}/`)
        .then((response) => {
          const updatedData = response.data;
          setClientDetails(updatedData);
        })
        .catch((error) => console.error(error));

      clientAppointments(client_id).then((appointments) => {
        setAppointmentDetails(appointments);
      });

      clientJournals(client_id).then((journals) => {
        setJournalDetails(journals);
      });
    }
  }, [client_id]);

  useEffect(() => {
    setEditClientDetails(clientDetails);
  }, [clientDetails]);

  const updateClient = () => {
    setClientDetails(editClientDetails)
    apiHandler.put(`/clients/${client_id}/`, editClientDetails)
      .then(response => {
        if (response.status === 200) {
          showSnackBar("Client Updated", "INFO");
          
        }
      })
      .catch(error => {
        showSnackBar("Error Updating Client", "ERROR");
        console.error(error);
      });
  };
  return (
    <EditablePopup
      show={true}
      title={
        <p>
          {clientDetails.name && ([
            clientDetails.name.prefix,
            clientDetails.name.first,
            clientDetails.name.middle,
            clientDetails.name.last,
            clientDetails.name.suffix,
          ].join(" "))}
        </p>
      }
      editTitle={<p>Edit Client</p>}
      viewBody={
        <DisplayClient
          clientDetails={clientDetails}
          appointmentDetails={appointmentDetails}
          journalDetails={journalDetails}
          client_id={client_id}
        />
      }
      editBody={
        <EditableClient
          initialData={editClientDetails}
          onChange={setEditClientDetails}
          />
      }
      close={() => navigate("../")}
      save={updateClient}
    />
  );
}
