import React, {useState} from "react";
import hash from "../../../components/hash";
import InputText from "../../../components/inputs/InputText";
import apiHandler from "../../../utils/ApiHandler";


export default function LoginForm(props) {

    const [usernameInput, setUsernameInput] = useState("");
    const [passwordInput, setPasswordInput] = useState("");
    const [error, setError] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
      
        const passwordHash = await hash(passwordInput);
      
        // Create a FormData object and append the fields
        const formData = new FormData();
        formData.append('email', usernameInput);
        formData.append('pass_hash', passwordHash);
      
        try {
          const response = await apiHandler.post("/login", formData);
      
          if (response.status === 200) {
            props.navigate("/calendar");
          } else {
            setError(true);
            console.log("Some error occurred during the login.");
          }
        } catch (error) {
          setError(true);
          console.log("Error during the login:", error);
        }
      
        setPasswordInput("");
      };
      
    
    return (
        <form onSubmit={handleSubmit}>
            <InputText
                name="usernameInput"
                type="text"
                placeholder="Enter Email"
                value={usernameInput}
                onChange={(e) => {setUsernameInput(e.target.value);}}/>
            <InputText
                name="passwordInput"
                type="password"
                placeholder="Enter Password"
                value={passwordInput}
                error={error}
                errorMsg={"Invalid username or password."}
                onChange={(e) => {setPasswordInput(e.target.value);}}/>
            <div>
                <p onClick={()=>props.navigate('/forgot-password')} className="pl-1 w-fit cursor-pointer text-on-surface-variant underline decoration-1">Forgot Password?</p>
            </div>
            <div className="mt-5">
                <input
                    type="submit"
                    value="Login"
                    className="w-full p-4 rounded-md cursor-pointer
                                    bg-primary-container           text-on-primary-container
                                dark:bg-primary-container-dark dark:text-on-primary-container-dark"
                />
            </div>
        </form>
    )
}
