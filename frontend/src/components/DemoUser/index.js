import React, { useState } from 'react';
import * as sessionActions from '../../store/session';
import { useDispatch, useSelector } from 'react-redux';
import { Redirect } from 'react-router-dom';


export default function LoginDemoUser() {
    const dispatch = useDispatch();

    const handleSubmit = (e) => {
        e.preventDefault();
        const credential = 'Demo-lition';
        const password = 'password';
        return dispatch(sessionActions.login({ credential, password }))
    }
    return (
        <form onSubmit={handleSubmit}>
            <button type='submit'>Demo User</button>
        </form>
    )
}
