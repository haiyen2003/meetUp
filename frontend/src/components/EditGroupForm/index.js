// frontend/src/components/EditGroup/index.js
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
//import group from '../../../../backend/db/models/group';
import { editGroupThunk } from '../../store/group';
import { fetchOneGroup } from '../../store/group';
import { useParams } from 'react-router-dom';
//extract params to find groupId - normalize data in Redux;

export default function EditGroupForm() {
    const { groupId } = useParams();
    const group = useSelector((state) => state.groups[groupId]);
    //console.log('THIS IS GROUP CITY', group.city);
    // console.log(group[groupId], 'THIS IS GROUP');
    const sessionUser = useSelector((state) => state.session.user);

    const history = useHistory();
    const dispatch = useDispatch();
    const [name, setName] = useState(group && group.name);
    const [about, setAbout] = useState(group && group.about);
    const [type, setType] = useState(group && group.type);
    const [city, setCity] = useState(group && group.city);
    const [state, setState] = useState(group && group.state);
    const [isPrivate, setPrivate] = useState(group && group.private);
    const [errors, setErrors] = useState([]);
    const [submitted, setSubmitted] = useState(false);

    //this help get the data from the previous group (before editing);
    useEffect(() => {
        dispatch(fetchOneGroup(groupId))
    }, [dispatch, groupId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors([]);
        setSubmitted(true);
        const thisEditGroupPayload = {
            name: name,
            about: about,
            type: type,
            private: isPrivate,
            city: city,
            state: state
        };
        // const thisEditGroup = await dispatch(editGroupThunk(groupId, thisEditGroupPayload));
        // console.log(thisEditGroup, 'THIS EDIT GROUP');
        // //const thisGroup = await dispatch(fetchOneGroup(groupId));
        // history.push(`/groups/${groupId}`);
        return dispatch(editGroupThunk(groupId, thisEditGroupPayload))
            .then(() => {
                history.push(`/groups/${groupId}`);
            })
            .catch(async (res) => {
                const data = await res.json();
                if (data && data.errors) {
                    setErrors(data.errors);
                }
            })
    }

    if (!group) return null;
    return (
        <>
            <form onSubmit={handleSubmit}>
                <ul>
                    {errors.map((error, idx) => <li key={idx}>{error}</li>)}
                </ul>
                <div>
                    <label>Name</label>
                    <input
                        type='text'
                        value={name}
                        onChange={e => setName(e.target.value)}
                        required
                    />
                    <label>About</label>
                    <input
                        type='text'
                        value={about}
                        onChange={e => setAbout(e.target.value)}
                        required
                    />
                    <label>Type</label>
                    <select
                        value={type}
                        onChange={e => setType(e.target.value)}
                        required
                    >
                        <option value={'In person'}>In person</option>
                        <option value={'Online'}>Online</option>
                    </select>
                    <label>City</label>
                    <input
                        type='text'
                        value={city}
                        onChange={e => setCity(e.target.value)}
                        required
                    />
                    <label>State</label>
                    <input
                        type='text'
                        value={state}
                        onChange={e => setState(e.target.value)}
                        required
                    >
                    </input>
                    <label>Group Privacy</label>
                    <select
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
