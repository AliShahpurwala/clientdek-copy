import React from "react";
import ApplicationLayout from "../../components/Application";
import UserProfilePage from "./pages/UserProfilePage";
import ChangePasswordPage from "./pages/ChangePasswordPage";
import CustomizationsPage from "./pages/CustomizationsPage";

export default class Settings extends React.Component {

    constructor(props) {
        super(props);
        this.name="Settings"
        this.home="/settings/profile"
        this.pages=[<UserProfilePage
                        name="User Profile"
                        home="/profile"/>,
                    <ChangePasswordPage
                        name="Change Password"
                        home="/change-pass"/>,
                    <CustomizationsPage
                        name="Customizations"
                        home="/customize"
                        toggleDark={props.toggleDark}/>]
    }

    render() {
        console.log(this.home)
        return (
            <ApplicationLayout
                name={this.name}
                home={this.home}
                pages={this.pages}
                   />
        )
    }
}