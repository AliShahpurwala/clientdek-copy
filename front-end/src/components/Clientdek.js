import React, { useEffect, useState, useMemo, useCallback } from 'react';
import Topbar from './Topbar';
import Admin from '../applications/admin/Admin';
import Calendar from '../applications/calendar/Calendar';
import Clients from '../applications/clients/Clients';
import Settings from '../applications/settings/Settings';
import { Outlet, useNavigate } from 'react-router-dom';
import { SnackBarProvider } from './SnackBarProvider';
import SnackBarComponent from './SnackBarComponent';
import jwt_decode from 'jwt-decode';

export const CookieContext = React.createContext();
export const RenderClientdekContext = React.createContext();
export const ProfilePictureContext = React.createContext();
export default function Clientdek() {
    const navigate = useNavigate();

    const [darkModeStatus, setDarkModeStatus] = useState();
    const [cookieValue, setCookieValue] = useState({});
    const [renderClientdek, setRenderClientdek] = useState(false);
    const [imageSource, setImageSource] = useState(undefined);
    const toggleDarkFunc = useCallback((darkChoice) => {
        setDarkModeStatus(darkChoice);
    }, []);

    const admin = useMemo(() => new Admin(), []);
    const calendar = useMemo(() => new Calendar(), []);
    const clients = useMemo(() => new Clients(), []);
    const settings = useMemo(() => new Settings({toggleDark : toggleDarkFunc}), [toggleDarkFunc]);
    const [subApps, setSubApps] = useState([calendar, clients, settings]);


    useEffect(() => {
        var cookie = document.cookie.split('; ').find((row) => row.startsWith('clientdek='))?.split('=')[1];
        if (!cookie) {
            navigate("/");
            return;
        } else {
            try {
                const decodedCookie = jwt_decode(cookie);
                const currentTime = Math.floor(Date.now() / 1000);
    
                if (currentTime > decodedCookie.exp) {
                    navigate("/");
                    return;
                }
    
                setCookieValue(decodedCookie);
                setDarkModeStatus(decodedCookie.colour === "dark");
                var adminStatus = decodedCookie.admin_status;
                if (adminStatus === "admin") {
                    setSubApps([admin, calendar, clients, settings]);
                }
            } catch (error) {
                console.error(error);
                navigate("/");
            }
        }
    }, [navigate, admin, calendar, clients, settings, renderClientdek]);
    


    return (
        <>
            <ProfilePictureContext.Provider value={{ imageSource, setImageSource }}>    
                <RenderClientdekContext.Provider value={{ renderClientdek, setRenderClientdek }}>
                    <CookieContext.Provider value={cookieValue}>
                        <SnackBarProvider>
                            <div className={darkModeStatus ? "dark" : ""}>
                                <Topbar subApps={subApps} darkMode={darkModeStatus} />
                                <Outlet/>
                                <SnackBarComponent />
                            </div>
                        </SnackBarProvider>
                    </CookieContext.Provider>
                </RenderClientdekContext.Provider>
            </ProfilePictureContext.Provider>
        </>
    )
}