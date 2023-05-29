import React, { useState, useEffect, useCallback, useContext } from "react";
import { NavLink } from "react-router-dom";
import { MdAccountCircle } from "react-icons/md";
import apiHandler from "../utils/ApiHandler";
import { CookieContext } from "./Clientdek";

export default function Topbar(props){

    const [imageSource, setImageSource] = useState(undefined);
    const [imageFound, setImageFound] = useState(false);

    const cookie = useContext(CookieContext);
    const userProfilePictureUpdate = useCallback(async () => {

        if (cookie.user_id === undefined) {
            return ;
        }
      try {
      
        const response = await apiHandler.get(`/users/${cookie.user_id}/profile-image`, { responseType: 'blob' });
        const responseValue = response.data;
        const imgRegex = new RegExp("image/*");
        if (responseValue.type.match(imgRegex)) {
          setImageFound(true);
          setImageSource(URL.createObjectURL(responseValue));
        } else {
          setImageFound(false);
          setImageSource(undefined);
        }

      } catch (error) {
        console.error(error);
      }
    }, [cookie]);
    
      


    useEffect(() => { userProfilePictureUpdate(); }, [userProfilePictureUpdate, cookie])

    return (
        <>
            <nav className="flex justify-between z-12 border-b-2 border-outline h-[10vh] bg-surface-variant dark:bg-surface-variant-dark dark:border-outline-dark overflow-hidden">
                <div className="w-fit items-center ml-4 float-left">
                    {props.darkMode
                        ? <img src={require('../images/logo_dark.png')} alt="logo" className="my-2.5 h-2/3 object-cover overflow-hidden"/>
                        : <img src={require('../images/logo_light.png')} alt="logo" className="my-2.5 h-2/3 object-cover overflow-hidden"/>
                    }
                </div>
                <div className="flex text-5xl items-center mr-4">
                    {props.subApps.map(subApp =>
                        {
                        if (subApp.name === "Settings") {
                            return (
                                <NavLink to={subApp.home}>
                                    {imageFound
                                        ? <img key={subApp.name + " img"} src={imageSource} alt={subApp.name} className={"aspect-square h-[50px] mx-3 rounded-full"}/>
                                        : <MdAccountCircle key={subApp.name + " icon"} className="text-on-surface-variant dark:text-on-surface-variant-dark"/>
                                    }
                                </NavLink>
                            )
                        } else {
                            return (
                                <div>
                                    <NavLink to={subApp.home} className={"[&.active]:underline [&.active]:decoration-2 mx-3 text-on-surface-variant dark:text-on-surface-variant-dark"}>
                                        {subApp.name}
                                    </NavLink>
                                </div>
                            )
                        }
                    })}
                </div>
            </nav>
        </>
    )
}
