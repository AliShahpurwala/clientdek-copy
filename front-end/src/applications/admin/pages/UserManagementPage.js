import React, { useState, useEffect, useCallback, useRef } from "react";
import SearchBar from "../../../components/SearchBar";
import Table from "../../../components/Table";
import EditablePopup from "../../../components/popups/EditablePopup";
import CreateUser from "../components/CreateUserForm";
import apiHandler from "../../../utils/ApiHandler";

const initialState = {
    first_name: "",
    last_name: "",
    preferred_name: "",
    email: "",
    admin_status: ""
};

export default function UserManagementPage() {
    
    const [userList, setUserList] = useState([]);
    const [userTableShow, setUserTableShow] = useState(false);
    const [userTableReset, setUserTableReset] = useState(false);

    const userSearchPageSize = 30;
    const [currentQuery, setCurrentQuery] = useState(null);
    const [offset, setOffset] = useState(0);

    //access current user popup state
    const [showUser, setShowUser] = useState(false);
    const [user, setUser] = useState(initialState);

    //create new user popup state
    const [showCreateUser, setShowCreateUser] = useState(false);

    //function to populate the users table
    const searchUsers = useCallback(
        async (query, page, direction, pageSize, requestLoc) => {
            setCurrentQuery(query);
            try {
                const response = await apiHandler.get(
                    `/users/?name=${query}&page=${page}&page_size=${pageSize}`
                );
        
                if (response.status === 200) {
                    const responseValue = response.data;
                    for (const row of responseValue) {
                        delete row.image_link;
                        delete row.company_id;
                    };
                    
                    if (requestLoc === "search") {
                        setUserList(responseValue);
                        setOffset(0);
                        setUserTableReset(true);
                    } else if (userList.length > 2*pageSize) {
                        if (direction === "next") {
                            setUserList((userList.slice(pageSize)).concat(responseValue));
                            setOffset(offset + 1);
                        } else if (direction === "prev") {
                            setUserList(responseValue.concat(userList.slice(0, -pageSize)));
                            setOffset(offset - 1);
                        }
                    } else if (direction === "next") {
                            setUserList(userList.concat(responseValue));
                    }
                    setUserTableShow(true);
                }
            } catch (error) {
                console.error(error);
            }
        }, [userList, offset, setUserList, setUserTableReset, setOffset, setUserTableShow]
    );
    
    const isMounted = useRef(false);

    //call searchUsers on page load
    useEffect(() => {
        if (!isMounted.current) {
            searchUsers("", 1, "next", userSearchPageSize, "search");
            isMounted.current = true;
            return;
        }
    }, [userSearchPageSize, searchUsers]);


    //function to get user info on table row click
    const getUserInfo = useCallback(async (row) => {
        if (!row) {
            return;
        }
    
        try {
            const response = await apiHandler.get(`/users/${row.target.id}`, {
                withCredentials: true
            });
    
            const responseValue = response.data;
            delete responseValue["image_link"];
            delete responseValue["company_id"];
    
            const userInfo = {};
            for (const key of Object.keys(responseValue)) {
                if (responseValue[key] !== null) {
                    userInfo[key] = responseValue[key];
                } else {
                    userInfo[key] = "";
                }
            }
    
            setUser(userInfo);
            setShowUser(true);
        } catch (error) {
            console.error(error);
        }
    }, [setUser, setShowUser]);
    


    //function to handle text input in popup
    const handleText = (event) => {
        setUser({...user, [event.target.name]: event.target.value});
    };

    //function to handle toggle input in popup
    const handleToggle = (event) => {
        setUser({...user, [event.target.name]: event.target.checked ? "admin" : "general_user"});
    };

    const createUser = async () => {
        let formData = new FormData();
        for (const key of Object.keys(user)) {
            //include regex checking for input here
            formData.append(key, user[key]);
        };
        const response = await apiHandler.post('/users/', formData);
        const responseValue = await response.data;
        console.log(responseValue);
        setShowCreateUser(false);
        searchUsers("", 1, "next", userSearchPageSize, "search");
    };
    
            
    return (
        <>
            <div>
                <div className="flex justify-between mb-3">
                    <SearchBar onButtonClick={searchUsers} placeholder={"Search Users"} pageSize={userSearchPageSize}/>
                    <button onClick={()=>{setUser(initialState); setShowCreateUser(true)}}
                            className="p-4 w-1/6 ml-4 rounded-xl cursor-pointer hover:shadow-md
                                            bg-tertiary           text-on-tertiary           hover:shadow-shadow
                                       dark:bg-tertiary-dark dark:text-on-tertiary-dark dark:hover:shadow-shadow-dark"
                    >Create User</button>
                </div>
                {userTableShow ?
                    <Table
                        entries={userList}
                        headers={["user_id", "admin_status", "account_status","first_name", "last_name", "preferred_name", "email"]}
                        rowClick={getUserInfo}
                        identifier="user_id"
                        buttonShow={true}
                        numRows={10}
                        queryRows={userSearchPageSize}
                        queryPage={1}
                        currentSearch={currentQuery}
                        offset={offset}
                        getData={searchUsers}
                        reset={userTableReset}
                        darkMode={false}
                        /> : null}
            </div>

            <EditablePopup
                show={showUser}
                close={() => setShowUser(false)}
                title={<p>User Information</p>}
                viewBody={<CreateUser data={user} status={"view"} handleText={handleText} handleToggle={handleToggle}/>}
            />

            <EditablePopup
                show={showCreateUser}
                close={() => setShowCreateUser(false)}
                title={<p>Create New User</p>}
                viewBody={<CreateUser data={user} handleText={handleText} handleToggle={handleToggle}/>}
                save={() => createUser()}
            />
        </>
    )
}