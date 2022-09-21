
// frontend/src/components/EditGroup/index.js
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { editGroupThunk } from '../../store/group';
import { fetchOneGroup } from '../../store/group';

export default function EditGroupForm(group) {
    const history = useHistory();
    const dispatch = useDispatch();
    const sessionUser = useSelector((state) => state.session.user);
    const id = group.id
    const [name, setName] = useState(group.name);
    const [about, setAbout] = useState(group.about);
    const [type, setType] = useState(group.type);
    const [city, setCity] = useState(group.city);
    const [state, setState] = useState(group.state);
    const [isPrivate, setPrivate] = useState(group.private);
    const [errors, setErrors] = useState([]);
    const [submitted, setSubmitted] = useState(false);


    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors([]);
        setSubmitted(true);

        const thisEditGroupPayload = {
            id,
            name: name,
            about: about,
            organizerId: sessionUser.id,
            type: type,
            isPrivate,
            city: city,
            state: state
        };
        const thisEditGroup = await dispatch(editGroupThunk(thisEditGroupPayload));
        const thisGroup = await dispatch(fetchOneGroup(thisEditGroup.id));
        history.push(`/group/${thisGroup.id}`);
    }

    if (!group) return null;
    return (
        <>
            <form onSubmit={handleSubmit}>

                <ul>
                    {//submitted && errors.length > 0 &&
                        errors.map((error, i) => {
                            <li key={i}>{error}</li>
                        })
                    }
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
                    Submit
                </button>
            </form>
        </>
    )
}
