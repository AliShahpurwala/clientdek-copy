import React from 'react';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from './applications/login/pages/Login';
import PasswordReset from './applications/login/pages/PasswordResetPage';
import ForgotPassword from './applications/login/pages/ForgotPasswordPage';
import Clientdek from './components/Clientdek';
import ServerError from './components/pages/ServerError';
import Unauthorized from './components/pages/Unauthorized';
import BadGateway from './components/pages/BadGateway';
import NotFound from './components/pages/NotFound';
import Admin from './applications/admin/Admin';
import Calendar from './applications/calendar/Calendar';
import Clients from './applications/clients/Clients';
import Settings from './applications/settings/Settings';
import './App.css';

export default class App extends React.Component {

  render() {
    return (
      <BrowserRouter>
        <Routes>
          <Route index element={<Login/>}/>
          <Route path="*" element={<NotFound/>}/>
          <Route exact path="/not-found" element={<NotFound/>}/>
          <Route exact path="/server-error" element={<ServerError/>}/>
          <Route exact path="/unauthorized" element={<Unauthorized/>}/>
          <Route exact path="/bad-gateway" element={<BadGateway/>}/>
          <Route exact path="/forgot-password" element={<ForgotPassword/>}/>
          <Route exact path="/reset-password/:userID/:resetToken" element={<PasswordReset/>}/>
          <Route element={<Clientdek/>}>
            <Route path ="/admin/*" element={<Admin/>} />
            <Route path ="/calendar/*" element={<Calendar/>} />
            <Route path ="/clients/*" element={<Clients/>} />
            <Route path ="/settings/*" element={<Settings/>} />
          </Route>
        </Routes>
     </BrowserRouter>
    )
  }
}