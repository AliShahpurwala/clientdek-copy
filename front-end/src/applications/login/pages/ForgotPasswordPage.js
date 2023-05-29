import React from "react";
import { useNavigate } from 'react-router-dom';
import Form from '../../../components/Form';

export default function ForgotPasswordPage() {

    const navigate = useNavigate();

    return (
        <Form type="forgot" navigate={navigate}/>
    )
}