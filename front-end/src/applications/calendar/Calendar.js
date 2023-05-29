import React from "react";
import ApplicationLayout from "../../components/Application";
import CalendarPage from "./CalendarPage";

export default class Calendar extends React.Component {

    constructor(props) {
        super(props);
        this.name="Calendar"
        this.home="/calendar"
        this.pages=[<CalendarPage
                        name="View Calendar"
                        home="/calendar"/>]
    }

    render() {
        return (
            <ApplicationLayout
                name={this.name}
                home={this.home}
                pages={this.pages}
            />
        )
    }
}