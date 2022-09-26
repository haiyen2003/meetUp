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
    const [previewImage, setPreviewImage] = useState('');
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
            state: state,
            previewImage: previewImage
        };
        console.log(thisNewGroupPayload, 'this new payload ------');
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
            <div className='form'>
                <div className='title-div'>
                    <div className='top-title'>Create a group</div>
                </div>
                <form onSubmit={handleSubmit}>
                    <ul>
                        {errors.map((error, idx) => <li key={idx}>{error}</li>)}
                    </ul>
                    <div className='top-field'>
                        <div className='field'>
                            <label className='label'>Name</label>
                            <input
                                className='input-box'
                                placeholder='Your group name'
                                type='text'
                                value={name}
                                onChange={e => setName(e.target.value)}
                                required
                            />
                        </div>
                        <div className='field'>
                            <label className='label'>About</label>
                            <input
                                className='input-box'
                                placeholder='Tell us more about your group'
                                type='text'
                                value={about}
                                onChange={e => setAbout(e.target.value)}
                                required
                            />
                        </div>
                        <div className='field'>
                            <label className='label'>Type</label>
                            <select
                                className='dropdown-option'
                                placeholder='Online or In person'
                                value={type}
                                onChange={e => setType(e.target.value)}
                                required
                            >
                                <option className='dropdown-option' value={'In person'}>In person</option>
                                <option className='dropdown-option' value={'Online'}>Online</option>
                            </select>
                        </div>

                        <div className='field'>
                            <label className='label'>City</label>
                            <input
                                className='input-box'
                                placeholder='City'
                                type='text'
                                value={city}
                                onChange={e => setCity(e.target.value)}
                                required
                            />
                        </div>
                        <div className='field'>
                            <label className='label'>State</label>
                            <input
                                className='input-box'
                                placeholder='State'
                                type='text'
                                value={state}
                                onChange={e => setState(e.target.value)}
                                required
                            >
                            </input>
                        </div>
                        <div className='field'>
                            <label className='label'>Group Privacy</label>
                            <select
                                className='dropdown-option'
                                placeholder='Tell us more about your group'
                                type='text'
                                value={isPrivate}
                                onChange={e => setPrivate(e.target.value)}
                                required
                            >
                                <option className='dropdown-option' value={true}>Private</option>
                                <option className='dropdown-option' value={false}>Public</option>
                            </select>
                        </div>
                        <div className='field'>
                            <label className='label'> {`Group Image URL (optional)`}</label>
                            <input
                                className='input-box'
                                placeholder='State'
                                type='text'
                                value={previewImage}
                                onChange={e => setPreviewImage(e.target.value)}
                            >
                            </input>
                        </div>
                    </div>
                    <button className='edit-group-button' type='submit'>
                        Create Group
                    </button>
                </form>
            </div >
        </>
    )
}

export default CreateGroupForm;
