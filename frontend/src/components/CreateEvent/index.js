import React, { useState, useEffect } from 'react';
import * as sessionActions from '../../store/session';
import { useDispatch, useSelector } from 'react-redux';
import { Redirect, useHistory } from 'react-router-dom';
import { Link, NavLink } from 'react-router-dom';
import './CreateEvent.css';
import { createEventThunk } from '../../store/event';
import { useParams } from 'react-router-dom';

function CreateEventForm() {
    const history = useHistory();
    const { groupId } = useParams();
    const dispatch = useDispatch();
    const group = useSelector((state) => state.groups[groupId]);
    const sessionUser = useSelector(state => state.session.user);
    const [venueId, setVenueId] = useState("");
    const [venueAddress, setVenueAddress] = useState('');
    const [name, setName] = useState('');
    const [type, setType] = useState('In person');
    const [capacity, setCapacity] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState('');
    const [price, setPrice] = useState('');
    const [endDate, setEndDate] = useState('');
    const [errors, setErrors] = useState([]);
    const [venue, setVenue] = useState('');
    const [submitted, setSubmitted] = useState(false);
    // const thisVenueId = group.Venues[0].id;
    // const thisVenueAd = group.Venues[0].address;
    useEffect(() => {
        let venueId;
        let venueAddress;
        async function getVenues() {
            const venues = await fetch(`/api/venues`)
            const data = await venues.json();
            console.log(data, 'this is data');
            venueId = data.Venues[0].id;
            venueAddress = data.Venues[0].address;
            console.log(data.Venues, 'this is Venues Array');
            console.log(data.Venues[0].id, data.Venues[0].address);
            setVenue(data.Venues);
        }
        getVenues();
    }, [dispatch, venueId, venueAddress]);


    console.log(venue, 'THIS IS VENUE --------');

    if (!sessionUser) {
        return (
            <>
                <h1> Please log in or sign up to create an event </h1></>
        )
    }
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
        console.log(venueId, 'handle submit venueId --------');
        const thisNewEventPayload = {
            venueId: parseInt(venueId),
            groupId: parseInt(groupId),
            name,
            type,
            capacity,
            price,
            description,
            startDate: newStartDate,
            endDate: newEndDate
        }
        return dispatch(createEventThunk(thisNewEventPayload))
            .then(() => {
                history.push(`/events`);
            })
            .catch(async (res) => {
                const data = await res.json();
                console.log(data, 'THIS IS DATA');
                if (data && data.errors) {
                    setErrors(data.errors);
                }
            })
    }
     if (!venue) return null;
    return (
        <>
            <form onSubmit={handleSubmit}>
                <ul>
                    {errors.map((error, idx) => <li key={idx}>{error}</li>)}
                </ul>
                <div>
                    <label>Name</label>
                    <input
                        placeholder='Your event name'
                        type='text'
                        value={name}
                        onChange={e => setName(e.target.value)}
                        required
                    />
                    <label>Description</label>
                    <input
                        placeholder='Tell us more about your event'
                        type='text'
                        value={description}
                        onChange={e => setDescription(e.target.value)}
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
                    <label>Capacity</label>
                    <input
                        placeholder='Maximum capacity'
                        type='text'
                        value={capacity}
                        onChange={e => setCapacity(e.target.value)}
                        required
                    />
                    <label>Price</label>
                    <input
                        placeholder='Attending fee (if any)'
                        type='number'
                        value={price}
                        onChange={e => setPrice(e.target.value)}
                        required
                    >
                    </input>

                    <input
                        placeholder='Event start date'
                        type='datetime-local'
                        value={startDate}
                        onChange={e => setStartDate(e.target.value)}
                    >
                    </input>
                    <input
                        placeholder='Event end date'
                        type='datetime-local'
                        value={endDate}
                        onChange={e => setEndDate(e.target.value)}
                    >
                    </input>
                    <label>Venue</label>
                    <select
                        value={venueId}
                        onChange={e => {setVenueId(e.target.value);
                        console.log(e.target.value)}}
                        required
                    >
                        {venue.map((v) => {
                            return <option value={v.id}>{v.address}</option>
                        })}
                    </select>
                </div>
                <button type='submit'>
                    Create Event
                </button>
            </form>
        </>
    )
}
export default CreateEventForm;
