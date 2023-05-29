import React, { useState, useEffect, useCallback, useRef } from "react";
import Table from "../../../components/Table";
import EditablePopup from "../../../components/popups/EditablePopup";
import InputForm from "../../../components/InputForm";
import Badge from "../../../components/badges/Badge";
import apiHandler from "../../../utils/ApiHandler";
import { MdGroup, MdPeople } from "react-icons/md";
import { PopupHeading2, PopupHeading3, PopupText } from "../../../components/text/PopupText";
export default function GroupManagementPage() {

  const [groupList, setGroupList] = useState([]);
  const [groupTableShow, setGroupTableShow] = useState(true);
  const [groupTableReset, setGroupTableReset] = useState(false);

  const groupSearchPageSize = 30;
  const [currentQuery, setCurrentQuery] = useState(null);
  const [offset, setOffset] = useState(0);

  const [showGroup, setShowGroup] = useState(false);
  const [groupInfo, setGroupInfo] = useState(
    {
      "group_id": null,
      "name": null,
      "description": null,
      "parents": [],
      "users": [],
    }
  );

  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [groupNameInput, setGroupNameInput] = useState("");
  const [groupDescriptionInput, setGroupDescriptionInput] = useState("");
  const [groupParentInput, setGroupParentInput] = useState([]);
  const [groupUserInput, setGroupUserInput] = useState([]);


  const searchGroups = useCallback(async (query, page, direction, pageSize, requestLoc) => {
    setCurrentQuery(query);

    try {
      const response = await apiHandler.get(`/groups/?page=${page}&page_size=${pageSize}`);
      var responseValue = response.data;
      responseValue = await Promise.all(
        responseValue.map(
          async (group) => {
            group.parents = await Promise.all(
              group.parents.map(
                async (parent_id) => {
                  var response = await apiHandler.get(`/groups/${parent_id}`);
                  return (<Badge text={response.data.name} />);
                }
              )
            )
            return group;
          }
        )
      );

      responseValue = await Promise.all(
        responseValue.map(
          async (group) => {
            group.users = await Promise.all(
              group.users.map(
                async (user_id) => {
                  var response = await apiHandler.get(`/users/${user_id}`);
                  return (<Badge text={response.data.first_name} />);
                }
              )
            )
            return group;
          }
        )
      );
      
      if (responseValue.status_code !== 204) {
        if (requestLoc === "search") {
          setGroupList(responseValue);
          setOffset(0);
          setGroupTableReset(true);
        } else if (groupList.length > 2 * pageSize) {
          if (direction === "next") {
            setGroupList((groupList.slice(pageSize)).concat(responseValue));
            setOffset(offset + 1);
          } else if (direction === "prev") {
            setGroupList(responseValue.concat(groupList.slice(0, -pageSize)));
            setOffset(offset - 1);
          }
        } else if (direction === "next") {
          setGroupList(groupList.concat(responseValue));
        }
        setGroupTableShow(true);
      }
    } catch (error) {
      console.error(error);
    }
  }, [groupList, offset]);


  const submitGroupForm = async (event) => {
    event.preventDefault();
    setShowCreateGroup(false);

    try {
      const response = await apiHandler.post('/groups/', {
        name: groupNameInput,
        description: groupDescriptionInput,
        parents: groupParentInput.split(" ").map(function (x) {
          return parseInt(x, 10);
        }),
        users: groupUserInput.split(" ").map(function (x) {
          return parseInt(x, 10);
        }),
      });

      const responseValue = response.data;
    } catch (error) {
      console.error(error);
    }

    setGroupTableReset(!groupTableReset);
    setGroupNameInput("");
    setGroupDescriptionInput("");
    setGroupParentInput("");
    setGroupUserInput("");
  };


  const isMounted = useRef(false);

  useEffect(() => {
    if (!isMounted.current) {
      searchGroups("", 1, "next", groupSearchPageSize, "search");
      isMounted.current = true;
      return;
    }
  }, [groupSearchPageSize, searchGroups]);

  const getGroupInfo = async (row) => {
    const currentGroup = (groupList.find((group) => group["group_id"] === parseInt(row.target.id)))
    if (row === undefined) {
      return;
    }

    const responseValue = {
      "group_id": row.target.id,
      "name": currentGroup["name"],
      "description": currentGroup["description"],
      "parents": currentGroup["parents"],
      "users": currentGroup["users"]
    }
    setGroupInfo(responseValue);
    setShowGroup(true);
  }

  return (
    <>
      <button className="float-right p-4 w-1/6 rounded-xl cursor-pointer mb-3 hover:shadow-md
                                    bg-tertiary           text-on-tertiary           hover:shadow-shadow
                               dark:bg-tertiary-dark dark:text-on-tertiary-dark dark:hover:shadow-shadow-dark"
        onClick={() => { setShowCreateGroup(true) }}>Create Group</button>
      <EditablePopup
        show={showCreateGroup}
        close={() => { setShowCreateGroup(false) }}
        title="Create Group"
        type="new"
        body={
          <div>
            <InputForm name={"name"} type="text" placeholder="Enter Group Name" value={groupNameInput} handleText={(e) => { setGroupNameInput(e.target.value) }} />
            <InputForm name={"description"} type="text" placeholder="Enter Description" value={groupDescriptionInput} handleText={(e) => { setGroupDescriptionInput(e.target.value); }} />
            <InputForm name={"parents"} type="text" placeholder="Enter Parent Groups" value={groupParentInput} handleText={(e) => { setGroupParentInput(e.target.value); }} />
            <InputForm name={"users"} type="text" placeholder="Add Users to Group" value={groupUserInput} handleText={(e) => { setGroupUserInput(e.target.value); }} />
          </div>
        }
        save={submitGroupForm}
      />
      <div>
        {groupTableShow ?
          <Table
            entries={groupList}
            headers={["group_id", "name", "description", "parents", "users"]}
            rowClick={getGroupInfo}
            identifier="group_id"
            buttonShow={true}
            numRows={10}
            queryRows={groupSearchPageSize}
            queryPage={1}
            currentSearch={currentQuery}
            offset={offset}
            getData={searchGroups}
            reset={groupTableReset}
          /> : null}
      </div>

      <EditablePopup
        show={showGroup}
        close={() => setShowGroup(false)}
        title={<p>Group Information</p>}
        viewBody={
          <div className="flex justify-between">
            <div className="w-1/3">
              <div className="mb-4">
                <PopupHeading2><MdGroup className="inline-block mr-2" />Name</PopupHeading2>
                <PopupText>{groupInfo.name}</PopupText>
              </div>
              {
                groupInfo.users.length != 0 ?
                  <div className="mb-4">
                    <PopupHeading2><MdPeople className="inline-block mr-2" />Users</PopupHeading2>
                    <PopupText>
                    <div className="p-2">{groupInfo.users.map((x) => {
                            return x
                         })}
                    </div>
                    </PopupText>
                  </div>
                  :
                  null
              }
            </div>
            <div className="w-1/3">
              <div className="mb-4">
                <PopupHeading3>Description</PopupHeading3>
                <PopupText>{groupInfo.description}</PopupText>
              </div>
              {groupInfo.parents.length != 0 ?
                <div className="mb-4">
                  <PopupHeading3>Parents</PopupHeading3>
                  <PopupText>
                    <div className="p-2">{groupInfo.parents.map((x) => {
                            return x
                         })}
                    </div>
                  </PopupText>
                </div>
                :
                null
              }
            </div>
          </div>
        }
      />
    </>
  )
}