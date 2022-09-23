import React, { useState, useEffect } from 'react';
import * as sessionActions from '../../store/session';
import { useDispatch, useSelector } from 'react-redux';
import { Redirect, useHistory, useParams } from 'react-router-dom';
import { Link, NavLink } from 'react-router-dom';
import './EditEvent.css';
import { editEventThunk } from '../../store/event';
import { fetchOneEvent } from '../../store/event';

export default function EditEventForm() {
    const { eventId } = useParams();
    const event = useSelector(state => state.events[eventId]);
    const sessionUser = useSelector((state) => state.session.user);
    const history = useHistory();
    const dispatch = useDispatch();

    const [venueId, setVenue] = useState(1);
    const [name, setName] = useState(event && event.name);
    const [type, setType] = useState(event && event.type);
    const [capacity, setCapacity] = useState(event && event.capacity);
    const [description, setDescription] = useState(event && event.description);
    const [startDate, setStartDate] = useState(event && event.startDate);
    const [price, setPrice] = useState(event && event.price);
    const [endDate, setEndDate] = useState(event && event.endDate);
    const [groupId, setGroupId] = useState(event && event.groupId);
    const [errors, setErrors] = useState([]);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        dispatch(fetchOneEvent(eventId))
    }, [dispatch, eventId]);

    function dateConverter(date) {
        let dateArray = date.split('T');
        let clock = dateArray[1];
        dateArray[1] = clock + ':00'
        let newDate = dateArray.join(' ');
        return newDate;
    }
    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors([]);
        setSubmitted(true);
        const newStartDate = dateConverter(startDate);
        const newEndDate = dateConverter(endDate);
        const thisPayload = {
            venueId: 1,
            groupId: groupId,
            name,
            type,
            capacity,
            price,
            description,
            startDate: newStartDate,
            endDate: newEndDate
        }
        return dispatch(editEventThunk(thisPayload))
            .then(() => {
                history.push(`/events/${event.id}`);
            })
            .catch(async (res) => {
                const data = await res.json();
                if (data && data.errors) {
                    setErrors(data.errors);
                }
            })
    }
    if (!event) return null;
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
                    <label>Description</label>
                    <input
                        type='text'
                        value={description}
                        onChange={e => setDescription(e.target.value)}
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
                    <label>Capacity</label>
                    <input
                        type='text'
                        value={capacity}
                        onChange={e => setCapacity(e.target.value)}
                        required
                    />
                    <label>Price</label>
                    <input
                        type='number'
                        value={price}
                        onChange={e => setPrice(e.target.value)}
                        required
                    >
                    </input>
                    <label>Venue Id</label>
                    <input
                        type='text'
                        value={venueId}
                        onChange={e => setVenue(1)}
                    >
                    </input>
                    <input
                        type='datetime-local'
                        value={startDate}
                        onChange={e => setStartDate(e.target.value)}
                    >
                    </input>
                    <input
                        type='datetime-local'
                        value={endDate}
                        onChange={e => setEndDate(e.target.value)}
                    >
                    </input>
                </div>
                <button type='submit'>
                    Submit
                </button>
            </form>
        </>
    )
}
