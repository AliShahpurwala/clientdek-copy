import { useState, useEffect, useContext, useCallback, useRef } from "react";
import Banner from "../../../components/Banner";
import CreatePopup from "../../../components/popups/CreatePopup";
import Table from "../../../components/Table";
import InputForm from "../../../components/InputForm";
import dayjs from "dayjs";
import { useSnackBarContext } from "../../../components/SnackBarProvider";
import { CookieContext } from "../../../components/Clientdek";
import apiHandler from "../../../utils/ApiHandler";
import DeletePopup from "../../../components/popups/DeletePopup";

export default function APIKeyPage() {

    const [showDeleteAPIKeyPopup, setShowDeleteAPIKeyPopup] = useState(false);
    const [apiKeyInFocus, setAPIKeyInFocus] = useState({});

    const [apiKeyList, setAPIKeyList] = useState([]);
    const [apiKeyTableShow, setAPIKeyTableShow] = useState(true);
    const [apiKeyTableReset, setAPIKeyTableReset] = useState(false);

    const apiKeyPageSize = 30;
    const [currentQuery, setCurrentQuery] = useState(null);
    const [offset, setOffset] = useState(0);

    const { showSnackBar } = useSnackBarContext();
    const cookie = useContext(CookieContext);

    const searchAPIKeys = useCallback(async (query, page, direction, pageSize, requestLoc) => {
        setCurrentQuery(query);
      
        try {
          const response = await apiHandler.get(`/admin/api-key?page=${page}&page_size=${pageSize}`);
          const responseValue = response.data;
          responseValue.map((key) => {
            key.expiration = dayjs(key.expiration).format("DD/MM/YYYY");
            return key;
          });
          if (responseValue.status_code !== 204) {
  
            if (requestLoc === "search") {
              setAPIKeyList(responseValue);
              setOffset(0);
              setAPIKeyTableReset(true);
            } else if (apiKeyList.length > 2 * pageSize) {
              if (direction === "next") {
                setAPIKeyList((apiKeyList.slice(pageSize)).concat(responseValue));
                setOffset(offset + 1);
              } else if (direction === "prev") {
                setAPIKeyList(responseValue.concat(apiKeyList.slice(0, -pageSize)));
                setOffset(offset - 1);
              }
            } else if (direction === "next") {
              setAPIKeyList(apiKeyList.concat(responseValue));
            }

            setAPIKeyTableShow(true);
          }
        } catch (error) {
          console.error(error);
        }
      }, [apiKeyList, offset]);

    const [userAPIKeyRole, setUserAPIKeyRole] = useState("general_user");
    const [apiKeyDescription, setAPIKeyDescription] = useState("");
    const [expirationDate, setExpirationDate] = useState(undefined);

    const [bannerMessage, setBannerMessage] = useState("");
    const [showBanner, setShowBanner] = useState(false);

    const [showCreateAPIKey, setShowCreateAPIKey] = useState(false);

    const showDeletionPage = async (row) => {
        if (row === undefined) {
            return;
        }
        setShowDeleteAPIKeyPopup(true);
        var apiKeyID = row.target.id;
        var response = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/api-key/${apiKeyID}`, {
            method: "GET",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            }
        })
        var responseValue = await response.json();
        console.log(responseValue);
        if (response.status === 200) {
            setAPIKeyInFocus(responseValue);
        }
    }

    const handleDelete = async () => {
        console.log("handleDelete");
        var response = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/api-key`, {
            method: "DELETE",
            body: JSON.stringify({
                id: apiKeyInFocus.id
            }),
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            }
        });
        var responseValue = await response.json();
        console.log(responseValue);
        if (response.status === 201) {
            setShowDeleteAPIKeyPopup(false);
            setAPIKeyInFocus({});
            setAPIKeyTableReset(!apiKeyTableReset);
            showSnackBar("API key successfully deleted");
        }
    }

    const closeBanner = () => {
        setShowBanner(false);
        setBannerMessage("");
    }

    const submitAPIKeyForm = async (event) => {
        event.preventDefault();
        setShowCreateAPIKey(false);
      
        // Data validation
        var todaysDate = new Date();
        var expirationDateObject = new Date(expirationDate);
      
        if (expirationDateObject > todaysDate) {
        } else {
          setBannerMessage("Invalid Expiration Date");
          setShowBanner(true);
          return;
        }

      
        try {
          const formData = new FormData();
          formData.append('user_id', cookie.user_id);
          formData.append('description', apiKeyDescription);
          formData.append('role', userAPIKeyRole);
          formData.append('expiration', expirationDate);
      
          const response = await apiHandler.post("/admin/api-key", formData);
          const responseValue = response.data;
          console.log(responseValue);
          if (response.status === 201) {

            setBannerMessage(`New API Key created. Your key is ${responseValue["API-KEY"]} Copy it now, it will not be viewable later.`)
            setShowBanner(true);
          }
          setAPIKeyTableReset(!apiKeyTableReset);
          setExpirationDate(null);
          setUserAPIKeyRole("General_user");
          setAPIKeyDescription("");
        } catch (error) {
          console.error(error);
        }
      };

      const isMounted = useRef(false);

      useEffect(() => {
        if (!isMounted.current) {
          searchAPIKeys("", 1, "next", apiKeyPageSize, "search");
          isMounted.current = true;
          return;
        }
      }, [apiKeyPageSize, searchAPIKeys]);

    return (

        <div>
            <Banner content={bannerMessage} visibility={showBanner} closeBanner={closeBanner} />
            <button className="float-right p-4 w-1/6 rounded-xl cursor-pointer mb-3 hover:shadow-md
                                    bg-tertiary           text-on-tertiary           hover:shadow-shadow
                               dark:bg-tertiary-dark dark:text-on-tertiary-dark dark:hover:shadow-shadow-dark"
                onClick={() => { setShowCreateAPIKey(true) }} >Create API Key</button>
            <CreatePopup
                show={showCreateAPIKey}
                close={() => { setShowCreateAPIKey(false); setUserAPIKeyRole("general_user"); setAPIKeyDescription(""); setExpirationDate(undefined); }}
                title="API Key Management"
                create={submitAPIKeyForm}
                type="new"
                body={
                    <div>
                        <InputForm name={"description"} type="text" placeholder="Enter description" value={apiKeyDescription} handleText={(e) => { setAPIKeyDescription(e.target.value); }} />
                        <div className="rounded p-1">
                            <p className="w-1/4 mr-1 whitespace-nowrap text-on-surface dark:text-on-surface-dark">
                                Select a Role for this Key
                            </p>
                            <div>
                                <select
                                    className="block w-full p-2 my-1 rounded-lg outline-none outline-offset-0
                                                    border-outline-variant           bg-white           text-on-surface           focus:outline-outline
                                               dark:border-outline-variant-dark dark:bg-surface-40 dark:text-on-surface-dark dark:focus:outline-outline-dark"
                                    value={userAPIKeyRole}
                                    onChange={(e) => {
                                        setUserAPIKeyRole(e.target.value);
                                    }}
                                >
                                    <option value="general_user" className="text-on-surface dark:text-on-surface-dark">General User</option>
                                    <option value="admin" className="text-on-surface dark:text-on-surface-dark">Admin</option>
                                </select>
                            </div>
                        </div>
                        <InputForm name={"expiration_date"} type="date" placeholder="Enter expiration date" value={expirationDate} handleText={(e) => { setExpirationDate(e.target.value); }} />
                    </div>
                }
                save={submitAPIKeyForm}
            />
            {apiKeyTableShow ?
                <Table
                    entries={apiKeyList}
                    headers={["id", "user_id", "description", "expiration"]}
                    rowClick={showDeletionPage}
                    identifier="id"
                    buttonShow={true}
                    numRows={10}
                    queryRows={apiKeyPageSize}
                    queryPage={1}
                    currentSearch={currentQuery}
                    offset={offset}
                    getData={searchAPIKeys}
                    reset={apiKeyTableReset}
                /> : null}
            <DeletePopup show={showDeleteAPIKeyPopup}
                onCancel={() => { setShowDeleteAPIKeyPopup(false); setAPIKeyInFocus({}); }}
                title={`Delete API Key ID ${apiKeyInFocus.id}`}
                onDelete={handleDelete}
                body={
                    <div>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="text-gray-600">User ID:</div>
                            <div>{apiKeyInFocus.user_id}</div>
                            <div className="text-gray-600">Description:</div>
                            <div>{apiKeyInFocus.description}</div>
                            <div className="text-gray-600">Expiry Date:</div>
                            <div>{apiKeyInFocus.expiration}</div>
                        </div>
                    </div>
                } />
        </div>

    )
}