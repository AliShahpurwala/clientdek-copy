import React from "react";
import { Link } from "react-router-dom";

export default function Sidebar(props) {
    return (
        <>
          <nav className="w-[20vw] border-r-2 items-center bg-surface-variant border-outline dark:bg-surface-variant-dark dark:border-outline-dark overflow-hidden">
            <div className="items-center bg-surface-variant dark:bg-surface-variant-dark">
                {props.sidebarItems.map((item) =>
                    <Link relative ="path"
                          key={item.name}
                          to={".."+item.home}
                          className="flex px-4 py-4 text-3xl items-center cursor-pointer whitespace-nowrap
                                          text-on-surface-variant           hover:bg-surface           focus:bg-surface 
                                     dark:text-on-surface-variant-dark dark:hover:bg-surface-dark dark:focus:bg-surface-dark">
                        {item.name}
                    </Link>
                )}
            </div>
          </nav>
        </>
    )
}