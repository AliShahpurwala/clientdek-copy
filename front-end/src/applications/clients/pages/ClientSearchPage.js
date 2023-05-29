import React, { useState} from "react";
import { useNavigate, Routes, Route } from "react-router-dom";
import SearchBar from "../../../components/SearchBar";
import Table from "../../../components/Table";
import CreateClientPopup from "../components/CreateClientPopup";
import ClientPopup from "../components/ClientPopup";
import apiHandler from "../../../utils/ApiHandler";
import { useSnackBarContext } from "../../../components/SnackBarProvider";
import SecondaryButton from "../../../components/buttons/SecondaryButton";
export default function ClientSearchPage() {


    const navigate = useNavigate();
    // Create client END

    const [clientList, setClientList] = useState([]);
    const [clientTableShow, setClientTableShow] = useState(false);
    const [clientTableReset, setClientTableReset] = useState(false);
    const clientSearchPageSize = 30;
    const [currentQuery, setCurrentQuery] = useState(null);
    const [offset, setOffset] = useState(0);

    // const [showClient, setShowClient] = useState(false);
    // const [selectedClient, setSelectedClient] = useState(null);

    const { showSnackBar } = useSnackBarContext();


    //search function to get client list
    const searchClients = async (query, page, direction, pageSize, requestLoc) => {
        setClientTableReset(false);
        setCurrentQuery(query);

        if (query === "") {
            showSnackBar("Please enter a search query", "ERROR");
            return;
        }
        apiHandler.get(`/clients/?query=${query}&page=${page}&page_size=${pageSize}`)
            .then(response => {
                if (response.status === 204) {
                setClientList([]);
                setClientTableShow(true);
                return;
                }
                const responseValue = response.data;

                if (requestLoc === "search") {
                setClientList(responseValue);
                setOffset(0);
                setClientTableReset(true);
                } else if (clientList.length > 2 * pageSize) {
                if (direction === "next") {
                    setClientList((clientList.slice(pageSize)).concat(responseValue));
                    setOffset(offset + 1);
                } else if (direction === "prev") {
                    setClientList(responseValue.concat(clientList.slice(0, -pageSize)));
                    setOffset(offset - 1);
                }
                } else if (direction === "next") {
                setClientList(clientList.concat(responseValue));
                }
                setClientTableShow(true);
            })
            .catch(error => {
                if (error.response && error.response.status === 400) {
                showSnackBar("Please enter a valid search query", "ERROR");
                } else {
                console.error(error);
                // handle other errors here
                }
            });
      };
      
    //popup function to get client details on table click
    const getClientInfo = async (row) => {
        if (row === undefined) {
            return;
        }
        navigate(`./${row.target.id}`)
    };

    return (
        <>
            <div className="mb-3 flex justify-between">
                <SearchBar onButtonClick={searchClients} placeholder={"Search Clients"} pageSize={clientSearchPageSize} />
                <SecondaryButton enabled={true} onClick={() => { navigate('./create') }} text="Create Client" />
            </div>
            <div className="mb-3">
                {clientTableShow ?
                    <Table
                        entries={clientList}
                        headers={["client_id", "first", "last"]}
                        rowClick={getClientInfo}
                        identifier="client_id"
                        buttonShow={true}
                        numRows={10}
                        queryRows={clientSearchPageSize}
                        queryPage={1}
                        currentSearch={currentQuery}
                        offset={offset}
                        getData={searchClients}
                        reset={clientTableReset}
                    /> : null}
            </div>
            <Routes>
                    <Route path="/:client_id" element={
                    <ClientPopup />}
                    />
                    <Route path="/create" element={
                    <CreateClientPopup/>}
                
            />
            </Routes>
        </>
    )
}