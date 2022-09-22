import React, { useState, useEffect } from 'react';
import * as sessionActions from '../../store/session';
import { useDispatch, useSelector } from 'react-redux';
import { Redirect, useHistory } from 'react-router-dom';
import { Link, NavLink } from 'react-router-dom';
import './CreateGroup.css';
import { createGroupThunk } from '../../store/group';
import * as GroupActions from '../../store/group';

function CreateGroupForm() {
    const history = useHistory();
    const dispatch = useDispatch();
    const sessionUser = useSelector((state) => state.session.user)
    const [name, setName] = useState('');
    const [about, setAbout] = useState('');
    const [type, setType] = useState('In person');
    const [city, setCity] = useState('');
    const [state, setState] = useState('CA');
    const [isPrivate, setPrivate] = useState(false);
    const [errors, setErrors] = useState([]);
    const [submitted, setSubmitted] = useState(false);
    if (!sessionUser) {
        return (
            <>
                <h1> Please log in or sign up to create a group</h1>
            </>
        )
    }

    let newGroup = {}
    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors([]);
        setSubmitted(true);

        const thisNewGroupPayload = {
            name: name,
            about: about,
            type: type,
            isPrivate,
            city: city,
            state: state
        };
        return dispatch(createGroupThunk(thisNewGroupPayload))
            .then(() => {
                history.push(`/groups/`);
            })
            .catch(async (res) => {
                const data = await res.json();
                if (data && data.errors) {
                    setErrors(data.errors);
                }
            })
    }

    return (
        <>
            <form onSubmit={handleSubmit}>
                <ul>
                    {errors.map((error, idx) => <li key={idx}>{error}</li>)}
                </ul>

                <div>
                    <label>Name</label>
                    <input
                        placeholder='Your group name'
                        type='text'
                        value={name}
                        onChange={e => setName(e.target.value)}
                        required
                    />
                    <label>About</label>
                    <input
                        placeholder='Tell us more about your group'
                        type='text'
                        value={about}
                        onChange={e => setAbout(e.target.value)}
                        required
                    />
                    <label>Type</label>
                    <select
                        placeholder='Online or In person'
                        value={type}
                        onChange={e => setType(e.target.value)}
                        required
                    >
                        <option value={'In person'}>In person</option>
                        <option value={'Online'}>Online</option>
                    </select>
                    <label>City</label>
                    <input
                        placeholder='City'
                        type='text'
                        value={city}
                        onChange={e => setCity(e.target.value)}
                        required
                    />
                    <label>State</label>
                    <input
                        placeholder='State'
                        type='text'
                        value={state}
                        onChange={e => setState(e.target.value)}
                        required
                    >
                    </input>
                    <label>Group Privacy</label>
                    <select
                        placeholder='Tell us more about your group'
                        type='text'
                        value={isPrivate}
                        onChange={e => setPrivate(e.target.value)}
                        required
                    >
                        <option value={true}>Private</option>
                        <option value={false}>Public</option>
                    </select>
                </div>
                <button type='submit'>
                    Create Group
                </button>
            </form>

        </>
    )
}

export default CreateGroupForm;
