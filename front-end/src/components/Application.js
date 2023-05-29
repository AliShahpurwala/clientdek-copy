import React, { useEffect, useContext } from "react";
import Sidebar from "./Sidebar";
import { Routes, Route, useNavigate } from "react-router-dom";
import { CookieContext } from "./Clientdek";
import NotFound from '../components/pages/NotFound';

export default function ApplicationLayout({name, pages}) {

    const navigate = useNavigate();
    const cookie = useContext(CookieContext);

    let items = pages.map(page => {
        return {
            name: page.props.name,
            home: page.props.home
        }
    })

    useEffect(() => {
        if (name === "Admin") {
            if (cookie.admin_status !== "admin") {
                navigate("/calendar");
            }
        }
    }, [navigate, name, cookie.admin_status])

    //render the sidebar and the page according to the props of the application)
    return (
        <div className="flex h-[90vh] bg-surface dark:bg-surface-dark">
          {items.length === 1 ? 
          (
            <div className="w-full h-100 m-4">
              {pages[0]}
            </div>
          ) : (
            <>
              <Sidebar sidebarItems={items} />
              <div className="w-[80vw] h-100 m-4">
                <Routes>
                    <Route path="*" element={<NotFound/>} />
                    <Route index element={pages[0]}/>
                  {pages.map((page) => {
                    return  <Route key={page.props.name} path={page.props.home} element={page} />
                })}
                </Routes>
              </div>
            </>
          )}
        </div>
      );
    }