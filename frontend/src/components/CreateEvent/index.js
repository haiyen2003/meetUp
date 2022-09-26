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
    const [previewImage, setPreviewImage] = useState('');
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
            endDate: newEndDate,
            previewImage: previewImage
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
            <div className='form'>
                <div className='title-div'>
                    <div className='top-title'>Create an event</div>
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
                                placeholder='Your event name'
                                type='text'
                                value={name}
                                onChange={e => setName(e.target.value)}
                                required
                            />
                        </div>
                        <div className='field'>
                            <label className='label'>Description</label>
                            <input
                                className='input-box'
                                placeholder='Tell us more about your event'
                                type='text'
                                value={description}
                                onChange={e => setDescription(e.target.value)}
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
                            <label className='label'>Capacity</label>
                            <input
                                className='input-box'
                                placeholder='Maximum capacity'
                                type='text'
                                value={capacity}
                                onChange={e => setCapacity(e.target.value)}
                                required
                            />
                        </div>
                        <div className='field'>
                            <label className='label'>Price</label>
                            <input
                                className='input-box'
                                placeholder='Attending fee (if any)'
                                type='number'
                                value={price}
                                onChange={e => setPrice(e.target.value)}
                                required
                            >
                            </input>
                        </div>
                        <div className='field'>
                            <label className='label'>Start Date</label>
                            <input
                                className='input-box'
                                placeholder='Event start date'
                                type='datetime-local'
                                value={startDate}
                                onChange={e => setStartDate(e.target.value)}
                            >
                            </input>
                        </div>
                        <div className='field'>
                            <label className='label'>End Date</label>
                            <input
                                className='input-box'
                                placeholder='Event end date'
                                type='datetime-local'
                                value={endDate}
                                onChange={e => setEndDate(e.target.value)}
                            >
                            </input>
                        </div>
                        <div className='field'>
                            <label className='label'>Venue</label>
                            <select
                                className='dropdown-option'
                                value={venueId}
                                onChange={e => {
                                    setVenueId(e.target.value);
                                    console.log(e.target.value)
                                }}
                                required
                            >
                                {venue.map((v) => {
                                    return <option value={v.id}>{v.address}</option>
                                })}
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
                        Create Event
                    </button>
                </form>
            </div>
        </>
    )
}
export default CreateEventForm;
