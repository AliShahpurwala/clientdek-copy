import React, { useState, useContext } from "react";
import hash from "../../../components/hash";
import InputText from "../../../components/inputs/InputText";
import { CookieContext } from "../../../components/Clientdek";
import apiHandler from "../../../utils/ApiHandler";

export default function ChangePasswordPage() {
    
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [newPasswordAgain, setNewPasswordAgain] = useState("");
    const cookie = useContext(CookieContext);

    const resetPasswordFormSubmit = async (event) => {
        event.preventDefault();
      
        var userID = cookie.user_id;
      
        if (newPassword !== newPasswordAgain) {
          console.log("Passwords do not match!");
          return;
        }
      
        try {
          const newHash = await hash(newPassword);
          const currentHash = await hash(currentPassword);
          console.log(userID, currentHash, newHash);
      
          const response = await apiHandler.put("/change-password-logged-in", {
            user_id: userID,
            current_hash: currentHash,
            new_hash: newHash
          });
      
          const responseJson = response.data;
          console.log(responseJson);
          setCurrentPassword("");
          setNewPassword("");
          setNewPasswordAgain("");
        } catch (error) {
          console.error(error);
        }
      };

    return (
        <div className="w-1/2">
            <InputText
                type="password"
                placeholder="Enter Current Password"
                value={currentPassword}
                onChange={(e) => {setCurrentPassword(e.target.value)}} />
            <InputText
                type="password"
                placeholder="Enter New Password"
                value={newPassword} 
                onChange={(e) => {setNewPassword(e.target.value)}} />
            <InputText
                type="password"
                placeholder="Re-enter New Password"
                value={newPasswordAgain} 
                onChange={(e) => {setNewPasswordAgain(e.target.value)}} />
            <button onClick={resetPasswordFormSubmit}
                    className="w-full p-4 rounded-md mt-2
                                    bg-primary-container           text-on-primary-container
                                dark:bg-primary-container-dark dark:text-on-primary-container-dark"
            >Update Password</button>
        </div>
    )
}