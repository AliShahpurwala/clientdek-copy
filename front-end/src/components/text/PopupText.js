//a class that sets the default values for text inside a popup

import React from "react";

export function PopupHeading1({ children }) {
  return <div className="text-4xl capitalize font-semibold text-on-surface dark:text-on-surface-dark">{children}</div>;
}

export function PopupHeading2({ children }) {
  return <div className="text-2xl capitalize font-semibold text-on-surface dark:text-on-surface-dark">{children}</div>;
}

export function PopupHeading3({ children }) {
    return <div className="text-lg capitalize font-semibold text-on-surface dark:text-on-surface-dark">{children}</div>;
    }

export function PopupText({ children }) {
  return <div className="text-base text-on-surface whitespace-pre-line dark:text-on-surface-dark">{children}</div>;
}