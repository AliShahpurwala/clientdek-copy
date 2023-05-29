import React from "react";
import ApplicationLayout from "../../components/Application";
import UserManagementPage from "./pages/UserManagementPage";
import GroupManagementPage from "./pages/GroupManagementPage";
import LogManagementPage from "./pages/LogManagement";
import APIKeyPage from "./pages/APIKeyPage";
export default class Admin extends React.Component {

    constructor(props) {
        super(props);
        this.name="Admin"
        this.home="/admin/users"
        this.pages=[<UserManagementPage
                        name="User Management"
                        home="/users"/>,
                    <GroupManagementPage
                        name="Group Management"
                        home="/groups"/>,
                    <LogManagementPage
                        name="Log Management"
                        home="/logs"/>,
                    <APIKeyPage 
                        name="Key Management"
                        home="/keys"/>]
    }
    
    render() {
        return (
            <ApplicationLayout
                name={this.name}
                home={this.home}
                pages={this.pages}
            />
        )
    }
}