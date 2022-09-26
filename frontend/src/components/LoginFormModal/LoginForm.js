// frontend/src/components/LoginFormPage/index.js
import React, { useState } from 'react';
import * as sessionActions from '../../store/session';
import { useDispatch, useSelector } from 'react-redux';
import { Link, NavLink, Redirect, history, useHistory } from 'react-router-dom';
import './LoginForm.css';


function LoginForm({ onClose }) {
    const dispatch = useDispatch();
    const [credential, setCredential] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState([]);
    const history = useHistory();

    const navigateToSignUpForm = () => {
        history.push("/signup");

        if (onClose) {
            onClose();
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrors([]);
        return dispatch(sessionActions.login({ credential, password }))
            .catch(async (res) => {
                const data = await res.json();
                if (data && data.errors) {
                    setErrors(data.errors)
                };
            });
    }
    //style modal from here
    return (
        <div className='login-form'>
            <div className='top-div-login-form'>
                <div className='Login-title'>Log in</div>
                <div className='Signup-title'>Not a member yet? <Link className='signup-link' onClick={navigateToSignUpForm}>Sign up</Link> </div>
            </div>
            <form className='login-field' onSubmit={handleSubmit}>
                <ul>
                    {errors.map((error, idx) => <li key={idx}>{error}</li>)}
                </ul>
                <label className='label-login-form'>
                    Username or Email  </label>
                <input
                    className='input-box-form'
                    type="text"
                    value={credential}
                    onChange={(e) => setCredential(e.target.value)}
                    required
                />

                <label className='label-login-form'>Password</label>

                <input
                    className='input-box-form'
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                <div className='login-button-container'>
                    <button className='button-login-form' type="submit">Log In</button>
                </div>
            </form>
        </div >
    );
}

export default LoginForm;
