import React, { useState, useEffect } from 'react';
import * as sessionActions from '../../store/session';
import { useDispatch, useSelector } from 'react-redux';
import { Link, NavLink } from 'react-router-dom';
import './Events.css';
import { fetchEvents } from '../../store/event';
import EventDetails from '../EventDetails';

function Events() {
    const dispatch = useDispatch();
    const data = useSelector((state) => state.events)
    let events;

    if (data) {
        events = Object.values(data);
    }
    useEffect(() => {
        dispatch(fetchEvents())
    }, [dispatch])

    if (!data) return null;
    return (
        <>
            <div>
                {events.map((event) => (
                    <div>
                        <NavLink to={`/events/${event.id}`}>{event.name}</NavLink>
                        <div>{event.description}</div>
                        <div>Capacity: {event.capacity}</div>
                        <div>Type: {event.type}</div>
                        <div>Price: {event.price}</div>
                        <div>VenueId: {event.venueId}</div>
                        <div>Start Date: {event.startDate}</div>
                        <div>End Date: {event.endDate}</div>
                        <br />
                    </div>
                ))}
            </div>
        </>
    )
}
export default Events;
