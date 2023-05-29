import React, { useState, useContext, useEffect } from "react";
import InputForm from "../../../components/InputForm"; 
import { CookieContext } from "../../../components/Clientdek";
import apiHandler from "../../../utils/ApiHandler";
import SecondaryButton from "../../../components/buttons/SecondaryButton";
import { useSnackBarContext } from "../../../components/SnackBarProvider";
import { RenderClientdekContext } from "../../../components/Clientdek";

export default function CustomizationsPage(props) {
    const cookie = useContext(CookieContext);
    const { renderClientdek, setRenderClientdek } = useContext(RenderClientdekContext);
    const { showSnackBar } = useSnackBarContext();
    const [darkSwitch, setDarkSwitch] = useState(cookie["colour"] === "dark");
    const [locale, setLocale] = useState("");
    const [timezone, setTimezone] = useState("");

    const submitColorChangeForm = async () => {
        const userID = cookie["user_id"];
        try {
          const response = await apiHandler.put(`/users/${userID}/settings`, {
            colour: darkSwitch ? "dark" : "light",
            locale: locale,
            timezone: timezone
          });
      
        if (response.status === 200) {
            setRenderClientdek(!renderClientdek);
            setDarkSwitch(cookie["colour"] === "dark");
            showSnackBar("Settings Updated!", "INFO");
        }
        } catch (error) {
          console.error(error);
        }
      };


    useEffect(() => {
        var userColour = cookie["colour"];
        setDarkSwitch(userColour === "dark");
        setLocale(cookie["locale"]);
        setTimezone(cookie["timezone"]);
    }, [cookie])

    //function to handle toggle input
    const handleToggle = (event) => {
        setDarkSwitch(event.target.checked);
        props.toggleDark(event.target.checked)
    };

    return (
        <div>
            <InputForm name="Dark Mode" type="toggle" value={darkSwitch} handleToggle={handleToggle}/>
            <div>
            <InputForm name="Locale" selectableOptions={["en-CA", "en-FR"]} type="select" value={locale} handleText={(event) => { setLocale(event.target.value); }} />
            <InputForm name="Timezone" selectableOptions={["Automatic"]} type="select" value={timezone} handleText={(event) => { setTimezone(event.target.value); }} />
            </div>
            {/* <div>
            <select>
              <option value="en-ca">en-CA</option>
            </select>
            </div> */}
            {/* <div>
            <select onChange={(event) => { setTimezone(event.target.value); }}>
              <option value="automatic">Automatic</option>
            </select>
            </div> */}
            <SecondaryButton text="Save" enabled={true} onClick={submitColorChangeForm} />
        </div>
        
    )
}