import React, { useState } from "react";
import CreatePopup from "../../../components/popups/CreatePopup";
import { useSnackBarContext } from "../../../components/SnackBarProvider";
import apiHandler from "../../../utils/ApiHandler";
import { useNavigate } from "react-router-dom";
import EditableClient from "./EditableClient";

export default function CreateClientPopup() {
  const navigate = useNavigate();
  const [clientData, setClientData] = useState(null);
  const { showSnackBar } = useSnackBarContext();

  const createClient = async (clientData) => {
    // Remove any empty fields from the clientData object
    const filteredData = removeEmptyFields(clientData);

    return apiHandler.post("/clients/", filteredData)
      .then(response => {
        if (response.status === 201) {
          showSnackBar("Client Created!", "INFO");
          return Object.values(response.data)[0];
        }
      })
      .catch(error => {
        console.error(error);
      });
  };

  const removeEmptyFields = obj => {
    // Recursively remove empty fields from the object
    const newObj = {};
    for (let key in obj) {
      const value = obj[key];
      if (value === null || value === undefined) {
        continue;
      } else if (Array.isArray(value) && value.length === 0) {
        continue;
      } else if (typeof value === "object") {
        const nestedObj = removeEmptyFields(value);
        if (Object.keys(nestedObj).length > 0) {
          newObj[key] = nestedObj;
        }
      } else if (value !== "") {
        newObj[key] = value;
      }
    }
    return newObj;
  };

  return (
    <CreatePopup
      title="Create Client"
      show={true}
      close={() => navigate('../')}
      create={async () => {
        var client_id = await createClient(clientData);
        if (client_id) {
          navigate(`../${client_id}`);
        } else {
          navigate('../');
        }
      }}
      body={<EditableClient onChange={setClientData} />}
    />
  );
}
