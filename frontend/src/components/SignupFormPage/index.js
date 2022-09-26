// frontend/src/components/SignupFormPage/index.js
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Redirect } from "react-router-dom";
import * as sessionActions from "../../store/session";
import './SignupForm.css';
import { NavLink } from "react-router-dom";

function SignupFormPage() {
    const dispatch = useDispatch();
    const sessionUser = useSelector((state) => state.session.user);
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstname] = useState("");
    const [lastName, setLastname] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errors, setErrors] = useState([]);
    if (sessionUser) return <Redirect to="/" />;
    const handleSubmit = (e) => {
        e.preventDefault();
        if (password === confirmPassword) {
            setErrors([]);
            return dispatch(sessionActions.signup({ email, username, password, firstName, lastName }))
                .catch(async (res) => {
                    const data = await res.json();
                    if (data && data.errors) {
                        setErrors(data.errors);
                    }
                });
        }
        return setErrors(['Confirm Password field must be the same as the Password field']);
    };

    return (
        <>
            <div className='form'>
                <div className='title-div'>
                    <div className='Login-title'>Sign up</div>
                    {/* <div className='Signup-title'>Already a member? <NavLink className='signup-link' to="/login">Log in</NavLink> </div> */}
                </div>
                <form onSubmit={handleSubmit}>
                    <ul>
                        {errors.map((error, idx) => <li key={idx}>{error}</li>)}
                    </ul>
                    <div className='top-field'>
                        <div className='field'>
                            <label className='label'>
                                First Name  </label>
                            <input
                                className='input-box'
                                type="text"
                                value={firstName}
                                onChange={(e) => setFirstname(e.target.value)}
                                required
                            />
                        </div>
                        <div className='field'>
                            <label className='label'>
                                Last Name  </label>
                            <input
                                className='input-box'
                                type="text"
                                value={lastName}
                                onChange={(e) => setLastname(e.target.value)}
                                required
                            />
                        </div>
                        <div className='field'>
                            <label className='label'>
                                Email </label>
                            <input
                                className='input-box'
                                type="text"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className='field'>
                            <label className='label'> </label>
                            Username
                            <input
                                className='input-box'
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                        <div className='field'>
                            <label className='label'>
                                Password </label>
                            <input
                                className='input-box'
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className='field'>
                            <label className='label'>
                                Confirm Password </label>
                            <input
                                className='input-box'
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />

                        </div>
                    </div>
                    <button className='button-signup-form' type="submit">Sign Up</button>
                </form>
            </div >
        </>
    );
}

export default SignupFormPage;
