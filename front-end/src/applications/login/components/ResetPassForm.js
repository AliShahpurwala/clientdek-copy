import React, { useState, useEffect } from "react";
import {useNavigate, useParams} from "react-router-dom";
import hash from "../../../components/hash";
import InputText from "../../../components/inputs/InputText";
import apiHandler from "../../../utils/ApiHandler";

export default function ResetPassForm(props) {
    const [newPassword, setNewPassword] = useState("");
    const [newPasswordAgain, setNewPasswordAgain] = useState("");
    const navigate = useNavigate();
    const { userID, resetToken } = useParams();
    
    useEffect(() => {
    
        const validateResetToken = async () => {
            var response = await apiHandler.get(`/verify-reset-password-token?user_id=${userID}&reset_token=${resetToken}`);
            if (response.status !== 200) {
                navigate("/not-found");
                return;
            }  
        }
        validateResetToken();
    } , [navigate, userID, resetToken]);


    const resetPasswordFormSubmit = async (event) => {
        event.preventDefault();
        if (newPassword !== newPasswordAgain) {
          console.log("Passwords do not match!");
        }
      
        try {
          const formData = new FormData();
          formData.append('user_id', userID);
          const newHash = await hash(newPassword);
          formData.append('new_hash', newHash);
          formData.append('password_reset_token', resetToken);
      
          const response = await apiHandler.post("/change-password-logged-out", formData);
          const responseJson = response.data;
          console.log(responseJson)
          setNewPassword("");
          setNewPasswordAgain("");
          if (response.status === 200) {
            console.log("Password reset successful");
            navigate("/");
          } else {
            console.log("Password reset unsuccessful");
          }
        } catch (error) {
          console.error(error);
        }
      };
    
    return (
        <div className="w-fill items-center">
            <InputText
                type="password"
                placeholder="New Password"
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
            >Submit</button>
        </div>
    )
}
