import React from 'react';
import LoginForm from "../applications/login/components/LoginForm";
import ForgotPassForm from "../applications/login/components/ForgotPassForm";
import ResetPassForm from "../applications/login/components/ResetPassForm";

export default class Form extends React.Component {
    
    formSwitch(type) {
        switch(type) {
            case "login":
            default:
                return (
                    <div className="w-fill">
                        <img className="w-2/3 mx-auto my-1 mb-5"
                                    src={require("../images/logo_light.png")}
                                    alt="logo" />
                        <LoginForm navigate={this.props.navigate}/>
                    </div>
                );
            case "forgot":
                return <ForgotPassForm navigate={this.props.navigate}/>
            case "reset":
                return <ResetPassForm navigate={this.props.navigate}/>
        };
    };

    render() {
        return (
            <div className="flex fixed top-0 left-0 right-0 bottom-0 justify-center bg-surface dark:bg-surface-dark">
                <div className="w-1/3 p-4 mt-10 h-fit rounded-lg bg-surface-variant drop-shadow-lg dark:bg-surface-variant-dark">
                    {this.formSwitch(this.props.type)}
                </div>
            </div>
        );
    };
}
