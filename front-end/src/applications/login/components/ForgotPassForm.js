import React from "react";
import InputText from "../../../components/inputs/InputText";
import apiHandler from "../../../utils/ApiHandler";

export default class ForgotPassForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            emailInput: "",
            submission: false
        }

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
    }

    handleSubmit = async (event) => {
        event.preventDefault();

        // Build formData object.
        let formData = new FormData();
        formData.append('email', this.state.emailInput);

        //reset_password_logged_out(request) API
        const response = await apiHandler.post(`/reset-password-logged-out`, formData, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            withCredentials: true
        });

        console.log(response);
        
        switch(response.status) {
            case 201:
                this.setState({
                    submission: "Reset Password Email sent"
                })
                break;
            case 403:
            case 429:
                this.setState({
                    submission: "Reset Password Email has already been sent"
                })
                break;
            case 422:
                this.setState({
                    submission: "Invalid Email Submission"
                })
                break;
            default:
                console.log("Some error occurred during the login.");
                break;
        }

        this.setState({
            emailInput: ""
        });
    };
    
    handleInputChange(event) {
        const target = event.target;
        const value = target.value;
        const name = target.name;

        this.setState({
            submission : "",
            [name]: value
        });
    };

    render() {
        return (
            <div>
                <InputText
                    name="emailInput"
                    type="text"
                    placeholder="Enter email to reset password"
                    value={this.state.emailInput}
                    onChange={this.handleInputChange} />
                <p>{this.state.submission}</p>
                <div className="flex justify-between mt-2">
                    <button onClick={()=>this.props.navigate('/')}
                            className="w-2/5 p-4 rounded-md
                                            bg-primary-container           text-on-primary-container
                                        dark:bg-primary-container-dark dark:text-on-primary-container-dark"
                    >Back</button>
                    <button onClick={this.handleSubmit}
                        className="w-2/5 p-4 rounded-md
                                        bg-primary-container           text-on-primary-container
                                    dark:bg-primary-container-dark dark:text-on-primary-container-dark"
                    >Submit</button>
                </div>
            </div>
        )
    }
}