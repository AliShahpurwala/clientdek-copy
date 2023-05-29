import React from 'react';
import { useNavigate } from 'react-router-dom';
import Form from '../../../components/Form';


export default function Login() {

    const navigate = useNavigate();

    return (
        <Form type="login" navigate={navigate} />
    )
}
