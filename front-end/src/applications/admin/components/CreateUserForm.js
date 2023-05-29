import React from "react";
import InputForm from "../../../components/InputForm";

export default function CreateUserForm(props) {

    return (
        <div>
            <InputForm name="first_name" type="text" value={props.data["first_name"]} handleText={props.handleText}/>
            <InputForm name="last_name" type="text"  value={props.data["last_name"]} handleText={props.handleText}/>
            <InputForm name="preferred_name" type="text" value={props.data["preferred_name"]} handleText={props.handleText}/>
            <InputForm name="email" type="text"  value={props.data["email"]} handleText={props.handleText}/>
            <InputForm name="admin_status" type="toggle" value={props.data["admin_status"] === "admin" ? true : false} handleToggle={props.handleToggle}/>
        </div>
    );
}