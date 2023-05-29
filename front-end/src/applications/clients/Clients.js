import React from "react";
import ApplicationLayout from "../../components/Application";
import ClientSearchPage from "./pages/ClientSearchPage";

export default class Clients extends React.Component {

    constructor(props) {
        super(props);
        this.name="Clients"
        this.home="/clients"
        this.pages=[<ClientSearchPage
                        name="Client Search"
                        home="/"/>]
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
